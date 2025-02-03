import frappe
from frappe.utils import flt

def after_install():
    """Reconcile all project financials after app installation"""
    try:
        projects = frappe.get_all("RUA Project", pluck="name")
        for project_name in projects:
            reconcile_project_financials(project_name)
        frappe.db.commit()
        frappe.log_error(
            message="Project financials reconciliation completed successfully",
            title="Post Install Reconciliation"
        )
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(
            message=f"Error during project financials reconciliation: {str(e)}",
            title="Post Install Reconciliation Error"
        )

def reconcile_project_financials(project_name):
    """Reconcile financials for a single project"""
    project = frappe.get_doc("RUA Project", project_name)
    
    calculated_totals = get_calculated_totals(project_name)
    needs_update = update_project_if_needed(project, calculated_totals)
    
    if needs_update:
        project.save(ignore_permissions=True)

def get_calculated_totals(project_name):
    """Get calculated totals for a project from payments and invoices"""
    # Get invoice totals
    invoices = frappe.get_all(
        "RUA Invoice",
        filters={
            "project": project_name,
            "status": "Final",
            "type": "Tax Invoice"
        },
        fields=["grand_total"]
    )
    
    # Get payment totals
    payments = frappe.get_all(
        "RUA Payment",
        filters={
            "project": project_name,
            "status": "Submitted"
        },
        fields=["type", "amount"]
    )
    
    return {
        "total_invoiced": sum(flt(inv.grand_total) for inv in invoices),
        "project_cost": sum(flt(p.amount) for p in payments if p.type == "Pay"),
        "additional_expenses": sum(flt(p.amount) for p in payments if p.type == "Pay: Petty Cash"),
        "total_received": sum(flt(p.amount) for p in payments if p.type == "Receive")
    }

def update_project_if_needed(project, calculated_totals):
    """Update project with calculated totals if different"""
    needs_update = False
    updates = []
    
    for field, calculated_value in calculated_totals.items():
        current_value = flt(getattr(project, field))
        if current_value != calculated_value:
            updates.append(f"{field}: {current_value} → {calculated_value}")
            setattr(project, field, calculated_value)
            needs_update = True
    
    if updates:
        frappe.log_error(
            message=f"Project {project.name} updated:\n" + "\n".join(updates),
            title="Project Reconciliation"
        )
    
    return needs_update

def execute():
    """Entry point for bench execute"""
    after_install()