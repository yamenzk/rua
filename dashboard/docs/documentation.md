# **Frontend Development Guidelines**

## **1\. Introduction & Philosophy**

Welcome to the frontend development guide for our Frappe-integrated React application. Our frontend is built with React, utilizing PrimeReact for UI components and a dedicated SDK (based on frappe-js-sdk and SWR) for seamless backend communication with Frappe.

**Core Principles:**

- **Schema-Driven UI:** A cornerstone of our architecture. Forms and viewers are dynamically rendered based on Frappe DocType schemas. This minimizes frontend code duplication when backend models change and ensures consistency across the application.
- **Reusability & Composability:** Components and custom React hooks are designed to be modular, reusable, and composable. This allows for flexible UI construction and promotes a clean separation of concerns (e.g., UniversalLayoutRenderer, TabContentOrchestrator, and various data-fetching or UI logic hooks).
- **Separation of Concerns:** Logic is carefully modularized. UI rendering, state management, API interactions, and business logic are handled by distinct components, hooks, and utility functions to enhance maintainability, testability, and developer understanding.
- **Modern, Clean Design & UX:** We aim for a modern, clean, and minimal user interface with a strong focus on User Experience (UX). Our chosen theme is lara-light-amber from PrimeReact, which guides our visual styling and component selection.
- **Developer Experience:** Leveraging the power of our Frappe SDK simplifies data fetching, mutations, caching, and real-time updates. PrimeReact offers a rich set of UI components that align with our design goals.

## **2\. Core Technologies & Libraries**

- **React (**react**):** The fundamental JavaScript library for building user interfaces with a component-based architecture.
- **Frappe SDK (Custom Wrapper around** frappe-js-sdk**):** Provides a suite of React hooks and utilities for interacting with the Frappe backend. It simplifies data fetching, mutations, file uploads, and real-time communication. (Detailed in Section 10).
- **SWR (**swr**):** A React hook library for data fetching, used internally by our Frappe SDK. It provides features like caching, automatic revalidation, pagination, and optimistic UI updates.
- **PrimeReact (**primereact**):** Our chosen UI component library, offering a comprehensive suite of accessible, themeable, and customizable components. We use the lara-light-amber theme as a base.
- **React Router (**react-router-dom**):** For client-side routing and navigation between different pages and views within the application, including managing URL-based tab states.
- **Socket.IO Client (**socket.io-client**):** Integrated into our Frappe SDK for enabling real-time bi-directional communication with the Frappe backend (e.g., for live document updates, notifications).
- **Date Utilities (e.g.,** date-fns**):** Used within formatting utilities (formatters.jsx) for robust parsing, formatting, and manipulation of date and time values.
- **Styling:**
- **PrimeFlex/Tailwind CSS (Implied):** Utility-first CSS classes are likely used for responsive design, spacing, and layout (e.g., grid, flex, p-4, m-4).
- **Custom CSS/SCSS:** For theme overrides, component-specific styles, and global styles, typically organized in the src/assets/ directory.

## **3\. Project Structure (TODO)**

## **4\. Overall Theme, Design, and UI Components**

Our application aims for a **modern, clean, and minimal aesthetic** with a strong emphasis on **User Experience (UX)**.

- **Theme:** We utilize the lara-light-amber theme from PrimeReact. This theme provides a light, airy feel with amber as the primary accent color.
- Customizations to the theme (e.g., overriding SCSS variables or specific component styles) should be done centrally, typically in a theme.css or by customizing the PrimeReact theme SCSS files.
- **Component Selection & Usage (PrimeReact):**
- Leverage the extensive component library provided by PrimeReact.
- Choose components and configure their props to align with the "modern, clean, minimal" design. For example, prefer text buttons or outlined buttons for secondary actions over heavily styled raised buttons.
- Utilize PrimeReact's built-in responsiveness features.
- Ensure proper use of icons (e.g., pi pi-icon-name) for clarity and visual appeal.
- **Layout & Spacing:**
- Employ consistent spacing (padding, margins) using utility classes (e.g., from PrimeFlex or Tailwind CSS if integrated) or a defined spacing scale.
- Maintain a clear visual hierarchy to guide the user's attention.
- Use grids and flexbox effectively for responsive layouts.
- **UX Focus:**
- **Clarity & Intuitiveness:** UI elements, labels, and workflows should be self-explanatory.
- **Efficiency:** Users should accomplish tasks with minimal clicks and cognitive load.
- **Feedback:** Provide clear and timely feedback for all user interactions:
- Loading states (e.g., ProgressSpinner for data fetching, button loading states).
- Success messages (e.g., Toast notifications for successful saves).
- Error messages (e.g., Toast or inline Message components for API errors or validation failures).
- Validation hints directly associated with input fields.
- **Accessibility (A11y):**
- Use semantic HTML5 elements.
- Ensure all interactive elements are keyboard navigable and focusable.
- Provide alt text for images and appropriate ARIA attributes where necessary.
- Ensure sufficient color contrast.
- Test with screen readers periodically.

