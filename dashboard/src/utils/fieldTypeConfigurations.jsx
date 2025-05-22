// dashboard/src/utils/fieldTypeConfigurations.jsx - Updated with clean filter approach
import React from "react";

// --- PrimeReact Components ---
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

// --- Custom Form Field Components ---
import AttachmentFormField from "@/components/formFields/AttachmentFormField.jsx";
import ColorPickerFormField from "@/components/formFields/ColorPickerFormField.jsx";
import HeadingField from "@/components/formFields/HeadingField.jsx";
import CheckSwitchFormField from "@/components/formFields/CheckSwitchFormField.jsx";
import CurrencyFormField from "@/components/formFields/CurrencyFormField.jsx";
import GenericInputNumberFormField from "@/components/formFields/GenericInputNumberFormField.jsx";
import DateFormField from "@/components/formFields/DateFormField.jsx";
import DateTimeFormField from "@/components/formFields/DateTimeFormField.jsx";
import TimeFormField from "@/components/formFields/TimeFormField.jsx";
import GenericTextareaFormField from "@/components/formFields/GenericTextareaFormField.jsx";
import TextEditorFormField from "@/components/formFields/TextEditorFormField.jsx";
import NationalityFormField from "@/components/formFields/NationalityFormField.jsx";

// --- Table Cell Components ---
import AttachCell from "@/components/table/cells/AttachCell.jsx";
import AttachImageCell from "@/components/table/cells/AttachImageCell.jsx";
import SelectCell from "@/components/table/cells/SelectCell.jsx";
import CheckboxCell from "@/components/table/cells/CheckboxCell.jsx";
import ColorCell from "@/components/table/cells/ColorCell.jsx";
import RichTextCell from "@/components/table/cells/RichTextCell.jsx";
import NationalityCell from "@/components/table/cells/NationalityCell.jsx";
import DefaultCell from "@/components/table/cells/DefaultCell.jsx";

// --- Clean Table Filter Components ---
import NumericFilter from "@/components/table/filters/NumericFilter.jsx";
import CurrencyFilter from "@/components/table/filters/CurrencyFilter.jsx";
import DateFilter from "@/components/table/filters/DateFilter.jsx";
import SelectFilter from "@/components/table/filters/SelectFilter.jsx";
import MultiSelectFilter from "@/components/table/filters/MultiSelectFilter.jsx";
import TriStateFilter from "@/components/table/filters/TriStateFilter.jsx";

// --- Formatters ---
import * as formatters from "./formatters.jsx";
import { parseDescription } from "@/utils/schemaUtils";

