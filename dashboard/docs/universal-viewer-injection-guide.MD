# Documentation: UI Augmentation for DocViewer

This document explains how to inject custom React components as new tabs or as custom cards/sections within existing tabs in the `DocViewer` component. This feature leverages the `customUIAugmentations` prop.

## 1\. Overview

The UI Augmentation feature allows developers to extend the dynamically rendered document viewer with custom UI elements without altering the core `DocViewer` or `DocLayoutRenderer` components. This is useful for:

- Adding specialized information related to a document (e.g., analytics, related actions, audit trails).
- Integrating third-party components or visualizations.
- Providing a richer user experience tailored to specific DocTypes.

## 2\. The `customUIAugmentations` Prop

This is the primary prop you'll pass to `DocViewer` to define your custom UI elements. It's an object with two main properties:

- `additionalTabs`: An array to define completely new tabs.
- `injectIntoTabs`: An array to define custom content (cards, sections, components) to be injected into existing tabs (whether those tabs are from the schema or added via `additionalTabs`).

**Example Structure:**

```javascript
const myCustomAugmentations = {
  additionalTabs: [
    /* ...config for new tabs... */
  ],
  injectIntoTabs: [
    /* ...config for injecting content into tabs... */
  ],
};

// In your page component:
// <DocViewer
//   // ... other props
//   customUIAugmentations={myCustomAugmentations}
// />
```

_(See Section 7 for a critical note on how to define `myCustomAugmentations` to prevent performance issues.)_

## 3\. Defining Additional Tabs (`additionalTabs`)

`additionalTabs` is an array of tab configuration objects. Each object defines a new tab to be added to the `TabView`.

**Tab Configuration Object Properties:**

- **`id`** (String, Required): A unique identifier for the tab. Used for React keys and potentially for targeting by `injectIntoTabs`.
  - _Example:_ `'myCustomAnalyticsTab'`
- **`label`** (String, Required): The text displayed on the tab header.
  - _Example:_ `'Analytics'`
- **`slug`** (String, Optional but Recommended): A URL-friendly string used for deep linking to this tab if external tab routing is enabled. If not provided, it may be generated from the label.
  - _Example:_ `'analytics'`, `'audit-log'`
- **`order`** (Number, Optional): A number determining the tab's position relative to other tabs (both schema-defined and other custom tabs). Tabs are sorted by this value in ascending order (lower numbers appear first). Schema tabs are assigned a default order (e.g., based on their sequence or `idx` from the schema), so your custom tab's order will position it accordingly.
  - _Example:_ `0` (very first), `15` (between a schema tab with order 10 and another with order 20), `99` (likely last).
- **`icon`** (String, Optional): A PrimeReact icon string to display next to the tab label (e.g., `'pi pi-chart-line'`).
- **`disabled`** (Boolean, Optional): If `true`, the tab will be rendered but disabled. Defaults to `false`.
- **`content`** (Function, Required): Defines the content for the entire tab panel.
  - The function receives `(docData, customComponentContext)` as arguments (see Section 6) and **must return JSX**.
  - _Example:_ `(docData, context) => <MyCustomTabContentComponent data={docData} viewerContext={context} />`
- **`cards`** (Array, Deprecated - Prefer `injectIntoTabs`): Previously, this was suggested for structuring multiple sections within a custom tab. However, for better consistency and power, it's now recommended to define a custom tab with its main `content` function (which can be a simple wrapper component if needed) and then use `injectIntoTabs` to inject multiple "cards" or "sections" into this newly created custom tab by targeting its `id`. This centralizes the injection logic.

**Example `additionalTabs` Entry:**

```javascript
additionalTabs: [
  {
    id: "auditLogTab", // Clear, unique ID
    label: "Audit Log",
    slug: "audit-log", // URL-friendly slug
    order: 50, // Position it towards the end
    icon: "pi pi-history",
    content: (docData, context) => (
      <AuditLogViewer docName={context.docname} docData={docData} />
    ),
  },
];
```

## 4\. Injecting Content into Tabs (`injectIntoTabs`)

`injectIntoTabs` is an array of "injection rule" objects. Each rule specifies a target tab and a list of items to inject into that tab.

### 4.1. Injection Rule Object Properties:

- **`targetTab`** (Object, Required): An object specifying how to find the tab you want to inject content into. You can target by `id` or `label`.
  - **`id`** (String): The unique ID of the target tab. This can be a schema tab's `id` (if known/stable, often derived from its `name` or a fieldname if it's a field group acting as a tab) or the `id` you defined for an `additionalTabs` entry. **Using `id` is generally the most robust method.**
  - **`label`** (String): The display label of the target tab. While this can work, be cautious as schema labels might change, potentially breaking your injection rule.
  - _Example (preferred):_ `targetTab: { id: "detailsSchemaSection" }` or `targetTab: { id: "auditLogTab" }` (targeting the custom tab from the example above).
  - _Example (alternative):_ `targetTab: { label: "Details" }`
- **`items`** (Array, Required): An array of "item configuration" objects, each defining a piece of custom content to be injected into the `targetTab`.

