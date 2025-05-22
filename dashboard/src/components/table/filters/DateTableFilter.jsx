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
  fieldtype = "Date", // Add fieldtype prop to handle different date types
}) => {
  // Ensure value is a proper Date object
  const normalizedValue = React.useMemo(() => {
    if (!value) return null;
    if (value instanceof Date) return value;

    // Try to parse string values
    if (typeof value === "string") {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
  }, [value]);

  const handleDateChange = (e) => {
    // e.value will be a Date object from PrimeReact Calendar
    onChange(e.value);
  };

  // Configure calendar based on field type
  const getCalendarConfig = () => {
    const baseConfig = {
      dateFormat,
      placeholder,
      mask,
      showIcon,
      className,
      ...calendarProps,
    };

    switch (fieldtype) {
      case "Datetime":
        return {
          ...baseConfig,
          showTime: true,
          showSeconds: calendarProps.showSeconds || false,
          dateFormat: calendarProps.dateFormat || "dd/mm/yy",
          placeholder: calendarProps.placeholder || "DD/MM/YYYY HH:MM",
        };

      case "Time":
        return {
          ...baseConfig,
          timeOnly: true,
          showSeconds: calendarProps.showSeconds || true,
          placeholder: calendarProps.placeholder || "HH:MM:SS",
        };

      case "Date":
      default:
        return baseConfig;
    }
  };

  const calendarConfig = getCalendarConfig();

  return (
    <Calendar
      value={normalizedValue}
      onChange={handleDateChange}
      {...calendarConfig}
    />
  );
};

export default DateTableFilter;
