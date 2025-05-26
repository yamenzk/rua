// src/components/formFields/PercentFormField.jsx - Enhanced with Unified States
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

const PercentFormField = ({
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
  max = 100,
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

  const { fieldSchemaItem, onFocus, onBlur, ...safeOtherProps } = otherProps;

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
          placeholder={placeholder || "0"}
          mode="decimal"
          min={min}
          max={max}
          minFractionDigits={0}
          maxFractionDigits={2}
          pt={ptConfig}
          title={tooltip}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...safeOtherProps}
        />

        {/* Percent Symbol Addon - Right side, perfectly connected */}
        <span
          className={`
            p-inputgroup-addon ${t.layout.flex.center} min-w-[3rem]
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
          <span
            className={`${t.typography.sm} ${
              t.typography.weight.medium
            } ${getAddonIconStyles({ isFocused, disabled }, activePreset)}`}
          >
            %
          </span>
        </span>
      </div>
    </FormFieldWrapper>
  );
};
export default PercentFormField;