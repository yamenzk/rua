import frappe
import rua
from frappe import _
from frappe.model.document import Document
from frappe.utils import flt
from rua.google_sheets import get_sheet_data, create_sheet_from_template
import json
import re

DEFAULT_EXTRACTION_NAMED_RANGE = "QuotationData"


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
            self.completion = flt(self.total_received) / flt(self.contract_value) * 100

    @frappe.whitelist()
    def ensure_google_sheet_setup(self):
        """
        Checks if Google Sheet is configured. If not, creates one from template
        and updates the document fields. Returns sheet ID and if update occurred.
        """
        doc_updated = False
        # Use self.reload() to ensure we have the latest doc state? Maybe not needed if called from frontend.
        # self.reload()

        if not self.google_sheet_id:
            frappe.msgprint(
                _("Google Sheet not found for this project. Creating a new one..."),
                indicator="blue",
                alert=True,
            )
            try:
                template_id = frappe.db.get_single_value(
                    "RUA Company", "google_sheet_template_id"
                )
                # Check if template_id is set in site_config.json
                if not template_id:
                    frappe.throw(
                        _(
                            "Google Sheets Template ID is not configured in RUA Company"
                        )
                    )

                # Generate a name for the new sheet
                new_sheet_name = (
                    f"Project Items - {self.name}"  # Or use another naming convention
                )

                # Create the sheet by copying the template
                new_sheet_id = create_sheet_from_template(template_id, new_sheet_name)

                # Update the Frappe document immediately using frappe.db.set_value
                # This avoids needing to save the whole document object here
                frappe.db.set_value(
                    self.doctype,
                    self.name,
                    {
                        "google_sheet_id": new_sheet_id,
                        "extraction_named_range": DEFAULT_EXTRACTION_NAMED_RANGE,  # Set the default range name
                    },
                )
                frappe.db.commit()  # Commit db changes

                # Update the current object instance in memory
                self.google_sheet_id = new_sheet_id
                self.extraction_named_range = DEFAULT_EXTRACTION_NAMED_RANGE
                doc_updated = True

                frappe.msgprint(
                    _("Successfully created and linked Google Sheet '{0}'.").format(
                        new_sheet_name
                    ),
                    indicator="green",
                    alert=True,
                )

            except Exception as e:
                # Log the full error but show a simpler message to the user
                frappe.log_error(
                    frappe.get_traceback(), "Auto Google Sheet Creation Failed"
                )
                frappe.throw(
                    _(
                        "Failed to automatically create Google Sheet: {0}. Please check configuration and permissions."
                    ).format(str(e))
                )

        # Even if sheet existed, ensure default named range is set if empty
        elif not self.extraction_named_range:
            try:
                frappe.db.set_value(
                    self.doctype,
                    self.name,
                    "extraction_named_range",
                    DEFAULT_EXTRACTION_NAMED_RANGE,
                )
                frappe.db.commit()
                self.extraction_named_range = DEFAULT_EXTRACTION_NAMED_RANGE
                doc_updated = True
                frappe.msgprint(
                    _(
                        "Default extraction named range '{0}' set for the project."
                    ).format(DEFAULT_EXTRACTION_NAMED_RANGE),
                    indicator="info",
                    alert=True,
                )
            except Exception as e:
                frappe.log_error(
                    frappe.get_traceback(), "Setting Default Named Range Failed"
                )
                # Non-critical error, maybe just log it
                frappe.msgprint(
                    _("Could not set the default named range: {0}").format(str(e)),
                    indicator="orange",
                )

        return {
            "sheet_id": self.google_sheet_id,
            "named_range": self.extraction_named_range,
            "doc_updated": doc_updated,  # Signal to frontend if changes were made
        }

    @frappe.whitelist()
    def get_google_sheet_url(self):
        """Returns the embeddable URL for the Google Sheet."""
        if not self.google_sheet_id:
            frappe.throw(_("Google Sheet ID is not set for this project."))
        # rm=minimal hides most Sheets UI for cleaner embedding
        # usp=sharing is generally needed for embedding edit links
        return f"https://docs.google.com/spreadsheets/d/{self.google_sheet_id}/edit?usp=sharing"

    @frappe.whitelist()
    def set_lock_status(self, lock):
        """Locks or unlocks the project items based on Google Sheet data from a Named Range."""
        # ... (initial checks for sheet_id, extraction_named_range remain the same) ...
        if not self.google_sheet_id:
            frappe.throw(_("Google Sheet ID is not set for this project."))
        if not self.extraction_named_range:
            frappe.throw(
                _(
                    "The 'Extraction Named Range' must be set in the Project before locking."
                )
            )

        target_named_range = self.extraction_named_range.strip()

        if lock:
            # --- LOCKING ---
            try:
                sheet_values = get_sheet_data(self.google_sheet_id, target_named_range)

                if not sheet_values or len(sheet_values) < 1:
                    frappe.throw(
                        _(
                            "No data found in Google Sheet for Named Range '{0}'. Cannot lock."
                        ).format(target_named_range)
                    )

                # --- Flexible Header Processing ---
                raw_sheet_headers = [str(h).strip() for h in sheet_values[0]]
                raw_rows = sheet_values[1:]

                header_details = (
                    {}
                )  # Stores { base_name: { original: "...", index: ... } }

                def get_base_header(header_text):
                    return re.sub(r"\s*\[.*?\]$", "", header_text).strip()

                # --- NEW: Function to extract unit from header ---
                def get_unit_from_header(header_text):
                    match = re.search(r"\[(.*?)\]$", header_text)
                    return match.group(1).strip() if match else None

                for i, raw_header in enumerate(raw_sheet_headers):
                    base_name = get_base_header(raw_header)
                    unit = get_unit_from_header(raw_header)  # Extract unit
                    if base_name:
                        header_details[base_name] = {
                            "original": raw_header,
                            "index": i,
                            "unit": unit,
                        }  # Store unit
                # --- End Flexible Header Processing ---

                # --- Data Cleaning/Formatting Functions ---
                def clean_currency(value):
                    # ... (implementation as before) ...
                    if value is None or value == "":
                        return 0.0
                    if isinstance(value, (int, float)):
                        return float(value)
                    if isinstance(value, str):
                        cleaned = value.replace("AED", "").replace(",", "").strip()
                        try:
                            return float(cleaned) if cleaned else 0.0
                        except ValueError:
                            return 0.0
                    return 0.0

                # --- MODIFIED: Function to clean value and append unit ---
                def clean_and_append_unit(raw_value, unit):
                    if raw_value is None or str(raw_value).strip() == "":
                        return ""  # Return empty string for empty cells

                    cleaned_value = str(raw_value).strip()

                    # Optional: Try to format as number first if desired, then back to string
                    # try:
                    #    numeric_value = float(cleaned_value.replace(",", ""))
                    #    cleaned_value = f"{numeric_value:g}" # Format number nicely
                    # except ValueError:
                    #    pass # Keep original string if not numeric

                    if unit:
                        return f"{cleaned_value} {unit}"  # Append unit with a space
                    else:
                        return cleaned_value  # Return cleaned value if no unit

                def parse_int_qty(value):
                    # ... (implementation as before) ...
                    if value is None or value == "":
                        return 0
                    if isinstance(value, int):
                        return value
                    if isinstance(value, float):
                        return int(value)
                    if isinstance(value, str):
                        try:
                            return int(float(str(value).replace(",", "").strip()))
                        except (ValueError, TypeError):
                            return 0
                    return 0

                # --- End Data Cleaning ---

                extracted_rows = []
                # Define headers using BASE names
                required_base_headers = [
                    "Item Name",
                    "Description",
                    "Qty",
                    "Amount",
                    "Total",
                    "Vat Amount",
                    "Grand Total",
                ]
                optional_base_headers = ["Width", "Height", "Area"]  # Base names

                # Validate required headers using BASE names
                missing_headers = [
                    req_h
                    for req_h in required_base_headers
                    if req_h not in header_details
                ]
                if missing_headers:
                    frappe.throw(
                        _(
                            "Required base header(s) missing in Named Range '{0}': {1}"
                        ).format(target_named_range, ", ".join(missing_headers))
                    )

                # Process rows
                for idx, raw_row in enumerate(raw_rows, start=2):
                    row_dict = {}
                    padded_row = raw_row + [""] * (
                        len(raw_sheet_headers) - len(raw_row)
                    )
                    has_values = False

                    try:
                        # Process required fields using base names
                        for base_h in required_base_headers:
                            details = header_details[base_h]
                            col_idx = details["index"]
                            raw_value = padded_row[col_idx]

                            if base_h in [
                                "Amount",
                                "Total",
                                "Vat Amount",
                                "Grand Total",
                            ]:
                                cleaned_val = clean_currency(
                                    raw_value
                                )  # Keep as numbers
                            elif base_h == "Qty":
                                cleaned_val = parse_int_qty(raw_value)  # Keep as number
                            else:  # Item Name, Description
                                cleaned_val = str(raw_value).strip()  # Keep as string

                            row_dict[base_h] = cleaned_val
                            if raw_value and str(raw_value).strip():
                                has_values = True

                        # Process optional fields using base names
                        for base_h in optional_base_headers:
                            if base_h in header_details:
                                details = header_details[base_h]
                                col_idx = details["index"]
                                unit = details["unit"]  # Get the unit stored earlier
                                raw_value = padded_row[col_idx]

                                # *** Use the new cleaning function ***
                                cleaned_val = clean_and_append_unit(raw_value, unit)

                                # Store using the BASE header name as the key
                                row_dict[base_h] = (
                                    cleaned_val  # e.g., {"Width": "12 m"}
                                )
                                if raw_value and str(raw_value).strip():
                                    has_values = True

                        # Add row if it seems valid
                        if has_values and (
                            row_dict.get("Item Name") or row_dict.get("Description")
                        ):
                            extracted_rows.append(row_dict)

                    except Exception as row_err:
                        frappe.log_warning(
                            f"Skipping row {idx} due to error during processing: {row_err}",
                            "Project Locking",
                        )

                if not extracted_rows:
                    frappe.throw(
                        _(
                            "No valid item rows could be processed from Named Range '{0}'."
                        ).format(target_named_range)
                    )

                # Store the extracted data
                lock_data = {
                    "user": frappe.session.user,
                    "timestamp": frappe.utils.now_datetime().isoformat(),
                    "data": {
                        "rows": extracted_rows
                    },  # Rows now contain strings like "12 m" for Width/Height/Area
                    "source_named_range": target_named_range,
                }

                self.db_set("locked", json.dumps(lock_data))
                self.notify_update()
                return {
                    "status": "success",
                    "message": _(
                        "Items locked successfully from Named Range '{0}'."
                    ).format(target_named_range),
                }

            except Exception as e:
                frappe.log_error(frappe.get_traceback(), "Project Locking Failed")
                frappe.throw(_("Failed to lock items: {0}").format(str(e)))

        else:
            # --- UNLOCKING --- (Logic remains the same)
            if not self.locked:
                return {"status": "noop", "message": _("Items are already unlocked.")}
            try:
                locked_info = json.loads(self.locked)
                # Authorization check (allow System Manager or user with write perm)
                if locked_info.get(
                    "user"
                ) != frappe.session.user and not frappe.has_permission(
                    "RUA Project", "write", self.name
                ):
                    frappe.throw(
                        _(
                            "Only user '{0}' or users with write permission can unlock."
                        ).format(locked_info.get("user"))
                    )

                self.db_set("locked", "")  # Clear the lock
                self.notify_update()
                return {
                    "status": "success",
                    "message": _("Items unlocked successfully."),
                }
            except Exception as e:
                frappe.log_error(frappe.get_traceback(), "Project Unlocking Failed")
                frappe.throw(_("Failed to unlock items: {0}").format(str(e)))
