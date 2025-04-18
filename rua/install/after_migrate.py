import frappe
from frappe.utils import flt

# Define the tolerance margin for considering an invoice as paid.
# Adjust this value as needed (e.g., 0.50 for 50 cents, 1.00 for 1 unit).
PAYMENT_TOLERANCE = 3.00 # Allow up to 3.00 AED difference

def after_migrate():
    projects = frappe.get_all("RUA Project", fields=["name", "total_received", "contract_value"], filters={"contract_value": (">", 0)})

    if not projects:
        frappe.log("No projects to reconcile.")
        return

    # First perform reconciliation for all projects
    try:
        reconcile_all_financials_sql()
        frappe.db.commit()
        frappe.log(f"Financial reconciliation completed for all projects using tolerance {PAYMENT_TOLERANCE}.")
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(
            message=f"Error during comprehensive financial reconciliation: {str(e)}",
            title="Post Install Reconciliation Error"
        )
        raise

    # Then update completion percentages with reconciled values
    # Fetch projects again to get updated values after reconciliation
    projects = frappe.get_all("RUA Project", fields=["name", "total_received", "contract_value"], filters={"contract_value": (">", 0)})
    for project in projects:
        project_name = project.get("name")
        total_received = project.get("total_received") or 0
        contract_value = project.get("contract_value")

        if contract_value and contract_value > 0:
            try:
                completion = (total_received / contract_value) * 100
                frappe.db.set_value("RUA Project", project_name, "completion", completion, update_modified=False)
            except Exception as e:
                frappe.log_error(f"Error calculating completion for project {project_name}: {e}")
                frappe.db.rollback()
                raise
        else:
            frappe.log_warning(f"Contract value is missing or zero for project {project_name}. Skipping completion calculation.")

    frappe.db.commit()
    frappe.log("Project completion percentages updated with reconciled values.")

def reconcile_all_financials_sql():
    """Reconcile project financials and payment statuses using direct SQL queries"""
    # 1. Reconcile Project Financials (No changes needed here for tolerance)
    project_reconciliation_sql = """
    UPDATE `tabRUA Project` p
    SET
        total_invoiced = COALESCE((
            SELECT COALESCE(SUM(grand_total), 0)
            FROM `tabRUA Invoice` i
            WHERE i.project = p.name
            AND i.status = 'Final'
            AND i.type = 'Tax Invoice'
        ), 0),
        project_cost = COALESCE((
            SELECT COALESCE(SUM(amount), 0)
            FROM `tabRUA Payment` pay
            WHERE pay.project = p.name
            AND pay.status = 'Submitted'
            AND pay.type = 'Pay'
        ), 0),
        additional_expenses = COALESCE((
            SELECT COALESCE(SUM(amount), 0)
            FROM `tabRUA Payment` pay
            WHERE pay.project = p.name
            AND pay.status = 'Submitted'
            AND pay.type = 'Pay: Petty Cash'
        ), 0),
        total_received = COALESCE((
            SELECT COALESCE(SUM(amount), 0)
            FROM `tabRUA Payment` pay
            WHERE pay.project = p.name
            AND pay.status = 'Submitted'
            AND pay.type = 'Receive'
        ), 0),
        modified = modified  # Prevent modified timestamp update
    """
    frappe.db.sql(project_reconciliation_sql)

    # 2. Reconcile Invoice Payment Statuses (Applying tolerance)
    # The key change is in the first WHEN condition for 'Paid' status.
    invoice_payment_reconciliation_sql = """
    UPDATE `tabRUA Invoice` inv
    SET
        payment_status = CASE
            WHEN COALESCE((
                SELECT SUM(amount)
                FROM `tabRUA Payment` pay
                WHERE pay.related_doctype = 'RUA Invoice'
                AND pay.related_docname = inv.name
                AND pay.status = 'Submitted'
            ), 0) >= (inv.grand_total - %s) THEN 'Paid' -- MODIFIED: Check against grand_total minus tolerance
            WHEN COALESCE((
                SELECT SUM(amount)
                FROM `tabRUA Payment` pay
                WHERE pay.related_doctype = 'RUA Invoice'
                AND pay.related_docname = inv.name
                AND pay.status = 'Submitted'
            ), 0) > 0 THEN 'Partially Paid'
            ELSE 'Unpaid'
        END,
        payment_linked = CASE
            WHEN COALESCE((
                SELECT SUM(amount)
                FROM `tabRUA Payment` pay
                WHERE pay.related_doctype = 'RUA Invoice'
                AND pay.related_docname = inv.name
                AND pay.status = 'Submitted'
            ), 0) > 0 THEN 1
            ELSE 0
        END,
        modified = modified  # Prevent modified timestamp update
    """
    # Pass the tolerance value as a parameter to the SQL query
    frappe.db.sql(invoice_payment_reconciliation_sql, (PAYMENT_TOLERANCE,))

    # Optional: Log additional details about the reconciliation
    log_reconciliation_summary()

