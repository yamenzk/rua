# Copyright (c) 2025, Yamen Zakhour and contributors
# For license information, please see license.txt

import frappe
import rua
from frappe.model.document import Document


class RUAEmployee(Document):
    def calculate_salary(self):
        return (self.basic or 0) + (self.allowance or 0)
    def publish_update(self):
        rua.refetch_resource("rua:employee")

    def on_update(self):
        self.publish_update()
    
    def before_save(self):
        self.salary = self.calculate_salary()

    def on_trash(self):
        self.publish_update()
    
    def before_insert(self):
        self.salary = self.calculate_salary()

    
    def after_insert(self):
        self.publish_update()
