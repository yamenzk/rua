import React, { useState, memo } from "react";

// PrimeReact Components
import { Button } from "primereact/button";
import { Card as PrimeReactCard } from "primereact/card"; // Aliased to avoid naming conflict if Card is used locally
import { TabView, TabPanel } from "primereact/tabview";
import { Message } from "primereact/message";

// Helper functions (assuming these are correct from your existing code)
const isColumnBreak = (element) => {
  return element.type === "Column Break" || element.type === "ColumnBreak";
};

const isSectionBreak = (element) => {
  return element.type === "Section Break" || element.type === "SectionBreak";
};

const isTabBreak = (element) => {
  return element.type === "Tab Break" || element.type === "TabBreak";
};

const getGridClasses = (columnCount) => {
  switch (columnCount) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-1 md:grid-cols-2";
    case 3:
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    case 4:
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    case 5:
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"; // Adjusted for potentially more columns
    case 6:
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6";
    default:
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"; // Default fallback
  }
};

// Extracted and Memoized SectionWrapper Component (from your code)
const SectionWrapper = memo(
  ({ children, config, isFirstSection, columnCount }) => {
    const [isCollapsed, setIsCollapsed] = useState(() => {
      if (!config || !config.collapsible) return false;
      return config.collapsible && !isFirstSection;
    });

    if (
      !config ||
      (!config.label &&
        columnCount === 0 &&
        (!config.description || !config.collapsible))
    ) {
      return <>{children}</>;
    }

    return (
      <div className="space-y-4">
        {(config.label || config.collapsible) && (
          <div className="border-b border-surface-border pb-3">
            <div className="flex items-center justify-between">
              <div>
                {config.label && (
                  <h3 className="text-lg font-semibold text-text-color">
                    {config.label}
                  </h3>
                )}
                {config?.description && (
                  <p className="text-sm text-text-color-secondary mt-1">
                    {config.description}
                  </p>
                )}
              </div>
              {config.collapsible && (
                <Button
                  icon={`pi ${
                    isCollapsed ? "pi-chevron-down" : "pi-chevron-up"
                  }`}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  text
                  rounded
                  aria-label={
                    isCollapsed ? "Expand section" : "Collapse section"
                  }
                />
              )}
            </div>
          </div>
        )}
        {(!config || !config.collapsible || !isCollapsed) && children}
      </div>
    );
  }
);
SectionWrapper.displayName = "SectionWrapper";