def log_reconciliation_summary():
    """Log summary of reconciliation results"""
    # Get counts of various financial records
    summary_queries = [
        ("Total Projects", "SELECT COUNT(*) FROM `tabRUA Project`"),
        ("Total Invoices", "SELECT COUNT(*) FROM `tabRUA Invoice`"),
        ("Total Payments", "SELECT COUNT(*) FROM `tabRUA Payment`"),
        ("Paid Invoices", "SELECT COUNT(*) FROM `tabRUA Invoice` WHERE payment_status = 'Paid'"),
        ("Partially Paid Invoices", "SELECT COUNT(*) FROM `tabRUA Invoice` WHERE payment_status = 'Partially Paid'"),
        ("Unpaid Invoices", "SELECT COUNT(*) FROM `tabRUA Invoice` WHERE payment_status = 'Unpaid'") # Added for completeness
    ]

    summary_lines = []
    for label, query in summary_queries:
        result = frappe.db.sql(query)[0][0]
        summary_lines.append(f"{label}: {result}")

    frappe.log_error(
        message="Reconciliation Summary:\n" + "\n".join(summary_lines),
        title="Financial Reconciliation Summary"
    )

def get_payment_reconciliation_status(related_doctype, related_docname):
    """
    Retrieve payment status for a given document, considering tolerance.
    Can be used in transaction methods to get current payment status.
    """
    # Retrieve the grand_total for the specific document first
    grand_total = frappe.db.get_value(related_doctype, related_docname, "grand_total")
    if grand_total is None:
        frappe.log_error(f"Could not find {related_doctype} {related_docname} to get grand_total.")
        # Return a default or handle error appropriately
        return {"payment_status": "Error", "payment_linked": 0}

    # Calculate the threshold for being considered 'Paid'
    paid_threshold = flt(grand_total) - flt(PAYMENT_TOLERANCE)

    # Query to get the total paid amount
    total_paid_query = """
        SELECT COALESCE(SUM(amount), 0) as total_paid
        FROM `tabRUA Payment`
        WHERE related_doctype = %s
        AND related_docname = %s
        AND status = 'Submitted'
    """
    result = frappe.db.sql(total_paid_query, (related_doctype, related_docname), as_dict=True)
    total_paid = flt(result[0].get("total_paid")) if result else 0

    # Determine status based on total paid and threshold
    payment_status = 'Unpaid'
    payment_linked = 0
    if total_paid >= paid_threshold:
        payment_status = 'Paid'
        payment_linked = 1 # Paid means at least some payment linked
    elif total_paid > 0:
        payment_status = 'Partially Paid'
        payment_linked = 1

    return {"payment_status": payment_status, "payment_linked": payment_linked}


