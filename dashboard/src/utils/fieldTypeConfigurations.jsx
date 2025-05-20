// src/utils/fieldTypeConfigurations.jsx
import React from "react";

// --- PrimeReact Components (used directly or as base for formComponents) ---
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber"; // For default Duration form field
import { Dropdown } from "primereact/dropdown"; // For Select & Autocomplete formComponent

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
import TextEditorFormField from "@/components/formFields/TextEditorFormField.jsx"; // Wrapper for PrimeReact Editor
import NationalityFormField from "@/components/formFields/NationalityFormField.jsx";

// --- Table Cell Components ---
import AttachCell from "@/components/table/cells/AttachCell.jsx";
import AttachImageCell from "@/components/table/cells/AttachImageCell.jsx";
import SelectCell from "@/components/table/cells/SelectCell.jsx"; // Used by Select & Autocomplete
// LinkCell was for a different "Link" type, not the Autocomplete we are discussing now
import CheckboxCell from "@/components/table/cells/CheckboxCell.jsx";
import ColorCell from "@/components/table/cells/ColorCell.jsx";
import RichTextCell from "@/components/table/cells/RichTextCell.jsx";
import NationalityCell from "@/components/table/cells/NationalityCell.jsx";
import DefaultCell from "@/components/table/cells/DefaultCell.jsx";

// --- Table Filter Components ---
import TextTableFilter from "@/components/table/filters/TextTableFilter.jsx";
import NumericRangeTableFilter from "@/components/table/filters/NumericRangeTableFilter.jsx";
import DateTableFilter from "@/components/table/filters/DateTableFilter.jsx";
import SelectTableFilter from "@/components/table/filters/SelectTableFilter.jsx"; // Used by Select & Autocomplete
import MultiSelectTableFilter from "@/components/table/filters/MultiSelectTableFilter.jsx"; // For Link & Nationality
import TriStateCheckboxTableFilter from "@/components/table/filters/TriStateCheckboxTableFilter.jsx";

