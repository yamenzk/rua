// src/components/common/UniversalDocEditor.jsx
import React, {
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  useNavigate, // No longer directly using useLocation here, it's in useExternalTabOrchestration
} from "react-router-dom";

// PrimeReact Components
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";

// Custom Hooks
import { useDocumentData } from "@/hooks/useDocumentData";
import { useDocumentPageTitle } from "@/hooks/useDocumentPageTitle";
import { useExternalTabOrchestration } from "@/hooks/useExternalTabOrchestration";
import { useFormHandler } from "@/hooks/useFormHandler";
import { useLinkFieldSearch } from "@/hooks/useLinkFieldSearch";
import { useDocEditorSubmissionAndFiles } from "@/hooks/useDocEditorSubmissionAndFiles";

// Custom Utils & Components
import UniversalLayoutRenderer from "./UniversalLayoutRenderer";
import FileUploadDialog from "@/components/common/FileUploadDialog.jsx";
import { getFieldConfig } from "@/utils/FieldManager.jsx"; // For renderFormField
import * as FormFieldAdapter from "@/utils/FormFieldAdapter.js"; // For renderFormField
import { parseDescription } from "@/utils/schemaUtils"; // For renderFormField

const UniversalDocEditor = forwardRef(
  (
    {
      doctypeName,
      docname: docnameProp, // Renamed to avoid conflict with hook variables
      onSaveSuccess,
      onSaveError,
      customUIAugmentations,
      onTabsConfigChange,
      externalTabsEnabled = false,
    },
    ref
  ) => {
    const navigate = useNavigate();
    const toast = useRef(null);
    const isCreateModeInitial = !docnameProp;

    // 1. Data Fetching (Schema and existing Doc Data for edit mode)
    const {
      formSchema,
      docData: initialDocData, // Data for initializing form in edit mode
      isLoading: isLoadingData,
      error: dataError,
      mutateDoc,
    } = useDocumentData(doctypeName, docnameProp, null, null);

    // 2. Form State and Basic Validation
    const {
      formData,
      setFormData, // Needed by submission hook for file URLs
      formErrors,
      handleInputChange,
      validateForm,
    } = useFormHandler(formSchema, initialDocData, isCreateModeInitial);

    // 3. Page Title
    useDocumentPageTitle(
      initialDocData,
      formData,
      docnameProp,
      formSchema,
      doctypeName,
      isCreateModeInitial,
      "Edit"
    );

    // 4. External Tab Orchestration (if enabled)
    const { handleRendererTabsProcessed } = useExternalTabOrchestration(
      externalTabsEnabled,
      onTabsConfigChange
    );

    // 5. Link Field Search Autocomplete
    const { linkSuggestions, handleLinkSearch } = useLinkFieldSearch(toast);

    // 6. Submission and File Handling Logic
    const {
      handleSubmit: triggerSubmitLogic, // Renamed to avoid confusion
      isSaving,
      // pendingFiles, // Not directly needed by parent component
      isFileDialogVisible,
      setIsFileDialogVisible,
      fileUploadTarget,
      openUploadModal,
      handleFileSelectedInDialog,
    } = useDocEditorSubmissionAndFiles({
      doctypeName,
      docnameFromProp: docnameProp,
      formData,
      formSchema,
      isCreateMode: isCreateModeInitial,
      validateForm,
      onSaveSuccess,
      onSaveError,
      toastRef: toast,
      mutateDoc,
      setFormData, // Give submission hook ability to update formData (e.g., with file URLs)
    });

    // Expose submit function via ref
    useImperativeHandle(ref, () => ({
      triggerSubmit: triggerSubmitLogic,
    }));

    // --- Field Rendering Callback for UniversalLayoutRenderer ---
    const renderFormField = useCallback(
      (fieldSchemaItem, currentFormData, currentCustomCtx) => {
        // ULR passes its docData (which is formData for editor) and context
        if (!fieldSchemaItem || fieldSchemaItem.hidden) return null;

        const {
          fieldname,
          fieldtype,
          label,
          read_only,
          set_only_once,
          bold,
          mandatory,
          placeholder,
        } = fieldSchemaItem;
        const descriptionData = parseDescription(fieldSchemaItem.description);
        const config = getFieldConfig(fieldtype, fieldname);

        if (!config.formComponent) {
          return (
            <div key={fieldname} className="my-3 text-red-500">
              Unsupported: {label || fieldname} ({fieldtype})
            </div>
          );
        }
        const ComponentToRender = config.formComponent;
        // Use docnameProp for set_only_once check as it reflects the initial state
        const isEffectivelyReadOnly =
          read_only || (set_only_once && !isCreateModeInitial && !!docnameProp);

        const adapterContext = {
          formData: currentFormData, // Use formData passed by ULR
          handleInputChange, // From useFormHandler
          linkSuggestions, // From useLinkFieldSearch
          handleLinkSearch: (event, linkedDoctype) =>
            handleLinkSearch(event, linkedDoctype, fieldSchemaItem.description),
          isCreateMode: isCreateModeInitial,
          toast,
          openUploadModal, // From useDocEditorSubmissionAndFiles
        };
        const componentSpecificProps = FormFieldAdapter.getAdaptedProps(
          fieldSchemaItem,
          adapterContext
        );
        let valuePropName = "value";
        if (fieldtype === "Check") valuePropName = "checked";

        const commonProps = {
          id: fieldname,
          [valuePropName]:
            componentSpecificProps[valuePropName] !== undefined
              ? componentSpecificProps[valuePropName]
              : currentFormData[fieldname], // Value from ULR's currentFormData
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
        isCreateModeInitial,
        docnameProp, // For read_only logic
        handleInputChange,
        linkSuggestions,
        handleLinkSearch,
        openUploadModal,
        formErrors, // Callbacks and state from hooks
        // formData is not needed in deps because renderFormField receives currentFormData from ULR
      ]
    );

    // --- Loading and Error States ---
    if (isLoadingData) {
      return (
        <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
          <ProgressSpinner />
        </div>
      );
    }
    if (dataError) {
      return (
        <Message
          severity="error"
          text={dataError.message || "Could not load initial data or schema."}
          className="m-4"
        />
      );
    }
    if (!formSchema?.fields) {
      return (
        <Message
          severity="warn"
          text="Form schema or fields definition is incomplete."
          className="m-4"
        />
      );
    }

    // Context for custom components within ULR
    const customComponentContext = {
      docname: fileUploadTarget.currentDocnameForUpload || `NEW-${doctypeName}`, // Provides some docname context even for new
      doctypeName,
      docData: formData, // Custom components see live form data
      formSchema,
      navigate,
      setPageTitle: (title) => {
        /* Page title is managed by useDocumentPageTitle */
      }, // Can be a no-op or allow override
      handleInputChange, // Allow custom components to modify form
    };

    return (
      <>
        <Toast ref={toast} />
        <Card
          className="mt-0 shadow-none rounded-xl overflow-hidden bg-transparent"
          pt={{ content: { className: "p-0" } }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault(); /* Submission via toolbar ref from parent */
            }}
          >
            {isSaving && ( // Global saving indicator (optional, as buttons usually show loading)
              <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-[1000]">
                <ProgressSpinner strokeWidth="4" />
              </div>
            )}
            <UniversalLayoutRenderer
              formSchema={formSchema}
              allFieldsSchema={formSchema.fields}
              renderFieldItem={renderFormField}
              customUIAugmentations={customUIAugmentations}
              docData={formData} // Pass current form data to ULR
              customComponentContext={customComponentContext}
              enableRouting={true}
              onTabsProcessed={
                externalTabsEnabled ? handleRendererTabsProcessed : undefined
              }
              // externalActiveTabIndex and hideInternalTabViewHeader are managed by ULR's useTabLayoutRouting
              // based on URL if not explicitly passed down from a page component controlling DocToolbar.
              // For editor, usually tabs are internal unless a very specific design requires external.
              hideInternalTabViewHeader={externalTabsEnabled}
              // initialActiveTabIndex: ULR's hook manages this
            />
          </form>
        </Card>
        {isFileDialogVisible && (
          <FileUploadDialog
            visible={isFileDialogVisible}
            onHide={() => setIsFileDialogVisible(false)}
            onFileSelect={handleFileSelectedInDialog} // From submission hook
            targetFieldname={fileUploadTarget.fieldname} // From submission hook
            // isNewDocument prop for FileUploadDialog needs to know if currentDocnameForUpload is set
            isNewDocument={!fileUploadTarget.currentDocnameForUpload}
          />
        )}
      </>
    );
  }
);
UniversalDocEditor.displayName = "UniversalDocEditor";

UniversalDocEditor.defaultProps = {
  customUIAugmentations: null,
  onTabsConfigChange: null,
  externalTabsEnabled: false,
};

export default UniversalDocEditor;
