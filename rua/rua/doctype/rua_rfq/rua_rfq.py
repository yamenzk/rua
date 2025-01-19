import frappe
from frappe.model.document import Document
import rua
from rua import ChatMessageHandler

class RUARFQ(Document):
    STATUS_HANDLERS = {
        "Cancelled": {
            "type": "Danger",
            "message": lambda doc: f'@{doc.owner} has cancelled RFQ #{doc.name} for {doc.party}. Reason: "{doc.remarks}".'
        },
        "Quotation Received": {
            "type": "Success",
            "timeline": 1,
            "message": lambda doc: f'{doc.party} has provided a quotation for RFQ #{doc.name}. ["View Quotation","{doc.quotation_file}"]'
        },
        "Submitted": {
            "type": "Info",
            "message": lambda doc: f'@{doc.owner} has updated RFQ #{doc.name} status to "{doc.status}".'
        }
    }

    def publish_update(self):
        rua.refetch_resource("rua:rfq")

    def on_update(self):
        self.publish_update()
        ChatMessageHandler(self).handle_status_update(self.STATUS_HANDLERS)

    def on_trash(self):
        self.publish_update()

    def after_insert(self):
        self.publish_update()
        
        def get_insert_message(doc):
            if doc.type != 'Link':
                return f'@{doc.owner} has created a(n) {doc.type} RFQ #{doc.name} for {doc.party}'
            return f'@{doc.owner} has created an RFQ link #{doc.name} for {doc.party}. ["View Link","{doc.link}"]'

        ChatMessageHandler(self).handle_insert(get_insert_message)