// dashboard/src/components/table/cells/SelectCell.jsx
import React from "react";
import { Tag } from "primereact/tag";

const SelectCell = ({ rowData, fieldname, displayProps }) => {
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
  return String(value ?? "");
};

export default SelectCell;
