import frappe
from frappe.model.document import Document
from frappe.utils import flt
import rua

class RUAPayment(Document):


    def publish_update(self):
        rua.refetch_resource("rua:payment")

    def on_update(self):
        self.publish_update()


    def on_trash(self):
        self.publish_update()

    def after_insert(self):
        self.publish_update()

    
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
                        
                   
