// dashboard/src/components/table/cells/AttachCell.jsx
import React from "react";

const AttachCell = ({ rowData, fieldname, displayProps }) => {
  const fileUrl = rowData[fieldname];
  if (!fileUrl) return null;

  const filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1) || fileUrl;

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary-color hover:underline"
    >
      {displayProps?.iconOnly ? (
        <i className="pi pi-paperclip" title={filename} />
      ) : (
        filename
      )}
    </a>
  );
};

export default AttachCell;
