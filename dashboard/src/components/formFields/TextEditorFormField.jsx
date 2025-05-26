// src/components/formFields/TextEditorFormField.jsx - Enhanced with Theme Integration
import React from "react";
import { Editor } from "primereact/editor";
import {
  FormFieldWrapper,
  useFormFieldState,
  DESIGN_TOKENS,
  getInteractionPreset,
} from "./styles/formFieldStyles";
import { useTheme } from "@/contexts/ThemeContext";

const TextEditorFormField = ({
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
  preset, // ← Removed default value to let theme take over
  style,
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

  const handleChange = (e) => {
    if (onChange) {
      const syntheticEvent = {
        target: { name: id, value: e.htmlValue },
        originalEvent: e,
      };
      onChange(syntheticEvent);
    }
  };

  const { fieldSchemaItem, onFocus, onBlur, onTextChange, ...safeOtherProps } =
    otherProps;

  const defaultStyle = { height: "200px" };
  const finalStyle = { ...defaultStyle, ...style };

  const ptConfig = {
    root: {
      className: `
        ${t.sizing.component.fullWidth} ${t.radius.base} ${
        t.borders.width.base
      } 
        ${t.effects.transition.base} ${t.layout.overflow.hidden}
        ${interactions.base || ""}
        ${
          isFocused && !disabled
            ? `${t.colors.border.focus} shadow-none`
            : !isFocused && isHovered && !disabled
            ? t.colors.border.hover
            : disabled
            ? `${t.colors.background.surfaceDisabled} ${t.colors.border.disabled}`
            : t.colors.border.default
        }
        ${
          error && !disabled
            ? `${t.colors.border.error} ${t.colors.background.error}`
            : ""
        }
        ${activePreset === "elevated" ? t.effects.shadow.base : ""} 
        ${className || ""}
      `,
    },
    toolbar: {
      className: `
        ${t.borders.sides.bottom} ${t.colors.border.medium} ${
        t.colors.background.surfaceAlt
      } 
        px-4 py-3 ${t.layout.flex.wrap} ${t.spacing.gap.tiny}
        ${
          disabled
            ? `${t.effects.opacity.disabled} ${t.interactions.pointerEvents.none}`
            : ""
        }
      `,
    },
    formats: {
      className: `${t.layout.flex.wrap} ${t.spacing.gap.tiny}`,
    },
    header: {
      className: `${t.borders.sides.bottom} ${t.colors.border.medium} ${t.colors.background.surfaceAlt}`,
    },
    content: {
      className: `
        min-h-[150px] ${t.spacing.panel.padding} ${
        t.colors.background.surface
      } ${t.colors.text.default} ${t.typography.sm}
        ${t.effects.focusRing}
        ${
          disabled
            ? `${t.colors.background.surfaceDisabled} ${t.colors.text.disabled} ${t.interactions.cursor.notAllowed}`
            : ""
        }
      `,
      style: finalStyle,
    },
    bold: {
      className: `${t.sizing.icon.xl} ${t.radius.small} ${t.borders.width.none} ${t.colors.background.transparent} hover:${t.colors.background.surfaceStrong} ${t.colors.text.secondary} hover:${t.colors.text.default} ${t.effects.transition.colors}`,
    },
    italic: {
      className: `${t.sizing.icon.xl} ${t.radius.small} ${t.borders.width.none} ${t.colors.background.transparent} hover:${t.colors.background.surfaceStrong} ${t.colors.text.secondary} hover:${t.colors.text.default} ${t.effects.transition.colors}`,
    },
    underline: {
      className: `${t.sizing.icon.xl} ${t.radius.small} ${t.borders.width.none} ${t.colors.background.transparent} hover:${t.colors.background.surfaceStrong} ${t.colors.text.secondary} hover:${t.colors.text.default} ${t.effects.transition.colors}`,
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
      preset={activePreset} // ← Use activePreset
    >
      <div className={t.sizing.component.fullWidth}>
        <Editor
          id={id}
          value={value || ""}
          onTextChange={handleChange}
          onFocus={(e) => handleFocus(e, safeOtherProps.onFocus)}
          onBlur={(e) => handleBlur(e, safeOtherProps.onBlur)}
          disabled={disabled}
          placeholder={placeholder}
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

export default TextEditorFormField;
