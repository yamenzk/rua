// src/utils/FormFieldAdapter.js
import * as _formatters from "./formatters.jsx"; // Ensure this path is correct
import nationalitiesData from "@/utils/nationalities.json"; // Assuming path for Nationality field

/**
 * Context object structure expected by adapter functions:
 * {
 *   formData: object,             // The current form data
 *   handleInputChange: function,  // (fieldname, value, fieldtype?) => void
 *   linkSuggestions: object,      // State for link field suggestions
 *   handleLinkSearch: function,   // (event, linkedDoctype, optionsSource, querySource) => Promise<void>
 *   isCreateMode: boolean,
 *   fieldSchema: object,          // The schema for the specific field being rendered (passed within fullContext)
 *   toast: RefObject<Toast>       // PrimeReact Toast ref
 *   openUploadModal: function,    // (fieldname) => void
 * }
 */

const getCheckProps = (context) => {
	const { fieldname } = context.fieldSchema;
	const currentValue = context.formData[fieldname];
	let checkedValue = false;

	if (typeof currentValue === "boolean") {
		checkedValue = currentValue;
	} else if (typeof currentValue === "number") {
		checkedValue = currentValue === 1;
	} else {
		checkedValue = !!currentValue; // Fallback, handles undefined, null, empty strings as false
	}

	return {
		checked: checkedValue,
		// The onChange from commonProps in UniversalDocEditor is already:
		// (e) => handleInputChange(fieldname, e.target.value, fieldtype)
		// Our CheckSwitchFormField's internal handleChange adapts its own event to this structure.
		// So, the default commonProps.onChange can be used if CheckSwitchFormField does the adaptation.
		// If we want the adapter to be fully responsible:
		onChange: (eventFromComponent) => {
			// eventFromComponent is from Checkbox/InputSwitch
			let newBooleanValue = false;
			if (eventFromComponent && typeof eventFromComponent === "object") {
				if (typeof eventFromComponent.checked === "boolean")
					newBooleanValue = eventFromComponent.checked; // Checkbox
				else if (typeof eventFromComponent.value === "boolean")
					newBooleanValue = eventFromComponent.value; // InputSwitch
				else if (
					eventFromComponent.target &&
					typeof eventFromComponent.target.checked === "boolean"
				)
					newBooleanValue = eventFromComponent.target.checked; // HTML input
				else newBooleanValue = !!eventFromComponent; // Fallback
			} else {
				newBooleanValue = !!eventFromComponent;
			}
			context.handleInputChange(fieldname, newBooleanValue ? 1 : 0, "Check"); // Store as 0/1
		},
		fieldSchemaItem: context.fieldSchema, // For CheckSwitchFormField to read description
	};
};

const getDateTimeProps = (context) => {
	const { fieldname, fieldtype } = context.fieldSchema;
	const currentValue = context.formData[fieldname];
	let componentValue = null;
	if (currentValue) {
		try {
			const date = new Date(currentValue);
			if (!isNaN(date.getTime())) {
				// Check if date is valid
				componentValue = date;
			}
		} catch (e) {
			/* componentValue remains null */
		}
	}

	let serverFormatFunction = _formatters.formatServerDate;
	const calendarSpecificProps = {
		dateFormat: "dd/mm/yy",
		showIcon: true,
	};

	if (fieldtype === "Datetime") {
		calendarSpecificProps.showTime = true;
		calendarSpecificProps.showSeconds = true;
		serverFormatFunction = _formatters.formatServerDateTime;
	} else if (fieldtype === "Time") {
		calendarSpecificProps.timeOnly = true;
		calendarSpecificProps.showSeconds = true;
		serverFormatFunction = _formatters.formatServerTime;
		delete calendarSpecificProps.dateFormat;
	}

	return {
		value: componentValue,
		onChange: (e) =>
			context.handleInputChange(
				fieldname,
				e.value ? serverFormatFunction(e.value) : null,
				fieldtype
			),
		...calendarSpecificProps,
	};
};

