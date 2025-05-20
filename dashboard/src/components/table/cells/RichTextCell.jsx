// dashboard/src/components/table/cells/RichTextCell.jsx
import React from "react";

const RichTextCell = ({ rowData, fieldname }) => {
  const htmlContent = rowData[fieldname];
  if (!htmlContent) return null;

  return (
    <div
      className="prose max-w-none line-clamp-3" // Ensure Tailwind prose and line-clamp are configured
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default RichTextCell;
