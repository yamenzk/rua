// src/components/formFields/DurationFormField.jsx - Fixed version
import React from "react";
import { InputNumber } from "primereact/inputnumber";

const DurationFormField = ({
  id,
  value,
  onChange,
  disabled,
  className,
  placeholder,
  min = 0,
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
    <div className="flex items-center gap-2">
      <InputNumber
        id={id}
        value={
          value !== undefined && value !== null && value !== ""
            ? Number(value)
            : null
        }
        onValueChange={handleChange}
        disabled={disabled}
        className={`flex-1 ${className || ""}`}
        placeholder={placeholder || "Duration in seconds"}
        mode="decimal"
        min={min}
        minFractionDigits={0}
        maxFractionDigits={0}
        {...safeOtherProps}
      />
      <span className="text-xs text-text-color-secondary">seconds</span>
    </div>
  );
};

export default DurationFormField;
