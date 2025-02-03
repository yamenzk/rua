import frappe
from frappe.model.document import Document
from frappe.utils import flt
import rua
from rua.install.after_install import reconcile_project_financials

class RUAPayment(Document):

    def publish_update(self):
        rua.refetch_resource("rua:payment")

    def publish_project_update(self):
        rua.refetch_resource("rua:project")

    def on_update(self):
        self.publish_update()

    def on_trash(self):
        self.publish_update()

    def after_insert(self):
        self.publish_update()
    
    def after_save(self):
        if self.project:
            reconcile_project_financials(self.project)

    def validate(self):
        # Track original status before changes
        original_status = self.get_doc_before_save().status if self.get_doc_before_save() else None
        
        # Check if status has actually changed
        if not self.has_value_changed("status"):
            if self.has_value_changed("related_docname"):
                self._update_related_doc_payment_status()
            return
        try:
            if self.status == "Submitted":
                self._handle_submission(original_status)
            elif self.status == "Cancelled":
                self._handle_cancellation(original_status)
                    
        except Exception as e:
            frappe.log_error(f"Error in payment validation: {str(e)}")

    def _handle_submission(self, original_status):
        # Update project financials
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
        elif original_status is None:  # Newly created payment without allocation
            pass

    def _handle_cancellation(self, original_status):
        # Check if the payment was previously submitted
        if original_status == "Submitted":
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
        # Ensure we have a related document
        if not (self.related_doctype and self.related_docname):
            return

        related_doc = frappe.get_doc(self.related_doctype, self.related_docname)
        
        # Get all submitted payments linked to this document
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
        
        # Calculate total paid amount
        total_paid = sum(flt(payment.amount) for payment in payments)
        if not is_cancellation:
            total_paid += flt(self.amount)

        # Update payment status and linked flag
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