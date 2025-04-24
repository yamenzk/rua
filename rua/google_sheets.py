import frappe
import os
import json
from frappe import _
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import time
from datetime import datetime

# Define the scope: Read/write access to sheets and drive
SHEET_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
DRIVE_SCOPES = [
    "https://www.googleapis.com/auth/drive"
]  # Needed for copy and permissions
ALL_SCOPES = list(set(SHEET_SCOPES + DRIVE_SCOPES))

# --- Cached Service ---
_sheets_service = None
_drive_service = None


def get_service_account_file_path():
    """Gets the absolute path to the service account file uploaded in RUA Company doctype."""
    # Get the file path from the doctype
    # Assuming "RUA Company" is a Single Doctype
    company = frappe.get_doc("RUA Company", "RUA Company")
    if not company.service_account:
        frappe.throw(_("Service account file not uploaded in RUA Company settings."))

    # Get the file path from the file attachment
    file_doc = frappe.get_doc("File", {"file_url": company.service_account})
    if not file_doc:
        frappe.throw(
            _("Service account file document not found for URL: {0}").format(
                company.service_account
            )
        )

    return file_doc.get_full_path()


def get_credentials(scopes=ALL_SCOPES):  # Default to all needed scopes
    """Loads credentials from the service account file for the specified scopes."""
    key_file_path = get_service_account_file_path()
    if not os.path.exists(key_file_path):
        frappe.throw(
            _("Google Service Account key file not found at: {0}").format(key_file_path)
        )
    try:
        creds = service_account.Credentials.from_service_account_file(
            key_file_path, scopes=scopes
        )
        return creds
    except Exception as e:
        frappe.log_error(
            f"Failed to load Google credentials with scopes {scopes}: {e}",
            "Google Sheets Integration",
        )
        raise frappe.ValidationError(
            _("Failed to load Google credentials: {0}").format(e)
        )


def get_sheets_service(use_cache=True):
    """Returns an authenticated Google Sheets service instance (cached)."""
    global _sheets_service
    if use_cache and _sheets_service is not None:
        return _sheets_service
    try:
        creds = get_credentials(scopes=SHEET_SCOPES)  # Use only sheet scopes here
        service = build("sheets", "v4", credentials=creds, cache_discovery=False)
        if use_cache:
            _sheets_service = service
        return service
    except Exception as e:
        frappe.log_error(
            f"Failed to build Google Sheets service: {e}", "Google Sheets Integration"
        )
        raise frappe.ValidationError(
            _("Failed to build Google Sheets service: {0}").format(e)
        )


def get_drive_service(use_cache=True):
    """Returns an authenticated Google Drive service instance (cached)."""
    global _drive_service
    if use_cache and _drive_service is not None:
        return _drive_service
    try:
        # Ensure Drive scopes are requested when getting credentials for Drive service
        creds = get_credentials(scopes=DRIVE_SCOPES)
        service = build("drive", "v3", credentials=creds, cache_discovery=False)
        if use_cache:
            _drive_service = service
        return service
    except Exception as e:
        frappe.log_error(
            f"Failed to build Google Drive service: {e}", "Google Sheets Integration"
        )
        raise frappe.ValidationError(
            _("Failed to build Google Drive service: {0}").format(e)
        )


