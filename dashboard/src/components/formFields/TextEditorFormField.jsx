// dashboard/src/components/formFields/TextEditorFormField.jsx
import React from "react";
import { Editor } from "primereact/editor";

const TextEditorFormField = (props) => (
  <Editor {...props} style={{ height: "200px" }} />
);

export default TextEditorFormField;
