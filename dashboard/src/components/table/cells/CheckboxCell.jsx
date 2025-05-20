// dashboard/src/components/table/cells/CheckboxCell.jsx
import React from "react";
import { Checkbox } from "primereact/checkbox";

const CheckboxCell = ({ rowData, fieldname }) => {
  const value = !!rowData[fieldname];
  return <Checkbox checked={value} disabled />;
};

export default CheckboxCell;
