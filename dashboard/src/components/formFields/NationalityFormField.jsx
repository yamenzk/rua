// dashboard/src/components/formFields/NationalityFormField.jsx
import React from "react";
import { Dropdown } from "primereact/dropdown";
import nationalities from "@/utils/nationalities.json";

const nationalityOptions = nationalities.map((n) => ({
  label: `${n.flag} ${n.name}`,
  value: n.name,
}));

const NationalityFormField = (props) => (
  <Dropdown
    {...props}
    options={nationalityOptions}
    filter
    showClear
    placeholder="Select Nationality"
    optionLabel="label" // This should be just "label"
    // optionValue="value" is default behavior if options are {label: ..., value: ...}
  />
);

export default NationalityFormField;
