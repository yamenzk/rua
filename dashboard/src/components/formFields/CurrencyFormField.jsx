// dashboard/src/components/formFields/CurrencyFormField.jsx
import React from "react";
import { InputNumber } from "primereact/inputnumber";

const CurrencyFormField = (props) => {
  const {
    currency = "AED",
    locale = "en-AE",
    minFractionDigits = 2,
    maxFractionDigits = 2,
    className,
    ...rest
  } = props;

  return (
    <div className={`p-inputgroup ${className || ""}`}>
      <span className="p-inputgroup-addon">
        <img src="/aed.svg" alt="AED" className="h-4 w-4" />
      </span>
      <InputNumber
        {...rest}
        mode="decimal" // Changed from currency to decimal to avoid double currency symbols
        locale={locale}
        minFractionDigits={minFractionDigits}
        maxFractionDigits={maxFractionDigits}
        className="flex-1" // Ensure InputNumber takes remaining space
      />
    </div>
  );
};

export default CurrencyFormField;
