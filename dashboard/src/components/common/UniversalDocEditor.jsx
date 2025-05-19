// src/components/common/UniversalDocEditor.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useImperativeHandle, // Keep
  forwardRef, // Keep
} from "react";
import { useNavigate } from "react-router-dom";
import {
  useFrappeGetDoc,
  useFrappeUpdateDoc,
  useFrappeCreateDoc,
  useFrappeGetCall,
  useFrappePostCall,
  useFrappeFileUpload,
} from "frappe-react-sdk";

// PrimeReact Components
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";

// Custom Utils & Components
import { getFieldConfig } from "@/utils/FieldManager.jsx";
import * as FormFieldAdapter from "@/utils/FormFieldAdapter.js";
import * as _formatters from "@/utils/formatters.jsx";
import { useLayout } from "@/contexts/LayoutContext.jsx";
import UniversalLayoutRenderer from "./UniversalLayoutRenderer";
import FileUploadDialog from "@/components/common/FileUploadDialog.jsx";
import { parseDescription } from "@/utils/schemaUtils";

// Helper to apply default values from schema
const applySchemaDefaults = (
  schemaFields,
  existingData = {},
  mode = "create"
) => {
  const formData = { ...existingData };
  if (!schemaFields || !Array.isArray(schemaFields)) return formData;
  schemaFields.forEach((field) => {
    if (mode === "create" && formData[field.fieldname] === undefined) {
      let defaultValue =
        field.default_value_parsed !== null &&
        field.default_value_parsed !== undefined
          ? field.default_value_parsed
          : field.default_value;
      if (defaultValue === "Today" && field.fieldtype === "Date") {
        formData[field.fieldname] = _formatters.formatServerDate(new Date());
      } else if (defaultValue === "Now") {
        if (field.fieldtype === "Time")
          formData[field.fieldname] = _formatters.formatServerTime(new Date());
        if (field.fieldtype === "Datetime")
          formData[field.fieldname] = _formatters.formatServerDateTime(
            new Date()
          );
      } else if (defaultValue !== undefined && defaultValue !== null) {
        formData[field.fieldname] = defaultValue;
      } else if (field.fieldtype === "Check" && defaultValue === undefined) {
        formData[field.fieldname] = 0; // Default Check to 0 (false)
      }
    }
  });
  return formData;
};

