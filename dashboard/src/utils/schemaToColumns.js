// dashboard/src/utils/schemaToColumns.js
import { parseDescription } from "./schemaUtils";
import nationalitiesData from "@/utils/nationalities.json"; // Import if Nationality filter options are built here

export const transformSchemaToColumnConfig = (formSchema, customArgs = {}) => {
	if (!formSchema || !formSchema.fields) return [];

	const {
		linkFieldFilterOptions = {}, // Object containing options for Link fields, keyed by Doctype
		selectOverrides = {}, // Optional: For overriding Select options if needed, keyed by fieldname
	} = customArgs;

	return formSchema.fields
		.filter((field) => field.in_list_view === true) // Only include fields marked for list view
		.map((field) => {
			const descriptionData = parseDescription(field.description);
			let processedFilterDropdownOptions = []; // Options for dropdown-based filters ({label, value})

			// --- Logic to prepare `processedFilterDropdownOptions` ---
			if (selectOverrides[field.fieldname]?.length > 0) {
				// Highest priority: Explicit overrides for this specific field's filter options
				processedFilterDropdownOptions = selectOverrides[field.fieldname];
			} else {
				// No override, determine based on fieldtype
				switch (field.fieldtype) {
					case "Select":
						if (
							Array.isArray(field.select_options_data) &&
							field.select_options_data.length > 0
						) {
							// Standard "Select" uses the pre-parsed `select_options_data` array from Frappe
							processedFilterDropdownOptions = field.select_options_data.map(
								(opt) => ({
									label: String(opt),
									value: opt,
								})
							);
						}
						break;
					case "Autocomplete": // Your custom Autocomplete, which uses a searchable Dropdown
						if (typeof field.options === "string" && field.options.trim() !== "") {
							// Parses the newline-separated string from `field.options`
							processedFilterDropdownOptions = field.options
								.split("\n")
								.map((opt) => opt.trim())
								.filter((opt) => opt) // Remove empty strings
								.map((opt) => ({ label: String(opt), value: opt }));
						}
						break;
					case "Nationality":
						// Nationality filter options come from the static JSON data
						// This assumes your Nationality filter (e.g., MultiSelectTableFilter)
						// expects {label, value} with flags in the label.
						processedFilterDropdownOptions = nationalitiesData.map((n) => ({
							label: `${n.flag} ${n.name}`,
							value: n.name,
						}));
						break;
					case "Link":
						// For "Link" fields, filter options are often dynamic and fetched based on context.
						// `linkFieldFilterOptions` (passed in customArgs) is the primary source here.
						// These are typically pre-fetched distinct values or a smaller subset for filtering.
						const linkedDoctype = field.options; // field.options contains the linked Doctype name
						if (linkFieldFilterOptions[linkedDoctype]?.length > 0) {
							processedFilterDropdownOptions = linkFieldFilterOptions[linkedDoctype];
						}
						// If linkFieldFilterOptions is empty for a Link, the filter might be a text input,
						// or the DynamicDataTable would need to fetch them on demand (more complex).
						// For now, we assume they are provided if a dropdown-style filter is desired.
						break;
					// Add other fieldtypes that might use dropdown-style filters here
					default:
						// For other fieldtypes, processedFilterDropdownOptions remains empty.
						// Their filter elements (e.g., TextTableFilter, NumericRangeTableFilter)
						// don't typically rely on pre-supplied options in this way.
						break;
				}
			}

			const colConfig = {
				fieldname: field.fieldname,
				header:
					field.label ||
					field.fieldname.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
				fieldtype: field.fieldtype,
				sortable: field.sortable !== undefined ? field.sortable : true, // Prefer schema definition, else true
				filterable: field.is_filterable, // From Frappe schema (field.in_filter)
				defaultVisible: field.in_standard_filter, // From Frappe schema
				minWidth: field.width || (field.fieldtype === "Attach Image" ? "80px" : "150px"),
				style: field.width ? { width: field.width } : {}, // Apply width if defined

				// --- Data for specific field type needs ---
				linked_doctype: field.fieldtype === "Link" ? field.options : undefined, // For Link fields

				// --- Raw schema options (can be useful for some components/logic) ---
				// It's good to have a consistent way to access the "source" of options
				options_source_string:
					field.fieldtype === "Select" ||
					field.fieldtype === "Autocomplete" ||
					field.fieldtype === "Nationality"
						? field.options
						: null,
				options_source_array:
					field.fieldtype === "Select" ? field.select_options_data : null,

				// --- For UI rendering and behavior ---
				description: field.description, // Raw description for tooltips via parseDescription
				displayProps: {
					// Props derived from description for cell rendering
					...parseDescription(field.description), // Spread all parsed properties
				},
				options: processedFilterDropdownOptions, // **CRUCIAL**: Processed {label, value} array for filter dropdowns
				// This is what `colProps.options` will be in `tableFilterElement`
			};
			return colConfig;
		});
};
