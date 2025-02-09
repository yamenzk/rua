import frappe
from frappe.model.document import Document
import rua
from rua.install.after_migrate import reconcile_single_project_financials

class RUAInvoice(Document):
    def publish_update(self):
        rua.refetch_resource("rua:payment")
        rua.refetch_resource("rua:invoice")
        rua.refetch_resource("rua:project")

    def on_update(self):
        if not self.project:
            frappe.throw("Project is mandatory")

        try:
            # Handle serial number logic for Final status Tax Invoices
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
                    
                    self.publish_project_update()
                    
                elif self.status == "Cancelled" and self.get_doc_before_save().status == "Final":
                    self.db_set('serial_number', 0, update_modified=False)
                    self.publish_project_update()

            # Reconcile project financials after any significant update
            reconcile_single_project_financials(self.project)

        except Exception as e:
            frappe.log_error(f"Error in invoice validation: {str(e)}")
        
        reconcile_single_project_financials(self.project)
        self.publish_update()

    def on_trash(self):
        if self.project:
            reconcile_single_project_financials(self.project)
        
        self.publish_update()

    def after_insert(self):
        if self.project:
            reconcile_single_project_financials(self.project)
        
        self.publish_update()