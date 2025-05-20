// dashboard/src/components/formFields/DateFormField.jsx
import React from "react";
import { Calendar } from "primereact/calendar";

const DateFormField = (props) => (
  <Calendar {...props} dateFormat="dd/mm/yy" showIcon />
);

export default DateFormField;
