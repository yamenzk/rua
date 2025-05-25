// src/components/formFields/DataFormField.jsx - Refactored with Central Styles
import React from "react";
import { InputText } from "primereact/inputtext";
import {
  FormFieldWrapper,
  useFormFieldState,
  useFormFieldClasses,
  PRIMEREACT_PT_CONFIGS,
} from "./styles/formFieldStyles";

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
  size = "base", // 'compact', 'base', 'large'
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
      onChange(e); // Pass through the event as-is for InputText
    }
  };

  // Filter out non-DOM props before spreading
  const { fieldSchemaItem, onFocus, onBlur, ...safeOtherProps } = otherProps;

  // Get consistent classes from central system
  const inputClasses = useFormFieldClasses({
    isFocused,
    isHovered,
    disabled,
    error: !!error,
    size,
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
