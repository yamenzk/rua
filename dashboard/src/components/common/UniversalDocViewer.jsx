// src/components/document/UniversalDocViewer.jsx
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

// PrimeReact Components
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

// Custom Hooks & Utils
import { useDocumentData } from "@/hooks/useDocumentData";
import { useDocumentPageTitle } from "@/hooks/useDocumentPageTitle";
import { useExternalTabOrchestration } from "@/hooks/useExternalTabOrchestration";
import { getFieldConfig } from "@/utils/FieldManager.jsx";
import * as _formatters from "@/utils/formatters.jsx";
import { useLayout } from "@/contexts/LayoutContext.jsx";
import UniversalLayoutRenderer from "./UniversalLayoutRenderer";
import { parseDescription } from "@/utils/schemaUtils";

const UniversalDocViewer = ({
  doctypeName,
  docname,
  externalFormSchema: externalFormSchemaProp,
  externalDocData: externalDocDataProp,
  fieldDisplayConfig,
  customUIAugmentations,
  onTabsConfigChange,
  externalTabsEnabled = false,
}) => {
  const navigate = useNavigate();
  const { setPageTitle } = useLayout();

  const {
    formSchema,
    docData,
    isLoading,
    error: dataError,
  } = useDocumentData(
    doctypeName,
    docname,
    externalFormSchemaProp,
    externalDocDataProp
  );

  useDocumentPageTitle(
    docData,
    null,
    docname,
    formSchema,
    doctypeName,
    false,
    "View"
  );

  const { handleRendererTabsProcessed } = useExternalTabOrchestration(
    externalTabsEnabled,
    onTabsConfigChange
  );

  const renderFieldDisplay = useCallback(
    (fieldSchemaItem, currentDocData, _customCtx) => {
      if (!fieldSchemaItem || fieldSchemaItem.hidden) return null;
      const { fieldname, fieldtype, label, bold } = fieldSchemaItem;
      const value = currentDocData?.[fieldname];
      const descriptionData = parseDescription(fieldSchemaItem.description);
      const { tooltip: labelTooltip, ...otherDescriptionProps } =
        descriptionData;
      const schemaDrivenDisplayProps = otherDescriptionProps;
      const viewerSpecificProps = fieldDisplayConfig?.[fieldname] || {};
      const effectiveDisplayProps = {
        ...schemaDrivenDisplayProps,
        ...viewerSpecificProps,
      };
      const config = getFieldConfig(fieldtype, fieldname);
      let displayValue;

      if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
      ) {
        displayValue = (
          <span className="text-text-color-secondary italic text-sm">
            Not set
          </span>
        );
      } else if (config.tableBodyComponent) {
        let extendedDisplayProps = { ...effectiveDisplayProps };
        if (fieldtype === "Attach Image") {
          extendedDisplayProps.imageWidth =
            extendedDisplayProps.imageWidth ||
            descriptionData.imageWidth ||
            "150";
          extendedDisplayProps.imageClassName =
            extendedDisplayProps.imageClassName ||
            descriptionData.imageClassName ||
            "object-contain rounded-md border border-surface-border shadow-sm max-h-48";
          extendedDisplayProps.asAvatar =
            effectiveDisplayProps.asAvatar ?? false;
        }
        if (fieldtype === "Text Editor") {
          displayValue = (
            <div
              className="prose max-w-full text-text-color text-sm"
              dangerouslySetInnerHTML={{ __html: value }}
            />
          );
        } else {
          displayValue = config.tableBodyComponent(
            docData,
            fieldname,
            extendedDisplayProps,
            _formatters
          );
        }
      } else {
        displayValue = <span className="text-sm">{String(value)}</span>;
      }
      return (
        <div className="py-1">
          <div
            className={`block text-xs font-medium text-text-color-secondary uppercase tracking-wider mb-1 ${
              bold ? "font-bold" : ""
            }`}
            title={labelTooltip || fieldSchemaItem.label}
          >
            {label ||
              fieldname
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
          </div>
          <div className="text-text-color text-sm break-words">
            {displayValue}
          </div>
        </div>
      );
    },
    [docData, fieldDisplayConfig]
  );

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
    return (
      <Message
        severity="warn"
        text="Form schema is not available."
        className="m-4"
      />
    );
  }
  if (docname && !docData) {
    return (
      <Message
        severity="warn"
        text={`Document data for ${docname} is not available.`}
        className="m-4"
      />
    );
  }

  const customComponentContext = {
    docname,
    doctypeName,
    docData,
    formSchema,
    navigate,
    setPageTitle,
  };

  // Remove the problematic setState call during render
  // The activeTabIndex is now handled entirely by useExternalTabOrchestration
  // which communicates with the parent via onTabsConfigChange

  return (
    <Card
      className="mt-4 bg-transparent shadow-none overflow-hidden"
      pt={{ content: { className: "p-0" } }}
    >
      {docData || !docname ? (
        <UniversalLayoutRenderer
          formSchema={formSchema}
          allFieldsSchema={formSchema.fields}
          renderFieldItem={renderFieldDisplay}
          customUIAugmentations={customUIAugmentations}
          docData={docData}
          customComponentContext={customComponentContext}
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

UniversalDocViewer.defaultProps = {
  customUIAugmentations: null,
  onTabsConfigChange: null,
  externalTabsEnabled: false,
  fieldDisplayConfig: {},
};

export default UniversalDocViewer;
