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
import { getFieldConfig } from "@/utils/FieldManager.jsx"; // Ensure this path is correct
import * as _formatters from "@/utils/formatters.jsx"; // Ensure this path is correct
import { useLayout } from "@/contexts/LayoutContext.jsx"; // Ensure this path is correct
import UniversalLayoutRenderer from "./UniversalLayoutRenderer"; // Path to your updated renderer
import { parseDescription } from "@/utils/schemaUtils"; // Ensure this path is correct

const UniversalDocViewer = ({
  doctypeName,
  docname,
  externalFormSchema,
  externalDocData,
  onEdit,
  onBack,
  listPageUrl,
  fieldDisplayConfig,
  customUIAugmentations, // <<<< NEW PROP for custom tabs and content
}) => {
  const navigate = useNavigate();
  const { setPageTitle } = useLayout();
  const [activeTabIndex, setActiveTabIndex] = useState(0);

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

  const internalOnBack = () => {
    if (onBack) {
      onBack();
    } else if (listPageUrl) {
      navigate(listPageUrl);
    } else {
      navigate(-1);
    }
  };

  const internalOnEdit = () => {
    if (onEdit && docname) {
      // Ensure docname exists for editing
      onEdit(doctypeName, docname);
    }
  };
  

  const {
    data: docDataInternal,
    isLoading: isLoadingDoc,
    error: docError,
  } = useFrappeGetDoc(doctypeName, docname, {
    fields: ["*"], // Fetch all fields for viewer and potential custom components
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
    // UniversalLayoutRenderer will pass fieldSchema and docData.
    // We can use docData from closure, or the one passed as argument.
    // For simplicity, this implementation continues to use docData from closure.
    (fieldSchema, _docDataFromRendererIgnored) => {
      if (!fieldSchema || fieldSchema.hidden) return null;

      const { fieldname, fieldtype, label, bold } = fieldSchema;
      const value = docData?.[fieldname];

      const descriptionData = parseDescription(fieldSchema.description);

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
        // Assuming tableBodyComponent is your viewer component
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
            title={labelTooltip || fieldSchema.label} // Use labelTooltip or default to field label
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
    [docData, fieldDisplayConfig] // Added allFieldsSchema if getFieldConfig depends on it or if it's dynamic
    // parseDescription should be pure or memoized if it's expensive
  );

  const renderLayout = () => {
    if (!formSchema || !formSchema.fields || !docData) {
      // Ensure docData is also available for context
      return (
        <Message
          severity="warn"
          text="Form layout, fields definition, or document data is missing."
          className="m-4"
        />
      );
    }

    // <<<< CREATE CUSTOM COMPONENT CONTEXT >>>>
    const customComponentContext = {
      docname,
      doctypeName,
      docData, // Provide full docData
      formSchema, // Provide full formSchema
      navigate, // Provide navigate if custom components need routing
      setPageTitle, // Provide setPageTitle if custom components need to alter page title
      // You can add more context as needed, e.g., currentUser, specific API callers
    };

    return (
      <UniversalLayoutRenderer
        formSchema={formSchema}
        allFieldsSchema={formSchema.fields} // Pass all field definitions
        renderFieldItem={renderFieldDisplay}
        initialActiveTabIndex={activeTabIndex}
        onTabChangeCallback={(e) => setActiveTabIndex(e.index)}
        // <<<< PASS NEW PROPS TO RENDERER >>>>
        customUIAugmentations={customUIAugmentations}
        docData={docData} // Pass docData for custom components and schema field rendering
        customComponentContext={customComponentContext}
        // Pass through any styling props if UniversalDocViewer controls them
        // bubbleStyle={true} // Example
        // tabViewBackgroundColor="transparent" // Example
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
    // Refined loading/error states for clarity
    if (!formSchema && !schemaError)
      return (
        <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
          <ProgressSpinner /> {/* Still loading schema */}
        </div>
      );
    if (docname && !docData && !docError)
      return (
        <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
          <ProgressSpinner /> {/* Still loading doc */}
        </div>
      );
    if (docname && docError && !docData)
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
        text="Document data or schema is not available to render."
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
          content: { className: "p-0" },
        }}
      >
        {renderLayout()}
      </Card>
    </>
  );
};

UniversalDocViewer.defaultProps = {
  // <<<< Add default prop for customUIAugmentations
  customUIAugmentations: null, // Or: { additionalTabs: [], injectIntoTabs: [] }
};

export default UniversalDocViewer;
