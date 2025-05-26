// src/components/formFields/CurrencyFormField.jsx - Enhanced with Unified States
import React from "react";
import { InputNumber } from "primereact/inputnumber";
import {
  FormFieldWrapper,
  useFormFieldState,
  PRIMEREACT_PT_CONFIGS,
  getAddonStyles,
  DESIGN_TOKENS,
} from "./styles/formFieldStyles";
import { useTheme } from "@/contexts/ThemeContext";

const CurrencyFormField = ({
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
  currency = "AED",
  locale = "en-AE",
  minFractionDigits = 2,
  maxFractionDigits = 2,
  min,
  max,
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
    "left",
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
      {/* Field Group Container - This creates unified hover/focus behavior */}
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
        {/* Currency Symbol Addon - Perfectly connected */}
        <span
          className={`
            p-inputgroup-addon flex items-center
            ${getAddonStyles(
              { isFocused, isHovered, disabled },
              "left",
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
          <img src="/aed.svg" alt="AED" className="h-4 w-4" />
        </span>

        {/* Input Number - Perfectly connected */}
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
          placeholder={placeholder || "0.00"}
          mode="decimal"
          locale={locale}
          minFractionDigits={minFractionDigits}
          maxFractionDigits={maxFractionDigits}
          min={min}
          max={max}
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
export default CurrencyFormField;