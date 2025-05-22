// dashboard/src/components/table/filters/MultiSelectFilter.jsx
import React from "react";
import { MultiSelect } from "primereact/multiselect";

const MultiSelectFilter = ({
  options,
  selectOptions = [],
  placeholder = "Any",
  itemTemplate,
  optionLabel = "label",
  maxSelectedLabels = 3,
}) => {
  return (
    <MultiSelect
      value={options.value}
      options={selectOptions}
      onChange={(e) => options.filterCallback(e.value)}
      itemTemplate={itemTemplate}
      placeholder={placeholder}
      className="p-column-filter"
      optionLabel={optionLabel}
      maxSelectedLabels={maxSelectedLabels}
      showClear
    />
  );
};

export default MultiSelectFilter;
