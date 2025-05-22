// src/components/document/hooks/useTabConfiguration.js
import { useMemo } from "react";
import { isTabBreak } from "@/components/document/utils/layoutUtils"; // Adjust path as needed

export const useTabConfiguration = (formSchema, allFieldsSchema, customUIAugmentations) => {
	return useMemo(() => {
		if (!formSchema) return []; // Or handle error/loading state appropriately

		let schemaParsedTabs = [];
		const layoutElementsFromSchema = formSchema.layout?.elements || [];
		let schemaDefaultOrderCounter = 0;

		if (layoutElementsFromSchema.length === 0) {
			if (allFieldsSchema && allFieldsSchema.length > 0) {
				const defaultTabLabel = formSchema.label || "Details";
				const tabSlug = "details"; // Always use fixed fieldname for default tab
				schemaParsedTabs.push({
					id: `schema-tab-${tabSlug}-allfields`,
					label: defaultTabLabel,
					slug: tabSlug,
					order: schemaDefaultOrderCounter,
					isSchemaTab: true,
					_schemaTabContentElements: allFieldsSchema
						.filter((f) => !f.hidden)
						.map((f, idx) => ({
							fieldname: f.fieldname,
							type: f.fieldtype,
							label: f.label,
							idx: schemaDefaultOrderCounter + idx,
						})),
				});
				schemaDefaultOrderCounter += allFieldsSchema.length * 10 + 10;
			}
		} else {
			let currentElementsForTab = [];
			let currentLabelForTab = formSchema.label || "Details";
			let currentTabOrder = schemaDefaultOrderCounter;
			let currentTabId = `schema-tab-${currentLabelForTab
				.toLowerCase()
				.replace(/\s+/g, "-")}-${currentTabOrder}`;
			let currentTabIcon = null;
			let currentTabDisabled = false;
			let hasProcessedAnyTabBreak = false;

			layoutElementsFromSchema.forEach((layoutEl, layoutElIndex) => {
				if (isTabBreak(layoutEl)) {
					hasProcessedAnyTabBreak = true;
					if (currentElementsForTab.length > 0 || schemaParsedTabs.length === 0) {
						// Use fieldname for slug, fallback to index-based name
						const tabSlug = layoutEl.fieldname || `tab-${schemaParsedTabs.length}`;
						schemaParsedTabs.push({
							id: currentTabId,
							label: currentLabelForTab,
							slug: tabSlug,
							order: currentTabOrder,
							icon: currentTabIcon,
							disabled: currentTabDisabled,
							isSchemaTab: true,
							_schemaTabContentElements: [...currentElementsForTab],
						});
					}
					currentTabOrder =
						layoutEl.idx !== undefined
							? layoutEl.idx
							: schemaDefaultOrderCounter + layoutElIndex * 0.1 + 1;
					schemaDefaultOrderCounter =
						Math.max(schemaDefaultOrderCounter, Math.floor(currentTabOrder)) + 10;
					currentLabelForTab = layoutEl.label || `Tab ${schemaParsedTabs.length + 1}`;
					// Use fieldname directly for tab ID and slug
					const fallbackFieldname =
						layoutEl.fieldname || `tab-${schemaParsedTabs.length}`;
					const tabSlug = fallbackFieldname;
					currentTabId =
						layoutEl.name || `schema-tab-${tabSlug}-${schemaParsedTabs.length}`;
					currentTabIcon = layoutEl.icon || null;
					currentTabDisabled = layoutEl.disabled || false;
					currentElementsForTab = [];
				} else {
					currentElementsForTab.push(layoutEl);
				}
			});

			if (currentElementsForTab.length > 0 || !hasProcessedAnyTabBreak) {
				const tabSlug = "details"; // Use fixed fieldname for final tab
				schemaParsedTabs.push({
					id: currentTabId,
					label: currentLabelForTab,
					slug: tabSlug,
					order: currentTabOrder,
					icon: currentTabIcon,
					disabled: currentTabDisabled,
					isSchemaTab: true,
					_schemaTabContentElements: [...currentElementsForTab],
				});
			}
		}

		const customDefinedTabs = (customUIAugmentations?.additionalTabs || []).map(
			(ctab, index) => {
				// Use fieldname directly, fallback to index-based name
				const tabSlug = ctab.fieldname || ctab.slug || `custom-${index}`;
				return {
					...ctab,
					id: ctab.id || `custom-tab-${tabSlug}-${index}`,
					slug: tabSlug,
					isSchemaTab: false,
					order:
						ctab.order !== undefined
							? ctab.order
							: schemaDefaultOrderCounter + index * 10,
				};
			}
		);

		const allTabsSorted = [...schemaParsedTabs, ...customDefinedTabs].sort(
			(a, b) => (a.order || 0) - (b.order || 0)
		);

		const trulyFinalTabsConfig = allTabsSorted.filter((tab) => {
			if (tab.isSchemaTab) {
				return tab._schemaTabContentElements && tab._schemaTabContentElements.length > 0;
			}
			return true;
		});

		return trulyFinalTabsConfig;
	}, [formSchema, allFieldsSchema, customUIAugmentations]);
};
