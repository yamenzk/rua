import frappe

__version__ = "0.0.3"


def refetch_resource(cache_key: str | list, user=None):
	frappe.publish_realtime(
		"rua:refetch_resource",
		{"cache_key": cache_key},
		user=user or frappe.session.user,
		after_commit=True,
	)