import frappe
import rua
from frappe.model.document import Document
from rua import ChatMessageHandler


class RUAProject(Document):
    STATUS_HANDLERS = {
        "Job in Hand": {
            "type": "Success",
            "message": lambda doc: (
                f"@{doc.owner} has won Project #{doc.name} in {doc.location}!"
            )
        },
        "In Progress": {
            "type": "Info",
            "timeline": 1,
            "message": lambda doc: (
                f"Project #{doc.name} (#{doc.serial_number}) has started in {doc.location}"
            )
        },
        "Completed": {
            "type": "Success",
            "timeline": 1,
            "message": lambda doc: (
                f"Project #{doc.name} (#{doc.serial_number}) in {doc.location} has been completed. "
                f"Total Invoiced: AED {doc.total_invoiced:,.2f}, "
                f"Total Received: AED {doc.total_received:,.2f}, "
                f"Project Cost: AED {doc.project_cost:,.2f}"
            )
        },
        "Cancelled": {
            "type": "Danger",
            "message": lambda doc: f"Project #{doc.name} in {doc.location} has been cancelled"
        }
    }

    def publish_update(self):
        rua.refetch_resource("rua:project")

    def on_update(self):
        self.publish_update()

        if self.has_value_changed('status'):
            if self.status != "Tender":  # Don't create messages for Tender status
                ChatMessageHandler(self).handle_status_update(
                    self.STATUS_HANDLERS)

    def on_trash(self):
        self.publish_update()

    def after_insert(self):
        self.publish_update()

        if self.status != "Tender":  # Only create insert message if not Tender
            ChatMessageHandler(self).handle_insert(
                lambda doc: f"@{doc.owner} has created Project #{doc.name} in {doc.location}"
            )

    def validate(self):
        if self.has_value_changed('status') and self.status == 'In Progress' and self.serial_number == 0:
            projects = frappe.get_list('RUA Project', fields=['serial_number'], order_by='serial_number desc', limit=1)
            highest_serial = projects[0].serial_number if projects else 0
            self.serial_number = highest_serial + 1

    def before_save(self):
        if self.total_invoiced and self.contract_value and self.contract_value > 0 and self.total_invoiced > 0:
            self.completion = self.total_invoiced / self.contract_value * 100
