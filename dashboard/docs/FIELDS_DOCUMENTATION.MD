# Fields System Documentation

This document outlines the architecture and usage of the dynamic fields system within this application. It's designed to help developers understand how fields are defined, configured, rendered, and managed across different parts of the UI (forms, tables, viewers).

## Table of Contents

1.  [Core Philosophy](#core-philosophy)
2.  [Key Files & Their Roles](#key-files--their-roles)
    - [Configuration & Definition](#configuration--definition)
    - [Rendering & Interaction (Forms)](#rendering--interaction-forms)
    - [Data Management (Hooks)](#data-management-hooks)
    - [Display (Viewers, Tables)](#display-viewers-tables)
    - [Utilities](#utilities)
3.  [How a Field is Processed (Lifecycle)](#how-a-field-is-processed-lifecycle)
    - [In Forms (DocEditor)](#in-forms-DocEditor)
    - [In Tables (DynamicDataTable)](#in-tables-dynamicdatatable)
    - [In Viewers (DocViewer)](#in-viewers-DocViewer)
4.  [Working with Fields](#working-with-fields)
    - [Adding a New Field Type](#adding-a-new-field-type)
    - [Customizing Field Behavior via Schema Description](#customizing-field-behavior-via-schema-description)
    - [Using a Form Field Component Standalone](#using-a-form-field-component-standalone)
5.  [Available Configuration Options (via Description)](#available-configuration-options-via-description)
6.  [Extending the System](#extending-the-system)

## 1. Core Philosophy

The fields system is built on the principles of:

- **Schema-Driven UI:** Field behavior and appearance are primarily defined by a backend schema (e.g., Frappe Doctype metadata).
- **Centralized Configuration:** A single source of truth (`fieldTypeConfigurations.jsx`) maps field types to their UI components and behaviors.
- **Separation of Concerns:** Logic, presentation, and data management are kept in distinct, reusable modules (hooks, components, utilities, adapters).
- **Adaptability:** An adapter layer (`FormFieldAdapter.js`) translates generic field schema into specific props required by UI components, allowing for easy integration of new or different UI components.
- **Extensibility:** The system is designed to easily accommodate new field types or new display variations for existing types.

## 2. Key Files & Their Roles

### Configuration & Definition

- **`src/components/document/utils/fieldTypeConfigurations.jsx`**

  - **Role:** The central registry mapping `fieldType` strings (e.g., "Data", "Select", "Link") to their React components and behavioral configurations for forms, table cells, and table filters.
  - **Defines per field type:**
    - `formComponent`: React component for form input (e.g., `InputText`, custom `ColorPickerFormField`).
    - `tableBodyComponent`: React component/function for rendering in a data table cell.
    - `tableFilterElement`: React component/function for the column filter UI in a data table.
    - Metadata: `sortable` (boolean), `filterable` (boolean), `dataType` (string: "text", "numeric", "date", "boolean") for table operations.
  - **Key Function:** `getFieldConfig(fieldType, fieldname)` retrieves the configuration for a given field type.

- **`src/components/document/utils/schemaUtils.js` (`parseDescription` function)**

  - **Role:** Parses the `description` string from a field's schema. This string can contain plain text (for tooltips) or a JSON object for more complex UI hints.
  - **Output:** An object containing a `tooltip` property and any other properties defined in the JSON (e.g., `asChip`, `readVisible`, `link_filters`). See [Available Configuration Options via Description](#available-configuration-options-via-description).

- **`src/components/document/utils/schemaToColumns.js` (`transformSchemaToColumnConfig` function)**
  - **Role:** Converts an array of field schemas (from a Doctype) into a configuration array suitable for the `DynamicDataTable` component.
  - **Functionality:** Filters fields (e.g., `in_list_view`), maps schema properties to column definitions, uses `parseDescription` for `displayProps`, and prepares `filterOptions` for "Select" and "Link" types.

### Rendering & Interaction (Forms)

- **`src/components/document/DocEditor.jsx`**

  - **Role:** Orchestrates the rendering of an entire form for creating or editing documents.
  - **Mechanism:** Iterates schema fields, uses `getFieldConfig` for the `formComponent`, `FormFieldAdapter` for props, and renders labels, errors, and layout based on schema and `parseDescription` output.

- **`src/components/document/utils/FormFieldAdapter.js` (`getAdaptedProps` function)**

  - **Role:** An adapter that translates a generic `fieldSchemaItem` and form `context` (current data, input handlers) into specific props required by the `formComponent`.
  - **Functionality:** Handles value transformations (e.g., string to `Date`), sets up `onChange` handlers to correctly update form state, and provides component-specific props (e.g., `suggestions` for `AutoComplete`). Contains helper functions like `getCheckProps`, `getDateTimeProps`, etc., for different field types.

- **`src/components/formFields/*.jsx`** (e.g., `ColorPickerFormField.jsx`, `CheckSwitchFormField.jsx`, `AttachmentFormField.jsx`)
  - **Role:** Custom React components that render the UI for specific field types in forms. They are used as `formComponent`s in `fieldTypeConfigurations.jsx`. They receive props from `DocEditor` via `FormFieldAdapter`. PrimeReact components (like `InputText`, `Dropdown`) are also used directly as `formComponent`s.

### Data Management (Hooks)

- **`src/components/document/hooks/useFormHandler.js`**

  - **Role:** Manages core form state (`formData`, `formErrors`), input change handling (`handleInputChange`), default value application (`applySchemaDefaults`), and validation (`validateForm`).
  - **Key for:** Data integrity and user input lifecycle within forms.

- **`src/components/document/hooks/useLinkFieldSearch.js`**

  - **Role:** Handles fetching and managing suggestions for "Link" type fields, typically used with `AutoComplete` components. Respects `link_filters` from the field's description.

- **`src/components/document/hooks/useDocumentData.js`**
  - **Role:** Fetches document schema (`formSchema`) and document data (`docData`) for a given doctype and document name. Used by both editor and viewer.

### Display (Viewers, Tables)

- **`src/components/document/DocViewer.jsx`**

  - **Role:** Renders a read-only display of a document.
  - **Mechanism:** Similar to the editor, it iterates schema fields and uses `getFieldConfig` to get the `tableBodyComponent` (note: `tableBodyComponent` is reused for viewer display logic) and `parseDescription` for display hints.

- **`src/components/common/DynamicDataTable.jsx`**
  - **Role:** Renders data in a sortable, filterable, paginated table.
  - **Mechanism:** Uses `columnsConfig` (from `transformSchemaToColumnConfig`). For each column, it employs the `tableBodyComponent` for cell rendering and `tableFilterElement` for filtering, both sourced from `fieldTypeConfigurations.jsx`. `displayProps` (from `parseDescription`) are passed to the `tableBodyComponent`.

### Utilities

- **`src/utils/formatters.jsx`**
  - **Role:** Provides functions for formatting data for display (dates, currencies, etc.) or for consistent server submission.

## 3. How a Field is Processed (Lifecycle)

### In Forms (`DocEditor`)

1.  `DocEditor` receives `doctypeName` and (optionally) `docname`.
2.  `useDocumentData` fetches the `formSchema` and `initialDocData`.
3.  `useFormHandler` initializes `formData` (applying defaults if in create mode).
4.  `DocEditor`'s `renderFormField` callback is invoked for each field in `formSchema.fields`:
    a. Skips if hidden or `editVisible: false` (from `parseDescription`).
    b. `getFieldConfig` retrieves the `formComponent` and other configs for the field's `fieldtype`.
    c. `parseDescription` extracts UI hints (tooltip, layout, etc.) from `fieldSchemaItem.description`.
    d. An `adapterContext` is created (containing `formData`, `handleInputChange`, `linkSuggestions`, etc.).
    e. `FormFieldAdapter.getAdaptedProps(fieldSchemaItem, adapterContext)` generates tailored props for the `formComponent`.
    f. The `formComponent` (e.g., `InputText`, `ColorPickerFormField`) is rendered with these adapted props, along with standard props like `id`, `disabled`, and `className`.
    g. Label and error messages are rendered around the component based on schema and `formErrors`.
5.  User interacts with the field:
    a. The `formComponent`'s native `onChange` (or equivalent) fires.
    b. The adapted `onChange` (provided by `FormFieldAdapter` or an internal handler in custom field components) calls `handleInputChange` from `useFormHandler`.
    c. `handleInputChange` updates `formData` and clears the field's specific error.
6.  On submit, `validateForm` from `useFormHandler` is called.

### In Tables (`DynamicDataTable`)

1.  Parent component generates `columnsConfig` by calling `transformSchemaToColumnConfig(formSchema, customArgs)`. This function:
    a. Filters schema fields by `in_list_view`.
    b. For each field, calls `parseDescription` to get `displayProps` (e.g., `asChip`, `imageWidth`).
    c. Prepares `filterOptions` for Select/Link fields.
2.  `DynamicDataTable` receives `columnsConfig`.
3.  For each column in `visibleColumns` (managed by `DynamicDataTable`):
    a. `getFieldConfig` determines the `tableBodyComponent` and `tableFilterElement` based on `colConfig.fieldtype`.
    b. **Cell Rendering:** The `tableBodyComponent` is called with `(rowData, fieldname, colConfig.displayProps, formatters)`. The component uses `displayProps` to customize its rendering (e.g., `SelectCell` uses `displayProps.asChip`).
    c. **Filtering:** The `tableFilterElement` is rendered, receiving callbacks and options to perform filtering.
    d. **Header Tooltip:** `parseDescription(colConfig.description).tooltip` is used for the column header.

### In Viewers (`DocViewer`)

1.  `DocViewer` fetches `formSchema` and `docData` via `useDocumentData`.
2.  Its `renderFieldDisplay` callback is invoked for each field:
    a. Skips if hidden or `readVisible: false` (from `parseDescription`).
    b. `getFieldConfig` retrieves the `tableBodyComponent` (repurposed for viewer display) for the field's `fieldtype`.
    c. `parseDescription` extracts UI hints. These, along with `fieldDisplayConfig` (a prop for viewer-specific overrides), form `effectiveDisplayProps`.
    d. The `tableBodyComponent` is called with `(docData, fieldname, effectiveDisplayProps, formatters)`.
    e. Label and layout are rendered based on schema and `parseDescription` output.

## 4. Working with Fields

### Adding a New Field Type

Let's say you want to add a new `RatingStars` field type.

1.  **Define Backend Field Type:** Ensure your backend (e.g., Frappe) recognizes "RatingStars" as a valid field type.
2.  **Create Form Component:**
    - Create `src/components/formFields/RatingStarsFormField.jsx`.
    - This component will likely use a star rating UI library (e.g., PrimeReact's `Rating` component or a custom one).
    - It should accept props like `value`, `onChange`, `disabled`, `stars` (number of stars, perhaps from `description` or schema options).
3.  **Create Table Cell Component (Optional):**
    - Create `src/components/table/cells/RatingStarsCell.jsx` if you need custom rendering in tables (e.g., showing filled/empty stars).
    - It will receive `(rowData, fieldname, displayProps, formatters)`.
4.  **Create Table Filter Element (Optional):**
    - Create `src/components/table/filters/RatingStarsFilter.jsx` if you want a specific filter UI for ratings (e.g., a slider or exact number input).
5.  **Update `fieldTypeConfigurations.jsx`:**

    ```javascript
    import RatingStarsFormField from "@/components/formFields/RatingStarsFormField.jsx";
    import RatingStarsCell from "@/components/table/cells/RatingStarsCell.jsx";
    // ... other imports

    export const fieldTypeConfigurations = {
      // ... other types
      RatingStars: {
        formComponent: RatingStarsFormField,
        tableBodyComponent: RatingStarsCell, // or (rowData, fieldname) => `${rowData[fieldname]} stars`
        tableFilterElement: null, // or RatingStarsFilter
        sortable: true,
        filterable: true,
        dataType: "numeric", // Assuming rating is stored as a number
      },
    };
    ```

6.  **Update `FormFieldAdapter.js`:**
    Add a new case and helper function for "RatingStars":

    ```javascript
    // In FormFieldAdapter.js

    const getRatingStarsProps = (context) => {
      const { fieldname, options } = context.fieldSchema; // e.g., options might define max stars
      const numStars = parseInt(options, 10) || 5; // Default to 5 stars
      return {
        value: context.formData[fieldname] || 0,
        onChange: (e) => context.handleInputChange(fieldname, e.value), // PrimeReact Rating uses e.value
        stars: numStars,
        // cancel: false, // Example prop for PrimeReact Rating
      };
    };

    export const getAdaptedProps = (fieldSchema, context) => {
      const fullContext = { ...context, fieldSchema };
      const { fieldtype } = fieldSchema;
      switch (fieldtype) {
        // ... other cases
        case "RatingStars":
          return getRatingStarsProps(fullContext);
        // ...
      }
    };
    ```

7.  **Update Schema:** Use the new "RatingStars" `fieldtype` in your backend doctype definitions. You can use the `description` field to pass additional props like `{"stars": 10}`.

### Customizing Field Behavior via Schema Description

The `description` property of a field in your backend schema is a powerful tool for UI customization. Use `src/components/document/utils/schemaUtils.js` (`parseDescription`) to interpret it.

1.  **Backend:** In your Doctype field definition, set the `description` to a JSON string:

    - Example for a "Status" (Select) field:
      `{"tooltip": "Current status of the task", "asChip": true, "chipColors": {"Open": "info", "In Progress": "warning", "Done": "success"}}`
    - Example for an "Assignee" (Link to User) field:
      `{"tooltip": "User assigned to this", "asAvatar": true, "avatarSize": "small", "link_filters": [["enabled", "=", 1]]}`
    - Example for a "Details" (Text Editor) field to hide its label in the viewer:
      `{"hideLabel": true, "readVisible": true}`
    - Example for a "Section Title" (Heading) field:
      `{"level": "h2", "textColorClass": "text-primary-500", "borderBottom": true}`

2.  **Frontend (`parseDescription`)**: This utility will parse the JSON string.

    - `parseDescription(field.description)` returns an object like `{ tooltip: "...", asChip: true, chipColors: {...} }`.

3.  **Usage:**
    - **`DocEditor` / `DocViewer` (`renderFormField` / `renderFieldDisplay`):** The `descriptionData` object is used to control label visibility, layout (`aside`), and is part of `effectiveDisplayProps`.
    - **`transformSchemaToColumnConfig`:** Populates `colConfig.displayProps` with `descriptionData`.
    - **Field Components / Table Cell Components:** These components receive `displayProps` (or `fieldSchemaItem.description` for form components) and should be coded to respect these properties (e.g., `if (props.displayProps.asChip) { renderAsChip(); }`).

See [Available Configuration Options via Description](#available-configuration-options-via-description) for a list of common properties.

### Using a Form Field Component Standalone (e.g., in a Dialog)

You can reuse the `formComponent`s outside the main `DocEditor`.

1.  **Obtain/Define Field Schema:** You need a `fieldSchemaItem` object for the field you want to render (containing `fieldname`, `fieldtype`, `label`, `description`, etc.).
2.  **Get the Component:**
    ```javascript
    import { getFieldConfig } from "@/components/document/utils/fieldTypeConfigurations.jsx";
    const fieldTypeConfig = getFieldConfig(
      myFieldSchema.fieldtype,
      myFieldSchema.fieldname
    );
    const FormComponent = fieldTypeConfig.formComponent;
    ```
3.  **Manage State Locally:** Use `useState` for the field's value and any errors.
4.  **Create `adapterContext`:**

    ```javascript
    import * as FormFieldAdapter from "@/components/document/utils/FormFieldAdapter.js";
    import { parseDescription } from "@/components/document/utils/schemaUtils.js";

    // In your dialog component
    const [fieldValue, setFieldValue] = useState(null); // Or initial value
    const [fieldError, setFieldError] = useState("");
    // const toast = useRef(null); // If needed

    const handleLocalInputChange = (name, value) => {
      if (name === myFieldSchema.fieldname) {
        setFieldValue(value);
        if (fieldError) setFieldError("");
      }
    };

    const adapterContext = {
      formData: { [myFieldSchema.fieldname]: fieldValue },
      handleInputChange: handleLocalInputChange,
      isCreateMode: true, // Or as appropriate
      fieldSchema: myFieldSchema,
      // Provide stubs or actual implementations for other context props if needed by the adapter
      // linkSuggestions: {}, handleLinkSearch: async () => {}, toast: toast, openUploadModal: () => {}
    };
    ```

5.  **Get Adapted Props:**
    `const componentSpecificProps = FormFieldAdapter.getAdaptedProps(myFieldSchema, adapterContext);`
6.  **Assemble Common Props:**

    ```javascript
    const descriptionData = parseDescription(myFieldSchema.description);
    let valuePropName = componentSpecificProps.valuePropName || "value";
    if (
      myFieldSchema.fieldtype === "Check" &&
      !componentSpecificProps.valuePropName
    )
      valuePropName = "checked";

    const commonInputProps = {
      id: myFieldSchema.fieldname,
      [valuePropName]:
        componentSpecificProps[valuePropName] !== undefined
          ? componentSpecificProps[valuePropName]
          : fieldValue,
      disabled: false, // Or some condition
      placeholder: myFieldSchema.placeholder || `Enter ${myFieldSchema.label}`,
      className: `w-full ${fieldError ? "p-invalid" : ""}`,
      tooltip: descriptionData.tooltip,
      tooltipOptions: { position: "top" },
      onChange: componentSpecificProps.onChange, // Crucial: use the adapted onChange
      ...componentSpecificProps,
    };
    delete commonInputProps.valuePropName;
    ```

7.  **Render:**
    ```html
    <label htmlFor="{myFieldSchema.fieldname}">{myFieldSchema.label}</label>
    <FormComponent {...commonInputProps} />
    {fieldError && <small className="p-error">{fieldError}</small>}
    ```

## 5. Available Configuration Options (via `description` JSON)

This is not an exhaustive list but covers common use cases. Your components must be implemented to respect these.

- **General:**

  - `tooltip` (string): Tooltip text for the field label or column header.
  - `readVisible` (boolean, default `true`): If `false`, field is hidden in `DocViewer`.
  - `editVisible` (boolean, default `true`): If `false`, field is hidden in `DocEditor`.
  - `hideLabel` (boolean, default `false`): If `true`, the field's label is hidden in editor/viewer.
  - `aside` (string: "left" | "right"): In editor/viewer, positions the label to the left or right of the input/value for a horizontal layout. Default is vertical.
  - `className` (string): Custom CSS class to be applied to the field's wrapper or a specific element (component dependent).

- **For "Select", "Link" (or any field rendered as a chip/tag in tables/viewers):**

  - `asChip` (boolean): If `true`, render the value as a PrimeReact `Tag` or chip.
  - `chipColors` (object): Key-value pair where key is the field value and value is the PrimeReact severity (e.g., `{"Open": "info", "Done": "success"}`).
  - `chipRounded` (boolean): If `true`, makes the chip rounded.

- **For "Attach Image":**

  - `asAvatar` (boolean): If `true`, render as a circular `Avatar` instead of `Image`.
  - `avatarSize` (string: "large", "xlarge", "small"): Size of the avatar.
  - `imageWidth` (string): Width for the `Image` component (e.g., "100px", "150").
  - `imageClassName` (string): Custom CSS classes for the `Image` component's image element.

- **For "Link" fields (used by `useLinkFieldSearch`):**

  - `link_filters` (array of arrays/strings): Filters to apply when searching for link suggestions.
    - Format: `[["fieldname", "operator", "value"], ["status", "=", "Open"]]`
    - Or: `["fieldname,=,value", "status,=,Open"]`

- **For "Heading" fields (used by `HeadingField.jsx`):**

  - `level` (string: "h1" - "h6"): Sets the HTML heading tag and influences text size. Default "h3".
  - `textColorClass` (string): Tailwind CSS class for text color (e.g., "text-primary-500").
  - `marginClass` (string): Tailwind CSS class for margin (e.g., "mt-8 mb-4").
  - `noMargin` (boolean): If true, removes default margins.
  - `borderBottom` (boolean): If true, adds a bottom border.

- **For "Check" fields (used by `CheckSwitchFormField.jsx`):**

  - `asSwitch` (boolean): If `true`, render as an `InputSwitch` instead of a `Checkbox`.
  - `inputLabel` (string): If provided, renders a label next to the checkbox/switch input itself (useful if the main field label is general).

- **Component-Specific:** Individual custom field components can define and parse their own properties from the description. For example, a `RatingStarsFormField` might look for `{"stars": 5, "color": "gold"}`.

**To add a new description prop:**

1.  Decide on the prop name (e.g., `showClearButton`).
2.  Ensure `parseDescription` will pass it through (it does if it's valid JSON).
3.  Modify the relevant component(s) (`formComponent`, `tableBodyComponent`) or adapter to read and act upon `props.displayProps.showClearButton` or `props.fieldSchemaItem.description` (after parsing).

## 6. Extending the System

- **New Field Types:** Follow the [Adding a New Field Type](#adding-a-new-field-type) guide.
- **New Display Props from Description:** See "To add a new description prop" above.
- **More Complex Validation:** Consider enhancing `useFormHandler` or integrating a validation library if needed.
- **More Complex Default Values:** Enhance `applySchemaDefaults` in `useFormHandler`.
- **Alternative UI Components:** If you want to swap out a PrimeReact component for another library's component for a specific field type, you'd primarily update the `formComponent` in `fieldTypeConfigurations.jsx` and adjust the corresponding adapter function in `FormFieldAdapter.js`.

This documentation should serve as a solid starting point. Remember to keep it updated as the system evolves!
