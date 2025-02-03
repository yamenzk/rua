import frappe
import rua
from frappe.model.document import Document
from frappe.utils import flt



class RUAProject(Document):


    def publish_update(self):
        rua.refetch_resource("rua:project")

    def on_update(self):
        self.publish_update()

    def on_trash(self):
        self.publish_update()

    def after_insert(self):
        self.publish_update()

    def validate(self):
        if self.has_value_changed('status') and self.status == 'In Progress' and self.serial_number == 0 and not self.is_child:
            projects = frappe.get_list('RUA Project', fields=['serial_number'], order_by='serial_number desc', limit=1)
            highest_serial = projects[0].serial_number if projects else 0
            self.serial_number = highest_serial + 1

    def before_save(self):
        if self.contract_value and flt(self.contract_value) > 0:
            self.completion = flt(self.total_invoiced) / flt(self.contract_value) * 100
