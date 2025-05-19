// src/components/document/UniversalDocEditor.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  useFrappeGetDoc,
  useFrappeUpdateDoc,
  useFrappeCreateDoc,
  useFrappeGetCall,
  useFrappePostCall,
  useFrappeFileUpload, // Import the hook
} from "frappe-react-sdk";

// PrimeReact Components
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
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
        formData[field.fieldname] = 0;
      }
    }
  });
  return formData;
};

const UniversalDocEditor = ({
  doctypeName,
  docname,
  onSaveSuccess,
  onCancel,
}) => {
  const navigate = useNavigate();
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
    progress: sdkUploadProgress, // You can use this to show progress for individual uploads
    loading: isUploadingWithHook,
    error: sdkUploadError, // Check this for errors from the hook
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
    currentDocnameForUpload: docname,
  });
  const [pendingFiles, setPendingFiles] = useState({});

  const { call: searchLinkCall } = useFrappePostCall(
    "frappe.desk.search.search_link"
  );
  const { call: getUserListCall } = useFrappePostCall("frappe.client.get_list");

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

  const handleInputChange = useCallback(
    (fieldname, value) => {
      setFormData((prev) => ({ ...prev, [fieldname]: value }));
      if (formErrors[fieldname] != null) {
        // Check if there was an error to clear (not just truthy, but actually exists)
        setFormErrors((prevErrors) => {
          // Only create a new object if the specific error for this field actually existed
          if (
            prevErrors[fieldname] === undefined ||
            prevErrors[fieldname] === null
          ) {
            return prevErrors; // No error was set for this field, so no change needed. Return same object.
          }
          const newErrors = { ...prevErrors };
          delete newErrors[fieldname]; // Or set to null
          // Check if anything actually changed to avoid returning a new object reference unnecessarily
          if (
            Object.keys(newErrors).length === Object.keys(prevErrors).length &&
            prevErrors[fieldname] !== undefined &&
            newErrors[fieldname] === undefined
          ) {
            return newErrors;
          } else if (
            Object.keys(newErrors).length !== Object.keys(prevErrors).length
          ) {
            return newErrors;
          }
          return prevErrors; // Fallback if no meaningful change occurred for this field's error state
        });
      }
    },
    [formErrors]
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
          (typeof formData[field.fieldname] === "string" &&
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

  const handleLinkSearch = useCallback(
    async (event, linkedDoctype, fieldDescriptionString) => {
      if (!linkedDoctype) return;

      const descriptionData = parseDescription(fieldDescriptionString);
      // Link filters are directly an array of arrays from the description,
      // e.g., { "tooltip": "...", "link_filters": [["status", "=", "Active"]] }
      // Default to an empty array if link_filters is not present or not an array.
      let filtersFromDescription = [];
      if (descriptionData && Array.isArray(descriptionData.link_filters)) {
        filtersFromDescription = descriptionData.link_filters;
      }

      try {
        let response;
        let suggestions = [];

        if (linkedDoctype === "User") {
          // Combine static User filters with those from the description
          const userFilters = [
            ["name", "!=", "Administrator"], // Static base filter for User
            ...filtersFromDescription, // Additional filters from field's description
          ];

          // Add search text as a filter for full_name (or name, as appropriate)
          if (event.query && String(event.query).trim() !== "") {
            userFilters.push(["full_name", "like", `%${event.query}%`]);
          }

          const apiPayload = {
            doctype: "User",
            fields: ["name", "full_name"], // Specify fields to fetch for User
            filters: userFilters, // Pass the combined array of arrays
            page_length: 20,
          };
          response = await getUserListCall(apiPayload); // Use the dedicated hook for get_list
          // Adapt response: get_list returns an array of objects with specified fields
          suggestions =
            response.message?.map((item) => item.full_name || item.name) || [];
        } else {
          // For all other doctypes
          const apiPayload = {
            doctype: linkedDoctype,
            txt: event.query, // Search text for frappe.desk.search.search_link
            page_length: 20,
            filters: filtersFromDescription, // Pass filters from description directly (already array of arrays)
          };
          response = await searchLinkCall(apiPayload);
          // search_link response is usually { message: [{ value: "...", ... }, ...] }
          suggestions = response.message?.map((item) => item.value) || [];
        }

        setLinkSuggestions((prev) => ({
          ...prev,
          [linkedDoctype]: suggestions,
        }));
      } catch (error) {
        console.error(`Error fetching options for ${linkedDoctype}:`, error);
        if (toast.current) {
          toast.current.show({
            severity: "error",
            summary: `Search Error`,
            detail: `Could not fetch options for ${linkedDoctype}. ${error.message}`,
            life: 3000,
          });
        }
        setLinkSuggestions((prev) => ({ ...prev, [linkedDoctype]: [] }));
      }
    },
    [searchLinkCall, getUserListCall, toast] // Dependencies for useCallback
  );

  const openUploadModal = useCallback(
    (fieldnameForUpload) => {
      setFileUploadTarget({
        fieldname: fieldnameForUpload,
        currentDocnameForUpload: docname,
      });
      setIsFileDialogVisible(true);
    },
    [docname]
  );

  const handleFileSelectedInDialog = useCallback(
    async (selectedFileObject, fieldname) => {
      if (!selectedFileObject || !fieldname) return;
      const isNewDocScenario = !fileUploadTarget.currentDocnameForUpload;

      if (isNewDocScenario) {
        setPendingFiles((prev) => ({
          ...prev,
          [fieldname]: selectedFileObject,
        }));
        handleInputChange(fieldname, `Pending: ${selectedFileObject.name}`);
        toast.current.show({
          severity: "info",
          summary: "File Selected",
          detail: `${selectedFileObject.name} will be uploaded on save.`,
        });
      } else {
        const fieldSchemaDef = formSchema.fields.find(
          (f) => f.fieldname === fieldname
        );
        const fileArgs = {
          isPrivate: fieldSchemaDef?.is_private || false,
          folder: fieldSchemaDef?.folder || "Home/Attachments",
          doctype: doctypeName,
          docname: fileUploadTarget.currentDocnameForUpload,
          fieldname: fieldname,
        };
        try {
          const uniqueToastKey = `singleUpload_${fieldname}_${Date.now()}`;
          toast.current.show({
            severity: "info",
            summary: "Uploading",
            detail: `Uploading ${selectedFileObject.name}...`,
            key: uniqueToastKey,
          });
          // Use sdkUploadFile here
          const uploadResponse = await sdkUploadFile(
            selectedFileObject,
            fileArgs
          ); // uploadResponse is FrappeFileUploadResponse
          toast.current.remove(uniqueToastKey);
          toast.current.show({
            severity: "success",
            summary: "Upload Complete",
            detail: `${selectedFileObject.name} uploaded.`,
          });
          handleInputChange(fieldname, uploadResponse.file_url);
          setPendingFiles((prev) => {
            const newPending = { ...prev };
            delete newPending[fieldname];
            return newPending;
          });
          resetSdkUpload();
        } catch (e) {
          const uniqueToastKey = `singleUpload_${fieldname}_${Date.now()}`;
          toast.current.remove(uniqueToastKey); // Ensure previous sticky is removed
          toast.current.show({
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
      fileUploadTarget.currentDocnameForUpload,
      doctypeName,
      formSchema,
      handleInputChange,
      sdkUploadFile,
      resetSdkUpload,
      toast,
      sdkUploadError,
    ]
  );

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.current.show({
        severity: "warn",
        summary: "Validation Error",
        detail: "Please fill all mandatory fields.",
        life: 3000,
      });
      return;
    }

    let currentDocForSave = docname;
    let isNewDocCreatedInThisSubmit = false;

    try {
      let mainDocResponse;
      const dataToSubmit = { ...formData };
      if (isCreateModeInitial) {
        Object.keys(pendingFiles).forEach((fn) => {
          if (
            typeof dataToSubmit[fn] === "string" &&
            dataToSubmit[fn].startsWith("Pending:")
          ) {
            delete dataToSubmit[fn];
          }
        });
      }

      if (isCreateModeInitial) {
        mainDocResponse = await createDoc(doctypeName, dataToSubmit);
        currentDocForSave = mainDocResponse.name;
        isNewDocCreatedInThisSubmit = true;
        toast.current.show({
          severity: "success",
          summary: "Created",
          detail: `${
            formSchema?.label || doctypeName
          } created with ID: ${currentDocForSave}.`,
          life: 2000,
        });
      } else {
        mainDocResponse = await updateDoc(
          doctypeName,
          currentDocForSave,
          dataToSubmit
        );
        toast.current.show({
          severity: "success",
          summary: "Updated",
          detail: `${formSchema?.label || doctypeName} updated.`,
          life: 3000,
        });
        mutateDoc();
      }

      if (Object.keys(pendingFiles).length > 0 && currentDocForSave) {
        const stickyToastKey = "pendingFilesUploadSticky";
        toast.current.show({
          key: stickyToastKey,
          severity: "info",
          summary: "Attaching Files",
          detail: "Please wait...",
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
            docname: currentDocForSave,
            fieldname: fieldname,
          };
          try {
            const uploadResponse = await sdkUploadFile(fileObject, fileArgs);
            successfullyAttachedFilesData[fieldname] = uploadResponse.file_url;
            console.log(
              `Attached pending file for ${fieldname}: ${uploadResponse.file_url}`
            );
            resetSdkUpload();
          } catch (uploadError) {
            console.error(
              `Error attaching pending file for ${fieldname}:`,
              uploadError,
              sdkUploadError
            );
            toast.current.show({
              severity: "error",
              summary: `Attachment Failed: ${fileObject.name}`,
              detail: sdkUploadError?.message || uploadError.message,
            });
            resetSdkUpload();
          }
        }

        if (
          isNewDocCreatedInThisSubmit &&
          Object.keys(successfullyAttachedFilesData).length > 0
        ) {
          await updateDoc(
            doctypeName,
            currentDocForSave,
            successfullyAttachedFilesData
          );
          toast.current.show({
            severity: "success",
            summary: "Files Attached",
            detail: "Selected files attached successfully.",
            life: 3000,
          });
          setFormData((prev) => ({
            ...prev,
            ...successfullyAttachedFilesData,
          }));
        } else if (
          !isNewDocCreatedInThisSubmit &&
          Object.keys(successfullyAttachedFilesData).length > 0
        ) {
          mutateDoc();
          toast.current.show({
            severity: "success",
            summary: "Files Updated",
            detail: "Attachments updated.",
            life: 3000,
          });
        }
        toast.current.remove(stickyToastKey);
        setPendingFiles({});
      }
      if (onSaveSuccess) onSaveSuccess(mainDocResponse);
    } catch (e) {
      toast.current.remove("pendingFilesUploadSticky");
      toast.current.show({
        severity: "error",
        summary: "Save Error",
        detail:
          e.message || `Could not save ${formSchema?.label || doctypeName}.`,
        life: 5000,
      });
      console.error("Save error:", e);
    }
  };

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
        handleLinkSearch: (event, linkedDoctype) => {
          handleLinkSearch(event, linkedDoctype, fieldSchema.description);
        },
        isCreateMode: isCreateModeInitial && !docname,
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
      openUploadModal,
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
        className="mt-4 shadow-none rounded-xl overflow-hidden bg-transparent"
        pt={{ content: { className: "p-0" } }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {renderLayout()}
          <div className="flex justify-end gap-2 px-4 md:px-6 pb-5 pt-1">
            <Button
              type="button"
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text rounded-lg"
              onClick={() => (onCancel ? onCancel() : navigate(-1))}
            />
            <Button
              type="submit"
              label={isSaving ? "Saving..." : "Save"}
              icon="pi pi-check"
              className="p-button-primary rounded-lg"
              loading={isSaving}
            />
          </div>
        </form>
      </Card>

      {isFileDialogVisible && (
        <FileUploadDialog
          visible={isFileDialogVisible}
          onHide={() => setIsFileDialogVisible(false)}
          onFileSelect={handleFileSelectedInDialog}
          targetFieldname={fileUploadTarget.fieldname}
          isNewDocument={!fileUploadTarget.currentDocnameForUpload}
        />
      )}
    </>
  );
};

export default UniversalDocEditor;
