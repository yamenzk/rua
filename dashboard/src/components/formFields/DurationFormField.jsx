// src/components/formFields/DurationFormField.jsx - Enhanced with Unified States
import React from "react";
import { InputNumber } from "primereact/inputnumber";
import {
  FormFieldWrapper,
  useFormFieldState,
  PRIMEREACT_PT_CONFIGS,
  getAddonStyles,
  getAddonIconStyles,
  DESIGN_TOKENS,
} from "./styles/formFieldStyles";
import { useTheme } from "@/contexts/ThemeContext";

const DurationFormField = ({
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
  min = 0,
  displayFormat = "seconds",
  ...otherProps
}) => {
  const theme = useTheme();
  const activePreset = preset || theme.preset;
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
      const syntheticEvent = {
        target: { name: id, value: e.value },
        originalEvent: e.originalEvent,
      };
      onChange(syntheticEvent);
    }
  };

  const {
    fieldSchemaItem,
    onFocus,
    onBlur,
    displayFormat: _displayFormat,
    ...safeOtherProps
  } = otherProps;

  const getDisplayInfo = () => {
    switch (displayFormat) {
      case "minutes":
        return {
          unit: "min",
          placeholder: placeholder || "Duration in minutes",
          helperText: "minutes",
        };
      case "hours":
        return {
          unit: "hrs",
          placeholder: placeholder || "Duration in hours",
          helperText: "hours",
        };
      case "seconds":
      default:
        return {
          unit: "sec",
          placeholder: placeholder || "Duration in seconds",
          helperText: "seconds",
        };
    }
  };

  const displayInfo = getDisplayInfo();

  const ptConfig = PRIMEREACT_PT_CONFIGS.inputNumberWithAddon(
    {
      isFocused,
      isHovered,
      disabled,
      error: !!error,
      size,
      className,
    },
    "right",
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
      {/* Field Group Container - Unified behavior */}
      <div
        className={`
          p-inputgroup w-full ${t.layout.position.relative}
          ${!disabled ? "cursor-text" : ""}
        `}
        onMouseEnter={() => handleFieldGroupMouseEnter(disabled)}
        onMouseLeave={handleFieldGroupMouseLeave}
        onFocus={handleFieldGroupFocus}
        onBlur={handleFieldGroupBlur}
      >
        {/* Input Number - Left side */}
        <InputNumber
          id={id}
          value={
            value !== undefined && value !== null && value !== ""
              ? Number(value)
              : null
          }
          onValueChange={handleChange}
          onFocus={(e) => handleFieldGroupFocus(e, safeOtherProps.onFocus)}
          onBlur={(e) => handleFieldGroupBlur(e, safeOtherProps.onBlur)}
          disabled={disabled}
          placeholder={displayInfo.placeholder}
          mode="decimal"
          min={min}
          minFractionDigits={0}
          maxFractionDigits={0}
          pt={ptConfig}
          title={tooltip}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...safeOtherProps}
        />

        {/* Duration Unit Addon - Right side, perfectly connected */}
        <span
          className={`
            p-inputgroup-addon ${t.layout.flex.center} ${
            t.sizing.component.minWidth
          }
            ${getAddonStyles(
              { isFocused, isHovered, disabled },
              "right",
              activePreset
            )}
          `}
          onClick={() => {
            // Focus the input when addon is clicked
            const input = document.getElementById(id);
            if (input && !disabled) {
              input.focus();
            }
          }}
        >
          <div className={`${t.layout.flex.center} ${t.spacing.gap.tiny}`}>
            <i
              className={`pi pi-clock ${t.typography.xs} ${getAddonIconStyles(
                { isFocused, disabled },
                activePreset
              )}`}
            />
            <span
              className={`${t.typography.sm} ${
                t.typography.weight.medium
              } ${getAddonIconStyles({ isFocused, disabled }, activePreset)}`}
            >
              {displayInfo.unit}
            </span>
          </div>
        </span>
      </div>

      {/* Enhanced helper text */}
      {!error && !disabled && (
        <div
          className={`${t.spacing.panel.margin} ${t.typography.helper} ${t.layout.flex.center} ${t.spacing.gap.tiny}`}
        >
          <i className={`pi pi-info-circle ${t.typography.xs}`} />
          <span>Enter duration in {displayInfo.helperText}</span>
        </div>
      )}
    </FormFieldWrapper>
  );
};
export default DurationFormField;