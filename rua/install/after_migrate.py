import frappe
from frappe.utils import flt

def after_migrate():
    projects = frappe.get_all("RUA Project", fields=["name", "total_received", "contract_value"], filters={"contract_value": (">", 0)})
    
    if not projects:
        frappe.log("No projects to reconcile.")
        return

    # First perform reconciliation for all projects
    try:
        reconcile_all_financials_sql()
        frappe.db.commit()  
        frappe.log("Financial reconciliation completed for all projects.")
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
    # 1. Reconcile Project Financials
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

    # 2. Reconcile Invoice Payment Statuses
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
            ), 0) >= inv.grand_total THEN 'Paid'
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
    frappe.db.sql(invoice_payment_reconciliation_sql)

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
        ("Partially Paid Invoices", "SELECT COUNT(*) FROM `tabRUA Invoice` WHERE payment_status = 'Partially Paid'")
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
    Retrieve payment status for a given document
    Can be used in transaction methods to get current payment status
    """
    status_query = """
    SELECT 
        CASE 
            WHEN COALESCE(SUM(amount), 0) >= (
                SELECT grand_total 
                FROM `tab{doctype}` 
                WHERE name = %s
            ) THEN 'Paid'
            WHEN COALESCE(SUM(amount), 0) > 0 THEN 'Partially Paid'
            ELSE 'Unpaid'
        END as payment_status,
        CASE 
            WHEN COALESCE(SUM(amount), 0) > 0 THEN 1
            ELSE 0
        END as payment_linked
    FROM `tabRUA Payment`
    WHERE related_doctype = %s 
    AND related_docname = %s 
    AND status = 'Submitted'
    """.format(doctype=related_doctype)
    
    return frappe.db.sql(
        status_query, 
        (related_docname, related_doctype, related_docname), 
        as_dict=True
    )[0]

def reconcile_single_project_financials(project_name):
    """
    Reconcile financials for a specific project using direct SQL queries
    
    Args:
        project_name (str): Name of the project to reconcile
    """
    try:
        # 1. Reconcile Project Financial Metrics
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
        """, (project_name, project_name, project_name, project_name, project_name)
        frappe.db.sql(*project_reconciliation_sql)

        # 2. Reconcile Invoice Payment Statuses for this Project
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
                ), 0) >= inv.grand_total THEN 'Paid'
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
        WHERE inv.project = %s
        """, (project_name,)
        frappe.db.sql(*invoice_payment_reconciliation_sql)

        # Optional: Log reconciliation details
        log_single_project_reconciliation(project_name)

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