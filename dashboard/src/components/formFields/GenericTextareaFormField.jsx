// src/components/formFields/GenericTextareaFormField.jsx - Redesigned with Central Styles
import React, { useState, useRef, useEffect } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import {
  FormFieldWrapper,
  useFormFieldState,
  useFormFieldClasses,
} from "./styles/formFieldStyles";

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
  rows = 3,
  maxRows = 10,
  minRows = 2,
  maxLength,
  showCharacterCount = false,
  autoResize = true,
  resizeMode = "both", // "both", "vertical", "horizontal", "none"
  showToolbar = false, // Show formatting toolbar
  ...otherProps
}) => {
  const textareaRef = useRef(null);
  const [characterCount, setCharacterCount] = useState(0);
  const [isFocusedInternal, setIsFocusedInternal] = useState(false);

  // Use central state management
  const {
    isFocused,
    isHovered,
    handleFocus,
    handleBlur,
    handleMouseEnter,
    handleMouseLeave,
  } = useFormFieldState();

  // Update character count
  useEffect(() => {
    const text = value || "";
    setCharacterCount(text.length);
  }, [value]);

  const handleChange = (e) => {
    if (onChange) {
      onChange(e); // Pass through the event as-is for InputTextarea
    }
  };

  const handleKeyDown = (e) => {
    // Allow tab indentation
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue =
        (value || "").substring(0, start) + "\t" + (value || "").substring(end);

      if (onChange) {
        const syntheticEvent = {
          target: {
            name: id,
            value: newValue,
          },
          originalEvent: e,
        };
        onChange(syntheticEvent);
      }

      // Set cursor position after tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(start + 1, start + 1);
        }
      }, 0);
    }

    // Call original keyDown handler if provided
    if (otherProps.onKeyDown) {
      otherProps.onKeyDown(e);
    }
  };

  // Formatting functions for toolbar
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
          target: {
            name: id,
            value: newValue,
          },
        };
        onChange(syntheticEvent);
      }
    }
  };

  // Filter out non-DOM props
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

  // Get consistent classes from central system
  const textareaClasses = useFormFieldClasses({
    isFocused,
    isHovered,
    disabled,
    error: !!error,
    size,
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

  // Enhanced PassThrough configuration
  const textareaPT = {
    root: {
      className: `${textareaClasses} transition-all duration-200 leading-relaxed`,
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
    >
      <div className="space-y-2">
        {/* Formatting Toolbar */}
        {showToolbar && !disabled && (
          <div className="flex items-center gap-1 p-2 bg-surface-50 rounded-xl border border-surface-200">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                icon="pi pi-bold"
                onClick={() => formatText("bold")}
                size="small"
                text
                rounded
                className="w-8 h-8 text-text-color-secondary hover:text-text-color hover:bg-surface-100"
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
                className="w-8 h-8 text-text-color-secondary hover:text-text-color hover:bg-surface-100"
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
                className="w-8 h-8 text-text-color-secondary hover:text-text-color hover:bg-surface-100"
                tooltip="Code"
                tooltipOptions={{ position: "top" }}
              />
            </div>

            <div className="w-px h-6 bg-surface-300 mx-1"></div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                icon="pi pi-list"
                onClick={() => formatText("list")}
                size="small"
                text
                rounded
                className="w-8 h-8 text-text-color-secondary hover:text-text-color hover:bg-surface-100"
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
                className="w-8 h-8 text-text-color-secondary hover:text-text-color hover:bg-surface-100"
                tooltip="Quote"
                tooltipOptions={{ position: "top" }}
              />
            </div>
          </div>
        )}

        {/* Textarea */}
        <div className="relative">
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

          {/* Character Count Badge */}
          {showCharacterCount && (
            <div className="absolute bottom-2 right-2 pointer-events-none">
              <div
                className={`
                  text-xs px-2 py-1 rounded-lg backdrop-blur-sm transition-all duration-200
                  ${
                    maxLength && characterCount > maxLength * 0.9
                      ? characterCount >= maxLength
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-orange-100 text-orange-700 border border-orange-200"
                      : "bg-surface-100/80 text-text-color-secondary border border-surface-200/50"
                  }
                `}
              >
                {characterCount}
                {maxLength && (
                  <>
                    <span className="text-text-color-secondary/50 mx-1">/</span>
                    {maxLength}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Focus Enhancement Ring */}
          {isFocusedInternal && !disabled && (
            <div className="absolute inset-0 border-2 border-primary-400 rounded-2xl pointer-events-none opacity-20 animate-pulse" />
          )}
        </div>

        {/* Helper Text */}
        {!error && (showCharacterCount || showToolbar) && (
          <div className="flex items-center justify-between text-xs text-text-color-secondary">
            <div className="flex items-center gap-4">
              {showToolbar && (
                <span className="flex items-center gap-1">
                  <i className="pi pi-info-circle text-xs"></i>
                  Select text to format • Tab to indent
                </span>
              )}
            </div>
            {showCharacterCount && maxLength && (
              <span
                className={`${
                  characterCount > maxLength * 0.9 ? "text-orange-600" : ""
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