const UniversalLayoutRendererInternal = ({
  formSchema,
  allFieldsSchema,
  renderFieldItem, // Expected signature: (fieldSchema, docData?) => JSX.Element
  initialActiveTabIndex = 0,
  onTabChangeCallback,
  // New props for customization
  customUIAugmentations, // { additionalTabs: [], injectIntoTabs: [] }
  docData, // To pass to custom content functions
  customComponentContext, // To pass to custom content functions
  // Styling props
  tabViewBackgroundColor = "transparent",
  tabContentBackgroundColor = "transparent",
  tabPadding = "0",
  bubbleStyle = true,
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(initialActiveTabIndex);

  const handleTabChange = (e) => {
    setActiveTabIndex(e.index);
    if (onTabChangeCallback) {
      onTabChangeCallback(e);
    }
  };

  if (!formSchema || !allFieldsSchema) {
    return (
      <Message
        severity="warn"
        text="Form schema or allFieldsSchema is missing for UniversalLayoutRenderer."
        className="m-4"
      />
    );
  }

  // --- 1. TAB DEFINITION PHASE ---
  let schemaParsedTabs = [];
  const layoutElementsFromSchema = formSchema.layout?.elements || [];
  let schemaDefaultOrderCounter = 0; // To assign default order to schema tabs/elements

  if (layoutElementsFromSchema.length === 0) {
    if (allFieldsSchema && allFieldsSchema.length > 0) {
      const defaultTabLabel = formSchema?.label || "Details";
      schemaParsedTabs.push({
        id: `schema-tab-${defaultTabLabel
          .replace(/\s+/g, "-")
          .toLowerCase()}-allfields`,
        label: defaultTabLabel,
        order: schemaDefaultOrderCounter,
        isSchemaTab: true,
        // Define a single section containing all non-hidden fields for this default tab
        _schemaTabContentElements: allFieldsSchema
          .filter((f) => !f.hidden)
          .map((f) => ({
            fieldname: f.fieldname,
            type: f.fieldtype,
            label: f.label,
            idx: schemaDefaultOrderCounter++,
          })),
      });
      schemaDefaultOrderCounter += 10; // Increment for next potential default ordered item
    }
  } else {
    let currentElementsForTab = [];
    let currentLabelForTab = formSchema?.label || "Details";
    let currentTabOrder = schemaDefaultOrderCounter;
    let currentTabId = `schema-tab-${currentLabelForTab
      .replace(/\s+/g, "-")
      .toLowerCase()}-${currentTabOrder}`;
    let currentTabIcon = null;
    let currentTabDisabled = false;
    let hasProcessedAnyTabBreak = false;

    layoutElementsFromSchema.forEach((layoutEl) => {
      if (isTabBreak(layoutEl)) {
        hasProcessedAnyTabBreak = true;
        // Push the collected elements for the *previous* tab
        if (currentElementsForTab.length > 0 || schemaParsedTabs.length === 0) {
          // Push if elements or it's the very first (potentially empty) tab
          schemaParsedTabs.push({
            id: currentTabId,
            label: currentLabelForTab,
            order: layoutEl.idx !== undefined ? layoutEl.idx : currentTabOrder,
            icon: currentTabIcon,
            disabled: currentTabDisabled,
            isSchemaTab: true,
            _schemaTabContentElements: [...currentElementsForTab],
          });
        }
        // Setup for the *new* tab defined by this TabBreak
        currentTabOrder =
          layoutEl.idx !== undefined
            ? layoutEl.idx + 0.1
            : schemaDefaultOrderCounter; // Use explicit idx or next in sequence
        schemaDefaultOrderCounter =
          Math.max(schemaDefaultOrderCounter, currentTabOrder) + 10;
        currentLabelForTab =
          layoutEl.label || `Tab ${schemaParsedTabs.length + 1}`;
        currentTabId =
          layoutEl.name ||
          `schema-tab-${currentLabelForTab
            .replace(/\s+/g, "-")
            .toLowerCase()}-${schemaParsedTabs.length}`;
        currentTabIcon = layoutEl.icon || null;
        currentTabDisabled = layoutEl.disabled || false;
        currentElementsForTab = []; // Reset for the new tab
      } else {
        currentElementsForTab.push(layoutEl);
      }
    });

    // Push the last tab's elements (or the only tab if no TabBreaks)
    if (currentElementsForTab.length > 0 || !hasProcessedAnyTabBreak) {
      schemaParsedTabs.push({
        id: currentTabId,
        label: currentLabelForTab,
        order: currentTabOrder,
        icon: currentTabIcon,
        disabled: currentTabDisabled,
        isSchemaTab: true,
        _schemaTabContentElements: [...currentElementsForTab],
      });
    }
  }

  const customDefinedTabs = (customUIAugmentations?.additionalTabs || []).map(
    (ctab) => ({
      ...ctab, // id, label, order, content/cards, icon, disabled
      isSchemaTab: false,
    })
  );

  const allTabsSorted = [...schemaParsedTabs, ...customDefinedTabs].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  const trulyFinalTabsConfig = allTabsSorted.filter((tab) => {
    if (tab.isSchemaTab) {
      return (
        tab._schemaTabContentElements &&
        tab._schemaTabContentElements.length > 0
      );
    }
    return true; // Assume custom tabs are valid if defined
  });

  if (trulyFinalTabsConfig.length === 0) {
    return (
      <Message
        severity="info"
        text="No layout elements to display."
        className="m-4"
      />
    );
  }

  const tabViewPt = {
    root: {
      style: { backgroundColor: tabViewBackgroundColor },
      className: "p-tabview-custom",
    },
    nav: {
      style: {
        backgroundColor: "transparent",
        border: "none",
        padding: bubbleStyle ? "8px 2px 16px 2px" : "0",
      },
      className: bubbleStyle ? "flex gap-2 justify-start flex-wrap" : "",
    },
    navContainer: { style: { backgroundColor: "transparent" } },
    inkbar: { style: { display: bubbleStyle ? "none" : "block" } },
    panelContainer: {
      style: {
        backgroundColor: tabContentBackgroundColor,
        padding: tabPadding,
        border: "none",
      },
    },
  };

  const getTabPanelPt = (isActive) => ({
    headerAction: {
      className: bubbleStyle
        ? `px-4 py-3 rounded-full border-0 transition-all duration-200 text-sm font-medium focus:outline-none ${
            isActive
              ? "bg-primary text-primary-contrast shadow-md"
              : "bg-surface-ground text-text-color hover:border-primary-emphasis hover:bg-primary-emphasis"
          }`
        : `rounded-t-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
            isActive
              ? "bg-surface-card"
              : "bg-surface-ground hover:bg-surface-hover"
          }`,
      style: bubbleStyle ? { border: "none", borderRadius: "9999px" } : {},
    },
    content: {
      style: {
        backgroundColor: tabContentBackgroundColor,
        padding: tabPadding,
        border: "none",
      },
      className: bubbleStyle ? "border-none" : "rounded-b-lg border-none",
    },
  });

  // --- 2. TAB CONTENT PROCESSING & RENDERING ---
  return (
    <TabView
      activeIndex={activeTabIndex}
      onTabChange={handleTabChange}
      pt={tabViewPt}
      className={bubbleStyle ? "custom-bubble-tabs" : ""}
    >
      {trulyFinalTabsConfig.map((tab, tabIdx) => (
        <TabPanel
          key={
            tab.id ||
            `tab-${tabIdx}-${tab.label?.replace(/\s+/g, "-") || "default"}`
          }
          header={tab.label}
          leftIcon={tab.icon}
          disabled={tab.disabled}
          pt={getTabPanelPt(tabIdx === activeTabIndex)}
        >
          {(() => {
            let tabRenderableItems = [];
            let itemOrderCounter = 0; // Used to assign order within a tab

            // A. Populate items from schema (if it's a schema tab)
            if (tab.isSchemaTab && tab._schemaTabContentElements) {
              let currentSectionElements = [];
              let currentSectionConfig = null;
              let sectionOrder = 0; // Order of sections within this tab

              const finalizeAndAddSchemaSection = () => {
                if (
                  currentSectionElements.length > 0 ||
                  (currentSectionConfig &&
                    (currentSectionConfig.label ||
                      currentSectionConfig.description))
                ) {
                  tabRenderableItems.push({
                    id: `schema-section-${tab.id}-${
                      currentSectionConfig?.label?.replace(/\s+/g, "-") ||
                      sectionOrder
                    }`,
                    type: "SCHEMA_SECTION_BLOCK",
                    order:
                      currentSectionConfig?.idx !== undefined
                        ? currentSectionConfig.idx
                        : sectionOrder,
                    _sectionConfig: currentSectionConfig, // Renamed to avoid conflict with itemBlock.config
                    _sectionElements: [...currentSectionElements],
                  });
                  sectionOrder += 10; // Increment for next section
                }
                currentSectionElements = [];
                currentSectionConfig = null;
              };

              tab._schemaTabContentElements.forEach((layoutEl) => {
                if (isSectionBreak(layoutEl)) {
                  finalizeAndAddSchemaSection(); // Finalize previous section
                  currentSectionConfig = layoutEl; // Start new section with this config
                } else {
                  if (
                    !currentSectionConfig &&
                    !isColumnBreak(layoutEl) &&
                    !isTabBreak(layoutEl)
                  ) {
                    // Auto-create section if elements appear before any SectionBreak
                    currentSectionConfig = {
                      label: null,
                      collapsible: false,
                      idx: sectionOrder,
                    }; // Implicit section
                  }
                  currentSectionElements.push(layoutEl);
                }
              });
              finalizeAndAddSchemaSection(); // Finalize any remaining section
              itemOrderCounter = Math.max(itemOrderCounter, sectionOrder); // Update global counter
            }

            // B. Populate items from purely custom tab definition
            if (!tab.isSchemaTab) {
              let customItemBaseOrder = itemOrderCounter;
              if (tab.content) {
                tabRenderableItems.push({
                  id: `${tab.id}-custom-content`,
                  type: "CUSTOM_ITEM",
                  order:
                    tab.order !== undefined ? tab.order : customItemBaseOrder++, // Use tab's order or next available
                  _itemConfig: {
                    id: `${tab.id}-custom-content-item`,
                    content: tab.content,
                    type: "CustomComponent",
                  },
                });
              } else if (tab.cards) {
                tab.cards.forEach((card, cardIdx) => {
                  tabRenderableItems.push({
                    id: card.id || `${tab.id}-card-${cardIdx}`,
                    type: "CUSTOM_ITEM",
                    order:
                      card.order !== undefined
                        ? card.order
                        : customItemBaseOrder + cardIdx,
                    _itemConfig: { ...card, type: card.type || "Card" },
                  });
                });
                itemOrderCounter = Math.max(
                  itemOrderCounter,
                  customItemBaseOrder + tab.cards.length * 10
                );
              }
            }

            // C. Populate items from injectIntoTabs for the current tab
            (customUIAugmentations?.injectIntoTabs || []).forEach(
              (injection) => {
                if (
                  (injection.targetTab.id &&
                    injection.targetTab.id === tab.id) ||
                  (injection.targetTab.label &&
                    injection.targetTab.label === tab.label)
                ) {
                  injection.items.forEach((customItem) => {
                    tabRenderableItems.push({
                      id: customItem.id,
                      type: "CUSTOM_ITEM",
                      order:
                        customItem.order !== undefined
                          ? customItem.order
                          : itemOrderCounter, // Use explicit order or append
                      _itemConfig: customItem,
                    });
                    itemOrderCounter = Math.max(
                      itemOrderCounter,
                      (customItem.order || itemOrderCounter) + 10
                    );
                  });
                }
              }
            );

            // D. Sort all renderable items for the tab
            tabRenderableItems.sort((a, b) => (a.order || 0) - (b.order || 0));

            // E. Render the sorted items
            let isFirstSchemaSectionRenderedInTab = true;
            return (
              <div className="space-y-8">
                {tabRenderableItems.map((itemBlock) => {
                  if (itemBlock.type === "SCHEMA_SECTION_BLOCK") {
                    const sectionConfigFromLayout = itemBlock._sectionConfig;
                    const sectionElementsToParse = itemBlock._sectionElements; // These are fieldname, ColumnBreak etc.

                    // Logic to parse sectionElementsToParse into columns and fields for this section
                    let columnsForThisSection = [[]];
                    let columnLabelsForThisSection = [null];
                    let currentColumnIdx = 0;

                    sectionElementsToParse.forEach((layoutEl) => {
                      if (isColumnBreak(layoutEl)) {
                        if (layoutEl.label)
                          columnLabelsForThisSection[currentColumnIdx] =
                            layoutEl.label;
                        currentColumnIdx++;
                        columnsForThisSection.push([]);
                        columnLabelsForThisSection.push(null);
                      } else {
                        // Assume it's a field reference
                        const fieldSchema = allFieldsSchema.find(
                          (f) => f.fieldname === layoutEl.fieldname
                        );
                        if (fieldSchema && !fieldSchema.hidden) {
                          columnsForThisSection[currentColumnIdx].push(
                            fieldSchema
                          );
                        }
                      }
                    });

                    const validColumns = columnsForThisSection.filter(
                      (col) => col && col.length > 0
                    );
                    const columnCount = validColumns.length;

                    if (
                      columnCount === 0 &&
                      !(
                        sectionConfigFromLayout &&
                        (sectionConfigFromLayout.label ||
                          sectionConfigFromLayout.description)
                      )
                    ) {
                      return null; // Skip empty, unlabelled schema sections
                    }

                    const currentSectionIsFirstForRendering =
                      isFirstSchemaSectionRenderedInTab;
                    if (
                      columnCount > 0 ||
                      (sectionConfigFromLayout && sectionConfigFromLayout.label)
                    ) {
                      isFirstSchemaSectionRenderedInTab = false;
                    }

                    const sectionContent = (
                      <div
                        className={`grid gap-6 ${getGridClasses(
                          columnCount || 1
                        )}`}
                      >
                        {validColumns.map((columnFields, colIdxDisplay) => (
                          <PrimeReactCard
                            key={`${
                              itemBlock.id
                            }-col-${columnsForThisSection.indexOf(
                              columnFields
                            )}`}
                            className="bg-surface-card shadow-lg rounded-xl"
                            pt={{ body: { className: "p-4" } }}
                          >
                            {columnLabelsForThisSection[
                              columnsForThisSection.indexOf(columnFields)
                            ] && (
                              <div className="mb-4 pb-3 border-b border-surface-border">
                                <h4 className="text-md font-medium text-text-color">
                                  {
                                    columnLabelsForThisSection[
                                      columnsForThisSection.indexOf(
                                        columnFields
                                      )
                                    ]
                                  }
                                </h4>
                              </div>
                            )}
                            <div className="space-y-4">
                              {columnFields.map((fieldSchema) => (
                                <div
                                  key={`field-item-wrapper-${fieldSchema.fieldname}`}
                                >
                                  {renderFieldItem(fieldSchema, docData)}
                                </div>
                              ))}
                            </div>
                          </PrimeReactCard>
                        ))}
                        {columnCount === 0 &&
                          sectionConfigFromLayout &&
                          sectionConfigFromLayout.label && (
                            <div className="text-text-color-secondary italic text-sm p-4 col-span-full">
                              No fields in this section
                            </div>
                          )}
                      </div>
                    );

                    return (
                      <SectionWrapper
                        key={itemBlock.id}
                        config={sectionConfigFromLayout}
                        isFirstSection={currentSectionIsFirstForRendering}
                        columnCount={columnCount}
                      >
                        {sectionContent}
                      </SectionWrapper>
                    );
                  } else if (itemBlock.type === "CUSTOM_ITEM") {
                    const customItemConfig = itemBlock._itemConfig;
                    const contentElement =
                      typeof customItemConfig.content === "function"
                        ? customItemConfig.content(
                            docData,
                            customComponentContext
                          )
                        : customItemConfig.content;

                    if (customItemConfig.type === "Card") {
                      return (
                        <PrimeReactCard
                          key={itemBlock.id}
                          title={customItemConfig.title}
                          className={`custom-injected-item ${
                            customItemConfig.className || "shadow-lg rounded-xl"
                          }`} // Added default styling
                          pt={{ body: { className: "p-4" } }} // Added default padding
                        >
                          {contentElement}
                        </PrimeReactCard>
                      );
                    } else if (customItemConfig.type === "SectionHeader") {
                      return (
                        <div
                          key={itemBlock.id}
                          className={`custom-injected-item ${
                            customItemConfig.className || ""
                          } border-b border-surface-border pb-3`}
                        >
                          <h3 className="text-lg font-semibold text-text-color">
                            {customItemConfig.title}
                          </h3>
                          {customItemConfig.description && (
                            <p className="text-sm text-text-color-secondary mt-1">
                              {customItemConfig.description}
                            </p>
                          )}
                        </div>
                      );
                    }
                    // Default: CustomComponent or unspecified type
                    return (
                      <div
                        key={itemBlock.id}
                        className={`custom-injected-item ${
                          customItemConfig.className || ""
                        }`}
                      >
                        {customItemConfig.title && (
                          <h4 className="text-md font-medium text-text-color mb-2">
                            {customItemConfig.title}
                          </h4>
                        )}
                        {contentElement}
                      </div>
                    );
                  }
                  return (
                    <div key={`unknown-item-${itemBlock.id || Math.random()}`}>
                      Unknown item type: {itemBlock.type}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </TabPanel>
      ))}
    </TabView>
  );
};

UniversalLayoutRendererInternal.displayName = "UniversalLayoutRendererInternal";

// Memoize the component for performance, props should be stable if inputs are stable
const UniversalLayoutRenderer = memo(UniversalLayoutRendererInternal);
UniversalLayoutRenderer.displayName = "UniversalLayoutRenderer";

export default UniversalLayoutRenderer;
