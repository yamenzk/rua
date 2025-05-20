// dashboard/src/components/table/filters/TextTableFilter.jsx
import React from "react";
import { InputText } from "primereact/inputtext";

const TextTableFilter = ({
  value,
  onChange, // Should be filterApplyCallback
  placeholder,
  className = "p-column-filter",
}) => {
  return (
    <InputText
      value={value || ""}
      onChange={(e) => onChange(e.target.value)} // Pass the new value to the callback
      placeholder={placeholder}
      className={className}
    />
  );
};

export default TextTableFilter;
