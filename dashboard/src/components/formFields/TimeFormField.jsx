// dashboard/src/components/formFields/TimeFormField.jsx - Fixed version
import React from "react";
import { Calendar } from "primereact/calendar";

const TimeFormField = (props) => {
  // Filter out non-DOM props before spreading
  const { fieldSchemaItem, ...safeProps } = props;

  return <Calendar {...safeProps} timeOnly showSeconds showIcon />;
};

export default TimeFormField;
