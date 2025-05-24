// src/components/formFields/PercentFormField.jsx - Fixed version
import React from "react";
import { InputNumber } from "primereact/inputnumber";

const PercentFormField = ({
  id,
  value,
  onChange,
  disabled,
  className,
  placeholder,
  min = 0,
  max = 100,
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
      suffix="%"
      min={min}
      max={max}
      minFractionDigits={0}
      maxFractionDigits={2}
      {...safeOtherProps}
    />
  );
};

export default PercentFormField;
