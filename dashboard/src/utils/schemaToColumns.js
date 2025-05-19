// dashboard/src/utils/schemaToColumns.js
import { parseDescription } from "./schemaUtils"; //

export const transformSchemaToColumnConfig = (formSchema, customArgs = {}) => {
	if (!formSchema || !formSchema.fields) return [];

	const {
		linkFieldFilterOptions = {}, // Object containing options for Link fields, keyed by Doctype
		selectOverrides = {}, // Optional: For overriding Select options if needed
	} = customArgs;

	return formSchema.fields
		.filter((field) => field.in_list_view === true)
		.map((field) => {
			const descriptionData = parseDescription(field.description); //
			let currentFilterOptions = [];
			const linkedDoctype = field.options; // For Link fields, field.options holds the linked DocType name

			if (field.fieldtype === "Link") {
				if (
					linkFieldFilterOptions[linkedDoctype] &&
					linkFieldFilterOptions[linkedDoctype].length > 0
				) {
					currentFilterOptions = linkFieldFilterOptions[linkedDoctype];
				}
				// Optional: Add a console.warn here if options for a linkedDoctype are expected but not found
				// else {
				//   console.warn(`[transformSchemaToColumnConfig] Filter options for linked Doctype "${linkedDoctype}" (field: ${field.fieldname}) not provided or empty in customArgs.linkFieldFilterOptions.`);
				// }
			} else if (field.fieldtype === "Select") {
				// Check if there's an override for this select field first
				if (
					selectOverrides[field.fieldname] &&
					selectOverrides[field.fieldname].length > 0
				) {
					currentFilterOptions = selectOverrides[field.fieldname];
				} else if (field.select_options_data && field.select_options_data.length > 0) {
					// Default behavior for Select: transform options to {label, value}
					currentFilterOptions = field.select_options_data.map((opt) => ({
						label: String(opt), // Ensure label is a string
						value: opt,
					}));
				}
			}
			// Add other fieldtype-specific logic for filterOptions if necessary (e.g. for Nationality if not handled as Select)

			const colConfig = {
				fieldname: field.fieldname,
				header:
					field.label ||
					field.fieldname.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
				fieldtype: field.fieldtype,
				sortable: true, // Default, can be fine-tuned based on fieldConfig if needed
				filterable: field.is_filterable, // Should come from schema (e.g., field.in_filter from apiv2.py)
				defaultVisible: field.in_standard_filter, // Should come from schema
				minWidth: field.width || (field.fieldtype === "Attach Image" ? "80px" : "150px"),
				style: field.width ? { width: field.width } : {},
				// Pass the original schema options for reference or other uses if needed
				linked_doctype: field.fieldtype === "Link" ? field.options : undefined,
				select_options_from_schema: field.select_options_data, // Raw options from schema for Select fields

				description: field.description, // Raw description for tooltips or other parsing
				displayProps: {
					// Parsed from description or defaults
					asChip: descriptionData.asChip,
					chipColors: descriptionData.chipColors,
					chipRounded: descriptionData.chipRounded,
					asAvatar: descriptionData.asAvatar,
					avatarSize: descriptionData.avatarSize,
					imageWidth: descriptionData.imageWidth,
					imageClassName: descriptionData.imageClassName,
					iconOnly: descriptionData.iconOnly,
					// any other props from descriptionData
					...descriptionData,
				},
				filterOptions: currentFilterOptions, // The crucial processed options for the filter UI
			};
			return colConfig;
		});
};
