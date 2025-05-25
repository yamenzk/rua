// src/components/formFields/DateTimeFormField.jsx - Refactored with Central Styles
import React from "react";
import { Calendar } from "primereact/calendar";
import {
  FormFieldWrapper,
  useFormFieldState,
  useFormFieldClasses,
  getAddonStyles,
  getAddonIconStyles,
} from "./styles/formFieldStyles";

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

  // Calendar PassThrough configuration for DateTime
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
        className: getAddonStyles({ isFocused, isHovered, disabled }, "right"),
      },
      icon: {
        className: getAddonIconStyles({ isFocused, disabled }),
      },
    },
    panel: {
      className:
        "bg-surface-0 border-none shadow-xl rounded-2xl mt-2 overflow-hidden backdrop-blur-sm",
    },
    header: {
      className:
        "flex items-center justify-between p-4 text-text-color bg-surface-0 font-semibold border-b border-surface-100",
    },
    previousButton: {
      className:
        "flex items-center justify-center cursor-pointer w-8 h-8 text-text-color-secondary border-0 bg-transparent rounded-xl transition-all duration-200 hover:text-text-color hover:bg-surface-100",
    },
    nextButton: {
      className:
        "flex items-center justify-center cursor-pointer w-8 h-8 text-text-color-secondary border-0 bg-transparent rounded-xl transition-all duration-200 hover:text-text-color hover:bg-surface-100",
    },
    title: {
      className: "leading-8 mx-auto font-medium text-text-color",
    },
    monthTitle: {
      className:
        "text-text-color transition duration-200 font-medium p-2 mr-2 hover:text-primary-500 rounded-lg hover:bg-primary-50",
    },
    yearTitle: {
      className:
        "text-text-color transition duration-200 font-medium p-2 hover:text-primary-500 rounded-lg hover:bg-primary-50",
    },
    table: {
      className: "border-collapse w-full my-2",
    },
    tableHeaderCell: {
      className: "p-2",
    },
    weekday: {
      className: "text-text-color-secondary font-medium text-sm",
    },
    day: {
      className: "p-1",
    },
    dayLabel: {
      className:
        "w-10 h-10 rounded-xl transition-all duration-200 border-transparent border flex items-center justify-center mx-auto overflow-hidden relative focus:outline-none focus:ring-2 focus:ring-primary-200 cursor-pointer text-text-color hover:bg-primary-50 data-[p-highlight=true]:text-primary-700 data-[p-highlight=true]:bg-primary-100 data-[p-highlight=true]:hover:bg-primary-200",
    },
    // Time picker specific styling
    timePicker: {
      className:
        "flex justify-center items-center border-t border-surface-100 p-4 bg-surface-50",
    },
    separatorContainer: {
      className: "flex items-center flex-col px-2",
    },
    separator: {
      className: "text-xl font-bold text-text-color-secondary",
    },
    hourPicker: {
      className: "flex items-center flex-col px-2",
    },
    minutePicker: {
      className: "flex items-center flex-col px-2",
    },
    secondPicker: {
      className: "flex items-center flex-col px-2",
    },
    ampmPicker: {
      className: "flex items-center flex-col px-2",
    },
    incrementButton: {
      className:
        "flex items-center justify-center cursor-pointer w-8 h-8 text-text-color-secondary border-0 bg-transparent rounded-xl transition-all duration-200 hover:text-text-color hover:bg-surface-100",
    },
    decrementButton: {
      className:
        "flex items-center justify-center cursor-pointer w-8 h-8 text-text-color-secondary border-0 bg-transparent rounded-xl transition-all duration-200 hover:text-text-color hover:bg-surface-100",
    },
    monthPicker: {
      className: "my-2 p-2",
    },
    month: {
      className:
        "w-1/3 inline-flex items-center justify-center cursor-pointer overflow-hidden relative p-3 transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 text-text-color hover:bg-primary-50 data-[p-highlight=true]:text-primary-700 data-[p-highlight=true]:bg-primary-100",
    },
    yearPicker: {
      className: "my-2 p-2",
    },
    year: {
      className:
        "w-1/2 inline-flex items-center justify-center cursor-pointer overflow-hidden relative p-3 transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 text-text-color hover:bg-primary-50 data-[p-highlight=true]:text-primary-700 data-[p-highlight=true]:bg-primary-100",
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
    </FormFieldWrapper>
  );
};

export default DateTimeFormField;
