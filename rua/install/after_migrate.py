import frappe
from frappe.utils import flt

# Define the tolerance margin for considering an invoice as paid.
PAYMENT_TOLERANCE = 3.00  # Allow up to 3.00 AED difference


def after_migrate():
    """Runs after migration: Reconciles all projects and updates completion."""
    projects = frappe.get_all(
        "RUA Project",
        fields=["name", "total_received", "contract_value"],
        filters={"contract_value": (">", 0)},
    )

    if not projects:
        frappe.log("No projects to reconcile.")
        return

    # First perform reconciliation for all projects
    try:
        reconcile_all_financials_sql()
        frappe.db.commit()
        frappe.log(
            f"Financial reconciliation completed for all projects using tolerance {PAYMENT_TOLERANCE}."
        )
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(
            message=f"Error during comprehensive financial reconciliation: {str(e)}",
            title="Post Install Reconciliation Error",
        )
        raise  # Re-raise the exception to halt migration if reconciliation fails

    # Then update completion percentages with reconciled values
    # Fetch projects again to get updated values after reconciliation
    projects = frappe.get_all(
        "RUA Project",
        fields=["name", "total_received", "contract_value"],
        filters={"contract_value": (">", 0)},
    )
    for project in projects:
        project_name = project.get("name")
        total_received = project.get("total_received") or 0
        contract_value = project.get("contract_value")

        if contract_value and contract_value > 0:
            try:
                completion = (flt(total_received) / flt(contract_value)) * 100
                # Ensure completion doesn't exceed 100 due to potential overpayment/tolerance
                completion = min(completion, 100.0)
                frappe.db.set_value(
                    "RUA Project",
                    project_name,
                    "completion",
                    completion,
                    update_modified=False,
                )
            except Exception as e:
                frappe.log_error(
                    f"Error calculating completion for project {project_name}: {e}"
                )
                # Decide if this error should stop the process or just log
        else:
            frappe.log_warning(
                f"Contract value is missing or zero for project {project_name}. Skipping completion calculation."
            )

    frappe.db.commit()
    frappe.log("Project completion percentages updated with reconciled values.")


def reconcile_all_financials_sql():
    """Reconcile project financials and payment statuses for ALL projects using direct SQL."""
    # 1. Reconcile Project Financials
    # MODIFIED: project_cost now ONLY includes Final LPO Costs. 'Pay' type Payments are excluded from this field.
    project_reconciliation_sql = """
    UPDATE `tabRUA Project` p
    SET
        total_invoiced = COALESCE((
            SELECT COALESCE(SUM(i.grand_total), 0)
            FROM `tabRUA Invoice` i
            WHERE i.project = p.name
            AND i.status = 'Final'
            AND i.type = 'Tax Invoice'
        ), 0),
        -- MODIFIED: project_cost ONLY considers Final LPOs now.
        project_cost = COALESCE((
            SELECT COALESCE(SUM(lpo.grand_total), 0)
            FROM `tabRUA LPO` lpo
            WHERE lpo.project = p.name
            AND lpo.status = 'Final' -- Assuming 'Final' is the status for approved LPOs
        ), 0),
        -- Payments of type 'Pay' are NO LONGER included in project_cost calculation.
        -- They represent actual cash outflow, tracked elsewhere in accounting.
        additional_expenses = COALESCE((
            SELECT COALESCE(SUM(pay.amount), 0)
            FROM `tabRUA Payment` pay
            WHERE pay.project = p.name
            AND pay.status = 'Submitted'
            AND pay.type = 'Pay: Petty Cash' -- Petty cash remains as additional_expenses
        ), 0),
        total_received = COALESCE((
            SELECT COALESCE(SUM(pay.amount), 0)
            FROM `tabRUA Payment` pay
            WHERE pay.project = p.name
            AND pay.status = 'Submitted'
            AND pay.type = 'Receive' -- Received payments remain
        ), 0),
        modified = modified  # Prevent modified timestamp update
    """
    frappe.db.sql(project_reconciliation_sql)

    # 2. Reconcile Invoice Payment Statuses (Applying tolerance) - No changes needed here
    invoice_payment_reconciliation_sql = """
    UPDATE `tabRUA Invoice` inv
    SET
        payment_status = CASE
            WHEN COALESCE((
                SELECT SUM(pay.amount)
                FROM `tabRUA Payment` pay
                WHERE pay.related_doctype = 'RUA Invoice'
                AND pay.related_docname = inv.name
                AND pay.status = 'Submitted'
            ), 0) >= (inv.grand_total - %s) THEN 'Paid'
            WHEN COALESCE((
                SELECT SUM(pay.amount)
                FROM `tabRUA Payment` pay
                WHERE pay.related_doctype = 'RUA Invoice'
                AND pay.related_docname = inv.name
                AND pay.status = 'Submitted'
            ), 0) > 0 THEN 'Partially Paid'
            ELSE 'Unpaid'
        END,
        payment_linked = CASE
            WHEN COALESCE((
                SELECT SUM(pay.amount)
                FROM `tabRUA Payment` pay
                WHERE pay.related_doctype = 'RUA Invoice'
                AND pay.related_docname = inv.name
                AND pay.status = 'Submitted'
            ), 0) > 0 THEN 1
            ELSE 0
        END,
        modified = modified  # Prevent modified timestamp update
    """
    frappe.db.sql(invoice_payment_reconciliation_sql, (PAYMENT_TOLERANCE,))

    log_reconciliation_summary()


