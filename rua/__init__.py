import frappe
from typing import Optional, Dict, Any, Callable

__version__ = "1.1.7"


def refetch_resource(cache_key: str | list, is_signature: bool = False):
	frappe.publish_realtime(
		"rua:refetch_resource",
		{"cache_key": cache_key},
		after_commit=True,
	)
