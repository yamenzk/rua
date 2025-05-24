// dashboard/src/components/document/utils/fieldTypeConfigurations.jsx
import React from "react";

// --- Custom Form Field Components (Centralized) ---
import AttachmentFormField from "@/components/formFields/AttachmentFormField.jsx";
import ColorPickerFormField from "@/components/formFields/ColorPickerFormField.jsx";
import HeadingField from "@/components/formFields/HeadingField.jsx";
import CheckSwitchFormField from "@/components/formFields/CheckSwitchFormField.jsx";
import CurrencyFormField from "@/components/formFields/CurrencyFormField.jsx";
import DateFormField from "@/components/formFields/DateFormField.jsx";
import DateTimeFormField from "@/components/formFields/DateTimeFormField.jsx";
import TimeFormField from "@/components/formFields/TimeFormField.jsx";
import GenericTextareaFormField from "@/components/formFields/GenericTextareaFormField.jsx";
import TextEditorFormField from "@/components/formFields/TextEditorFormField.jsx";
import LinkFormField from "@/components/formFields/LinkFormField.jsx";
import SelectFormField from "@/components/formFields/SelectFormField.jsx";
import DataFormField from "@/components/formFields/DataFormField.jsx";
import IntFormField from "@/components/formFields/IntFormField.jsx";
import FloatFormField from "@/components/formFields/FloatFormField.jsx";
import PercentFormField from "@/components/formFields/PercentFormField.jsx";
import DurationFormField from "@/components/formFields/DurationFormField.jsx";

// --- Custom Table Cell Components (Centralized) ---
import AttachCell from "@/components/table/cells/AttachCell.jsx";
import AttachImageCell from "@/components/table/cells/AttachImageCell.jsx";
import SelectCell from "@/components/table/cells/SelectCell.jsx";
import CheckboxCell from "@/components/table/cells/CheckboxCell.jsx";
import ColorCell from "@/components/table/cells/ColorCell.jsx";
import RichTextCell from "@/components/table/cells/RichTextCell.jsx";
import NationalityCell from "@/components/table/cells/NationalityCell.jsx";
import DefaultCell from "@/components/table/cells/DefaultCell.jsx";
import DateTimeCell from "@/components/table/cells/DateTimeCell.jsx";
import NumericCell from "@/components/table/cells/NumericCell.jsx";

// --- Custom Table Filter Components (Centralized) ---
import NumericFilter from "@/components/table/filters/NumericFilter.jsx";
import CurrencyFilter from "@/components/table/filters/CurrencyFilter.jsx";
import DateFilter from "@/components/table/filters/DateFilter.jsx";
import TriStateFilter from "@/components/table/filters/TriStateFilter.jsx";
import LinkFilter from "@/components/table/filters/LinkFilter.jsx";
import TextFilter from "@/components/table/filters/TextFilter.jsx";
import EnhancedSelectFilter from "@/components/table/filters/EnhancedSelectFilter.jsx";

