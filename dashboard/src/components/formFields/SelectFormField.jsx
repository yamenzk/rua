// src/components/formFields/SelectFormField.jsx - Enhanced with Virtual Scrolling
import React, { useMemo, useState, useCallback } from "react";
import { Dropdown } from "primereact/dropdown";
import { VirtualScroller } from "primereact/virtualscroller";
import nationalitiesData from "@/utils/nationalities.json";

const SelectFormField = ({
  id, // fieldname
  value,
  onChange,
  disabled,
  className,
  placeholder,
  fieldSchemaItem,
  showClear = true,
  filter,
  ...otherProps
}) => {
  const [filteredOptions, setFilteredOptions] = useState([]);

  // Generate options based on field configuration
  const options = useMemo(() => {
    const {
      fieldname,
      fieldtype,
      options: fieldOptions,
      select_options_data,
    } = fieldSchemaItem || {};

    if (id === "nationality" || fieldname === "nationality") {
      return nationalitiesData.map((n) => ({
        label: `${n.flag} ${n.name}`,
        value: n.name,
        searchText: n.name.toLowerCase(), // For faster filtering
      }));
    }

    // Handle Select field with select_options_data
    if (Array.isArray(select_options_data) && select_options_data.length > 0) {
      return select_options_data.map((opt) => ({
        label: String(opt),
        value: opt,
        searchText: String(opt).toLowerCase(),
      }));
    }

    // Handle Autocomplete field with newline-separated options
    if (typeof fieldOptions === "string" && fieldOptions.trim() !== "") {
      return fieldOptions
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
  }, [id, fieldSchemaItem]);

  // Determine if filtering should be enabled
  const shouldEnableFilter = useMemo(() => {
    if (filter !== undefined) return filter;

    const fieldname = fieldSchemaItem?.fieldname || id;
    const fieldtype = fieldSchemaItem?.fieldtype;

    if (id === "nationality" || fieldname === "nationality") {
      return true;
    }

    if (fieldtype === "Autocomplete") {
      return true;
    }

    if (options.length > 10) {
      return true;
    }

    return false;
  }, [filter, id, fieldSchemaItem, options.length]);

  // Handle change event
  const handleChange = (e) => {
    if (onChange) {
      const syntheticEvent = {
        target: {
          name: id,
          value: e.value,
        },
        originalEvent: e.originalEvent,
      };
      onChange(syntheticEvent);
    }
  };

  // Custom filter function for better performance
  const handleFilter = useCallback(
    (e) => {
      const query = e.filter.toLowerCase();
      if (!query) {
        setFilteredOptions(options);
        return;
      }

      // Use the pre-computed searchText for faster filtering
      const filtered = options.filter((option) =>
        option.searchText.includes(query)
      );
      setFilteredOptions(filtered);
    },
    [options]
  );

  // Initialize filtered options
  React.useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  // Custom item template for virtual scrolling (only for nationality)
  const itemTemplate = (option) => {
    if (id === "nationality" || fieldSchemaItem?.fieldname === "nationality") {
      return (
        <div className="flex align-items-center gap-2 p-1">
          <span style={{ fontSize: "1.2em" }}>
            {option.label.split(" ")[0]}
          </span>
          <span>{option.label.substring(option.label.indexOf(" ") + 1)}</span>
        </div>
      );
    }
    return <span>{option.label}</span>;
  };

  // Use virtual scrolling for large datasets (nationality)
  const isLargeDataset = options.length > 50;
  const displayOptions = shouldEnableFilter ? filteredOptions : options;

  // Filter out non-DOM props before spreading
  const { fieldSchemaItem: _fieldSchemaItem, ...safeOtherProps } = otherProps;

  const dropdownProps = {
    id,
    value: value || null,
    options: displayOptions,
    onChange: handleChange,
    disabled,
    className,
    placeholder: placeholder || "Select an option...",
    showClear,
    filter: shouldEnableFilter,
    filterBy: shouldEnableFilter ? undefined : "label", // Use custom filter for large datasets
    onFilter: shouldEnableFilter && isLargeDataset ? handleFilter : undefined,
    filterPlaceholder: shouldEnableFilter ? "Search..." : undefined,
    emptyMessage: "No options available",
    itemTemplate: isLargeDataset ? itemTemplate : undefined,
    virtualScrollerOptions: isLargeDataset
      ? {
          itemSize: 38, // Height of each item in pixels
          scrollHeight: "200px", // Max height of dropdown
          lazy: false,
          showSpacer: false,
        }
      : undefined,
    ...safeOtherProps,
  };

  return <Dropdown {...dropdownProps} />;
};

export default SelectFormField;
