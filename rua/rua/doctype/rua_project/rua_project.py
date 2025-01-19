# Copyright (c) 2025, Yamen Zakhour and contributors
# For license information, please see license.txt

import frappe
import rua
from frappe.model.document import Document


class RUAProject(Document):
    def publish_update(self):
        rua.refetch_resource("rua:project")

    def on_update(self):
        self.publish_update()
        if self.has_value_changed('status') and self.status != 'In Progress':
            chat_doc = {
                "doctype": "RUA Chat",
                "project": self.name,
                "user": self.owner,
                "type": "Alert",
                "timestamp": frappe.utils.now(),
                "timeline": 1,
                "message": f'@{self.owner} has updated project status to "{self.status}".'
            }
            if chat_doc:
                frappe.get_doc(chat_doc).insert(ignore_permissions=True)
                frappe.db.commit()

    def on_trash(self):
        self.publish_update()

    def after_insert(self):
        self.publish_update()
        chat_doc = {
            "doctype": "RUA Chat",
            "project": self.name,
            "user": self.owner,
            "type": "Success",
            "timestamp": frappe.utils.now(),
            "timeline": 1,
            "message": f"@{self.owner} has started this project."
        }
        if chat_doc:
            frappe.get_doc(chat_doc).insert(ignore_permissions=True)
            frappe.db.commit()

    def validate(self):
        if self.has_value_changed('status') and self.status == 'In Progress' and self.serial_number == 0:
            # Get the highest serial number using get_list
            projects = frappe.get_list('RUA Project', fields=[
                                       'serial_number'], order_by='serial_number desc', limit=1)
            highest_serial = projects[0].serial_number if projects else 0
            self.serial_number = highest_serial + 1
            chat_doc = {
                "doctype": "RUA Chat",
                "project": self.name,
                "user": self.owner,
                "type": "Success",
                "timestamp": frappe.utils.now(),
                "timeline": 1,
                "message": f'@{self.owner} has updated project status to "{self.status}". The serial number for this project has been set to {self.serial_number}.'
            }
            if chat_doc:
                frappe.get_doc(chat_doc).insert(ignore_permissions=True)
                frappe.db.commit()
