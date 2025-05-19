// src/components/document/UniversalDocViewer.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFrappeGetDoc, useFrappeGetCall } from "frappe-react-sdk";

// PrimeReact Components
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

// Custom Utils & Components
import { getFieldConfig } from "@/utils/FieldManager.jsx";
import * as _formatters from "@/utils/formatters.jsx";
import { useLayout } from "@/contexts/LayoutContext.jsx";
import UniversalLayoutRenderer from "./UniversalLayoutRenderer"; // Make sure path is correct
import { parseDescription } from "@/utils/schemaUtils";

const UniversalDocViewer = ({
  doctypeName,
  docname,
  externalFormSchema,
  externalDocData,
  onEdit,
  onBack,
  listPageUrl,
  fieldDisplayConfig,
}) => {
  const navigate = useNavigate();
  const { setPageTitle } = useLayout();
  const [activeTabIndex, setActiveTabIndex] = useState(0); // Can be controlled by UniversalLayoutRenderer too

  const {
    data: schemaApiResponse,
    isLoading: isLoadingSchema,
    error: schemaError,
  } = useFrappeGetCall(
    "rua.apiv2.get_doctype_form_schema",
    { doctype_name: doctypeName },
    `doctype_schema_${doctypeName}`,
    { enabled: !externalFormSchema }
  );
  const formSchema = externalFormSchema || schemaApiResponse?.message;

  const {
    data: docDataInternal,
    isLoading: isLoadingDoc,
    error: docError,
  } = useFrappeGetDoc(doctypeName, docname, {
    fields: ["*"],
    enabled: !externalDocData && !!docname && !!formSchema,
  });
  const docData = externalDocData || docDataInternal;

  useEffect(() => {
    let displayTitle = docData?.name || docname;
    if (docData && formSchema?.fields) {
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
        if (docData[fieldName]) {
          displayTitle = docData[fieldName];
          break;
        }
      }
    }
    const title = `View ${formSchema?.label || doctypeName}: ${displayTitle}`;
    setPageTitle(title);
  }, [docData, docname, formSchema, setPageTitle, doctypeName]);

  const renderFieldDisplay = useCallback(
    (fieldSchema) => {
      if (!fieldSchema || fieldSchema.hidden) return null;

      const { fieldname, fieldtype, label, bold } = fieldSchema;
      const value = docData?.[fieldname];

      const descriptionData = parseDescription(fieldSchema.description); // <<< ADD THIS

      const { tooltip: labelTooltip, ...otherDescriptionProps } =
        descriptionData;
      const schemaDrivenDisplayProps = otherDescriptionProps;

      // Viewer-specific overrides from the component's props
      const viewerSpecificProps = fieldDisplayConfig?.[fieldname] || {};

      // Merge them: viewerSpecificProps can override schemaDrivenDisplayProps
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
            "150"; // Allow description to set default
          extendedDisplayProps.imageClassName =
            extendedDisplayProps.imageClassName ||
            descriptionData.imageClassName || // Allow description to set default
            "object-contain rounded-md border border-surface-border shadow-sm max-h-48";
          extendedDisplayProps.asAvatar =
            effectiveDisplayProps.asAvatar ?? false; // Respect effectiveDisplayProps
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
            extendedDisplayProps, // Pass the combined display props
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
            title={descriptionData.tooltip} // <<< ADD TOOLTIP TO LABEL
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
    [docData, fieldDisplayConfig] // Add parseDescription or its utility if it's not pure
  );

  const renderLayout = () => {
    // Basic check before passing to the layout renderer
    if (!formSchema || !formSchema.fields) {
      return (
        <Message
          severity="warn"
          text="Form layout or fields definition is missing in schema."
          className="m-4"
        />
      );
    }

    return (
      <UniversalLayoutRenderer
        formSchema={formSchema}
        allFieldsSchema={formSchema.fields}
        renderFieldItem={renderFieldDisplay}
        initialActiveTabIndex={activeTabIndex}
        onTabChangeCallback={(e) => setActiveTabIndex(e.index)}
      />
    );
  };

  const isLoading =
    isLoadingSchema || (isLoadingDoc && !externalDocData && !!docname);
  const dataError = schemaError || (docError && !externalDocData && !!docname);

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
  if (!formSchema || !docData) {
    if (docname && !docData && !docError)
      return (
        <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
          <ProgressSpinner /> {/* Still loading doc */}
        </div>
      );
    if (docname && docError)
      return (
        <Message
          severity="error"
          text={`Document ${docname} not found or error loading: ${docError.message}`}
          className="m-4"
        />
      );
    return (
      <Message
        severity="warn"
        text="Document data or schema is not available."
        className="m-4"
      />
    );
  }

  return (
    <>
      <Card
        className="mt-4 bg-transparent shadow-none overflow-hidden"
        pt={{
          title: {
            className:
              "text-xl font-semibold text-text-color px-4 md:px-6 pt-5 pb-0",
          },
          content: { className: "p-0" }, // UniversalLayoutRenderer's TabPanel will handle padding
        }}
      >
        {renderLayout()}

        <div className="flex justify-end gap-2 px-4 md:px-6 pb-5 pt-1">
          {onBack ? (
            <Button
              type="button"
              label="Back"
              icon="pi pi-arrow-left"
              className="p-button-text rounded-lg"
              onClick={onBack}
            />
          ) : listPageUrl ? (
            <Button
              type="button"
              label="Back to List"
              icon="pi pi-arrow-left"
              className="p-button-text rounded-lg"
              onClick={() => navigate(listPageUrl)}
            />
          ) : null}
          {onEdit && docname && (
            <Button
              type="button"
              label="Edit"
              icon="pi pi-pencil"
              className="p-button-primary rounded-lg"
              onClick={() => onEdit(doctypeName, docname)}
            />
          )}
        </div>
      </Card>
    </>
  );
};

export default UniversalDocViewer;
