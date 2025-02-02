import frappe
from frappe import _
import json
import uuid
from frappe.utils import cint, flt
from frappe.model.document import Document
from frappe.utils.response import build_response
from datetime import datetime, timedelta


@frappe.whitelist()
def get_user_roles(user):
    return frappe.get_roles(user)

@frappe.whitelist(allow_guest=True)
def get_server_time(date=None, time=None, datetime=None):
    current_date = frappe.utils.getdate(frappe.utils.nowdate())
    current_time = frappe.utils.get_time(frappe.utils.nowtime())
    current_datetime = frappe.utils.now_datetime()
    if date:
        return current_date
    if time:
        return current_time
    if datetime:
        return current_datetime
    else:
        return {
            'current_date': current_date,
            'current_time': current_time,
            'current_datetime': current_datetime
        }

@frappe.whitelist()
def update_lpo_items(lpo_name, items):
    """
    Update items in RUA LPO document
    
    Args:
        lpo_name (str): Name of the LPO document
        items (list): List of item dictionaries containing:
            - item: str
            - description: str (optional)
            - area: float (for Glass type)
            - qty: float
            - unit_price: float
    """
    if not frappe.has_permission("RUA LPO", "write"):
        frappe.throw(_("Not permitted to update LPO items"))
        
    # Convert items from string to list if needed
    if isinstance(items, str):
        items = frappe.parse_json(items)
    
    try:
        doc = frappe.get_doc("RUA LPO", lpo_name)
        
        # Clear existing items
        doc.items = []
        
        # Add new items
        for item_data in items:
            item = doc.append("items", {
                "item": item_data.get("item"),
                "description": item_data.get("description"),
                "qty": flt(item_data.get("qty")),
                "unit_price": flt(item_data.get("unit_price")),
                "total_amount": flt(item_data.get("qty")) * flt(item_data.get("unit_price")),
                "vat_amount": (flt(item_data.get("qty")) * flt(item_data.get("unit_price"))) * 0.05,
                "grand_total": flt(item_data.get("qty")) * flt(item_data.get("unit_price")) * 1.05,
            })
            
            # Add area field for Glass type items
            if doc.type == "Glass" and "area" in item_data:
                item.area = flt(item_data.get("area"))
        
        # Save the document
        doc.save()
        
        frappe.db.commit()
        
        return {
            "status": "success",
            "message": "Items updated successfully"
        }
        
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error("Error updating LPO items", str(e))
        frappe.throw(_("Error updating LPO items: {0}").format(str(e)))

@frappe.whitelist()
def update_rfq_items(rfq_name, items):

    """
    Update items in RUA RFQ document
    
    Args:
        rfq_name (str): Name of the RFQ document
        items (list): List of item dictionaries containing based on type:
            Glass type:
                - item: str
                - description: str
                - width: float
                - length: float
                - area: float (computed)
                - qty: float
                - total_area: float (computed)
            Aluminum type:
                - item: str
                - qty: float
                - measurement_unit: str
                - length: float
            Material type:
                - item: str
                - description: str
                - qty: float
    """
    if not frappe.has_permission("RUA RFQ", "write"):
        frappe.throw(_("Not permitted to update RFQ items"))
        
    # Convert items from string to list if needed
    if isinstance(items, str):
        items = frappe.parse_json(items)
    
    try:
        doc = frappe.get_doc("RUA RFQ", rfq_name)
        
        # Don't allow updates for Link type RFQs
        if doc.type == "Link":
            frappe.throw(_("Cannot update items for Link type RFQ"))
            
        # Clear existing items
        doc.items = []
        
        # Add new items based on RFQ type
        for item_data in items:
            item_dict = {
                "item": item_data.get("item"),
                "qty": flt(item_data.get("qty"))
            }
            
            if doc.type == "Glass":
                # For Glass type, include width, length, and computed areas
                item_dict.update({
                    "description": item_data.get("description"),
                    "width": flt(item_data.get("width")),
                    "length": flt(item_data.get("length")),
                    "area": flt(item_data.get("area")),
                    "total_area": flt(item_data.get("total_area"))
                })
            elif doc.type == "Aluminum":
                # For Aluminum type, include measurement unit and length
                item_dict.update({
                    "measurement_unit": item_data.get("measurement_unit"),
                    "length": flt(item_data.get("length"))
                })
            elif doc.type == "Material":
                # For Material type, include description
                item_dict.update({
                    "description": item_data.get("description")
                })
                
            doc.append("items", item_dict)
        
        # Save the document
        doc.save()
        
        frappe.db.commit()
        
        return {
            "status": "success",
            "message": "Items updated successfully"
        }
        
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error("Error updating RFQ items", str(e))
        frappe.throw(_("Error updating RFQ items: {0}").format(str(e)))

