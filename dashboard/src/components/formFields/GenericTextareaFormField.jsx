// dashboard/src/components/formFields/GenericTextareaFormField.jsx
import React from "react";
import { InputTextarea } from "primereact/inputtextarea";

const GenericTextareaFormField = (props) => {
  const { rows = 3, ...rest } = props; // Default rows, can be overridden
  return <InputTextarea {...rest} rows={rows} autoResize />;
};

export default GenericTextareaFormField;
