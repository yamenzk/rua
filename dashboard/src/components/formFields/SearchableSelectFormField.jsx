// src/components/formFields/SearchableSelectFormField.jsx
import React, { useMemo } from "react";
import { Dropdown } from "primereact/dropdown";

const SearchableSelectFormField = (props) => {
  const {
    id, // fieldname
    value, // current value from formData
    onChange, 
    disabled,
    className, 
    placeholder,
    fieldSchemaItem, 
    options: fieldOptions, // This will be an array of { label, value }
    ...otherDropdownProps // Spread other native Dropdown props
  } = props;

  // The `onChange` prop received here is already adapted by FormFieldAdapter
  // to correctly call `handleInputChange(fieldname, newValue)`.
  // PrimeReact's Dropdown `onChange` event `e` has `e.value` as the selected value.
  const handleChange = (e) => {
    if (onChange) {
      const simulatedEvent = {
        target: {
          name: id, // fieldname
          value: e.value, // The selected value from the dropdown
        },
      };
      onChange(simulatedEvent);
    }
  };

  return (
    <Dropdown
      id={id}
      value={value} // Value should match one of the option.value
      options={fieldOptions || []} // Expects an array of {label, value}
      onChange={handleChange}
      disabled={disabled}
      className={className} // Apply className directly to Dropdown
      placeholder={placeholder || "Select an option..."}
      filter // Enable filtering
      showClear // Allow clearing the selection
      filterBy="label" // Filter by the label property of the options
      // filterPlaceholder="Search..." // Optional: custom placeholder for filter input
      // optionLabel="label" // Default, if options are {label, value}
      // optionValue="value" // Default
      {...otherDropdownProps}
    />
  );
};

export default SearchableSelectFormField;
