// dashboard/src/components/table/filters/SelectFilter.jsx
import React from "react";
import { Dropdown } from "primereact/dropdown";

const SelectFilter = ({
  options,
  selectOptions = [],
  placeholder = "Select one",
  itemTemplate,
  showClear = true,
}) => {
  return (
    <Dropdown
      value={options.value}
      options={selectOptions}
      onChange={(e) => options.filterCallback(e.value, options.index)}
      itemTemplate={itemTemplate}
      placeholder={placeholder}
      className="p-column-filter"
      showClear={showClear}
    />
  );
};

export default SelectFilter;
