// dashboard/src/components/common/AuditInfo.jsx - Display audit information
import React from "react";
import { formatDisplayDateTime } from "@/utils/formatters";

const AuditInfo = ({ docData }) => {
  if (!docData) return null;

  const { creation, owner, modified, modified_by } = docData;

  // Don't render if no audit information is available
  if (!creation && !owner && !modified && !modified_by) {
    return null;
  }

  const formatUserName = (username) => {
    if (!username) return "Unknown";
    if (username === "Administrator") return "Admin";
    return username;
  };

  const createdInfo = creation && owner;
  const modifiedInfo = modified && modified_by;

  // Check if the document has been modified after creation
  const hasBeenModified =
    modified && creation && new Date(modified) > new Date(creation);

  return (
    <div className="text-xs text-text-color-secondary space-y-1">
      {createdInfo && (
        <div className="flex items-center gap-1">
          <i className="pi pi-plus-circle text-green-500"></i>
          <span>
            Created {formatDisplayDateTime(creation)} by{" "}
            <span className="font-medium text-text-color">
              {formatUserName(owner)}
            </span>
          </span>
        </div>
      )}

      {modifiedInfo && hasBeenModified && (
        <div className="flex items-center gap-1">
          <i className="pi pi-pencil text-orange-500"></i>
          <span>
            Updated {formatDisplayDateTime(modified)} by{" "}
            <span className="font-medium text-text-color">
              {formatUserName(modified_by)}
            </span>
          </span>
        </div>
      )}

      {/* Show only creation if never modified */}
      {createdInfo && !hasBeenModified && (
        <div className="flex items-center gap-1 text-text-color-secondary">
          <i className="pi pi-info-circle"></i>
          <span>Never modified</span>
        </div>
      )}
    </div>
  );
};

export default AuditInfo;