## **5\. Key Architectural Concepts & Components**

The frontend dynamically renders UIs based on Frappe DocType schemas, enhanced by a modular system of components and custom hooks.

### **5.1. Schema-Driven UI Generation**

- **Fetching Doctype Schemas:** The useDocumentData hook uses useFrappeGetCall (from our SDK) to invoke a custom Frappe API endpoint (e.g., rua.apiv2.get_doctype_form_schema). This endpoint returns a comprehensive schema including fields, layout rules, permissions, and other metadata for a given DocType.
- formSchema **Object:** This fetched object is the canonical source for rendering forms and viewers, ensuring UI consistency with the backend model.

### **5.2. Core Data & UI Components**

This section details the primary components and their roles after recent refactoring.

#### **5.2.1.** UniversalDocViewer.jsx **&** UniversalDocEditor.jsx

- **Purpose:** These are high-level orchestrator components. UniversalDocViewer handles the read-only display of a document, while UniversalDocEditor manages the creation and editing of documents.
- **Key Responsibilities:**
- **Data & Schema Management:** Utilize the useDocumentData hook to fetch the necessary formSchema and docData (for existing documents).
- **Page Title:** Employ the useDocumentPageTitle hook to dynamically set the browser/page title.
- **Tab Orchestration:** Use the useExternalTabOrchestration hook to manage tab configurations when externalTabsEnabled is true. This involves:
- Receiving processed tab definitions from UniversalLayoutRenderer via its onTabsProcessed prop (which connects to handleRendererTabsProcessed from the hook).
- Communicating the complete tab setup (list of tabs, active tab index, and tab selection handler) to the parent page component (e.g., ViewEmployeePage) via the onTabsConfigChange prop.
- **Layout Rendering:** Delegate the actual rendering of the active tab's content to UniversalLayoutRenderer.
- **Editor-Specific Logic (**UniversalDocEditor **only):**
- Uses useFormHandler for managing formData state, default value application, input change handling, and validation.
- Uses useLinkFieldSearch for "Link" field autocomplete functionality.
- Uses useDocEditorSubmissionAndFiles to encapsulate all logic related to saving/creating documents and handling file attachments.
- Exposes a triggerSubmit method via React.forwardRef and useImperativeHandle for parent components (like EditEmployeePage) to initiate form submission.
- **Key Props (Common):** doctypeName (String), docname (String, optional for editor in create mode), customUIAugmentations (Object, optional), externalTabsEnabled (Boolean, defaults to false), onTabsConfigChange (Function, used when externalTabsEnabled is true).

#### **5.2.2.** UniversalLayoutRenderer.jsx **(Refactored Role)**

- **Purpose:** This component is now solely responsible for rendering the content of the _currently active tab_. It no longer manages or renders tab headers directly.
- **Key Props:**
- formSchema: The full DocType schema.
- allFieldsSchema: The array of field definitions from formSchema.fields.
- renderFieldItem: A callback function provided by UniversalDocViewer or UniversalDocEditor to render each individual field.
- docData: The current document data (for viewers) or form data (for editors) to be used as context for rendering.
- customComponentContext: An object with additional context (like navigate, docname) for custom components.
- customUIAugmentations: Used to incorporate custom tabs and inject content into tabs.
- onTabsProcessed: A callback function invoked once useTabConfiguration has processed all schema and custom tab definitions, passing the trulyFinalTabsConfig array upwards.
- enableRouting: Boolean, indicates if URL-based tab routing should be active.
- initialActiveTabIndex: Default active tab if no URL parameter or external control.
- externalActiveTabIndex: Allows a parent to directly control the active tab, overriding URL logic (less common in the current page-driven tab flow).
- **Core Functionality:**

1.  **Tab Definition:** Uses the useTabConfiguration hook, passing it formSchema, allFieldsSchema, and customUIAugmentations. This hook returns trulyFinalTabsConfig – a sorted array of all tab objects (both schema-derived and custom).
2.  **Inform Parent:** Calls the onTabsProcessed prop with trulyFinalTabsConfig.
3.  **Active Tab Determination:** Uses the useTabLayoutRouting hook, providing it trulyFinalTabsConfig, enableRouting, initialActiveTabIndex, and externalActiveTabIndex. This hook determines the activeTabIndex (integer) based on the current URL's ?tab= parameter or falls back to other inputs.
4.  **Content Rendering:**

- Selects the activeTabObject from trulyFinalTabsConfig using activeTabIndex.
- If activeTabObject exists, it renders a single , passing all necessary props.
- A unique key (e.g., based on activeTabObject.id or activeTabIndex) is crucial on TabContentOrchestrator to ensure React correctly re-mounts or updates it when the active tab changes.

1.  **No Tab Headers:** Does not render any visual tab headers itself. This is handled by DocToolbar.

#### **5.2.3.** TabContentOrchestrator.jsx

