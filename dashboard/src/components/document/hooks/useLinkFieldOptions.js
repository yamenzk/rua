// src/components/document/hooks/useLinkFieldOptions.js
import { useState, useCallback, useRef, useEffect } from "react";
import { useFrappePostCall } from "frappe-react-sdk";
import { parseDescription } from "@/components/document/utils/schemaUtils";

export const useLinkFieldOptions = (toastRef) => {
	const [linkOptions, setLinkOptions] = useState({});
	const [linkOptionsLoading, setLinkOptionsLoading] = useState({});
	const linkOptionsCache = useRef({});
	const linkOptionsCacheExpiry = useRef({});
	const { call: searchLinkCall } = useFrappePostCall("frappe.desk.search.search_link");
	const { call: getUserListCall } = useFrappePostCall("frappe.client.get_list");

	// Cache expiry time: 5 minutes
	const CACHE_EXPIRY_MS = 5 * 60 * 1000;

	const buildCacheKey = useCallback((linkedDoctype, filters, searchTerm = "") => {
		const filtersKey = JSON.stringify(filters || []);
		return `${linkedDoctype}_${filtersKey}_${searchTerm}`;
	}, []);

	const isCacheValid = useCallback((cacheKey) => {
		const expiryTime = linkOptionsCacheExpiry.current[cacheKey];
		return expiryTime && Date.now() < expiryTime;
	}, []);

	const fetchLinkOptions = useCallback(
		async (
			linkedDoctype,
			fieldDescriptionString = "",
			searchTerm = "",
			forceRefresh = false
		) => {
			if (!linkedDoctype) return [];

			// Parse filters from field description
			const descriptionData = parseDescription(fieldDescriptionString);
			let filtersFromDescription = [];

			if (descriptionData && Array.isArray(descriptionData.link_filters)) {
				filtersFromDescription = descriptionData.link_filters
					.map((filterArr) => {
						if (Array.isArray(filterArr) && filterArr.length === 3) return filterArr;
						if (typeof filterArr === "string") {
							const parts = filterArr.split(",");
							if (parts.length === 3)
								return [parts[0].trim(), parts[1].trim(), parts[2].trim()];
						}
						return null;
					})
					.filter((f) => f !== null);
			}

			const cacheKey = buildCacheKey(linkedDoctype, filtersFromDescription, searchTerm);

			// Check cache first (unless force refresh)
			if (!forceRefresh && isCacheValid(cacheKey) && linkOptionsCache.current[cacheKey]) {
				return linkOptionsCache.current[cacheKey];
			}

			// Set loading state
			setLinkOptionsLoading((prev) => ({ ...prev, [linkedDoctype]: true }));

			try {
				let response;
				let options = [];

				if (linkedDoctype === "User") {
					// Special handling for User doctype
					const userFilters = [
						["name", "!=", "Administrator"],
						...filtersFromDescription,
					];

					if (searchTerm && searchTerm.trim() !== "") {
						userFilters.push(["full_name", "like", `%${searchTerm}%`]);
					}

					response = await getUserListCall({
						doctype: "User",
						fields: JSON.stringify(["name", "full_name"]),
						filters: JSON.stringify(userFilters),
						page_length: 50, // Increased limit for dropdown
						order_by: "full_name asc",
					});

					options =
						response.message?.map((item) => ({
							label: item.full_name || item.name,
							value: item.name,
						})) || [];
				} else {
					// Standard link field handling
					const searchPayload = {
						doctype: linkedDoctype,
						txt: searchTerm || "",
						page_length: 50,
						order_by: "name asc",
					};

					if (filtersFromDescription.length > 0) {
						searchPayload.filters = JSON.stringify(filtersFromDescription);
					}

					response = await searchLinkCall(searchPayload);
					options =
						response.message?.map((item) => ({
							label: item.description || item.value,
							value: item.value,
						})) || [];
				}

				// Cache the results
				linkOptionsCache.current[cacheKey] = options;
				linkOptionsCacheExpiry.current[cacheKey] = Date.now() + CACHE_EXPIRY_MS;

				// Update state
				setLinkOptions((prev) => ({ ...prev, [linkedDoctype]: options }));

				return options;
			} catch (error) {
				console.error(`Error fetching options for ${linkedDoctype}:`, error);
				toastRef.current?.show({
					severity: "error",
					summary: `Fetch Error`,
					detail: `Could not fetch options for ${linkedDoctype}. ${
						error.response?.data?.message || error.message || "Unknown error"
					}`,
					life: 4000,
				});
				return [];
			} finally {
				setLinkOptionsLoading((prev) => ({ ...prev, [linkedDoctype]: false }));
			}
		},
		[buildCacheKey, isCacheValid, searchLinkCall, getUserListCall, toastRef]
	);

	const clearCache = useCallback((linkedDoctype = null) => {
		if (linkedDoctype) {
			// Clear cache for specific doctype
			const keysToDelete = Object.keys(linkOptionsCache.current).filter((key) =>
				key.startsWith(`${linkedDoctype}_`)
			);
			keysToDelete.forEach((key) => {
				delete linkOptionsCache.current[key];
				delete linkOptionsCacheExpiry.current[key];
			});
		} else {
			// Clear all cache
			linkOptionsCache.current = {};
			linkOptionsCacheExpiry.current = {};
		}
	}, []);

	// Cleanup expired cache entries periodically
	useEffect(() => {
		const cleanupInterval = setInterval(() => {
			const now = Date.now();
			Object.keys(linkOptionsCacheExpiry.current).forEach((key) => {
				if (linkOptionsCacheExpiry.current[key] < now) {
					delete linkOptionsCache.current[key];
					delete linkOptionsCacheExpiry.current[key];
				}
			});
		}, 60000); // Cleanup every minute

		return () => clearInterval(cleanupInterval);
	}, []);

	return {
		linkOptions,
		linkOptionsLoading,
		fetchLinkOptions,
		clearCache,
	};
};
