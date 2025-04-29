import frappe
from frappe.model.document import Document
import rua  # Assuming rua/__init__.py has refetch_resource
from frappe.utils import flt

# Import the specific reconciliation function
from rua.install.after_migrate import reconcile_single_project_financials


class RUALPO(Document):

    def publish_update(self):
        rua.refetch_resource("rua:lpo")
        rua.refetch_resource("rua:project")  # Project cost might change

    def validate(self):
        """Calculate totals before saving."""
        self.total_items = len(self.items or [])
        self.total_amount = self.vat_amount = self.grand_total = 0

        for item in self.items:
            # Ensure calculations use flt for safety
            item.total_amount = flt(item.qty) * flt(item.unit_price)
            item.vat_amount = flt(item.total_amount) * 0.05
            item.grand_total = flt(item.total_amount) + flt(item.vat_amount)

            # Accumulate totals for the LPO header
            self.total_amount += flt(item.total_amount)
            self.vat_amount += flt(item.vat_amount)
            self.grand_total += flt(item.grand_total)

        # Validate mandatory project link if status requires it
        if self.status != "Draft" and not self.project:
            frappe.throw("Project is mandatory for non-Draft LPOs.")

    def on_update(self):
        """Handles actions after the LPO document is saved."""
        project_changed = self.is_new() or self.has_value_changed("project")
        status_changed = self.has_value_changed("status")
        amount_changed = self.has_value_changed("grand_total")
        if self.get_doc_before_save():
            old_status = self.get_doc_before_save().status 
        project_to_reconcile = self.project

        # Determine if reconciliation is needed
        needs_reconciliation = False
        if self.project:
            # Reconcile if status becomes Final or is Cancelled from Final
            if status_changed and (
                self.status == "Final"
                or (self.status == "Cancelled" and old_status == "Final")
            ):
                needs_reconciliation = True
            # Reconcile if amount changes while already Final
            elif amount_changed and self.status == "Final":
                needs_reconciliation = True
            # Reconcile if project link is added/changed and status is Final
            elif project_changed and self.status == "Final":
                needs_reconciliation = True
                # If project was changed, also reconcile the *old* project
                old_project = (
                    self.get_doc_before_save().project if not self.is_new() else None
                )
                if old_project and old_project != self.project:
                    reconcile_single_project_financials(old_project)

        # Update 'all_items_received' flag (independent of reconciliation)
        if self.status != "Draft" and self.status != "Cancelled":
            current_all_items_received = 1
            for item in self.items:
                received_qty = flt(item.received_quantity)  # Use flt for comparison
                if received_qty < flt(item.qty):
                    current_all_items_received = 0
                    break
            # Use db_set for efficiency if only this field changes often
            if self.all_items_received != current_all_items_received:
                frappe.db.set_value(
                    "RUA LPO",
                    self.name,
                    "all_items_received",
                    current_all_items_received,
                    update_modified=False,
                )
                # frappe.db.commit() # Avoid commit in hooks if possible

        # Trigger reconciliation if needed
        if needs_reconciliation and project_to_reconcile:
            reconcile_single_project_financials(project_to_reconcile)

        # Publish updates after potential reconciliation
        self.publish_update()

    def on_trash(self):
        """Handles actions before the LPO document is permanently deleted."""
        project_to_reconcile = self.project
        status_before_trash = self.status

        # Reconcile the project if the deleted LPO was 'Final'
        if project_to_reconcile and status_before_trash == "Final":
            frappe.enqueue(
                reconcile_single_project_financials, project_name=project_to_reconcile
            )
            # Or call directly if safe in your environment:
            # reconcile_single_project_financials(project_to_reconcile)

        self.publish_update()

    def after_insert(self):
        """Handles actions after a new LPO document is first saved."""
        # Reconcile if the LPO is created directly in 'Final' status (unlikely but possible)
        if self.project and self.status == "Final":
            reconcile_single_project_financials(self.project)

        self.publish_update()
