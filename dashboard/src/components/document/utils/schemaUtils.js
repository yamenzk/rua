// dashboard/src/components/document/utils/schemaUtils.js

/**
 * Parses a field's description string, which might contain JSON for display properties
 * and a tooltip.
 * @param {string | undefined} descriptionString - The description string from the field schema.
 * @returns {{tooltip: string, asChip?: boolean, chipColors?: object, chipRounded?: boolean, editVisible?: boolean, readVisible?: boolean, hideLabel?: boolean, [key: string]: any}}
 * An object containing the tooltip and any other properties parsed from JSON.
 */
export const parseDescription = (descriptionString) => {
	// If descriptionString is not a string or is empty/whitespace, return empty tooltip and no other props.
	if (typeof descriptionString !== "string" || !descriptionString.trim()) {
		return { tooltip: "" };
	}

	const trimmedDescription = descriptionString.trim();
	let jsonData;

	try {
		// Attempt to parse only if it looks like a JSON object string
		if (trimmedDescription.startsWith("{") && trimmedDescription.endsWith("}")) {
			jsonData = JSON.parse(trimmedDescription);
		}
	} catch (e) {
		// console.warn("parseDescription: JSON parsing failed for string:", descriptionString, e);
		// Parsing failed, jsonData remains undefined.
	}

	if (jsonData && typeof jsonData === "object" && jsonData !== null) {
		// Successfully parsed JSON
		return {
			...jsonData, // Spread all properties from the parsed JSON object
			// Ensure tooltip is explicitly taken from jsonData if present and a string, otherwise default to an empty string.
			// This prevents the entire stringified jsonData from becoming the tooltip if jsonData.tooltip is missing.
			tooltip: typeof jsonData.tooltip === "string" ? jsonData.tooltip : "",
		};
	} else {
		// Not valid JSON or not an object (e.g., just a plain string, or parsing failed)
		// The entire original string is treated as the tooltip, and no other special props are derived.
		return { tooltip: descriptionString };
	}
};
