// src/components/table/filters/TextFilter.jsx
import React from "react";
import { InputText } from "primereact/inputtext";

const TextFilter = ({ options, placeholder = "Search...", className = "" }) => {
  return (
    <InputText
      value={options.value || ""}
      onChange={(e) => options.filterCallback(e.target.value, options.index)}
      placeholder={placeholder}
      className={`p-column-filter ${className}`}
    />
  );
};

export default TextFilter;
