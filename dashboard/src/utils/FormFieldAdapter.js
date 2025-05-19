// src/utils/FormFieldAdapter.js
import * as _formatters from "./formatters.jsx"; // Ensure this path is correct

/**
 * Context object structure expected by adapter functions:
 * {
 *   formData: object,             // The current form data
 *   handleInputChange: function,  // (fieldname, value) => void
 *   linkSuggestions: object,      // State for link field suggestions
 *   handleLinkSearch: function,   // (event, linkedDoctype) => Promise<void>
 *   isCreateMode: boolean,
 *   fieldSchema: object,          // The schema for the specific field being rendered (passed within fullContext)
 *   toast: RefObject<Toast>       // PrimeReact Toast ref
 * }
 */

const getCheckProps = (context) => {
	const { fieldname } = context.fieldSchema;
	return {
		checked: !!context.formData[fieldname],
		onChange: (e) => context.handleInputChange(fieldname, e.checked ? 1 : 0),
	};
};

const getDateTimeProps = (context) => {
	const { fieldname, fieldtype } = context.fieldSchema;
	const currentValue = context.formData[fieldname];
	let componentValue = null;
	try {
		componentValue = currentValue ? new Date(currentValue) : null;
	} catch (e) {
		/* componentValue remains null */
	}

	let serverFormatFunction = _formatters.formatServerDate;
	const calendarSpecificProps = {
		dateFormat: "dd/mm/yy",
		showIcon: true,
	};

	if (fieldtype === "Datetime") {
		calendarSpecificProps.showTime = true;
		calendarSpecificProps.showSeconds = true; // Or from fieldSchema.show_seconds
		serverFormatFunction = _formatters.formatServerDateTime;
	} else if (fieldtype === "Time") {
		calendarSpecificProps.timeOnly = true;
		calendarSpecificProps.showSeconds = true; // Or from fieldSchema.show_seconds
		serverFormatFunction = _formatters.formatServerTime;
		delete calendarSpecificProps.dateFormat;
	}

	return {
		value: componentValue,
		onChange: (e) =>
			context.handleInputChange(fieldname, e.value ? serverFormatFunction(e.value) : null),
		...calendarSpecificProps,
	};
};

const getLinkProps = (context) => {
	const { fieldname, options: linkedDoctype, force_selection } = context.fieldSchema;
	return {
		value: context.formData[fieldname] || "",
		suggestions: context.linkSuggestions[linkedDoctype] || [],
		completeMethod: (e) => context.handleLinkSearch(e, linkedDoctype),
		dropdown: true,
		forceSelection: force_selection || false,
		onChange: (e) => context.handleInputChange(fieldname, e.value),
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
	const props = {
		value:
			context.formData[fieldname] === undefined || context.formData[fieldname] === null
				? null
				: Number(context.formData[fieldname]),
		onValueChange: (e) => context.handleInputChange(fieldname, e.value),
	};

	if (non_negative) {
		props.min = 0;
	}

	if (fieldtype === "Currency") {
		props.mode = "currency";
		props.currency = schemaOptions || "AED";
		props.locale = "en-AE";
	} else {
		props.mode = "decimal";
	}

	if (fieldtype === "Percent") {
		props.suffix = "%";
	}

	const precisionNum = parseInt(precision, 10);
	if (!isNaN(precisionNum)) {
		props.minFractionDigits = fieldtype === "Int" ? 0 : precisionNum;
		props.maxFractionDigits = fieldtype === "Int" ? 0 : precisionNum;
	} else if (fieldtype === "Int") {
		props.minFractionDigits = 0;
		props.maxFractionDigits = 0;
	}
	return props;
};

const getSelectProps = (context) => {
	const { fieldname, select_options_data } = context.fieldSchema;
	return {
		value: context.formData[fieldname] ?? null,
		options: select_options_data?.map((opt) => ({ label: opt, value: opt })) || [],
		onChange: (e) => context.handleInputChange(fieldname, e.value),
		showClear: true,
	};
};

const getTextEditorProps = (context) => {
	const { fieldname, height } = context.fieldSchema;
	return {
		value: context.formData[fieldname] || "",
		onTextChange: (e) => context.handleInputChange(fieldname, e.htmlValue),
		style: { height: height || "200px" },
	};
};

const getAttachmentProps = (context) => {
	const { fieldname, label } = context.fieldSchema;
	return {
		value: context.formData[fieldname] || "",
		fieldname: fieldname,
		onFileUploadTrigger: () => {
			if (typeof context.openUploadModal === "function") {
				context.openUploadModal(context.fieldSchema.fieldname);
			} else {
				console.warn(/* ... */);
			}
		},
	};
};

const getDefaultInputProps = (context) => {
	const { fieldname } = context.fieldSchema;
	return {
		value: context.formData[fieldname] || "",
		onChange: (e) => context.handleInputChange(fieldname, e.target.value),
	};
};

export const getAdaptedProps = (fieldSchema, context) => {
	const fullContext = { ...context, fieldSchema }; // Add fieldSchema to context for individual adapter functions
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
		case "Select":
			return getSelectProps(fullContext);
		case "Nationality": // Assuming Nationality formComponent is Dropdown
			// and options are prepared in fieldSchema.select_options_data
			// If options are static from nationalities.json, needs its own adapter.
			return getSelectProps(fullContext); // Or a dedicated getNationalityProps(fullContext)
		case "Text Editor":
			return getTextEditorProps(fullContext);
		case "Attach":
		case "Attach Image":
			return getAttachmentProps(fullContext);
		case "Data":
		case "Small Text":
		case "Text":
		case "Long Text":
		case "Color":
		case "Duration":
			return getDefaultInputProps(fullContext);
		default:
			console.warn(
				`[FormFieldAdapter] No specific adapter for fieldtype: "${fieldtype}". Using default input props.`
			);
			return getDefaultInputProps(fullContext);
	}
};
