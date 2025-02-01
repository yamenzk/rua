import frappe
import requests
from frappe.model.document import Document

class RUARemoteIssue(Document):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._table_fieldnames = []
        self._valid_columns = []

    @staticmethod
    def get_list(args):
        try:
            response = requests.get(
                "https://ruabeta.frappe.cloud/api/v2/method/rua.api.get_issues"
            )
            response.raise_for_status()
            
            issues = response.json().get("data", {}).get("data", [])
            return issues
            
        except Exception as e:
            frappe.log_error("Error fetching remote issues", str(e))
            return []

    @staticmethod
    def get_count(args):
        """Get total count of remote issues"""
        try:
            response = requests.get(
                "https://ruabeta.frappe.cloud/api/v2/method/rua.api.get_issues"
            )
            response.raise_for_status()
            
            issues = response.json().get("data", {}).get("data", [])
            return len(issues)
            
        except Exception as e:
            frappe.log_error("Error getting remote issues count", str(e))
            return 0

    @staticmethod
    def get_stats(args):
        """Get statistics of remote issues"""
        try:
            response = requests.get(
                "https://ruabeta.frappe.cloud/api/v2/method/rua.api.get_issues"
            )
            response.raise_for_status()
            
            issues = response.json().get("data", {}).get("data", [])
            
            stats = {
                "total": len(issues),
                "resolved": len([i for i in issues if i.get("status") == "Resolved"]),
                "open": len([i for i in issues if i.get("status") == "Open"]),
                "bugs": len([i for i in issues if i.get("type") == "Bug"]),
                "features": len([i for i in issues if i.get("type") == "Feature Request"])
            }
            return stats
            
        except Exception as e:
            frappe.log_error("Error getting remote issues stats", str(e))
            return {"total": 0, "resolved": 0, "open": 0, "bugs": 0, "features": 0}

    def load_from_db(self):
        """Load remote issue data"""
        try:
            response = requests.get(
                "https://ruabeta.frappe.cloud/api/v2/method/rua.api.get_issues"
            )
            response.raise_for_status()
            
            issues = response.json().get("data", {}).get("data", [])
            
            # Find the specific issue
            issue = next((i for i in issues if i["name"] == self.name), None)
            
            if issue:
                # Explicitly set each field
                self.type = issue.get("type")
                self.status = issue.get("status") 
                self.details = issue.get("details")
                self.creation = issue.get("creation")
                self.modified = issue.get("modified")
                
                # Set doc as unmodified after loading
                self.set_docstatus()
                self.original_modified = self.modified
                self._doc_before_save = None
                
            else:
                frappe.throw(_("Remote Issue {0} not found").format(self.name))
                
        except Exception as e:
            frappe.log_error("Error loading remote issue", str(e))
            frappe.throw(_("Error loading remote issue"))

    def db_insert(self, *args, **kwargs):
        raise frappe.ValidationError("Cannot create remote issues locally")

    def db_update(self):
        if self.has_value_changed('status') and self.status == "Resolved":
            try:
                response = requests.get(
                    "https://ruabeta.frappe.cloud/api/v2/method/rua.api.mark_resolved",
                    params={"issue": self.name}
                )
                response.raise_for_status()
                
            except Exception as e:
                frappe.log_error("Error updating remote issue", str(e))
                frappe.throw("Failed to update remote issue")

    def delete(self):
        """Override delete method"""
        raise frappe.ValidationError("Cannot delete remote issues locally")