const UniversalDocEditor = forwardRef(
  ({ doctypeName, docname, onSaveSuccess, onSaveError }, ref) => {
    const navigate = useNavigate(); // Not used directly, but good to keep if onCancel default behavior is needed
    const { setPageTitle } = useLayout();
    const toast = useRef(null);
    const isCreateModeInitial = !docname;

    const {
      data: apiResponse,
      isLoading: isLoadingSchema,
      error: schemaError,
    } = useFrappeGetCall(
      "rua.apiv2.get_doctype_form_schema",
      { doctype_name: doctypeName },
      `doctype_schema_${doctypeName}`
    );
    const formSchema = apiResponse?.message;

    const {
      data: docData,
      isLoading: isLoadingDoc,
      error: docError,
      mutate: mutateDoc,
    } = useFrappeGetDoc(doctypeName, docname, {
      fields: ["*"],
      enabled: !isCreateModeInitial && !!formSchema && !!docname,
    });

    const { updateDoc, loading: isUpdatingDoc } = useFrappeUpdateDoc();
    const { createDoc, loading: isCreatingDoc } = useFrappeCreateDoc();
    const {
      upload: sdkUploadFile,
      // progress: sdkUploadProgress,
      loading: isUploadingWithHook,
      error: sdkUploadError,
      reset: resetSdkUpload,
    } = useFrappeFileUpload();

    const isSaving = isCreatingDoc || isUpdatingDoc || isUploadingWithHook;

    const [formData, setFormData] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const [linkSuggestions, setLinkSuggestions] = useState({});
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [isFileDialogVisible, setIsFileDialogVisible] = useState(false);
    const [fileUploadTarget, setFileUploadTarget] = useState({
      fieldname: null,
      currentDocnameForUpload: docname, // Will be updated if docname changes (e.g., after creation)
    });
    const [pendingFiles, setPendingFiles] = useState({});

    const { call: searchLinkCall } = useFrappePostCall(
      "frappe.desk.search.search_link"
    );
    const { call: getUserListCall } = useFrappePostCall(
      "frappe.client.get_list"
    );

    // Effect for setting the page title
    useEffect(() => {
      let titleNamePart = docname;
      const currentDisplayData = isCreateModeInitial ? formData : docData;
      if (currentDisplayData && formSchema?.fields) {
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
          if (currentDisplayData[fieldName]) {
            titleNamePart = currentDisplayData[fieldName];
            break;
          }
        }
      }
      const title = isCreateModeInitial
        ? `New ${formSchema?.label || doctypeName}`
        : `Edit: ${titleNamePart || formSchema?.label || doctypeName}`;
      setPageTitle(title);
    }, [
      isCreateModeInitial,
      docData,
      formData,
      docname,
      formSchema,
      setPageTitle,
      doctypeName,
    ]);

    // Effect for initializing form data
    useEffect(() => {
      if (formSchema?.fields) {
        const initialData = isCreateModeInitial ? {} : docData || {};
        setFormData(
          applySchemaDefaults(
            formSchema.fields,
            initialData,
            isCreateModeInitial ? "create" : "edit"
          )
        );
      }
    }, [formSchema, docData, isCreateModeInitial]);

    // Effect to update fileUploadTarget.currentDocnameForUpload when docname changes (after creation)
    useEffect(() => {
      if (docname) {
        setFileUploadTarget((prev) => ({
          ...prev,
          currentDocnameForUpload: docname,
        }));
      }
    }, [docname]);

    const handleInputChange = useCallback(
      (fieldname, value) => {
        setFormData((prev) => ({ ...prev, [fieldname]: value }));
        if (formErrors[fieldname] != null) {
          setFormErrors((prevErrors) => {
            if (
              prevErrors[fieldname] === undefined ||
              prevErrors[fieldname] === null
            ) {
              return prevErrors;
            }
            const newErrors = { ...prevErrors };
            delete newErrors[fieldname];
            if (
              Object.keys(newErrors).length ===
                Object.keys(prevErrors).length &&
              prevErrors[fieldname] !== undefined &&
              newErrors[fieldname] === undefined
            ) {
              return newErrors;
            } else if (
              Object.keys(newErrors).length !== Object.keys(prevErrors).length
            ) {
              return newErrors;
            }
            return prevErrors;
          });
        }
      },
      [formErrors] // formErrors is a dependency
    );

    const validateForm = useCallback(() => {
      if (!formSchema || !formSchema.fields) return false;
      const errors = {};
      formSchema.fields.forEach((field) => {
        if (
          field.mandatory &&
          (formData[field.fieldname] === undefined ||
            formData[field.fieldname] === null ||
            (typeof formData[field.fieldname] === "string" &&
              String(formData[field.fieldname]).trim() === "") ||
            (typeof formData[field.fieldname] === "string" && // Check for pending attachments
              String(formData[field.fieldname]).startsWith("Pending:")))
        ) {
          errors[field.fieldname] = `${
            field.label || field.fieldname
          } is required.`;
        }
      });
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    }, [formSchema, formData]);

    const handleSubmit = useCallback(async () => {
      if (!validateForm()) {
        toast.current?.show({
          severity: "warn",
          summary: "Validation Error",
          detail: "Please fill all mandatory fields.",
          life: 3000,
        });
        if (onSaveError) onSaveError(new Error("Validation Failed"));
        return;
      }

      let currentDocForSave = docname; // Use existing docname for updates
      let isNewDocCreatedInThisSubmit = false;

      try {
        let mainDocResponse;
        const dataToSubmit = { ...formData };

        // Clear "Pending:" placeholders for actual Attach fields before saving main doc
        // This is important so we don't try to save "Pending: filename.txt" as a URL
        Object.keys(pendingFiles).forEach((fieldname) => {
          const fieldSchemaDef = formSchema.fields.find(
            (f) => f.fieldname === fieldname
          );
          if (
            fieldSchemaDef &&
            (fieldSchemaDef.fieldtype === "Attach" ||
              fieldSchemaDef.fieldtype === "Attach Image")
          ) {
            // If a file is pending for this attach field, remove the placeholder from dataToSubmit
            // The actual URL will be set after successful upload.
            // If it's an existing document and the value wasn't "Pending:", it keeps its old URL.
            if (
              typeof dataToSubmit[fieldname] === "string" &&
              dataToSubmit[fieldname].startsWith("Pending:")
            ) {
              delete dataToSubmit[fieldname];
            }
          }
        });

        if (isCreateModeInitial) {
          mainDocResponse = await createDoc(doctypeName, dataToSubmit);
          currentDocForSave = mainDocResponse.name; // IMPORTANT: Update currentDocForSave for file uploads
          isNewDocCreatedInThisSubmit = true;
          toast.current?.show({
            severity: "success",
            summary: "Created",
            detail: `${
              formSchema?.label || doctypeName
            } created: ${currentDocForSave}.`,
            life: 3000,
          });
        } else {
          mainDocResponse = await updateDoc(
            doctypeName,
            currentDocForSave,
            dataToSubmit
          );
          toast.current?.show({
            severity: "success",
            summary: "Updated",
            detail: `${formSchema?.label || doctypeName} updated.`,
            life: 3000,
          });
          mutateDoc();
        }

        // Handle pending file uploads AFTER the document exists (either created or was already existing)
        if (Object.keys(pendingFiles).length > 0 && currentDocForSave) {
          const stickyToastKey = "pendingFilesUploadSticky";
          toast.current?.show({
            key: stickyToastKey,
            severity: "info",
            summary: "Attaching Files",
            detail: "Please wait...",
            sticky: true,
          });

          const successfullyAttachedFilesData = {};
          for (const [fieldname, fileObject] of Object.entries(pendingFiles)) {
            const fieldSchemaDef = formSchema.fields.find(
              (f) => f.fieldname === fieldname
            );
            const fileArgs = {
              isPrivate: fieldSchemaDef?.is_private || false,
              folder: fieldSchemaDef?.folder || "Home/Attachments",
              doctype: doctypeName,
              docname: currentDocForSave, // Use the definite docname
              fieldname: fieldname,
            };
            try {
              const uploadResponse = await sdkUploadFile(fileObject, fileArgs);
              successfullyAttachedFilesData[fieldname] =
                uploadResponse.file_url;
              resetSdkUpload();
            } catch (uploadError) {
              console.error(
                `Error attaching file for ${fieldname}:`,
                sdkUploadError || uploadError
              );
              toast.current?.show({
                severity: "error",
                summary: `Attachment Failed: ${fileObject.name}`,
                detail: sdkUploadError?.message || uploadError.message,
              });
              resetSdkUpload();
            }
          }

          if (Object.keys(successfullyAttachedFilesData).length > 0) {
            // Update the document with the URLs of successfully uploaded files
            await updateDoc(
              doctypeName,
              currentDocForSave,
              successfullyAttachedFilesData
            );
            toast.current?.show({
              severity: "success",
              summary: "Files Processed",
              detail: "File attachments updated successfully.",
              life: 3000,
            });
            // Update local formData to reflect new file URLs
            setFormData((prev) => ({
              ...prev,
              ...successfullyAttachedFilesData,
            }));
            if (isNewDocCreatedInThisSubmit) {
              // If it was a new doc, onSaveSuccess might expect the doc with file URLs
              mainDocResponse = {
                ...mainDocResponse,
                ...successfullyAttachedFilesData,
              };
            } else {
              mutateDoc(); // Re-fetch to ensure UI consistency for existing doc
            }
          }
          toast.current?.remove(stickyToastKey);
          setPendingFiles({}); // Clear pending files
        }

        if (onSaveSuccess) onSaveSuccess(mainDocResponse);
      } catch (e) {
        toast.current?.remove("pendingFilesUploadSticky");
        toast.current?.show({
          severity: "error",
          summary: "Save Error",
          detail:
            e.message || `Could not save ${formSchema?.label || doctypeName}.`,
          life: 5000,
        });
        console.error("Save error:", e);
        if (onSaveError) onSaveError(e);
      }
    }, [
      validateForm,
      onSaveError,
      docname,
      formData,
      isCreateModeInitial,
      createDoc,
      updateDoc,
      doctypeName,
      formSchema,
      mutateDoc,
      pendingFiles,
      sdkUploadFile,
      resetSdkUpload,
      sdkUploadError,
      onSaveSuccess,
      toast, // Ensure all dependencies are stable or listed
    ]);

    useImperativeHandle(ref, () => ({
      triggerSubmit: handleSubmit,
    }));

    const handleLinkSearch = useCallback(
      async (event, linkedDoctype, fieldDescriptionString) => {
        if (!linkedDoctype) return;
        const descriptionData = parseDescription(fieldDescriptionString);
        let filtersFromDescription = [];
        if (descriptionData && Array.isArray(descriptionData.link_filters)) {
          filtersFromDescription = descriptionData.link_filters;
        }
        try {
          let response;
          let suggestions = [];
          if (linkedDoctype === "User") {
            const userFilters = [
              ["name", "!=", "Administrator"],
              ...filtersFromDescription,
            ];
            if (event.query && String(event.query).trim() !== "") {
              userFilters.push(["full_name", "like", `%${event.query}%`]);
            }
            response = await getUserListCall({
              doctype: "User",
              fields: ["name", "full_name"],
              filters: userFilters,
              page_length: 20,
            });
            suggestions =
              response.message?.map((item) => item.full_name || item.name) ||
              [];
          } else {
            response = await searchLinkCall({
              doctype: linkedDoctype,
              txt: event.query,
              page_length: 20,
              filters: filtersFromDescription,
            });
            suggestions = response.message?.map((item) => item.value) || [];
          }
          setLinkSuggestions((prev) => ({
            ...prev,
            [linkedDoctype]: suggestions,
          }));
        } catch (error) {
          console.error(`Error fetching options for ${linkedDoctype}:`, error);
          toast.current?.show({
            severity: "error",
            summary: `Search Error`,
            detail: `Could not fetch options for ${linkedDoctype}. ${error.message}`,
            life: 3000,
          });
          setLinkSuggestions((prev) => ({ ...prev, [linkedDoctype]: [] }));
        }
      },
      [searchLinkCall, getUserListCall, toast]
    );

    const openUploadModal = useCallback(
      (fieldnameForUpload) => {
        // Use currentDocnameForUpload from state for existing docs, or null for new ones
        setFileUploadTarget({
          fieldname: fieldnameForUpload,
          currentDocnameForUpload: docname, // docname prop is stable for existing, null for new
        });
        setIsFileDialogVisible(true);
      },
      [docname] // Depends on the initial docname prop
    );

    const handleFileSelectedInDialog = useCallback(
      async (selectedFileObject, fieldname) => {
        if (!selectedFileObject || !fieldname) return;

        // fileUploadTarget.currentDocnameForUpload is the key.
        // If it's null/undefined, it's a new document, so we stage the file.
        // If it has a value, it's an existing document, so we upload directly.
        const isForExistingDoc = !!fileUploadTarget.currentDocnameForUpload;

        if (!isForExistingDoc) {
          // Staging for a new document
          setPendingFiles((prev) => ({
            ...prev,
            [fieldname]: selectedFileObject,
          }));
          handleInputChange(fieldname, `Pending: ${selectedFileObject.name}`);
          toast.current?.show({
            severity: "info",
            summary: "File Selected",
            detail: `${selectedFileObject.name} will be uploaded on save.`,
          });
        } else {
          // Direct upload for an existing document
          const fieldSchemaDef = formSchema.fields.find(
            (f) => f.fieldname === fieldname
          );
          const fileArgs = {
            isPrivate: fieldSchemaDef?.is_private || false,
            folder: fieldSchemaDef?.folder || "Home/Attachments",
            doctype: doctypeName,
            docname: fileUploadTarget.currentDocnameForUpload, // This is the existing docname
            fieldname: fieldname,
          };
          const uniqueToastKey = `singleUpload_${fieldname}_${Date.now()}`;
          try {
            toast.current?.show({
              severity: "info",
              summary: "Uploading",
              detail: `Uploading ${selectedFileObject.name}...`,
              key: uniqueToastKey,
              sticky: true,
            });
            const uploadResponse = await sdkUploadFile(
              selectedFileObject,
              fileArgs
            );
            toast.current?.remove(uniqueToastKey);
            toast.current?.show({
              severity: "success",
              summary: "Upload Complete",
              detail: `${selectedFileObject.name} uploaded. File URL: ${uploadResponse.file_url}`,
              life: 4000,
            });
            handleInputChange(fieldname, uploadResponse.file_url); // Update form with actual URL
            // No need to add to pendingFiles if uploaded directly for existing doc
            setPendingFiles((prev) => {
              const newPending = { ...prev };
              delete newPending[fieldname];
              return newPending;
            });
            resetSdkUpload();
          } catch (e) {
            toast.current?.remove(uniqueToastKey);
            toast.current?.show({
              severity: "error",
              summary: "Upload Failed",
              detail:
                sdkUploadError?.message ||
                e.message ||
                `Failed to upload ${selectedFileObject.name}`,
            });
            console.error("Direct file upload error:", e, sdkUploadError);
            resetSdkUpload();
          }
        }
      },
      [
        fileUploadTarget.currentDocnameForUpload, // Use from state
        doctypeName,
        formSchema,
        handleInputChange,
        sdkUploadFile,
        resetSdkUpload,
        toast,
        sdkUploadError,
      ]
    );

    const renderFormField = useCallback(
      (fieldSchema) => {
        if (!fieldSchema || fieldSchema.hidden) return null;
        const {
          fieldname,
          fieldtype,
          label,
          read_only,
          set_only_once,
          bold,
          mandatory,
          placeholder,
        } = fieldSchema;
        const descriptionData = parseDescription(fieldSchema.description);
        const config = getFieldConfig(fieldtype, fieldname);

        if (!config.formComponent) {
          return (
            <div key={fieldname} className="my-3 text-red-500">
              Unsupported: {label || fieldname} ({fieldtype})
            </div>
          );
        }
        const ComponentToRender = config.formComponent;
        const isEffectivelyReadOnly =
          read_only || (set_only_once && !isCreateModeInitial && !!docname);

        const adapterContext = {
          formData,
          handleInputChange,
          linkSuggestions,
          handleLinkSearch: (event, linkedDoctype) =>
            handleLinkSearch(event, linkedDoctype, fieldSchema.description),
          isCreateMode: isCreateModeInitial && !docname, // isCreateMode refers to the overall form session
          toast,
          openUploadModal,
        };
        const componentSpecificProps = FormFieldAdapter.getAdaptedProps(
          fieldSchema,
          adapterContext
        );

        let valuePropName = "value";
        if (fieldtype === "Check") valuePropName = "checked";

        const commonProps = {
          id: fieldname,
          [valuePropName]:
            componentSpecificProps[valuePropName] !== undefined
              ? componentSpecificProps[valuePropName]
              : formData[fieldname],
          disabled: isEffectivelyReadOnly,
          placeholder:
            placeholder || `Enter ${label || fieldname.replace(/_/g, " ")}`,
          className: `w-full ${formErrors[fieldname] ? "p-invalid" : ""} ${
            bold ? "font-bold" : ""
          }`,
          tooltip: descriptionData.tooltip,
          tooltipOptions: { position: "top" },
          ...componentSpecificProps,
        };

        return (
          <div key={fieldname} className="field w-full mb-3">
            <label
              htmlFor={fieldname}
              className={`block text-xs font-medium text-text-color-secondary uppercase tracking-wider mb-1 ${
                bold ? "font-bold" : ""
              }`}
            >
              {label ||
                fieldname
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
              {mandatory && <span className="text-red-500">*</span>}
            </label>
            <ComponentToRender {...commonProps} />
            {formErrors[fieldname] && (
              <small className="p-error block mt-1">
                {formErrors[fieldname]}
              </small>
            )}
          </div>
        );
      },
      [
        formData,
        formErrors,
        handleInputChange,
        isCreateModeInitial,
        docname,
        linkSuggestions,
        handleLinkSearch,
        toast,
        openUploadModal, // Removed formSchema.fields
      ]
    );

    const renderLayout = () => {
      if (!formSchema || !formSchema.fields) {
        return (
          <Message
            severity="warn"
            text="Form schema/fields not available."
            className="m-4"
          />
        );
      }
      return (
        <UniversalLayoutRenderer
          formSchema={formSchema}
          allFieldsSchema={formSchema.fields}
          renderFieldItem={renderFormField}
          initialActiveTabIndex={activeTabIndex}
          onTabChangeCallback={(e) => setActiveTabIndex(e.index)}
        />
      );
    };

    if (isLoadingSchema || (isLoadingDoc && !isCreateModeInitial && docname)) {
      return (
        <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
          <ProgressSpinner />
        </div>
      );
    }
    if (
      (schemaError && !formSchema) ||
      (docError && !isCreateModeInitial && docname && !docData)
    ) {
      return (
        <Message
          severity="error"
          text={
            schemaError?.message || docError?.message || "Could not load data."
          }
          className="m-4"
        />
      );
    }
    if (!formSchema || !formSchema.fields) {
      return (
        <Message
          severity="warn"
          text="Form schema or fields definition is incomplete."
          className="m-4"
        />
      );
    }

    return (
      <>
        <Toast ref={toast} />
        <Card
          className="mt-0 shadow-none rounded-xl overflow-hidden bg-transparent"
          pt={{ content: { className: "p-0" } }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault(); /* Submission via toolbar ref */
            }}
          >
            {renderLayout()}
          </form>
        </Card>
        {isFileDialogVisible && (
          <FileUploadDialog
            visible={isFileDialogVisible}
            onHide={() => setIsFileDialogVisible(false)}
            onFileSelect={handleFileSelectedInDialog}
            targetFieldname={fileUploadTarget.fieldname}
            isNewDocument={!fileUploadTarget.currentDocnameForUpload} // This now correctly reflects if it's for a new (unsaved) doc
          />
        )}
      </>
    );
  }
);
UniversalDocEditor.displayName = "UniversalDocEditor";

export default UniversalDocEditor;
