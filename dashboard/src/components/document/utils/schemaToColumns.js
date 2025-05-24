// dashboard/src/components/document/utils/schemaToColumns.js - Enhanced with audit fields
import { parseDescription } from "./schemaUtils";
import nationalitiesData from "@/utils/nationalities.json";

// Define standard Frappe audit fields
const AUDIT_FIELDS = [
	{
		fieldname: "creation",
		fieldtype: "Datetime",
		label: "Created On",
		header: "Created On",
		sortable: true,
		filterable: true,
		defaultVisible: false, // Hidden by default
		minWidth: "160px",
		description: JSON.stringify({
			tooltip: "When this record was first created",
		}),
	},
	{
		fieldname: "owner",
		fieldtype: "Link",
		label: "Created By",
		header: "Created By",
		options: "User", // Links to User doctype
		sortable: true,
		filterable: true,
		defaultVisible: false,
		minWidth: "120px",
		description: JSON.stringify({
			tooltip: "Who created this record",
		}),
	},
	{
		fieldname: "modified",
		fieldtype: "Datetime",
		label: "Last Modified",
		header: "Last Modified",
		sortable: true,
		filterable: true,
		defaultVisible: false,
		minWidth: "160px",
		description: JSON.stringify({
			tooltip: "When this record was last updated",
		}),
	},
	{
		fieldname: "modified_by",
		fieldtype: "Link",
		label: "Modified By",
		header: "Modified By",
		options: "User", // Links to User doctype
		sortable: true,
		filterable: true,
		defaultVisible: false,
		minWidth: "120px",
		description: JSON.stringify({
			tooltip: "Who last modified this record",
		}),
	},
];

export const transformSchemaToColumnConfig = (formSchema, customArgs = {}) => {
	if (!formSchema || !formSchema.fields) return [];

	const {
		selectOverrides = {},
		includeAuditFields = true, // New option to control audit fields
	} = customArgs;

	let schemaColumns = [];

	// Process schema fields
	formSchema.fields.forEach((field) => {
		let shouldInclude = field.in_list_view === true;

		// Special handling for Attach Image fields
		if (field.fieldtype === "Attach Image" && field.description) {
			const descriptionData = parseDescription(field.description);

			// Check for inTable property
			if (descriptionData.inTable === "true" || descriptionData.inTable === "default") {
				shouldInclude = true;
				// Override defaultVisible based on inTable value
				if (descriptionData.inTable === "default") {
					field.defaultVisible = true;
				}
			}
		}

		if (!shouldInclude) return;

		const descriptionData = parseDescription(field.description);
		let processedFilterDropdownOptions = [];

		// Existing option processing logic...
		if (selectOverrides[field.fieldname]?.length > 0) {
			processedFilterDropdownOptions = selectOverrides[field.fieldname];
		} else {
			switch (field.fieldtype) {
				case "Select":
					if (
						Array.isArray(field.select_options_data) &&
						field.select_options_data.length > 0
					) {
						processedFilterDropdownOptions = field.select_options_data.map((opt) => ({
							label: String(opt),
							value: opt,
						}));
					}
					break;
				case "Autocomplete":
					if (typeof field.options === "string" && field.options.trim() !== "") {
						processedFilterDropdownOptions = field.options
							.split("\n")
							.map((opt) => opt.trim())
							.filter((opt) => opt)
							.map((opt) => ({ label: String(opt), value: opt }));
					}
					break;
				case "Link":
					// For Link fields, we no longer pre-populate options here
					// The LinkFilter component will fetch them dynamically
					processedFilterDropdownOptions = [];
					break;
				default:
					break;
			}
		}

		const colConfig = {
			fieldname: field.fieldname,
			header:
				field.label ||
				field.fieldname.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
			fieldtype: field.fieldtype,
			sortable: field.sortable !== undefined ? field.sortable : true,
			filterable: field.is_filterable,
			defaultVisible:
				field.defaultVisible !== undefined
					? field.defaultVisible
					: field.in_standard_filter,
			minWidth: field.width || (field.fieldtype === "Attach Image" ? "80px" : "150px"),
			style: field.width ? { width: field.width } : {},
			linked_doctype: field.fieldtype === "Link" ? field.options : undefined,
			options_source_string:
				field.fieldtype === "Select" ||
				field.fieldtype === "Autocomplete"
					? field.options
					: null,
			options_source_array: field.fieldtype === "Select" ? field.select_options_data : null,
			description: field.description,
			displayProps: {
				...parseDescription(field.description),
			},
			options: processedFilterDropdownOptions,
		};

		schemaColumns.push(colConfig);
	});

	// Add audit fields if requested
	if (includeAuditFields) {
		const auditColumns = AUDIT_FIELDS.map((auditField) => ({
			fieldname: auditField.fieldname,
			header: auditField.header,
			fieldtype: auditField.fieldtype,
			sortable: auditField.sortable,
			filterable: auditField.filterable,
			defaultVisible: auditField.defaultVisible,
			minWidth: auditField.minWidth,
			style: {},
			linked_doctype: auditField.options, // For Link fields like owner, modified_by
			description: auditField.description,
			displayProps: parseDescription(auditField.description),
			options: [], // Will be populated dynamically by LinkFilter
			isAuditField: true, // Mark as audit field for special handling
		}));

		// Add audit columns to the end
		schemaColumns = [...schemaColumns, ...auditColumns];
	}

	return schemaColumns;
};