@frappe.whitelist()
def update_receipt_items(receipt_name, items):
    """
    Update received quantities in RUA Purchase Receipt document
    
    Args:
        receipt_name (str): Name of the Purchase Receipt document
        items (list): List of item dictionaries containing:
            - name: str (name of the item row)
            - received_quantity: float
    """
    if not frappe.has_permission("RUA Purchase Receipt", "write"):
        frappe.throw(_("Not permitted to update receipt items"))
        
    # Convert items from string to list if needed
    if isinstance(items, str):
        items = frappe.parse_json(items)
    
    try:
        doc = frappe.get_doc("RUA Purchase Receipt", receipt_name)
        
        # Update received quantities
        for item_data in items:
            for row in doc.items:
                if row.name == item_data.get("name"):
                    row.received_quantity = flt(item_data.get("received_quantity"))
        
        # Save the document
        doc.save()
        
        frappe.db.commit()
        
        return {
            "status": "success",
            "message": "Items updated successfully"
        }
        
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error("Error updating receipt items", str(e))
        frappe.throw(_("Error updating receipt items: {0}").format(str(e)))

@frappe.whitelist()
def delete_rua_document(docname, passkey):
    """
    Find and delete all RUA module documents that have Link fields pointing to the given docname
    Args:
        docname (str): The document name to search for and delete across all RUA doctypes
    """
    system_passkey = frappe.db.get_single_value("RUA Company", "passkey")
    
    # Compare the cleaned-up passkeys
    if passkey != system_passkey:
        frappe.throw("Invalid passkey.")
        return
    
    try:
        # Begin transaction
        frappe.db.begin()
        
        # Get all doctypes from RUA module
        rua_doctypes = frappe.get_all(
            "DocType",
            filters={"module": "Rua"},
            fields=["name"]
        )
        
        if not rua_doctypes:
            frappe.throw("No RUA doctypes found.")
            return
        
        deletion_log = []
        
        # Go through each doctype
        for dt in rua_doctypes:
            doctype = dt.name
            table_name = f"tab{doctype}"
            
            # Get all link fields (including Dynamic Link, if any)
            link_fields = [
                field for field in frappe.get_meta(doctype).fields
                if field.fieldtype in ["Link", "Dynamic Link"]
            ]
            
            # Check each Link field for our docname
            for field in link_fields:
                # Get count of matching records
                query = f"""
                    SELECT COUNT(*) as count 
                    FROM `{table_name}`
                    WHERE `{field.fieldname}` = %s
                """
                count = frappe.db.sql(query, docname)[0][0]
                
                if count > 0:
                    # Delete matching records
                    delete_query = f"""
                        DELETE FROM `{table_name}`
                        WHERE `{field.fieldname}` = %s
                    """
                    frappe.db.sql(delete_query, docname)
                    
                    deletion_log.append({
                        "doctype": doctype,
                        "field": field.fieldname,
                        "count": count
                    })
                    
                    frappe.log_error(
                        f"Deleted {count} records from {table_name} where {field.fieldname} = {docname}",
                        "RUA Document Deletion Log"
                    )

        # Commit the transaction
        frappe.db.commit()

        summary = "\n".join([ 
            f"- Deleted {log['count']} records from {log['doctype']} (linked in {log['field']})"
            for log in deletion_log
        ])
        
        return {
            "status": "success",
            "message": f"Successfully deleted all linked RUA records for {docname}",
            "details": summary,
            "deletion_log": deletion_log
        }

    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(
            f"Error during RUA document deletion for {docname}: {str(e)}",
            "RUA Document Deletion Error"
        )
        frappe.throw(str(e))

