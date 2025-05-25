// src/components/table/filters/EnhancedSelectFilter.jsx - Fixed Version
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { MultiSelect } from "primereact/multiselect"; // Still imported but not used directly for the final component
import { VirtualScroller } from "primereact/virtualscroller"; // Still imported
import { Dropdown } from "primereact/dropdown"; // This is what we're using
import nationalitiesData from "@/utils/nationalities.json";

const EnhancedSelectFilter = ({
  options,
  colProps,
  fieldname,
  placeholder = "Any",
  maxSelectedLabels = 3, // This prop is typically for MultiSelect, less relevant for Dropdown
}) => {
  const [filteredOptions, setFilteredOptions] = useState([]);

  // Generate options based on field configuration
  const selectOptions = useMemo(() => {
    const { fieldtype, options_source_array, options_source_string } =
      colProps || {};

    if (fieldname === "nationality") {
      return nationalitiesData.map((n) => ({
        label: `${n.flag} ${n.name}`,
        value: n.name,
        searchText: n.name.toLowerCase(), // For faster filtering
      }));
    }

    // Use pre-computed options from column config
    if (colProps.options && Array.isArray(colProps.options)) {
      return colProps.options.map((opt) => ({
        ...opt,
        searchText: opt.label.toLowerCase(),
      }));
    }

    // Handle Select field with select_options_data
    if (
      Array.isArray(options_source_array) &&
      options_source_array.length > 0
    ) {
      return options_source_array.map((opt) => ({
        label: String(opt),
        value: opt,
        searchText: String(opt).toLowerCase(),
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
          searchText: String(opt).toLowerCase(),
        }));
    }

    return [];
  }, [colProps, fieldname]);

  // Initialize filtered options
  useEffect(() => {
    setFilteredOptions(selectOptions);
  }, [selectOptions]);

  // === MODIFICATION START ===
  // Ensure value is always a single value, not an array
  const selectedValue = useMemo(() => {
    // If options.value is an array, take the first element (or null if empty)
    if (Array.isArray(options.value)) {
      return options.value.length > 0 ? options.value[0] : null;
    }
    // Otherwise, use the value directly
    return options.value || null;
  }, [options.value]);

  const handleSelectionChange = useCallback(
    (e) => {
      // The Dropdown's onChange event directly gives the selected value
      options.filterCallback(e.value); // e.value is already the single selected value
    },
    [options]
  );
  // === MODIFICATION END ===

  // Custom filter function for better performance with large datasets
  const handleFilter = useCallback(
    (e) => {
      const query = e.filter.toLowerCase();
      if (!query) {
        setFilteredOptions(selectOptions);
        return;
      }

      const filtered = selectOptions.filter((option) =>
        option.searchText.includes(query)
      );
      setFilteredOptions(filtered);
    },
    [selectOptions]
  );

  // Use virtual scrolling for large datasets
  const isLargeDataset = selectOptions.length > 50;
  const displayOptions = filteredOptions;

  // Custom item template for nationalities
  const itemTemplate = (option) => {
    if (fieldname === "nationality") {
      return (
        <div className="flex align-items-center gap-2 p-1">
          <span style={{ fontSize: "1.1em" }}>
            {option.label.split(" ")[0]}
          </span>
          <span className="text-sm">
            {option.label.substring(option.label.indexOf(" ") + 1)}
          </span>
        </div>
      );
    }
    return <span>{option.label}</span>;
  };

  const multiSelectProps = {
    // Renamed to dropdownProps for clarity, but you can keep multiSelectProps if you prefer
    value: selectedValue, // Pass the single selected value here
    options: displayOptions,
    onChange: handleSelectionChange,
    placeholder:
      isLargeDataset && displayOptions.length === 0
        ? "Loading..."
        : placeholder,
    className: "p-column-filter",
    showClear: true,
    filter: isLargeDataset,
    filterBy: isLargeDataset ? undefined : "label", // filterBy="label" is often useful even with custom filter
    onFilter: isLargeDataset ? handleFilter : undefined,
    filterPlaceholder: isLargeDataset
      ? `Search ${colProps?.header || fieldname}...`
      : undefined,
    emptyMessage: isLargeDataset ? "No matches found" : "No options available",
    itemTemplate: itemTemplate, // Apply itemTemplate always, not just for large datasets
    virtualScrollerOptions: isLargeDataset
      ? {
          itemSize: fieldname === "nationality" ? 40 : 35,
          scrollHeight: "250px",
          lazy: false,
          showSpacer: false,
        }
      : undefined,
  };

  return <Dropdown {...multiSelectProps} />;
};

export default EnhancedSelectFilter;
