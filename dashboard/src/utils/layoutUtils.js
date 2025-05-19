// src/utils/layoutUtils.js

export const isColumnBreak = (element) => {
	return element && (element.type === "Column Break" || element.type === "ColumnBreak");
};

export const isSectionBreak = (element) => {
	return element && (element.type === "Section Break" || element.type === "SectionBreak");
};

export const isTabBreak = (element) => {
	return element && (element.type === "Tab Break" || element.type === "TabBreak");
};

export const getGridClasses = (columnCount) => {
	switch (columnCount) {
		case 1:
			return "grid-cols-1";
		case 2:
			return "grid-cols-1 md:grid-cols-2";
		case 3:
			return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
		case 4:
			return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
		case 5:
			return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";
		case 6:
			return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6";
		default:
			return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
	}
};

export const createTabSlug = (tabLabel) => {
	if (!tabLabel || typeof tabLabel !== "string" || String(tabLabel).trim() === "") {
		return ""; 
	}
	return tabLabel
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
};

export const parseTabFromUrl = (location) => {
	if (!location || !location.search) return null;
	const searchParams = new URLSearchParams(location.search);
	return searchParams.get("tab");
};

export const updateUrlWithTab = (navigate, location, tabSlug, replace = false) => {
	if (!navigate || !location) return;
	const searchParams = new URLSearchParams(location.search);
	if (tabSlug) {
		searchParams.set("tab", tabSlug);
	} else {
		searchParams.delete("tab");
	}
	const queryString = searchParams.toString();
	const newUrl = `${location.pathname}${queryString ? `?${queryString}` : ""}`;
	if (replace) {
		navigate(newUrl, { replace: true });
	} else {
		navigate(newUrl);
	}
};
