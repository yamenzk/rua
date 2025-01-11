import frappe


@frappe.whitelist(methods=["POST"], allow_guest=True)
def get_context_for_dev():
	if not frappe.conf.developer_mode:
		frappe.throw("This method is only meant for developer mode")
	return get_boot()

def get_boot():
	return frappe._dict(
		{
			"frappe_version": frappe.__version__,
			"default_route": "/frontend",
			"site_name": frappe.local.site,
		}
	)
