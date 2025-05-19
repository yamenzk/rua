// src/hooks/useTabLayoutRouting.js
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { parseTabFromUrl, updateUrlWithTab } from "@/utils/layoutUtils"; // Adjust path

export const useTabLayoutRouting = ({
	trulyFinalTabsConfig = [], // Default to empty array
	enableRouting = false,
	initialActiveTabIndex = 0,
	externalActiveTabIndex,
	hideInternalTabViewHeader = false,
	onTabChangeCallback,
	onTabsProcessed, // Callback from ULR to signal parent when tabs are ready
}) => {
	const navigate = useNavigate();
	const location = useLocation();

	const getInitialSafeIndex = () => {
		const safeInitial =
			initialActiveTabIndex >= 0 && initialActiveTabIndex < trulyFinalTabsConfig.length
				? initialActiveTabIndex
				: 0;
		return trulyFinalTabsConfig.length > 0 ? safeInitial : 0; // Ensure 0 if no tabs
	};

	const [activeTabIndex, setActiveTabIndex] = useState(() => {
		if (hideInternalTabViewHeader && externalActiveTabIndex !== undefined) {
			return externalActiveTabIndex;
		}
		return getInitialSafeIndex();
	});

	// Effect to pass processed tabs up to the parent (if onTabsProcessed is provided to this hook)
	// Typically, onTabsProcessed is a prop of ULR, and ULR calls it directly after useTabConfiguration.
	// If this hook needs to manage that, it can be done here.
	useEffect(() => {
		if (onTabsProcessed) {
			onTabsProcessed(trulyFinalTabsConfig);
		}
	}, [trulyFinalTabsConfig, onTabsProcessed]);

	// Effect to sync activeTabIndex based on external prop or URL
	useEffect(() => {
		if (hideInternalTabViewHeader && externalActiveTabIndex !== undefined) {
			if (activeTabIndex !== externalActiveTabIndex) {
				setActiveTabIndex(externalActiveTabIndex);
			}
		} else if (enableRouting && trulyFinalTabsConfig.length > 0) {
			const slugFromUrl = parseTabFromUrl(location);
			let targetIndex = 0; // Default to first tab

			if (slugFromUrl) {
				const indexFromSlug = trulyFinalTabsConfig.findIndex(
					(t) => t.slug === slugFromUrl
				);
				if (indexFromSlug !== -1) {
					targetIndex = indexFromSlug;
				} else {
					// Invalid slug, redirect to first tab if different
					if (
						trulyFinalTabsConfig[0]?.slug &&
						slugFromUrl !== trulyFinalTabsConfig[0].slug
					) {
						updateUrlWithTab(navigate, location, trulyFinalTabsConfig[0].slug, true);
						return; // Location change will re-trigger
					}
					targetIndex = 0; // Fallback to first tab index
				}
			} else {
				// No slug in URL
				// Initialize URL with first tab's slug
				if (trulyFinalTabsConfig[0]?.slug) {
					updateUrlWithTab(navigate, location, trulyFinalTabsConfig[0].slug, true);
					return; // Location change will re-trigger
				}
				targetIndex = 0; // Fallback to first tab index
			}

			if (activeTabIndex !== targetIndex) {
				setActiveTabIndex(targetIndex);
			}
		} else if (!enableRouting && !hideInternalTabViewHeader) {
			// Routing disabled, internal headers visible: respect initialActiveTabIndex
			const validInitialIndex = getInitialSafeIndex();
			if (activeTabIndex !== validInitialIndex && trulyFinalTabsConfig.length > 0) {
				setActiveTabIndex(validInitialIndex);
			}
		}
	}, [
		activeTabIndex, // Important: include activeTabIndex to prevent stale closures if targetIndex logic depends on it
		externalActiveTabIndex,
		hideInternalTabViewHeader,
		enableRouting,
		location, // Specifically location.search
		trulyFinalTabsConfig,
		navigate,
		initialActiveTabIndex, // Add if getInitialSafeIndex uses it
	]);

	const handleTabChange = useCallback(
		(e) => {
			// e is PrimeReact's TabView event
			const newTabIndex = e.index;
			// This function is only relevant if internal TabView headers are active
			if (!hideInternalTabViewHeader) {
				setActiveTabIndex(newTabIndex);

				if (enableRouting && trulyFinalTabsConfig[newTabIndex]?.slug) {
					updateUrlWithTab(navigate, location, trulyFinalTabsConfig[newTabIndex].slug);
				}

				if (onTabChangeCallback) {
					onTabChangeCallback({ ...e, tab: trulyFinalTabsConfig[newTabIndex] });
				}
			}
		},
		[
			hideInternalTabViewHeader,
			enableRouting,
			trulyFinalTabsConfig,
			navigate,
			location,
			onTabChangeCallback,
			// setActiveTabIndex // Not needed if using functional updates, but good for clarity if complex
		]
	);

	return { activeTabIndex, handleTabChange };
};
