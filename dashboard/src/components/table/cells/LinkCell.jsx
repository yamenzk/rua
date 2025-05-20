// dashboard/src/components/table/cells/LinkCell.jsx
import React from "react";
import { Tag } from "primereact/tag";

const LinkCell = ({ rowData, fieldname, displayProps }) => {
  const value = rowData[fieldname];

  if (
    displayProps?.asChip &&
    value !== null &&
    value !== undefined &&
    value !== ""
  ) {
    const severity = displayProps.chipColors?.[value] || undefined;
    return (
      <Tag
        value={String(value)}
        severity={severity}
        rounded={displayProps.chipRounded}
      />
    );
  }
  // Future: Could make this a clickable link if a URL pattern or linked document ID is available
  return String(value ?? "");
};

export default LinkCell;
