// src/components/formFields/SelectFormField.jsx - Final Production Version
import React, { useMemo } from "react";
import { Dropdown } from "primereact/dropdown";
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
  filter, // No default value - let shouldEnableFilter determine it
  ...otherProps
}) => {
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
      }));
    }

    // Handle Select field with select_options_data
    if (Array.isArray(select_options_data) && select_options_data.length > 0) {
      return select_options_data.map((opt) => ({
        label: String(opt),
        value: opt,
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
        }));
    }

    return [];
  }, [id, fieldSchemaItem]);

  // Determine if filtering should be enabled
  const shouldEnableFilter = useMemo(() => {
    // If filter is explicitly set, use that value
    if (filter !== undefined) return filter;

    // Get fieldname and fieldtype from fieldSchemaItem, fallback to id for fieldname
    const fieldname = fieldSchemaItem?.fieldname || id;
    const fieldtype = fieldSchemaItem?.fieldtype;

    if (id === "nationality" || fieldname === "nationality") {
      return true;
    }

    // Enable filter for Autocomplete type fields
    if (fieldtype === "Autocomplete") {
      return true;
    }

    // Enable filter for fields with many options (>10)
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

  // Filter out non-DOM props before spreading
  const { fieldSchemaItem: _fieldSchemaItem, ...safeOtherProps } = otherProps;

  return (
    <Dropdown
      id={id}
      value={value || null}
      options={options}
      onChange={handleChange}
      disabled={disabled}
      className={className}
      placeholder={placeholder || "Select an option..."}
      showClear={showClear}
      filter={shouldEnableFilter}
      filterBy="label"
      filterPlaceholder={shouldEnableFilter ? "Search..." : undefined}
      emptyMessage="No options available"
      {...safeOtherProps}
    />
  );
};

export default SelectFormField;
