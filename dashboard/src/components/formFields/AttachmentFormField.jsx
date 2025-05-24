// dashboard/src/components/formFields/AttachmentFormField.jsx - Fixed version
import React from "react";
import { Button } from "primereact/button";

const AttachmentFormField = ({
  id, // fieldname
  fieldname, // Alternative fieldname prop (for backward compatibility)
  value, // Current file URL/path from formData or "Pending: filename.txt"
  onFileUploadTrigger, // This will be context.openUploadModal via FormFieldAdapter
  disabled,
  className,
  fieldSchemaItem, // We receive this but don't need to use it
  ...otherProps // Other props that shouldn't be spread to DOM elements
}) => {
  // Use id first, fallback to fieldname for backward compatibility
  const actualFieldname = id || fieldname;

  // Check if the value is a URL or pending upload
  const isUrl =
    value &&
    (String(value).startsWith("http") || String(value).startsWith("/"));
  const filename = isUrl
    ? value.substring(value.lastIndexOf("/") + 1) || value
    : value;

  return (
    <div className={`flex flex-col items-start ${className || ""}`}>
      {value && (
        <div className="mb-2">
          {isUrl ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-color hover:underline break-all"
              aria-label={`View ${actualFieldname}`}
            >
              {filename}
            </a>
          ) : (
            <span className="text-text-color-secondary italic">{value}</span>
          )}
        </div>
      )}
      <Button
        type="button"
        label={isUrl ? "Change File" : "Attach File"}
        icon="pi pi-upload"
        className="p-button-sm p-button-outlined"
        onClick={onFileUploadTrigger}
        disabled={disabled}
        aria-label={
          value ? `Change ${actualFieldname}` : `Attach ${actualFieldname}`
        }
      />
    </div>
  );
};

export default AttachmentFormField;
