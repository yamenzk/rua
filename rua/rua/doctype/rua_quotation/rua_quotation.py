import frappe
import json
from frappe.model.document import Document
import rua


class RUAQuotation(Document):
    def publish_update(self):
        rua.refetch_resource("rua:quotation")

    def on_trash(self):
        self.publish_update()

    def after_insert(self):
        self.publish_update()

    def after_save(self):
        self.publish_update()

    def before_insert(self):
        if not self.project:
            frappe.throw(_("Project is required"))

        project = frappe.get_doc("RUA Project", self.project)

        if not project.locked:
            frappe.throw(_("Project items must be locked before creating a Quotation."))

        try:
            locked_data = json.loads(project.locked)
            rows = locked_data.get("data", {}).get("rows", [])

            if not rows:
                frappe.throw(_("No items found in the locked project data."))

            self.items = []  # Clear existing items
            total_amount = 0.0
            total_vat = 0.0
            total_grand = 0.0

            # Data in 'rows' is assumed to be cleaned/validated by the locking process
            for idx, row_data in enumerate(rows):
                # Update required_keys if UOM is mandatory from the sheet
                required_keys = [
                    "Item Name",
                    "Description",
                    "Qty",
                    "Amount",
                    "Total",
                    "Vat Amount",
                    "Grand Total",
                ]
                if not all(k in row_data for k in required_keys):
                    missing = [k for k in required_keys if k not in row_data]
                    frappe.log_error(
                        f"Locked data for project {self.project} row index {idx} is missing keys: {missing}. Row data: {row_data}",
                        "Quotation Creation",
                    )
                    frappe.throw(
                        _(
                            "Locked data is incomplete (missing: {0}). Please unlock and re-lock the project items."
                        ).format(", ".join(missing))
                    )

                item = {
                    "item_name": row_data["Item Name"],
                    "description": row_data["Description"],
                    "qty": row_data["Qty"],
                    "amount": row_data["Amount"],
                    "total": row_data["Total"],
                    "vat_amount": row_data["Vat Amount"],
                    "grand_total": row_data["Grand Total"],
                    "uom": row_data.get(
                        "UOM", ""
                    ), 
                    "width": row_data.get("Width", ""),
                    "height": row_data.get("Height", ""),
                    "area": row_data.get("Area", ""),
                }
                self.append(
                    "items", item
                ) 

                # Accumulate totals directly from the reliable locked data
                total_amount += item["total"]  # Make sure 'total' in item is numeric
                total_vat += item[
                    "vat_amount"
                ]  # Make sure 'vat_amount' in item is numeric
                total_grand += item[
                    "grand_total"
                ]  # Make sure 'grand_total' in item is numeric

            # Set document summary fields
            self.total_items = len(rows)
            self.total = total_amount
            self.vat_amount = total_vat
            self.grand_total = total_grand

        except json.JSONDecodeError:
            frappe.log_error(
                f"Invalid JSON in locked field for Project {self.project}",
                "Quotation Creation",
            )
            frappe.throw(
                _("Locked project data is corrupted. Please unlock and re-lock.")
            )
        except Exception as e:
            frappe.log_error(
                frappe.get_traceback(), "Quotation Creation from Locked Data Failed"
            )
            frappe.throw(
                _("Error processing locked items for Quotation: {0}").format(str(e))
            )
