// src/components/document/hooks/useFormHandler.js
import { useState, useEffect, useCallback } from "react";
import * as _formatters from "@/utils/formatters.jsx"; // For applySchemaDefaults

// Helper to apply default values from schema (can be part of this hook or a separate util)
const applySchemaDefaults = (schemaFields, existingData = {}, mode = "create") => {
	const formData = { ...existingData };
	if (!schemaFields || !Array.isArray(schemaFields)) return formData;

	schemaFields.forEach((field) => {
		if (mode === "create" && formData[field.fieldname] === undefined) {
			let defaultValue =
				field.default_value_parsed !== null && field.default_value_parsed !== undefined
					? field.default_value_parsed
					: field.default_value;

			if (defaultValue === "Today" && field.fieldtype === "Date") {
				formData[field.fieldname] = _formatters.formatServerDate(new Date());
			} else if (defaultValue === "Now") {
				if (field.fieldtype === "Time")
					formData[field.fieldname] = _formatters.formatServerTime(new Date());
				if (field.fieldtype === "Datetime")
					formData[field.fieldname] = _formatters.formatServerDateTime(new Date());
			} else if (defaultValue !== undefined && defaultValue !== null) {
				formData[field.fieldname] = defaultValue;
			} else if (field.fieldtype === "Check" && defaultValue === undefined) {
				formData[field.fieldname] = 0; // Default Check to 0 (false)
			}
		}
	});
	return formData;
};

export const useFormHandler = (formSchema, initialDocData, isCreateMode) => {
	const [formData, setFormData] = useState({});
	const [formErrors, setFormErrors] = useState({});

	// Effect for initializing form data
	useEffect(() => {
		if (formSchema?.fields) {
			const dataToInitializeWith = isCreateMode ? {} : initialDocData || {};
			setFormData(
				applySchemaDefaults(
					formSchema.fields,
					dataToInitializeWith,
					isCreateMode ? "create" : "edit"
				)
			);
		} else {
			// If no formSchema, ensure formData is at least an empty object
			setFormData({});
		}
	}, [formSchema, initialDocData, isCreateMode]);

	const handleInputChange = useCallback(
		(fieldname, value) => {
			setFormData((prev) => ({ ...prev, [fieldname]: value }));
			if (formErrors[fieldname] != null) {
				setFormErrors((prevErrors) => {
					const newErrors = { ...prevErrors };
					delete newErrors[fieldname];
					return newErrors;
				});
			}
		},
		[formErrors]
	); // formErrors is a dependency for clearing specific errors

	const validateForm = useCallback(() => {
		if (!formSchema || !formSchema.fields) {
			console.warn("Validation skipped: Form schema or fields not available.");
			return false; // Cannot validate without schema
		}
		const errors = {};
		formSchema.fields.forEach((field) => {
			if (field.hidden) return; // Skip hidden fields from validation

			if (
				field.mandatory &&
				(formData[field.fieldname] === undefined ||
					formData[field.fieldname] === null ||
					(typeof formData[field.fieldname] === "string" &&
						String(formData[field.fieldname]).trim() === "") ||
					(Array.isArray(formData[field.fieldname]) &&
						formData[field.fieldname].length === 0) || // For empty table/multiselect
					(typeof formData[field.fieldname] === "string" && // Check for pending attachments
						String(formData[field.fieldname]).startsWith("Pending:")))
			) {
				errors[field.fieldname] = `${field.label || field.fieldname} is required.`;
			}
			// Add other field-type specific validations here if needed (e.g., email format, number range)
		});
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	}, [formSchema, formData]);

	return {
		formData,
		setFormData, // Expose if direct manipulation is needed (e.g., after file upload URL update)
		formErrors,
		handleInputChange,
		validateForm,
	};
};
