# Copyright (c) 2025, Yamen Zakhour and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime
import re


class RUAChat(Document):
    def before_insert(self):
        if self.user:
            employee = frappe.get_all('RUA Employee', filters={
                                      'user': self.user}, fields=['name', 'employee_name', 'image'])

            if employee:
                self.employee = employee[0].name
                self.employee_name = employee[0].employee_name
                self.employee_image = employee[0].image

    def after_insert(self):
        if self.message and self.message.startswith('!'):
            # Handle !todo command
            if self.message.startswith('!todo @'):
                # Extract the employee ID and details using regex
                pattern = r'!todo @(RC-EMP-\d+)\s+(.+)'
                match = re.match(pattern, self.message)

                if match:
                    employee_id = match.group(1)
                    todo_details = match.group(2)

                    # Get the user ID for the assigned employee
                    assigned_user = frappe.db.get_value(
                        "RUA Employee", employee_id, "user")

                    if assigned_user:
                        # Create new RUA Todo document
                        todo_doc = {
                            "doctype": "RUA Todo",
                            "date": now_datetime(),
                            "assigned_to": assigned_user,
                            "project": self.project,
                            "details": todo_details
                        }

                        # Check for quotation reference in the message
                        qtn_pattern = r'#(RC-QTN-\d+)'
                        qtn_match = re.search(qtn_pattern, todo_details)
                        
                        if qtn_match:
                            quotation_id = qtn_match.group(1)
                            # Set related document fields if it's a quotation
                            if quotation_id.startswith('RC-QTN'):
                                todo_doc.update({
                                    "related_doctype": "RUA Quotation",
                                    "related_docname": quotation_id
                                })

                        # Create and insert the todo
                        todo = frappe.get_doc(todo_doc)
                        todo.insert(ignore_permissions=True)
                        frappe.db.commit()
        
        self.delete()