// src/components/document/hooks/useDocumentData.js
import { useFrappeGetDoc, useFrappeGetCall } from "frappe-react-sdk";
import { useEffect, useState } from "react";

export const useDocumentData = (
	doctypeName,
	docname,
	externalFormSchema,
	externalDocData,
	fieldsToFetch = ["*"]
) => {
	const [internalFormSchema, setInternalFormSchema] = useState(null);
	const [internalDocData, setInternalDocData] = useState(null);

	const {
		data: schemaApiResponse,
		isLoading: isLoadingSchema,
		error: schemaError,
	} = useFrappeGetCall(
		"rua.apiv2.get_doctype_form_schema",
		{ doctype_name: doctypeName },
		`doctype_schema_${doctypeName}`,
		{ enabled: !externalFormSchema && !!doctypeName }
	);

	const effectiveFormSchema =
		externalFormSchema || internalFormSchema || schemaApiResponse?.message;

	const {
		data: docDataFromHook,
		isLoading: isLoadingDoc,
		error: docError,
		mutate: mutateDoc, // For editor
	} = useFrappeGetDoc(doctypeName, docname, {
		fields: fieldsToFetch,
		enabled: !externalDocData && !!docname && !!effectiveFormSchema,
	});

	useEffect(() => {
		if (externalFormSchema) {
			setInternalFormSchema(externalFormSchema);
		} else if (schemaApiResponse?.message) {
			setInternalFormSchema(schemaApiResponse.message);
		}
	}, [externalFormSchema, schemaApiResponse]);

	useEffect(() => {
		if (externalDocData) {
			setInternalDocData(externalDocData);
		} else if (docDataFromHook) {
			setInternalDocData(docDataFromHook);
		}
	}, [externalDocData, docDataFromHook]);

	const isLoading = isLoadingSchema || (isLoadingDoc && !externalDocData && !!docname);
	// Combine errors carefully
	let combinedError = schemaError || (docError && !externalDocData && !!docname);
	if (externalFormSchema && !effectiveFormSchema)
		combinedError = new Error("External form schema provided but invalid.");
	// etc. for docData

	return {
		formSchema: effectiveFormSchema,
		docData: externalDocData || internalDocData,
		isLoading,
		error: combinedError,
		mutateDoc, // Pass through for editor
	};
};
