// src/components/formFields/CheckSwitchFormField.jsx - Redesigned with Central Styles
import React from "react";
import { InputSwitch } from "primereact/inputswitch";
import { Checkbox } from "primereact/checkbox";
import {
  FormFieldWrapper,
  useFormFieldState,
  PRIMEREACT_PT_CONFIGS,
} from "./styles/formFieldStyles";
import { parseDescription } from "@/components/document/utils/schemaUtils";

const CheckSwitchFormField = ({
  id,
  checked,
  onChange,
  disabled,
  className,
  tooltip,
  required,
  error,
  size = "base",
  fieldSchemaItem,
  variant = "auto", // "auto", "switch", "checkbox"
  label, // Optional inline label for the control
  labelPosition = "right", // "left", "right", "top", "bottom"
  showLabel = true, // Whether to show inline label
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

  // Parse field description for UI hints
  const descriptionData = parseDescription(fieldSchemaItem?.description || "");

  // Determine which control to use
  const shouldUseSwitch =
    variant === "switch" ||
    (variant === "auto" &&
      (descriptionData.asSwitch || descriptionData.ui_control === "switch"));

  // Get label text
  const displayLabel =
    label ||
    descriptionData.inputLabel ||
    (shouldUseSwitch ? null : fieldSchemaItem?.label) ||
    "";

  const handleChange = (e) => {
    if (onChange) {
      let newCheckedState;

      if (shouldUseSwitch) {
        newCheckedState = e.value; // InputSwitch uses e.value
      } else {
        newCheckedState = e.checked; // Checkbox uses e.checked
      }

      // Create event structure expected by form handler
      const syntheticEvent = {
        target: {
          name: id,
          value: newCheckedState,
        },
        originalEvent: e.originalEvent || e,
      };
      onChange(syntheticEvent);
    }
  };

  // Filter out non-DOM props
  const {
    fieldSchemaItem: _fieldSchemaItem,
    onFocus,
    onBlur,
    ...safeOtherProps
  } = otherProps;

  // Common props for both switch and checkbox
  const commonProps = {
    inputId: id,
    checked: !!checked,
    onChange: handleChange,
    onFocus: (e) => handleFocus(e, safeOtherProps.onFocus),
    onBlur: (e) => handleBlur(e, safeOtherProps.onBlur),
    disabled,
    title: tooltip,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-error` : undefined,
    ...safeOtherProps,
  };

  // Render Switch
  if (shouldUseSwitch) {
    const switchPT = {
      ...PRIMEREACT_PT_CONFIGS.inputSwitch({
        isFocused,
        isHovered,
        disabled,
        error: !!error,
        size,
      }),
      root: {
        className: `
          relative inline-flex items-center cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200 rounded-full
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${error ? "ring-2 ring-red-200" : ""}
          ${className || ""}
        `,
      },
      slider: {
        className: `
          transition-all duration-200 rounded-full
          ${
            disabled
              ? "bg-surface-300"
              : checked
              ? "bg-primary-500 hover:bg-primary-600"
              : "bg-surface-300 hover:bg-surface-400"
          }
        `,
      },
      handle: {
        className: `
          transition-all duration-200 rounded-full shadow-sm border-2 border-white
          ${
            size === "large"
              ? "w-6 h-6"
              : size === "compact"
              ? "w-4 h-4"
              : "w-5 h-5"
          }
          ${checked ? "bg-white" : "bg-white"}
        `,
      },
    };

    const switchControl = (
      <InputSwitch
        {...commonProps}
        pt={switchPT}
        className={`
          ${
            size === "large"
              ? "w-14 h-8"
              : size === "compact"
              ? "w-10 h-6"
              : "w-12 h-7"
          }
        `}
      />
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
        className={className}
      >
        {renderControlWithLabel(
          switchControl,
          displayLabel,
          labelPosition,
          showLabel,
          id,
          required
        )}
      </FormFieldWrapper>
    );
  }

  // Render Checkbox
  const checkboxPT = {
    ...PRIMEREACT_PT_CONFIGS.checkbox({
      isFocused,
      isHovered,
      disabled,
      error: !!error,
      size,
    }),
    root: {
      className: "relative inline-flex items-center",
    },
    box: {
      className: `
        transition-all duration-200 border-2 rounded-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-200
        ${
          size === "large"
            ? "w-6 h-6"
            : size === "compact"
            ? "w-4 h-4"
            : "w-5 h-5"
        }
        ${
          error
            ? "border-red-300 focus:ring-red-200"
            : disabled
            ? "border-surface-200 bg-surface-100"
            : checked
            ? "border-primary-500 bg-primary-500 hover:border-primary-600 hover:bg-primary-600"
            : "border-surface-300 bg-surface-0 hover:border-primary-400"
        }
      `,
    },
    icon: {
      className: `
        transition-all duration-200 text-white
        ${
          size === "large"
            ? "text-sm"
            : size === "compact"
            ? "text-xs"
            : "text-sm"
        }
        ${checked ? "opacity-100 scale-100" : "opacity-0 scale-75"}
      `,
    },
  };

  const checkboxControl = <Checkbox {...commonProps} pt={checkboxPT} />;

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
      className={className}
    >
      {renderControlWithLabel(
        checkboxControl,
        displayLabel,
        labelPosition,
        showLabel,
        id,
        required
      )}
    </FormFieldWrapper>
  );
};

// Helper function to render control with label in different positions
const renderControlWithLabel = (
  control,
  displayLabel,
  labelPosition,
  showLabel,
  id,
  required
) => {
  if (!showLabel || !displayLabel) {
    return control;
  }

  const labelElement = (
    <label
      htmlFor={id}
      className={`
        text-sm text-text-color cursor-pointer transition-colors duration-200 hover:text-primary-600
        ${labelPosition === "top" || labelPosition === "bottom" ? "block" : ""}
        ${required ? "after:content-['*'] after:text-red-500 after:ml-1" : ""}
      `}
    >
      {displayLabel}
    </label>
  );

  const spacing =
    labelPosition === "top" || labelPosition === "bottom"
      ? "space-y-2"
      : "space-x-3";

  if (labelPosition === "top") {
    return (
      <div className={`flex flex-col ${spacing}`}>
        {labelElement}
        {control}
      </div>
    );
  }

  if (labelPosition === "bottom") {
    return (
      <div className={`flex flex-col ${spacing}`}>
        {control}
        {labelElement}
      </div>
    );
  }

  if (labelPosition === "left") {
    return (
      <div className={`flex items-center ${spacing}`}>
        {labelElement}
        {control}
      </div>
    );
  }

  // Default: right
  return (
    <div className={`flex items-center ${spacing}`}>
      {control}
      {labelElement}
    </div>
  );
};

export default CheckSwitchFormField;
