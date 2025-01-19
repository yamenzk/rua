import frappe
from frappe.model.document import Document
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