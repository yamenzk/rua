// src/components/formFields/FloatFormField.jsx - Enhanced with Presets
import React from "react";
import { InputNumber } from "primereact/inputnumber";
import {
  FormFieldWrapper,
  useFormFieldState,
  PRIMEREACT_PT_CONFIGS,
} from "./styles/formFieldStyles";
import { useTheme } from "@/contexts/ThemeContext";

const FloatFormField = ({
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
  preset,
  precision = 2,
  min,
  max,
  ...otherProps
}) => {
  const theme = useTheme();
  const activePreset = preset || theme.preset;
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

  // Calculate precision values
  const precisionNum = parseInt(precision, 10);
  const minFractionDigits = isNaN(precisionNum) ? 2 : precisionNum;
  const maxFractionDigits = isNaN(precisionNum) ? 2 : precisionNum;

  // Filter out non-DOM props before spreading
  const { fieldSchemaItem, onFocus, onBlur, ...safeOtherProps } = otherProps;

  // Get PrimeReact PassThrough config for InputNumber with preset
  const ptConfig = PRIMEREACT_PT_CONFIGS.inputNumber(
    {
      isFocused,
      isHovered,
      disabled,
      error: !!error,
      size,
      className,
    },
    activePreset // Pass preset
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
      preset={activePreset}
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
    </FormFieldWrapper>
  );
};

export default FloatFormField;
