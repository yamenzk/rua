// src/components/document/hooks/useDocumentPageTitle.js
import { useEffect } from "react";
import { useLayout } from "@/contexts/LayoutContext.jsx";

export const useDocumentPageTitle = (
	docData,
	formData,
	docname,
	formSchema,
	doctypeName,
	isCreateMode = false,
	viewOrEditPrefix = "View",
	disableAutoTitle = false // New parameter to disable automatic title setting
) => {
	const { setPageTitle } = useLayout();

	useEffect(() => {
		// If auto title is disabled, don't override the page title
		if (disableAutoTitle) return;

		if (!formSchema && !docname) return; // Not enough info

		let displayData = isCreateMode ? formData : docData;
		if (!isCreateMode && !displayData && docname) {
			// Edit mode, docData still loading
			displayData = { name: docname }; // Use docname as temporary
		} else if (!displayData) {
			displayData = {}; // Prevent errors if displayData is null
		}

		let titleNamePart = displayData?.name || docname || ""; // Fallback to docname

		if (formSchema?.fields && Object.keys(displayData).length > 0) {
			const commonTitleFields = [
				"title",
				"subject",
				"employee_name",
				"project_name",
				"party",
				"item_name",
				formSchema.title_field,
			].filter(Boolean);

			for (const fieldName of commonTitleFields) {
				if (displayData[fieldName]) {
					titleNamePart = displayData[fieldName];
					break;
				}
			}
		}

		const prefix = isCreateMode ? `New` : viewOrEditPrefix;
		const schemaLabel = formSchema?.label || doctypeName || "Document";
		const finalTitleName = titleNamePart || (isCreateMode ? "" : "Document"); // Avoid "New : Document"

		const title = `${prefix} ${schemaLabel}${finalTitleName ? `: ${finalTitleName}` : ""}`;
		setPageTitle(title);
	}, [
		docData,
		formData,
		docname,
		formSchema,
		doctypeName,
		isCreateMode,
		setPageTitle,
		viewOrEditPrefix,
		disableAutoTitle, // Add to dependencies
	]);
};
