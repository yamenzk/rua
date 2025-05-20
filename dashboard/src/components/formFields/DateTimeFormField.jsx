// dashboard/src/components/formFields/DateTimeFormField.jsx
import React from "react";
import { Calendar } from "primereact/calendar";

const DateTimeFormField = (props) => (
  <Calendar {...props} dateFormat="dd/mm/yy" showTime showSeconds showIcon />
);

export default DateTimeFormField;
