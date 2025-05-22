// dashboard/src/components/common/table-components/useTableState.js
import { useState, useCallback, useEffect } from "react";
import { setCookie, getCookie } from "@/utils/cookies";
import { VIEW_MODES } from "../constants";

export const useTableState = (columnsConfig, fetchArgs, initialRows, uniqueTableKey) => {
	const tableStateCookieKey = uniqueTableKey ? `datatable_${uniqueTableKey}_state` : null;
	const viewModeCookieKey = uniqueTableKey ? `datatable_${uniqueTableKey}_viewmode` : null;

	const loadStateFromCookie = useCallback(() => {
		if (tableStateCookieKey) {
			const savedStateString = getCookie(tableStateCookieKey);
			if (savedStateString) {
				try {
					return JSON.parse(savedStateString);
				} catch (e) {
					console.error("Error parsing saved table state from cookie:", e);
				}
			}
		}
		return null;
	}, [tableStateCookieKey]);

	const loadViewModeFromCookie = useCallback(() => {
		if (viewModeCookieKey) {
			const savedViewMode = getCookie(viewModeCookieKey);
			if (savedViewMode && VIEW_MODES[savedViewMode]) {
				return VIEW_MODES[savedViewMode];
			}
		}
		return VIEW_MODES.COMFORTABLE;
	}, [viewModeCookieKey]);

	// Core table state
	const [tableData, setTableData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showSkeleton, setShowSkeleton] = useState(true);
	const [selectedRow, setSelectedRow] = useState(null);
	const [showColumnDialog, setShowColumnDialog] = useState(false);

	// Pagination and sorting state
	const [first, setFirst] = useState(() => loadStateFromCookie()?.first || 0);
	const [rows, setRows] = useState(() => loadStateFromCookie()?.rows || initialRows);
	const [sortField, setSortField] = useState(
		() => loadStateFromCookie()?.sortField || fetchArgs.orderBy?.field || null
	);
	const [sortOrder, setSortOrder] = useState(
		() => loadStateFromCookie()?.sortOrder || (fetchArgs.orderBy?.order === "desc" ? -1 : 1)
	);

	// Column visibility state
	const [visibleColumns, setVisibleColumns] = useState(() => {
		const savedState = loadStateFromCookie();
		if (savedState?.visibleColumns && Array.isArray(savedState.visibleColumns)) {
			const validSavedColumnObjects = savedState.visibleColumns
				.map((fieldname) => columnsConfig.find((cfg) => cfg.fieldname === fieldname))
				.filter(Boolean);
			if (validSavedColumnObjects.length > 0) {
				return validSavedColumnObjects;
			}
		}
		return columnsConfig.filter((col) => col.defaultVisible !== false);
	});

	// View mode state
	const [viewMode, setViewMode] = useState(() => loadViewModeFromCookie());

	// Save state to cookies
	useEffect(() => {
		if (tableStateCookieKey) {
			const stateToSave = {
				visibleColumns: visibleColumns.map((col) => col.fieldname),
				first,
				rows,
				sortField,
				sortOrder,
			};
			setCookie(tableStateCookieKey, JSON.stringify(stateToSave), 30);
		}
	}, [visibleColumns, first, rows, sortField, sortOrder, tableStateCookieKey]);

	useEffect(() => {
		if (viewModeCookieKey) {
			const viewModeKey = Object.keys(VIEW_MODES).find(
				(key) => VIEW_MODES[key] === viewMode
			);
			if (viewModeKey) {
				setCookie(viewModeCookieKey, viewModeKey, 30);
			}
		}
	}, [viewMode, viewModeCookieKey]);

	return {
		tableData,
		setTableData,
		loading,
		setLoading,
		showSkeleton,
		setShowSkeleton,
		selectedRow,
		setSelectedRow,
		first,
		setFirst,
		rows,
		setRows,
		sortField,
		setSortField,
		sortOrder,
		setSortOrder,
		visibleColumns,
		setVisibleColumns,
		viewMode,
		setViewMode,
		showColumnDialog,
		setShowColumnDialog,
	};
};
