// dashboard/src/components/formFields/CurrencyFormField.jsx
import React from "react";
import { InputNumber } from "primereact/inputnumber";

const CurrencyFormField = (props) => (
  <InputNumber
    {...props}
    mode="currency"
    currency={props.currency || "AED"}
    locale={props.locale || "en-AE"}
    minFractionDigits={props.minFractionDigits ?? 2}
    maxFractionDigits={props.maxFractionDigits ?? 2}
  />
);

export default CurrencyFormField;
