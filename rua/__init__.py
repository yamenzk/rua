import frappe
from typing import Optional, Dict, Any, Callable

__version__ = "2.0.0"


def refetch_resource(cache_key: str | list, is_signature: bool = False):
	frappe.publish_realtime(
		"rua:refetch_resource",
		{"cache_key": cache_key},
		after_commit=True,
	)
