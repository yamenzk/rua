// src/components/formFields/ColorPickerFormField.jsx - Enhanced with Presets
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
  getAddonIconStyles,
  PRIMEREACT_PT_CONFIGS,
  DESIGN_TOKENS,
} from "./styles/formFieldStyles";
import { useTheme } from "@/contexts/ThemeContext";

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
  preset, // New preset support!
  format = "hex",
  inline = false,
  showPreview = true,
  showInput = true,
  presetColors = [],
  ...otherProps
}) => {
  const theme = useTheme();
  const activePreset = preset || theme.preset; 
  const overlayRef = useRef(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const {
    isFocused,
    isHovered,
    handleFocus,
    handleBlur,
    handleMouseEnter,
    handleMouseLeave,
  } = useFormFieldState();

  const t = DESIGN_TOKENS;

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
      let newValue = format === "hex" ? `#${e.value}` : e.value;
      const syntheticEvent = {
        target: { name: id, value: newValue },
        originalEvent: e.originalEvent,
      };
      onChange(syntheticEvent);
    }
  };

  const handleInputChange = (e) => {
    if (onChange) {
      let inputValue = e.target.value;
      if (format === "hex" && inputValue && !inputValue.startsWith("#")) {
        inputValue = `#${inputValue}`;
      }
      const syntheticEvent = {
        target: { name: id, value: inputValue },
        originalEvent: e,
      };
      onChange(syntheticEvent);
    }
  };

  const handlePresetSelect = (presetColor) => {
    if (onChange) {
      const syntheticEvent = {
        target: { name: id, value: presetColor },
      };
      onChange(syntheticEvent);
    }
    overlayRef.current?.hide();
  };

  const { fieldSchemaItem, onFocus, onBlur, ...safeOtherProps } = otherProps;

  const inputTextPT = PRIMEREACT_PT_CONFIGS.inputTextWithAddon(
    {
      isFocused,
      isHovered,
      disabled,
      error: !!error,
      size,
      className,
    },
    showPreview ? "both" : "right",
    activePreset // Pass preset
  );

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

  // Enhanced inline picker
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
        preset={activePreset}
      >
        <div className={`${t.spacing.gap.base} ${t.layout.flex.col}`}>
          <div className={t.layout.flex.center}>
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
                  className: `${t.borders.width.base} ${t.colors.border.default} ${t.radius.base} ${t.layout.overflow.hidden} ${t.colors.background.surface} ${t.effects.shadow.base}`,
                },
                panel: { className: t.spacing.panel.padding },
                colorSelector: {
                  className: `${t.radius.small} ${t.layout.overflow.hidden} ${t.borders.width.base} ${t.colors.border.light}`,
                },
                hue: {
                  className: `mt-3 ${t.radius.small} ${t.layout.overflow.hidden}`,
                },
              }}
              title={tooltip}
              {...safeOtherProps}
            />
          </div>

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
                preset: activePreset,
                className,
              })}
            />
          )}

          {/* Enhanced preset colors */}
          {colorsToShow.length > 0 && (
            <div className={`${t.spacing.gap.small} ${t.layout.flex.col}`}>
              <label
                className={`${t.typography.xs} ${t.typography.weight.medium} ${t.colors.text.secondary} uppercase tracking-wider`}
              >
                Preset Colors
              </label>
              <div
                className={`${t.layout.grid.cols10} ${t.layout.grid.gapSmall}`}
              >
                {colorsToShow.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePresetSelect(color)}
                    disabled={disabled}
                    className={`
                      ${t.sizing.icon.xl} ${t.radius.small} ${
                      t.borders.width.thick
                    } ${t.effects.transition.base} 
                      hover:${t.effects.scale.subtle} ${t.effects.focusRing}
                      ${
                        normalizedValue === color
                          ? `${t.colors.border.default.replace(
                              "border-surface-100",
                              "border-text-color"
                            )} ${t.effects.shadow.strong}`
                          : `${t.colors.border.default} hover:${t.colors.border.medium}`
                      }
                      ${
                        disabled
                          ? `${t.effects.opacity.disabled} ${t.interactions.cursor.notAllowed}`
                          : t.interactions.cursor.pointer
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

  // Enhanced compact picker with overlay
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
      <div className="p-inputgroup w-full">
        {showInput ? (
          <>
            {showPreview && (
              <span
                className={`p-inputgroup-addon ${
                  t.layout.flex.center
                } min-w-[3rem] ${getAddonStyles(
                  { isFocused, isHovered, disabled },
                  "left",
                  activePreset
                )}`}
              >
                <div
                  className={`${t.sizing.icon.large} ${t.radius.small} ${t.borders.width.thick} ${t.colors.border.light} ${t.effects.transition.base}`}
                  style={{ backgroundColor: normalizedValue || "#FFFFFF" }}
                  title={normalizedValue || "No color selected"}
                />
              </span>
            )}

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
          <div
            className={useFormFieldClasses({
              isFocused,
              isHovered,
              disabled,
              error: !!error,
              size,
              preset: activePreset,
              className: `${t.interactions.cursor.pointer} ${t.layout.flex.center} ${t.spacing.gap.base}`,
            })}
            onClick={(e) => !disabled && overlayRef.current?.toggle(e)}
          >
            <div
              className={`${t.sizing.icon.xl} ${t.radius.small} ${t.borders.width.thick} ${t.colors.border.light} ${t.sizing.component.flexShrink} ${t.effects.transition.base}`}
              style={{ backgroundColor: normalizedValue || "#FFFFFF" }}
            />
            <span
              className={`${t.typography.sm} ${t.typography.weight.medium} ${t.colors.text.default}`}
            >
              {normalizedValue || "Select color"}
            </span>
          </div>
        )}

        {/* Enhanced trigger button */}
        <Button
          type="button"
          icon="pi pi-palette"
          onClick={(e) => overlayRef.current?.toggle(e)}
          disabled={disabled}
          className={`${getAddonStyles(
            { isFocused, isHovered, disabled },
            "right",
            activePreset
          )} !px-3 !py-3`}
          pt={{
            root: {
              className: `${t.borders.width.none} ${
                t.colors.background.transparent
              } ${getAddonIconStyles({ isFocused, disabled }, activePreset)} ${
                t.effects.transition.colors
              }`,
            },
            icon: { className: t.typography.lg },
          }}
          aria-label="Open color picker"
        />
      </div>

      {/* Enhanced overlay panel */}
      <OverlayPanel ref={overlayRef} className="w-80" dismissable>
        <div className={`${t.spacing.gap.base} ${t.layout.flex.col}`}>
          <ColorPicker
            value={displayValue}
            onChange={handleColorChange}
            format={format}
            inline
            pt={{
              root: { className: t.sizing.component.fullWidth },
              panel: { className: "p-0" },
              colorSelector: {
                className: `${t.radius.small} ${t.layout.overflow.hidden} ${t.borders.width.base} ${t.colors.border.light} mb-3`,
              },
              hue: {
                className: `${t.radius.small} ${t.layout.overflow.hidden}`,
              },
            }}
          />

          {colorsToShow.length > 0 && (
            <div className={`${t.spacing.gap.base} ${t.layout.flex.col}`}>
              <div
                className={`${t.borders.sides.top} ${t.colors.border.light} pt-3`}
              >
                <label
                  className={`${t.typography.xs} ${t.typography.weight.medium} ${t.colors.text.secondary} uppercase tracking-wider`}
                >
                  Quick Colors
                </label>
              </div>
              <div
                className={`${t.layout.grid.cols8} ${t.layout.grid.gapSmall}`}
              >
                {colorsToShow.slice(0, 16).map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePresetSelect(color)}
                    className={`
                      ${t.sizing.icon.xl} ${t.radius.small} ${
                      t.borders.width.thick
                    } ${t.effects.transition.base} 
                      hover:${t.effects.scale.subtle} ${t.effects.focusRing}
                      ${
                        normalizedValue === color
                          ? `${t.colors.border.default.replace(
                              "border-surface-100",
                              "border-text-color"
                            )} ${t.effects.shadow.base}`
                          : `${t.colors.border.light} hover:${t.colors.border.medium}`
                      }
                    `}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Current color display */}
          <div
            className={`${t.layout.flex.between} pt-3 ${t.borders.sides.top} ${t.colors.border.light}`}
          >
            <span className={`${t.typography.sm} ${t.colors.text.secondary}`}>
              Current:
            </span>
            <div className={`${t.layout.flex.center} ${t.spacing.gap.small}`}>
              <div
                className={`${t.sizing.icon.base} ${t.radius.small} ${t.borders.width.base} ${t.colors.border.light}`}
                style={{ backgroundColor: normalizedValue || "#FFFFFF" }}
              />
              <code
                className={`${t.typography.xs} font-mono ${t.colors.text.default} ${t.colors.background.surfaceAlt} px-2 py-1 ${t.radius.tiny}`}
              >
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