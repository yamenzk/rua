import frappe
from frappe.utils import cint, flt
from frappe.model.document import Document
from frappe.utils.response import build_response


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