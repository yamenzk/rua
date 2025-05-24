// src/components/document/DocViewer.jsx
import React, { useCallback, useMemo } from "react"; // Ensure useMemo is imported
import { useNavigate } from "react-router-dom";

// PrimeReact Components
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

// Custom Hooks & Utils
import { useDocumentData } from "@/components/document/hooks/useDocumentData";
import { useDocumentPageTitle } from "@/components/document/hooks/useDocumentPageTitle";
import { useExternalTabOrchestration } from "@/components/document/injector/hooks/useExternalTabOrchestration";
// getFieldConfig and _formatters are used inside renderFieldDisplay, which is fine
import { getFieldConfig } from "@/components/document/utils/fieldTypeConfigurations.jsx";
import * as _formatters from "@/utils/formatters";
import { useLayout } from "@/contexts/LayoutContext.jsx";
import DocLayoutRenderer from "./layout/DocLayoutRenderer";
import { parseDescription } from "@/components/document/utils/schemaUtils";

const DocViewer = ({
  doctypeName,
  docname, // This prop is used in customComponentContext
  externalFormSchema: externalFormSchemaProp,
  externalDocData: externalDocDataProp,
  fieldDisplayConfig,
  customUIAugmentations,
  onTabsConfigChange,
  externalTabsEnabled = false,
  disableAutoTitle = false,
}) => {
  const navigate = useNavigate();
  const { setPageTitle } = useLayout();

  const {
    formSchema, // Used in customComponentContext
    docData, // Used in customComponentContext
    isLoading,
    error: dataError,
  } = useDocumentData(
    doctypeName,
    docname,
    externalFormSchemaProp,
    externalDocDataProp
  );

  // Call all hooks that are always needed at the top
  useDocumentPageTitle(
    docData,
    null,
    docname,
    formSchema,
    doctypeName,
    false,
    "View",
    disableAutoTitle
  );

  const { handleRendererTabsProcessed } = useExternalTabOrchestration(
    externalTabsEnabled,
    onTabsConfigChange
  );

  const generateFallbackLabel = useCallback((fieldname) => {
    return fieldname
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }, []);

  const renderFieldDisplay = useCallback(
    (fieldSchemaItem, currentDocData, _customCtx) => {
      // ... (implementation as before, this is fine)
      if (!fieldSchemaItem || fieldSchemaItem.hidden) return null;
      const { fieldname, fieldtype, label, bold } = fieldSchemaItem;
      const value = currentDocData?.[fieldname];
      const descriptionData = parseDescription(fieldSchemaItem.description);
      if (descriptionData.readVisible === false) return null;
      const { tooltip: labelTooltip, ...otherDescriptionProps } =
        descriptionData;
      const schemaDrivenDisplayProps = otherDescriptionProps;
      const viewerSpecificProps = fieldDisplayConfig?.[fieldname] || {};
      const effectiveDisplayProps = {
        ...schemaDrivenDisplayProps,
        ...viewerSpecificProps,
      };
      const fieldTypeConfig = getFieldConfig(fieldtype, fieldname);
      let displayValue;
      if (fieldtype === "Heading") {
        displayValue = (
          <span className="text-lg font-semibold">
            {label || generateFallbackLabel(fieldname)}
          </span>
        );
      } else if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
      ) {
        displayValue = (
          <span className="text-text-color-secondary italic text-sm">
            Not set
          </span>
        );
      } else if (fieldtype === "Text Editor") {
        displayValue = (
          <div
            className="prose max-w-full text-text-color text-sm"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        );
      } else if (fieldTypeConfig.tableBodyComponent) {
        let extendedDisplayProps = { ...effectiveDisplayProps };
        if (fieldtype === "Attach Image") {
          extendedDisplayProps.imageWidth =
            effectiveDisplayProps.imageWidth || "150";
          extendedDisplayProps.imageClassName =
            effectiveDisplayProps.imageClassName ||
            "object-contain rounded-md border border-surface-border shadow-sm max-h-48";
          extendedDisplayProps.asAvatar =
            effectiveDisplayProps.asAvatar ?? false;
        }
        displayValue = fieldTypeConfig.tableBodyComponent(
          currentDocData,
          fieldname,
          extendedDisplayProps,
          _formatters
        );
      } else {
        displayValue = <span className="text-sm">{String(value)}</span>;
      }
      const showLabel = descriptionData.hideLabel !== true;
      const asideLayout = descriptionData.aside;
      const finalLabel = label || generateFallbackLabel(fieldname);
      const labelElement = showLabel && (
        <div
          className={`text-xs font-medium text-text-color-secondary uppercase tracking-wider ${
            asideLayout
              ? asideLayout === "left"
                ? "mr-2"
                : "ml-2"
              : "mb-1 block"
          } ${bold ? "font-bold" : ""}`}
          title={labelTooltip || fieldSchemaItem.label}
        >
          {finalLabel}
        </div>
      );
      if (asideLayout) {
        return (
          <div className="py-1 flex items-center">
            {asideLayout === "left" && labelElement}
            <div className="text-text-color text-sm break-words min-w-0 flex-1">
              {displayValue}
            </div>
            {asideLayout === "right" && labelElement}
          </div>
        );
      }
      return (
        <div className="py-1">
          {labelElement}
          <div className="text-text-color text-sm break-words">
            {displayValue}
          </div>
        </div>
      );
    },
    [fieldDisplayConfig, generateFallbackLabel]
  );

  // MOVED customComponentContext useMemo call BEFORE early returns
  const customComponentContext = useMemo(
    () => ({
      docname,
      doctypeName,
      docData, // docData might be undefined initially, but that's okay for the context value
      formSchema, // formSchema might be undefined initially
      navigate,
      setPageTitle,
    }),
    [docname, doctypeName, docData, formSchema, navigate, setPageTitle]
  );

  // Now the conditional returns
  if (isLoading) {
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
        text={dataError.message || "Could not load document or schema."}
        className="m-4"
      />
    );
  }

  if (!formSchema) {
    // Even if formSchema is null here, customComponentContext has already been created
    // with formSchema as potentially undefined.
    return (
      <Message
        severity="warn"
        text="Form schema is not available."
        className="m-4"
      />
    );
  }

  if (docname && !docData) {
    // Even if docData is null here, customComponentContext has already been created
    return (
      <Message
        severity="warn"
        text={`Document data for ${docname} is not available.`}
        className="m-4"
      />
    );
  }

  return (
    <Card
      className="mt-4 bg-transparent shadow-none overflow-hidden"
      pt={{ content: { className: "p-0 " } }}
    >
      {docData || !docname ? (
        <DocLayoutRenderer
          formSchema={formSchema}
          allFieldsSchema={formSchema.fields}
          renderFieldItem={renderFieldDisplay}
          customUIAugmentations={customUIAugmentations}
          docData={docData}
          customComponentContext={customComponentContext} // Now customComponentContext is always defined
          enableRouting={true}
          onTabsProcessed={
            externalTabsEnabled ? handleRendererTabsProcessed : undefined
          }
          hideInternalTabViewHeader={externalTabsEnabled}
        />
      ) : (
        <Message
          severity="info"
          text="Document content cannot be displayed."
          className="m-4"
        />
      )}
    </Card>
  );
};

DocViewer.defaultProps = {
  customUIAugmentations: null,
  onTabsConfigChange: null,
  externalTabsEnabled: false,
  fieldDisplayConfig: {},
};

export default DocViewer;