def get_sheet_data(spreadsheet_id, range_name):
    """Fetches data from a specific range (A1 or Named Range) in a Google Sheet."""
    if not spreadsheet_id:
        raise ValueError("spreadsheet_id cannot be empty")
    if not range_name:
        raise ValueError("range_name cannot be empty")

    try:
        service = get_sheets_service()
        result = (
            service.spreadsheets()
            .values()
            .get(spreadsheetId=spreadsheet_id, range=range_name)
            .execute()
        )
        values = result.get("values", [])
        return values
    except HttpError as e:
        # More specific error handling for common issues
        status_code = e.resp.status
        try:
            error_details = json.loads(e.content).get("error", {})
            error_message = error_details.get("message", str(e))
        except:
            error_message = str(e)  # Fallback if content parsing fails

        if status_code == 400 and "Unable to parse range" in error_message:
            frappe.throw(
                _(
                    "Named Range '{0}' not found or invalid in Google Sheet ID '{1}'. Please check the range name and definition."
                ).format(range_name, spreadsheet_id),
                title=_("Invalid Range"),
            )
        elif status_code == 403:
            # Try getting service account email safely
            sa_email = "N/A"
            try:
                sa_email = get_credentials().service_account_email
            except Exception:
                pass  # Ignore error if getting credentials fails here

            frappe.throw(
                _(
                    "Permission denied for Google Sheet ID '{0}'. Ensure the service account '{1}' has Editor access to the sheet."
                ).format(spreadsheet_id, sa_email),
                title=_("Permission Denied"),
            )
        elif status_code == 404:
            frappe.throw(
                _("Google Sheet ID '{0}' not found. Please check the ID.").format(
                    spreadsheet_id
                ),
                title=_("Sheet Not Found"),
            )
        else:
            frappe.log_error(
                f"Google Sheets API Error ({status_code}) getting data: {error_message}",
                "Google Sheets Integration",
            )
            frappe.throw(
                _(
                    "Could not fetch data from Google Sheet (ID: {0}, Range: {1}): {2}"
                ).format(spreadsheet_id, range_name, error_message),
                title=_("API Error"),
            )
    except Exception as e:
        frappe.log_error(
            f"Failed to get sheet data for {spreadsheet_id} range {range_name}: {e}",
            "Google Sheets Integration",
        )
        frappe.throw(_("Could not fetch data from Google Sheet: {0}").format(e))


