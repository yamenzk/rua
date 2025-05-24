// src/components/formFields/GenericTextareaFormField.jsx - Fixed version
import React from "react";
import { InputTextarea } from "primereact/inputtextarea";

const GenericTextareaFormField = (props) => {
  const { rows = 3, ...rest } = props; // Default rows, can be overridden

  // Filter out non-DOM props before spreading
  const { fieldSchemaItem, ...safeRest } = rest;

  return <InputTextarea {...safeRest} rows={rows} autoResize />;
};

export default GenericTextareaFormField;
