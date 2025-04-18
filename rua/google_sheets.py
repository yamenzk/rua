import frappe
import os
import json
from frappe import _
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import time

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

