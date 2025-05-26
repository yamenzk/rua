// src/components/formFields/TimeFormField.jsx - Enhanced with Unified Field Group
import React from "react";
import { Calendar } from "primereact/calendar";
import {
  FormFieldWrapper,
  useFormFieldState,
  PRIMEREACT_PT_CONFIGS,
  DESIGN_TOKENS,
} from "./styles/formFieldStyles";

const TimeFormField = ({
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
  preset = "elevated",
  ...otherProps
}) => {
  // Use enhanced field group state management
  const {
    isFocused,
    isHovered,
    handleFieldGroupFocus,
    handleFieldGroupBlur,
    handleFieldGroupMouseEnter,
    handleFieldGroupMouseLeave,
  } = useFormFieldState();

  const t = DESIGN_TOKENS;

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const { fieldSchemaItem, onFocus, onBlur, ...safeOtherProps } = otherProps;

  const ptConfig = PRIMEREACT_PT_CONFIGS.calendar(
    {
      isFocused,
      isHovered,
      disabled,
      error: !!error,
      size,
      className,
    },
    preset
  );

  return (
    <FormFieldWrapper
      id={id}
      error={error}
      required={required}
      disabled={disabled}
      isFocused={isFocused}
      isHovered={isHovered}
      onMouseEnter={() => handleFieldGroupMouseEnter(disabled)}
      onMouseLeave={handleFieldGroupMouseLeave}
      preset={preset}
    >
      {/* Field Group Container for unified behavior */}
      <div
        className={`
          ${t.layout.position.relative} ${t.sizing.component.fullWidth}
          ${!disabled ? "cursor-text" : ""}
        `}
        onMouseEnter={() => handleFieldGroupMouseEnter(disabled)}
        onMouseLeave={handleFieldGroupMouseLeave}
        onFocus={handleFieldGroupFocus}
        onBlur={handleFieldGroupBlur}
      >
        <Calendar
          id={id}
          value={value}
          onChange={handleChange}
          onFocus={(e) => handleFieldGroupFocus(e, safeOtherProps.onFocus)}
          onBlur={(e) => handleFieldGroupBlur(e, safeOtherProps.onBlur)}
          disabled={disabled}
          placeholder={placeholder || "hh:mm:ss"}
          timeOnly
          showSeconds
          showIcon
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
export default TimeFormField;