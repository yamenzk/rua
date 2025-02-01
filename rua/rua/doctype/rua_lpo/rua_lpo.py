import frappe
from frappe.model.document import Document
import rua
from frappe.utils import flt


class RUALPO(Document):


    def publish_update(self):
        rua.refetch_resource("rua:lpo")

    def on_update(self):
        self.publish_update()

        if self.has_value_changed('status'):
            try:
                if not self.project:
                    frappe.throw("Project is mandatory")

                project_doc = frappe.get_doc("RUA Project", self.project)
                
                if self.status == "Final":
                    project_doc.project_cost = flt(project_doc.project_cost + self.grand_total)

                elif self.status == "Cancelled":
                    if self.get_doc_before_save().status == "Final":
                        project_doc.project_cost = flt(project_doc.project_cost - self.grand_total)
                
                project_doc.save(ignore_permissions=True)
                
            except Exception as e:
                frappe.log_error(f"Error updating project cost: {str(e)}")  
        
        if self.status != "Draft" and self.status != "Cancelled":
            current_all_items_received = 1
            for item in self.items:
                # Handle None case by treating it as 0 received quantity
                received_qty = item.received_quantity or 0
                if received_qty < item.qty:
                    current_all_items_received = 0
                    break
                
            frappe.db.set_value("RUA LPO", self.name, "all_items_received", current_all_items_received)
            frappe.db.commit()


    def on_trash(self):
        self.publish_update()

    def after_insert(self):
        self.publish_update()

    def validate(self):
        self.total_items = len(self.items)
        self.total_amount = self.vat_amount = self.grand_total = 0
        
        for item in self.items:
            self.total_amount += flt(item.total_amount)
            self.vat_amount += flt(item.vat_amount)
            self.grand_total += flt(item.grand_total)