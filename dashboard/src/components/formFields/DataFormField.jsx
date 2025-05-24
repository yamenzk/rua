// src/components/formFields/DataFormField.jsx - Fixed version
import React from "react";
import { InputText } from "primereact/inputtext";

const DataFormField = ({
  id,
  value,
  onChange,
  disabled,
  className,
  placeholder,
  ...otherProps
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e); // Pass through the event as-is for InputText
    }
  };

  // Filter out non-DOM props before spreading
  const { fieldSchemaItem, ...safeOtherProps } = otherProps;

  return (
    <InputText
      id={id}
      value={value || ""}
      onChange={handleChange}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
      {...safeOtherProps}
    />
  );
};

export default DataFormField;
