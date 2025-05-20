// dashboard/src/components/formFields/AttachmentFormField.jsx
import React from "react";
import { Button } from "primereact/button";

const AttachmentFormField = ({
  fieldname,
  value, // Current file URL/path from formData or "Pending: filename.txt"
  onFileUploadTrigger, // This will be context.openUploadModal via FormFieldAdapter
}) => (
  <div className="flex flex-col items-start">
    {value && (
      <div className="mb-2">
        {String(value).startsWith("http") || String(value).startsWith("/") ? ( // Check if it's a URL
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-color hover:underline break-all"
            aria-label={`View ${fieldname}`}
          >
            {value.substring(value.lastIndexOf("/") + 1) || value}
          </a>
        ) : (
          <span className="text-text-color-secondary italic">{value}</span> // Display "Pending: filename.txt"
        )}
      </div>
    )}
    <Button
      type="button"
      label={
        value &&
        (String(value).startsWith("http") || String(value).startsWith("/"))
          ? "Change File"
          : "Attach File"
      }
      icon="pi pi-upload"
      className="p-button-sm p-button-outlined"
      onClick={onFileUploadTrigger} // Call the function passed from editor
      aria-label={value ? `Change ${fieldname}` : `Attach ${fieldname}`}
    />
  </div>
);

export default AttachmentFormField;
