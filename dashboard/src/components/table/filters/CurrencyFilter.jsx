// dashboard/src/components/table/filters/CurrencyFilter.jsx
import React from "react";
import { InputNumber } from "primereact/inputnumber";

const CurrencyFilter = ({ options, currency = "AED", locale = "en-AE" }) => {
  return (
    <div className="p-inputgroup">
      <span className="p-inputgroup-addon">
        <img src="/aed.svg" alt="AED" className="h-4 w-4" />
      </span>
      <InputNumber
        value={options.value}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        mode="decimal" // Changed from currency to decimal to avoid double currency symbols
        locale={locale}
        minFractionDigits={2}
        maxFractionDigits={2}
        className="p-column-filter flex-1"
        placeholder="Amount"
      />
    </div>
  );
};

export default CurrencyFilter;