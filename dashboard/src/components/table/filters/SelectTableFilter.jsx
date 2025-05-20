// dashboard/src/components/table/filters/SelectTableFilter.jsx
import React from "react";
import { Dropdown } from "primereact/dropdown";

const SelectTableFilter = ({
  value,
  options,
  onChange, // filterApplyCallback
  placeholder = "Select",
  className = "p-column-filter",
  showClear = true,
  dropdownProps = {},
}) => {
  return (
    <Dropdown
      value={value}
      options={options || []}
      onChange={(e) => onChange(e.value)}
      placeholder={placeholder}
      className={className}
      showClear={showClear}
      {...dropdownProps}
    />
  );
};

export default SelectTableFilter;
