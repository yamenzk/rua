// dashboard/src/components/table/filters/DateTableFilter.jsx
import React from "react";
import { Calendar } from "primereact/calendar";

const DateTableFilter = ({
  value,
  onChange, // filterApplyCallback
  dateFormat = "dd/mm/yy",
  placeholder = "DD/MM/YYYY",
  mask,
  showIcon = true,
  className = "p-column-filter",
  calendarProps = {}, // For showTime, showSeconds etc.
}) => {
  return (
    <Calendar
      value={value}
      onChange={(e) => onChange(e.value)}
      dateFormat={dateFormat}
      placeholder={placeholder}
      mask={mask}
      showIcon={showIcon}
      className={className}
      {...calendarProps}
    />
  );
};

export default DateTableFilter;
