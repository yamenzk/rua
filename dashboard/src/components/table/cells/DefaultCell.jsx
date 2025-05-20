// dashboard/src/components/table/cells/DefaultCell.jsx
import React from "react";

const DefaultCell = ({ rowData, fieldname }) => {
  return String(rowData[fieldname] ?? "");
};

export default DefaultCell;
