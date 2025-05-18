# Rua App: Frontend Development Guidelines

**Version: 2.1**
**Last Updated:** May 18, 2025

This document outlines the established preferences and guidelines for frontend development in the Rua application. It focuses on PrimeReact components, styling with Tailwind CSS, layout principles, state management strategies, the detailed usage of the `frappe-react-sdk`, and documentation for core reusable UI components.

## 1. Core Philosophy & Design Language

* **Overall Aesthetic:** Modern, clean, professional, and user-centric. Interfaces should be intuitive and visually appealing.
* **Branding:**
    * **Logo:** The "Rua" company logo (`logo.png`) is to be used on the login page and other key branding touchpoints (e.g., application header if applicable). Ensure `favicon.png` is used for the browser icon.
    * **Company Name:** Use "Rua" for general display. For formal contexts like page footers, use the full legal name: "Rua Company Glass & Aluminum L.L.C O.P.C".
* **Accessibility:** Strive to meet WCAG AA standards where feasible. Ensure good color contrast, keyboard navigability, and semantic HTML.

## 2. Styling, Theming, and Layout

### 2.1. Theming & Color Palette
* **PrimeReact Theme:** The application uses the "Lara Amber" PrimeReact theme family. Theme switching between light (`lara-light-amber`) and dark (`lara-dark-amber`) modes should be supported.
* **Backgrounds:**
    * Page backgrounds should primarily be dictated by the active PrimeReact theme's `--surface-ground` CSS variable. Avoid hardcoding page background colors with Tailwind utilities like `bg-gray-100` to allow seamless theme switching.
    * Card backgrounds and similar surfaces should use the theme's `--surface-card` variable.
* **Text Colors:**
    * Utilize PrimeReact's theme-aware CSS variables for text, mapped to Tailwind utilities (see Section 2.3).
        * Primary text: `text-text-color`
        * Secondary/subtle text: `text-text-color-secondary`
        * Adjust opacity (e.g., `opacity-75`) for finer control over subtlety.
* **Accent Colors:** The Lara Amber theme's amber shades (available via `primary-color` and `primary-50` through `primary-900` in the Tailwind config) should be used for primary actions, highlights, and interactive elements to maintain brand consistency.

### 2.2. Layout & Structure
* **Responsiveness:** Design for a fully responsive experience using Tailwind CSS's responsive prefixes (`sm:`, `md:`, `lg:`, etc.).
* **Structure:** Employ Tailwind CSS flexbox (`flex`) and grid (`grid`) utilities for page and component layouts.
* **Spacing:** Maintain consistent spacing using Tailwind's spacing scale.
* **Containers:** PrimeReact `Card` components are preferred for grouping related content and actions.

### 2.3. Tailwind CSS Configuration
* Tailwind CSS is used for utility-first styling and complements PrimeReact.
* **Theme Integration:** The `tailwind.config.js` file is extended to include PrimeReact's theme CSS variables, allowing Tailwind utility classes to use theme-aware colors.

    ```javascript
    // tailwind.config.js (Relevant excerpt)
    module.exports = {
      // darkMode: 'class', // or 'media'
      theme: {
        extend: {
          colors: {
            'text-color': 'var(--text-color)',
            'text-color-secondary': 'var(--text-color-secondary)',
            'primary-color': 'var(--primary-color)',
            'primary-color-text': 'var(--primary-color-text)',
            'surface-ground': 'var(--surface-ground)',
            'surface-card': 'var(--surface-card)',
            // ... (include all surface, primary, and other palette colors as previously defined)
            primary: generateColorShades('primary'), // Helper function generates 50-900
            gray: generateColorShades('gray'),
            // ... other palette colors
          },
          borderRadius: {
            'DEFAULT': '0.5rem', // Default for `rounded` class
            'theme': 'var(--border-radius)', // PrimeReact's specific default
            // xl: '0.75rem' (used for login card)
          },
          // ... other extensions like fontFamily, boxShadow, spacing
        },
      },
    };
    ```
    *(Ensure the `generateColorShades` helper function is present in your actual `tailwind.config.js`)*