def log_reconciliation_summary():
    """Log summary of reconciliation results"""
    summary_queries = [
        ("Total Projects", "SELECT COUNT(*) FROM `tabRUA Project`"),
        ("Total Invoices", "SELECT COUNT(*) FROM `tabRUA Invoice`"),
        ("Total Payments", "SELECT COUNT(*) FROM `tabRUA Payment`"),
        ("Total LPOs", "SELECT COUNT(*) FROM `tabRUA LPO`"),
        ("Final LPOs", "SELECT COUNT(*) FROM `tabRUA LPO` WHERE status = 'Final'"),
        (
            "Paid Invoices",
            "SELECT COUNT(*) FROM `tabRUA Invoice` WHERE payment_status = 'Paid'",
        ),
        (
            "Partially Paid Invoices",
            "SELECT COUNT(*) FROM `tabRUA Invoice` WHERE payment_status = 'Partially Paid'",
        ),
        (
            "Unpaid Invoices",
            "SELECT COUNT(*) FROM `tabRUA Invoice` WHERE payment_status = 'Unpaid'",
        ),
    ]
    summary_lines = []
    for label, query in summary_queries:
        try:
            result = frappe.db.sql(query)
            count = result[0][0] if result and result[0] else 0
            summary_lines.append(f"{label}: {count}")
        except Exception as e:
            summary_lines.append(f"{label}: Error ({e})")
    frappe.log_error(
        message="Reconciliation Summary:\n" + "\n".join(summary_lines),
        title="Financial Reconciliation Summary",
    )


def get_payment_reconciliation_status(related_doctype, related_docname):
    """
    Retrieve payment status for a given document (typically Invoice), considering tolerance.
    (No changes needed in this helper function itself)
    """
    grand_total = frappe.db.get_value(related_doctype, related_docname, "grand_total")
    if grand_total is None:
        frappe.log_error(
            f"Could not find {related_doctype} {related_docname} to get grand_total."
        )
        return {"payment_status": "Error", "payment_linked": 0}

    paid_threshold = flt(grand_total) - flt(PAYMENT_TOLERANCE)
    total_paid_query = """
        SELECT COALESCE(SUM(amount), 0) as total_paid
        FROM `tabRUA Payment`
        WHERE related_doctype = %s AND related_docname = %s AND status = 'Submitted'
    """
    result = frappe.db.sql(
        total_paid_query, (related_doctype, related_docname), as_dict=True
    )
    total_paid = flt(result[0].get("total_paid")) if result else 0

    payment_status = "Unpaid"
    payment_linked = 0
    if total_paid >= paid_threshold and flt(grand_total) > 0:
        payment_status = "Paid"
        payment_linked = 1
    elif total_paid > 0:
        payment_status = "Partially Paid"
        payment_linked = 1

    return {"payment_status": payment_status, "payment_linked": payment_linked}


