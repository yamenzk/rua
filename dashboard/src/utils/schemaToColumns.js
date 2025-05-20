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
			} else if (field.fieldtype === "Select") {
				if (
					selectOverrides[field.fieldname] &&
					selectOverrides[field.fieldname].length > 0
				) {
					currentFilterOptions = selectOverrides[field.fieldname];
				} else if (field.select_options_data && field.select_options_data.length > 0) {
					currentFilterOptions = field.select_options_data.map((opt) => ({
						label: String(opt), // Ensure label is a string
						value: opt,
					}));
				}
			}
			
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
				linked_doctype: field.fieldtype === "Link" ? field.options : undefined,
				select_options_from_schema: field.select_options_data,
				description: field.description,
				displayProps: {
					asChip: descriptionData.asChip,
					chipColors: descriptionData.chipColors,
					chipRounded: descriptionData.chipRounded,
					asAvatar: descriptionData.asAvatar,
					avatarSize: descriptionData.avatarSize,
					imageWidth: descriptionData.imageWidth,
					imageClassName: descriptionData.imageClassName,
					iconOnly: descriptionData.iconOnly,
					...descriptionData,
				},
				filterOptions: currentFilterOptions, // The crucial processed options for the filter UI
			};
			return colConfig;
		});
};
