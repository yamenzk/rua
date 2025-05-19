// src/components/document/UniversalDocViewer.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFrappeGetDoc, useFrappeGetCall } from "frappe-react-sdk";

// PrimeReact Components
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
// TabView, TabPanel, Panel are now handled by UniversalLayoutRenderer
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";

// Custom Utils & Components
import { getFieldConfig } from "@/utils/FieldManager.jsx";
import * as _formatters from "@/utils/formatters.jsx";
import AppBreadcrumb from "@/components/common/AppBreadcrumb.jsx";
import { useLayout } from "@/contexts/LayoutContext.jsx";
import UniversalLayoutRenderer from "./UniversalLayoutRenderer"; // Make sure path is correct

const UniversalDocViewer = ({
  doctypeName,
  docname,
  externalFormSchema,
  externalDocData,
  onEdit,
  onBack,
  listPageUrl,
}) => {
  const navigate = useNavigate();
  const { setLayoutConfig } = useLayout();
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
    setLayoutConfig({ title });
  }, [docData, docname, formSchema, setLayoutConfig, doctypeName]);

  // This function is passed to UniversalLayoutRenderer
  const renderFieldDisplay = useCallback(
    (fieldSchema) => {
      if (!fieldSchema || fieldSchema.hidden) return null;

      const { fieldname, fieldtype, label, bold } = fieldSchema;
      const value = docData?.[fieldname];
      const displayPropsFromSchema = fieldSchema.displayProps || {};
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
        let extendedDisplayProps = { ...displayPropsFromSchema };
        if (fieldtype === "Attach Image") {
          extendedDisplayProps.imageWidth =
            extendedDisplayProps.imageWidth || "150";
          extendedDisplayProps.imageClassName =
            extendedDisplayProps.imageClassName ||
            "object-contain rounded-md border border-surface-border shadow-sm max-h-48";
          extendedDisplayProps.asAvatar = false;
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
            docData, // Pass docData explicitly
            fieldname,
            extendedDisplayProps,
            _formatters
          );
        }
      } else {
        displayValue = <span className="text-sm">{String(value)}</span>;
      }

      return (
        // The UniversalLayoutRenderer wraps this in a div with a key,
        // so this outermost div might be adjusted or removed depending on desired spacing.
        // For now, keeping it to maintain the structure from the original viewer.
        <div className="py-1">
          <div
            className={`block text-xs font-medium text-text-color-secondary uppercase tracking-wider mb-1 ${
              bold ? "font-bold" : ""
            }`}
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
    [docData]
  ); // docData is the main dependency here

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

  let breadcrumbDocName = docData?.name || docname;
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
    for (const field of commonTitleFields) {
      if (docData[field]) {
        breadcrumbDocName = docData[field];
        break;
      }
    }
  }
  const breadcrumbListRoute =
    listPageUrl ||
    `/${
      formSchema?.name?.toLowerCase().replace("rua ", "").replace(/\s+/g, "-") +
        "s" ||
      doctypeName.toLowerCase().replace("rua ", "").replace(/\s+/g, "-") + "s"
    }`;

  const breadcrumbItems = [
    {
      label:
        formSchema?.labelPlural || `${doctypeName.replace("RUA ", "")} List`,
      url: breadcrumbListRoute,
    },
    { label: breadcrumbDocName },
  ];
  const homeBreadcrumb = { icon: "pi pi-home", url: "/" };
  

  return (
    <>
      <AppBreadcrumb items={breadcrumbItems} home={homeBreadcrumb} />
      
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