### 4.2. Item Configuration Object Properties (for `injectIntoTabs.items`):

- **`id`** (String, Required): A unique identifier for this injected item. Used for React keys.
  - _Example:_ `'customNotesSection'`
- **`order`** (Number, Optional): A number determining the item's position within the target tab's content, relative to other schema-defined sections/blocks and other injected items in the same tab. Items are sorted by this value in ascending order.
  - _See Section 5 for a detailed explanation of `order`._
- **`type`** (String, Optional): Specifies how the `DocLayoutRenderer` (or its `TabContentOrchestrator`) should treat/wrap this item.
  - `'Card'`: The `content` will be wrapped in a standard `PrimeReactCard` component. The item's `title` prop will be used as the card's title.
  - `'SectionHeader'`: Renders a styled header. Uses the item's `title` and optionally `description`. `content` is typically not used for the main body but could be a subtitle if the renderer supports it.
  - `'CustomComponent'` (or if `type` is omitted): The `content` is rendered directly without any special wrapping by the renderer (beyond what your component itself renders).
- **`title`** (String, Optional): Used as the title if `type` is `'Card'` or `'SectionHeader'`.
- **`description`** (String, Optional): Used as the description if `type` is `'SectionHeader'` or potentially as a subtitle for a `'Card'`.
- **`className`** (String, Optional): Custom CSS class(es) to apply to the root wrapper of this injected item (or the `PrimeReactCard` if `type: 'Card'`).
- **`content`** (Function, Required): The actual React content to render.
  - The function receives `(docData, customComponentContext)` as arguments (see Section 6) and **must return JSX**.
  - This is the recommended way to pass data to your custom components.

**Example `injectIntoTabs` Entry:**

```javascript
injectIntoTabs: [
  {
    targetTab: { id: "details" }, // Assuming "details" is the ID of a schema-based tab
    items: [
      {
        id: "workflowStatusBadge",
        order: 5, // Place it early in the "details" tab
        type: "CustomComponent",
        className: "mb-4", // Add some margin
        content: (docData) => <WorkflowBadge status={docData.workflow_state} />,
      },
      {
        id: "relatedActionsCard",
        order: 25, // Place it after some schema sections
        type: "Card",
        title: "Quick Actions",
        className: "mt-5",
        content: (docData, context) => (
          <RelatedActionsComponent
            docName={context.docname}
            docData={docData}
          />
        ),
      },
    ],
  },
  {
    targetTab: { id: "auditLogTab" }, // Targeting our own custom tab
    items: [
      {
        id: "auditFilters",
        order: 1,
        type: "CustomComponent",
        content: (docData, context) => (
          <AuditFiltersComponent onChange={context.handleAuditFilterChange} />
        ),
      },
    ],
  },
];
```

## 5\. The `order` Property Explained

The `order` property is crucial for controlling the placement of your custom UI elements relative to both schema-defined elements and other custom elements.

### 5.1. Ordering of Tabs:

- Tabs in the `TabView` (both those generated from your Frappe schema and those added via `additionalTabs`) are sorted based on their `order` property.
- Schema tabs are assigned a default `order` by `DocLayoutRenderer` (usually based on their sequence in the DocType layout or an explicit `idx` field if your schema provides it). For instance, the first schema tab might get order `10`, the second `20`, and so on.
- When you define an `order` for a tab in `additionalTabs`, you're specifying its desired position in this sequence.
  - `order: 5` would try to place your custom tab before a schema tab that has an order of `10`.
  - `order: 15` would place it between a schema tab with order `10` and another with order `20`.

### 5.2. Ordering of Items _Within_ a Tab:

This applies to items defined in `injectIntoTabs.items`.

1.  **Content Blocks**: The content area of a tab is a sequence of "content blocks."
2.  **Schema Blocks**: Sections and fields defined in your Frappe DocType schema are treated as content blocks. These are assigned an internal `order` based on their sequence in the DocType's layout.
3.  **Custom Blocks**: Your custom items from `injectIntoTabs` are also content blocks, using the `order` you provide.
4.  **Sorting & Rendering**: For any given tab, `DocLayoutRenderer` (likely via `TabContentOrchestrator.jsx`) collects all schema blocks and all relevant custom item blocks. It then **sorts this entire combined list** based on their `order` values (ascending) and renders them sequentially.

**Example of Item Ordering within a Tab:**
(Assuming "Details" schema tab has "Personal Info" at order 10, "Contact Info" at order 20)

```javascript
// Augmentation:
injectIntoTabs: [
  {
    targetTab: { id: "details" },
    items: [
      { id: "customGreeting", order: 5, content: () => <p>Welcome!</p> },
      {
        id: "customNotes",
        order: 15,
        type: "Card",
        title: "Notes",
        content: () => <Notes />,
      },
    ],
  },
];

// Resulting order in "Details" tab:
// 1. Custom Greeting (order: 5)
// 2. Schema: "Personal Info" (effective order: 10)
// 3. Custom Notes Card (order: 15)
// 4. Schema: "Contact Info" (effective order: 20)
```

## 6\. Context Passed to Custom Component `content` Functions

