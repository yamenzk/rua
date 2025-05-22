// dashboard/src/components/table/filters/NumericTableFilter.jsx
import React, { useState, useEffect } from "react";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const NumericTableFilter = ({
  fieldname,
  filterValue,
  filterApplyCallback,
  placeholder = "Enter value",
  inputNumberProps = {}, // For mode, currency, suffix, precision etc.
  enableRangeMode = true, // Whether to allow switching between single value and range
  defaultMode = "single", // "single" or "range"
}) => {
  const [filterMode, setFilterMode] = useState(defaultMode);
  const [singleValue, setSingleValue] = useState(null);
  const [rangeValues, setRangeValues] = useState([null, null]);

  // Initialize values from filterValue prop
  useEffect(() => {
    if (filterValue !== null && filterValue !== undefined) {
      if (Array.isArray(filterValue) && filterValue.length === 2) {
        // Range mode
        setFilterMode("range");
        setRangeValues(filterValue);
        setSingleValue(null);
      } else {
        // Single value mode
        setFilterMode("single");
        setSingleValue(filterValue);
        setRangeValues([null, null]);
      }
    }
  }, [filterValue]);

  const handleSingleValueChange = (e) => {
    const newValue = e.value;
    setSingleValue(newValue);
    filterApplyCallback(newValue);
  };

  const handleRangeValueChange = (index, e) => {
    const newValue = e.value;
    const newRange = [...rangeValues];
    newRange[index] = newValue;
    setRangeValues(newRange);

    // Apply filter with the new range
    filterApplyCallback(newRange);
  };

  const handleModeChange = (e) => {
    const newMode = e.value;
    setFilterMode(newMode);

    // Clear current values and apply appropriate empty filter
    if (newMode === "single") {
      setSingleValue(null);
      setRangeValues([null, null]);
      filterApplyCallback(null);
    } else {
      setSingleValue(null);
      setRangeValues([null, null]);
      filterApplyCallback([null, null]);
    }
  };

  const clearFilter = () => {
    setSingleValue(null);
    setRangeValues([null, null]);
    filterApplyCallback(null);
  };

  const modeOptions = [
    { label: "Single Value", value: "single" },
    { label: "Range", value: "range" },
  ];

  const hasValue =
    filterMode === "single"
      ? singleValue !== null && singleValue !== undefined
      : rangeValues.some((val) => val !== null && val !== undefined);

  return (
    <div className="flex flex-col gap-2">
      {enableRangeMode && (
        <div className="flex items-center gap-1">
          <Dropdown
            value={filterMode}
            options={modeOptions}
            onChange={handleModeChange}
            className="p-column-filter flex-1"
            style={{ fontSize: "0.75rem" }}
          />
          {hasValue && (
            <Button
              icon="pi pi-times"
              className="p-button-text p-button-sm"
              onClick={clearFilter}
              tooltip="Clear filter"
              tooltipOptions={{ position: "top" }}
              style={{ padding: "0.25rem" }}
            />
          )}
        </div>
      )}

      {filterMode === "single" ? (
        <InputNumber
          inputId={`single_val_${fieldname}`}
          value={singleValue}
          onValueChange={handleSingleValueChange}
          placeholder={placeholder}
          className="p-column-filter w-full"
          {...inputNumberProps}
        />
      ) : (
        <div className="flex flex-col gap-1">
          <InputNumber
            inputId={`min_val_${fieldname}`}
            value={rangeValues[0]}
            onValueChange={(e) => handleRangeValueChange(0, e)}
            placeholder="Min"
            className="p-column-filter w-full"
            {...inputNumberProps}
          />
          <InputNumber
            inputId={`max_val_${fieldname}`}
            value={rangeValues[1]}
            onValueChange={(e) => handleRangeValueChange(1, e)}
            placeholder="Max"
            className="p-column-filter w-full"
            {...inputNumberProps}
          />
        </div>
      )}
    </div>
  );
};

export default NumericTableFilter;
