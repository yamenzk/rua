// src/hooks/useExternalTabOrchestration.js
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { parseTabFromUrl, updateUrlWithTab } from "@/utils/layoutUtils";

export const useExternalTabOrchestration = (externalTabsEnabled, onTabsConfigChange) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [processedTabs, setProcessedTabs] = useState([]);
	const [currentActiveTabIndex, setCurrentActiveTabIndex] = useState(0);

	const handleRendererTabsProcessed = useCallback((tabsFromRenderer) => {
		setProcessedTabs(tabsFromRenderer || []);
	}, []);

	// Handle URL changes and set active tab index
	useEffect(() => {
		if (externalTabsEnabled && processedTabs.length > 0) {
			const slugFromUrl = parseTabFromUrl(location);
			let newActiveIndex = 0;

			if (slugFromUrl) {
				const indexFromSlug = processedTabs.findIndex((t) => t.slug === slugFromUrl);
				if (indexFromSlug !== -1) {
					newActiveIndex = indexFromSlug;
				} else if (processedTabs[0]?.slug) {
					// Invalid slug, redirect to first tab
					updateUrlWithTab(navigate, location, processedTabs[0].slug, true);
					return;
				}
			} else if (processedTabs.length > 0 && processedTabs[0]?.slug) {
				// No slug in URL, initialize with the first tab's slug
				updateUrlWithTab(navigate, location, processedTabs[0].slug, true);
				return;
			}

			// Only update if different to prevent infinite loops
			setCurrentActiveTabIndex((prev) => (prev !== newActiveIndex ? newActiveIndex : prev));
		}
	}, [externalTabsEnabled, processedTabs, location, navigate]);

	const handleExternalTabSelect = useCallback(
		(newTabIndex, tab) => {
			if (externalTabsEnabled && processedTabs[newTabIndex]) {
				setCurrentActiveTabIndex(newTabIndex);
				updateUrlWithTab(navigate, location, processedTabs[newTabIndex].slug);
			}
		},
		[externalTabsEnabled, processedTabs, navigate, location]
	);

	// Notify parent about tab configuration changes
	useEffect(() => {
		if (externalTabsEnabled && onTabsConfigChange) {
			onTabsConfigChange({
				tabs: processedTabs,
				activeIndex: currentActiveTabIndex,
				onTabSelect: handleExternalTabSelect,
			});
		}
	}, [
		externalTabsEnabled,
		onTabsConfigChange,
		processedTabs,
		currentActiveTabIndex,
		handleExternalTabSelect,
	]);

	return {
		handleRendererTabsProcessed,
	};
};
