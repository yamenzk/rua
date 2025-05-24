// src/components/document/utils/FormFieldAdapter.js
import * as _formatters from "@/utils/formatters.jsx";

/**
 * Centralized Form Field Adapter
 * Now all field types use dedicated form components with consistent interfaces
 */

const getStandardProps = (context) => {
	const { fieldname, placeholder, fieldtype } = context.fieldSchema;
	const generateFallbackLabel = (fn) =>
		fn.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

	return {
		id: fieldname,
		value: context.formData[fieldname],
		placeholder: placeholder || `Enter ${generateFallbackLabel(fieldname)}`,
		onChange: (e) => {
			// Handle different event structures
			let newValue;
			if (e && typeof e === "object") {
				if ("value" in e) {
					newValue = e.value;
				} else if (e.target && "value" in e.target) {
					newValue = e.target.value;
				} else if (e.target && "checked" in e.target) {
					newValue = e.target.checked;
				} else {
					newValue = e;
				}
			} else {
				newValue = e;
			}
			context.handleInputChange(fieldname, newValue, fieldtype);
		},
	};
};

const getCheckProps = (context) => {
	const { fieldname } = context.fieldSchema;
	const currentValue = context.formData[fieldname];
	let checkedValue = false;

	if (typeof currentValue === "boolean") {
		checkedValue = currentValue;
	} else if (typeof currentValue === "number") {
		checkedValue = currentValue === 1;
	} else {
		checkedValue = !!currentValue;
	}

	return {
		...getStandardProps(context),
		checked: checkedValue,
		fieldSchemaItem: context.fieldSchema,
		onChange: (eventFromComponent) => {
			let newBooleanValue = false;
			if (eventFromComponent && typeof eventFromComponent === "object") {
				if (typeof eventFromComponent.checked === "boolean")
					newBooleanValue = eventFromComponent.checked;
				else if (typeof eventFromComponent.value === "boolean")
					newBooleanValue = eventFromComponent.value;
				else if (
					eventFromComponent.target &&
					typeof eventFromComponent.target.checked === "boolean"
				)
					newBooleanValue = eventFromComponent.target.checked;
				else newBooleanValue = !!eventFromComponent;
			} else {
				newBooleanValue = !!eventFromComponent;
			}
			context.handleInputChange(
				context.fieldSchema.fieldname,
				newBooleanValue ? 1 : 0,
				"Check"
			);
		},
	};
};

const getDateTimeProps = (context) => {
	const { fieldname, fieldtype } = context.fieldSchema;
	const currentValue = context.formData[fieldname];
	let componentValue = null;

	if (currentValue) {
		try {
			let parsableValue = currentValue;
			if (
				fieldtype === "Time" &&
				typeof currentValue === "string" &&
				currentValue.match(/^\d{2}:\d{2}(:\d{2})?$/)
			) {
				parsableValue = `2000-01-01T${currentValue}`;
			}

			const date = new Date(parsableValue);
			if (!isNaN(date.getTime())) {
				componentValue = date;
			}
		} catch (e) {
			console.error(
				`[FormFieldAdapter] Error parsing date for field ${fieldname} (${fieldtype}). Value: ${currentValue}`,
				e
			);
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
		...getStandardProps(context),
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
		options: linkedDoctypeFromOptions,
		target: linkedDoctypeFromTarget,
		force_selection,
		placeholder,
	} = context.fieldSchema;

	const actualLinkedDoctype = linkedDoctypeFromOptions || linkedDoctypeFromTarget;

	if (!actualLinkedDoctype) {
		console.warn(
			`[FormFieldAdapter] No linked doctype determined for Link field: ${fieldname}`
		);
		return {
			...getStandardProps(context),
			options: [],
			disabled: true,
			placeholder: "Link configuration error",
		};
	}

	return {
		...getStandardProps(context),
		linkedDoctype: actualLinkedDoctype,
		fieldSchemaItem: context.fieldSchema,
		fetchLinkOptions: context.fetchLinkOptions,
		isLoading: context.linkOptionsLoading?.[actualLinkedDoctype] || false,
		placeholder: placeholder || `Select ${actualLinkedDoctype}...`,
		showClear: !force_selection,
	};
};

const getNumericProps = (context) => {
	const { fieldname, fieldtype, precision, non_negative } = context.fieldSchema;
	const props = {
		...getStandardProps(context),
		min: non_negative ? 0 : undefined,
	};

	if (fieldtype === "Float") {
		props.precision = precision;
	}

	return props;
};

const getSelectProps = (context) => {
	return {
		...getStandardProps(context),
		fieldSchemaItem: context.fieldSchema,
		showClear: true,
	};
};

const getTextEditorProps = (context) => {
	const { fieldname, options } = context.fieldSchema;
	let height = "200px";
	if (options && String(options).match(/^\d+px$/)) {
		height = options;
	}
	return {
		value: context.formData[fieldname] || "",
		onTextChange: (e) => context.handleInputChange(fieldname, e.htmlValue, "Text Editor"),
		style: { height: height },
	};
};

const getAttachmentProps = (context) => {
	const { fieldname } = context.fieldSchema;
	return {
		value: context.formData[fieldname] || "",
		fieldname: fieldname,
		onFileUploadTrigger: () => {
			if (typeof context.openUploadModal === "function") {
				context.openUploadModal(fieldname);
			} else {
				console.warn(
					"[FormFieldAdapter] openUploadModal function not provided in context for Attachment field."
				);
			}
		},
		fieldSchemaItem: context.fieldSchema,
	};
};

const getColorProps = (context) => {
	return {
		...getStandardProps(context),
		fieldSchemaItem: context.fieldSchema,
	};
};

const getHeadingProps = (context) => {
	return {
		label: context.fieldSchema.label,
		fieldSchemaItem: context.fieldSchema,
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
			return {
				...getNumericProps(fullContext),
				currency: fieldSchema.options || "AED",
				locale: "en-AE",
			};

		case "Int":
		case "Float":
		case "Percent":
		case "Duration":
			return getNumericProps(fullContext);

		case "Select":
		case "Autocomplete":
		case "Nationality":
			return getSelectProps(fullContext);

		case "Text Editor":
			return getTextEditorProps(fullContext);

		case "Attach":
		case "Attach Image":
			return getAttachmentProps(fullContext);

		case "Color":
			return getColorProps(fullContext);

		case "Heading":
			return getHeadingProps(fullContext);

		// Text-based fields
		case "Data":
		case "Small Text":
		case "Text":
		case "Long Text":
		default:
			return getStandardProps(fullContext);
	}
};
