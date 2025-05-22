// src/components/document/hooks/useLinkFieldSearch.js
import { useState, useCallback } from "react";
import { useFrappePostCall } from "frappe-react-sdk";
import { parseDescription } from "@/components/document/utils/schemaUtils"; // Assuming parseDescription is here or in layoutUtils

export const useLinkFieldSearch = (toastRef) => {
	const [linkSuggestions, setLinkSuggestions] = useState({});
	const { call: searchLinkCall } = useFrappePostCall("frappe.desk.search.search_link");
	const { call: getUserListCall } = useFrappePostCall("frappe.client.get_list");

	const handleLinkSearch = useCallback(
		async (event, linkedDoctype, fieldDescriptionString) => {
			if (!linkedDoctype) return;

			const descriptionData = parseDescription(fieldDescriptionString);
			let filtersFromDescription = [];
			if (descriptionData && Array.isArray(descriptionData.link_filters)) {
				filtersFromDescription = descriptionData.link_filters
					.map((filterArr) => {
						// Ensure filters are in the correct [fieldname, operator, value] format
						if (Array.isArray(filterArr) && filterArr.length === 3) return filterArr;
						// Attempt to parse if it's a string like "status,=,Open"
						if (typeof filterArr === "string") {
							const parts = filterArr.split(",");
							if (parts.length === 3)
								return [parts[0].trim(), parts[1].trim(), parts[2].trim()];
						}
						console.warn("Invalid filter format in link_filters:", filterArr);
						return null;
					})
					.filter((f) => f !== null);
			}

			try {
				let response;
				let suggestions = [];
				if (linkedDoctype === "User") {
					const userFilters = [
						["name", "!=", "Administrator"], // Standard Frappe user filter
						...filtersFromDescription,
					];
					if (event.query && String(event.query).trim() !== "") {
						userFilters.push(["full_name", "like", `%${event.query}%`]);
					}
					response = await getUserListCall({
						doctype: "User",
						fields: JSON.stringify(["name", "full_name"]), // Fields should be JSON string array
						filters: JSON.stringify(userFilters), // Filters should be JSON string array of arrays
						page_length: 20,
					});
					suggestions =
						response.message?.map((item) => item.full_name || item.name) || [];
				} else {
					response = await searchLinkCall({
						doctype: linkedDoctype,
						txt: event.query,
						page_length: 20,
						filters:
							filtersFromDescription.length > 0
								? JSON.stringify(filtersFromDescription)
								: undefined, // Pass filters if any
						// searchfield: 'name' // Frappe default, can be overridden by doctype meta
					});
					suggestions = response.message?.map((item) => item.value) || []; // `search_link` returns {value, description}
				}
				setLinkSuggestions((prev) => ({ ...prev, [linkedDoctype]: suggestions }));
			} catch (error) {
				console.error(`Error fetching options for ${linkedDoctype}:`, error);
				toastRef.current?.show({
					severity: "error",
					summary: `Search Error`,
					detail: `Could not fetch options for ${linkedDoctype}. ${
						error.response?.data?.message || error.message || "Unknown error"
					}`,
					life: 3000,
				});
				setLinkSuggestions((prev) => ({ ...prev, [linkedDoctype]: [] }));
			}
		},
		[searchLinkCall, getUserListCall, toastRef] // parseDescription is pure
	);

	return {
		linkSuggestions,
		handleLinkSearch,
	};
};
