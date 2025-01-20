import frappe
from frappe.model.document import Document
import rua
from rua import ChatMessageHandler


class RUARFQ(Document):
    STATUS_HANDLERS = {
        "Submitted": {
            "type": "Info",
            "message": lambda doc: f'@{doc.owner} has updated RFQ #{doc.name} status to "{doc.status}".'
        },
        "Quotation Received": {
            "type": "Success",
            "timeline": 1,
            "message": lambda doc: (
                f'{doc.party} has provided a quotation for RFQ #{doc.name}. '
                f'["View Quotation","{doc.quotation_file}"]'
            )
        },
        "Cancelled": {
            "type": "Danger",
            "message": lambda doc: (
                f'@{doc.owner} has cancelled RFQ #{doc.name} for {doc.party}. '
                f'Reason: "{doc.remarks}".'
            )
        }
    }

    def publish_update(self):
        rua.refetch_resource("rua:rfq")

    def on_update(self):
        self.publish_update()
        if self.has_value_changed('status') and self.status != "Draft":
            ChatMessageHandler(self).handle_status_update(self.STATUS_HANDLERS)

    def on_trash(self):
        self.publish_update()

    def after_insert(self):
        self.publish_update()
        
        # Only create insert message if not Draft
        if self.status != "Draft":
            def get_insert_message(doc):
                if doc.type != 'Link':
                    return f'@{doc.owner} has created a(n) {doc.type} RFQ #{doc.name} for {doc.party}'
                return f'@{doc.owner} has created an RFQ link #{doc.name} for {doc.party}. ["View Link","{doc.link}"]'
            
            ChatMessageHandler(self).handle_insert(get_insert_message)