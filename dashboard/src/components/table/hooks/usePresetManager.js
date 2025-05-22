// dashboard/src/components/common/table-components/usePresetManager.js - Fixed Version
import { useState, useCallback, useEffect, useRef } from "react";
import { setCookie, getCookie, eraseCookie } from "@/utils/cookies";
import { VIEW_MODES } from "../constants";

export const usePresetManager = (
	uniqueTableKey,
	filters,
	globalFilterValue,
	viewMode,
	visibleColumns,
	columnsConfig,
	fetchArgs,
	initialRows,
	initFilters,
	setFilters,
	setGlobalFilterValue,
	setViewMode,
	setVisibleColumns,
	setFirst,
	setRows,
	setSortField,
	setSortOrder
) => {
	const presetsCookieKey = uniqueTableKey ? `datatable_${uniqueTableKey}_presets` : null;
	const activePresetCookieKey = uniqueTableKey
		? `datatable_${uniqueTableKey}_active_preset`
		: null;
	const tableStateCookieKey = uniqueTableKey ? `datatable_${uniqueTableKey}_state` : null;
	const viewModeCookieKey = uniqueTableKey ? `datatable_${uniqueTableKey}_viewmode` : null;

	const [filterPresets, setFilterPresets] = useState([]);
	const [activePresetId, setActivePresetId] = useState(null);
	const [showPresetDialog, setShowPresetDialog] = useState(false);

	// Track if we've completed initial loading to prevent race conditions
	const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
	const hasLoadedInitialPresets = useRef(false);

	const loadPresetsFromCookie = useCallback(() => {
		if (!presetsCookieKey) {
			return [];
		}

		try {
			const savedPresetsString = getCookie(presetsCookieKey);

			if (!savedPresetsString) {
				return [];
			}

			const presets = JSON.parse(savedPresetsString);

			// Validate presets structure
			if (Array.isArray(presets)) {
				const validPresets = presets.filter((preset) => {
					return (
						preset &&
						typeof preset.id === "number" &&
						typeof preset.name === "string" &&
						preset.name.trim().length > 0
					);
				});
				return validPresets;
			} else {
				return [];
			}
		} catch (e) {
			console.error("Error parsing presets cookie:", e);
			// Clear corrupted cookie
			if (presetsCookieKey) {
				eraseCookie(presetsCookieKey);
			}
			return [];
		}
	}, [presetsCookieKey]);

	const loadActivePresetFromCookie = useCallback(() => {
		if (!activePresetCookieKey) {
			return null;
		}

		try {
			const savedPresetId = getCookie(activePresetCookieKey);

			if (!savedPresetId) {
				return null;
			}

			const id = parseInt(savedPresetId);
			return isNaN(id) ? null : id;
		} catch (e) {
			console.error("Error parsing active preset cookie:", e);
			return null;
		}
	}, [activePresetCookieKey]);

	// Load presets and active preset on mount - ONLY ONCE
	useEffect(() => {
		// Prevent double loading in StrictMode
		if (hasLoadedInitialPresets.current) {
			return;
		}

		hasLoadedInitialPresets.current = true;

		const loadedPresets = loadPresetsFromCookie();
		const loadedActivePreset = loadActivePresetFromCookie();

		setFilterPresets(loadedPresets);
		setActivePresetId(loadedActivePreset);

		// Mark initial load as complete after a short delay to ensure state has settled
		setTimeout(() => {
			setIsInitialLoadComplete(true);
		}, 100);
	}, [loadPresetsFromCookie, loadActivePresetFromCookie]);

	// Save presets to cookie - ONLY after initial load is complete
	useEffect(() => {
		// Don't save during initial load
		if (!isInitialLoadComplete || !presetsCookieKey) {
			return;
		}

		try {
			const presetsToSave = JSON.stringify(filterPresets);
			setCookie(presetsCookieKey, presetsToSave, 30);
		} catch (e) {
			console.error("Error saving presets to cookie:", e);
		}
	}, [filterPresets, presetsCookieKey, isInitialLoadComplete]);

	// Save active preset ID to cookie - ONLY after initial load is complete
	useEffect(() => {
		// Don't save during initial load
		if (!isInitialLoadComplete || !activePresetCookieKey) {
			return;
		}

		try {
			if (activePresetId !== null) {
				setCookie(activePresetCookieKey, activePresetId.toString(), 30);
			} else {
				eraseCookie(activePresetCookieKey);
			}
		} catch (e) {
			console.error("Error saving active preset ID:", e);
		}
	}, [activePresetId, activePresetCookieKey, isInitialLoadComplete]);

	const saveFilterPreset = useCallback(
		(name, icon = "") => {
			const preset = {
				id: Date.now(),
				name: name.trim(),
				icon: icon.trim(),
				filters: JSON.parse(JSON.stringify(filters)), // Deep clone
				globalFilter: globalFilterValue,
				viewMode: viewMode,
				visibleColumns: visibleColumns.map((col) => col.fieldname),
				created: new Date().toISOString(),
			};

			setFilterPresets((prev) => [...prev, preset]);
			setActivePresetId(preset.id);
		},
		[filters, globalFilterValue, viewMode, visibleColumns]
	);

	const loadFilterPreset = useCallback(
		(preset) => {
			if (!preset) return;

			try {
				// Load filters
				if (preset.filters) {
					setFilters(preset.filters);
				}

				// Load global filter
				setGlobalFilterValue(preset.globalFilter || "");

				// Load view mode
				if (preset.viewMode) {
					setViewMode(preset.viewMode);
				}

				// Load visible columns
				if (preset.visibleColumns && Array.isArray(preset.visibleColumns)) {
					const restoredColumns = preset.visibleColumns
						.map((fieldname) =>
							columnsConfig.find((col) => col.fieldname === fieldname)
						)
						.filter(Boolean);
					if (restoredColumns.length > 0) {
						setVisibleColumns(restoredColumns);
					}
				}

				setActivePresetId(preset.id);
			} catch (e) {
				console.error("Error loading preset:", e);
			}
		},
		[columnsConfig, setFilters, setGlobalFilterValue, setViewMode, setVisibleColumns]
	);

	const deleteFilterPreset = useCallback(
		(presetId) => {
			setFilterPresets((prev) => prev.filter((p) => p.id !== presetId));
			if (activePresetId === presetId) {
				setActivePresetId(null);
			}
		},
		[activePresetId]
	);

	const resetView = useCallback(() => {
		// Clear all cookies
		if (tableStateCookieKey) eraseCookie(tableStateCookieKey);
		if (presetsCookieKey) eraseCookie(presetsCookieKey);
		if (viewModeCookieKey) eraseCookie(viewModeCookieKey);
		if (activePresetCookieKey) eraseCookie(activePresetCookieKey);

		// Reset to defaults
		setVisibleColumns(columnsConfig.filter((col) => col.defaultVisible !== false));
		setFirst(0);
		setRows(initialRows);
		setSortField(fetchArgs.orderBy?.field || null);
		setSortOrder(fetchArgs.orderBy?.order === "desc" ? -1 : 1);
		setViewMode(VIEW_MODES.COMFORTABLE);
		setFilterPresets([]);
		setActivePresetId(null);
		setIsInitialLoadComplete(false);
		hasLoadedInitialPresets.current = false;
		initFilters();

		// Force page reload to ensure clean state
		setTimeout(() => {
			window.location.reload();
		}, 100);
	}, [
		tableStateCookieKey,
		presetsCookieKey,
		viewModeCookieKey,
		activePresetCookieKey,
		columnsConfig,
		initialRows,
		fetchArgs,
		initFilters,
		setVisibleColumns,
		setFirst,
		setRows,
		setSortField,
		setSortOrder,
		setViewMode,
	]);

	return {
		filterPresets,
		activePresetId,
		showPresetDialog,
		setShowPresetDialog,
		saveFilterPreset,
		loadFilterPreset,
		deleteFilterPreset,
		resetView,
	};
};