const getLinkProps = (context) => {
	const {
		fieldname,
		options: linkedDoctypeFromOptions, // Typically the linked Doctype from schema's 'options'
		target: linkedDoctypeFromTarget, // Fallback if 'options' is used differently
		// get_query, // We are not directly using get_query in the current useLinkFieldSearch setup for filters
		// Frappe's search_link API itself might respect a `get_query` defined on the doctype.
		// If useLinkFieldSearch needed to pass `get_query` to the API call, it would need another param.
		force_selection,
		description, // The raw description string from fieldSchema
	} = context.fieldSchema;

	const actualLinkedDoctype = linkedDoctypeFromOptions || linkedDoctypeFromTarget;

	if (!actualLinkedDoctype) {
		console.warn(
			`[FormFieldAdapter] No linked doctype determined for Link field: ${fieldname}. Suggestions might not work.`
		);
		// Return minimal props to prevent further errors, or throw an error
		return {
			value: context.formData[fieldname] || null,
			suggestions: [],
			completeMethod: () => {}, // No-op
			disabled: true,
			placeholder: "Link configuration error",
			onChange: (e) => context.handleInputChange(fieldname, e.value, "Link"),
		};
	}

	return {
		value: context.formData[fieldname] || null,
		suggestions: context.linkSuggestions[actualLinkedDoctype] || [],
		completeMethod: (
			e // `e` is the PrimeReact AutoComplete event
		) =>
			context.handleLinkSearch(
				// Call the hook's function
				e, // Pass the event
				actualLinkedDoctype, // Pass the determined linked doctype
				description // Pass the raw description string for parsing link_filters
			),
		dropdown: true,
		forceSelection: force_selection || false,
		onChange: (e) => context.handleInputChange(fieldname, e.value, "Link"),
	};
};

const getNumberInputProps = (context) => {
	const {
		fieldname,
		fieldtype,
		options: schemaOptions,
		precision,
		non_negative,
	} = context.fieldSchema;

	const currentValue = context.formData[fieldname];
	const props = {
		value:
			currentValue === undefined || currentValue === null || currentValue === ""
				? null // InputNumber prefers null for empty
				: Number(currentValue),
		// onChange from commonProps in UniversalDocEditor should work if InputNumber event is {target: {name, value}}
		// However, InputNumber's event is often {originalEvent, value, formattedValue}
		// So, providing a specific onValueChange is safer.
		onValueChange: (e) => context.handleInputChange(fieldname, e.value, fieldtype), // e.value is the numeric value
	};

	if (non_negative) props.min = 0;

	if (fieldtype === "Currency") {
		props.mode = "currency";
		props.currency = schemaOptions || "AED"; // Default currency from schema options or hardcoded
		props.locale = "en-AE"; // Or from a global config
	} else {
		props.mode = "decimal"; // For Int, Float, Percent
	}

	if (fieldtype === "Percent") props.suffix = "%";

	const defaultPrecision = fieldtype === "Float" || fieldtype === "Currency" ? 2 : 0;
	const precisionNum = parseInt(precision, 10);

	props.minFractionDigits =
		fieldtype === "Int" ? 0 : isNaN(precisionNum) ? defaultPrecision : precisionNum;
	props.maxFractionDigits =
		fieldtype === "Int" ? 0 : isNaN(precisionNum) ? defaultPrecision : precisionNum;

	return props;
};

const getSelectBasedProps = (context) => {
	// Renamed from getSelectProps for clarity
	const { fieldname, fieldtype, options, select_options_data, placeholder } =
		context.fieldSchema;
	let parsedOptions = [];

	if (
		fieldtype === "Select" &&
		Array.isArray(select_options_data) &&
		select_options_data.length > 0
	) {
		parsedOptions = select_options_data.map((opt) => ({ label: String(opt), value: opt }));
	} else if (
		fieldtype === "Autocomplete" &&
		typeof options === "string" &&
		options.trim() !== ""
	) {
		// "Autocomplete" type uses fieldSchema.options (newline-separated string)
		parsedOptions = options
			.split("\n")
			.map((opt) => opt.trim())
			.filter((opt) => opt)
			.map((opt) => ({ label: String(opt), value: opt }));
	}
	// Note: "Nationality" is handled by its own adapter function now.

	// Determine if filtering should be enabled for the Dropdown component
	const enableFilter = fieldtype === "Autocomplete"; // Only "Autocomplete" gets search by default here

	return {
		value: context.formData[fieldname] ?? null, // Dropdown prefers null for no selection
		options: parsedOptions,
		onChange: (e) => context.handleInputChange(fieldname, e.value, fieldtype), // e.value is the selected option's value
		showClear: true,
		placeholder: placeholder || "Select an option...",
		filter: enableFilter ? true : undefined,
		filterBy: enableFilter ? "label" : undefined,
		filterPlaceholder: enableFilter ? "Search..." : undefined,
	};
};

