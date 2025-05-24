// src/components/table/filters/EnhancedSelectFilter.jsx
import React, { useMemo } from "react";
import { MultiSelect } from "primereact/multiselect";
import nationalitiesData from "@/utils/nationalities.json";

const EnhancedSelectFilter = ({
  options,
  colProps,
  fieldname,
  placeholder = "Any",
  maxSelectedLabels = 3,
}) => {
  // Generate options based on field configuration
  const selectOptions = useMemo(() => {
    const { fieldtype, options_source_array, options_source_string } =
      colProps || {};

    // Special handling for nationality field
    if (fieldname === "nationality" || fieldtype === "Nationality") {
      return nationalitiesData.map((n) => ({
        label: `${n.flag} ${n.name}`,
        value: n.name,
      }));
    }

    // Use pre-computed options from column config
    if (colProps.options && Array.isArray(colProps.options)) {
      return colProps.options;
    }

    // Handle Select field with select_options_data
    if (
      Array.isArray(options_source_array) &&
      options_source_array.length > 0
    ) {
      return options_source_array.map((opt) => ({
        label: String(opt),
        value: opt,
      }));
    }

    // Handle Autocomplete field with newline-separated options
    if (
      typeof options_source_string === "string" &&
      options_source_string.trim() !== ""
    ) {
      return options_source_string
        .split("\n")
        .map((opt) => opt.trim())
        .filter((opt) => opt)
        .map((opt) => ({
          label: String(opt),
          value: opt,
        }));
    }

    return [];
  }, [colProps, fieldname]);

  const handleSelectionChange = (e) => {
    options.filterCallback(e.value);
  };

  return (
    <MultiSelect
      value={options.value || []}
      options={selectOptions}
      onChange={handleSelectionChange}
      placeholder={placeholder}
      className="p-column-filter"
      maxSelectedLabels={maxSelectedLabels}
      showClear
      filter={selectOptions.length > 10}
      filterBy="label"
      filterPlaceholder="Search options..."
      emptyMessage="No options available"
    />
  );
};

export default EnhancedSelectFilter;
