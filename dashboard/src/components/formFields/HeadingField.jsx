// src/components/formFields/HeadingField.jsx - Enhanced with Design Tokens
import React from "react";
import { parseDescription } from "@/components/document/utils/schemaUtils";
import { DESIGN_TOKENS } from "./styles/formFieldStyles";

const HeadingField = ({
  id,
  fieldSchemaItem,
  className,
  disabled,
  value,
  onChange,
  ...otherProps
}) => {
  if (!fieldSchemaItem) {
    return null;
  }

  const t = DESIGN_TOKENS;
  const label = fieldSchemaItem.label || fieldSchemaItem.fieldname || id;
  const descriptionData = parseDescription(fieldSchemaItem.description);

  const headingLevel = descriptionData.level || "h3";
  const HeadingTag = headingLevel;

  const textSizeMap = {
    h1: `${t.typography.xxl} sm:text-4xl`,
    h2: `${t.typography.xl} sm:text-3xl`,
    h3: `${t.typography.lg} sm:${t.typography.xl}`,
    h4: `${t.typography.base} sm:${t.typography.lg}`,
    h5: `${t.typography.sm} sm:${t.typography.base}`,
    h6: t.typography.sm,
  };

  const textColorClass = descriptionData.colorClass || t.colors.text.default;
  const marginClass = descriptionData.noMargin
    ? ""
    : descriptionData.marginClass || "mt-6 mb-3";
  const borderClass = descriptionData.borderBottom
    ? `${t.borders.sides.bottom} ${t.colors.border.medium} pb-1`
    : "";

  const textSizeClass = textSizeMap[headingLevel] || textSizeMap.h5;
  const customClasses = descriptionData.className || "";

  return (
    <HeadingTag
      className={`
        ${marginClass} ${textSizeClass} ${textColorClass} ${borderClass} ${customClasses} 
        ${className || ""} ${t.typography.weight.semibold} leading-tight
      `}
      title={descriptionData.tooltip || undefined}
    >
      {label}
    </HeadingTag>
  );
};

export default HeadingField;
