import frappe
from typing import Optional, Dict, Any, Callable

__version__ = "1.1.0"


def refetch_resource(cache_key: str | list):
	frappe.publish_realtime(
		"rua:refetch_resource",
		{"cache_key": cache_key},
		after_commit=True,
	)

def create_chat_entry(
    project: str,
    user: str,
    message: str,
    type: str = "Info",
    timeline: Optional[int] = None,
    commit: bool = True
) -> Dict[str, Any]:
    """Create and insert a RUA Chat message."""
    chat_doc = {
        "doctype": "RUA Chat",
        "project": project,
        "user": user,
        "type": type,
        "timestamp": frappe.utils.now(),
        "message": message
    }

    if timeline is not None:
        chat_doc["timeline"] = timeline

    doc = frappe.get_doc(chat_doc)
    doc.insert(ignore_permissions=True)
    
    if commit:
        frappe.db.commit()
        
    return doc

class ChatMessageHandler:
    def __init__(self, doc):
        self.doc = doc
        self.chat_doc = None

    def get_project_reference(self):
        """Get the correct project reference based on document type"""
        if self.doc.doctype == "RUA Project":
            return self.doc.name  # For projects, use the document name itself
        return getattr(self.doc, 'project', None)  # For other doctypes, get the project field

    def create_message(
        self,
        message: str,
        type: str = "Info",
        timeline: Optional[int] = None,
        commit: bool = True
    ):
        """Create a chat message for the current document."""
        project = self.get_project_reference()
        if not project:
            frappe.throw("Project reference is required for chat messages")
            
        return create_chat_entry(
            project=project,
            user=self.doc.owner,
            message=message,
            type=type,
            timeline=timeline,
            commit=commit
        )

    def handle_status_update(self, status_handlers: Dict[str, Dict]):
        """
        Handle status changes based on provided handlers configuration.
        
        Args:
            status_handlers: Dictionary mapping status values to their handler configurations.
            Example:
            {
                "Submitted": {
                    "type": "Info",
                    "message": lambda doc: f"Custom message for {doc.name}"
                    "timeline": 1  # optional
                }
            }
        """
        if not self.doc.has_value_changed('status'):
            return

        handler = status_handlers.get(self.doc.status)
        if handler:
            message = handler["message"](self.doc) if callable(handler["message"]) else handler["message"]
            self.create_message(
                message=message,
                type=handler.get("type", "Info"),
                timeline=handler.get("timeline")
            )

    def handle_insert(self, message_func: Callable[['Document'], str], **kwargs):
        """
        Handle document insertion with a custom message function.
        
        Args:
            message_func: Function that takes the document and returns the message
            **kwargs: Additional arguments for create_chat_entry
        """
        message = message_func(self.doc)
        self.create_message(message=message, **kwargs)