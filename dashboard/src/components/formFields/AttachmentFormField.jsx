// src/components/formFields/AttachmentFormField.jsx - Refactored with Central Styles
import React from "react";
import { Button } from "primereact/button";
import { FormFieldWrapper, useFormFieldState } from "./styles/formFieldStyles";

const AttachmentFormField = ({
  id, // fieldname
  fieldname, // Alternative fieldname prop (for backward compatibility)
  value, // Current file URL/path from formData or "Pending: filename.txt"
  onFileUploadTrigger, // This will be context.openUploadModal via FormFieldAdapter
  disabled,
  className,
  placeholder,
  tooltip,
  required,
  error,
  size = "base",
  fieldSchemaItem, // We receive this but don't need to use it in styling
  ...otherProps // Other props that shouldn't be spread to DOM elements
}) => {
  // Use central state management
  const { isFocused, isHovered, handleMouseEnter, handleMouseLeave } =
    useFormFieldState();

  // Use id first, fallback to fieldname for backward compatibility
  const actualFieldname = id || fieldname;

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
    >
      <div className="space-y-3">
        {/* File Display Area */}
        {hasFile && (
          <div className="bg-surface-50 border border-surface-200 rounded-2xl p-4 transition-all duration-200">
            <div className="flex items-center gap-3">
              {/* File Icon */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <i className="pi pi-file text-primary-600 text-lg"></i>
                </div>
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                {isUrl ? (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline break-all transition-colors duration-200"
                    aria-label={`View ${actualFieldname}`}
                  >
                    {filename}
                  </a>
                ) : (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-text-color-secondary break-all">
                      {filename}
                    </div>
                    <div className="text-xs text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded-lg">
                      Pending Upload
                    </div>
                  </div>
                )}
              </div>

              {/* File Size or Status */}
              <div className="flex-shrink-0">
                {isUrl ? (
                  <i className="pi pi-external-link text-text-color-secondary text-sm"></i>
                ) : (
                  <i className="pi pi-clock text-orange-500 text-sm"></i>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          type="button"
          label={hasFile ? "Change File" : "Choose File"}
          icon={hasFile ? "pi pi-refresh" : "pi pi-upload"}
          onClick={onFileUploadTrigger}
          disabled={disabled}
          className={`
            w-full justify-center rounded-2xl border-2 border-dashed transition-all duration-200
            ${
              disabled
                ? "border-surface-200 bg-surface-100 text-text-color-secondary cursor-not-allowed"
                : hasFile
                ? "border-primary-300 bg-primary-50 text-primary-700 hover:border-primary-400 hover:bg-primary-100"
                : "border-surface-300 bg-surface-0 text-text-color hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600"
            }
          `}
          pt={{
            root: {
              className: "p-4 font-medium",
            },
            icon: {
              className: "mr-2 text-base",
            },
            label: {
              className: "text-sm",
            },
          }}
          aria-label={
            hasFile ? `Change ${actualFieldname}` : `Attach ${actualFieldname}`
          }
          title={tooltip}
        />

        {/* Upload Hint */}
        {!hasFile && !disabled && (
          <div className="text-xs text-text-color-secondary text-center">
            Click to browse or drag & drop your file here
          </div>
        )}
      </div>
    </FormFieldWrapper>
  );
};

export default AttachmentFormField;
