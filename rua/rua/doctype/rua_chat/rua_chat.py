# Copyright (c) 2025, Yamen Zakhour and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class RUAChat(Document):
    def before_insert(self):
        if self.user:
            employee = frappe.get_all('RUA Employee', filters={
                                      'user': self.user}, fields=['name', 'employee_name', 'image'])

            if employee:
                self.employee = employee[0].name
                self.employee_name = employee[0].employee_name
                self.employee_image = employee[0].image