const getNationalityProps = (context) => {
	const { fieldname, placeholder } = context.fieldSchema;
	const nationalityOptions = nationalitiesData.map((n) => ({
		label: `${n.flag} ${n.name}`,
		value: n.name,
	}));
	return {
		value: context.formData[fieldname] ?? null,
		options: nationalityOptions,
		onChange: (e) => context.handleInputChange(fieldname, e.value, "Nationality"),
		showClear: true,
		filter: true, // Nationalities list is long, so filter is good
		filterBy: "label",
		placeholder: placeholder || "Select Nationality...",
		// itemTemplate: (option) => <span>{option.label}</span>, // This should be handled by NationalityFormField
		// fieldSchemaItem: context.fieldSchema, // Pass if NationalityFormField needs it for more complex logic
	};
};

const getTextEditorProps = (context) => {
	const { fieldname, options } = context.fieldSchema; // 'options' can be used for height e.g. "200px"
	let height = "200px"; // Default height
	if (options && String(options).match(/^\d+px$/)) {
		height = options;
	}
	return {
		value: context.formData[fieldname] || "",
		onTextChange: (e) => context.handleInputChange(fieldname, e.htmlValue, "Text Editor"), // e.htmlValue for rich text
		style: { height: height },
	};
};

const getAttachmentProps = (context) => {
	const { fieldname } = context.fieldSchema;
	return {
		value: context.formData[fieldname] || "", // URL or "Pending: filename.txt"
		fieldname: fieldname,
		onFileUploadTrigger: () => {
			if (typeof context.openUploadModal === "function") {
				// Pass fieldname to openUploadModal so it knows which field is uploading
				context.openUploadModal(fieldname);
			} else {
				console.warn(
					"[FormFieldAdapter] openUploadModal function not provided in context for Attachment field."
				);
			}
		},
		fieldSchemaItem: context.fieldSchema, // Pass to AttachmentFormField if it needs more schema details
	};
};

const getDefaultInputProps = (context) => {
	const { fieldname, fieldtype } = context.fieldSchema; // Added fieldtype
	return {
		value: context.formData[fieldname] || "",
		onChange: (e) => context.handleInputChange(fieldname, e.target.value, fieldtype), // Pass fieldtype
	};
};

export const getAdaptedProps = (fieldSchema, context) => {
	const fullContext = { ...context, fieldSchema };
	const { fieldtype } = fieldSchema;

	switch (fieldtype) {
		case "Check":
			return getCheckProps(fullContext);
		case "Date":
		case "Datetime":
		case "Time":
			return getDateTimeProps(fullContext);
		case "Link":
			return getLinkProps(fullContext);
		case "Currency":
		case "Int":
		case "Float":
		case "Percent":
			return getNumberInputProps(fullContext);
		case "Heading":
			// HeadingField takes fieldSchemaItem directly. UniversalDocEditor's commonProps
			// will pass fieldSchemaItem if the formComponent is HeadingField.
			// We just need to ensure it gets the label.
			return { label: fieldSchema.label, fieldSchemaItem: fieldSchema }; // Or let commonProps handle fieldSchemaItem

		// Types using Dropdown, handled by getSelectBasedProps
		case "Select":
		case "Autocomplete": // Will get filter:true from getSelectBasedProps
			return getSelectBasedProps(fullContext);

		case "Nationality":
			return getNationalityProps(fullContext); // Dedicated adapter for Nationality

		case "Text Editor":
			return getTextEditorProps(fullContext);
		case "Attach":
		case "Attach Image":
			return getAttachmentProps(fullContext);

		// Simple text-based inputs
		case "Data":
		case "Small Text":
		case "Text":
		case "Long Text":
		case "Color": // ColorPickerFormField handles its own value/onChange for #
		// but might receive default props like value from here.
		// Consider if Color needs a specific adapter function or if
		// ColorPickerFormField is self-sufficient with default props.
		// For now, let it use default.
		case "Duration": // Assuming InputText, if InputNumber, it needs getNumberInputProps
			return getDefaultInputProps(fullContext);
		default:
			console.warn(
				`[FormFieldAdapter] No specific adapter for fieldtype: "${fieldtype}". Using default input props.`
			);
			return getDefaultInputProps(fullContext);
	}
};
