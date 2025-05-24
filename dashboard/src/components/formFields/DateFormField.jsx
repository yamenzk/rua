// dashboard/src/components/formFields/DateFormField.jsx - Fixed version
import React from "react";
import { Calendar } from "primereact/calendar";

const DateFormField = (props) => {
  // Filter out non-DOM props before spreading
  const { fieldSchemaItem, ...safeProps } = props;

  return <Calendar {...safeProps} dateFormat="dd/mm/yy" showIcon />;
};

export default DateFormField;
