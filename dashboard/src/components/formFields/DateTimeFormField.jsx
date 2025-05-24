// dashboard/src/components/formFields/DateTimeFormField.jsx - Fixed version
import React from "react";
import { Calendar } from "primereact/calendar";

const DateTimeFormField = (props) => {
  // Filter out non-DOM props before spreading
  const { fieldSchemaItem, ...safeProps } = props;

  return (
    <Calendar
      {...safeProps}
      dateFormat="dd/mm/yy"
      showTime
      showSeconds
      showIcon
    />
  );
};

export default DateTimeFormField;
