import React, { useState, memo } from "react";

// PrimeReact Components
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { TabView, TabPanel } from "primereact/tabview";
import { Message } from "primereact/message";

// Helper functions
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
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";
    case 6:
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6";
    default:
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  }
};

// Extracted and Memoized SectionWrapper Component
const SectionWrapper = memo(
  ({ children, config, isFirstSection, columnCount }) => {
    const [isCollapsed, setIsCollapsed] = useState(() => {
      if (!config || !config.collapsible) return false;
      // Default to collapsed if not the first section and is collapsible
      return config.collapsible && !isFirstSection;
    });

    // If no config label and no actual fields to render (columnCount is 0),
    // and the config itself is minimal (e.g. just a type without other displayable info),
    // then render children directly if they exist, otherwise nothing.
    if (!config || (!config.label && columnCount === 0)) {
      return <>{children}</>;
    }

    return (
      <div className="space-y-4">
        {config && config.label && (
          <div className="border-b border-surface-border pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-color">
                  {config.label}
                </h3>
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
  renderFieldItem,
  initialActiveTabIndex = 0,
  onTabChangeCallback,
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(initialActiveTabIndex);

  const handleTabChange = (e) => {
    setActiveTabIndex(e.index);
    if (onTabChangeCallback) {
      onTabChangeCallback(e);
    }
  };

  if (!formSchema || !formSchema.layout || !allFieldsSchema) {
    return (
      <Message
        severity="warn"
        text="Form layout or fields definition is missing for UniversalLayoutRenderer."
        className="m-4"
      />
    );
  }

  const { elements: layoutElements } = formSchema.layout;
  const finalTabsConfig = [];

  if (!layoutElements || layoutElements.length === 0) {
    if (allFieldsSchema && allFieldsSchema.length > 0) {
      finalTabsConfig.push({
        label: formSchema?.label || "Details",
        elements: allFieldsSchema
          .filter((f) => !f.hidden)
          .map((f) => ({ ...f, type: f.fieldtype })),
      });
    }
  } else {
    let currentElementsForTab = [];
    let currentLabelForTab = formSchema?.label || "Details";
    let hasProcessedTabBreak = false;

    for (const layoutEl of layoutElements) {
      if (isTabBreak(layoutEl)) {
        if (currentElementsForTab.length > 0 || !hasProcessedTabBreak) {
          finalTabsConfig.push({
            label: currentLabelForTab,
            elements: currentElementsForTab,
          });
        }
        currentLabelForTab =
          layoutEl.label || `Tab ${finalTabsConfig.length + 1}`;
        currentElementsForTab = [];
        hasProcessedTabBreak = true;
      } else {
        currentElementsForTab.push(layoutEl);
      }
    }
    if (currentElementsForTab.length > 0 || !hasProcessedTabBreak) {
      finalTabsConfig.push({
        label: currentLabelForTab,
        elements: currentElementsForTab,
      });
    }
  }

  const trulyFinalTabsConfig = finalTabsConfig.filter(
    (tab) => tab.elements.length > 0
  );

  if (trulyFinalTabsConfig.length === 0) {
    return (
      <Message
        severity="info"
        text="No fields or layout elements to display."
        className="m-4"
      />
    );
  }

  return (
    <TabView activeIndex={activeTabIndex} onTabChange={handleTabChange}>
      {trulyFinalTabsConfig.map((tab, tabIdx) => (
        <TabPanel
          key={`tab-${tabIdx}-${tab.label?.replace(/\s+/g, "-") || "default"}`}
          header={tab.label}
          pt={{
            headerAction: {
              className:
                "rounded-t-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-color focus:ring-offset-1",
            },
            content: {
              className: "rounded-b-lg p-3 md:p-4",
            },
          }}
        >
          {(() => {
            const sectionGroups = [];
            let currentSectionElements = [];
            let currentSectionConfig = null;

            const finalizeSectionGroup = () => {
              if (
                currentSectionElements.length > 0 ||
                (currentSectionConfig && currentSectionConfig.label)
              ) {
                const sectionsInThisGroup = [];
                let currentSectionInGroup = {
                  config: currentSectionConfig,
                  columns: [[]],
                  columnLabels: [null],
                };
                let currentColumnIdx = 0;

                currentSectionElements.forEach((layoutEl) => {
                  if (isColumnBreak(layoutEl)) {
                    if (layoutEl.label) {
                      currentSectionInGroup.columnLabels[currentColumnIdx] =
                        layoutEl.label;
                    }
                    currentColumnIdx++;
                    if (!currentSectionInGroup.columns[currentColumnIdx]) {
                      currentSectionInGroup.columns.push([]);
                      currentSectionInGroup.columnLabels.push(null);
                    }
                  } else if (isSectionBreak(layoutEl)) {
                    if (
                      currentSectionInGroup.columns.some(
                        (col) => col.length > 0
                      ) ||
                      currentSectionInGroup.config
                    ) {
                      sectionsInThisGroup.push(currentSectionInGroup);
                    }
                    currentSectionInGroup = {
                      config: layoutEl,
                      columns: [[]],
                      columnLabels: [null],
                    };
                    currentColumnIdx = 0;
                  } else {
                    const fieldSchema = allFieldsSchema.find(
                      (f) => f.fieldname === layoutEl.fieldname
                    );
                    if (fieldSchema && !fieldSchema.hidden) {
                      if (!currentSectionInGroup.columns[currentColumnIdx]) {
                        currentSectionInGroup.columns[currentColumnIdx] = [];
                      }
                      currentSectionInGroup.columns[currentColumnIdx].push(
                        fieldSchema
                      );
                    }
                  }
                });

                if (
                  currentSectionInGroup.columns.some((col) => col.length > 0) ||
                  currentSectionInGroup.config
                ) {
                  sectionsInThisGroup.push(currentSectionInGroup);
                }

                if (sectionsInThisGroup.length > 0) {
                  sectionGroups.push(sectionsInThisGroup);
                }
              }
              currentSectionElements = [];
              currentSectionConfig = null;
            };

            for (const layoutEl of tab.elements) {
              if (
                isSectionBreak(layoutEl) &&
                currentSectionElements.length > 0
              ) {
                finalizeSectionGroup();
                currentSectionConfig = layoutEl;
              } else if (isSectionBreak(layoutEl) && !currentSectionConfig) {
                currentSectionConfig = layoutEl;
              }
              currentSectionElements.push(layoutEl);
            }
            finalizeSectionGroup();

            let isFirstSectionRenderedInTab = true;

            return (
              <div className="space-y-8">
                {sectionGroups.map((sectionsInGroup, groupIdx) =>
                  sectionsInGroup.map((section, sectionIdx) => {
                    const {
                      config: sectionConfigFromLayout,
                      columns,
                      columnLabels,
                    } = section;

                    const validColumns = columns.filter(
                      (col) => col && col.length > 0
                    );
                    const columnCount = validColumns.length;

                    if (
                      columnCount === 0 &&
                      !(
                        sectionConfigFromLayout && sectionConfigFromLayout.label
                      )
                    ) {
                      return null;
                    }

                    const currentSectionIsFirst = isFirstSectionRenderedInTab;
                    if (
                      columnCount > 0 ||
                      (sectionConfigFromLayout && sectionConfigFromLayout.label)
                    ) {
                      isFirstSectionRenderedInTab = false;
                    }

                    const sectionContent = (
                      <div
                        className={`grid gap-6 ${getGridClasses(
                          columnCount || 1 // Default to 1 column if count is 0 but section should render
                        )}`}
                      >
                        {validColumns.map((columnFields, colIdx) => (
                          <Card
                            key={`section-${groupIdx}-${sectionIdx}-col-${colIdx}`}
                            className="bg-surface-card shadow-lg rounded-xl"
                            pt={{
                              body: { className: "p-4" },
                            }}
                          >
                            {columnLabels[columns.indexOf(columnFields)] && ( // Get label for original column index
                              <div className="mb-4 pb-3 border-b border-surface-border">
                                <h4 className="text-md font-medium text-text-color">
                                  {columnLabels[columns.indexOf(columnFields)]}
                                </h4>
                              </div>
                            )}
                            <div className="space-y-4">
                              {columnFields.map((fieldSchema) => (
                                <div
                                  key={`field-item-wrapper-${fieldSchema.fieldname}`}
                                >
                                  {renderFieldItem(fieldSchema)}
                                </div>
                              ))}
                            </div>
                          </Card>
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
                        key={`section-${groupIdx}-${sectionIdx}-${
                          sectionConfigFromLayout?.label || "no-label"
                        }`}
                        config={sectionConfigFromLayout}
                        isFirstSection={currentSectionIsFirst}
                        columnCount={columnCount}
                      >
                        {sectionContent}
                      </SectionWrapper>
                    );
                  })
                )}
              </div>
            );
          })()}
        </TabPanel>
      ))}
    </TabView>
  );
};

UniversalLayoutRendererInternal.displayName = "UniversalLayoutRendererInternal";

const UniversalLayoutRenderer = memo(UniversalLayoutRendererInternal);
UniversalLayoutRenderer.displayName = "UniversalLayoutRenderer";

export default UniversalLayoutRenderer;