@frappe.whitelist()
def get_employee_by_user(user):
    employees = frappe.get_all("RUA Employee", filters={"user": user}, limit=1)
    result = {}
    if employees:
        employee = frappe.get_doc("RUA Employee", employees[0])
        result = {
            "name": employee.name,
            "employee_name": employee.employee_name,
            "image": employee.image
        }
    # Always return a message structure
    return {"message": result}

@frappe.whitelist(allow_guest=True)
def get_issues():
    """Fetch all RUA Issues"""
    try:
        issues = frappe.get_all(
            "RUA Issue",
            fields=["name", "type", "status", "details", "creation", "modified"],
            order_by="creation desc"
        )
        return {"status": "success", "data": issues}
    except Exception as e:
        frappe.log_error("Error fetching RUA Issues", str(e))
        return {"status": "error", "message": str(e)}

@frappe.whitelist(allow_guest=True)
def mark_resolved(issue):
    """Mark an issue as resolved"""
    try:
        doc = frappe.get_doc("RUA Issue", issue)
        doc.status = "Resolved"
        doc.save(ignore_permissions=True)
        frappe.db.commit()
        return {"status": "success"}
    except Exception as e:
        frappe.log_error("Error marking issue as resolved", str(e))
        return {"status": "error", "message": str(e)}

def create_signature_user(token):
    """Create a temporary user for signature access"""
    try:
        user_email = f"signature_{token}@ruacompany.com"
        if not frappe.db.exists("User", user_email):
            user = frappe.get_doc({
                "doctype": "User",
                "email": user_email,
                "first_name": "Signature",
                "last_name": f"User {token[:8]}",
                "enabled": 1,
                "user_type": "Website User",
                "send_welcome_email": 0
            })
            user.insert(ignore_permissions=True)
            
            # Add minimal role for signature submission
            frappe.get_doc({
                "doctype": "Has Role",
                "parent": user_email,
                "parenttype": "User",
                "parentfield": "roles",
                "role": "RUA Signature User"  # Create this custom role with minimal permissions
            }).insert(ignore_permissions=True)

        return user_email
    except Exception as e:
        frappe.log_error("Failed to create signature user", e)
        return None

def generate_key(user):
    user_details = frappe.get_doc("User", user)
    api_secret = api_key = ''
    if not user_details.api_key and not user_details.api_secret:
        api_secret = frappe.generate_hash(length=15)
        api_key = frappe.generate_hash(length=15)
        user_details.api_key = api_key
        user_details.api_secret = api_secret
        user_details.save(ignore_permissions = True)
    else:
        api_secret = user_details.get_password('api_secret')
        api_key = user_details.get('api_key')
    return {"api_secret": api_secret, "api_key": api_key}


@frappe.whitelist()
def generate_signature_token(doctype, docname):
    """Generate a unique token for signature session"""
    try:
        # Generate a unique token
        token = str(uuid.uuid4())
        
        # Create temporary user and generate API keys
        user_email = create_signature_user(token)
        if not user_email:
            raise Exception("Failed to create signature user")
            
        api_keys = generate_key(user_email)
        
        # Store token in cache with doctype and docname
        cache_key = f"signature_token:{token}"
        cache_value = {
            "doctype": doctype,
            "docname": docname,
            "used": False,
            "user": user_email,
            "api_key": api_keys["api_key"]
        }
        
        # Set token in cache with 1 hour expiry
        frappe.cache().set_value(cache_key, json.dumps(cache_value), expires_in_sec=3600)
        
        return {
            "success": True,
            "token": token,
            "api_key": api_keys["api_key"],
            "api_secret": api_keys["api_secret"]
        }
    except Exception as e:
        frappe.log_error("Failed to generate signature token", e)
        return {
            "success": False,
            "message": str(e)
        }