- **Purpose:** Takes a single tab object (representing the currently active tab) and is responsible for rendering all the content blocks within that tab.
- **Inputs:** tab (the active tab definition object), allFieldsSchema, renderFieldItem, docData, customComponentContext, customUIAugmentations (for processing injectIntoTabs that target the current tab).
- **Core Functionality:**

1.  **Memoizes Item Calculation:** Uses React.useMemo to calculate tabRenderableItems only when the tab prop or customUIAugmentations change.
2.  **Processes Tab Type:**

- If tab.isSchemaTab is true, it iterates through tab.\_schemaTabContentElements (fields, section breaks, column breaks defined in the schema for this tab) and groups them into schema sections.
- If tab.isSchemaTab is false (it's a custom tab from additionalTabs), it uses the tab.content function to get the primary content for that custom tab.

1.  **Processes Injections:** It then iterates through customUIAugmentations.injectIntoTabs to find any items that target the current tab (by id, label, or slug).
2.  **Consolidates & Sorts:** All derived schema sections and injected custom items are collected into a single array (tabRenderableItems). Each item in this array has an id, type ('SCHEMA_SECTION_BLOCK' or 'CUSTOM_ITEM'), order, and its specific configuration (\_sectionConfig, \_sectionElements, or \_itemConfig). This list is then sorted by the order property.
3.  **Renders Items:** Maps over the sorted tabRenderableItems and renders each block:

- If type is 'SCHEMA_SECTION_BLOCK', it uses .
- If type is 'CUSTOM_ITEM', it uses .

#### **5.2.4.** SchemaSectionRenderer.jsx

- **Purpose:** Renders a single schema-defined section, including its layout (columns) and the fields within it.
- **Inputs:** itemBlock (a SCHEMA_SECTION_BLOCK object from TabContentOrchestrator), allFieldsSchema, renderFieldItem, docData, customComponentContext, isFirstSectionInTab.
- **Core Functionality:**
- Uses to render the section's header (label, description, collapse button if collapsible).
- Parses itemBlock.\_sectionElements for column breaks (isColumnBreak) to create a grid layout (using getGridClasses).
- Columns are typically rendered as PrimeReactCard components.
- For each field within a column, it calls the renderFieldItem prop (which is the renderFieldDisplay from UniversalDocViewer or renderFormField from UniversalDocEditor), passing the field's schema, docData, and customComponentContext.

#### **5.2.5.** CustomItemRenderer.jsx

- **Purpose:** Renders a single custom item that was injected into a tab.
- **Inputs:** itemBlock (a CUSTOM_ITEM object from TabContentOrchestrator), docData, customComponentContext.
- **Core Functionality:**
- Retrieves the item's configuration from itemBlock.\_itemConfig.
- If \_itemConfig.type is 'Card', it wraps the item's content in a PrimeReactCard, using \_itemConfig.title as the card title.
- If \_itemConfig.type is 'SectionHeader', it renders a styled header using \_itemConfig.title and \_itemConfig.description.
- Otherwise (or if type is 'CustomComponent'), it renders the result of the \_itemConfig.content(docData, customComponentContext) function directly.

#### **5.2.6.** SectionWrapper.jsx

- **Purpose:** A presentational component that provides the visual structure for a section, including an optional header with a label and description, and a collapse/expand button if the section is configured as collapsible.
- **Inputs:** config (the section's configuration object, e.g., { label, description, collapsible }), isFirstSection (Boolean, to control default collapse state), columnCount (Number, to determine if it should render even if no label but has content), children (the actual content of the section, usually the grid of columns/cards).
- **Used by:** SchemaSectionRenderer.

#### **5.2.7.** DocToolbar.jsx

- **Purpose:** A persistent toolbar typically at the top of document view/edit pages. It displays context-specific actions (like "Back", "Save", "Edit") and, critically, **renders the tab headers** for navigation.
- **Key Props related to Tabs:**
- tabs (Array): An array of tab configuration objects. Each object should at least have id, label, slug, and optionally icon, disabled. This array is received from the parent page component (e.g., ViewEmployeePage).
- activeTabIndex (Number): The index of the tab that should be currently highlighted as active.
- onTabSelect (Function): A callback function (newIndex, tabObject) => void that is invoked when a tab header in the DocToolbar is clicked. This function is responsible for initiating the tab change (typically by updating the URL).
- **Functionality for Tabs:** Iterates through the tabs prop, rendering a styled PrimeReact Button (or similar clickable element) for each tab. It applies an "active" style to the button corresponding to activeTabIndex. Clicking a tab button invokes onTabSelect.

### **5.3. Core Custom Hooks**

Our architecture extensively uses custom React Hooks to encapsulate stateful logic, side effects, and reusable functionality, keeping components cleaner and more focused on presentation.

- useTabConfiguration.js:
- **Purpose:** Centralized logic for parsing the formSchema.layout.elements and customUIAugmentations to produce the definitive, sorted list of all tabs (trulyFinalTabsConfig) that will be available for rendering.
- **Inputs:** formSchema, allFieldsSchema, customUIAugmentations.
- **Output:** Memoized trulyFinalTabsConfig array. Each tab object in this array contains properties like id, label, slug, order, isSchemaTab, and \_schemaTabContentElements (for schema tabs) or content (for custom tabs).
- **Used by:** UniversalLayoutRenderer.
- useTabLayoutRouting.js:
- **Purpose:** Determines the activeTabIndex that UniversalLayoutRenderer should use to display content. It prioritizes URL parameters, then externalActiveTabIndex prop (if hideInternalTabViewHeader is true), then initialActiveTabIndex.
- **Inputs:** trulyFinalTabsConfig, enableRouting, initialActiveTabIndex, externalActiveTabIndex, hideInternalTabViewHeader (this prop is now effectively always true for this hook's main URL-parsing path since ULR doesn't render its own headers).
- **Output:** { activeTabIndex, handleTabChange }. The activeTabIndex is consumed by UniversalLayoutRenderer. handleTabChange would be for an internal PrimeReact TabView, so it's less relevant in the current custom tab setup.
- **Used by:** UniversalLayoutRenderer.
- useDocumentData.js:
- **Purpose:** Encapsulates fetching the DocType schema (via useFrappeGetCall to a custom API) and the document data itself (via useFrappeGetDoc for existing documents).
- **Inputs:** doctypeName, docname (optional), externalFormSchema (optional, if schema is pre-loaded), externalDocData (optional, if data is pre-loaded).
- **Output:** An object { formSchema, docData, isLoading, error, mutateDoc }. mutateDoc is the SWR mutate function for the document data, useful for re-fetching or updating cache after edits.
- **Used by:** UniversalDocViewer, UniversalDocEditor.
- useDocumentPageTitle.js:
- **Purpose:** Dynamically sets the main page title (e.g., browser tab title, header title) using LayoutContext. It constructs the title based on DocType label, document name/title field, and mode (View/Edit/New).
- **Inputs:** docData (for viewer), formData (for editor in create/edit mode), docname, formSchema, doctypeName, isCreateMode (boolean), viewOrEditPrefix (string, e.g., "View", "Edit").
- **Output:** None (side effect: calls setPageTitle from LayoutContext).
- **Used by:** UniversalDocViewer, UniversalDocEditor.
- useExternalTabOrchestration.js:
- **Purpose:** The central piece for managing tab state when tab headers are rendered externally (e.g., by DocToolbar). It bridges UniversalLayoutRenderer (which defines tabs) with the parent page (which controls DocToolbar).
- **Inputs:** externalTabsEnabled (boolean), onTabsConfigChange (a stable callback from the parent page, e.g., handleTabsConfigFromViewer).
- **Output:** An object containing { handleRendererTabsProcessed }.
- **Core Functionality:**

1.  handleRendererTabsProcessed: Receives trulyFinalTabsConfig from UniversalLayoutRenderer (via its onTabsProcessed prop) and stores them in processedTabs state.
2.  URL Synchronization useEffect: Watches location and processedTabs. If the URL's ?tab= parameter changes or doesn't match a valid tab, it updates its internal currentActiveTabIndex state. It also handles redirecting to the first valid tab if the URL slug is invalid or missing.
3.  handleExternalTabSelect: A useCallback provided to the parent (via onTabsConfigChange). When called (by DocToolbar), it uses updateUrlWithTab to change the URL's ?tab= parameter.
4.  Parent Notification useEffect: Watches its internal processedTabs and currentActiveTabIndex. When these change, it calls the onTabsConfigChange prop, passing an object { tabs: processedTabs, activeIndex: currentActiveTabIndex, onTabSelect: handleExternalTabSelect } to the parent page component. This allows the parent to update DocToolbar.
5.  Uses React.useRef for onTabSelectRef (to hold handleExternalTabSelectLogic) and a lastNotifiedState ref to prevent infinite loops by being more discerning about when onTabsConfigChange is called.

- **Used by:** UniversalDocViewer, UniversalDocEditor.
- useFormHandler.js **(Editor Specific)**:
- **Purpose:** Manages all core form state for UniversalDocEditor.
- **Inputs:** formSchema, initialDocData (from useDocumentData in edit mode), isCreateMode.
- **Output:** An object { formData, setFormData, formErrors, handleInputChange, validateForm }.
- formData: The current state of all form fields.
- setFormData: Allows direct updates to formData (e.g., after file upload).
- formErrors: An object kesalahan validasi.
- handleInputChange(fieldname, value): Standard callback for field value changes.
- validateForm(): Function to perform client-side validation based on schema.
- **Internal Logic:** Includes useEffect to apply schema defaults (applySchemaDefaults) when the form initializes or switches modes.
- **Used by:** UniversalDocEditor.
- useLinkFieldSearch.js **(Editor Specific)**:
- **Purpose:** Handles the asynchronous search and suggestion logic for "Link" type fields (autocomplete).
- **Inputs:** toastRef (for displaying search errors).
- **Output:** An object { linkSuggestions, handleLinkSearch }.
- linkSuggestions: State object holding suggestions per linked DocType.
- handleLinkSearch(event, linkedDoctype, fieldDescriptionString): Callback to trigger the search.
- **Internal Logic:** Uses useFrappePostCall for frappe.desk.search.search_link and frappe.client.get_list (for Users). Parses link_filters from field descriptions.
- **Used by:** UniversalDocEditor (passed into adapterContext for renderFormField).
- useDocEditorSubmissionAndFiles.js **(Editor Specific)**:
- **Purpose:** Encapsulates the entire complex logic of document submission (create or update) and associated file attachments.
- **Inputs:** doctypeName, docnameFromProp (original docname for edits), formData, formSchema, isCreateMode, validateForm (from useFormHandler), onSaveSuccess (callback), onSaveError (callback), toastRef, mutateDoc (from useDocumentData), setFormData (from useFormHandler to update with file URLs).
- **Output:** An object { handleSubmit, isSaving, isFileDialogVisible, setIsFileDialogVisible, fileUploadTarget, openUploadModal, handleFileSelectedInDialog }.
- handleSubmit(): The main function to trigger the save/create process.
- isSaving: Boolean loading state for the entire submission.
- The rest are states and handlers for the FileUploadDialog.
- **Internal Logic:**
- Uses SDK's useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeFileUpload.
- Manages pendingFiles state for new documents.
- Handles API calls, error/success toasts, and calls onSaveSuccess/onSaveError.
- Updates formData with uploaded file URLs.
- **Used by:** UniversalDocEditor.

### **5.4. Utility Modules**

- FieldManager.jsx **(via** getFieldConfig**):**
- Maps Frappe fieldtypes (e.g., "Data", "Link", "Select") to specific React components for rendering input controls (in editor) or display elements (in viewer).
- Returns a config object, typically including { formComponent: YourReactFieldComponent, tableBodyComponent: YourDisplayComponent }.
- FormFieldAdapter.js **(via** getAdaptedProps**):**
- (Primarily for UniversalDocEditor) Takes a fieldSchema and an adapterContext (containing formData, handleInputChange, linkSuggestions, etc.).
- Returns a props object tailored for the specific React input component being rendered (e.g., props for PrimeReact's InputText, Dropdown, AutoComplete).
- layoutUtils.js**:**
- Contains helper functions for layout processing and tab management:
- isColumnBreak(element), isSectionBreak(element), isTabBreak(element): Identify special layout elements.
- getGridClasses(columnCount): Returns Tailwind CSS grid classes.
- createTabSlug(label): Generates a URL-friendly slug from a tab label.
- parseTabFromUrl(location): Extracts the ?tab= value from the URL.
- updateUrlWithTab(navigate, location, slug, replace?): Updates the URL with the given tab slug.
- schemaUtils.js**:**
- parseDescription(descriptionString): Parses JSON often embedded in Frappe field descriptions to extract metadata like tooltip or link_filters.
- _(Potentially other schema-related utilities, e.g., schemaToColumns for DynamicDataTable)_.
- formatters.jsx**:**
- Provides functions to format data for display (e.g., dates, numbers, currency) or for sending to the Frappe backend (e.g., formatServerDate).

## **6\. Tab Management and Routing Flow (Custom Implementation)**

With the shift away from PrimeReact's TabView within UniversalLayoutRenderer, tab navigation is orchestrated as follows:

1.  **Tab Definition (**UniversalLayoutRenderer **+** useTabConfiguration**):**

- UniversalLayoutRenderer calls useTabConfiguration.
- useTabConfiguration processes formSchema.layout.elements and customUIAugmentations to generate trulyFinalTabsConfig (a sorted array of all tab objects with properties like id, label, slug, order, isSchemaTab, \_schemaTabContentElements or content).
- UniversalLayoutRenderer then calls its onTabsProcessed prop, passing trulyFinalTabsConfig upwards.

1.  **Tab State Communication (Page Component via** UniversalDocViewer/Editor**):**

- The page component (e.g., ViewEmployeePage) provides an onTabsConfigChange callback to UniversalDocViewer/Editor.
- Inside UniversalDocViewer/Editor, the useExternalTabOrchestration hook is active because externalTabsEnabled={true} is passed.
- useExternalTabOrchestration's handleRendererTabsProcessed (aliased as onTabsProcessed when passed to ULR) receives trulyFinalTabsConfig and stores it in its processedTabs state.

1.  **URL to Active Tab Index (**useExternalTabOrchestration**):**

- A useEffect in useExternalTabOrchestration listens to location (from react-router-dom) and processedTabs.
- When the URL's ?tab=some-slug parameter changes, or when processedTabs are first set:
- It parses the slugFromUrl.
- It finds the corresponding indexFromSlug in processedTabs.
- It calls setCurrentActiveTabIndex to update its internal state.
- It handles cases where the slug is invalid or missing by redirecting to the first valid tab's slug (by calling updateUrlWithTab, which changes location, re-triggering this effect).

1.  **Notifying Parent Page (**useExternalTabOrchestration **-> Page):**

- Another useEffect in useExternalTabOrchestration listens to its internal processedTabs and currentActiveTabIndex.
- When these change, it calls the onTabsConfigChange prop (which is the callback from the page component like handleTabsConfigFromViewer).
- The object passed is { tabs: processedTabs, activeIndex: currentActiveTabIndex, onTabSelect: handleExternalTabSelect }.
- handleExternalTabSelect is a memoized callback from useExternalTabOrchestration that, when called, will use updateUrlWithTab to change the URL.

1.  **Updating** DocToolbar **(Page Component):**

- The page component's handleTabsConfigFromViewer (or editor equivalent) receives the configuration.
- It calls setDocToolbarTabProps (its own state setter), updating the props to be passed to .
- The page re-renders, and DocToolbar receives the new tabs, activeIndex, and onTabSelect function.

1.  **User Interaction (**DocToolbar**):**

- DocToolbar renders the tab headers (buttons).
- It highlights the tab at activeIndex.
- When a user clicks a tab button in DocToolbar, the onTabSelect(clickedIndex, clickedTabObject) prop is invoked. This executes handleExternalTabSelect from useExternalTabOrchestration.
- handleExternalTabSelect calls updateUrlWithTab with the clicked tab's slug.
- This URL change brings us back to step 3, and the UI (toolbar highlight and content in ULR) updates reactively.

1.  **Content Display (**UniversalLayoutRenderer**):**

- UniversalLayoutRenderer _also_ has its own useTabLayoutRouting hook that independently watches the URL (via useLocation).
- When the URL changes (due to DocToolbar interaction), useTabLayoutRouting updates ULR's internal activeTabIndex.
- ULR re-renders and uses this activeTabIndex to select the correct activeTabObject from its trulyFinalTabsConfig.
- It then renders , ensuring the content matches the active tab defined by the URL. A unique key on TabContentOrchestrator ensures it re-mounts/updates correctly.

This decoupled system uses the URL as the primary source of truth for the active tab, with DocToolbar initiating changes and UniversalLayoutRenderer reactively displaying the corresponding content.

## **7\. UI Augmentation (**customUIAugmentations**)**

The customUIAugmentations prop, passed to UniversalDocViewer or UniversalDocEditor, allows for extending the schema-driven UI with custom tabs or by injecting custom content into existing tabs.

**Structure:**

const myAugmentations = {  additionalTabs: \[ /\* ... array of new tab definition objects ... \*/ \],  injectIntoTabs: \[ /\* ... array of injection rule objects ... \*/ \]};

CRITICAL: Memoization

The customUIAugmentations object MUST be memoized using React.useMemo in the parent component (e.g., ViewEmployeePage) to prevent infinite re-render loops.

// In ViewEmployeePage.jsx or EditEmployeePage.jsxconst augmentations = useMemo(() => ({  additionalTabs: \[    {      id: "myNewTab", label: "Custom Info", slug: "custom-info", order: 30,      content: (docData, ctx) =>     }  \],  injectIntoTabs: \[    {      targetTab: { slug: "details" }, // Target by slug (preferred) or id/label      items: \[        {          id: "injectedNotes", order: 15, type: "Card", title: "Additional Notes",          content: (docData, ctx) =>         }      \]    }  \]}), \[/\* dependencies used to build this object, if any \*/\]);// Then pass:

The dependency array of useMemo should include any variables from the parent component's scope that are actually used in constructing the augmentations object. If the structure is static, an empty array \[\] is sufficient.

### **7.1.** additionalTabs

Array of tab configuration objects:

- id (String, Required): Unique ID (e.g., 'my-custom-analytics-tab').
- label (String, Required): Display text (e.g., 'Analytics').
- slug (String, Required for routing): URL-friendly slug (e.g., 'analytics'). Use createTabSlug from layoutUtils.js for consistency.
- order (Number, Optional): Controls position relative to other tabs.
- icon (String, Optional): PrimeReact icon (e.g., 'pi pi-chart-line').
- disabled (Boolean, Optional): If true, tab is disabled.
- content (Function, Required): (docData, customComponentContext) => JSX. Defines the entire content for this custom tab. TabContentOrchestrator will treat this as a single CUSTOM_ITEM of type CustomComponent. If you need multiple sections/cards within this custom tab, it's now recommended to define a simple wrapper component as the content here, and then use injectIntoTabs to inject multiple items into this newly created custom tab by targeting its id.

### **7.2.** injectIntoTabs

Array of injection rule objects:

- targetTab (Object, Required): Specifies the tab to inject into.
- id (String): Preferred. ID of a schema tab or an additionalTabs entry.
- slug (String): Also robust. Slug of a schema tab or an additionalTabs entry.
- label (String): Less robust, as labels might change.
- items (Array, Required): Array of item configuration objects to inject.
- id (String, Required): Unique ID for the injected item (e.g., 'extra-details-card').
- order (Number, Optional): Position within the target tab's content blocks.
- type (String, Optional): 'Card', 'SectionHeader', or default/'CustomComponent'. Determines how TabContentOrchestrator (via CustomItemRenderer) wraps/renders it.
- title (String, Optional): For 'Card' or 'SectionHeader'.
- description (String, Optional): For 'SectionHeader'.
- className (String, Optional): Custom CSS classes.
- content (Function, Required): (docData, customComponentContext) => JSX. The actual content.

### **7.3.** order **Property (for Tabs and Injected Items)**

- **Tab Ordering:** additionalTabs and schema-derived tabs are sorted globally based on their order property. Schema tabs get default orders from useTabConfiguration (e.g., 0, 10, 20...).
- **Item Ordering Within a Tab:** TabContentOrchestrator collects all schema sections (which also have an effective order from useTabConfiguration) and all injected items for the active tab. This combined list is then sorted by order before rendering.

### **7.4.** customComponentContext

Passed to content functions:

- docname (String)
- doctypeName (String)
- docData (Object, same as the first argument to the content function)
- formSchema (Object)
- navigate (Function from react-router-dom, passed down from UniversalDocViewer/Editor)
- setPageTitle (Function from LayoutContext)
- For UniversalDocEditor, it also includes handleInputChange to allow custom components to modify form data.

## **8\. Creating a Document Viewer Page (e.g., for "Task" DocType)**

(This section remains largely the same as the excellent example you provided in the previous documentation update. Ensure it reflects:

- Correct TASK_DOCTYPE constant definition.
- State for docToolbarTabProps.
- useCallback for handleTabsConfig (passed as onTabsConfigChange) with an empty \[\] dependency array and functional setState.
- Correct props passed to (tabs, activeTabIndex, onTabSelect from docToolbarTabProps).
- Correct props passed to (externalTabsEnabled={true}, onTabsConfigChange, customUIAugmentations (memoized)).
- Example customUIAugmentations for the Task viewer, if any.)

## **9\. Creating a Document Editor Page (e.g., for "Task" DocType)**

(This section also remains largely the same as the excellent example you provided. Ensure it reflects:

- Correct TASK_DOCTYPE constant definition.
- State for docToolbarTabProps, isSaving.
- useRef for editorRef.
- useCallback for handleTabsConfig with empty \[\] dependency array and functional setState.
- Event handlers (handleSaveSuccess, handleSaveError, handleCancel, triggerEditorSave).
- Correct props passed to .
- Correct props passed to (ref, externalTabsEnabled={true}, onTabsConfigChange, memoized customUIAugmentations).)

## **10\. Frappe React SDK (SDK Details)**

(This entire section should be the detailed breakdown of your SDK that you provided, starting from 10.1. Provider & Configuration through 10.8. General SDK Usage Notes. It's already very well-documented.)

## **11\. Utility Components and Functions**

### **11.1.** FieldManager.jsx **(via** getFieldConfig**)**

- **Purpose:** A central registry mapping Frappe fieldtype strings (e.g., "Data", "Link", "Select", "Date", "Attach", "Table", "Check") to specific React components responsible for rendering them.
- **Input:** fieldtype (string), fieldname (string, for context if needed).
- **Output:** A configuration object. Crucially, this object contains:
- formComponent: A reference to the React component used for rendering the field in an editable form (e.g., PrimeReact InputText, Dropdown, Checkbox, Calendar, or custom components for "Link", "Attach", "Table").
- tableBodyComponent: A reference to the React component or function used for rendering the field's value in a read-only display context (e.g., in UniversalDocViewer or a data table cell).
- **Example Entry (Conceptual):**// Inside FieldManager.jsxcase 'Link':  return {    formComponent: MyCustomLinkFieldEditor, // e.g., PrimeReact AutoComplete adapted    tableBodyComponent: (doc, fieldname) => ,    // other config like default props for the component  };

### **11.2.** FormFieldAdapter.js **(via** getAdaptedProps**)**

- **Purpose:** (Primarily for UniversalDocEditor) Translates Frappe field schema properties and the current editor's context (form data, handlers) into a props object suitable for the actual UI input component chosen by FieldManager.
- **Inputs:**
- fieldSchema: The schema object for the individual field.
- adapterContext: An object provided by UniversalDocEditor containing:
- formData: The current state of the editor's form.
- handleInputChange: Callback from useFormHandler to update formData.
- linkSuggestions: Suggestions for "Link" fields from useLinkFieldSearch.
- handleLinkSearch: Callback from useLinkFieldSearch.
- isCreateMode: Boolean.
- toast: Ref to the PrimeReact Toast component.
- openUploadModal: Callback from useDocEditorSubmissionAndFiles to show file dialog.
- **Output:** A componentSpecificProps object to be spread onto the UI input component. This includes adapting onChange to call handleInputChange, providing value or checked from formData, setting disabled based on read_only or set_only_once, placeholder text, options for Select/Autocomplete, and any other props needed by the specific field component.

### **11.3.** schemaUtils.js

- parseDescription(descriptionString): Parses JSON embedded in a field's description (e.g., for tooltip, link_filters).
- schemaToColumns(fieldsSchemaArray) (If used for DynamicDataTable): Converts an array of Frappe field definitions into a column configuration suitable for PrimeReact's DataTable.

### **11.4.** DynamicDataTable.jsx **(If applicable)**

(Retain original description if this component is used for list views or child tables, updating details as necessary.)

### **11.5. File Handling Workflow (Updated Context)**

The useDocEditorSubmissionAndFiles hook now centralizes most of the file handling logic:

1.  User interaction in UniversalDocEditor (e.g., clicking an attach button, which is rendered via renderFormField) calls openUploadModal from the hook.
2.  FileUploadDialog.jsx is displayed (its visibility controlled by state within the hook, exposed to UniversalDocEditor).
3.  FileUploadDialog's onFileSelect calls handleFileSelectedInDialog (from the hook).
4.  handleFileSelectedInDialog:

- If editing an existing document: Directly calls sdkUploadFile (from useFrappeFileUpload within the hook). On success, updates formData (via setFormData passed to the hook) with the file URL.
- If creating a new document: Stages the file in pendingFiles state (within the hook) and updates formData with a "Pending:" placeholder.

1.  handleSubmit (from the hook):

- After createDoc succeeds (for new documents), it iterates pendingFiles, calls sdkUploadFile for each, and then calls updateDoc to save the final file URLs to the newly created document.

### **11.6.** formatters.jsx

(Retain original description: date, time, datetime formatting for server.)

### **11.7.** layoutUtils.js **(Expanded Role)**

- **Purpose:** Utilities for layout processing, tab definition, and URL manipulation for tabs.
- **Key Functions:**
- isColumnBreak(element), isSectionBreak(element), isTabBreak(element)
- getGridClasses(columnCount)
- createTabSlug(label): Generates URL-friendly slugs. Ensure it handles empty/null labels consistently (e.g., returns "unlabeled-slug" or "").
- parseTabFromUrl(location): Gets ?tab= value.
- updateUrlWithTab(navigate, location, slug, replace?): Sets ?tab= value in URL.

## **12\. State Management**

- **Component-Level State (**useState**,** useReducer**):** Still used for UI-specific state within components.
- **Custom Hooks:** Now the primary location for complex related state and logic (e.g., formData and formErrors in useFormHandler).
- **React Context (**useContext**):** LayoutContext for page title/breadcrumbs, FrappeContext from the SDK.
- **Frappe React SDK & SWR:** Manages server state, caching, revalidation.

## **13\. Working with Frappe Doctype Schemas**

(Retain original Section 6 from your doc; it's still accurate regarding understanding schema field properties.)

## **14\. Adding New Features / Modifying Existing Ones**

### **14.1. Adding a New Field Type to Forms (Schema-Driven)**

The process remains largely the same as your original documentation, but note where the logic now resides:

1.  **Frappe Backend:** Define the field.
2.  FieldManager.jsx **(**getFieldConfig**):** Map fieldtype to React components (one for formComponent used by editor, one for tableBodyComponent used by viewer/tables).
3.  **React Component (if new):** Create the component.
4.  FormFieldAdapter.js **(**getAdaptedProps**):** (For editor forms) If needed, adapt schema to props for the new formComponent.
5.  **Schema Delivery API:** Ensure your schema API includes the new field.
6.  **Testing:** UniversalDocEditor (via renderFormField) and UniversalDocViewer (via renderFieldDisplay) should now render it.

### **14.2. Creating New Viewer/Editor Pages**

Follow the patterns in Sections 8 and 9 of this document.

### **14.3. Adding Custom Tabs or Injecting Content**

Refer to Section 7 (UI Augmentation) of this document. Remember to memoize the customUIAugmentations object.

## **15\. Best Practices & Conventions**

(Retain your original Section 10, it's excellent. Emphasize/add:)

- **Custom Hook Design:** Keep hooks focused on a single responsibility or a closely related set of functionalities.
- **Memoization:** Crucially use React.useMemo for complex objects passed as props (like customUIAugmentations) and React.useCallback for functions passed as props, especially if they are dependencies of useEffect in child components. Pay close attention to dependency arrays.
- key **Props:** Always provide stable and unique key props when rendering lists of components, especially when items can be reordered, added, or removed, or when conditionally rendering different components for the same logical slot (like our TabContentOrchestrator).
- **Ref Usage:** Use useRef to access imperative handles (like editorRef.current.triggerSubmit()) or to store values that can change without triggering re-renders but are needed by effects/callbacks (like onTabSelectRef in some of our useExternalTabOrchestration explorations).
