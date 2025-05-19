# rua/apiv2.py
import frappe
from frappe.model.meta import get_meta

# No need to import json here, frontend will parse the description string


@frappe.whitelist()
def get_doctype_form_schema(doctype_name):
    if not doctype_name:
        frappe.throw("DocType name is required.")

    try:
        meta = get_meta(doctype_name)
    except frappe.DoesNotExistError:
        frappe.throw(f"DocType '{doctype_name}' not found.")
        return

    doctype_label = meta.get("label") or meta.name
    doctype_title_field = meta.get("title_field") or "name"

    schema = {
        "name": meta.name,
        "label": doctype_label,
        "title_field": doctype_title_field,
        "fields": [],
        "layout": {"elements": []},
        "search_fields": meta.get("search_fields"),
        "default_sort_field": meta.get("sort_field") or "modified",
        "default_sort_order": meta.get("sort_order") or "DESC",
    }

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
            "default_value_parsed": None,  # Kept for existing frontend logic
            # Properties for table view configuration
            "in_list_view": bool(field_doc.in_list_view),
            "in_standard_filter": bool(field_doc.in_standard_filter),
            "is_filterable": bool(
                field_doc.in_filter
            ),
            "in_preview": bool(field_doc.in_preview),
            "in_global_search": bool(field_doc.in_global_search),
            "allow_in_quick_entry": bool(field_doc.allow_in_quick_entry),
            "width": field_doc.width,
            "allow_on_submit": bool(field_doc.allow_on_submit),
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

        if field_doc.fieldtype == "Link" and field_doc.options:
            field_data["linked_doctype"] = field_doc.options

        if field_doc.fieldtype not in ["Section Break", "Column Break", "Tab Break"]:
            schema["fields"].append(field_data)

        layout_element = {"fieldname": field_doc.fieldname, "type": field_doc.fieldtype}
        if field_doc.fieldtype in ["Tab Break", "Section Break", "Column Break"]:
            layout_element["label"] = field_doc.label
            if field_doc.fieldtype == "Section Break":
                layout_element["collapsible"] = bool(field_doc.collapsible)
                layout_element["section_description_text"] = field_doc.description

        schema["layout"]["elements"].append(layout_element)

    return schema
