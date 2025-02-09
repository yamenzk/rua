import frappe
from frappe.model.document import Document
import rua
from rua.install.after_migrate import reconcile_single_project_financials

class RUAPayment(Document):

    def publish_update(self):
        rua.refetch_resource("rua:payment")
        rua.refetch_resource("rua:invoice")
        rua.refetch_resource("rua:project")

    def on_trash(self):
        # Reconcile project before deletion if project exists
        if self.project:
            reconcile_single_project_financials(self.project)
        self.publish_update()

    def after_insert(self):
        if self.project:
            reconcile_single_project_financials(self.project)
        self.publish_update()
    
    def on_update(self):
        # Reconcile project after saving if project exists
        if self.project:
            reconcile_single_project_financials(self.project)
        self.publish_update()