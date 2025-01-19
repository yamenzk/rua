import frappe
from frappe.model.document import Document
import rua
from rua import ChatMessageHandler


class RUALPO(Document):
    STATUS_HANDLERS = {
        "Submitted": {
            "type": "Info",
            "message": lambda doc: f"@{doc.owner} has submitted LPO #{doc.name} for {doc.party}"
        },
        "Final": {
            "type": "Success",
            "timeline": 1,
            "message": lambda doc: (
                f"@{doc.owner} has finalized LPO #{doc.name} for {doc.party} "
                f"with {doc.total_items} items. Total: AED {doc.grand_total:,.2f} "
                f'["View LPO", "{doc.final_lpo}"]'
            )
        },
        "Cancelled": {
            "type": "Danger",
            "timeline": 1,
            "message": lambda doc: f"@{doc.owner} has cancelled LPO #{doc.name} for {doc.party}"
        }
    }

    PAYMENT_STATUS_HANDLERS = {
        "Paid": {
            "type": "Success",
            "timeline": 1,
            "message": lambda doc: f"LPO #{doc.name} for {doc.party} has been fully paid. Amount: AED {doc.grand_total:,.2f}"
        },
        "Partially Paid": {
            "type": "Warning",
            "timeline": 1,
            "message": lambda doc: f"LPO #{doc.name} for {doc.party} has been partially paid"
        }
    }

    def publish_update(self):
        rua.refetch_resource("rua:lpo")

    def on_update(self):
        self.publish_update()
        
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

    def after_insert(self):
        self.publish_update()
        # Only create insert message if not Draft
        if self.status != "Draft":
            ChatMessageHandler(self).handle_insert(
                lambda doc: f"@{doc.owner} has created LPO #{doc.name} for {doc.party}"
            )

    def validate(self):
        self.total_items = len(self.items)
        self.total_amount = 0
        self.vat_amount = 0
        self.grand_total = 0
        for item in self.items:
            self.total_amount += item.total_amount
            self.vat_amount += item.vat_amount
            self.grand_total += item.grand_total