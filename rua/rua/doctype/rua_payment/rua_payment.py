import frappe
from frappe.model.document import Document
from frappe.utils import flt
import rua
from rua import ChatMessageHandler


class RUAPayment(Document):
    def _get_submitted_message(self):
        """Generate appropriate message based on payment type and related documents"""
        amount_str = f"AED {self.amount:,.2f}"
        base_msg = f"@{self.owner} has submitted payment #{self.name}"
        
        if self.type == "Pay: Petty Cash":
            return f"{base_msg} (Petty Cash) of {amount_str} to {self.party}. Remarks: {self.remarks}"
        
        # For Pay and Receive types with related documents
        if self.related_doctype and self.related_docname:
            doc_type = 'Invoice' if self.related_doctype == "RUA Invoice" else 'LPO'
            doc_link = f'["View {doc_type}", "/project/{self.project}/invoicing/{doc_type}/{self.related_docname}"]'
            
            if self.type == "Pay":
                return f"{base_msg} of {amount_str} to {self.party} against LPO #{self.related_docname} {doc_link}"
            
            if self.type == "Receive":
                return f"{base_msg} of {amount_str} from {self.party} against Invoice #{self.related_docname} {doc_link}"
        
        return f"{base_msg} of {amount_str} {'to' if self.type == 'Pay' else 'from'} {self.party}"

    STATUS_HANDLERS = {
        "Submitted": {
            "type": "Success",
            "timeline": 1,
            "message": lambda doc: doc._get_submitted_message()  # Changed to call instance method
        },
        "Cancelled": {
            "type": "Danger",
            "timeline": 1,
            "message": lambda doc: f"@{doc.owner} has cancelled payment #{doc.name} for {doc.party}. Reason: {doc.remarks}"
        }
    }

    def publish_update(self):
        rua.refetch_resource("rua:payment")

    def on_update(self):
        self.publish_update()
        # Only create messages for Submitted and Cancelled status
        if self.status in ["Submitted", "Cancelled"]:
            ChatMessageHandler(self).handle_status_update(self.STATUS_HANDLERS)

    def on_trash(self):
        self.publish_update()

    def after_insert(self):
        self.publish_update()
        # Don't create insert message for draft status
        if self.status != "Draft":
            def get_insert_message(doc):
                type_str = "Petty Cash payment" if doc.type == "Pay: Petty Cash" else f"{doc.type.lower()} payment"
                return f"@{doc.owner} has created {type_str} #{doc.name} for {doc.party}"
            
            ChatMessageHandler(self).handle_insert(get_insert_message)
    
    def validate(self):
        if not self.has_value_changed("status"):
            return

        try:
            if self.status == "Submitted":
                self._handle_submission()
            elif self.status == "Cancelled" and self.get_doc_before_save().status == "Submitted":
                self._handle_cancellation()
                
        except Exception as e:
            frappe.log_error(f"Error in payment validation: {str(e)}")

    def _handle_submission(self):
        # Handle project cost updates
        if self.project:
            project_doc = frappe.get_doc("RUA Project", self.project)
            if self.type == "Pay":
                project_doc.project_cost = flt(project_doc.project_cost + self.amount)
            elif self.type == "Pay: Petty Cash":
                project_doc.additional_expenses = flt(project_doc.additional_expenses + self.amount)
            elif self.type == "Receive":
                project_doc.total_received = flt(project_doc.total_received + self.amount)
            project_doc.save(ignore_permissions=True)

        # Handle related document payment status
        if self.related_doctype and self.related_docname:
            self._update_related_doc_payment_status()

    def _handle_cancellation(self):
        # Reverse project cost updates
        if self.project:
            project_doc = frappe.get_doc("RUA Project", self.project)
            if self.type == "Pay":
                project_doc.project_cost = flt(project_doc.project_cost - self.amount)
            elif self.type == "Pay: Petty Cash":
                project_doc.additional_expenses = flt(project_doc.additional_expenses - self.amount)
            elif self.type == "Receive":
                project_doc.total_received = flt(project_doc.total_received - self.amount)
            project_doc.save(ignore_permissions=True)

        # Update related document payment status on cancellation
        if self.related_doctype and self.related_docname:
            self._update_related_doc_payment_status(is_cancellation=True)

    def _update_related_doc_payment_status(self, is_cancellation=False):
        related_doc = frappe.get_doc(self.related_doctype, self.related_docname)
        
        # Get all submitted payments
        payments = frappe.db.get_all(
            "RUA Payment",
            filters={
                "related_doctype": self.related_doctype,
                "related_docname": self.related_docname,
                "status": "Submitted",
                "name": ("!=", self.name if is_cancellation else "")
            },
            fields=["amount"]
        )
        
        total_paid = sum(flt(payment.amount) for payment in payments)
        if not is_cancellation:
            total_paid += flt(self.amount)

        # Update payment status based on total paid amount
        if total_paid >= related_doc.grand_total:
            related_doc.payment_status = "Paid"
            related_doc.payment_linked = 1
        elif total_paid > 0:
            related_doc.payment_status = "Partially Paid"
            related_doc.payment_linked = 1
        else:
            related_doc.payment_status = "Unpaid"
            related_doc.payment_linked = 0
        
        related_doc.save(ignore_permissions=True)
                        
                   
