# Copyright (c) 2025, Yamen Zakhour and contributors
# For license information, please see license.txt

import frappe
import rua
from frappe.model.document import Document

class RUAAppUpdate(Document):
    def publish_update(self):
        rua.refetch_resource("rua:update")

    def on_update(self):
        self.publish_update()

    def on_trash(self):
        self.publish_update()
    
    def after_insert(self):
        self.publish_update()
        
    def before_insert(self):
        self.version = rua.__version__