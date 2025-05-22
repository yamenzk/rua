// dashboard/src/components/table/filters/DateFilter.jsx
import React from "react";
import { Calendar } from "primereact/calendar";

const DateFilter = ({
  options,
  dateFormat = "dd/mm/yy",
  placeholder = "dd/mm/yyyy",
  showTime = false,
  showSeconds = false,
  timeOnly = false,
}) => {
  const calendarProps = {
    dateFormat,
    placeholder,
    showTime,
    showSeconds,
    timeOnly,
    className: "p-column-filter",
  };

  return (
    <Calendar
      value={options.value}
      onChange={(e) => options.filterCallback(e.value, options.index)}
      {...calendarProps}
    />
  );
};

export default DateFilter;