// --- Formatters and Utils ---
import * as formatters from "../../../utils/formatters.jsx";
import { parseDescription } from "@/components/document/utils/schemaUtils";

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
    icon: "paperclip",
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
    icon: "image",
  },

  // --- Selection Types ---
  Select: {
    formComponent: SelectFormField,
    tableBodyComponent: (rowData, fieldname, displayProps) => (
      <SelectCell
        rowData={rowData}
        fieldname={fieldname}
        displayProps={displayProps}
      />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <EnhancedSelectFilter
        options={options}
        colProps={colProps}
        fieldname={fieldname}
        placeholder={`Select ${colProps.header || fieldname}`}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
    icon: "list",
  },
  Autocomplete: {
    formComponent: SelectFormField, // Now uses filterable dropdown instead
    tableBodyComponent: (rowData, fieldname, displayProps) => (
      <SelectCell
        rowData={rowData}
        fieldname={fieldname}
        displayProps={displayProps}
      />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <EnhancedSelectFilter
        options={options}
        colProps={colProps}
        fieldname={fieldname}
        placeholder={`Search ${colProps.header || fieldname}`}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
    icon: "search",
  },
  Nationality: {
    formComponent: SelectFormField,
    tableBodyComponent: (rowData, fieldname) => (
      <NationalityCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <EnhancedSelectFilter
        options={options}
        colProps={colProps}
        fieldname={fieldname}
        placeholder="Any Nationality"
        maxSelectedLabels={1}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
    icon: "flag",
  },

  // --- Link Types ---
  Link: {
    formComponent: LinkFormField,
    tableBodyComponent: (rowData, fieldname, displayProps) => (
      <SelectCell
        rowData={rowData}
        fieldname={fieldname}
        displayProps={displayProps}
      />
    ),
    tableFilterElement: (colProps, fieldname, options, fetchLinkOptions) => (
      <LinkFilter
        options={options}
        linkedDoctype={colProps.linked_doctype}
        fieldDescription={colProps.description}
        fetchLinkOptions={fetchLinkOptions}
        placeholder="Any"
        maxSelectedLabels={2}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
    icon: "link",
  },

  // --- Boolean/Check Type ---
  Check: {
    formComponent: CheckSwitchFormField,
    tableBodyComponent: (rowData, fieldname) => (
      <CheckboxCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <TriStateFilter options={options} label="Active" />
    ),
    sortable: true,
    filterable: true,
    dataType: "boolean",
    icon: "check-square",
  },

  // --- Color Type ---
  Color: {
    formComponent: ColorPickerFormField,
    tableBodyComponent: (rowData, fieldname) => (
      <ColorCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <TextFilter options={options} placeholder="Hex color (e.g. #FF0000)" />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
    icon: "palette",
  },

  // --- Numeric Types ---
  Currency: {
    formComponent: CurrencyFormField,
    tableBodyComponent: (rowData, fieldname) => (
      <NumericCell
        rowData={rowData}
        fieldname={fieldname}
        fieldtype="Currency"
      />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <CurrencyFilter options={options} currency="AED" locale="en-AE" />
    ),
    sortable: true,
    filterable: true,
    dataType: "numeric",
    icon: "dollar-sign",
  },
  Int: {
    formComponent: IntFormField,
    tableBodyComponent: (rowData, fieldname) => (
      <NumericCell rowData={rowData} fieldname={fieldname} fieldtype="Int" />
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
    icon: "hash",
  },
  Float: {
    formComponent: FloatFormField,
    tableBodyComponent: (rowData, fieldname, displayProps) => (
      <NumericCell
        rowData={rowData}
        fieldname={fieldname}
        fieldtype="Float"
        displayProps={displayProps}
      />
    ),
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
    icon: "hash",
  },
  Percent: {
    formComponent: PercentFormField,
    tableBodyComponent: (rowData, fieldname) => (
      <NumericCell
        rowData={rowData}
        fieldname={fieldname}
        fieldtype="Percent"
      />
    ),
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
    icon: "percent",
  },
  Duration: {
    formComponent: DurationFormField,
    tableBodyComponent: (rowData, fieldname) => (
      <NumericCell
        rowData={rowData}
        fieldname={fieldname}
        fieldtype="Duration"
      />
    ),
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
    icon: "clock",
  },

  // --- Text Input Types ---
  Data: {
    formComponent: DataFormField,
    tableBodyComponent: (rowData, fieldname) => (
      <DefaultCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <TextFilter
        options={options}
        placeholder={`Search ${colProps.header || fieldname}`}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
    icon: "type",
  },
  "Small Text": {
    formComponent: DataFormField,
    tableBodyComponent: (rowData, fieldname) => (
      <DefaultCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <TextFilter
        options={options}
        placeholder={`Search ${colProps.header || fieldname}`}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
    icon: "type",
  },
  Text: {
    formComponent: (props) => <GenericTextareaFormField {...props} rows={3} />,
    tableBodyComponent: (rowData, fieldname) => (
      <DefaultCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <TextFilter
        options={options}
        placeholder={`Search ${colProps.header || fieldname}`}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
    icon: "align-left",
  },
  "Long Text": {
    formComponent: (props) => <GenericTextareaFormField {...props} rows={5} />,
    tableBodyComponent: (rowData, fieldname) => (
      <DefaultCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <TextFilter
        options={options}
        placeholder={`Search ${colProps.header || fieldname}`}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
    icon: "align-left",
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
    icon: "edit-3",
  },

  // --- Date & Time Types ---
  Date: {
    formComponent: DateFormField,
    tableBodyComponent: (rowData, fieldname) => (
      <DateTimeCell rowData={rowData} fieldname={fieldname} fieldtype="Date" />
    ),
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
    icon: "calendar",
  },
  Datetime: {
    formComponent: DateTimeFormField,
    tableBodyComponent: (rowData, fieldname) => (
      <DateTimeCell
        rowData={rowData}
        fieldname={fieldname}
        fieldtype="Datetime"
      />
    ),
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
    icon: "calendar",
  },
  Time: {
    formComponent: TimeFormField,
    tableBodyComponent: (rowData, fieldname) => (
      <DateTimeCell rowData={rowData} fieldname={fieldname} fieldtype="Time" />
    ),
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
    icon: "clock",
  },

  // --- Layout/Display Only Types ---
  Heading: {
    formComponent: HeadingField,
    tableBodyComponent: () => null,
    tableFilterElement: null,
    sortable: false,
    filterable: false,
    dataType: "custom",
    icon: "heading",
  },

  // --- Default Fallback ---
  Default: {
    formComponent: DataFormField,
    tableBodyComponent: (rowData, fieldname) => (
      <DefaultCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (colProps, fieldname, options) => (
      <TextFilter
        options={options}
        placeholder={`Search ${colProps.header || fieldname}`}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
    icon: "help-circle",
  },
};

// --- Helper function to get configuration ---
export const getFieldConfig = (fieldType, fieldname, fieldSchema = null) => {
  if (fieldname === "nationality" && fieldTypeConfigurations["Nationality"]) {
    return fieldTypeConfigurations["Nationality"];
  }

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