export const fieldTypeConfigurations = {
  // --- Attachment Types ---
  Attach: {
    formComponent: AttachmentFormField,
    tableBodyComponent: (rowData, fieldname, displayProps) => (
      <AttachCell
        rowData={rowData}
        fieldname={fieldname}
        displayProps={displayProps}
      />
    ),
    tableFilterElement: null,
    sortable: false,
    filterable: false,
    dataType: "text",
  },
  "Attach Image": {
    formComponent: AttachmentFormField,
    tableBodyComponent: (rowData, fieldname, displayProps) => (
      <AttachImageCell
        rowData={rowData}
        fieldname={fieldname}
        displayProps={displayProps}
      />
    ),
    tableFilterElement: null,
    sortable: false,
    filterable: false,
    dataType: "text",
  },

  // --- Selection Types ---
  Select: {
    formComponent: Dropdown,
    tableBodyComponent: (rowData, fieldname, displayProps) => (
      <SelectCell
        rowData={rowData}
        fieldname={fieldname}
        displayProps={displayProps}
      />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <SelectFilter
        options={options}
        selectOptions={colProps.options || []}
        placeholder={`Select ${colProps.header || fieldname}`}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  Autocomplete: {
    formComponent: Dropdown,
    tableBodyComponent: (rowData, fieldname, displayProps) => (
      <SelectCell
        rowData={rowData}
        fieldname={fieldname}
        displayProps={displayProps}
      />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <SelectFilter
        options={options}
        selectOptions={colProps.options || []}
        placeholder={`Search ${colProps.header || fieldname}`}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  Nationality: {
    formComponent: NationalityFormField,
    tableBodyComponent: (rowData, fieldname) => (
      <NationalityCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <MultiSelectFilter
        options={options}
        selectOptions={colProps.options || []}
        placeholder="Any Nationality"
        itemTemplate={(option) => <span>{option.label}</span>}
        maxSelectedLabels={1}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },

  // --- Link Types ---
  Link: {
    formComponent: (await import("primereact/autocomplete")).AutoComplete,
    tableBodyComponent: (rowData, fieldname, displayProps) => (
      <SelectCell
        rowData={rowData}
        fieldname={fieldname}
        displayProps={displayProps}
      />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <MultiSelectFilter
        options={options}
        selectOptions={colProps.options || []}
        placeholder="Any"
        maxSelectedLabels={3}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },

  // --- Boolean/Check Type ---
  Check: {
    formComponent: CheckSwitchFormField,
    tableBodyComponent: (rowData, fieldname) => (
      <CheckboxCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <TriStateFilter options={options} label="Verified" />
    ),
    sortable: true,
    filterable: true,
    dataType: "boolean",
  },

  // --- Color Type ---
  Color: {
    formComponent: ColorPickerFormField,
    tableBodyComponent: (rowData, fieldname) => (
      <ColorCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <InputText
        value={options.value || ""}
        onChange={(e) => options.filterCallback(e.target.value, options.index)}
        placeholder="Hex color"
        className="p-column-filter"
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },

  // --- Numeric Types ---
  Currency: {
    formComponent: CurrencyFormField,
    tableBodyComponent: (rowData, fieldname) =>
      formatters.formatCurrencyAED(rowData[fieldname]),
    tableFilterElement: (colProps, fieldname, options) => (
      <CurrencyFilter options={options} currency="AED" locale="en-AE" />
    ),
    sortable: true,
    filterable: true,
    dataType: "numeric",
  },
  Int: {
    formComponent: (props) => (
      <GenericInputNumberFormField
        {...props}
        minFractionDigits={0}
        maxFractionDigits={0}
      />
    ),
    tableBodyComponent: (rowData, fieldname) => (
      <DefaultCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <NumericFilter
        options={options}
        inputNumberProps={{
          minFractionDigits: 0,
          maxFractionDigits: 0,
        }}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "numeric",
  },
  Float: {
    formComponent: (props) => (
      <GenericInputNumberFormField
        {...props}
        minFractionDigits={props.minFractionDigits ?? 2}
        maxFractionDigits={props.maxFractionDigits ?? 2}
      />
    ),
    tableBodyComponent: (rowData, fieldname, displayProps) =>
      rowData[fieldname]?.toLocaleString("en-AE", {
        minimumFractionDigits: displayProps?.precision || 2,
        maximumFractionDigits: displayProps?.precision || 2,
      }),
    tableFilterElement: (colProps, fieldname, options) => (
      <NumericFilter
        options={options}
        inputNumberProps={{
          minFractionDigits: colProps.precision || 2,
          maxFractionDigits: colProps.precision || 2,
        }}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "numeric",
  },
  Percent: {
    formComponent: (props) => (
      <GenericInputNumberFormField {...props} suffix="%" />
    ),
    tableBodyComponent: (rowData, fieldname) =>
      `${
        rowData[fieldname] !== undefined && rowData[fieldname] !== null
          ? rowData[fieldname]
          : ""
      }%`,
    tableFilterElement: (colProps, fieldname, options) => (
      <NumericFilter
        options={options}
        inputNumberProps={{
          suffix: "%",
          min: 0,
          max: 100,
        }}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "numeric",
  },

  // --- Text Input Types ---
  Data: {
    formComponent: InputText,
    tableBodyComponent: (rowData, fieldname) => (
      <DefaultCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <InputText
        value={options.value || ""}
        onChange={(e) => options.filterCallback(e.target.value, options.index)}
        placeholder={`Search ${colProps.header || fieldname}`}
        className="p-column-filter"
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  "Small Text": {
    formComponent: InputText,
    tableBodyComponent: (rowData, fieldname) => (
      <DefaultCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <InputText
        value={options.value || ""}
        onChange={(e) => options.filterCallback(e.target.value, options.index)}
        placeholder={`Search ${colProps.header || fieldname}`}
        className="p-column-filter"
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  Text: {
    formComponent: (props) => <GenericTextareaFormField {...props} rows={3} />,
    tableBodyComponent: (rowData, fieldname) => (
      <DefaultCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <InputText
        value={options.value || ""}
        onChange={(e) => options.filterCallback(e.target.value, options.index)}
        placeholder={`Search ${colProps.header || fieldname}`}
        className="p-column-filter"
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  "Long Text": {
    formComponent: (props) => <GenericTextareaFormField {...props} rows={5} />,
    tableBodyComponent: (rowData, fieldname) => (
      <DefaultCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <InputText
        value={options.value || ""}
        onChange={(e) => options.filterCallback(e.target.value, options.index)}
        placeholder={`Search ${colProps.header || fieldname}`}
        className="p-column-filter"
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  "Text Editor": {
    formComponent: TextEditorFormField,
    tableBodyComponent: (rowData, fieldname) => (
      <RichTextCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: null,
    sortable: false,
    filterable: false,
    dataType: "text",
  },

  // --- Date & Time Types ---
  Date: {
    formComponent: DateFormField,
    tableBodyComponent: (rowData, fieldname) =>
      formatters.formatDisplayDate(rowData[fieldname]),
    tableFilterElement: (colProps, fieldname, options) => (
      <DateFilter
        options={options}
        dateFormat="dd/mm/yy"
        placeholder="dd/mm/yyyy"
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "date",
  },
  Datetime: {
    formComponent: DateTimeFormField,
    tableBodyComponent: (rowData, fieldname) =>
      formatters.formatDisplayDateTime(rowData[fieldname]),
    tableFilterElement: (colProps, fieldname, options) => (
      <DateFilter
        options={options}
        dateFormat="dd/mm/yy"
        placeholder="dd/mm/yyyy hh:mm:ss"
        showTime
        showSeconds
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "date",
  },
  Time: {
    formComponent: TimeFormField,
    tableBodyComponent: (rowData, fieldname) =>
      formatters.formatDisplayTime(rowData[fieldname], true),
    tableFilterElement: (colProps, fieldname, options) => (
      <DateFilter
        options={options}
        placeholder="hh:mm:ss"
        timeOnly
        showSeconds
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  Duration: {
    formComponent: (props) => (
      <GenericInputNumberFormField
        {...props}
        minFractionDigits={0}
        maxFractionDigits={0}
        min={0}
      />
    ),
    tableBodyComponent: (rowData, fieldname) =>
      formatters.formatDuration(rowData[fieldname]),
    tableFilterElement: (colProps, fieldname, options) => (
      <NumericFilter
        options={options}
        inputNumberProps={{
          min: 0,
          minFractionDigits: 0,
          maxFractionDigits: 0,
        }}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "numeric",
  },

  // --- Layout/Display Only Types ---
  Heading: {
    formComponent: HeadingField,
    tableBodyComponent: () => null,
    tableFilterElement: null,
    sortable: false,
    filterable: false,
    dataType: "custom",
  },

  // --- Default Fallback ---
  Default: {
    formComponent: InputText,
    tableBodyComponent: (rowData, fieldname) => (
      <DefaultCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <InputText
        value={options.value || ""}
        onChange={(e) => options.filterCallback(e.target.value, options.index)}
        placeholder={`Search ${colProps.header || fieldname}`}
        className="p-column-filter"
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
};

// --- Helper function to get configuration ---
export const getFieldConfig = (fieldType, fieldname, fieldSchema = null) => {
  // Special handling for 'nationality' field if its fieldtype is 'Data'
  // but we want to treat it as "Nationality" type for UI.
  if (
    fieldname === "nationality" &&
    (fieldType === "Data" || fieldType === "Select") &&
    fieldTypeConfigurations["Nationality"]
  ) {
    return fieldTypeConfigurations["Nationality"];
  }

  // Example: If you use a `ui_control` hint in description for custom controls
  if (fieldSchema && (fieldType === "Data" || fieldType === "Small Text")) {
    const desc = parseDescription(fieldSchema.description);
    if (desc.ui_control && fieldTypeConfigurations[desc.ui_control]) {
      return fieldTypeConfigurations[desc.ui_control];
    }
  }

  return (
    fieldTypeConfigurations[fieldType] || fieldTypeConfigurations["Default"]
  );
};
