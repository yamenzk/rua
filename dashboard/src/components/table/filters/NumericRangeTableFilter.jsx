// dashboard/src/components/table/filters/NumericRangeTableFilter.jsx
import React from "react";
import { InputNumber } from "primereact/inputnumber";

const NumericRangeTableFilter = ({
  fieldname,
  filterValue,
  filterApplyCallback,
  minPlaceholder = "Min",
  maxPlaceholder = "Max",
  inputNumberProps = {}, // For mode, currency, suffix, precision etc.
}) => {
  const [from, to] = filterValue || [null, null];

  return (
    <div className="flex flex-col gap-1">
      <InputNumber
        inputId={`min_val_${fieldname}`} // Ensure unique IDs
        value={from}
        onValueChange={(e) => filterApplyCallback([e.value, to])}
        placeholder={minPlaceholder}
        className="p-column-filter w-full"
        {...inputNumberProps}
      />
      <InputNumber
        inputId={`max_val_${fieldname}`} // Ensure unique IDs
        value={to}
        onValueChange={(e) => filterApplyCallback([from, e.value])}
        placeholder={maxPlaceholder}
        className="p-column-filter w-full"
        {...inputNumberProps}
      />
    </div>
  );
};

export default NumericRangeTableFilter;
