// src/components/formFields/FloatFormField.jsx
import React from "react";
import { InputNumber } from "primereact/inputnumber";

const FloatFormField = ({
  id,
  value,
  onChange,
  disabled,
  className,
  placeholder,
  precision = 2,
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

  const precisionNum = parseInt(precision, 10);
  const minFractionDigits = isNaN(precisionNum) ? 2 : precisionNum;
  const maxFractionDigits = isNaN(precisionNum) ? 2 : precisionNum;

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
      minFractionDigits={minFractionDigits}
      maxFractionDigits={maxFractionDigits}
      min={min}
      max={max}
      {...otherProps}
    />
  );
};

export default FloatFormField;
