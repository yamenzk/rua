import frappe
from frappe.boot import load_translations

no_cache = 1

def get_context(context):
    csrf_token = frappe.sessions.get_csrf_token()
    frappe.db.commit()
    context = frappe._dict()
    context.csrf_token = csrf_token
    context.boot = get_boot()
    return context

@frappe.whitelist(methods=["POST"], allow_guest=True)
def get_context_for_dev():
    if not frappe.conf.developer_mode:
        frappe.throw(frappe._("This method is only meant for developer mode"))
    return get_boot()

def get_boot():
    bootinfo = frappe._dict({
        "frappe_version": frappe.__version__,
        "site_name": frappe.local.site,
        "default_route": get_default_route(),
        "push_relay_server_url": frappe.conf.get("push_relay_server_url") or "",
    })

    # Add language support
    bootinfo.lang = frappe.local.lang
    load_translations(bootinfo)

    return bootinfo

def get_default_route():
    return "/admin"  # Adjust this to your app's default route