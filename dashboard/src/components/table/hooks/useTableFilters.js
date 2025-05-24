import { useState, useCallback, useEffect } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { getFieldConfig } from "@/components/document/utils/fieldTypeConfigurations.jsx";

export const useTableFilters = (columnsConfig) => {
	const [filters, setFilters] = useState({});
	const [globalFilterValue, setGlobalFilterValue] = useState("");
	const [activeFilterCount, setActiveFilterCount] = useState(0);

	// Initialize filters following PrimeReact pattern
	const initFilters = useCallback(() => {
		const initialFilters = {
			global: { value: null, matchMode: FilterMatchMode.CONTAINS },
		};

		columnsConfig.forEach((colConfig) => {
			if (colConfig.filterable !== false) {
				const fieldCfg = getFieldConfig(colConfig.fieldtype, colConfig.fieldname);
				if (fieldCfg.filterable === false) return;

				let matchMode = FilterMatchMode.CONTAINS;
				let operator = FilterOperator.AND;

				if (fieldCfg.dataType === "numeric") {
					matchMode = FilterMatchMode.EQUALS;
				} else if (fieldCfg.dataType === "date") {
					matchMode = FilterMatchMode.DATE_IS;
				} else if (fieldCfg.dataType === "boolean") {
					matchMode = FilterMatchMode.EQUALS;
				} else if (
					colConfig.fieldtype === "Select" ||
					colConfig.fieldtype === "Autocomplete"
				) {
					matchMode = FilterMatchMode.EQUALS;
				} else if (
					colConfig.fieldtype === "Link" ||
					colConfig.fieldtype === "Nationality"
				) {
					matchMode = FilterMatchMode.IN;
					operator = FilterOperator.OR;
				}

				if (fieldCfg.dataType === "numeric" || fieldCfg.dataType === "date") {
					initialFilters[colConfig.fieldname] = {
						operator: FilterOperator.AND,
						constraints: [{ value: null, matchMode }],
					};
				} else if (
					colConfig.fieldtype === "Link" ||
					colConfig.fieldtype === "Nationality"
				) {
					// Ensure Link and Nationality fields always start with empty array
					initialFilters[colConfig.fieldname] = {
						value: [], // Always initialize as empty array for MultiSelect components
						matchMode,
					};
				} else {
					initialFilters[colConfig.fieldname] = {
						operator: FilterOperator.AND,
						constraints: [{ value: null, matchMode }],
					};
				}
			}
		});

		setFilters(initialFilters);
		setGlobalFilterValue("");
	}, [columnsConfig]);

	// Count active filters
	useEffect(() => {
		let count = 0;
		Object.keys(filters).forEach((key) => {
			if (key === "global") {
				if (filters[key].value) count++;
			} else if (filters[key]) {
				if (filters[key].constraints) {
					filters[key].constraints.forEach((constraint) => {
						if (
							constraint.value !== null &&
							constraint.value !== undefined &&
							constraint.value !== ""
						) {
							count++;
						}
					});
				} else if (
					filters[key].value !== null &&
					filters[key].value !== undefined &&
					filters[key].value !== ""
				) {
					if (Array.isArray(filters[key].value)) {
						if (filters[key].value.length > 0) count++;
					} else {
						count++;
					}
				}
			}
		});
		setActiveFilterCount(count);
	}, [filters]);

	const clearFilters = useCallback(() => {
		initFilters();
	}, [initFilters]);

	return {
		filters,
		setFilters,
		globalFilterValue,
		setGlobalFilterValue,
		activeFilterCount,
		initFilters,
		clearFilters,
	};
};
