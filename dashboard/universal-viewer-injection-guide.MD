# Documentation: UI Augmentation for UniversalDocViewer

This document explains how to inject custom React components as new tabs or as custom cards/sections within existing tabs in the `UniversalDocViewer` component. This feature leverages the `customUIAugmentations` prop.

## 1\. Overview

The UI Augmentation feature allows developers to extend the dynamically rendered document viewer with custom UI elements without altering the core `UniversalDocViewer` or `UniversalLayoutRenderer` components. This is useful for:

  * Adding specialized information related to a document (e.g., analytics, related actions, audit trails).
  * Integrating third-party components or visualizations.
  * Providing a richer user experience tailored to specific DocTypes.

## 2\. The `customUIAugmentations` Prop

This is the primary prop you'll pass to `UniversalDocViewer` to define your custom UI elements. It's an object with two main properties:

  * `additionalTabs`: An array to define completely new tabs.
  * `injectIntoTabs`: An array to define custom content (cards, sections, components) to be injected into existing tabs (whether those tabs are from the schema or added via `additionalTabs`).

**Example Structure:**

```javascript
const myCustomAugmentations = {
  additionalTabs: [ /* ...config for new tabs... */ ],
  injectIntoTabs: [ /* ...config for injecting content into tabs... */ ]
};

// In your page component:
<UniversalDocViewer
  // ... other props
  customUIAugmentations={myCustomAugmentations}
/>
```

## 3\. Defining Additional Tabs (`additionalTabs`)

`additionalTabs` is an array of tab configuration objects. Each object defines a new tab to be added to the `TabView`.

**Tab Configuration Object Properties:**

  * **`id`** (String, Required): A unique identifier for the tab. Used for React keys and potentially for targeting by `injectIntoTabs`.
      * *Example:* `'myCustomAnalyticsTab'`
  * **`label`** (String, Required): The text displayed on the tab header.
      * *Example:* `'Analytics'`
  * **`order`** (Number, Optional): A number determining the tab's position relative to other tabs (both schema-defined and other custom tabs). Tabs are sorted by this value in ascending order (lower numbers appear first). Schema tabs are assigned a default order (e.g., based on their sequence or `idx` from the schema), so your custom tab's order will position it accordingly.
      * *Example:* `0` (very first), `15` (between a schema tab with order 10 and another with order 20), `99` (likely last).
  * **`icon`** (String, Optional): A PrimeReact icon string to display next to the tab label (e.g., `'pi pi-chart-line'`).
  * **`disabled`** (Boolean, Optional): If `true`, the tab will be rendered but disabled. Defaults to `false`.
  * **`content`** (Function or JSX, Optional): Defines the content for the entire tab panel if it's a single block of content.
      * If a function, it receives `(docData, customComponentContext)` as arguments and should return JSX.
      * *Example (function):* `(docData, context) => <MyCustomTabContentComponent data={docData} viewerContext={context} />`
      * *Example (JSX):* `<p>This is static content for the tab.</p>`
  * **`cards`** (Array, Optional): If the custom tab's content is structured as a series of cards or sections, use this array instead of `content`. Each object in the array defines a card/section within this custom tab.
      * The structure of these card objects is similar to the items in `injectIntoTabs` (see section 4.2), including `id`, `order`, `type`, `title`, `content`, `className`.
      * *Example:*
        ```javascript
        cards: [
          { id: 'cardInCustomTab1', order: 10, title: 'Summary', type: 'Card', content: (docData) => <SummaryComponent data={docData} /> },
          { id: 'cardInCustomTab2', order: 20, title: 'Details', type: 'Card', content: (docData) => <DetailComponent data={docData} /> }
        ]
        ```

**Example `additionalTabs` Entry:**

```javascript
additionalTabs: [
  {
    id: 'auditLog',
    label: 'Audit Log',
    order: 50, // Position it towards the end
    icon: 'pi pi-history',
    content: (docData, context) => <AuditLogViewer docName={context.docname} />
  }
]
```

## 4\. Injecting Content into Tabs (`injectIntoTabs`)

`injectIntoTabs` is an array of "injection rule" objects. Each rule specifies a target tab and a list of items to inject into that tab.

