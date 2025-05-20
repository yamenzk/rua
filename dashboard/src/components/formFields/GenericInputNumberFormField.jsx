// dashboard/src/components/formFields/GenericInputNumberFormField.jsx
import React from "react";
import { InputNumber } from "primereact/inputnumber";

// For Int, Float, Percent
const GenericInputNumberFormField = (props) => {
  const {
    mode = "decimal",
    minFractionDigits,
    maxFractionDigits,
    suffix,
    ...rest
  } = props;
  return (
    <InputNumber
      {...rest}
      mode={mode}
      minFractionDigits={minFractionDigits}
      maxFractionDigits={maxFractionDigits}
      suffix={suffix}
    />
  );
};

export default GenericInputNumberFormField;
