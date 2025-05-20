// dashboard/src/components/formFields/TimeFormField.jsx
import React from "react";
import { Calendar } from "primereact/calendar";

const TimeFormField = (props) => (
  <Calendar {...props} timeOnly showSeconds showIcon />
);

export default TimeFormField;
