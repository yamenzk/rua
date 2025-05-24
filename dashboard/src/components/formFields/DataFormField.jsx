// src/components/formFields/DataFormField.jsx
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

  return (
    <InputText
      id={id}
      value={value || ""}
      onChange={handleChange}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
      {...otherProps}
    />
  );
};

export default DataFormField;
