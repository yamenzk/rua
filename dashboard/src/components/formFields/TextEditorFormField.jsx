// dashboard/src/components/formFields/TextEditorFormField.jsx - Fixed version
import React from "react";
import { Editor } from "primereact/editor";

const TextEditorFormField = (props) => {
  // Filter out non-DOM props before spreading
  const { fieldSchemaItem, ...safeProps } = props;

  // Default height can be overridden by props
  const defaultStyle = { height: "200px" };
  const finalStyle = { ...defaultStyle, ...safeProps.style };

  return <Editor {...safeProps} style={finalStyle} />;
};

export default TextEditorFormField;
