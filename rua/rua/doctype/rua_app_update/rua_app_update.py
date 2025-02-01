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
        """Automatically increment the version number before inserting a new document"""
        current_version = rua.__version__
        
        # Split version into components
        version_parts = current_version.split('.')
        
        # Increment the last number
        version_parts[-1] = str(int(version_parts[-1]) + 1)
        
        # Join back together
        new_version = '.'.join(version_parts)
        
        # Set the version field
        self.version = new_version