// --- Custom Formatters & Data ---
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
    formComponent: Dropdown, // Uses getSelectProps from adapter (filter: undefined by default)
    tableBodyComponent: (rowData, fieldname, displayProps) => (
      <SelectCell
        rowData={rowData}
        fieldname={fieldname}
        displayProps={displayProps}
      />
    ),
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <SelectTableFilter
        value={filterValue}
        options={colProps.options || []} // Expects {label,value} array from transformSchemaToColumnConfig
        onChange={filterApplyCallback}
        placeholder={`Select ${colProps.header || fieldname}`}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  Autocomplete: {
    // Configured to behave like a searchable Select
    formComponent: Dropdown, // Uses getSelectProps from adapter (filter: true by default for this type)
    tableBodyComponent: (rowData, fieldname, displayProps) => (
      <SelectCell
        rowData={rowData}
        fieldname={fieldname}
        displayProps={displayProps}
      /> // Reuses SelectCell
    ),
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <SelectTableFilter // Reuses SelectTableFilter
        value={filterValue}
        options={colProps.options || []} // Expects {label,value} array from transformSchemaToColumnConfig
        onChange={filterApplyCallback}
        placeholder={`Search ${colProps.header || fieldname}`}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  Nationality: {
    formComponent: NationalityFormField, // Specific component using nationalities.json
    tableBodyComponent: (rowData, fieldname) => (
      <NationalityCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <MultiSelectTableFilter // Nationalities can be filtered with MultiSelect
        value={filterValue}
        options={colProps.options || []} // Expects {label,value} with flags from transformSchemaToColumnConfig
        onChange={filterApplyCallback}
        placeholder="Any Nationality"
        multiSelectProps={{
          itemTemplate: (option) => <span>{option.label}</span>, // For flag display
          maxSelectedLabels: 1,
          display: "chip",
          showClear: true,
          filter: true,
        }}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },

  // --- Link Types ---
  Link: {
    // This is for Frappe-style server-side searched Links
    formComponent: (await import("primereact/autocomplete")).AutoComplete, // Dynamic import example or direct
    tableBodyComponent: (
      rowData,
      fieldname,
      displayProps // Can use SelectCell if chip display is desired
    ) => (
      <SelectCell
        rowData={rowData}
        fieldname={fieldname}
        displayProps={displayProps}
      />
    ),
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback,
      filterOptions
    ) => (
      <MultiSelectTableFilter
        value={filterValue}
        options={filterOptions || []} // DynamicDataTable should populate these for Link filters
        onChange={filterApplyCallback}
        placeholder="Any"
        multiSelectProps={{
          maxSelectedLabels: 3,
          showClear: true,
          filter: true,
        }}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  "Dynamic Link": {
    // Similar to Link, but perhaps different adapter logic
    formComponent: (await import("primereact/autocomplete")).AutoComplete,
    tableBodyComponent: (rowData, fieldname) => (
      <DefaultCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback,
      filterOptions
    ) => (
      <MultiSelectTableFilter
        value={filterValue}
        options={filterOptions || []}
        onChange={filterApplyCallback}
        placeholder="Search"
        multiSelectProps={{ filter: true }}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },

  // --- Boolean/Check Type ---
  Check: {
    formComponent: CheckSwitchFormField, // Handles Checkbox or InputSwitch based on description
    tableBodyComponent: (rowData, fieldname) => (
      <CheckboxCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <TriStateCheckboxTableFilter
        value={filterValue}
        onChange={filterApplyCallback}
      />
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
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <TextTableFilter
        value={filterValue}
        onChange={filterApplyCallback}
        placeholder="Hex color"
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },

  // --- Numeric Types ---
  Currency: {
    formComponent: CurrencyFormField, // Wrapper for InputNumber with currency mode
    tableBodyComponent: (rowData, fieldname) =>
      formatters.formatCurrencyAED(rowData[fieldname]),
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <NumericRangeTableFilter
        fieldname={fieldname}
        filterValue={filterValue}
        filterApplyCallback={filterApplyCallback}
        inputNumberProps={{
          mode: "currency",
          currency: "AED",
          locale: "en-AE",
        }}
      />
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
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <NumericRangeTableFilter
        fieldname={fieldname}
        filterValue={filterValue}
        filterApplyCallback={filterApplyCallback}
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
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <NumericRangeTableFilter
        fieldname={fieldname}
        filterValue={filterValue}
        filterApplyCallback={filterApplyCallback}
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
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <NumericRangeTableFilter
        fieldname={fieldname}
        filterValue={filterValue}
        filterApplyCallback={filterApplyCallback}
        inputNumberProps={{ suffix: "%" }}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "numeric",
  },

  // --- Text Input Types ---
  Data: {
    // Generic text input
    formComponent: InputText,
    tableBodyComponent: (rowData, fieldname) => (
      <DefaultCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <TextTableFilter
        value={filterValue}
        onChange={filterApplyCallback}
        placeholder={`Search ${colProps.header || fieldname}`}
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
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <TextTableFilter
        value={filterValue}
        onChange={filterApplyCallback}
        placeholder={`Search ${colProps.header || fieldname}`}
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
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <TextTableFilter
        value={filterValue}
        onChange={filterApplyCallback}
        placeholder={`Search ${colProps.header || fieldname}`}
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
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <TextTableFilter
        value={filterValue}
        onChange={filterApplyCallback}
        placeholder={`Search ${colProps.header || fieldname}`}
      />
    ),
    sortable: false,
    filterable: true,
    dataType: "text",
  },
  "Text Editor": {
    formComponent: TextEditorFormField, // Wrapper for PrimeReact Editor
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
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <DateTableFilter
        value={filterValue}
        onChange={filterApplyCallback}
        mask="99/99/9999"
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
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <DateTableFilter
        value={filterValue}
        onChange={filterApplyCallback}
        placeholder="DD/MM/YYYY HH:MM:SS"
        mask="99/99/9999 99:99:99"
        calendarProps={{ showTime: true, showSeconds: true }}
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
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <DateTableFilter
        value={filterValue}
        onChange={filterApplyCallback}
        placeholder="HH:MM:SS"
        mask="99:99:99"
        calendarProps={{ timeOnly: true, showSeconds: true, hourFormat: "24" }}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  Duration: {
    // Assuming stored as seconds, displayed formatted
    formComponent: InputNumber, // Or a custom duration picker
    tableBodyComponent: (rowData, fieldname) =>
      formatters.formatDuration(rowData[fieldname]),
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <NumericRangeTableFilter
        fieldname={fieldname}
        filterValue={filterValue}
        filterApplyCallback={filterApplyCallback}
        minPlaceholder="Min (seconds)"
        maxPlaceholder="Max (seconds)"
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "numeric",
  },

  // --- Layout/Display Only Types ---
  Heading: {
    formComponent: HeadingField,
    tableBodyComponent: () => null, // Headings don't typically appear in table data rows
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
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <TextTableFilter
        value={filterValue}
        onChange={filterApplyCallback}
        placeholder={`Search ${colProps.header || fieldname}`}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
};

// --- Helper function to get configuration ---
export const getFieldConfig = (fieldType, fieldname, fieldSchema = null) => {
  // Special handling for 'nationality' field if its doctype field_type is 'Data'
  // but we want to treat it as "Nationality" type for UI.
  if (
    fieldname === "nationality" &&
    (fieldType === "Data" || fieldType === "Select") && // If backend type is Data/Select but field is 'nationality'
    fieldTypeConfigurations["Nationality"]
  ) {
    return fieldTypeConfigurations["Nationality"];
  }

  // Example: If you use a `ui_control` hint in description for "CustomAutoComplete" / "SearchableSelect"
  if (fieldSchema && (fieldType === "Data" || fieldType === "Small Text")) {
      const desc = parseDescription(fieldSchema.description); // Ensure parseDescription is imported or available
      if (desc.ui_control && fieldTypeConfigurations[desc.ui_control]) {
          return fieldTypeConfigurations[desc.ui_control];
      }
  }


  return fieldTypeConfigurations[fieldType] || fieldTypeConfigurations["Default"];
};
