// src/components/formFields/CheckSwitchFormField.jsx - Enhanced with Theme Integration
import React from "react";
import { InputSwitch } from "primereact/inputswitch";
import { Checkbox } from "primereact/checkbox";
import {
  FormFieldWrapper,
  useFormFieldState,
  PRIMEREACT_PT_CONFIGS,
  DESIGN_TOKENS,
  getInteractionPreset,
} from "./styles/formFieldStyles";
import { parseDescription } from "@/components/document/utils/schemaUtils";
import { useTheme } from "@/contexts/ThemeContext";

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
  preset, // ← No default value, let theme take over
  fieldSchemaItem,
  variant = "auto",
  label,
  labelPosition = "right",
  showLabel = true,
  ...otherProps
}) => {
  // Theme integration
  const theme = useTheme();
  const activePreset = preset || theme.preset;

  const {
    isFocused,
    isHovered,
    handleFocus,
    handleBlur,
    handleMouseEnter,
    handleMouseLeave,
  } = useFormFieldState();

  const t = DESIGN_TOKENS;
  const interactions = getInteractionPreset("input", activePreset) || {}; // ← Use activePreset

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
        newCheckedState = e.value;
      } else {
        newCheckedState = e.checked;
      }

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

  const {
    fieldSchemaItem: _fieldSchemaItem,
    onFocus,
    onBlur,
    ...safeOtherProps
  } = otherProps;

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

  // Enhanced Switch Rendering
  if (shouldUseSwitch) {
    const switchPT = {
      ...PRIMEREACT_PT_CONFIGS.inputSwitch(
        {
          isFocused,
          isHovered,
          disabled,
          error: !!error,
          size,
        },
        activePreset // ← Use activePreset
      ),
      root: {
        className: `
          ${t.layout.position.relative} ${t.layout.flex.inlineCenter} ${
          t.interactions.cursor.pointer
        } 
          ${t.effects.transition.base} ${t.effects.focusRing} ${t.radius.full}
          ${
            disabled
              ? `${t.effects.opacity.disabled} ${t.interactions.cursor.notAllowed}`
              : interactions.base || ""
          }
          ${error ? t.effects.shadow.error : ""}
          ${className || ""}
          ${activePreset === "dynamic" ? "hover:scale-105" : ""}
        `,
      },
      slider: {
        className: `
          ${t.effects.transition.base} ${t.radius.full}
          ${
            disabled
              ? t.colors.background.surfaceStrong
              : checked
              ? `${t.colors.background.primary} hover:${t.colors.background.primaryDark}`
              : `${t.colors.background.surfaceStrong} hover:${t.colors.background.surfaceAlt}`
          }
          ${activePreset === "elevated" ? t.effects.shadow.base : ""}
        `,
      },
      handle: {
        className: `
          ${t.effects.transition.base} ${t.radius.full} ${
          t.effects.shadow.base
        } 
          ${t.borders.width.thick} border-white ${
          t.colors.background.white
        } transform
          ${
            size === "large"
              ? `${t.sizing.icon.large} w-7 h-7`
              : size === "compact"
              ? `${t.sizing.icon.compact} w-4 h-4`
              : `${t.sizing.icon.base} w-5 h-5`
          }
          ${checked ? "translate-x-full" : "translate-x-0"}
          ${activePreset === "elevated" ? t.effects.shadow.strong : ""}
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
              ? "w-16 h-9"
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
        preset={activePreset} // ← Use activePreset
      >
        {renderControlWithLabel(
          switchControl,
          displayLabel,
          labelPosition,
          showLabel,
          id,
          required,
          activePreset // ← Use activePreset
        )}
      </FormFieldWrapper>
    );
  }

  // Enhanced Checkbox Rendering
  const checkboxPT = {
    ...PRIMEREACT_PT_CONFIGS.checkbox(
      {
        isFocused,
        isHovered,
        disabled,
        error: !!error,
        size,
      },
      activePreset // ← Use activePreset
    ),
    root: {
      className: `${t.layout.position.relative} ${t.layout.flex.inlineCenter}`,
    },
    box: {
      className: `
        ${t.effects.transition.base} ${t.borders.width.thick} ${t.radius.small} 
        ${t.layout.flex.center} ${t.effects.focusRing} ${
        t.interactions.cursor.pointer
      }
        ${
          size === "large"
            ? `${t.sizing.icon.large} w-7 h-7`
            : size === "compact"
            ? `${t.sizing.icon.compact} w-4 h-4`
            : `${t.sizing.icon.base} w-5 h-5`
        }
        ${
          error
            ? `${t.colors.border.error} ${t.effects.shadow.error}`
            : disabled
            ? `${t.colors.border.medium} ${t.colors.background.surfaceDisabled} ${t.interactions.cursor.notAllowed}`
            : checked
            ? `${t.colors.border.focusStrong} ${t.colors.background.primary} hover:${t.colors.background.primaryDark} ${t.effects.shadow.base}`
            : `${t.colors.border.medium} ${t.colors.background.surface} ${
                interactions.hover || "hover:bg-surface-100"
              } ${t.effects.shadow.base}`
        }
        ${activePreset === "elevated" ? t.effects.shadow.base : ""}
        ${activePreset === "dynamic" ? "hover:scale-105" : ""}
      `,
    },
    icon: {
      className: `
        ${t.effects.transition.base} ${t.colors.text.white} ${
        t.typography.weight.bold
      }
        ${
          size === "large"
            ? t.typography.base
            : size === "compact"
            ? t.typography.xs
            : t.typography.sm
        }
        ${
          checked
            ? `${t.effects.opacity.visible} ${t.effects.scale.none}`
            : `${t.effects.opacity.hidden} ${t.effects.scale.down}`
        }
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
      preset={activePreset} // ← Use activePreset
    >
      {renderControlWithLabel(
        checkboxControl,
        displayLabel,
        labelPosition,
        showLabel,
        id,
        required,
        activePreset // ← Use activePreset
      )}
    </FormFieldWrapper>
  );
};

// Enhanced helper function with preset support
const renderControlWithLabel = (
  control,
  displayLabel,
  labelPosition,
  showLabel,
  id,
  required,
  activePreset // ← Use activePreset parameter name for clarity
) => {
  const t = DESIGN_TOKENS;
  const interactions = getInteractionPreset("input", activePreset) || {}; // ← Use activePreset

  if (!showLabel || !displayLabel) {
    return control;
  }

  const labelElement = (
    <label
      htmlFor={id}
      className={`
        ${t.typography.sm} ${t.colors.text.default} ${
        t.interactions.cursor.pointer
      } 
        ${t.effects.transition.colors} hover:${t.colors.text.primary}
        ${labelPosition === "top" || labelPosition === "bottom" ? "block" : ""}
        ${required ? "after:content-['*'] after:text-red-500 after:ml-1" : ""}
        ${activePreset === "dynamic" ? "hover:scale-[1.02] transform" : ""}
      `}
    >
      {displayLabel}
    </label>
  );

  const spacing =
    labelPosition === "top" || labelPosition === "bottom"
      ? t.spacing.gap.small.replace("gap-", "space-y-")
      : t.spacing.gap.base.replace("gap-", "space-x-");

  if (labelPosition === "top") {
    return (
      <div className={`${t.layout.flex.col} ${spacing}`}>
        {labelElement}
        {control}
      </div>
    );
  }

  if (labelPosition === "bottom") {
    return (
      <div className={`${t.layout.flex.col} ${spacing}`}>
        {control}
        {labelElement}
      </div>
    );
  }

  if (labelPosition === "left") {
    return (
      <div className={`${t.layout.flex.center} ${spacing}`}>
        {labelElement}
        {control}
      </div>
    );
  }

  // Default: right
  return (
    <div className={`${t.layout.flex.center} ${spacing}`}>
      {control}
      {labelElement}
    </div>
  );
};

export default CheckSwitchFormField;
