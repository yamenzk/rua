// src/components/formFields/GenericTextareaFormField.jsx - Enhanced with Presets
import React, { useState, useRef, useEffect } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import {
  FormFieldWrapper,
  useFormFieldState,
  useFormFieldClasses,
  DESIGN_TOKENS,
  getInteractionPreset,
} from "./styles/formFieldStyles";
import { useTheme } from "@/contexts/ThemeContext";

const GenericTextareaFormField = ({
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
  rows = 3,
  maxRows = 10,
  minRows = 2,
  maxLength,
  showCharacterCount = false,
  autoResize = true,
  resizeMode = "both",
  showToolbar = false,
  ...otherProps
}) => {
  const theme = useTheme();
  const activePreset = preset || theme.preset;
  const textareaRef = useRef(null);
  const [characterCount, setCharacterCount] = useState(0);
  const [isFocusedInternal, setIsFocusedInternal] = useState(false);

  const {
    isFocused,
    isHovered,
    handleFocus,
    handleBlur,
    handleMouseEnter,
    handleMouseLeave,
  } = useFormFieldState();

  const t = DESIGN_TOKENS;
  const interactions = getInteractionPreset("input", activePreset) || {};

  useEffect(() => {
    const text = value || "";
    setCharacterCount(text.length);
  }, [value]);

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue =
        (value || "").substring(0, start) + "\t" + (value || "").substring(end);

      if (onChange) {
        const syntheticEvent = {
          target: { name: id, value: newValue },
          originalEvent: e,
        };
        onChange(syntheticEvent);
      }

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(start + 1, start + 1);
        }
      }, 0);
    }

    if (otherProps.onKeyDown) {
      otherProps.onKeyDown(e);
    }
  };

  const formatText = (type) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = (value || "").substring(start, end);

    if (selectedText) {
      let formattedText = selectedText;
      let prefix = "";
      let suffix = "";

      switch (type) {
        case "bold":
          prefix = "**";
          suffix = "**";
          break;
        case "italic":
          prefix = "*";
          suffix = "*";
          break;
        case "code":
          prefix = "`";
          suffix = "`";
          break;
        case "quote":
          formattedText = selectedText
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n");
          break;
        case "list":
          formattedText = selectedText
            .split("\n")
            .map((line) => `- ${line}`)
            .join("\n");
          break;
      }

      const newValue =
        (value || "").substring(0, start) +
        prefix +
        formattedText +
        suffix +
        (value || "").substring(end);

      if (onChange) {
        const syntheticEvent = {
          target: { name: id, value: newValue },
        };
        onChange(syntheticEvent);
      }
    }
  };

  const {
    fieldSchemaItem,
    onFocus,
    onBlur,
    onKeyDown,
    showCharacterCount: _showCharacterCount,
    showToolbar: _showToolbar,
    maxRows: _maxRows,
    minRows: _minRows,
    resizeMode: _resizeMode,
    ...safeOtherProps
  } = otherProps;

  const textareaClasses = useFormFieldClasses({
    isFocused,
    isHovered,
    disabled,
    error: !!error,
    size,
    preset: activePreset,
    className: `${className || ""} ${
      resizeMode === "none"
        ? "resize-none"
        : resizeMode === "vertical"
        ? "resize-y"
        : resizeMode === "horizontal"
        ? "resize-x"
        : "resize"
    }`,
  });

  const textareaPT = {
    root: {
      className: `${textareaClasses} ${t.effects.transition.base} leading-relaxed`,
      style: {
        minHeight: `${minRows * 1.5}rem`,
        maxHeight: maxRows ? `${maxRows * 1.5}rem` : undefined,
      },
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
      preset={activePreset}
    >
      <div className={`${t.spacing.gap.small} ${t.layout.flex.col}`}>
        {/* Enhanced Formatting Toolbar */}
        {showToolbar && !disabled && (
          <div
            className={`
              ${t.layout.flex.center} ${t.spacing.gap.tiny} ${
              t.spacing.panel.paddingSmall
            } 
              ${t.colors.background.surfaceAlt} ${t.radius.base} ${
              t.colors.border.default
            } ${t.borders.width.base}
              ${activePreset === "elevated" ? t.effects.shadow.base : ""}
            `}
          >
            <div className={`${t.layout.flex.center} ${t.spacing.gap.tiny}`}>
              <Button
                type="button"
                icon="pi pi-bold"
                onClick={() => formatText("bold")}
                size="small"
                text
                rounded
                className={`${t.sizing.icon.xl} ${t.colors.text.secondary} hover:${t.colors.text.default} hover:${t.colors.background.hover.surface}`}
                tooltip="Bold (Ctrl+B)"
                tooltipOptions={{ position: "top" }}
              />
              <Button
                type="button"
                icon="pi pi-italic"
                onClick={() => formatText("italic")}
                size="small"
                text
                rounded
                className={`${t.sizing.icon.xl} ${t.colors.text.secondary} hover:${t.colors.text.default} hover:${t.colors.background.hover.surface}`}
                tooltip="Italic (Ctrl+I)"
                tooltipOptions={{ position: "top" }}
              />
              <Button
                type="button"
                icon="pi pi-code"
                onClick={() => formatText("code")}
                size="small"
                text
                rounded
                className={`${t.sizing.icon.xl} ${t.colors.text.secondary} hover:${t.colors.text.default} hover:${t.colors.background.hover.surface}`}
                tooltip="Code"
                tooltipOptions={{ position: "top" }}
              />
            </div>

            <div
              className={`w-px h-6 ${t.colors.background.surfaceStrong} ${t.spacing.margin.tiny}`}
            />

            <div className={`${t.layout.flex.center} ${t.spacing.gap.tiny}`}>
              <Button
                type="button"
                icon="pi pi-list"
                onClick={() => formatText("list")}
                size="small"
                text
                rounded
                className={`${t.sizing.icon.xl} ${t.colors.text.secondary} hover:${t.colors.text.default} hover:${t.colors.background.hover.surface}`}
                tooltip="Bullet List"
                tooltipOptions={{ position: "top" }}
              />
              <Button
                type="button"
                icon="pi pi-comments"
                onClick={() => formatText("quote")}
                size="small"
                text
                rounded
                className={`${t.sizing.icon.xl} ${t.colors.text.secondary} hover:${t.colors.text.default} hover:${t.colors.background.hover.surface}`}
                tooltip="Quote"
                tooltipOptions={{ position: "top" }}
              />
            </div>
          </div>
        )}

        {/* Enhanced Textarea */}
        <div className={t.layout.position.relative}>
          <InputTextarea
            ref={textareaRef}
            id={id}
            value={value || ""}
            onChange={handleChange}
            onFocus={(e) => {
              setIsFocusedInternal(true);
              handleFocus(e, safeOtherProps.onFocus);
            }}
            onBlur={(e) => {
              setIsFocusedInternal(false);
              handleBlur(e, safeOtherProps.onBlur);
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={rows}
            autoResize={autoResize}
            maxLength={maxLength}
            pt={textareaPT}
            title={tooltip}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            {...safeOtherProps}
          />

          {/* Enhanced Character Count Badge */}
          {showCharacterCount && (
            <div
              className={`${t.layout.position.absolute} bottom-2 right-2 ${t.interactions.pointerEvents.none}`}
            >
              <div
                className={`
                  ${t.typography.xs} px-2 py-1 ${
                  t.radius.small
                } backdrop-blur-sm ${t.effects.transition.base}
                  ${
                    maxLength && characterCount > maxLength * 0.9
                      ? characterCount >= maxLength
                        ? `${t.colors.background.error.replace(
                            "bg-red-50/30",
                            "bg-red-100"
                          )} ${t.colors.text.error} ${t.colors.border.error} ${
                            t.borders.width.base
                          }`
                        : `${t.colors.background.warning} ${t.colors.text.warning} border border-orange-200`
                      : `${t.colors.background.surfaceDisabled} ${t.colors.text.secondary} ${t.colors.border.light} ${t.borders.width.base}`
                  }
                `}
              >
                {characterCount}
                {maxLength && (
                  <>
                    <span className={`${t.colors.text.secondary}/50 mx-1`}>
                      /
                    </span>
                    {maxLength}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Focus Ring */}
          {isFocusedInternal && !disabled && activePreset === "dynamic" && (
            <div
              className={`${t.layout.position.absolute} ${t.layout.position.inset} ${t.colors.border.focus} ${t.borders.width.thick} ${t.radius.base} ${t.interactions.pointerEvents.none} ${t.effects.opacity.subtle} animate-pulse`}
            />
          )}
        </div>

        {/* Enhanced Helper Text */}
        {!error && (showCharacterCount || showToolbar) && (
          <div
            className={`${t.layout.flex.between} ${t.typography.xs} ${t.colors.text.secondary}`}
          >
            <div className={`${t.layout.flex.center} ${t.spacing.gap.base}`}>
              {showToolbar && (
                <span
                  className={`${t.layout.flex.center} ${t.spacing.gap.tiny}`}
                >
                  <i className={`pi pi-info-circle ${t.typography.xs}`} />
                  Select text to format • Tab to indent
                </span>
              )}
            </div>
            {showCharacterCount && maxLength && (
              <span
                className={`${
                  characterCount > maxLength * 0.9 ? t.colors.text.warning : ""
                }`}
              >
                {maxLength - characterCount} characters remaining
              </span>
            )}
          </div>
        )}
      </div>
    </FormFieldWrapper>
  );
};

export default GenericTextareaFormField;