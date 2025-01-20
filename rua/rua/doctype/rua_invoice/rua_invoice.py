import frappe
from frappe.model.document import Document
import rua
from rua import ChatMessageHandler
from frappe.utils import flt


class RUAInvoice(Document):
    STATUS_HANDLERS = {
        "Submitted": {
            "type": "Info",
            "message": lambda doc: (
                f"@{doc.owner} has submitted a {doc.type} #{doc.name} for {doc.party}"
            )
        },
        "Final": {
            "type": "Success",
            "timeline": 1,
            "message": lambda doc: (
                f"@{doc.owner} has finalized {doc.type} #{doc.name} for {doc.party}. "
                f"Amount: AED {doc.grand_total:,.2f} "
                f'["View Invoice", "{doc.invoice_file}"]'
            )
        },
        "Cancelled": {
            "type": "Danger",
            "message": lambda doc: (
                f"@{doc.owner} has cancelled {doc.type} #{doc.name} for {doc.party}. "
                f"Reason: {doc.remarks}"
            )
        }
    }

    PAYMENT_STATUS_HANDLERS = {
        "Paid": {
            "type": "Success",
            "timeline": 1,
            "message": lambda doc: (
                f"{doc.type} #{doc.name} for {doc.party} has been fully paid. "
                f"Amount: AED {doc.grand_total:,.2f}"
            )
        },
        "Partially Paid": {
            "type": "Info",
            "message": lambda doc: (
                f"{doc.type} #{doc.name} for {doc.party} has been partially paid"
            )
        }
    }

    def publish_update(self):
        rua.refetch_resource("rua:invoice")

    def on_update(self):
        self.publish_update()

        if self.has_value_changed('status') and self.status == "Final":
            invoices = frappe.get_list('RUA Invoice', fields=['serial_number'], filters=[{'project': self.project}, {'status': 'Final'}, {'type': 'Tax Invoice'}], order_by='serial_number desc', limit=1)
            highest_serial = invoices[0].serial_number if invoices else 0
            self.serial_number = highest_serial + 1
        
        # Handle status changes (except Draft)
        if self.has_value_changed('status') and self.status != "Draft":
            ChatMessageHandler(self).handle_status_update(self.STATUS_HANDLERS)
        
        # Handle payment status changes (only if status is Final)
        if self.status == "Final" and self.has_value_changed('payment_status'):
            handler = self.PAYMENT_STATUS_HANDLERS.get(self.payment_status)
            if handler:
                ChatMessageHandler(self).handle_status_update({self.payment_status: handler})

    def on_trash(self):
        self.publish_update()
    
    def before_save(self):
        if self.status == "Final" and self.serial_number == 0:
            invoices = frappe.get_list('RUA Invoice', fields=['serial_number'], filters=[{'project': self.project}, {'status': 'Final'}, {'type': 'Tax Invoice'}], order_by='serial_number desc', limit=1)
            highest_serial = invoices[0].serial_number if invoices else 0
            self.serial_number = highest_serial + 1
    
    def validate(self):
        if not self.project:
            frappe.throw("Project is mandatory")

        try:
            project_doc = frappe.get_doc("RUA Project", self.project)
            
            # Calculate amounts based on retention status
            retention_enabled = (
                project_doc 
                and project_doc.retention_status == "Enabled" 
                and project_doc.retention_percentage > 0
            )

            if retention_enabled:
                if project_doc.retention_percentage > 100:
                    frappe.throw("Retention percentage cannot exceed 100%")
                    
                retention_factor = (1 - project_doc.retention_percentage / 100)
                self.amount_after_retention = flt(self.amount * retention_factor)
            else:
                self.amount_after_retention = flt(self.amount)

            # Calculate VAT and grand total
            self.vat_after_retention = flt(self.amount_after_retention * 0.05)
            self.grand_total = flt(self.amount_after_retention + self.vat_after_retention)

            # Handle status changes
            if self.has_value_changed("status"):
                if self.status == "Final":
                    project_doc.total_invoiced = flt(project_doc.total_invoiced + self.grand_total)
                        
                elif self.status == "Cancelled":
                    # Only subtract if it was previously finalized
                    if self.get_doc_before_save().status == "Final":
                        project_doc.total_invoiced = flt(project_doc.total_invoiced - self.grand_total)
                
                project_doc.save(ignore_permissions=True)

        except Exception as e:
            frappe.log_error(f"Error in invoice validation: {str(e)}")

    def after_insert(self):
        self.publish_update()
        
        # Only create insert message if not Draft
        if self.status != "Draft":
            def get_insert_message(doc):
                return f"@{doc.owner} has created a {doc.type} #{doc.name} for {doc.party}"
            
            ChatMessageHandler(self).handle_insert(get_insert_message)