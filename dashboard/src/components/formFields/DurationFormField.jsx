// src/components/formFields/DurationFormField.jsx - Refactored with Central Styles
import React from "react";
import { InputNumber } from "primereact/inputnumber";
import {
  FormFieldWrapper,
  useFormFieldState,
  PRIMEREACT_PT_CONFIGS,
  getAddonStyles,
} from "./styles/formFieldStyles";

const DurationFormField = ({
  id,
  value,
  onChange,
  disabled,
  className,
  placeholder,
  tooltip,
  required,
  error,
  size = "base",
  min = 0,
  displayFormat = "seconds", // "seconds", "minutes", "hours" - what to show in the addon
  ...otherProps
}) => {
  // Use central state management
  const {
    isFocused,
    isHovered,
    handleFocus,
    handleBlur,
    handleMouseEnter,
    handleMouseLeave,
  } = useFormFieldState();

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
  const {
    fieldSchemaItem,
    onFocus,
    onBlur,
    displayFormat: _displayFormat,
    ...safeOtherProps
  } = otherProps;

  // Get display text and placeholder based on format
  const getDisplayInfo = () => {
    switch (displayFormat) {
      case "minutes":
        return {
          unit: "min",
          placeholder: placeholder || "Duration in minutes",
          helperText: "minutes",
        };
      case "hours":
        return {
          unit: "hrs",
          placeholder: placeholder || "Duration in hours",
          helperText: "hours",
        };
      case "seconds":
      default:
        return {
          unit: "sec",
          placeholder: placeholder || "Duration in seconds",
          helperText: "seconds",
        };
    }
  };

  const displayInfo = getDisplayInfo();

  // Get PrimeReact PassThrough config for InputNumber with duration styling
  const ptConfig = PRIMEREACT_PT_CONFIGS.inputNumberWithAddon(
    {
      isFocused,
      isHovered,
      disabled,
      error: !!error,
      size,
      className,
    },
    "right"
  ); // Duration addon is on the right

  return (
    <FormFieldWrapper
      id={id}
      error={error}
      required={required}
      disabled={disabled}
      isFocused={isFocused}
      isHovered={isHovered}
      onMouseEnter={() => handleMouseEnter(disabled)}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-inputgroup w-full">
        {/* Input Number */}
        <InputNumber
          id={id}
          value={
            value !== undefined && value !== null && value !== ""
              ? Number(value)
              : null
          }
          onValueChange={handleChange}
          onFocus={(e) => handleFocus(e, safeOtherProps.onFocus)}
          onBlur={(e) => handleBlur(e, safeOtherProps.onBlur)}
          disabled={disabled}
          placeholder={displayInfo.placeholder}
          mode="decimal"
          min={min}
          minFractionDigits={0}
          maxFractionDigits={0}
          pt={ptConfig}
          title={tooltip}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...safeOtherProps}
        />

        {/* Duration Unit Addon */}
        <span
          className={`p-inputgroup-addon flex items-center justify-center min-w-[4rem] ${getAddonStyles(
            { isFocused, isHovered, disabled },
            "right"
          )}`}
        >
          <div className="flex items-center gap-1">
            <i className="pi pi-clock text-xs text-text-color-secondary"></i>
            <span className="text-sm font-medium text-text-color-secondary">
              {displayInfo.unit}
            </span>
          </div>
        </span>
      </div>

      {/* Helper text for clarity */}
      {!error && !disabled && (
        <div className="mt-1 text-xs text-text-color-secondary flex items-center gap-1">
          <i className="pi pi-info-circle text-xs"></i>
          <span>Enter duration in {displayInfo.helperText}</span>
        </div>
      )}
    </FormFieldWrapper>
  );
};

export default DurationFormField;
