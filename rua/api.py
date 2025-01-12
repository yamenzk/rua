import frappe

@frappe.whitelist()
def get_user_roles(user):
    return frappe.get_roles(user)
