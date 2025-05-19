// dashboard/src/utils/FieldManager.jsx
import React from "react";

// PrimeReact Components
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { Checkbox } from "primereact/checkbox";
import { TriStateCheckbox } from "primereact/tristatecheckbox";
import { Calendar } from "primereact/calendar";
import { ColorPicker } from "primereact/colorpicker";
import { Editor } from "primereact/editor";
import { Image as PrimeImage } from "primereact/image";
import { Avatar } from "primereact/avatar";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { AutoComplete } from "primereact/autocomplete"; // Ensured AutoComplete is imported

// Custom Formatters & Data
import * as formatters from "./formatters.jsx";
import nationalities from "./nationalities.json";

// Custom FormField for Attachments
const RuaAttachmentFormField = ({
  fieldname,
  value, // Current file URL/path from formData or "Pending: filename.txt"
  onFileUploadTrigger, // This will be context.openUploadModal via FormFieldAdapter
}) => (
  <div className="flex flex-col items-start">
    {value && (
      <div className="mb-2">
        {String(value).startsWith("http") || String(value).startsWith("/") ? ( // Check if it's a URL
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-color hover:underline break-all"
            aria-label={`View ${fieldname}`}
          >
            {value.substring(value.lastIndexOf("/") + 1) || value}
          </a>
        ) : (
          <span className="text-text-color-secondary italic">{value}</span> // Display "Pending: filename.txt"
        )}
      </div>
    )}
    <Button
      type="button"
      label={
        value &&
        (String(value).startsWith("http") || String(value).startsWith("/"))
          ? "Change File"
          : "Attach File"
      }
      icon="pi pi-upload"
      className="p-button-sm p-button-outlined"
      onClick={onFileUploadTrigger} // Call the function passed from editor
      aria-label={value ? `Change ${fieldname}` : `Attach ${fieldname}`}
    />
  </div>
);

