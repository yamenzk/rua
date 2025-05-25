// src/components/formFields/TimeFormField.jsx - Refactored with Central Styles
import React from "react";
import { Calendar } from "primereact/calendar";
import {
  FormFieldWrapper,
  useFormFieldState,
  useFormFieldClasses,
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

  // Get consistent input styling
  const inputClasses = useFormFieldClasses({
    isFocused,
    isHovered,
    disabled,
    error: !!error,
    size,
    className,
  });

  // Calendar PassThrough configuration for Time only
  const ptConfig = {
    root: {
      className: "inline-flex max-w-full relative w-full",
    },
    input: {
      root: {
        className: `${inputClasses} ${
          !disabled ? "border-r-0 rounded-r-none shadow-none" : ""
        }`,
      },
    },
    dropdownButton: {
      root: {
        className: `px-3 py-3 border border-l-0 text-text-color transition-all duration-200 ease-out ${
          isFocused && !disabled
            ? "border-primary-400 bg-primary-50"
            : !isFocused && isHovered && !disabled
            ? "border-primary-400 bg-surface-0"
            : disabled
            ? "bg-surface-100 border-none cursor-not-allowed"
            : "border-surface-100 bg-surface-0 hover:bg-surface-0"
        } ${!disabled ? "rounded-l-none rounded-r-2xl" : "rounded-2xl"}`,
      },
      icon: {
        className: `text-sm transition-colors duration-200 ${
          disabled
            ? "text-text-color"
            : isFocused
            ? "text-primary-600"
            : "text-text-color-secondary hover:text-primary-500"
        }`,
      },
    },
    panel: {
      className:
        "bg-surface-0 border-none shadow-xl rounded-2xl mt-2 overflow-hidden backdrop-blur-sm",
    },
    // Time picker specific styling (no header needed for time-only)
    timePicker: {
      className: "flex justify-center items-center p-6 bg-surface-0",
    },
    separatorContainer: {
      className: "flex items-center flex-col px-3",
    },
    separator: {
      className: "text-2xl font-bold text-text-color-secondary",
    },
    hourPicker: {
      className: "flex items-center flex-col px-3",
    },
    minutePicker: {
      className: "flex items-center flex-col px-3",
    },
    secondPicker: {
      className: "flex items-center flex-col px-3",
    },
    ampmPicker: {
      className: "flex items-center flex-col px-3",
    },
    incrementButton: {
      className:
        "flex items-center justify-center cursor-pointer w-10 h-10 text-text-color-secondary border-0 bg-transparent rounded-xl transition-all duration-200 hover:text-text-color hover:bg-primary-50 mb-2",
    },
    decrementButton: {
      className:
        "flex items-center justify-center cursor-pointer w-10 h-10 text-text-color-secondary border-0 bg-transparent rounded-xl transition-all duration-200 hover:text-text-color hover:bg-primary-50 mt-2",
    },
    // Time display styling
    hour: {
      className:
        "text-2xl font-bold text-text-color bg-surface-100 rounded-xl px-3 py-2 min-w-[3rem] text-center",
    },
    minute: {
      className:
        "text-2xl font-bold text-text-color bg-surface-100 rounded-xl px-3 py-2 min-w-[3rem] text-center",
    },
    second: {
      className:
        "text-2xl font-bold text-text-color bg-surface-100 rounded-xl px-3 py-2 min-w-[3rem] text-center",
    },
    ampm: {
      className:
        "text-lg font-bold text-text-color bg-primary-100 text-primary-700 rounded-xl px-3 py-2 min-w-[3rem] text-center",
    },
  };

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
    </FormFieldWrapper>
  );
};

export default TimeFormField;