@frappe.whitelist(allow_guest=True)
def submit_signature(doctype, docname, signature=None, token=None, passcode=None):
    """Submit signature for a document"""
    try:
        if not signature and not passcode:
            frappe.throw(_("Either signature or passcode is required"))
            
        if token:
            # Verify token
            cache_key = f"signature_token:{token}"
            cached_data = frappe.cache().get_value(cache_key)
            
            if not cached_data:
                frappe.throw(_("Invalid or expired signature token"))
                
            cached_data = json.loads(cached_data)
            if cached_data.get("used"):
                frappe.throw(_("Signature token has already been used"))
                
            if cached_data.get("doctype") != doctype or cached_data.get("docname") != docname:
                frappe.throw(_("Invalid signature token for this document"))
            
            # Get the user associated with this token
            user_email = cached_data.get("user")
                
            # Mark token as used
            cached_data["used"] = True
            frappe.cache().set_value(cache_key, json.dumps(cached_data))
        
        if passcode:
            # Verify passcode logic here
            pass
            
        # Save signature
        doc = frappe.get_doc(doctype, docname)
        
        if signature:
            # Remove the data URL prefix to get just the base64 data
            if ',' in signature:
                signature = signature.split(',')[1]
            
            # Decode base64 to binary
            import base64
            file_content = base64.b64decode(signature)
            
            # Save as file attachment
            filename = f"{docname}_signature.png"
            file_doc = frappe.get_doc({
                "doctype": "File",
                "file_name": filename,
                "content": file_content,
                "is_private": 0
            })
            file_doc.save_file(content=file_content, decode=False)
            
            # Update document with signature file URL
            doc = frappe.get_doc(doctype, docname)
            doc.signature = file_doc.file_url
            doc.save(ignore_permissions=True)
            frappe.publish_realtime(
                "rua:signature",
                {
                    "doctype": doctype,
                    "docname": docname,
                    "signature": file_doc.file_url,
                },
                after_commit=True,
            )
        
        # Clean up the temporary user after successful submission
        if user_email and user_email.startswith("signature_"):
            try:
                # Delete the user
                frappe.delete_doc("User", user_email, force=1, ignore_permissions=True)
                frappe.db.commit()
                
            except Exception as e:
                frappe.log_error(
                    f"Error cleaning up signature user {user_email}: {str(e)}",
                    "Signature User Cleanup Error"
                )
            
        return {
            "success": True,
            "signature_url": doc.signature if signature else None
        }
    except Exception as e:
        frappe.log_error("Failed to submit signature", e)
        return {
            "success": False,
            "message": str(e)
        }


@frappe.whitelist(allow_guest=True)
def get_signature_page(token):
    """Get signature page data for mobile signing"""
    try:
        cache_key = f"signature_token:{token}"
        cached_data = frappe.cache().get_value(cache_key)
        
        if not cached_data:
            frappe.throw(_("Invalid or expired signature token"))
            
        cached_data = json.loads(cached_data)
        if cached_data.get("used"):
            frappe.throw(_("This signature link has already been used"))
            
        doc = frappe.get_doc(cached_data.get("doctype"), cached_data.get("docname"))
        
        return {
            "success": True,
            "data": {
                "doctype": doc.doctype,
                "docname": doc.name,
                "token": token
            }
        }
    except Exception as e:
        frappe.log_error("Failed to get signature page", e)
        return {
            "success": False,
            "message": str(e)
        }

@frappe.whitelist()
def cleanup_signature_users():
    """
    Cleanup temporary signature users that are older than 30 minutes
    This function will be called at a specified interval via the scheduler
    """
    try:
        # Calculate the cutoff time (30 minutes ago)
        cutoff_time = frappe.utils.now_datetime() - timedelta(minutes=30)
        
        # Find signature users older than cutoff time using built-in creation field
        users_to_delete = frappe.get_all(
            "User",
            filters={
                "email": ["like", "signature_%@ruacompany.com"],
                "creation": ["<", cutoff_time]
            },
            fields=["name"]
        )
        
        deletion_log = []
        for user in users_to_delete:
            try:
                frappe.delete_doc("User", user.name, force=1, ignore_permissions=True)
                deletion_log.append(user.name)
                
            except Exception as e:
                frappe.log_error(
                    f"Error deleting signature user {user.name}: {str(e)}",
                    "Signature User Cleanup Error"
                )
        
        if deletion_log:
            frappe.log_error(
                message=f"Cleaned up {len(deletion_log)} signature users: {', '.join(deletion_log)}",
                title="Signature User Cleanup Log"
            )
            
        frappe.db.commit()
        
    except Exception as e:
        frappe.log_error(
            "Error in signature user cleanup job",
            str(e)
        )
        frappe.db.rollback()