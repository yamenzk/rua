// dashboard/src/components/table/filters/NumericFilter.jsx
import React from "react";
import { InputNumber } from "primereact/inputnumber";

const NumericFilter = ({ options, inputNumberProps = {} }) => {
  return (
    <InputNumber
      value={options.value}
      onChange={(e) => options.filterCallback(e.value, options.index)}
      className="p-column-filter"
      placeholder="Enter number"
      {...inputNumberProps}
    />
  );
};

export default NumericFilter;
