// src/components/formFields/IntFormField.jsx - Enhanced with Presets
import React from "react";
import { InputNumber } from "primereact/inputnumber";
import {
  FormFieldWrapper,
  useFormFieldState,
  PRIMEREACT_PT_CONFIGS,
} from "./styles/formFieldStyles";

const IntFormField = ({
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
  preset = "elevated", // New preset support!
  min,
  max,
  ...otherProps
}) => {
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
        target: { name: id, value: e.value },
        originalEvent: e.originalEvent,
      };
      onChange(syntheticEvent);
    }
  };

  const { fieldSchemaItem, onFocus, onBlur, ...safeOtherProps } = otherProps;

  const ptConfig = PRIMEREACT_PT_CONFIGS.inputNumber(
    {
      isFocused,
      isHovered,
      disabled,
      error: !!error,
      size,
      className,
    },
    preset // Pass preset
  );

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
      preset={preset}
    >
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
        placeholder={placeholder}
        mode="decimal"
        minFractionDigits={0}
        maxFractionDigits={0}
        min={min}
        max={max}
        pt={ptConfig}
        title={tooltip}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...safeOtherProps}
      />
    </FormFieldWrapper>
  );
};

export default IntFormField;
