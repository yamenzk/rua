import frappe
from frappe.utils import flt

def after_install():
    """Reconcile all project financials after app installation"""
    try:
        # Get all projects
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
    
    # Get project document
    project = frappe.get_doc("RUA Project", project_name)
    
    # Calculate invoice totals
    invoices = frappe.get_all(
        "RUA Invoice",
        filters={
            "project": project_name,
            "status": "Final",
            "type": "Tax Invoice"
        },
        fields=["grand_total"]
    )
    calculated_total_invoiced = sum(flt(inv.grand_total) for inv in invoices)
    
    # Calculate payment totals
    payments = frappe.get_all(
        "RUA Payment",
        filters={
            "project": project_name,
            "status": "Submitted"
        },
        fields=["type", "amount"]
    )
    
    calculated_totals = {
        "project_cost": sum(flt(p.amount) for p in payments if p.type == "Pay"),
        "additional_expenses": sum(flt(p.amount) for p in payments if p.type == "Pay: Petty Cash"),
        "total_received": sum(flt(p.amount) for p in payments if p.type == "Receive")
    }
    
    # Check for discrepancies
    needs_update = False
    updates = []
    
    # Check total_invoiced
    if flt(project.total_invoiced) != flt(calculated_total_invoiced):
        updates.append(f"total_invoiced: {project.total_invoiced} → {calculated_total_invoiced}")
        project.total_invoiced = calculated_total_invoiced
        needs_update = True
    
    # Check payment totals
    for field, calculated_value in calculated_totals.items():
        current_value = flt(getattr(project, field))
        if current_value != calculated_value:
            updates.append(f"{field}: {current_value} → {calculated_value}")
            setattr(project, field, calculated_value)
            needs_update = True
    
    # Save project if needed and log changes
    if needs_update:
        project.save(ignore_permissions=True)
        frappe.log_error(
            message=f"Project {project_name} updated:\n" + "\n".join(updates),
            title="Project Reconciliation"
        )

def execute():
    """Entry point for bench execute"""
    after_install()