### 4.1. Injection Rule Object Properties:

  * **`targetTab`** (Object, Required): An object specifying how to find the tab you want to inject content into. You can target by `id` or `label`.
      * **`id`** (String): The unique ID of the target tab (either a schema tab's `name`/`id` or the `id` you defined for an `additionalTabs` entry).
      * **`label`** (String): The display label of the target tab. **This works well**, as you've found (`{ label: "Test Tab" }`), but be mindful that if the label in the schema changes, this rule might break. Using a stable `id` from the schema (if available for tabs) or for your custom tabs is generally more robust.
      * *Example:* `targetTab: { label: "Details" }` or `targetTab: { id: "schema-tab-contact-info" }` or `targetTab: { id: "auditLog" }` (targeting a custom tab).
  * **`items`** (Array, Required): An array of "item configuration" objects, each defining a piece of custom content to be injected into the `targetTab`.

### 4.2. Item Configuration Object Properties (for `injectIntoTabs.items` and `additionalTabs.cards`):

  * **`id`** (String, Required): A unique identifier for this injected item. Used for React keys.
      * *Example:* `'customNotesSection'`
  * **`order`** (Number, Optional): A number determining the item's position within the target tab's content, relative to other schema-defined sections/blocks and other injected items in the same tab. Items are sorted by this value in ascending order.
      * *See Section 5 for a detailed explanation of `order`.*
  * **`type`** (String, Optional): Specifies how the `UniversalLayoutRenderer` should treat/wrap this item.
      * `'Card'`: The `content` will be wrapped in a standard `PrimeReactCard` component. The item's `title` prop will be used as the card's title.
      * `'SectionHeader'`: Renders a styled header. Uses the item's `title` and optionally `description`. Content is typically not used or can be a subtitle.
      * `'CustomComponent'` (or if `type` is omitted): The `content` is rendered directly without any special wrapping by the renderer (beyond a basic `div`).
  * **`title`** (String, Optional): Used as the title if `type` is `'Card'` or `'SectionHeader'`.
  * **`description`** (String, Optional): Used as the description if `type` is `'SectionHeader'` or potentially as a subtitle for a `'Card'`.
  * **`className`** (String, Optional): Custom CSS class(es) to apply to the root wrapper `div` of this injected item (or the `PrimeReactCard` if `type: 'Card'`).
  * **`content`** (Function or JSX, Required): The actual React content to render.
      * If a function, it receives `(docData, customComponentContext)` as arguments and should return JSX. This is the recommended way to pass data to your custom components.
      * `docData`: The full data object of the document being viewed.
      * `customComponentContext`: An object containing useful data and utilities passed down from `UniversalDocViewer` (e.g., `{ docname, doctypeName, docData, formSchema, navigate, setPageTitle }`).

**Example `injectIntoTabs` Entry:**

```javascript
injectIntoTabs: [
  {
    targetTab: { label: "Details" }, // Assuming "Details" is a tab rendered from your schema
    items: [
      {
        id: 'workflowStatusBadge',
        order: 5, // Place it early in the "Details" tab
        type: 'CustomComponent',
        content: (docData) => <WorkflowBadge status={docData.workflow_state} />
      },
      {
        id: 'relatedActionsCard',
        order: 25, // Place it after some schema sections
        type: 'Card',
        title: 'Quick Actions',
        className: 'mt-5',
        content: (docData, context) => <RelatedActionsComponent docName={context.docname} />
      }
    ]
  }
]
```

## 5\. The `order` Property Explained

The `order` property is crucial for controlling the placement of your custom UI elements relative to both schema-defined elements and other custom elements.

### 5.1. Ordering of Tabs:

  * Tabs in the `TabView` (both those generated from your Frappe schema and those added via `additionalTabs`) are sorted based on their `order` property.
  * Schema tabs are assigned a default `order` by `UniversalLayoutRenderer` (usually based on their sequence in the DocType layout or an explicit `idx` field if your schema provides it). For instance, the first schema tab might get order `0` or `10`, the second `10` or `20`, and so on.
  * When you define an `order` for a tab in `additionalTabs`, you're specifying its desired position in this sequence.
      * `order: 0` would try to place your custom tab at the very beginning.
      * `order: 15` would place it between a schema tab with order `10` and another with order `20`.
      * A high number like `order: 999` would likely place it at the end.

### 5.2. Ordering of Items *Within* a Tab:

This applies to items defined in `injectIntoTabs.items` and items defined in an `additionalTabs[n].cards` array.

1.  **Content Blocks:** Think of the content area of a tab as a sequence of "content blocks."
2.  **Schema Blocks:** Sections defined in your Frappe DocType schema are treated as individual content blocks by the `UniversalLayoutRenderer`. These schema sections are assigned an internal `order` based on their sequence in the DocType's layout definition (or an explicit `idx` from the schema if available). For example:
      * Schema Section 1 might get an internal order of `0` or `10`.
      * Schema Section 2 (following Section 1) might get `10` or `20`.
3.  **Custom Blocks:** Your custom items (from `injectIntoTabs` or `additionalTabs.cards`) are also content blocks. You explicitly provide an `order` for these.
4.  **Sorting:** For any given tab, `UniversalLayoutRenderer` collects all schema section blocks and all your custom item blocks relevant to that tab. It then **sorts this entire combined list of blocks** based on their `order` values (ascending).
5.  **Rendering:** The sorted list of blocks is then rendered sequentially.

**Example of Item Ordering within a Tab:**

Assume a schema tab ("Details") has two sections defined in the DocType:

  * "Personal Information" (let's say it gets an internal effective order of `10` by the renderer)
  * "Contact Information" (let's say it gets an internal effective order of `20` by the renderer)

Now, you define `customUIAugmentations` for this "Details" tab:

```javascript
injectIntoTabs: [
  {
    targetTab: { label: "Details" },
    items: [
      { id: 'customGreeting', order: 5, type: 'CustomComponent', content: () => <p>Welcome!</p> },
      { id: 'customNotes', order: 15, type: 'Card', title: 'Notes', content: () => <Notes /> },
      { id: 'customActions', order: 25, type: 'Card', title: 'Actions', content: () => <Actions /> }
    ]
  }
]
```

The final rendering order within the "Details" tab would be:

1.  **Custom Greeting** (`order: 5`)
2.  Schema Section: "Personal Information" (effective order `10`)
3.  **Custom Notes Card** (`order: 15`)
4.  Schema Section: "Contact Information" (effective order `20`)
5.  **Custom Actions Card** (`order: 25`)

This system allows you to precisely interleave your custom content with the content generated from the Frappe schema.

## 6\. Context Passed to Custom Component `content` Functions

When you define `content` (or `additionalTabs[n].cards[m].content`) as a function, it will receive two arguments:

1.  **`docData`**: The complete data object for the document currently being viewed. This allows your custom component to display or interact with any field from the document.
2.  **`customComponentContext`**: An object passed down from `UniversalDocViewer` containing helpful utilities and broader application context. Typically, this includes:
      * `docname` (String): The name/ID of the current document.
      * `doctypeName` (String): The DocType of the current document.
      * `docData` (Object): The same as the first argument, for convenience.
      * `formSchema` (Object): The schema object for the current DocType.
      * `Maps` (Function): The `Maps` function from `react-router-dom` for programmatic navigation.
      * `setPageTitle` (Function): If your custom component needs to influence the overall page title (from `LayoutContext`).
      * *(Potentially other context you add to `UniversalDocViewer`'s `customComponentContext` object).*

**Example `content` function:**

```javascript
content: (docData, context) => {
  console.log("Current document name:", context.docname);
  console.log("Employee's department:", docData.department);
  // return <MyComponent department={docData.department} onNavigate={() => context.navigate('/some/path')} />;
  return <div>Viewing {docData.employee_name || context.docname}</div>;
}
```

## 7\. Tips and Best Practices

  * **Unique IDs:** Ensure all `id` properties (for tabs, injected items, cards within custom tabs) are unique across your entire augmentation configuration for a given viewer instance.
  * **Stable `targetTab` Identifiers:** When targeting tabs for injection, using a stable `id` (if your schema tabs have one, or for your own custom tabs) is generally more robust than using `label`, as labels might change.
  * **Experiment with `order`:** Getting the `order` just right might take some experimentation. Start with larger gaps in your order numbers (e.g., 10, 20, 30) to make it easier to insert items later.
  * **Component Performance:** For complex custom components, ensure they are optimized (e.g., using `React.memo`, `useMemo`, `useCallback`) to prevent unnecessary re-renders, especially if `docData` updates frequently for other reasons.
  * **Styling:** Custom components may need their own styling to align with the overall look and feel. The `className` prop on injected items provides a way to add custom CSS classes.
  * **Modularity:** Define your custom components in separate files and import them into your page component where you configure `customUIAugmentations`. This keeps your page component cleaner.
  * **Error Handling:** Implement error boundaries or internal error handling within your more complex custom components.

This UI Augmentation system provides a powerful and flexible way to enhance your schema-driven views.

-----