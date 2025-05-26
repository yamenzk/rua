// src/components/formFields/DataFormField.jsx - Enhanced with Presets
import React from "react";
import { InputText } from "primereact/inputtext";
import {
  FormFieldWrapper,
  useFormFieldState,
  useFormFieldClasses,
} from "./styles/formFieldStyles";
import { useTheme } from "@/contexts/ThemeContext";

const DataFormField = ({
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
  ...otherProps
}) => {
  const theme = useTheme();
  const activePreset = preset || theme.preset; // Use preset from theme or default to 'elevated'
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
      onChange(e);
    }
  };

  const { fieldSchemaItem, onFocus, onBlur, ...safeOtherProps } = otherProps;

  // Get consistent classes with preset support
  const inputClasses = useFormFieldClasses({
    isFocused,
    isHovered,
    disabled,
    error: !!error,
    size,
    preset: activePreset,
    className,
  });

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
      <InputText
        id={id}
        value={value || ""}
        onChange={handleChange}
        onFocus={(e) => handleFocus(e, safeOtherProps.onFocus)}
        onBlur={(e) => handleBlur(e, safeOtherProps.onBlur)}
        disabled={disabled}
        placeholder={placeholder}
        className={inputClasses}
        title={tooltip}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...safeOtherProps}
      />
    </FormFieldWrapper>
  );
};
export default DataFormField;