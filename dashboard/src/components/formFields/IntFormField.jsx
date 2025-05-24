// src/components/formFields/IntFormField.jsx - Fixed version
import React from "react";
import { InputNumber } from "primereact/inputnumber";

const IntFormField = ({
  id,
  value,
  onChange,
  disabled,
  className,
  placeholder,
  min,
  max,
  ...otherProps
}) => {
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
  const { fieldSchemaItem, ...safeOtherProps } = otherProps;

  return (
    <InputNumber
      id={id}
      value={
        value !== undefined && value !== null && value !== ""
          ? Number(value)
          : null
      }
      onValueChange={handleChange}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
      mode="decimal"
      minFractionDigits={0}
      maxFractionDigits={0}
      min={min}
      max={max}
      {...safeOtherProps}
    />
  );
};

export default IntFormField;
