// src/hooks/useTabLayoutRouting.js
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { parseTabFromUrl, updateUrlWithTab } from "@/utils/layoutUtils"; // Adjust path

export const useTabLayoutRouting = ({
	trulyFinalTabsConfig = [],
	enableRouting = false,
	initialActiveTabIndex = 0,
	externalActiveTabIndex,
	hideInternalTabViewHeader = false, // Still relevant if ULR were to have optional internal headers
	onTabChangeCallback, // For internal TabView interaction, if re-enabled
	// onTabsProcessed, // ULR calls this directly
}) => {
	const navigate = useNavigate();
	const location = useLocation();

	const getInitialSafeIndex = useCallback(() => {
		const safeInitial =
			initialActiveTabIndex >= 0 && initialActiveTabIndex < trulyFinalTabsConfig.length
				? initialActiveTabIndex
				: 0;
		return trulyFinalTabsConfig.length > 0 ? safeInitial : 0;
	}, [initialActiveTabIndex, trulyFinalTabsConfig]);

	const [activeTabIndex, setActiveTabIndex] = useState(() => {
		// Prioritize external active index if headers are "hidden" (i.e., managed externally)
		if (hideInternalTabViewHeader && externalActiveTabIndex !== undefined) {
			return externalActiveTabIndex;
		}
		return getInitialSafeIndex();
	});

	// Effect to sync activeTabIndex based on external prop or URL
	useEffect(() => {
		if (hideInternalTabViewHeader && externalActiveTabIndex !== undefined) {
			// Path A: Externally controlled active index
			if (activeTabIndex !== externalActiveTabIndex) {
				setActiveTabIndex(externalActiveTabIndex);
			}
		} else if (enableRouting && trulyFinalTabsConfig.length > 0) {
			// Path B: URL-driven active index
			const slugFromUrl = parseTabFromUrl(location);
			let targetIndex = -1; // Use -1 to indicate no change needed yet

			if (slugFromUrl) {
				const foundIndex = trulyFinalTabsConfig.findIndex((t) => t.slug === slugFromUrl);
				if (foundIndex !== -1) {
					if (activeTabIndex !== foundIndex) {
						targetIndex = foundIndex;
					}
				} else {
					// Slug in URL not found, try to default to the first tab and update URL
					if (
						trulyFinalTabsConfig[0]?.slug &&
						parseTabFromUrl(location) !== trulyFinalTabsConfig[0].slug
					) {
						updateUrlWithTab(navigate, location, trulyFinalTabsConfig[0].slug, true);
						return; // Exit early, URL change will re-trigger this effect
					}
					// If already on first tab or no slug to redirect to, and current active index isn't 0
					if (activeTabIndex !== 0) {
						targetIndex = 0;
					}
				}
			} else {
				// No slug in URL, navigate to first tab's slug if available
				if (trulyFinalTabsConfig[0]?.slug) {
					updateUrlWithTab(navigate, location, trulyFinalTabsConfig[0].slug, true);
					return; // Exit early, URL change will re-trigger this effect
				}
				// If no tabs have slugs or no tabs, and current activeIndex is not 0
				if (activeTabIndex !== 0) {
					targetIndex = 0;
				}
			}

			if (targetIndex !== -1) {
				// Only set if a change was determined
				setActiveTabIndex(targetIndex);
			}
		} else if (!enableRouting && !hideInternalTabViewHeader) {
			// Path C: Not routing, internal headers visible - use initialActiveTabIndex
			const validInitialIndex = getInitialSafeIndex();
			if (activeTabIndex !== validInitialIndex) {
				setActiveTabIndex(validInitialIndex);
			}
		}
	}, [
		location, // Primary driver for URL-based changes
		trulyFinalTabsConfig,
		externalActiveTabIndex,
		hideInternalTabViewHeader,
		enableRouting,
		activeTabIndex, // To compare against target
		navigate,
		initialActiveTabIndex,
		getInitialSafeIndex, // Added because it's used in Path C
	]);

	// This handler is for if ULR uses PrimeReact's TabView internally
	const handleTabChange = useCallback(
		(e) => {
			if (hideInternalTabViewHeader) return; // Should not be called if headers are hidden

			const newTabIndex = e.index;
			setActiveTabIndex(newTabIndex);

			if (enableRouting && trulyFinalTabsConfig[newTabIndex]?.slug) {
				updateUrlWithTab(navigate, location, trulyFinalTabsConfig[newTabIndex].slug);
			}

			if (onTabChangeCallback) {
				onTabChangeCallback({ ...e, tab: trulyFinalTabsConfig[newTabIndex] });
			}
		},
		[
			hideInternalTabViewHeader,
			enableRouting,
			trulyFinalTabsConfig,
			navigate,
			location,
			onTabChangeCallback,
			// setActiveTabIndex removed from deps, as it's a state setter
		]
	);

	return { activeTabIndex, handleTabChange };
};