export const fieldTypeConfigurations = {
  Attach: {
    formComponent: RuaAttachmentFormField,
    tableBodyComponent: (rowData, fieldname, displayProps) => {
      const fileUrl = rowData[fieldname];
      if (!fileUrl) return null;
      const filename =
        fileUrl.substring(fileUrl.lastIndexOf("/") + 1) || fileUrl;
      return (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-color hover:underline"
        >
          {displayProps?.iconOnly ? (
            <i className="pi pi-paperclip" title={filename} />
          ) : (
            filename
          )}
        </a>
      );
    },
    tableFilterElement: null,
    sortable: false,
    filterable: false,
    dataType: "text",
  },
  "Attach Image": {
    formComponent: RuaAttachmentFormField,
    tableBodyComponent: (rowData, fieldname, displayProps) => {
      const imageUrl = rowData[fieldname];
      if (!imageUrl) return null;
      const altText = rowData.name || fieldname;
      if (displayProps?.asAvatar) {
        return (
          <Avatar
            image={imageUrl}
            shape="circle"
            size={displayProps?.avatarSize || "large"}
            alt={`${altText} avatar`}
            onError={(e) => {
              e.target.src =
                "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png";
            }}
          />
        );
      }
      return (
        <PrimeImage
          src={imageUrl}
          alt={altText}
          width={displayProps?.imageWidth || "50"}
          preview
          imageClassName={displayProps?.imageClassName || "object-contain"}
          onError={(e) => {
            e.target.src =
              "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png";
          }}
        />
      );
    },
    tableFilterElement: null,
    sortable: false,
    filterable: false,
    dataType: "text",
  },
  Select: {
    formComponent: Dropdown,
    tableBodyComponent: (rowData, fieldname, displayProps) => {
      const value = rowData[fieldname];
      if (displayProps?.asChip && value) {
        const severity = displayProps.chipColors?.[value] || undefined;
        return (
          <Tag
            value={value}
            severity={severity}
            rounded={displayProps.chipRounded}
          />
        );
      }
      return value;
    },
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback,
      filterOptions
    ) => (
      <Dropdown
        value={filterValue}
        options={filterOptions || colProps.options || []}
        onChange={(e) => filterApplyCallback(e.value)}
        placeholder="Select"
        className="p-column-filter"
        showClear
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  Link: {
    formComponent: AutoComplete, // Key change: Use AutoComplete for forms
    tableBodyComponent: (rowData, fieldname, displayProps) => {
      const value = rowData[fieldname];
      if (displayProps?.asChip && value) {
        const severity = displayProps.chipColors?.[value] || undefined;
        return (
          <Tag
            value={value}
            severity={severity}
            rounded={displayProps.chipRounded}
          />
        );
      }
      // Consider adding navigation to linked doc if possible/needed in tables
      return value;
    },
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback,
      filterOptions
    ) => (
      <MultiSelect
        value={filterValue || []}
        options={filterOptions || []} // `DynamicDataTable` should populate these
        onChange={(e) => filterApplyCallback(e.value)}
        placeholder="Any"
        className="p-column-filter"
        maxSelectedLabels={3}
        showClear
        filter
        optionLabel="label"
        optionValue="value"
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  "Dynamic Link": {
    formComponent: AutoComplete, // Form rendering logic needs to handle dynamic `options` for search
    tableBodyComponent: (rowData, fieldname) => rowData[fieldname],
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback,
      filterOptions
    ) => (
      <MultiSelect
        value={filterValue || []}
        options={filterOptions || []}
        onChange={(e) => filterApplyCallback(e.value)}
        placeholder="Search"
        className="p-column-filter"
        filter
        optionLabel="label"
        optionValue="value"
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  Check: {
    formComponent: Checkbox,
    tableBodyComponent: (rowData, fieldname) =>
      rowData[fieldname] ? "✅" : "❌",
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <TriStateCheckbox
        value={filterValue}
        onChange={(e) => filterApplyCallback(e.value)}
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "boolean",
  },
  Color: {
    formComponent: ColorPicker,
    tableBodyComponent: (rowData, fieldname) =>
      rowData[fieldname] ? (
        <div
          style={{
            width: "24px",
            height: "24px",
            backgroundColor: `#${rowData[fieldname]?.replace("#", "")}`,
            borderRadius: "4px",
            border: "1px solid var(--surface-border)",
          }}
        />
      ) : null,
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <InputText
        value={filterValue || ""}
        onChange={(e) => filterApplyCallback(e.target.value)}
        placeholder="Hex color"
        className="p-column-filter"
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  Currency: {
    formComponent: (props) => (
      <InputNumber
        {...props}
        mode="currency"
        currency={props.currency || "AED"} // Allow overriding currency from schema/props
        locale={props.locale || "en-AE"}
        minFractionDigits={props.minFractionDigits ?? 2}
        maxFractionDigits={props.maxFractionDigits ?? 2}
      />
    ),
    tableBodyComponent: (rowData, fieldname) =>
      formatters.formatCurrencyAED(rowData[fieldname]),
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => {
      const [from, to] = filterValue || [null, null];
      return (
        <div className="flex flex-col gap-1">
          <InputNumber
            inputId={`min_${fieldname}`}
            value={from}
            onValueChange={(e) => filterApplyCallback([e.value, to])}
            mode="currency"
            currency="AED"
            locale="en-AE"
            placeholder="Min"
            className="p-column-filter w-full"
          />
          <InputNumber
            inputId={`max_${fieldname}`}
            value={to}
            onValueChange={(e) => filterApplyCallback([from, e.value])}
            mode="currency"
            currency="AED"
            locale="en-AE"
            placeholder="Max"
            className="p-column-filter w-full"
          />
        </div>
      );
    },
    sortable: true,
    filterable: true,
    dataType: "numeric",
  },
  Int: {
    formComponent: (props) => (
      <InputNumber
        {...props}
        mode="decimal"
        minFractionDigits={0}
        maxFractionDigits={0}
      />
    ),
    tableBodyComponent: (rowData, fieldname) => rowData[fieldname],
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => {
      const [from, to] = filterValue || [null, null];
      return (
        <div className="flex flex-col gap-1">
          <InputNumber
            inputId={`min_${fieldname}`}
            value={from}
            onValueChange={(e) => filterApplyCallback([e.value, to])}
            placeholder="Min"
            className="p-column-filter w-full"
          />
          <InputNumber
            inputId={`max_${fieldname}`}
            value={to}
            onValueChange={(e) => filterApplyCallback([from, e.value])}
            placeholder="Max"
            className="p-column-filter w-full"
          />
        </div>
      );
    },
    sortable: true,
    filterable: true,
    dataType: "numeric",
  },
  Float: {
    formComponent: (props) => (
      <InputNumber
        {...props}
        mode="decimal"
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
    ) => {
      const [from, to] = filterValue || [null, null];
      return (
        <div className="flex flex-col gap-1">
          <InputNumber
            inputId={`min_${fieldname}`}
            value={from}
            onValueChange={(e) => filterApplyCallback([e.value, to])}
            placeholder="Min"
            className="p-column-filter w-full"
            minFractionDigits={colProps.precision || 2}
            maxFractionDigits={colProps.precision || 2}
          />
          <InputNumber
            inputId={`max_${fieldname}`}
            value={to}
            onValueChange={(e) => filterApplyCallback([from, e.value])}
            placeholder="Max"
            className="p-column-filter w-full"
            minFractionDigits={colProps.precision || 2}
            maxFractionDigits={colProps.precision || 2}
          />
        </div>
      );
    },
    sortable: true,
    filterable: true,
    dataType: "numeric",
  },
  Percent: {
    formComponent: (props) => (
      <InputNumber {...props} mode="decimal" suffix="%" />
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
    ) => {
      const [from, to] = filterValue || [null, null];
      return (
        <div className="flex flex-col gap-1">
          <InputNumber
            inputId={`min_${fieldname}`}
            value={from}
            onValueChange={(e) => filterApplyCallback([e.value, to])}
            suffix="%"
            placeholder="Min"
            className="p-column-filter w-full"
          />
          <InputNumber
            inputId={`max_${fieldname}`}
            value={to}
            onValueChange={(e) => filterApplyCallback([from, e.value])}
            suffix="%"
            placeholder="Max"
            className="p-column-filter w-full"
          />
        </div>
      );
    },
    sortable: true,
    filterable: true,
    dataType: "numeric",
  },
  Data: {
    formComponent: InputText,
    tableBodyComponent: (rowData, fieldname) => rowData[fieldname],
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <InputText
        value={filterValue || ""}
        onChange={(e) => filterApplyCallback(e.target.value)}
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
    tableBodyComponent: (rowData, fieldname) => rowData[fieldname],
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <InputText
        value={filterValue || ""}
        onChange={(e) => filterApplyCallback(e.target.value)}
        placeholder={`Search ${colProps.header || fieldname}`}
        className="p-column-filter"
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  Text: {
    formComponent: (props) => (
      <InputTextarea {...props} rows={3} cols={30} autoResize />
    ),
    tableBodyComponent: (rowData, fieldname) => rowData[fieldname],
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <InputText
        value={filterValue || ""}
        onChange={(e) => filterApplyCallback(e.target.value)}
        placeholder={`Search ${colProps.header || fieldname}`}
        className="p-column-filter"
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  "Long Text": {
    formComponent: (props) => (
      <InputTextarea {...props} rows={5} cols={30} autoResize />
    ),
    tableBodyComponent: (rowData, fieldname) => rowData[fieldname],
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <InputText
        value={filterValue || ""}
        onChange={(e) => filterApplyCallback(e.target.value)}
        placeholder={`Search ${colProps.header || fieldname}`}
        className="p-column-filter"
      />
    ),
    sortable: false,
    filterable: true,
    dataType: "text",
  },
  Date: {
    formComponent: (props) => (
      <Calendar {...props} dateFormat="dd/mm/yy" showIcon />
    ),
    tableBodyComponent: (rowData, fieldname) =>
      formatters.formatDisplayDate(rowData[fieldname]),
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <Calendar
        value={filterValue}
        onChange={(e) => filterApplyCallback(e.value)}
        dateFormat="dd/mm/yy"
        placeholder="DD/MM/YYYY"
        mask="99/99/9999"
        showIcon
        className="p-column-filter"
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "date",
  },
  Datetime: {
    formComponent: (props) => (
      <Calendar
        {...props}
        dateFormat="dd/mm/yy"
        showTime
        showSeconds
        showIcon
      />
    ),
    tableBodyComponent: (rowData, fieldname) =>
      formatters.formatDisplayDateTime(rowData[fieldname]),
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <Calendar
        value={filterValue}
        onChange={(e) => filterApplyCallback(e.value)}
        dateFormat="dd/mm/yy"
        showTime
        showSeconds
        placeholder="DD/MM/YYYY HH:MM:SS"
        mask="99/99/9999 99:99:99"
        showIcon
        className="p-column-filter"
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "date",
  },
  Time: {
    formComponent: (props) => (
      <Calendar {...props} timeOnly showSeconds showIcon />
    ),
    tableBodyComponent: (rowData, fieldname) =>
      formatters.formatDisplayTime(rowData[fieldname], true),
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <Calendar
        value={filterValue}
        onChange={(e) => filterApplyCallback(e.value)}
        timeOnly
        showSeconds
        hourFormat="24"
        placeholder="HH:MM:SS"
        mask="99:99:99"
        className="p-column-filter"
        showIcon
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  Duration: {
    formComponent: InputText, // Form component might need a custom duration picker or validation
    tableBodyComponent: (rowData, fieldname) =>
      formatters.formatDuration(rowData[fieldname]),
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => {
      const [from, to] = filterValue || [null, null];
      return (
        <div className="flex flex-col gap-1">
          <InputNumber
            inputId={`min_dur_${fieldname}`}
            value={from}
            onValueChange={(e) => filterApplyCallback([e.value, to])}
            placeholder="Min (seconds)"
            className="p-column-filter w-full"
          />
          <InputNumber
            inputId={`max_dur_${fieldname}`}
            value={to}
            onValueChange={(e) => filterApplyCallback([from, e.value])}
            placeholder="Max (seconds)"
            className="p-column-filter w-full"
          />
        </div>
      );
    },
    sortable: true,
    filterable: true,
    dataType: "numeric", // Sorting/filtering by seconds
  },
  "Text Editor": {
    formComponent: (props) => <Editor {...props} style={{ height: "200px" }} />,
    tableBodyComponent: (rowData, fieldname) => (
      <div
        className="prose max-w-none line-clamp-3"
        dangerouslySetInnerHTML={{ __html: rowData[fieldname] }}
      /> // Added line-clamp
    ),
    tableFilterElement: null,
    sortable: false,
    filterable: false,
    dataType: "text",
  },
  Nationality: {
    formComponent: (props) => (
      <Dropdown
        {...props}
        options={nationalities.map((n) => ({
          label: `${n.flag} ${n.name}`,
          value: n.name,
        }))}
        filter
        showClear
        placeholder="Select Nationality"
        optionLabel="label"
        optionValue="value"
      />
    ),
    tableBodyComponent: (rowData, fieldname) => {
      const nat = nationalities.find((n) => n.name === rowData[fieldname]);
      return nat ? (
        <span className="whitespace-nowrap">
          {nat.flag} {nat.name}
        </span>
      ) : (
        rowData[fieldname]
      );
    },
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <MultiSelect
        value={filterValue || []}
        options={nationalities.map((n) => ({
          label: `${n.flag} ${n.name}`,
          value: n.name,
        }))}
        onChange={(e) => filterApplyCallback(e.value)}
        placeholder="Any Nationality"
        className="p-column-filter"
        itemTemplate={(option) => <span>{option.label}</span>}
        optionLabel="label"
        optionValue="value"
        maxSelectedLabels={1}
        display="chip"
        showClear
        filter
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  Default: {
    // Fallback for unconfigured types
    formComponent: InputText,
    tableBodyComponent: (rowData, fieldname) =>
      String(rowData[fieldname] ?? ""),
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback
    ) => (
      <InputText
        value={filterValue || ""}
        onChange={(e) => filterApplyCallback(e.target.value)}
        placeholder={`Search ${colProps.header || fieldname}`}
        className="p-column-filter"
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
};

export const getFieldConfig = (fieldType, fieldname) => {
  if (
    fieldname === "nationality" &&
    fieldType === "Data" &&
    fieldTypeConfigurations["Nationality"]
  ) {
    return fieldTypeConfigurations["Nationality"];
  }
  return (
    fieldTypeConfigurations[fieldType] || fieldTypeConfigurations["Default"]
  ); // Use "Default" as fallback
};
