# rua/apiv2.py (Revised again)
import frappe
from frappe.model.meta import get_meta


@frappe.whitelist()
def get_doctype_form_schema(doctype_name):
    if not doctype_name:
        frappe.throw("DocType name is required.")

    try:
        meta = get_meta(doctype_name)
    except frappe.DoesNotExistError:
        frappe.throw(f"DocType '{doctype_name}' not found.")
        # The return below will not be reached due to frappe.throw
        return

    # Use meta.get('label') which is safer for Document-like objects
    # or meta.name if label is not explicitly set on the DocType definition.
    doctype_label = meta.get("label") or meta.name

    schema = {
        "name": meta.name,
        "label": doctype_label,
        "fields": [],
        "layout": {"elements": []},
    }

    # Add field_order_json if you need the exact order from the DocType JSON's "field_order" array
    # This can be useful if meta.fields iteration order doesn't precisely match complex UI designer layouts.
    # However, meta.fields is generally reliable for the defined order including layout fields.
    # Example: schema["layout"]["field_order_from_json"] = meta.get("field_order") if meta.get("field_order") else []

    for field_doc in meta.fields:
        field_data = {
            "fieldname": field_doc.fieldname,
            "fieldtype": field_doc.fieldtype,
            "label": field_doc.label or field_doc.fieldname,
            "options": field_doc.options,
            "default_value": field_doc.default,
            "hidden": bool(field_doc.hidden),
            "bold": bool(field_doc.bold),
            "read_only": bool(field_doc.read_only),
            "mandatory": bool(field_doc.reqd),
            "set_only_once": bool(field_doc.set_only_once),
            "placeholder": field_doc.placeholder,
            "description": field_doc.description,
            "precision": (
                field_doc.precision
                if field_doc.fieldtype in ["Currency", "Float", "Percent"]
                else None
            ),
            "non_negative": (
                bool(field_doc.non_negative)
                if field_doc.fieldtype in ["Currency", "Float", "Int", "Percent"]
                else None
            ),
            "default_value_parsed": None,
        }

        if field_doc.fieldtype == "Date" and field_doc.default == "Today":
            field_data["default_value_parsed"] = "Today"
        elif field_doc.fieldtype == "Time" and field_doc.default == "Now":
            field_data["default_value_parsed"] = "Now"
        elif field_doc.fieldtype == "Datetime" and field_doc.default == "Now":
            field_data["default_value_parsed"] = "Now"

        if field_doc.fieldtype == "Select" and field_doc.options:
            field_data["select_options_data"] = [
                opt.strip() for opt in field_doc.options.split("\n") if opt.strip()
            ]

        # Data fields (non-layout) are added to the 'fields' list for easy lookup by frontend
        if field_doc.fieldtype not in ["Section Break", "Column Break", "Tab Break"]:
            schema["fields"].append(field_data)

        # All fields (including layout fields) are added to 'layout.elements' in their defined order
        layout_element = {"fieldname": field_doc.fieldname, "type": field_doc.fieldtype}

        if field_doc.fieldtype in ["Tab Break", "Section Break"]:
            layout_element["label"] = field_doc.label
            if field_doc.fieldtype == "Section Break":
                layout_element["collapsible"] = bool(field_doc.collapsible)
                layout_element["description"] = (
                    field_doc.description
                )  # Section breaks can also have descriptions

        schema["layout"]["elements"].append(layout_element)

    return schema
