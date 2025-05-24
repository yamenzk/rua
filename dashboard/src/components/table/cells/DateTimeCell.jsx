// src/components/table/cells/DateTimeCell.jsx
import React from "react";
import {
  formatDisplayDate,
  formatDisplayDateTime,
  formatDisplayTime,
} from "@/utils/formatters";

const DateTimeCell = ({ rowData, fieldname, fieldtype = "Date" }) => {
  const value = rowData[fieldname];

  if (!value) return <span className="text-text-color-secondary">—</span>;

  let formattedValue = "";

  try {
    if (fieldtype === "Date") {
      formattedValue = formatDisplayDate(value);
    } else if (fieldtype === "Datetime") {
      formattedValue = formatDisplayDateTime(value);
    } else if (fieldtype === "Time") {
      formattedValue = formatDisplayTime(value, true);
    } else {
      formattedValue = String(value);
    }
  } catch (error) {
    console.warn(`Error formatting ${fieldtype} value:`, value, error);
    formattedValue = String(value);
  }

  return (
    <span className="text-sm" title={formattedValue}>
      {formattedValue}
    </span>
  );
};

export default DateTimeCell;
