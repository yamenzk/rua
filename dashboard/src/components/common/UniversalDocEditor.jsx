// src/components/common/UniversalDocEditor.jsx
import React, {
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
  useMemo, // Ensure useMemo is imported
} from "react";
import { useNavigate } from "react-router-dom";

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
import { useLayout } from "@/contexts/LayoutContext.jsx";

// Custom Utils & Components
import UniversalLayoutRenderer from "./UniversalLayoutRenderer";
import FileUploadDialog from "@/components/common/FileUploadDialog.jsx";
import { getFieldConfig } from "@/utils/fieldTypeConfigurations.jsx";
import * as FormFieldAdapter from "@/utils/FormFieldAdapter.js";
import { parseDescription } from "@/utils/schemaUtils";

const UniversalDocEditor = forwardRef(
  (
    {
      doctypeName,
      docname: docnameProp,
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
    const { setPageTitle } = useLayout();
    const isCreateModeInitial = !docnameProp;

    // --- CALL ALL HOOKS THAT ARE ALWAYS NEEDED AT THE TOP ---
    const {
      formSchema,
      docData: initialDocData,
      isLoading: isLoadingData,
      error: dataError,
      mutateDoc,
    } = useDocumentData(doctypeName, docnameProp, null, null);

    const {
      formData,
      setFormData,
      formErrors,
      handleInputChange,
      validateForm,
    } = useFormHandler(formSchema, initialDocData, isCreateModeInitial);

    useDocumentPageTitle(
      initialDocData,
      formData,
      docnameProp,
      formSchema,
      doctypeName,
      isCreateModeInitial,
      "Edit"
    );

    const { handleRendererTabsProcessed } = useExternalTabOrchestration(
      externalTabsEnabled,
      onTabsConfigChange
    );

    const { linkSuggestions, handleLinkSearch } = useLinkFieldSearch(toast);

    const {
      handleSubmit: triggerSubmitLogic,
      isSaving,
      isFileDialogVisible,
      setIsFileDialogVisible,
      fileUploadTarget, // This is a state object, not a ref
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
      setFormData,
    });

    useImperativeHandle(
      ref,
      () => ({
        triggerSubmit: triggerSubmitLogic,
      }),
      [triggerSubmitLogic]
    );

    const generateFallbackLabel = useCallback((fieldname) => {
      return fieldname
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }, []);

    const renderFormField = useCallback(
      (fieldSchemaItem, currentFormData, _currentCustomCtx) => {
        // ... (implementation as before - this logic is fine)
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
        if (descriptionData.editVisible === false) return null;
        const fieldTypeConfig = getFieldConfig(fieldtype, fieldname);
        if (!fieldTypeConfig.formComponent) {
          console.warn(
            `No form component configured for field type: ${fieldtype} (field: ${fieldname})`
          );
          return (
            <div key={fieldname} className="my-3 text-orange-500">
              Unsupported field: {label || generateFallbackLabel(fieldname)} (
              {fieldtype})
            </div>
          );
        }
        const ComponentToRender = fieldTypeConfig.formComponent;
        const isEffectivelyReadOnly =
          read_only || (set_only_once && !isCreateModeInitial && !!docnameProp);
        const adapterContext = {
          formData: currentFormData,
          handleInputChange,
          linkSuggestions,
          handleLinkSearch: (event, linkedDoctype) =>
            handleLinkSearch(
              event,
              linkedDoctype,
              fieldSchemaItem.options || fieldSchemaItem.target,
              fieldSchemaItem.get_query
            ),
          isCreateMode: isCreateModeInitial,
          toast,
          openUploadModal,
          fieldSchema: fieldSchemaItem,
        };
        const componentSpecificProps = FormFieldAdapter.getAdaptedProps(
          fieldSchemaItem,
          adapterContext
        );
        let valuePropName = componentSpecificProps.valuePropName || "value";
        if (fieldtype === "Check" && !componentSpecificProps.valuePropName)
          valuePropName = "checked";
        const baseClass =
          fieldtype === "Check" ||
          fieldtype === "Attach" ||
          fieldtype === "Attach Image"
            ? ""
            : "w-full";
        const commonProps = {
          id: fieldname,
          [valuePropName]:
            componentSpecificProps[valuePropName] !== undefined
              ? componentSpecificProps[valuePropName]
              : currentFormData[fieldname],
          disabled: isEffectivelyReadOnly,
          placeholder:
            placeholder || `Enter ${label || generateFallbackLabel(fieldname)}`,
          className: `${baseClass} ${
            formErrors[fieldname] ? "p-invalid" : ""
          } ${bold ? "font-bold" : ""}`,
          tooltip: descriptionData.tooltip,
          onChange: (e) => {
            let newValue;
            // Prefer e.value for PrimeReact components (like InputNumber, Calendar, Dropdown)
            // Fallback to e.target.value for standard HTML inputs (like InputText)
            if (e && typeof e === "object" && "value" in e) {
              newValue = e.value;
            } else if (
              e &&
              typeof e === "object" &&
              e.target &&
              "value" in e.target
            ) {
              newValue = e.target.value;
            } else {
              // Last resort fallback, e.g., if e is the value itself for some very custom components
              newValue = e;
            }
            handleInputChange(fieldname, newValue, fieldtype);
          },
          ...componentSpecificProps,
        };
        delete commonProps.valuePropName;

        const showLabel = descriptionData.hideLabel !== true;
        const asideLayout = descriptionData.aside;
        const finalLabelText = label || generateFallbackLabel(fieldname);
        const labelElement = showLabel && (
          <label
            htmlFor={fieldname}
            className={`block text-xs font-medium text-text-color-secondary uppercase tracking-wider ${
              bold ? "font-bold" : ""
            } ${
              asideLayout
                ? asideLayout === "left"
                  ? "mr-2 self-start pt-2"
                  : "ml-2 self-start pt-2"
                : "mb-1"
            }`}
          >
            {finalLabelText}{" "}
            {mandatory && <span className="text-red-500">*</span>}
          </label>
        );
        const inputContainerClass = !asideLayout
          ? "w-full"
          : asideLayout === "left"
          ? "flex-1 min-w-0"
          : "flex-1 min-w-0 order-first";
        const inputElement = (
          <div className={inputContainerClass}>
            <ComponentToRender {...commonProps} />
          </div>
        );
        let fieldWrapperClass = "field w-full mb-3";
        if (asideLayout) fieldWrapperClass += " flex";
        return (
          <div key={fieldname} className={fieldWrapperClass}>
            {labelElement}
            {inputElement}
            {formErrors[fieldname] && (
              <small
                className={`p-error block mt-1 ${
                  asideLayout ? "w-full basis-full order-last text-right" : ""
                }`}
              >
                {formErrors[fieldname]}
              </small>
            )}
          </div>
        );
      },
      [
        isCreateModeInitial,
        docnameProp,
        handleInputChange,
        linkSuggestions,
        handleLinkSearch,
        openUploadModal,
        formErrors,
        generateFallbackLabel,
      ]
    );

    // MOVED customComponentContext useMemo call BEFORE early returns
    const customComponentContext = useMemo(
      () => ({
        docname:
          fileUploadTarget.currentDocnameForUpload ||
          (isCreateModeInitial ? `NEW-${doctypeName}` : docnameProp),
        doctypeName,
        docData: formData, // formData is used as docData in editor context
        formSchema, // formSchema might be undefined initially
        navigate,
        setPageTitle,
        handleInputChange,
      }),
      [
        // Fixed dependency to use state object instead of ref
        fileUploadTarget.currentDocnameForUpload,
        isCreateModeInitial,
        doctypeName,
        docnameProp,
        formData,
        formSchema,
        navigate,
        setPageTitle,
        handleInputChange,
      ]
    );

    // --- NOW THE CONDITIONAL EARLY RETURNS ---
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
      // customComponentContext is already defined, formSchema might be null/undefined within it
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
              e.preventDefault();
            }}
          >
            {isSaving && (
              <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-[1000]">
                <ProgressSpinner strokeWidth="4" />
              </div>
            )}
            <UniversalLayoutRenderer
              formSchema={formSchema}
              allFieldsSchema={formSchema.fields}
              renderFieldItem={renderFormField}
              customUIAugmentations={customUIAugmentations}
              docData={formData} // Use formData for layout in editor
              customComponentContext={customComponentContext}
              enableRouting={true}
              onTabsProcessed={
                externalTabsEnabled ? handleRendererTabsProcessed : undefined
              }
              hideInternalTabViewHeader={externalTabsEnabled}
            />
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
  }
);
UniversalDocEditor.displayName = "UniversalDocEditor";

UniversalDocEditor.defaultProps = {
  customUIAugmentations: null,
  onTabsConfigChange: null,
  externalTabsEnabled: false,
};

export default UniversalDocEditor;
