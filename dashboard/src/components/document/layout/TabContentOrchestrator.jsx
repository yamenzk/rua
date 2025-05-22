// src/components/document/layout/TabContentOrchestrator.jsx
import React, { memo, useMemo } from "react";
import SchemaSectionRenderer from "./SchemaSectionRenderer";
import CustomItemRenderer from "@/components/document/injector/utils/CustomItemRenderer";
import {
  isSectionBreak,
  isColumnBreak,
  isTabBreak,
  createTabSlug,
} from "@/components/document/utils/layoutUtils"; // Adjust path as needed

const TabContentOrchestratorInternal = ({
  tab,
  allFieldsSchema,
  renderFieldItem,
  docData,
  customComponentContext,
  customUIAugmentations,
}) => {
  // console.log(`[TCO] Rendering for Tab: ${tab?.label}`); // Optional: Keep if very light logging is desired

  const tabRenderableItems = useMemo(() => {
    // console.log(`[TCO] Recalculating items for Tab: ${tab?.label}`); // Optional
    let items = [];
    let baseOrderCounter = 0;

    if (!tab) {
      console.error(
        "[TCO] 'tab' prop is undefined in useMemo. Cannot calculate items."
      );
      return [];
    }

    // A. Populate items from schema
    if (tab.isSchemaTab && tab._schemaTabContentElements) {
      if (tab._schemaTabContentElements.length === 0) {
        // This warning can be useful if a schema tab is unexpectedly empty
        // console.warn(`[TCO] Schema Tab "${tab?.label}" has 0 _schemaTabContentElements.`);
      }
      let currentSectionElements = [];
      let currentSectionConfig = null;
      let internalSchemaSectionCounter = 0;

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
            : `unlabeled-section`;
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
        } else {
          if (
            !currentSectionConfig &&
            !isColumnBreak(layoutEl) &&
            !isTabBreak(layoutEl)
          ) {
            currentSectionConfig = { label: null, collapsible: false };
          }
          if (currentSectionConfig) {
            currentSectionElements.push(layoutEl);
          } else {
            console.warn(
              "[TCO] Layout element found outside section (should not happen):",
              layoutEl
            );
          }
        }
      });
      finalizeAndAddSchemaSection();
    }

    // B. Populate items from purely custom tab definition
    if (!tab.isSchemaTab) {
      let customItemSequentialId = 0;
      if (tab.content) {
        items.push({
          id: `${tab.id}-custom-content-${customItemSequentialId++}`,
          type: "CUSTOM_ITEM",
          order: tab.order !== undefined ? tab.order : baseOrderCounter,
          _itemConfig: {
            id: `${tab.id}-custom-content-item-${customItemSequentialId - 1}`,
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
      } else {
        // Optional: Log if a custom tab has no direct content method
        // console.log(`[TCO] Custom Tab "${tab?.label}" has no 'content' or 'cards'.`);
      }
    }

    // C. Populate items from injectIntoTabs
    const injections = customUIAugmentations?.injectIntoTabs || [];
    let injectedItemSequentialId = 0;
    injections.forEach((injection) => {
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

    items.sort((a, b) => (a.order || 0) - (b.order || 0));
    return items;
  }, [tab, customUIAugmentations]);

  if (!tab) {
    console.error(
      "[TCO] CRITICAL: 'tab' prop is missing during render phase! Cannot render content."
    );
    return (
      <div className="p-4 text-sm text-text-color-secondary">
        Tab data is critically missing.
      </div>
    );
  }
  // console.log(`[TCO] AFTER useMemo. Tab "${tab?.label}" will render ${tabRenderableItems.length} items.`); // Optional

  return (
    <div className="space-y-8">
      {tabRenderableItems.length === 0 && (
        <div className="p-4 text-sm text-text-color-secondary italic">
          No content has been defined or generated for this tab: "{tab?.label}"
        </div>
      )}
      {tabRenderableItems.map((itemBlock, itemBlockIdx) => {
        if (itemBlock.type === "SCHEMA_SECTION_BLOCK") {
          return (
            <SchemaSectionRenderer
              key={itemBlock.id}
              itemBlock={itemBlock}
              allFieldsSchema={allFieldsSchema}
              renderFieldItem={renderFieldItem}
              docData={docData}
              customComponentContext={customComponentContext}
              isFirstSectionInTab={
                tabRenderableItems.findIndex(
                  (it) => it.type === "SCHEMA_SECTION_BLOCK"
                ) === itemBlockIdx
              }
            />
          );
        } else if (itemBlock.type === "CUSTOM_ITEM") {
          return (
            <CustomItemRenderer
              key={itemBlock.id}
              itemBlock={itemBlock}
              docData={docData}
              customComponentContext={customComponentContext}
            />
          );
        }
        // Fallback for an unknown item type
        console.warn(
          `[TCO] Encountered unknown itemBlock type: ${itemBlock.type}`,
          itemBlock
        );
        return (
          <div
            key={itemBlock.id || `unknown-item-${itemBlockIdx}`}
            className="p-4 text-red-500"
          >
            Error: Unknown layout item type "{itemBlock.type}" for item ID "
            {itemBlock.id}".
          </div>
        );
      })}
    </div>
  );
};

const TabContentOrchestrator = memo(TabContentOrchestratorInternal);
TabContentOrchestrator.displayName = "TabContentOrchestrator";

export default TabContentOrchestrator;
