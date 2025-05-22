// src/hooks/useDocEditorSubmissionAndFiles.js
import { useState, useCallback, useEffect } from "react";
import { useFrappeUpdateDoc, useFrappeCreateDoc, useFrappeFileUpload } from "frappe-react-sdk";

export const useDocEditorSubmissionAndFiles = ({
	doctypeName,
	docnameFromProp, // The docname passed as a prop (null for new)
	formData, // Current form data from useFormHandler
	formSchema, // For field types, is_private, folder for attachments
	isCreateMode,
	validateForm, // From useFormHandler
	onSaveSuccess,
	onSaveError,
	toastRef,
	mutateDoc, // From useDocumentData, to refresh cache after update
	setFormData, // From useFormHandler, to update form data with file URLs
}) => {
	const { updateDoc, loading: isUpdatingDoc } = useFrappeUpdateDoc();
	const { createDoc, loading: isCreatingDoc } = useFrappeCreateDoc();
	const {
		upload: sdkUploadFile,
		loading: isUploadingWithHook,
		error: sdkUploadError,
		reset: resetSdkUpload,
	} = useFrappeFileUpload();

	const isSaving = isCreatingDoc || isUpdatingDoc || isUploadingWithHook;

	const [pendingFiles, setPendingFiles] = useState({});
	const [isFileDialogVisible, setIsFileDialogVisible] = useState(false);
	const [fileUploadTarget, setFileUploadTarget] = useState({
		fieldname: null,
		currentDocnameForUpload: docnameFromProp, // Initialize with prop
	});

	// Effect to update currentDocnameForUpload if the main docname prop changes
	// This is crucial if the component stays mounted after creation and docnameFromProp updates
	useEffect(() => {
		setFileUploadTarget((prev) => ({ ...prev, currentDocnameForUpload: docnameFromProp }));
	}, [docnameFromProp]);

	const openUploadModal = useCallback((fieldnameForUpload) => {
		setFileUploadTarget((prev) => ({
			...prev, // keep currentDocnameForUpload
			fieldname: fieldnameForUpload,
		}));
		setIsFileDialogVisible(true);
	}, []); // Relies on fileUploadTarget.currentDocnameForUpload which is synced by useEffect

	const handleFileSelectedInDialog = useCallback(
		async (selectedFileObject, fieldnameOfTarget) => {
			if (!selectedFileObject || !fieldnameOfTarget || !formSchema?.fields) return;

			const isForExistingDoc = !!fileUploadTarget.currentDocnameForUpload;

			if (!isForExistingDoc) {
				// Staging for a new document
				setPendingFiles((prev) => ({ ...prev, [fieldnameOfTarget]: selectedFileObject }));
				// Update formData directly via setFormData from useFormHandler
				setFormData((prevFormData) => ({
					...prevFormData,
					[fieldnameOfTarget]: `Pending: ${selectedFileObject.name}`,
				}));
				toastRef.current?.show({
					severity: "info",
					summary: "File Selected",
					detail: `${selectedFileObject.name} will be uploaded on save.`,
				});
			} else {
				// Direct upload for an existing document
				const fieldSchemaDef = formSchema.fields.find(
					(f) => f.fieldname === fieldnameOfTarget
				);
				const fileArgs = {
					isPrivate: fieldSchemaDef?.is_private || false,
					folder: fieldSchemaDef?.folder || "Home/Attachments",
					doctype: doctypeName,
					docname: fileUploadTarget.currentDocnameForUpload,
					fieldname: fieldnameOfTarget,
				};
				const uniqueToastKey = `singleUpload_${fieldnameOfTarget}_${Date.now()}`;
				try {
					toastRef.current?.show({
						severity: "info",
						summary: "Uploading",
						detail: `Uploading ${selectedFileObject.name}...`,
						key: uniqueToastKey,
					});
					const uploadResponse = await sdkUploadFile(selectedFileObject, fileArgs);
					toastRef.current?.remove(uniqueToastKey);
					toastRef.current?.show({
						severity: "success",
						summary: "Upload Complete",
						detail: `${selectedFileObject.name} uploaded. File URL: ${uploadResponse.file_url}`,
						life: 4000,
					});
					setFormData((prevFormData) => ({
						...prevFormData,
						[fieldnameOfTarget]: uploadResponse.file_url,
					}));
					setPendingFiles((prev) => {
						const newPending = { ...prev };
						delete newPending[fieldnameOfTarget];
						return newPending;
					});
				} catch (e) {
					toastRef.current?.remove(uniqueToastKey);
					toastRef.current?.show({
						severity: "error",
						summary: "Upload Failed",
						detail:
							sdkUploadError?.message ||
							e.message ||
							`Failed to upload ${selectedFileObject.name}`,
					});
					console.error("Direct file upload error:", e, sdkUploadError);
				} finally {
					resetSdkUpload();
				}
			}
			setIsFileDialogVisible(false); // Close dialog after selection/attempt
		},
		[
			fileUploadTarget.currentDocnameForUpload,
			doctypeName,
			formSchema,
			setFormData,
			sdkUploadFile,
			resetSdkUpload,
			toastRef,
			sdkUploadError,
		]
	);

	const handleSubmit = useCallback(async () => {
		if (!validateForm()) {
			toastRef.current?.show({
				severity: "warn",
				summary: "Validation Error",
				detail: "Please fill all mandatory fields.",
				life: 3000,
			});
			if (onSaveError) onSaveError(new Error("Validation Failed"));
			return null; // Indicate failure
		}

		let currentDocForSave = fileUploadTarget.currentDocnameForUpload; // Use the one synced with docnameProp
		let isNewDocCreatedInThisSubmit = false;
		let mainDocResponseData = null;

		try {
			const dataToSubmit = { ...formData };

			Object.keys(pendingFiles).forEach((fieldname) => {
				const fieldSchemaDef = formSchema?.fields.find((f) => f.fieldname === fieldname);
				if (
					fieldSchemaDef &&
					(fieldSchemaDef.fieldtype === "Attach" ||
						fieldSchemaDef.fieldtype === "Attach Image")
				) {
					if (
						typeof dataToSubmit[fieldname] === "string" &&
						dataToSubmit[fieldname].startsWith("Pending:")
					) {
						delete dataToSubmit[fieldname];
					}
				}
			});

			if (isCreateMode) {
				mainDocResponseData = await createDoc(doctypeName, dataToSubmit);
				currentDocForSave = mainDocResponseData.name; // IMPORTANT: Update for file uploads
				// Also update the fileUploadTarget for subsequent direct uploads if the form isn't closed
				setFileUploadTarget((prev) => ({
					...prev,
					currentDocnameForUpload: currentDocForSave,
				}));
				isNewDocCreatedInThisSubmit = true;
				toastRef.current?.show({
					severity: "success",
					summary: "Created",
					detail: `${formSchema?.label || doctypeName} created: ${currentDocForSave}.`,
					life: 3000,
				});
			} else {
				mainDocResponseData = await updateDoc(
					doctypeName,
					currentDocForSave,
					dataToSubmit
				);
				toastRef.current?.show({
					severity: "success",
					summary: "Updated",
					detail: `${formSchema?.label || doctypeName} updated.`,
					life: 3000,
				});
				if (mutateDoc) mutateDoc();
			}

			if (Object.keys(pendingFiles).length > 0 && currentDocForSave) {
				const stickyToastKey = "pendingFilesUploadSticky";
				toastRef.current?.show({
					key: stickyToastKey,
					severity: "info",
					summary: "Attaching Files",
					detail: "Please wait...",
				});
				const successfullyAttachedFilesData = {};

				for (const [fieldname, fileObject] of Object.entries(pendingFiles)) {
					const fieldSchemaDef = formSchema?.fields.find(
						(f) => f.fieldname === fieldname
					);
					const fileArgs = {
						isPrivate: fieldSchemaDef?.is_private || false,
						folder: fieldSchemaDef?.folder || "Home/Attachments",
						doctype: doctypeName,
						docname: currentDocForSave,
						fieldname: fieldname,
					};
					try {
						const uploadResponse = await sdkUploadFile(fileObject, fileArgs);
						successfullyAttachedFilesData[fieldname] = uploadResponse.file_url;
					} catch (uploadError) {
						console.error(
							`Error attaching file for ${fieldname}:`,
							sdkUploadError || uploadError
						);
						toastRef.current?.show({
							severity: "error",
							summary: `Attachment Failed: ${fileObject.name}`,
							detail: sdkUploadError?.message || uploadError.message,
						});
					} finally {
						resetSdkUpload();
					}
				}

				if (Object.keys(successfullyAttachedFilesData).length > 0) {
					await updateDoc(doctypeName, currentDocForSave, successfullyAttachedFilesData);
					toastRef.current?.show({
						severity: "success",
						summary: "Files Processed",
						detail: "File attachments updated successfully.",
						life: 3000,
					});
					setFormData((prev) => ({ ...prev, ...successfullyAttachedFilesData }));
					mainDocResponseData = {
						...mainDocResponseData,
						...successfullyAttachedFilesData,
					}; // Merge URLs into response
					if (!isNewDocCreatedInThisSubmit && mutateDoc) mutateDoc();
				}
				toastRef.current?.remove(stickyToastKey);
				setPendingFiles({});
			}

			if (onSaveSuccess) onSaveSuccess(mainDocResponseData);
			return mainDocResponseData; // Indicate success with response
		} catch (e) {
			toastRef.current?.remove("pendingFilesUploadSticky");
			toastRef.current?.show({
				severity: "error",
				summary: "Save Error",
				detail: e.message || `Could not save ${formSchema?.label || doctypeName}.`,
				life: 5000,
			});
			console.error("Save error:", e);
			if (onSaveError) onSaveError(e);
			return null; // Indicate failure
		}
	}, [
		doctypeName,
		fileUploadTarget.currentDocnameForUpload,
		formData,
		formSchema,
		isCreateMode,
		validateForm,
		pendingFiles,
		onSaveSuccess,
		onSaveError,
		toastRef,
		createDoc,
		updateDoc,
		sdkUploadFile,
		resetSdkUpload,
		sdkUploadError,
		mutateDoc,
		setFormData,
	]);


	return {
		handleSubmit,
		isSaving,
		pendingFiles, // Though managed internally, exposing if parent wants to know
		// File Dialog related props and handlers
		isFileDialogVisible,
		setIsFileDialogVisible, // To be controlled by the main component
		fileUploadTarget, // For FileUploadDialog prop
		openUploadModal,
		handleFileSelectedInDialog, // Passed to FileUploadDialog
	};
};