def create_sheet_from_template(template_sheet_id, new_sheet_name):
    """
    Copies a template Google Sheet, shares it with accounts listed in RUA Company,
    and returns the new sheet ID.
    """
    if not template_sheet_id:
        raise ValueError("Template Google Sheet ID is required.")
    if not new_sheet_name:
        new_sheet_name = "New Project Sheet"  # Default name

    drive_service = None  # Initialize drive_service
    new_sheet_id = None

    try:
        drive_service = get_drive_service()  # Get drive service instance
        copied_file_metadata = {"name": new_sheet_name}

        new_file = (
            drive_service.files()
            .copy(
                fileId=template_sheet_id,
                body=copied_file_metadata,
                fields="id, name, webViewLink",  # Request fields we might need
            )
            .execute()
        )

        new_sheet_id = new_file.get("id")
        if not new_sheet_id:
            raise Exception("Failed to get ID from the newly copied sheet.")

        # --- BEGIN: Share with accounts from RUA Company ---
        try:
            rua_company_doc = frappe.get_doc("RUA Company", "RUA Company")
            google_accounts_table = rua_company_doc.get(
                "google_accounts"
            )  # Get child table

            if not google_accounts_table:
                frappe.log_error(
                    "No Google accounts found in RUA Company settings to share with.",
                    "Google Sheets Integration",
                )
            else:
                for account_row in google_accounts_table:
                    user_email = account_row.get(
                        "google_account"
                    )  # Get email from field 'google_account'

                    if user_email and "@" in user_email:  # Basic validation
                        try:
                            permission_body = {
                                "type": "user",
                                "role": "writer",  # Grant editor access
                                "emailAddress": user_email,
                            }
                            drive_service.permissions().create(
                                fileId=new_sheet_id,
                                body=permission_body,
                                sendNotificationEmail=False,
                            ).execute()
                            time.sleep(
                                0.5
                            )  # Small delay to avoid hitting rate limits rapidly

                        except HttpError as perm_error:
                            # Log specific permission errors but continue with others
                            error_content = "N/A"
                            try:
                                error_content = perm_error.content.decode()
                            except:
                                pass
                            frappe.log_error(
                                f"Google API Error sharing sheet {new_sheet_id} with {user_email}: {perm_error.resp.status} - {error_content}",
                                "Google Sheets Sharing Error",
                            )
                        except Exception as perm_e:
                            # Log other errors during permission setting
                            frappe.log_error(
                                f"Failed to share sheet {new_sheet_id} with {user_email}: {perm_e}",
                                "Google Sheets Sharing Error",
                            )
                    else:
                        frappe.log_warning(
                            f"Skipping invalid or empty email in RUA Company google_accounts: {user_email}",
                            "Google Sheets Integration",
                        )

        except Exception as share_e:
            # Log error if fetching RUA Company or iterating fails, but don't stop sheet creation
            frappe.log_error(
                f"Error during sharing process for sheet {new_sheet_id}: {share_e}",
                "Google Sheets Sharing Error",
            )
            frappe.msgprint(
                _(
                    "Sheet created, but failed to process sharing permissions from RUA Company settings. Please check logs."
                )
            )

        # --- END: Share with accounts from RUA Company ---

        return new_sheet_id  # Return the ID even if some sharing failed (errors are logged)

    except HttpError as e:
        status_code = e.resp.status
        try:
            error_details = json.loads(e.content).get("error", {})
            error_message = error_details.get("message", str(e))
        except:
            error_message = str(e)

        if status_code == 404:
            frappe.throw(
                _(
                    "Google Sheet Template ID '{0}' not found. Check RUA Company settings and template sharing."
                ).format(template_sheet_id),
                title=_("Template Not Found"),
            )
        elif status_code == 403:
            # Try getting service account email safely
            sa_email = "N/A"
            try:
                sa_email = get_credentials().service_account_email
            except Exception:
                pass
            frappe.throw(
                _(
                    "Permission denied when copying template '{0}'. Ensure service account '{1}' has Editor access to the template."
                ).format(template_sheet_id, sa_email),
                title=_("Permission Denied"),
            )
        else:
            frappe.log_error(
                f"Google Drive API Error ({status_code}) copying template {template_sheet_id}: {error_message}",
                "Google Sheets Integration",
            )
            frappe.throw(
                _("Could not copy Google Sheet from template: {0}").format(
                    error_message
                ),
                title=_("API Error"),
            )
    except Exception as e:
        # Catch other potential errors during copy or getting ID
        frappe.log_error(
            f"Failed to copy Google Sheet template {template_sheet_id}: {e}",
            "Google Sheets Integration",
        )
        # Include traceback in log for debugging
        frappe.log_error(frappe.get_traceback(), "Google Sheets Integration")
        frappe.throw(_("Could not create Google Sheet from template: {0}").format(e))


