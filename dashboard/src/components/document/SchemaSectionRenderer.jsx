// src/components/common/document/SchemaSectionRenderer.jsx
import React, { memo } from "react";
import { Card as PrimeReactCard } from "primereact/card";
import SectionWrapper from "./SectionWrapper"; // Moved to its own file
import { isColumnBreak, getGridClasses } from "@/utils/layoutUtils"; // Adjust path

const SchemaSectionRenderer = ({
  itemBlock,
  allFieldsSchema,
  renderFieldItem,
  docData,
  customComponentContext,
  isFirstSectionInTab, // This prop helps SectionWrapper decide default collapse state
}) => {
  const sectionConfigFromLayout = itemBlock._sectionConfig;
  const sectionElementsToParse = itemBlock._sectionElements;

  let columnsForThisSection = [[]];
  let columnLabelsForThisSection = [null];
  let currentColumnIdx = 0;

  sectionElementsToParse.forEach((layoutEl) => {
    if (isColumnBreak(layoutEl)) {
      if (layoutEl.label) {
        columnLabelsForThisSection[currentColumnIdx] = layoutEl.label;
      }
      currentColumnIdx++;
      columnsForThisSection.push([]);
      columnLabelsForThisSection.push(null);
    } else {
      const fieldSchema = allFieldsSchema.find(
        (f) => f.fieldname === layoutEl.fieldname
      );
      if (fieldSchema && !fieldSchema.hidden) {
        // Ensure the column exists
        if (!columnsForThisSection[currentColumnIdx]) {
          columnsForThisSection[currentColumnIdx] = [];
        }
        columnsForThisSection[currentColumnIdx].push(fieldSchema);
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
      (
        sectionConfigFromLayout &&
        (sectionConfigFromLayout.label ||
          sectionConfigFromLayout.description ||
          sectionConfigFromLayout.collapsible)
      ) // Check collapsible if section is empty but meant to be collapsible
    )
  ) {
    return null; // Don't render completely empty sections without any config
  }

  const sectionContent = (
    <div className={`grid gap-6 ${getGridClasses(columnCount || 1)}`}>
      {validColumns.map((columnFields, displayColIdx) => {
        const originalColIdx = columnsForThisSection.indexOf(columnFields); // Find original index to get correct label
        return (
          <PrimeReactCard
            key={`${itemBlock.id}-col-${originalColIdx}`}
            className="bg-surface-card border-none shadow-none rounded-xl"
            pt={{ body: { className: "p-4" } }}
          >
            {columnLabelsForThisSection[originalColIdx] && (
              <div className="mb-4 pb-3 border-b border-surface-border">
                <h4 className="text-md font-medium text-text-color">
                  {columnLabelsForThisSection[originalColIdx]}
                </h4>
              </div>
            )}
            <div className="space-y-4">
              {columnFields.map((fieldSchema) => (
                <div key={`field-item-wrapper-${fieldSchema.fieldname}`}>
                  {renderFieldItem(
                    fieldSchema,
                    docData,
                    customComponentContext
                  )}
                </div>
              ))}
            </div>
          </PrimeReactCard>
        );
      })}
      {columnCount === 0 &&
        sectionConfigFromLayout &&
        sectionConfigFromLayout.label && (
          <div className="text-text-color-secondary italic text-sm p-4 col-span-full">
            No fields in this section.
          </div>
        )}
    </div>
  );

  return (
    <SectionWrapper
      key={itemBlock.id}
      config={sectionConfigFromLayout}
      isFirstSection={isFirstSectionInTab} // Pass this down
      columnCount={columnCount}
    >
      {sectionContent}
    </SectionWrapper>
  );
};

export default memo(SchemaSectionRenderer);
