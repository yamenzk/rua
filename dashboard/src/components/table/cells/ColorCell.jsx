// dashboard/src/components/table/cells/ColorCell.jsx
import React from "react";

const ColorCell = ({ rowData, fieldname }) => {
  const colorValue = rowData[fieldname];
  if (!colorValue) return null;

  return (
    <div
      style={{
        width: "24px",
        height: "24px",
        backgroundColor: `#${String(colorValue).replace("#", "")}`,
        borderRadius: "4px",
        border: "1px solid var(--surface-border)",
      }}
      title={`#${String(colorValue).replace("#", "")}`}
    />
  );
};

export default ColorCell;
