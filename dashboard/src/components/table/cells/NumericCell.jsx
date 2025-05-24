// src/components/table/cells/NumericCell.jsx
import React from "react";
import { formatCurrencyAED, formatDuration } from "@/utils/formatters";

const NumericCell = ({
  rowData,
  fieldname,
  fieldtype = "Int",
  displayProps = {},
}) => {
  const value = rowData[fieldname];

  if (value === null || value === undefined || value === "") {
    return <span className="text-text-color-secondary">—</span>;
  }

  let formattedValue = "";
  const numValue = Number(value);

  if (isNaN(numValue)) {
    return <span className="text-text-color-secondary">Invalid</span>;
  }

  try {
    switch (fieldtype) {
      case "Currency":
        formattedValue = formatCurrencyAED(numValue);
        break;
      case "Percent":
        formattedValue = `${numValue}%`;
        break;
      case "Duration":
        formattedValue = formatDuration(numValue);
        break;
      case "Float":
        const precision = displayProps.precision || 2;
        formattedValue = numValue.toLocaleString("en-AE", {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        });
        break;
      case "Int":
      default:
        formattedValue = numValue.toLocaleString("en-AE");
        break;
    }
  } catch (error) {
    console.warn(`Error formatting ${fieldtype} value:`, value, error);
    formattedValue = String(value);
  }

  return (
    <span className="text-sm font-mono" title={formattedValue}>
      {formattedValue}
    </span>
  );
};

export default NumericCell;
