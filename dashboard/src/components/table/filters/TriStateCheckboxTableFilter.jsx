// dashboard/src/components/table/filters/TriStateCheckboxTableFilter.jsx
import React from "react";
import { TriStateCheckbox } from "primereact/tristatecheckbox";

const TriStateCheckboxTableFilter = ({
  value,
  onChange, // filterApplyCallback
}) => {
  // Normalize the value to ensure it works with TriStateCheckbox
  // TriStateCheckbox expects: true, false, or null
  const normalizedValue = React.useMemo(() => {
    if (value === null || value === undefined) return null;
    if (typeof value === "boolean") return value;
    if (typeof value === "number")
      return value === 1 ? true : value === 0 ? false : null;
    if (typeof value === "string") {
      if (value === "1" || value.toLowerCase() === "true") return true;
      if (value === "0" || value.toLowerCase() === "false") return false;
    }
    return null;
  }, [value]);

  const handleChange = (e) => {
    // e.value will be true, false, or null from TriStateCheckbox
    // Convert to the format expected by PrimeReact filters
    onChange(e.value);
  };

  return (
    <div className="flex justify-center">
      <TriStateCheckbox
        value={normalizedValue}
        onChange={handleChange}
        tooltip="All / True / False"
        tooltipOptions={{ position: "top" }}
      />
    </div>
  );
};

export default TriStateCheckboxTableFilter;
