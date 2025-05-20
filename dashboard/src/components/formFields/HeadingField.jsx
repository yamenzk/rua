// dashboard/src/components/formFields/HeadingField.jsx
import React from "react";
import { parseDescription } from "@/utils/schemaUtils";

// This component is intended for use as a formComponent for "Heading" fieldtype
// to render visual headings within a form layout. It's not an input field.
const HeadingField = (props) => {
  // In the context of UniversalDocEditor, props will include:
  // id, value (likely null/undefined for Heading), onChange (no-op), className,
  // disabled, fieldSchemaItem, tooltip, placeholder, etc.
  // We primarily care about fieldSchemaItem and its label/description.
  const { fieldSchemaItem } = props;

  if (!fieldSchemaItem) {
    return null; // Or some fallback if schema is missing
  }

  const label = fieldSchemaItem.label || fieldSchemaItem.fieldname;
  const descriptionData = parseDescription(fieldSchemaItem.description);

  // Allow overriding heading level via description, e.g., "level:h2" in description string
  const headingLevel = descriptionData.level || "h3"; // Default to h3
  const HeadingTag = headingLevel; // Renders as <h[1-6]>

  const textSizeMap = {
    h1: "text-3xl sm:text-4xl", // Adjusted for responsiveness
    h2: "text-2xl sm:text-3xl",
    h3: "text-xl sm:text-2xl",
    h4: "text-lg sm:text-xl",
    h5: "text-base sm:text-lg",
    h6: "text-base", // Base text size
  };

  const textColorClass = descriptionData.colorClass || "text-text-color"; // e.g., "colorClass:text-primary-500"
  const marginClass = descriptionData.noMargin
    ? ""
    : descriptionData.marginClass || "mt-6 mb-3"; // e.g., "noMargin:true" or "marginClass:mt-8 mb-4"
  const borderClass = descriptionData.borderBottom
    ? "border-b border-surface-300 pb-1"
    : ""; // e.g., "borderBottom:true"

  const textSizeClass = textSizeMap[headingLevel] || textSizeMap.h5; // Default to a reasonable size

  // Other props from descriptionData could be icon, alignment, etc.
  const customClasses = descriptionData.className || "";

  return (
    <HeadingTag
      className={`${marginClass} ${textSizeClass} ${textColorClass} ${borderClass} ${customClasses} font-semibold leading-tight`}
      // If the UniversalDocEditor passes a tooltip via commonProps, it would be applied here.
      // title={props.tooltip} // Example if props.tooltip is passed
    >
      {label}
    </HeadingTag>
  );
};
export default HeadingField;
