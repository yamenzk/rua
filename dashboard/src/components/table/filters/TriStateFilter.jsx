// dashboard/src/components/table/filters/TriStateFilter.jsx
import React from "react";
import { TriStateCheckbox } from "primereact/tristatecheckbox";

const TriStateFilter = ({ options, label = "Filter" }) => {
  return (
    <div className="flex align-items-center gap-2">
      <label className="font-bold text-sm">{label}</label>
      <TriStateCheckbox
        value={options.value}
        onChange={(e) => options.filterCallback(e.value)}
      />
    </div>
  );
};

export default TriStateFilter;
