// src/components/formFields/ColorPickerFormField.jsx - Redesigned with Central Styles
import React, { useState, useRef } from "react";
import { ColorPicker } from "primereact/colorpicker";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { OverlayPanel } from "primereact/overlaypanel";
import {
  FormFieldWrapper,
  useFormFieldState,
  useFormFieldClasses,
  getAddonStyles,
  PRIMEREACT_PT_CONFIGS,
} from "./styles/formFieldStyles";

const ColorPickerFormField = ({
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
  format = "hex", // hex, rgb, hsl
  inline = false, // Show picker inline or in overlay
  showPreview = true, // Show color preview chip
  showInput = true, // Show text input alongside
  presetColors = [], // Array of preset colors to show
  ...otherProps
}) => {
  const overlayRef = useRef(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Use central state management
  const {
    isFocused,
    isHovered,
    handleFocus,
    handleBlur,
    handleMouseEnter,
    handleMouseLeave,
  } = useFormFieldState();

  // Normalize color value (ensure # prefix for hex)
  const normalizeColorValue = (colorVal) => {
    if (!colorVal) return "";
    const str = String(colorVal);
    if (format === "hex" && str && !str.startsWith("#")) {
      return `#${str}`;
    }
    return str;
  };

  const normalizedValue = normalizeColorValue(value);
  const displayValue =
    format === "hex" ? normalizedValue.replace("#", "") : normalizedValue;

  const handleColorChange = (e) => {
    if (onChange) {
      let newValue = "";

      if (format === "hex") {
        newValue = `#${e.value}`;
      } else {
        newValue = e.value;
      }

      const syntheticEvent = {
        target: {
          name: id,
          value: newValue,
        },
        originalEvent: e.originalEvent,
      };
      onChange(syntheticEvent);
    }
  };

  const handleInputChange = (e) => {
    if (onChange) {
      let inputValue = e.target.value;

      // Auto-add # for hex values if missing
      if (format === "hex" && inputValue && !inputValue.startsWith("#")) {
        inputValue = `#${inputValue}`;
      }

      const syntheticEvent = {
        target: {
          name: id,
          value: inputValue,
        },
        originalEvent: e,
      };
      onChange(syntheticEvent);
    }
  };

  const handlePresetSelect = (presetColor) => {
    if (onChange) {
      const syntheticEvent = {
        target: {
          name: id,
          value: presetColor,
        },
      };
      onChange(syntheticEvent);
    }
    overlayRef.current?.hide();
  };

  // Filter out non-DOM props
  const { fieldSchemaItem, onFocus, onBlur, ...safeOtherProps } = otherProps;

  // Get consistent input styling for text input
  const inputTextPT = PRIMEREACT_PT_CONFIGS.inputTextWithAddon(
    {
      isFocused,
      isHovered,
      disabled,
      error: !!error,
      size,
      className,
    },
    showPreview ? "both" : "right"
  ); // Both addons if preview shown, right only if not

  // Default preset colors if none provided
  const defaultPresets = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
    "#F8BBD9",
    "#D5DBDB",
    "#F4F6F6",
    "#1B2631",
    "#E74C3C",
    "#3498DB",
    "#2ECC71",
    "#F39C12",
    "#9B59B6",
    "#34495E",
  ];
  const colorsToShow = presetColors.length > 0 ? presetColors : defaultPresets;

  // Inline picker (always visible)
  if (inline) {
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
        <div className="space-y-4">
          {/* Color Picker */}
          <div className="flex justify-center">
            <ColorPicker
              id={id}
              value={displayValue}
              onChange={handleColorChange}
              onFocus={(e) => handleFocus(e, safeOtherProps.onFocus)}
              onBlur={(e) => handleBlur(e, safeOtherProps.onBlur)}
              disabled={disabled}
              format={format}
              inline
              pt={{
                root: {
                  className:
                    "border border-surface-200 rounded-2xl overflow-hidden bg-surface-0 shadow-sm",
                },
                panel: {
                  className: "p-4",
                },
                colorSelector: {
                  className:
                    "rounded-xl overflow-hidden border border-surface-100",
                },
                hue: {
                  className: "mt-3 rounded-lg overflow-hidden",
                },
              }}
              title={tooltip}
              {...safeOtherProps}
            />
          </div>

          {/* Text Input */}
          {showInput && (
            <InputText
              value={normalizedValue}
              onChange={handleInputChange}
              placeholder={placeholder || `Enter ${format.toUpperCase()} value`}
              disabled={disabled}
              className={useFormFieldClasses({
                isFocused: false,
                isHovered: false,
                disabled,
                error: !!error,
                size,
                className,
              })}
            />
          )}

          {/* Preset Colors */}
          {colorsToShow.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-color-secondary uppercase tracking-wider">
                Preset Colors
              </label>
              <div className="grid grid-cols-10 gap-2">
                {colorsToShow.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePresetSelect(color)}
                    disabled={disabled}
                    className={`
                      w-8 h-8 rounded-xl border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-400
                      ${
                        normalizedValue === color
                          ? "border-text-color shadow-lg"
                          : "border-surface-200 hover:border-surface-300"
                      }
                      ${
                        disabled
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                    `}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </FormFieldWrapper>
    );
  }

  // Compact picker with overlay (default)
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
      <div className="p-inputgroup w-full">
        {/* Color Preview & Text Input */}
        {showInput ? (
          <>
            {/* Color Preview Chip */}
            {showPreview && (
              <span
                className={`p-inputgroup-addon flex items-center justify-center min-w-[3rem] ${getAddonStyles(
                  { isFocused, isHovered, disabled },
                  "left"
                )}`}
              >
                <div
                  className="w-6 h-6 rounded-lg border-2 border-surface-200 transition-all duration-200"
                  style={{ backgroundColor: normalizedValue || "#FFFFFF" }}
                  title={normalizedValue || "No color selected"}
                />
              </span>
            )}

            {/* Text Input */}
            <InputText
              value={normalizedValue}
              onChange={handleInputChange}
              onFocus={(e) => handleFocus(e, safeOtherProps.onFocus)}
              onBlur={(e) => handleBlur(e, safeOtherProps.onBlur)}
              placeholder={placeholder || `Enter ${format.toUpperCase()} value`}
              disabled={disabled}
              pt={inputTextPT}
              title={tooltip}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
            />
          </>
        ) : (
          /* Color Preview Only */
          <div
            className={useFormFieldClasses({
              isFocused,
              isHovered,
              disabled,
              error: !!error,
              size,
              className: "cursor-pointer flex items-center gap-3",
            })}
            onClick={(e) => !disabled && overlayRef.current?.toggle(e)}
          >
            <div
              className="w-8 h-8 rounded-xl border-2 border-surface-200 flex-shrink-0 transition-all duration-200"
              style={{ backgroundColor: normalizedValue || "#FFFFFF" }}
            />
            <span className="text-sm font-medium text-text-color">
              {normalizedValue || "Select color"}
            </span>
          </div>
        )}

        {/* Color Picker Trigger Button */}
        <Button
          type="button"
          icon="pi pi-palette"
          onClick={(e) => overlayRef.current?.toggle(e)}
          disabled={disabled}
          className={`${getAddonStyles(
            { isFocused, isHovered, disabled },
            "right"
          )} !px-3 !py-3 hover:text-primary-600`}
          pt={{
            root: {
              className:
                "border-0 bg-transparent text-text-color-secondary hover:text-primary-600 transition-colors duration-200",
            },
            icon: {
              className: "text-lg",
            },
          }}
          aria-label="Open color picker"
        />
      </div>

      {/* Color Picker Overlay */}
      <OverlayPanel ref={overlayRef} className="w-80" dismissable>
        <div className="space-y-4">
          {/* Main Color Picker */}
          <ColorPicker
            value={displayValue}
            onChange={handleColorChange}
            format={format}
            inline
            pt={{
              root: {
                className: "w-full",
              },
              panel: {
                className: "p-0",
              },
              colorSelector: {
                className:
                  "rounded-xl overflow-hidden border border-surface-100 mb-3",
              },
              hue: {
                className: "rounded-lg overflow-hidden",
              },
            }}
          />

          {/* Preset Colors */}
          {colorsToShow.length > 0 && (
            <div className="space-y-3">
              <div className="border-t border-surface-100 pt-3">
                <label className="text-xs font-medium text-text-color-secondary uppercase tracking-wider">
                  Quick Colors
                </label>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {colorsToShow.slice(0, 16).map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePresetSelect(color)}
                    className={`
                      w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400
                      ${
                        normalizedValue === color
                          ? "border-text-color shadow-md"
                          : "border-surface-200 hover:border-surface-300"
                      }
                    `}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Current Color Display */}
          <div className="flex items-center justify-between pt-3 border-t border-surface-100">
            <span className="text-sm text-text-color-secondary">Current:</span>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg border border-surface-200"
                style={{ backgroundColor: normalizedValue || "#FFFFFF" }}
              />
              <code className="text-xs font-mono text-text-color bg-surface-100 px-2 py-1 rounded">
                {normalizedValue || "#FFFFFF"}
              </code>
            </div>
          </div>
        </div>
      </OverlayPanel>
    </FormFieldWrapper>
  );
};

export default ColorPickerFormField;
