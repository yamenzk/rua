import frappe
from frappe.model.document import Document
import rua


class RUARFQ(Document):
    def publish_update(self):
        rua.refetch_resource("rua:rfq")

    def on_update(self):
        self.publish_update()

    def on_trash(self):
        self.publish_update()

    def after_insert(self):
        self.publish_update()