import frappe
from frappe.model.document import Document
import rua


class RUALPO(Document):
    def publish_update(self):
        rua.refetch_resource("rua:lpo")

    def on_update(self):
        self.publish_update()

    def on_trash(self):
        self.publish_update()

    def after_insert(self):
        self.publish_update()

    def validate(self):
        self.total_items = len(self.items)
        self.total_amount = 0
        self.vat_amount = 0
        self.grand_total = 0
        for item in self.items:
            self.total_amount += item.total_amount
            self.vat_amount += item.vat_amount
            self.grand_total += item.grand_total