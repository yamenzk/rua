// dashboard/src/components/table/filters/MultiSelectTableFilter.jsx
import React from "react";
import { MultiSelect } from "primereact/multiselect";

const MultiSelectTableFilter = ({
  value,
  options,
  onChange, // filterApplyCallback
  placeholder = "Any",
  className = "p-column-filter",
  optionLabel = "label",
  optionValue = "value",
  multiSelectProps = {},
}) => {
  return (
    <MultiSelect
      value={value || []}
      options={options || []}
      onChange={(e) => onChange(e.value)}
      placeholder={placeholder}
      className={className}
      optionLabel={optionLabel}
      optionValue={optionValue}
      {...multiSelectProps}
    />
  );
};

export default MultiSelectTableFilter;
