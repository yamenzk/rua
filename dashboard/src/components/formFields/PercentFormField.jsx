// src/components/formFields/PercentFormField.jsx - Fixed Addon Continuity
import React from "react";
import { InputNumber } from "primereact/inputnumber";
import {
  FormFieldWrapper,
  useFormFieldState,
  PRIMEREACT_PT_CONFIGS,
  getAddonStyles,
} from "./styles/formFieldStyles";

const PercentFormField = ({
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
  max = 100,
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
  const { fieldSchemaItem, onFocus, onBlur, ...safeOtherProps } = otherProps;

  // Get PrimeReact PassThrough config for InputNumber with percent addon
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
  ); // Percent addon is on the right

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
          placeholder={placeholder || "0"}
          mode="decimal"
          min={min}
          max={max}
          minFractionDigits={0}
          maxFractionDigits={2}
          pt={ptConfig}
          title={tooltip}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...safeOtherProps}
        />

        {/* Percent Symbol Addon */}
        <span
          className={`p-inputgroup-addon flex items-center justify-center min-w-[3rem] ${getAddonStyles(
            { isFocused, isHovered, disabled },
            "right"
          )}`}
        >
          <span className="text-sm font-medium text-text-color-secondary">
            %
          </span>
        </span>
      </div>
    </FormFieldWrapper>
  );
};

export default PercentFormField;
