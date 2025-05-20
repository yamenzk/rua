// dashboard/src/utils/fieldTypeConfigurations.js
import React from "react";

// PrimeReact Components (used directly as form components or for simple cases)
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber"; // For Duration form field
import { AutoComplete } from "primereact/autocomplete";
import { Dropdown } from "primereact/dropdown"; // For Select form field (if not wrapped)

// Custom Form Field Components
import AttachmentFormField from "@/components/formFields/AttachmentFormField";
import ColorPickerFormField from "@/components/formFields/ColorPickerFormField.jsx"; 
import HeadingField from "@/components/formFields/HeadingField"; 
import CheckSwitchFormField from "@/components/formFields/CheckSwitchFormField"; 
import CurrencyFormField from "@/components/formFields/CurrencyFormField";
import GenericInputNumberFormField from "@/components/formFields/GenericInputNumberFormField";
import DateFormField from "@/components/formFields/DateFormField";
import DateTimeFormField from "@/components/formFields/DateTimeFormField";
import TimeFormField from "@/components/formFields/TimeFormField";
import GenericTextareaFormField from "@/components/formFields/GenericTextareaFormField";
import TextEditorFormField from "@/components/formFields/TextEditorFormField";
import NationalityFormField from "@/components/formFields/NationalityFormField";
import SearchableSelectFormField from "@/components/formFields/SearchableSelectFormField.jsx";

// Table Cell Components
import AttachCell from "@/components/table/cells/AttachCell";
import AttachImageCell from "@/components/table/cells/AttachImageCell";
import SelectCell from "@/components/table/cells/SelectCell";
import LinkCell from "@/components/table/cells/LinkCell";
import CheckboxCell from "@/components/table/cells/CheckboxCell";
import ColorCell from "@/components/table/cells/ColorCell";
import RichTextCell from "@/components/table/cells/RichTextCell";
import NationalityCell from "@/components/table/cells/NationalityCell";
import DefaultCell from "@/components/table/cells/DefaultCell";


// Table Filter Components
import TextTableFilter from "@/components/table/filters/TextTableFilter";
import NumericRangeTableFilter from "@/components/table/filters/NumericRangeTableFilter";
import DateTableFilter from "@/components/table/filters/DateTableFilter";
import SelectTableFilter from "@/components/table/filters/SelectTableFilter";
import MultiSelectTableFilter from "@/components/table/filters/MultiSelectTableFilter";
import TriStateCheckboxTableFilter from "@/components/table/filters/TriStateCheckboxTableFilter";


// Custom Formatters & Data
import * as formatters from "./formatters";
import nationalitiesData from "./nationalities.json"; // Renamed to avoid conflict

const nationalityOptionsForFilter = nationalitiesData.map((n) => ({
	label: `${n.flag} ${n.name}`,
	value: n.name,
}));

export const fieldTypeConfigurations = {
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
  Autocomplete: {
    formComponent: SearchableSelectFormField,
    tableBodyComponent: SelectCell,
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <SelectTableFilter
        value={filterValue}
        onChange={filterApplyCallback}
        optionsFromSchema={colProps.options_from_schema}
        placeholder={`Filter ${colProps.header || fieldname}`}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  Select: {
    formComponent: Dropdown, // Can be a direct PrimeReact component or a wrapped one if more logic is needed
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
      filterApplyCallback,
      filterOptions
    ) => (
      <SelectTableFilter
        value={filterValue}
        options={filterOptions || colProps.options || []}
        onChange={filterApplyCallback}
        placeholder="Select"
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  Link: {
    formComponent: AutoComplete,
    tableBodyComponent: (rowData, fieldname, displayProps) => (
      <LinkCell
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
        options={filterOptions || []}
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
    formComponent: AutoComplete,
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
  Check: {
    formComponent: CheckSwitchFormField,
    tableBodyComponent: (
      rowData,
      fieldname,
      _displayProps,
      _formatters // _formatters kept for signature consistency
    ) => <CheckboxCell rowData={rowData} fieldname={fieldname} />,
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
  Currency: {
    formComponent: CurrencyFormField,
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
  Data: {
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
    sortable: false, // As per original
    filterable: true,
    dataType: "text",
  },
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
  Heading: {
    formComponent: HeadingField,
    tableBodyComponent: () => null, // No display in table
    sortable: false,
    filterable: false,
    dataType: "custom",
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
    dataType: "text", // Or 'time' if your backend/sorting handles it
  },
  Duration: {
    formComponent: InputNumber, // Or a custom duration picker, simple InputNumber for seconds
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
  Nationality: {
    formComponent: NationalityFormField,
    tableBodyComponent: (rowData, fieldname) => (
      <NationalityCell rowData={rowData} fieldname={fieldname} />
    ),
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <MultiSelectTableFilter
        value={filterValue}
        options={nationalityOptionsForFilter}
        onChange={filterApplyCallback}
        placeholder="Any Nationality"
        multiSelectProps={{
          itemTemplate: (option) => <span>{option.label}</span>,
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

export const getFieldConfig = (fieldType, fieldname) => {
	// Special handling for 'nationality' field if its doctype field_type is 'Data'
	if (
		fieldname === "nationality" &&
		fieldType === "Data" && // Assuming 'Data' is a generic type that could be overridden
		fieldTypeConfigurations["Nationality"]
	) {
		return fieldTypeConfigurations["Nationality"];
	}
	return fieldTypeConfigurations[fieldType] || fieldTypeConfigurations["Default"];
};
