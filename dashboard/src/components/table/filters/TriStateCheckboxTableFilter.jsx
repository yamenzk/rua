// dashboard/src/components/table/filters/TriStateCheckboxTableFilter.jsx
import React from "react";
import { TriStateCheckbox } from "primereact/tristatecheckbox";

const TriStateCheckboxTableFilter = ({
  value,
  onChange, // filterApplyCallback
}) => {
  return <TriStateCheckbox value={value} onChange={(e) => onChange(e.value)} />;
};

export default TriStateCheckboxTableFilter;
