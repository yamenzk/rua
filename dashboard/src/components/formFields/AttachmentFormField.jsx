// src/components/formFields/AttachmentFormField.jsx - Enhanced with Presets
import React from "react";
import { Button } from "primereact/button";
import {
  FormFieldWrapper,
  useFormFieldState,
  DESIGN_TOKENS,
  getInteractionPreset,
} from "./styles/formFieldStyles";
import { useTheme } from "@/contexts/ThemeContext";

const AttachmentFormField = ({
  id,
  fieldname,
  value,
  onFileUploadTrigger,
  disabled,
  className,
  placeholder,
  tooltip,
  required,
  error,
  size = "base",
  preset,
  fieldSchemaItem,
  ...otherProps
}) => {
  const theme = useTheme();
  const activePreset = preset || theme.preset; 
  const { isFocused, isHovered, handleMouseEnter, handleMouseLeave } =
    useFormFieldState();

  const actualFieldname = id || fieldname;
  const t = DESIGN_TOKENS;
  const interactions = getInteractionPreset("input", activePreset);

  // Check if the value is a URL or pending upload
  const isUrl =
    value &&
    (String(value).startsWith("http") || String(value).startsWith("/"));
  const filename = isUrl
    ? value.substring(value.lastIndexOf("/") + 1) || value
    : value;

  const hasFile = Boolean(value && String(value).trim());

  return (
    <FormFieldWrapper
      id={actualFieldname}
      error={error}
      required={required}
      disabled={disabled}
      isFocused={isFocused}
      isHovered={isHovered}
      onMouseEnter={() => handleMouseEnter(disabled)}
      onMouseLeave={handleMouseLeave}
      className={className}
      preset={activePreset}
    >
      <div className={`${t.spacing.gap.base} ${t.layout.flex.col}`}>
        {/* Enhanced File Display Area */}
        {hasFile && (
          <div
            className={`
              ${t.colors.background.surfaceAlt} ${t.colors.border.default} ${
              t.borders.width.base
            } 
              ${t.radius.base} ${t.spacing.panel.padding} ${
              t.effects.transition.base
            }
              ${interactions.hover || t.presets.hover.background.subtle}
            `}
          >
            <div className={`${t.layout.flex.center} ${t.spacing.gap.base}`}>
              {/* Enhanced File Icon */}
              <div className={t.sizing.component.flexShrink}>
                <div
                  className={`
                    ${t.sizing.icon.xxl} ${t.radius.small} ${
                    t.colors.background.primaryLight
                  } 
                    ${t.layout.flex.center} ${t.effects.transition.base}
                    ${activePreset === "dynamic" ? "hover:scale-105" : ""}
                  `}
                >
                  <i
                    className={`pi pi-file ${t.colors.text.primary} ${t.typography.lg}`}
                  />
                </div>
              </div>

              {/* Enhanced File Info */}
              <div className={`${t.sizing.component.flexGrow} min-w-0`}>
                {isUrl ? (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      ${t.typography.sm} ${t.typography.weight.medium} ${t.colors.text.primary} 
                      hover:${t.colors.text.primaryDark} hover:underline break-all 
                      ${t.effects.transition.colors}
                    `}
                    aria-label={`View ${actualFieldname}`}
                  >
                    {filename}
                  </a>
                ) : (
                  <div className={`${t.spacing.gap.tiny} ${t.layout.flex.col}`}>
                    <div
                      className={`${t.typography.sm} ${t.typography.weight.medium} ${t.colors.text.secondary} break-all`}
                    >
                      {filename}
                    </div>
                    <div
                      className={`
                        ${t.typography.xs} ${t.colors.text.warning} ${t.colors.background.warning} 
                        inline-block px-2 py-1 ${t.radius.small}
                      `}
                    >
                      Pending Upload
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Status Icon */}
              <div className={t.sizing.component.flexShrink}>
                {isUrl ? (
                  <i
                    className={`pi pi-external-link ${t.colors.text.secondary} ${t.typography.sm}`}
                  />
                ) : (
                  <i
                    className={`pi pi-clock ${t.colors.text.warning} ${t.typography.sm}`}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Upload Button */}
        <Button
          type="button"
          label={hasFile ? "Change File" : "Choose File"}
          icon={hasFile ? "pi pi-refresh" : "pi pi-upload"}
          onClick={onFileUploadTrigger}
          disabled={disabled}
          className={`
            ${t.sizing.component.fullWidth} justify-center ${t.radius.base} 
            ${t.borders.width.thick} border-dashed ${t.effects.transition.base}
            ${
              disabled
                ? `${t.colors.border.medium} ${t.colors.background.surfaceDisabled} ${t.colors.text.disabled} ${t.interactions.cursor.notAllowed}`
                : hasFile
                ? `${t.colors.border.focus} ${
                    t.colors.background.primaryLight
                  } ${t.colors.text.primary} ${
                    interactions.hover ||
                    "hover:border-primary-400 hover:bg-primary-100"
                  }`
                : `${t.colors.border.medium} ${t.colors.background.surface} ${
                    t.colors.text.default
                  } ${
                    interactions.hover ||
                    "hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600"
                  }`
            }
            ${activePreset === "dynamic" ? "hover:scale-[1.02]" : ""}
          `}
          pt={{
            root: {
              className: `${t.spacing.panel.padding} ${t.typography.weight.medium}`,
            },
            icon: {
              className: `mr-2 ${t.typography.base}`,
            },
            label: {
              className: t.typography.sm,
            },
          }}
          aria-label={
            hasFile ? `Change ${actualFieldname}` : `Attach ${actualFieldname}`
          }
          title={tooltip}
        />

        {/* Enhanced Upload Hint */}
        {!hasFile && !disabled && (
          <div
            className={`${t.typography.xs} ${t.colors.text.secondary} text-center ${t.effects.transition.colors}`}
          >
            Click to browse or drag & drop your file here
          </div>
        )}
      </div>
    </FormFieldWrapper>
  );
};

export default AttachmentFormField;
