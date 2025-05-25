// src/components/formFields/DateFormField.jsx - Simplified with Central Config
import React from "react";
import { Calendar } from "primereact/calendar";
import {
  FormFieldWrapper,
  useFormFieldState,
  PRIMEREACT_PT_CONFIGS,
} from "./styles/formFieldStyles";

const DateFormField = ({
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
      onChange(e); // Calendar passes the event correctly
    }
  };

  // Filter out non-DOM props before spreading
  const { fieldSchemaItem, onFocus, onBlur, ...safeOtherProps } = otherProps;

  // Get centralized Calendar PassThrough configuration
  const ptConfig = PRIMEREACT_PT_CONFIGS.calendar({
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
      <Calendar
        id={id}
        value={value}
        onChange={handleChange}
        onFocus={(e) => handleFocus(e, safeOtherProps.onFocus)}
        onBlur={(e) => handleBlur(e, safeOtherProps.onBlur)}
        disabled={disabled}
        placeholder={placeholder || "dd/mm/yyyy"}
        dateFormat="dd/mm/yy"
        showIcon
        pt={ptConfig}
        title={tooltip}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...safeOtherProps}
      />
    </FormFieldWrapper>
  );
};

export default DateFormField;
