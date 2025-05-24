// src/components/formFields/SelectFormField.jsx
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
  filter = false,
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

    // Special handling for nationality field
    if (fieldname === "nationality" || fieldtype === "Nationality") {
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
  }, [fieldSchemaItem]);

  // Determine if filtering should be enabled
  const shouldEnableFilter = useMemo(() => {
    if (filter !== undefined) return filter;

    const { fieldtype, fieldname } = fieldSchemaItem || {};

    // Enable filter for Autocomplete type or nationality field
    return (
      fieldtype === "Autocomplete" ||
      fieldname === "nationality" ||
      options.length > 10
    );
  }, [filter, fieldSchemaItem, options.length]);

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
      {...otherProps}
    />
  );
};

export default SelectFormField;