def reconcile_single_project_financials(project_name):
    """
    Reconcile financials for a specific project using direct SQL queries.
    Project Cost is now based ONLY on Final LPOs.

    Args:
        project_name (str): Name of the project to reconcile
    """
    if not project_name:
        frappe.log_warning(
            "reconcile_single_project_financials called without project_name."
        )
        return False

    try:
        # 1. Reconcile Project Financial Metrics
        # MODIFIED: project_cost now ONLY includes Final LPO Costs. 'Pay' type Payments are excluded.
        # MODIFIED: Removed parameter placeholder for 'Pay' Payments subquery. Adjusted parameter count.
        project_reconciliation_sql = """
        UPDATE `tabRUA Project` p
        SET
            total_invoiced = COALESCE((
                SELECT COALESCE(SUM(i.grand_total), 0)
                FROM `tabRUA Invoice` i
                WHERE i.project = %s -- Param 1: Invoice project
                AND i.status = 'Final'
                AND i.type = 'Tax Invoice'
            ), 0),
            -- MODIFIED: project_cost ONLY considers Final LPOs now.
            project_cost = COALESCE((
                SELECT COALESCE(SUM(lpo.grand_total), 0)
                FROM `tabRUA LPO` lpo
                WHERE lpo.project = %s -- Param 2: LPO project
                AND lpo.status = 'Final'
            ), 0),
            -- Payments of type 'Pay' are NO LONGER included here.
            additional_expenses = COALESCE((
                SELECT COALESCE(SUM(pay.amount), 0)
                FROM `tabRUA Payment` pay
                WHERE pay.project = %s -- Param 3: Petty Cash project
                AND pay.status = 'Submitted'
                AND pay.type = 'Pay: Petty Cash'
            ), 0),
            total_received = COALESCE((
                SELECT COALESCE(SUM(pay.amount), 0)
                FROM `tabRUA Payment` pay
                WHERE pay.project = %s -- Param 4: Receive project
                AND pay.status = 'Submitted'
                AND pay.type = 'Receive'
            ), 0),
            modified = modified
        WHERE p.name = %s -- Param 5: Main WHERE clause project
        """
        # Pass project_name for each remaining subquery filter and the final WHERE clause (5 times total)
        frappe.db.sql(
            project_reconciliation_sql,
            (project_name, project_name, project_name, project_name, project_name),
        )

        # 2. Reconcile Invoice Payment Statuses for this Project (Applying tolerance) - No change needed here
        invoice_payment_reconciliation_sql = """
        UPDATE `tabRUA Invoice` inv
        SET
            payment_status = CASE
                WHEN COALESCE((
                    SELECT SUM(pay.amount)
                    FROM `tabRUA Payment` pay
                    WHERE pay.related_doctype = 'RUA Invoice' AND pay.related_docname = inv.name AND pay.status = 'Submitted'
                ), 0) >= (inv.grand_total - %s) THEN 'Paid' -- Param 1: Tolerance
                WHEN COALESCE((
                    SELECT SUM(pay.amount)
                    FROM `tabRUA Payment` pay
                    WHERE pay.related_doctype = 'RUA Invoice' AND pay.related_docname = inv.name AND pay.status = 'Submitted'
                ), 0) > 0 THEN 'Partially Paid'
                ELSE 'Unpaid'
            END,
            payment_linked = CASE
                WHEN COALESCE((
                    SELECT SUM(pay.amount)
                    FROM `tabRUA Payment` pay
                    WHERE pay.related_doctype = 'RUA Invoice' AND pay.related_docname = inv.name AND pay.status = 'Submitted'
                ), 0) > 0 THEN 1
                ELSE 0
            END,
            modified = modified
        WHERE inv.project = %s -- Param 2: Project Name
        """
        frappe.db.sql(
            invoice_payment_reconciliation_sql, (PAYMENT_TOLERANCE, project_name)
        )

        # 3. Calculate and Update Project Completion (using reconciled values) - No change needed here
        project_data = frappe.db.get_value(
            "RUA Project",
            project_name,
            ["total_received", "contract_value"],
            as_dict=True,
        )
        if project_data:
            total_received = flt(project_data.get("total_received"))
            contract_value = flt(project_data.get("contract_value"))
            completion = 0.0
            if contract_value > 0:
                completion = min((total_received / contract_value) * 100, 100.0)
            frappe.db.set_value(
                "RUA Project",
                project_name,
                "completion",
                completion,
                update_modified=False,
            )

        # Optional: Log reconciliation details
        log_single_project_reconciliation(project_name)

        # Commit changes for the single project
        frappe.db.commit()
        return True

    except Exception as e:
        frappe.db.rollback()  # Rollback on error for this project
        frappe.log_error(
            message=f"Error reconciling project {project_name}: {str(e)}",
            title="Single Project Reconciliation Error",
        )
        return False


def log_single_project_reconciliation(project_name):
    """Log details about a single project's reconciliation"""
    # (No changes needed in logging function, it just reports counts)
    summary_queries = [
        ("Total Invoices", "SELECT COUNT(*) FROM `tabRUA Invoice` WHERE project = %s"),
        (
            "Paid Invoices",
            "SELECT COUNT(*) FROM `tabRUA Invoice` WHERE project = %s AND payment_status = 'Paid'",
        ),
        (
            "Partially Paid Invoices",
            "SELECT COUNT(*) FROM `tabRUA Invoice` WHERE project = %s AND payment_status = 'Partially Paid'",
        ),
        (
            "Unpaid Invoices",
            "SELECT COUNT(*) FROM `tabRUA Invoice` WHERE project = %s AND payment_status = 'Unpaid'",
        ),
        ("Total Payments", "SELECT COUNT(*) FROM `tabRUA Payment` WHERE project = %s"),
        ("Total LPOs", "SELECT COUNT(*) FROM `tabRUA LPO` WHERE project = %s"),
        (
            "Final LPOs",
            "SELECT COUNT(*) FROM `tabRUA LPO` WHERE project = %s AND status = 'Final'",
        ),
    ]
    summary_lines = []
    for label, query in summary_queries:
        try:
            result = frappe.db.sql(query, (project_name,))
            count = result[0][0] if result and result[0] else 0
            summary_lines.append(f"{label}: {count}")
        except Exception as e:
            summary_lines.append(f"{label}: Error ({e})")
    frappe.log_error(
        message=f"Reconciliation Summary for Project {project_name}:\n"
        + "\n".join(summary_lines),
        title=f"Project {project_name} Reconciliation Summary",
    )


def execute():
    """Entry point for bench execute"""
    frappe.log("Starting post-install reconciliation via execute...")
    after_migrate()
    frappe.log("Finished post-install reconciliation via execute.")


# --- End of after_migrate.py ---
