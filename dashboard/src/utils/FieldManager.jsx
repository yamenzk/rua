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
import { Image } from "primereact/image";
import { Avatar } from "primereact/avatar";
import { Tag } from "primereact/tag";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";

// Custom Formatters
import * as formatters from "./formatters.jsx"; // Assuming formatters.js is in the same directory
import nationalities from "./nationalities.json";

// Placeholder for a custom form field component for attachments
const RuaAttachmentFormField = ({
  fieldname,
  rowData,
  displayProps,
  onFileUpload,
}) => (
  <Button
    label={rowData?.[fieldname] ? "Change File" : "Attach File"}
    icon="pi pi-upload"
    className="p-button-sm p-button-outlined"
    onClick={() => onFileUpload(fieldname, rowData)}
  />
);

export const fieldTypeConfigurations = {
  Attach: {
    formComponent: RuaAttachmentFormField,
    tableBodyComponent: (rowData, fieldname, displayProps) => {
      const fileUrl = rowData[fieldname];
      if (!fileUrl) return null;
      const filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
      return (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-color hover:underline"
        >
          {displayProps?.iconOnly ? (
            <i className="pi pi-paperclip" />
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
      if (displayProps?.asAvatar) {
        return (
          <Avatar
            image={imageUrl}
            shape="circle"
            size="large"
            onError={(e) =>
              (e.target.src =
                "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
            }
          />
        );
      }
      return (
        <Image
          src={imageUrl}
          alt={rowData.name || fieldname}
          width="50"
          preview
          onError={(e) =>
            (e.target.src =
              "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
          }
        />
      );
    },
    tableFilterElement: null,
    sortable: false,
    filterable: false,
    dataType: "text",
  },
  Autocomplete: {
    formComponent: (props) => (
      <Dropdown {...props} filter showClear options={props.options || []} />
    ),
    tableBodyComponent: (rowData, fieldname) => rowData[fieldname],
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
        placeholder={`Search ${colProps.header || fieldname}`}
        showClear
        filter
        className="p-column-filter"
      />
    ),
    sortable: true,
    filterable: true,
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
      <MultiSelect
        value={filterValue}
        options={filterOptions || []}
        onChange={(e) => filterApplyCallback(e.value)}
        placeholder="Any"
        className="p-column-filter"
        maxSelectedLabels={3}
        showClear
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  "Dynamic Link": {
    formComponent: Dropdown,
    tableBodyComponent: (rowData, fieldname) => rowData[fieldname],
    tableFilterElement: (
      colProps,
      fieldname,
      filterValue,
      filterApplyCallback,
      filterOptions
    ) => (
      <MultiSelect
        value={filterValue}
        options={filterOptions || []}
        onChange={(e) => filterApplyCallback(e.value)}
        placeholder="Search"
        className="p-column-filter"
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
            backgroundColor: rowData[fieldname],
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
        currency="AED"
        locale="en-AE"
        minFractionDigits={2}
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
      <InputNumber {...props} mode="decimal" minFractionDigits={2} />
    ),
    tableBodyComponent: (rowData, fieldname, displayProps) =>
      rowData[fieldname]?.toLocaleString("en-AE", {
        minimumFractionDigits: 2,
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
    formComponent: (props) => <Calendar {...props} dateFormat="dd/mm/yy" />,
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
      <Calendar {...props} dateFormat="dd/mm/yy" showTime showSeconds />
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
    formComponent: (props) => <Calendar {...props} timeOnly showSeconds />,
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
      />
    ),
    sortable: true,
    filterable: true,
    dataType: "text",
  },
  Duration: {
    formComponent: InputText,
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
    dataType: "numeric",
  },
  "Text Editor": {
    formComponent: (props) => <Editor {...props} style={{ height: "320px" }} />,
    tableBodyComponent: (rowData, fieldname) => (
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: rowData[fieldname] }}
      />
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
        value={filterValue}
        options={nationalities.map((n) => ({
          label: `${n.flag} ${n.name}`,
          value: n.name,
        }))}
        onChange={(e) => filterApplyCallback(e.value)}
        placeholder="Any Nationality"
        className="p-column-filter"
        itemTemplate={(option) => <span>{option.label}</span>}
        optionLabel="label" // This should now work as options are {label, value}
        optionValue="value"
        maxSelectedLabels={1} // Show only 1 selected item, others as "+X more"
        display="chip" // Show selected items as chips
        showClear
        filter
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
  return fieldTypeConfigurations[fieldType] || fieldTypeConfigurations["Data"];
};
