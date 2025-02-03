import frappe
from frappe.model.document import Document
import rua
from frappe.utils import flt


class RUAInvoice(Document):
    def publish_update(self):
        rua.refetch_resource("rua:invoice")
    
    def publish_project_update(self):
        rua.refetch_resource("rua:project")

    def on_update(self):
        if not self.project:
            frappe.throw("Project is mandatory")

        try:
            project_doc = frappe.get_doc("RUA Project", self.project)

            # Handle status changes
            if self.has_value_changed("status") and self.type == "Tax Invoice":
                if self.status == "Final":
                    # Assign serial number first before any other operations
                    if not self.serial_number or self.serial_number == 0:
                        invoices = frappe.get_list(
                            'RUA Invoice', 
                            fields=['serial_number'], 
                            filters={
                                'project': self.project, 
                                'status': 'Final', 
                                'type': 'Tax Invoice',
                                'name': ('!=', self.name)  # Exclude current invoice
                            }, 
                            order_by='serial_number desc', 
                            limit=1
                        )
                        highest_serial = invoices[0].serial_number if invoices else 0
                        self.db_set('serial_number', highest_serial + 1, update_modified=False)
                    
                    project_doc.total_invoiced = flt(project_doc.total_invoiced + self.grand_total)
                    self.publish_project_update()
                    
                elif self.status == "Cancelled" and self.get_doc_before_save().status == "Final":
                    project_doc.total_invoiced = flt(project_doc.total_invoiced - self.grand_total)
                    self.db_set('serial_number', 0, update_modified=False)
                    self.publish_project_update()
                
                project_doc.save(ignore_permissions=True)

        except Exception as e:
            frappe.log_error(f"Error in invoice validation: {str(e)}")

        self.publish_update()


    def on_trash(self):
        self.publish_update()
    

    def after_insert(self):
        self.publish_update()

    def after_save(self):
        if not self.project:
            return
            
        # Get all final tax invoices for this project
        invoices = frappe.get_all(
            "RUA Invoice",
            filters={
                "project": self.project,
                "status": "Final",
                "type": "Tax Invoice"
            },
            fields=["grand_total"]
        )
        
        # Calculate total from invoices
        calculated_total = sum(flt(inv.grand_total) for inv in invoices)
        
        # Get project document
        project_doc = frappe.get_doc("RUA Project", self.project)
        
        # Check if total_invoiced needs updating
        current_total = flt(project_doc.total_invoiced)
        if current_total != calculated_total:
            # Log the correction for audit purposes
            frappe.log_error(
                message=f"Project {self.project} total_invoiced corrected from {current_total} to {calculated_total}",
                title="Invoice Reconciliation Correction"
            )
            
            # Update project
            project_doc.total_invoiced = calculated_total
            project_doc.save(ignore_permissions=True)
            self.publish_project_update()
