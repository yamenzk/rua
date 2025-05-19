// dashboard/src/utils/schemaToColumns.js
import { parseDescription } from "./schemaUtils"; // Adjust path

export const transformSchemaToColumnConfig = (formSchema, customArgs = {}) => {
	if (!formSchema || !formSchema.fields) return [];

	const { userOptions = [], nationalityOptions = [] } = customArgs; // For specific dropdowns

	return formSchema.fields
		.filter((field) => field.in_list_view === true)
		.map((field) => {
			const descriptionData = parseDescription(field.description);
			let colConfig = {
				fieldname: field.fieldname,
				header:
					field.label ||
					field.fieldname.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
				fieldtype: field.fieldtype,
				sortable: true, // Default, can be fine-tuned
				filterable: field.is_filterable,
				defaultVisible: field.in_standard_filter,
				minWidth: field.width || (field.fieldtype === "Attach Image" ? "80px" : "150px"),
				style: field.width ? { width: field.width } : {},
				options: field.select_options_data, // For 'Select' type filters
				description: field.description, // Pass raw description for header tooltips in DynamicDataTable

				displayProps: {
					asChip: descriptionData.asChip,
					chipColors: descriptionData.chipColors,
					chipRounded: descriptionData.chipRounded,
					asAvatar: descriptionData.asAvatar,
					avatarSize: descriptionData.avatarSize,
					imageWidth: descriptionData.imageWidth,
					imageClassName: descriptionData.imageClassName,
					iconOnly: descriptionData.iconOnly,
				},
				filterOptions: [],
			};


			return colConfig;
		});
};