@frappe.whitelist()
def generate_invoice_google_sheet(invoice_name):
    """
    Generates a Google Sheet for an RUA Invoice by copying a template,
    populating specific cells with invoice, party, and project summary data,
    sharing it, and saving the link back to the invoice.
    """
    if not invoice_name:
        frappe.throw(_("Invoice Name is required."))

    new_sheet_id = None  # Initialize in case of early exit in try block

    try:
        # 1. Get Documents and Template ID
        invoice_doc = frappe.get_doc("RUA Invoice", invoice_name)
        party_doc = frappe.get_doc("RUA Party", invoice_doc.party)
        company_doc = frappe.get_doc("RUA Company", "RUA Company")
        template_sheet_id = company_doc.google_sheet_invoice_template_id

        if not template_sheet_id:
            frappe.throw(
                _("Invoice Google Sheet Template ID not set in RUA Company settings.")
            )

        # --- 2. Calculate Project Summary (Similar to Print Format Jinja) ---
        contract_value = (
            frappe.db.get_value("RUA Project", invoice_doc.project, "contract_value")
            or 0
        )
        vat_rate = 0.05  # Assuming 5% VAT rate
        vat_amount = contract_value * vat_rate
        total_contract_value = contract_value + vat_amount

        # Get all final invoices for the project/party
        final_invoices = frappe.get_all(
            "RUA Invoice",
            filters={
                "project": invoice_doc.project,
                "party": invoice_doc.party,
                "status": "Final",
            },
            fields=["name", "grand_total"],
        )
        total_invoiced = sum(inv.get("grand_total", 0) for inv in final_invoices)

        # Get all submitted payments for the project/party
        submitted_payments = frappe.get_all(
            "RUA Payment",
            filters={
                "project": invoice_doc.project,
                "party": invoice_doc.party,
                "status": "Submitted",
            },
            fields=["name", "amount"],
        )
        total_paid = sum(pay.get("amount", 0) for pay in submitted_payments)
        # --- End Project Summary Calculation ---

        # 3. Prepare Data for Specific Cells
        # IMPORTANT: Define the target cells in your Google Sheet Template.
        # These are **examples** - you MUST adjust them to match your template layout.
        # Using different sheets ('InvoiceData', 'SummaryData') is also possible.
        data_to_populate = [
            # Invoice Data
            {"range": "Sheet1!B2", "value": invoice_doc.project},
            {"range": "Sheet1!B3", "value": invoice_doc.serial_number},
            {"range": "Sheet1!B4", "value": invoice_doc.party},
            {"range": "Sheet1!D2", "value": invoice_doc.amount},
            {
                "range": "Sheet1!D3",
                "value": invoice_doc.retention_percentage,
            },  # Value only
            {"range": "Sheet1!D4", "value": invoice_doc.amount_after_retention},
            {"range": "Sheet1!D5", "value": invoice_doc.vat_after_retention},
            {
                "range": "Sheet1!D6",
                "value": invoice_doc.grand_total,
            },  # Maybe format bold?
            # Party Data
            {"range": "Sheet1!B5", "value": party_doc.trn},
            {"range": "Sheet1!B6", "value": party_doc.emirate},
            # Party Logo (using IMAGE formula - requires public URL)
            {
                "range": "Sheet1!A1",
                "value": (
                    f'=IMAGE("{frappe.utils.get_url(party_doc.image)}")'
                    if party_doc.image
                    else ""
                ),
            },
            # Project Summary Data (Example: putting on same sheet, adjust range/sheet name)
            {"range": "Sheet1!F2", "value": contract_value},
            {"range": "Sheet1!F3", "value": vat_amount},
            {"range": "Sheet1!F4", "value": total_contract_value},
            {"range": "Sheet1!F5", "value": total_invoiced},
            {"range": "Sheet1!F6", "value": total_paid},
        ]

        # Convert to Google Sheets batchUpdate format (list of ValueRange)
        value_ranges_body = []
        for item in data_to_populate:
            # Ensure value is not None, default to empty string if needed by template
            value_to_set = item["value"] if item["value"] is not None else ""
            value_ranges_body.append(
                {
                    "range": item["range"],
                    "values": [[value_to_set]],  # Values must be list of lists
                }
            )

        batch_update_body = {
            "valueInputOption": "USER_ENTERED",  # Or 'RAW' if formulas should be treated as strings
            "data": value_ranges_body,
        }

        # 4. Copy Template and Get New Sheet ID & URL
        drive_service = get_drive_service()
        sheets_service = get_sheets_service()

        timestamp = datetime.now().strftime("%Y%m%d_%H%M")
        new_sheet_name = f"Invoice - {invoice_name} - {timestamp}"
        copied_file_metadata = {"name": new_sheet_name}

        new_file = (
            drive_service.files()
            .copy(
                fileId=template_sheet_id,
                body=copied_file_metadata,
                fields="id, webViewLink",  # Request ID and URL
            )
            .execute()
        )

        new_sheet_id = new_file.get("id")
        new_sheet_url = new_file.get("webViewLink")  # Use webViewLink for user access

        if not new_sheet_id or not new_sheet_url:
            raise Exception(
                "Failed to copy Google Sheet template or retrieve its ID/URL."
            )

        # 5. Populate the Copied Sheet with Data
        update_result = (
            sheets_service.spreadsheets()
            .values()
            .batchUpdate(spreadsheetId=new_sheet_id, body=batch_update_body)
            .execute()
        )

        # 6. Share the Sheet (Reuse logic from previous function)
        try:
            google_accounts_table = company_doc.get("google_accounts")
            if google_accounts_table:
                for account_row in google_accounts_table:
                    user_email = account_row.get("google_account")
                    if user_email and "@" in user_email:
                        try:
                            permission_body = {
                                "type": "user",
                                "role": "writer",
                                "emailAddress": user_email,
                            }
                            drive_service.permissions().create(
                                fileId=new_sheet_id,
                                body=permission_body,
                                sendNotificationEmail=False,
                            ).execute()
                            time.sleep(0.5)
                        except HttpError as perm_error:
                            error_content = (
                                perm_error.content.decode()
                                if hasattr(perm_error.content, "decode")
                                else str(perm_error.content)
                            )
                            frappe.log_error(
                                f"Sharing Error sheet {new_sheet_id} with {user_email}: {perm_error.resp.status} - {error_content}",
                                "Google Sheets Sharing",
                            )
                        except Exception as perm_e:
                            frappe.log_error(
                                f"Sharing Error sheet {new_sheet_id} with {user_email}: {perm_e}",
                                "Google Sheets Sharing",
                            )
        except Exception as share_e:
            frappe.log_error(
                f"Error during sharing process for sheet {new_sheet_id}: {share_e}",
                "Google Sheets Sharing",
            )
            # Don't fail the whole process, just log it.

        # 7. Update Invoice Doc and Save
        invoice_doc.associated_google_sheet = new_sheet_url
        invoice_doc.save()  # Use standard save - user context should have permission
        frappe.db.commit()  # Ensure save is committed before returning

        # 8. Return the URL
        return {"sheet_url": new_sheet_url}

    except HttpError as e:
        # Clean up: Delete the partially created sheet if possible
        if new_sheet_id and "drive_service" in locals():
            try:
                drive_service.files().delete(fileId=new_sheet_id).execute()
            except Exception as cleanup_e:
                frappe.log_error(
                    f"Failed to cleanup sheet {new_sheet_id} after error: {cleanup_e}",
                    "Google Sheets Invoice Gen",
                )

        status_code = e.resp.status
        error_message = str(e)
        try:
            error_details = json.loads(e.content).get("error", {})
            error_message = error_details.get("message", str(e))
        except:
            pass  # Keep original error message if parsing fails
        frappe.log_error(
            f"Google API Error ({status_code}) generating sheet for Invoice {invoice_name}: {error_message}",
            "Google Sheets Invoice Gen Error",
        )
        frappe.throw(
            _("Failed to generate Google Sheet due to API error: {0}").format(
                error_message
            ),
            title="Google API Error",
        )

    except frappe.DoesNotExistError as e:
        frappe.throw(_("Could not find required document: {0}").format(e))

    except Exception as e:
        # Clean up attempt for general errors too
        if new_sheet_id and "drive_service" in locals():
            try:
                drive_service.files().delete(fileId=new_sheet_id).execute()
            except Exception as cleanup_e:
                frappe.log_error(
                    f"Failed to cleanup sheet {new_sheet_id} after general error: {cleanup_e}",
                    "Google Sheets Invoice Gen",
                )

        frappe.log_error(
            frappe.get_traceback(),
            f"Google Sheet Invoice Generation Failed for {invoice_name}",
        )
        frappe.throw(
            _(
                "An unexpected error occurred during Google Sheet generation: {0}"
            ).format(str(e))
        )
