import frappe
import json
from frappe.model.document import Document
import rua
from rua import ChatMessageHandler



class RUAQuotation(Document):
    STATUS_HANDLERS = {
        "Submitted": {
            "type": "Info",
            "message": lambda doc: f"@{doc.owner} has updated Quotation #{doc.name} status to {doc.status}."
        },
        "Final": {
            "type": "Success",
            "timeline": 1,
            "message": lambda doc: (
                f"@{doc.owner} has finalized Quotation #{doc.name} "
                f"with {doc.total_items} items and a grand total of AED {doc.grand_total:,.2f}. "
                f'["View Signed Quotation","{doc.signed_document}"]'
            )
        },
        "Cancelled": {
            "type": "Danger",
            "message": lambda doc: (
                f"@{doc.owner} has cancelled Quotation #{doc.name} "
                f"for {doc.party}. Reason: {doc.reject_reason}"
            )
        }
    }

    def publish_update(self):
        rua.refetch_resource("rua:quotation")

    def on_update(self):
        self.publish_update()
        if self.has_value_changed('status') and self.status != "Draft":
            ChatMessageHandler(self).handle_status_update(self.STATUS_HANDLERS)

    def on_trash(self):
        self.publish_update()

    def after_insert(self):
        self.publish_update()
        
        # Only create insert message if not Draft
        if self.status != "Draft":
            ChatMessageHandler(self).handle_insert(
                lambda doc: f"@{doc.owner} has created Quotation #{doc.name} for {doc.party}"
            )

    def before_insert(self):
        if not self.project:
            frappe.throw("Project is required")
        project = frappe.get_doc('RUA Project', self.project)

        try:
            locked = json.loads(project.locked) if isinstance(
                project.locked, str) else project.locked
            if not locked or locked == {} or locked == []:
                frappe.throw("Items are not locked")

            # Get the rows data from the locked JSON
            rows = locked.get('data', {}).get('rows', [])
            if not rows:
                frappe.throw("No items found in locked data")

            # Initialize summary values
            total_amount = 0
            total_vat = 0
            total_grand = 0

            # Process each row and add to items child table
            for row in rows:
                # Helper function to clean currency values
                def clean_currency(value):
                    if isinstance(value, str):
                        # Remove currency symbol and commas, then convert to float
                        return float(value.replace('AED', '').replace(',', '').strip())
                    return float(value)

                # Helper function to clean and format unit values
                def clean_unit_value(value):
                    if not value:  # Handle empty values
                        return ""
                    if isinstance(value, str):
                        # Split into numeric value and unit
                        parts = value.split()
                        if len(parts) >= 2:
                            num = float(parts[0].replace(',', ''))
                            unit = parts[1]
                            # Return formatted string with value and unit
                            return f"{num} {unit}"
                        return ""  # Return empty string if format is invalid
                    return str(value) if value else ""

                # Create new item row with basic required fields
                item = {
                    'item_name': row['Item Name'],
                    'description': row['Description'],
                    'qty': int(row['Qty']),
                    'width': clean_unit_value(row.get('Width', '')),
                    'height': clean_unit_value(row.get('Height', '')),
                    'amount': clean_currency(row['Amount']),
                    'total': clean_currency(row['Total']),
                    'vat_amount': clean_currency(row['Vat Amount']),
                    'grand_total': clean_currency(row['Grand Total'])
                }

                # Only add area if it exists in the row
                if 'Area' in row and row['Area']:
                    item['area'] = clean_unit_value(row['Area'])

                # Add to summary totals
                total_amount += clean_currency(row['Total'])
                total_vat += clean_currency(row['Vat Amount'])
                total_grand += clean_currency(row['Grand Total'])

                # Append the item to the child table
                self.append('items', item)

            # Set document summary fields
            self.total_items = len(rows)
            self.total = total_amount
            self.vat_amount = total_vat
            self.grand_total = total_grand

        except json.JSONDecodeError:
            frappe.throw("Invalid JSON format in locked data")
        except KeyError as e:
            frappe.throw(f"Missing required field in locked data: {str(e)}")
        except Exception as e:
            frappe.throw(f"Error processing locked items: {str(e)}")