def reconcile_single_project_financials(project_name):
    """
    Reconcile financials for a specific project using direct SQL queries,
    including payment tolerance for invoices.

    Args:
        project_name (str): Name of the project to reconcile
    """
    try:
        # 1. Reconcile Project Financial Metrics (No tolerance needed here)
        project_reconciliation_sql = """
        UPDATE `tabRUA Project` p
        SET
            total_invoiced = COALESCE((
                SELECT COALESCE(SUM(grand_total), 0)
                FROM `tabRUA Invoice` i
                WHERE i.project = %s
                AND i.status = 'Final'
                AND i.type = 'Tax Invoice'
            ), 0),
            project_cost = COALESCE((
                SELECT COALESCE(SUM(amount), 0)
                FROM `tabRUA Payment` pay
                WHERE pay.project = %s
                AND pay.status = 'Submitted'
                AND pay.type = 'Pay'
            ), 0),
            additional_expenses = COALESCE((
                SELECT COALESCE(SUM(amount), 0)
                FROM `tabRUA Payment` pay
                WHERE pay.project = %s
                AND pay.status = 'Submitted'
                AND pay.type = 'Pay: Petty Cash'
            ), 0),
            total_received = COALESCE((
                SELECT COALESCE(SUM(amount), 0)
                FROM `tabRUA Payment` pay
                WHERE pay.project = %s
                AND pay.status = 'Submitted'
                AND pay.type = 'Receive'
            ), 0),
            modified = modified  # Prevent modified timestamp update
        WHERE p.name = %s
        """
        frappe.db.sql(project_reconciliation_sql, (project_name, project_name, project_name, project_name, project_name))

        # 2. Reconcile Invoice Payment Statuses for this Project (Applying tolerance)
        # The key change is in the first WHEN condition for 'Paid' status.
        invoice_payment_reconciliation_sql = """
        UPDATE `tabRUA Invoice` inv
        SET
            payment_status = CASE
                WHEN COALESCE((
                    SELECT SUM(amount)
                    FROM `tabRUA Payment` pay
                    WHERE pay.related_doctype = 'RUA Invoice'
                    AND pay.related_docname = inv.name
                    AND pay.status = 'Submitted'
                ), 0) >= (inv.grand_total - %s) THEN 'Paid' -- MODIFIED: Check against grand_total minus tolerance
                WHEN COALESCE((
                    SELECT SUM(amount)
                    FROM `tabRUA Payment` pay
                    WHERE pay.related_doctype = 'RUA Invoice'
                    AND pay.related_docname = inv.name
                    AND pay.status = 'Submitted'
                ), 0) > 0 THEN 'Partially Paid'
                ELSE 'Unpaid'
            END,
            payment_linked = CASE
                WHEN COALESCE((
                    SELECT SUM(amount)
                    FROM `tabRUA Payment` pay
                    WHERE pay.related_doctype = 'RUA Invoice'
                    AND pay.related_docname = inv.name
                    AND pay.status = 'Submitted'
                ), 0) > 0 THEN 1
                ELSE 0
            END,
            modified = modified  # Prevent modified timestamp update
        WHERE inv.project = %s -- Filter by project
        """
        # Pass the tolerance value *first*, then the project name for the WHERE clause
        frappe.db.sql(invoice_payment_reconciliation_sql, (PAYMENT_TOLERANCE, project_name))

        # Optional: Log reconciliation details
        log_single_project_reconciliation(project_name)

        # --- BEGIN: Calculate and Update Project Completion ---
        # Fetch the necessary fields AFTER the above update
        project_data = frappe.db.get_value(
            "RUA Project",
            project_name,
            ["total_received", "contract_value"],
            as_dict=True
        )

        if project_data:
            total_received = flt(project_data.get("total_received"))
            contract_value = flt(project_data.get("contract_value"))

            completion = 0.0 # Default completion
            if contract_value > 0:
                completion = (total_received / contract_value) * 100

            # Update the completion field for the project
            frappe.db.set_value(
                "RUA Project",
                project_name,
                "completion",
                completion,
                update_modified=False # Keep consistency
            )

        # --- END: Calculate and Update Project Completion ---

        return True
    except Exception as e:
        frappe.log_error(
            message=f"Error reconciling project {project_name}: {str(e)}",
            title="Single Project Reconciliation Error"
        )
        return False

def log_single_project_reconciliation(project_name):
    """Log details about a single project's reconciliation"""
    summary_queries = [
        ("Total Invoices", """
            SELECT COUNT(*)
            FROM `tabRUA Invoice`
            WHERE project = %s
        """),
        ("Paid Invoices", """
            SELECT COUNT(*)
            FROM `tabRUA Invoice`
            WHERE project = %s
            AND payment_status = 'Paid'
        """),
        ("Partially Paid Invoices", """
            SELECT COUNT(*)
            FROM `tabRUA Invoice`
            WHERE project = %s
            AND payment_status = 'Partially Paid'
        """),
         ("Unpaid Invoices", """
            SELECT COUNT(*)
            FROM `tabRUA Invoice`
            WHERE project = %s
            AND payment_status = 'Unpaid'
        """), # Added for completeness
        ("Total Payments", """
            SELECT COUNT(*)
            FROM `tabRUA Payment`
            WHERE project = %s
        """)
    ]

    summary_lines = []
    for label, query in summary_queries:
        result = frappe.db.sql(query, (project_name,))[0][0]
        summary_lines.append(f"{label}: {result}")

    frappe.log_error(
        message=f"Reconciliation Summary for Project {project_name}:\n" + "\n".join(summary_lines),
        title=f"Project {project_name} Reconciliation Summary"
    )

def execute():
    """Entry point for bench execute"""
    after_migrate()