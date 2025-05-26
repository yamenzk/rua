// src/components/formFields/DateTimeFormField.jsx - Enhanced with Unified Field Group
import React from "react";
import { Calendar } from "primereact/calendar";
import {
  FormFieldWrapper,
  useFormFieldState,
  PRIMEREACT_PT_CONFIGS,
  DESIGN_TOKENS,
} from "./styles/formFieldStyles";
import { useTheme } from "@/contexts/ThemeContext";

const DateTimeFormField = ({
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
  const activePreset = preset || theme.preset;
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
    activePreset
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
      preset={activePreset}
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
          placeholder={placeholder || "dd/mm/yyyy hh:mm:ss"}
          dateFormat="dd/mm/yy"
          showTime
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
export default DateTimeFormField;