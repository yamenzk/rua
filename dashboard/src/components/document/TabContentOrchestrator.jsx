// src/components/common/document/TabContentOrchestrator.jsx
import React, { memo, useMemo } from "react";
import SchemaSectionRenderer from "./SchemaSectionRenderer";
import CustomItemRenderer from "./CustomItemRenderer";
import {
  isSectionBreak,
  isColumnBreak,
  isTabBreak,
  createTabSlug, // Ensure this handles falsy labels consistently
} from "@/utils/layoutUtils"; // Adjust path as needed

const TabContentOrchestrator = ({
  tab, // The current tab object to render content for
  allFieldsSchema, // All field definitions for the doctype
  renderFieldItem, // Function to render an individual field
  docData, // The document data object
  customComponentContext, // Context for custom components
  customUIAugmentations, // For injectIntoTabs
}) => {
  const tabRenderableItems = useMemo(() => {
    let items = [];
    let baseOrderCounter = 0; // Used for all item types to ensure a base uniqueness for ordering

    // A. Populate items from schema (if it's a schema tab)
    if (tab.isSchemaTab && tab._schemaTabContentElements) {
      let currentSectionElements = [];
      let currentSectionConfig = null;
      let internalSchemaSectionCounter = 0; // Counter for unique section IDs within this tab

      const finalizeAndAddSchemaSection = () => {
        if (
          currentSectionElements.length > 0 ||
          (currentSectionConfig &&
            (currentSectionConfig.label ||
              currentSectionConfig.description ||
              currentSectionConfig.collapsible))
        ) {
          const sectionLabelSlug = currentSectionConfig?.label
            ? createTabSlug(currentSectionConfig.label)
            : `unlabeled-section`; // Consistent slug for unlabeled

          const sectionId = `schema-section-${
            tab.id || "default-tab-id"
          }-${sectionLabelSlug}-${internalSchemaSectionCounter}`;
          internalSchemaSectionCounter++;

          items.push({
            id: sectionId,
            type: "SCHEMA_SECTION_BLOCK",
            order:
              currentSectionConfig?.idx !== undefined
                ? currentSectionConfig.idx
                : baseOrderCounter,
            _sectionConfig: currentSectionConfig,
            _sectionElements: [...currentSectionElements],
          });
          // Update baseOrderCounter based on the order of the section just added
          baseOrderCounter =
            Math.max(
              baseOrderCounter,
              currentSectionConfig?.idx !== undefined
                ? currentSectionConfig.idx
                : baseOrderCounter
            ) + 10;
        }
        currentSectionElements = [];
        currentSectionConfig = null;
      };

      tab._schemaTabContentElements.forEach((layoutEl) => {
        if (isSectionBreak(layoutEl)) {
          finalizeAndAddSchemaSection();
          currentSectionConfig = { ...layoutEl };
          // If layoutEl.idx is not defined, it will use baseOrderCounter in finalizeAndAddSchemaSection
        } else {
          if (
            !currentSectionConfig &&
            !isColumnBreak(layoutEl) &&
            !isTabBreak(layoutEl)
          ) {
            // Default section for fields before any explicit section break
            currentSectionConfig = {
              label: null,
              collapsible: false,
              // idx will be assigned based on baseOrderCounter
            };
          }
          if (currentSectionConfig) {
            currentSectionElements.push(layoutEl);
          } else {
            // This case should ideally not happen if logic is correct,
            // but it's a safeguard for elements not fitting into a section.
            // Could push them as individual items or log a warning.
            console.warn(
              "Layout element found outside of a section definition:",
              layoutEl
            );
          }
        }
      });
      finalizeAndAddSchemaSection(); // Finalize the last section
    }

    // B. Populate items from purely custom tab definition (tab.content or tab.cards)
    if (!tab.isSchemaTab) {
      let customItemSequentialId = 0; // Counter for custom items within this non-schema tab
      if (tab.content) {
        items.push({
          id: `${tab.id}-custom-content-${customItemSequentialId++}`,
          type: "CUSTOM_ITEM",
          order: tab.order !== undefined ? tab.order : baseOrderCounter,
          _itemConfig: {
            id: `${tab.id}-custom-content-item-${customItemSequentialId - 1}`, // Ensure unique internal ID too
            content: tab.content,
            type: "CustomComponent",
          },
        });
        baseOrderCounter =
          Math.max(
            baseOrderCounter,
            tab.order !== undefined ? tab.order : baseOrderCounter
          ) + 10;
      } else if (tab.cards) {
        tab.cards.forEach((card, cardIdx) => {
          items.push({
            id:
              card.id ||
              `${tab.id}-card-${cardIdx}-${customItemSequentialId++}`,
            type: "CUSTOM_ITEM",
            order:
              card.order !== undefined
                ? card.order
                : baseOrderCounter + cardIdx * 10,
            _itemConfig: { ...card, type: card.type || "Card" },
          });
        });
        if (tab.cards.length > 0) {
          const lastCardOrder =
            tab.cards[tab.cards.length - 1].order !== undefined
              ? tab.cards[tab.cards.length - 1].order
              : baseOrderCounter + (tab.cards.length - 1) * 10;
          baseOrderCounter = Math.max(baseOrderCounter, lastCardOrder) + 10;
        }
      }
    }

    // C. Populate items from injectIntoTabs for the current tab
    let injectedItemSequentialId = 0; // Counter for injected items
    (customUIAugmentations?.injectIntoTabs || []).forEach((injection) => {
      if (
        (injection.targetTab.id && injection.targetTab.id === tab.id) ||
        (injection.targetTab.label &&
          injection.targetTab.label === tab.label) ||
        (injection.targetTab.slug && injection.targetTab.slug === tab.slug)
      ) {
        injection.items.forEach((customItem, customItemIdx) => {
          items.push({
            id:
              customItem.id ||
              `${
                tab.id
              }-injected-${customItemIdx}-${injectedItemSequentialId++}`,
            type: "CUSTOM_ITEM",
            order:
              customItem.order !== undefined
                ? customItem.order
                : baseOrderCounter,
            _itemConfig: customItem,
          });
          baseOrderCounter =
            Math.max(
              baseOrderCounter,
              customItem.order !== undefined
                ? customItem.order
                : baseOrderCounter
            ) + 10;
        });
      }
    });

    // D. Sort all renderable items for the tab based on their 'order' property
    items.sort((a, b) => (a.order || 0) - (b.order || 0));
    return items;
  }, [tab, customUIAugmentations]); // allFieldsSchema is passed to SchemaSectionRenderer, not directly used for this memoization logic

  let isFirstSchemaSectionRenderedInTab = true; // Used by SchemaSectionRenderer via SectionWrapper

  if (!tab) {
    // Should not happen if UniversalLayoutRenderer filters tabs correctly, but good for robustness
    return (
      <div className="p-4 text-sm text-text-color-secondary">
        Tab data is missing.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {tabRenderableItems.length === 0 && (
        <div className="p-4 text-sm text-text-color-secondary italic">
          No content defined for this tab.
        </div>
      )}
      {tabRenderableItems.map((itemBlock, itemBlockIdx) => {
        if (itemBlock.type === "SCHEMA_SECTION_BLOCK") {
          const currentSectionIsFirst = isFirstSchemaSectionRenderedInTab;
          // A section is considered "rendered" if it has elements or a label, thus affecting the next 'isFirst'
          if (
            (itemBlock._sectionElements &&
              itemBlock._sectionElements.length > 0) ||
            (itemBlock._sectionConfig && itemBlock._sectionConfig.label)
          ) {
            isFirstSchemaSectionRenderedInTab = false;
          }
          return (
            <SchemaSectionRenderer
              key={itemBlock.id} // Unique ID generated above
              itemBlock={itemBlock}
              allFieldsSchema={allFieldsSchema}
              renderFieldItem={renderFieldItem}
              docData={docData}
              customComponentContext={customComponentContext}
              isFirstSectionInTab={currentSectionIsFirst}
            />
          );
        } else if (itemBlock.type === "CUSTOM_ITEM") {
          return (
            <CustomItemRenderer
              key={itemBlock.id} // Unique ID generated above
              itemBlock={itemBlock}
              docData={docData}
              customComponentContext={customComponentContext}
            />
          );
        }
        // Fallback for an unknown item type, using itemBlock.id or index as key
        return (
          <div key={itemBlock.id || `unknown-item-${itemBlockIdx}`}>
            Unknown item type in tab: {itemBlock.type}
          </div>
        );
      })}
    </div>
  );
};

export default memo(TabContentOrchestrator);
