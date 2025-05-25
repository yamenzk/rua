// src/components/formFields/CurrencyFormField.jsx - Fixed Addon Continuity
import React from "react";
import { InputNumber } from "primereact/inputnumber";
import {
  FormFieldWrapper,
  useFormFieldState,
  PRIMEREACT_PT_CONFIGS,
  getAddonStyles,
} from "./styles/formFieldStyles";

const CurrencyFormField = ({
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
  currency = "AED",
  locale = "en-AE",
  minFractionDigits = 2,
  maxFractionDigits = 2,
  min,
  max,
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

  // Get PrimeReact PassThrough config for InputNumber with currency addon
  const ptConfig = PRIMEREACT_PT_CONFIGS.inputNumberWithAddon(
    {
      isFocused,
      isHovered,
      disabled,
      error: !!error,
      size,
      className,
    },
    "left"
  ); // Currency addon is on the left

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
        {/* Currency Symbol Addon */}
        <span
          className={`p-inputgroup-addon flex items-center ${getAddonStyles(
            { isFocused, isHovered, disabled },
            "left"
          )}`}
        >
          <img src="/aed.svg" alt="AED" className="h-4 w-4" />
        </span>

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
          placeholder={placeholder || "0.00"}
          mode="decimal" // Use decimal instead of currency to avoid double symbols
          locale={locale}
          minFractionDigits={minFractionDigits}
          maxFractionDigits={maxFractionDigits}
          min={min}
          max={max}
          pt={ptConfig}
          title={tooltip}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...safeOtherProps}
        />
      </div>
    </FormFieldWrapper>
  );
};

export default CurrencyFormField;