When you define `content` as a function (for `additionalTabs` or `injectIntoTabs.items`), it will receive two arguments:

1.  **`docData`**: The complete data object for the document currently being viewed.
2.  **`customComponentContext`**: An object passed down from `DocViewer` containing useful data and utilities. As seen in `DocViewer.jsx`, this includes:
    - `docname` (String): The name/ID of the current document.
    - `doctypeName` (String): The DocType of the current document.
    - `docData` (Object): The same as the first argument.
    - `formSchema` (Object): The schema object for the current DocType.
    - `Maps` (Function): The `Maps` function from `react-router-dom` for programmatic navigation.
    - `setPageTitle` (Function): From `LayoutContext`, to set the overall page title if needed.

## 7\. Critical: Preventing Performance Issues & Recursion Errors (Memoization)

**This is the most important best practice to avoid issues like "maximum recursion depth" errors.**

The `customUIAugmentations` object you pass to `DocViewer` **must have a stable reference** across re-renders of its parent component, unless its underlying data or structure has actually changed.

**The Problem:**
If the `customUIAugmentations` object is defined directly inside the render function of its parent component (e.g., `ViewEmployeePage.jsx`), it will be recreated as a _new object reference_ on every render of that parent.

```javascript
// In ParentComponent.jsx - THIS WILL CAUSE ISSUES!
const MyPage = () => {
  // ... other logic ...

  // BAD: employeeViewAugmentations is a new object on every render of MyPage
  const employeeViewAugmentations = {
    additionalTabs: [
      /* ... */
    ],
    injectIntoTabs: [
      /* ... */
    ],
  };

  return (
    <DocViewer
      customUIAugmentations={employeeViewAugmentations} /* ...other props... */
    />
  );
};
```

**The Consequence:**
When `DocViewer` receives a new object reference for `customUIAugmentations` (even if the content is identical), React considers it a changed prop. This will cause internal hooks like `useTabConfiguration` to re-run their memoized calculations. If this, in turn, triggers state updates (e.g., via `onTabsConfigChange` in `useExternalTabOrchestration`) that cause the parent component to re-render, you can create an infinite loop, leading to "maximum recursion depth" errors.

**The Solution: `React.useMemo`**
Wrap the definition of your `customUIAugmentations` object in `React.useMemo` within the parent component.

```javascript
// In ParentComponent.jsx - THE CORRECT WAY
import React, { useMemo } from "react"; // Don't forget to import useMemo

const MyPage = ({ RUA_EMPLOYEE_DOCTYPE }) => {
  // Example dependency
  // ... other logic ...

  // GOOD: employeeViewAugmentations is memoized
  const employeeViewAugmentations = useMemo(
    () => ({
      additionalTabs: [
        {
          id: "simpleTestTab",
          label: "Simple Test",
          slug: "simple-test",
          content: (docData, customCtx) => (
            <SimpleTestTab
              docData={docData}
              customComponentContext={customCtx}
            />
          ),
        },
      ],
      injectIntoTabs: [
        {
          targetTab: { id: "simpleTestTab" }, // Targets the tab defined above
          items: [
            {
              id: "injectedItem",
              order: 10,
              type: "Card",
              title: "Injected Card",
              content: (docData, customCtx) => (
                <InjectedItemComponent
                  docData={docData}
                  customComponentContext={customCtx}
                />
              ),
            },
          ],
        },
      ],
    }),
    [RUA_EMPLOYEE_DOCTYPE]
  ); // Dependency array:
  // - List any variables from MyPage's scope that employeeViewAugmentations *actually* depends on.
  // - If the augmentations are static or only use imported components/constants,
  //   the dependency array can be empty: [].
  // - Ensure components like SimpleTestTab or InjectedItemComponent are imported,
  //   not redefined on each render of MyPage.

  return (
    <DocViewer
      customUIAugmentations={employeeViewAugmentations} /* ...other props... */
    />
  );
};
```

**Why this works:** `useMemo` will return the same object reference for `employeeViewAugmentations` across re-renders, as long as the dependencies in its dependency array (`[RUA_EMPLOYEE_DOCTYPE]` in the example) have not changed. This prevents the unnecessary chain reaction of updates.

## 8\. Further Tips and Best Practices

- **Unique IDs:** Ensure all `id` properties (for tabs, injected items) are unique.
- **Stable `targetTab` IDs:** Prefer targeting tabs for injection by a stable `id`.
- **Component Performance:** Optimize complex custom components with `React.memo`, `useMemo`, `useCallback`.
- **Modularity:** Define custom UI components in separate files.
- **Slug Creation**: Use the `createTabSlug` utility from `layoutUtils.js` for consistent slug generation for `additionalTabs` if you need them to be routable.
- **Troubleshooting `updateUrlWithTab`**: If you encounter loops specifically related to URL changes even after memoizing `customUIAugmentations`, ensure that your `updateUrlWithTab` function (in `layoutUtils.js`) avoids navigating if the target URL/slug is already correct.

By following these guidelines, especially the memoization of the `customUIAugmentations` prop, you can robustly extend `DocViewer` with custom UI elements.