### 2.4. Border Radius
* **Default:** A default border radius of `0.5rem` (equivalent to Tailwind's `rounded-lg`) is preferred for most elements like inputs and buttons. This is set as `borderRadius.DEFAULT` in `tailwind.config.js`.
* **Cards:** Larger cards may use a slightly larger radius, e.g., `rounded-xl` (0.75rem).
* Apply rounding consistently using Tailwind classes (e.g., `rounded`, `rounded-xl`).

## 3. PrimeReact Component Usage

* **Primary UI Library:** Leverage PrimeReact components extensively.
* **Styling Components:**
    1.  Use built-in props first.
    2.  Apply Tailwind CSS utility classes via `className` for layout and minor style adjustments.
    3.  Use the `pt` (PassThrough) prop for fine-grained control over internal elements if necessary, but with caution to avoid excessive theme overrides.
* **Input Fields (`InputText`, `Password`, `InputNumber`, `Calendar`, `Dropdown`, `AutoComplete`, `Editor`, `ColorPicker`, `Checkbox`, `InputSwitch`):**
    * Use standard `placeholder` attributes.
    * For inputs with icons: Utilize `<IconField iconPosition="left"><InputIcon className="pi pi-..." /><InputText ... /></IconField>`.
    * `Password` component: Use `toggleMask` prop and `feedback={false}`. Style the internal input using `inputClassName="w-full rounded-lg"`.
    * Consider `readOnly` and validation props as needed.
* **Buttons (`Button`):**
    * Primary action buttons should reflect the theme's primary color (amber).
    * Include icons where they enhance clarity (`icon="pi pi-..."`).
    * Always provide user feedback for actions using the `loading` prop.
* **DataTable:** See Section 6.1 for `DynamicDataTable` component guidelines.

## 4. State Management

* **Server State:** **SWR (via `frappe-react-sdk`) is the primary solution for managing server state.** This includes fetching, caching, revalidating, and updating data that originates from the Frappe backend. Its built-in features should be leveraged to handle data fetching lifecycles.
* **Client-Side State:**
    * **Local Component State:** For state that is confined to a single component, use React's `useState` or `useReducer`.
    * **Shared/Global Client State:**
        1.  **React Context API:** For simple global UI state that doesn't update with high frequency (e.g., theme toggles, basic user preferences not tied to backend, like `LayoutContext` for page titles).
        2.  **Lightweight Store (e.g., Zustand):** If Context becomes insufficient, a minimal store like Zustand can be considered. Avoid if not strictly necessary.
    * **Avoid Redux:** Generally not needed given SWR's capabilities.
* **User Preferences Persistence**:
    * UI state specific to a component instance (e.g., column order, visibility, pagination settings in `DynamicDataTable`) should be persisted using browser cookies.
    * Utilize utility functions in `src/utils/cookies.jsx` (`setCookie`, `getCookie`, `eraseCookie`).
    * A `uniqueTableKey` prop should be passed to components like `DynamicDataTable` to create distinct cookie names for each table instance, allowing individual preference storage.

## 5. Frappe React SDK Usage Guide (`frappe-react-sdk`)

The `frappe-react-sdk` integrates SWR for robust data handling.

### 5.1. Setup (`FrappeProvider`)
Ensure `FrappeProvider` wraps the application, configured with `url`, `siteName`, `enableSocket: true`, and `socketPort` as appropriate for realtime functionality.

### 5.2. Authentication (`useFrappeAuth`)
Manages user authentication state.
* **Login**: Due to SDK limitations, a manual `Workspace` is used. After successful manual login, call `getUserCookie()` and `await updateCurrentUser()` to sync SDK state.
* **Logout**: Use `await logout()`.
* `currentUser`, `isLoading`, `error` are key state variables.

### 5.3. Data Fetching (Docs, Lists, Counts - SWR-based)
* Single Documents: `useFrappeGetDoc("Doctype", "docname", { /* SWR options */ })`
* Document Lists: `useFrappeGetDocList("Doctype", { fields: ['*'], limit: 0, ...otherFetchArgs }, { /* SWR options */ })`. For `DynamicDataTable`, initially fetch all (`limit: 0`) for client-side operations; server-side pagination is a future enhancement.
* Document Count: `useFrappeGetDocCount("Doctype", [["field", "=", "value"]])`

### 5.4. Data Mutation (Create, Update, Delete - Stateful Hooks)
* Create: `useFrappeCreateDoc()` -> `await createDoc("Doctype", { ...data })`
* Update: `useFrappeUpdateDoc()` -> `await updateDoc("Doctype", "docname", { ...updatedData })`
* Delete: `useFrappeDeleteDoc()` -> `await deleteDoc("Doctype", "docname")`

### 5.5. Generic API Calls
Refer to SDK documentation.

### 5.6. File Uploads (`useFrappeFileUpload`)
* Provides `upload`, `progress`, etc.
* **Important for New Documents:** The main document must be created (e.g., using `useFrappeCreateDoc`) and its `docname` obtained *before* calling `file.uploadFile` with `doctype` and `docname` in `fileArgs`. This usually involves a two-step save process or disabling file attachment until the main document is saved once.

### 5.7. Searching (`useSearch` - Frappe v15+)
Refer to SDK documentation.

### 5.8. Realtime Events (Socket.IO)
* **Primary Method for List Views**: Use `useFrappeDocTypeEventListener(doctype, callback)` to listen for standard `list_update` events when documents of a specific `doctype` are created, updated, or deleted on the server. The callback should typically call `mutate()` from the corresponding `useFrappeGetDocList` hook to re-fetch data.
    ```javascript
    // Example in a component using useFrappeGetDocList
    const { data, mutate } = useFrappeGetDocList(doctype, ...);
    const handleDocTypeUpdate = useCallback((eventData) => {
      if (eventData.doctype === doctype) {
        mutate();
      }
    }, [doctype, mutate]);
    useFrappeDocTypeEventListener(doctype, handleDocTypeUpdate);
    ```
* **Custom Events**: `useFrappeEventListener('custom_event_name', callback)` can still be used for scenarios not covered by standard DocType events.
* Ensure `FrappeProvider` has `enableSocket: true` and correct `socketPort`.

### 5.9. SWR - Key Principles
* Server State Authority, Automatic Revalidation (on focus, reconnect, configurable interval), Caching, `mutate` function for programmatic re-fetches or optimistic updates.

## 6. Core UI Components & Utilities

This section details reusable components and utilities built for the Rua application.

### 6.1. `DynamicDataTable.jsx`
* **Purpose**: A highly configurable and reusable PrimeReact DataTable wrapper for displaying lists of Frappe doctypes.
* **Location**: `dashboard/src/components/common/DynamicDataTable.jsx`
* **Key Props**:
    * `doctype: string` (Required): The Frappe Doctype name to display.
    * `columnsConfig: ColumnConfig[]` (Required): Array of column definition objects. See below for `ColumnConfig` structure.
    * `uniqueTableKey: string` (Required): A unique string key for this table instance (e.g., "rua_employee_list"). Used for persisting user preferences (column order, visibility, pagination, sorting) in cookies.
    * `WorkspaceArgs?: object`: Initial arguments for `useFrappeGetDocList` (e.g., filters, orderBy). Defaults to `fields: ['*'], limit: 0`.
    * `onRowClick?: (rowData) => void`: Callback when a row is clicked.
    * `contextMenuItemsModel?: MenuItem[]`: PrimeReact ContextMenu model for row actions.
    * `globalFilterFields?: string[]`: Array of fieldnames to include in global search (default: `['name']`).
    * `headerActions?: JSX.Element`: Custom JSX (e.g., "Create New" button) to render in the table header.
    * `enableColumnReordering?: boolean`: Enables/disables column drag-and-drop reordering (default: `true`).
    * `showColumnToggle?: boolean`: Shows/hides the column visibility toggler (default: `true`).
    * `showPaginator?: boolean`: (default: `true`)
    * `initialRows?: number`: (default: `10`)
    * `rowsPerPageOptions?: number[]`: (default: `[10, 25, 50, 100]`)
    * `dataKey?: string`: Unique key for rows (default: `'name'`).
* **Features**:
    * Dynamic column rendering based on `columnsConfig` and `FieldManager`.
    * Client-side sorting, pagination, global filtering, and per-column filtering. (Server-side is a future enhancement).
    * Column visibility toggling using `MultiSelect`.
    * Column reordering (drag and drop).
    * User preference persistence for visible columns, column order, pagination (current page, rows per page), and sort state via cookies, scoped by `uniqueTableKey`.
    * Optional row context menu.
    * Realtime updates via `useFrappeDocTypeEventListener` (refreshes data on backend changes to the specified `doctype`).
    * Customizable header actions.
* **`ColumnConfig` Object Structure (for `columnsConfig` prop)**:
    ```typescript
    interface ColumnConfig {
      fieldname: string;      // Frappe fieldname
      header: string;         // Column header text
      fieldtype: string;      // Frappe fieldtype (e.g., "Data", "Link", "Attach Image")
      sortable?: boolean;     // Default: true for sortable types via FieldManager
      filterable?: boolean;   // Default: true for filterable types via FieldManager
      defaultVisible?: boolean; // Default: true
      options?: any[] | string; // For Select (array of options) or Link (linked Doctype name string)
      filterOptions?: { label: string, value: any }[]; // Pre-fetched options for Link/Select filters in the table
      displayProps?: {      // Props passed to FieldManager for custom rendering
        asChip?: boolean;
        chipColors?: { [value: string]: string }; // e.g., { "Open": "info", "Closed": "success" }
        chipRounded?: boolean;
        asAvatar?: boolean;
        iconOnly?: boolean; // For Attach field, to show only an icon
        precision?: number; // For Float fields
      };
      bodyTemplate?: (rowData, formatters) => JSX.Element | string; // Optional custom cell body renderer
      filterElementTemplate?: (filterProps, currentOptions) => JSX.Element; // Optional custom filter element
      minWidth?: string;      // e.g., '150px'
      style?: object;         // Custom style for the column
      showFilterMatchModes?: boolean; // Override default
      filterMatchModeOptions?: any[]; // Override default PrimeReact options
    }
    ```

### 6.2. `FieldManager.jsx`
* **Purpose**: Provides a centralized configuration for mapping Frappe fieldtypes to React components and defining their display logic in tables (cells and filters).
* **Location**: `dashboard/src/utils/FieldManager.jsx`
* **Key Exports**:
    * `fieldTypeConfigurations: object`: A configuration map where keys are Frappe fieldtypes (e.g., "Attach", "Link", "Currency"). Each value is an object specifying:
        * `formComponent`: The React component (usually a PrimeReact component) for rendering the field in a form.
        * `tableBodyComponent: (rowData, fieldname, displayProps, formatters) => JSX.Element | string`: A function that returns the JSX/string for rendering the field in a DataTable cell.
        * `tableFilterElement: (colConfig, fieldname, filterValue, filterApplyCallback, filterOptions) => JSX.Element`: A function that returns the JSX for the filter input for that column type.
        * `sortable: boolean`: Default sortable status.
        * `filterable: boolean`: Default filterable status.
        * `dataType: string`: PrimeReact DataTable `dataType` (e.g., "text", "numeric", "date", "boolean").
    * `getFieldConfig(fieldType: string, fieldname?: string): object`: A function that returns the appropriate configuration from `fieldTypeConfigurations`. It includes special handling (e.g., for a "Data" field named "nationality" it can return a specific "Nationality" configuration). Defaults to "Data" field config if a specific type is not found.
* **Dependencies**: Uses components from PrimeReact and functions from `formatters.jsx`.
* **Extensibility**: Designed to be easily extended with new field types or custom handling for specific fieldnames.

### 6.3. `formatters.jsx`
* **Purpose**: Contains utility functions for formatting data for display.
* **Location**: `dashboard/src/utils/formatters.jsx`
* **Key Functions**:
    * `formatDisplayDateTime(dateInput)`: Formats to "DD/MM/YYYY HH:MM:SS" (en-AE).
    * `formatServerDateTime(dateInput)`: Formats to "YYYY-MM-DD HH:MM:SS".
    * `formatDisplayDate(dateInput)`: Formats to "DD/MM/YYYY" (en-AE).
    * `formatServerDate(dateInput)`: Formats to "YYYY-MM-DD".
    * `formatDisplayTime(dateInput, includeSeconds?)`: Formats to "HH:MM(:SS)" (en-AE).
    * `formatServerTime(dateInput)`: Formats to "HH:MM:SS".
    * `formatCurrencyAED(value)`: Formats a number to AED currency string, appending an SVG for the AED symbol (`public/aed.svg`). Returns JSX.
    * `formatDuration(totalSeconds)`: Converts seconds to "Xh Ym Zs" string.
    * `parseDuration(durationString)`: (Optional) Converts "Xh Ym Zs" string to seconds.

### 6.4. Common Dialogs
* **`ConfirmDialog.jsx`**:
    * **Location**: `dashboard/src/components/common/ConfirmDialog.jsx`
    * **Purpose**: A reusable modal dialog for confirming actions, especially destructive ones. Supports an optional input field where the user must type a specific confirmation text.
* **Attachment Dialog (Conceptual)**:
    * A shared dialog should be created for handling file/image uploads.
    * This dialog would be triggered by form fields of type "Attach" or "Attach Image".
    * It should encapsulate the PrimeReact `FileUpload` component (in custom mode) and use `frappe-react-sdk`'s `file.uploadFile` method.
    * It must handle the case for new documents: ensure the main document is saved and `docname` is available before attempting to link the uploaded file.

## 7. Code Quality and Conventions
Follow standard React best practices (functional components, hooks). Keep components small and focused on a single responsibility.