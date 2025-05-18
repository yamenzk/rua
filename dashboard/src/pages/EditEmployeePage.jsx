// dashboard/src/pages/EditEmployeePage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useFrappeGetDoc,
  useFrappeUpdateDoc,
  useFrappeCreateDoc,
  useFrappeGetCall,
  useFrappePostCall, // For search_link
  FrappeContext, // To get the raw `call` method if needed, though hooks are preferred
} from "frappe-react-sdk";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { Panel } from "primereact/panel";
import { TabView, TabPanel } from "primereact/tabview";
import { AutoComplete } from "primereact/autocomplete";
import { Divider } from "primereact/divider";

import AppBreadcrumb from "@/components/common/AppBreadcrumb.jsx";
import { useLayout } from "@/contexts/LayoutContext.jsx";
import { getFieldConfig } from "@/utils/FieldManager.jsx";
import * as _formatters from "@/utils/formatters.jsx";
import { RUA_EMPLOYEE_DOCTYPE } from "@/constants"; // Assuming you created this

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
        field.default_value_parsed !== null
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
      }
    }
  });
  return formData;
};

const EditEmployeePage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { setLayoutConfig } = useLayout();
  const toast = useRef(null);
  const isCreateMode = !employeeId;

  const {
    data: apiResponse,
    isLoading: isLoadingSchema,
    error: schemaError,
  } = useFrappeGetCall(
    "rua.apiv2.get_doctype_form_schema",
    { doctype_name: RUA_EMPLOYEE_DOCTYPE.name },
    // SWR key:
    `doctype_schema_${RUA_EMPLOYEE_DOCTYPE.name}`
  );
  const formSchema = apiResponse?.message;

  const {
    data: employeeData,
    isLoading: isLoadingDoc,
    error: docError,
    mutate: mutateDoc,
  } = useFrappeGetDoc(
    RUA_EMPLOYEE_DOCTYPE.name,
    employeeId,
    { fields: ["*"], enabled: !isCreateMode && !!formSchema } // only fetch if not create and schema is loaded
  );

  const {
    updateDoc,
    loading: isUpdating,
    error: updateErrorHook,
    isCompleted: updateCompleted,
  } = useFrappeUpdateDoc();
  const {
    createDoc,
    loading: isCreating,
    error: createErrorHook,
    isCompleted: createCompleted,
    data: createdDocResponse,
  } = useFrappeCreateDoc();
  const isSaving = isUpdating || isCreating;

  // For search_link using useFrappePostCall
  const { call: searchLinkCall, loading: searchLinkLoading } =
    useFrappePostCall("frappe.desk.search.search_link");

  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [linkSuggestions, setLinkSuggestions] = useState({}); // Stores suggestions for AutoComplete fields
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  useEffect(() => {
    const title = isCreateMode
      ? `New ${formSchema?.label || RUA_EMPLOYEE_DOCTYPE.name}`
      : `Edit: ${
          employeeData?.employee_name || formSchema?.label || employeeId || ""
        }`;
    setLayoutConfig({ title });
  }, [isCreateMode, employeeData, employeeId, formSchema, setLayoutConfig]);

  useEffect(() => {
    if (formSchema?.fields) {
      const initialData = isCreateMode ? {} : employeeData || {};
      setFormData(
        applySchemaDefaults(
          formSchema.fields,
          initialData,
          isCreateMode ? "create" : "edit"
        )
      );
    }
  }, [formSchema, employeeData, isCreateMode]);

  useEffect(() => {
    if (updateCompleted && !updateErrorHook) {
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Employee updated!",
        life: 3000,
      });
      mutateDoc();
    } else if (updateErrorHook) {
      toast.current.show({
        severity: "error",
        summary: "Update Error",
        detail: updateErrorHook.message || "Could not update employee.",
        life: 5000,
      });
    }
  }, [updateCompleted, updateErrorHook, mutateDoc]);

  useEffect(() => {
    if (createCompleted && createdDocResponse && !createErrorHook) {
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Employee created!",
        life: 3000,
      });
      navigate(`/employees/view/${createdDocResponse.name}`);
    } else if (createErrorHook) {
      toast.current.show({
        severity: "error",
        summary: "Create Error",
        detail: createErrorHook.message || "Could not create employee.",
        life: 5000,
      });
    }
  }, [createCompleted, createdDocResponse, createErrorHook, navigate]);

  const handleInputChange = (fieldname, value) => {
    setFormData((prev) => ({ ...prev, [fieldname]: value }));
    if (formErrors[fieldname]) {
      setFormErrors((prev) => ({ ...prev, [fieldname]: null }));
    }
  };

  const validateForm = () => {
    if (!formSchema || !formSchema.fields) return false;
    const errors = {};
    formSchema.fields.forEach((field) => {
      if (
        field.mandatory &&
        (formData[field.fieldname] === undefined ||
          formData[field.fieldname] === null ||
          String(formData[field.fieldname]).trim() === "")
      ) {
        errors[field.fieldname] = `${field.label} is required.`;
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
    try {
      if (isCreateMode) {
        await createDoc(RUA_EMPLOYEE_DOCTYPE.name, formData);
      } else {
        await updateDoc(RUA_EMPLOYEE_DOCTYPE.name, employeeId, formData);
      }
    } catch (e) {
      // Error is already caught and displayed by the useEffect hooks for createErrorHook/updateErrorHook
      console.error("Submit error (already handled by hook):", e);
    }
  };

  const handleLinkSearch = useCallback(
    async (event, linkedDoctype) => {
      if (!linkedDoctype) return;
      try {
        const response = await searchLinkCall({
          // Using the call function from useFrappePostCall
          doctype: linkedDoctype,
          txt: event.query,
          page_length: 20,
        });
        // Assuming response.message contains the results for search_link
        setLinkSuggestions((prev) => ({
          ...prev,
          [linkedDoctype]: response.message || [],
        }));
      } catch (error) {
        console.error(`Error fetching options for ${linkedDoctype}:`, error);
        setLinkSuggestions((prev) => ({ ...prev, [linkedDoctype]: [] }));
        toast.current.show({
          severity: "error",
          summary: `Search Error`,
          detail: `Could not fetch ${linkedDoctype} options.`,
          life: 3000,
        });
      }
    },
    [searchLinkCall]
  );

  const renderFormField = (fieldSchemaFromFieldsArray) => {
    if (!fieldSchemaFromFieldsArray) return null;

    const {
      fieldname,
      fieldtype,
      label,
      read_only,
      hidden,
      set_only_once,
      non_negative,
      bold,
      mandatory, // Destructure to prevent spreading
      ...otherSchemaProps
    } = fieldSchemaFromFieldsArray;

    if (hidden) return null;

    const config = getFieldConfig(fieldtype, fieldname);
    if (!config.formComponent) {
      return (
        <div key={fieldname} className="p-field my-3">
          Unsupported field: {label} ({fieldtype})
        </div>
      );
    }

    let ComponentToRender = config.formComponent;
    const isEffectivelyReadOnly = read_only || (set_only_once && !isCreateMode);

    let componentSpecificProps = {};
    const { options: rawOptionsFromSchema, ...filteredSchemaProps } =
      otherSchemaProps;

    if (
      fieldtype === "Currency" ||
      fieldtype === "Int" ||
      fieldtype === "Float" ||
      fieldtype === "Percent"
    ) {
      componentSpecificProps.onValueChange = (e) =>
        handleInputChange(fieldname, e.value);
      if (non_negative) componentSpecificProps.min = 0;
      if (fieldtype === "Currency") {
        componentSpecificProps.mode = "currency";
        componentSpecificProps.currency = "AED";
        componentSpecificProps.locale = "en-AE";
      }
      if (fieldtype === "Percent") componentSpecificProps.suffix = "%";
      if (fieldSchemaFromFieldsArray.precision)
        componentSpecificProps.minFractionDigits =
          componentSpecificProps.maxFractionDigits = parseInt(
            fieldSchemaFromFieldsArray.precision,
            10
          );
      if (fieldtype === "Int") {
        componentSpecificProps.minFractionDigits = 0;
        componentSpecificProps.maxFractionDigits = 0;
      }
    } else if (fieldtype === "Check") {
      componentSpecificProps.checked = !!formData[fieldname];
      componentSpecificProps.onChange = (e) =>
        handleInputChange(fieldname, e.checked ? 1 : 0);
    } else if (
      fieldtype === "Date" ||
      fieldtype === "Datetime" ||
      fieldtype === "Time"
    ) {
      const currentValue = formData[fieldname];
      try {
        componentSpecificProps.value = currentValue
          ? new Date(currentValue)
          : null;
      } catch (e) {
        componentSpecificProps.value = null;
      }

      let serverFormatFunction = _formatters.formatServerDate;
      componentSpecificProps.dateFormat = "dd/mm/yy";

      if (fieldtype === "Datetime") {
        componentSpecificProps.showTime = true;
        componentSpecificProps.showSeconds = true;
        serverFormatFunction = _formatters.formatServerDateTime;
      } else if (fieldtype === "Time") {
        componentSpecificProps.timeOnly = true;
        componentSpecificProps.showSeconds = true;
        serverFormatFunction = _formatters.formatServerTime;
        delete componentSpecificProps.dateFormat;
      }
      componentSpecificProps.onChange = (e) =>
        handleInputChange(
          fieldname,
          e.value ? serverFormatFunction(e.value) : null
        );
    } else if (fieldtype === "Select") {
      componentSpecificProps.options =
        filteredSchemaProps.select_options_data || [];
      componentSpecificProps.onChange = (e) =>
        handleInputChange(fieldname, e.value);
    } else if (fieldtype === "Link") {
      ComponentToRender = AutoComplete;
      componentSpecificProps.suggestions =
        linkSuggestions[filteredSchemaProps.options] || []; // Use filteredSchemaProps.options as doctype key
      componentSpecificProps.completeMethod = (e) =>
        handleLinkSearch(e, filteredSchemaProps.options); // Pass linked doctype name
      componentSpecificProps.dropdown = true;
      componentSpecificProps.forceSelection = false; // Allow non-selected values initially if needed
      componentSpecificProps.field = "name"; // Assuming search_link returns objects with a 'name' or 'value' field
      componentSpecificProps.onChange = (e) =>
        handleInputChange(fieldname, e.value); // e.value is the selected string (docname)
    } else if (fieldtype === "Text Editor") {
      componentSpecificProps.onTextChange = (e) =>
        handleInputChange(fieldname, e.htmlValue);
      componentSpecificProps.style = { height: "200px" };
    } else {
      componentSpecificProps.onChange = (e) =>
        handleInputChange(fieldname, e.target.value);
    }

    return (
      <div key={fieldname} className="field col-12 mb-4">
        {" "}
        {/* Default to full width, layout controls columns */}
        <label
          htmlFor={fieldname}
          className={`block text-sm font-medium text-text-color-secondary mb-1 ${
            bold ? "font-bold" : ""
          }`}
        >
          {label} {mandatory && <span className="text-red-500">*</span>}
        </label>
        <ComponentToRender
          id={fieldname}
          value={formData[fieldname] ?? (fieldtype === "Check" ? false : "")}
          disabled={isEffectivelyReadOnly}
          placeholder={filteredSchemaProps.placeholder || `Enter ${label}`}
          className="w-full" // Ensure PrimeReact components take full width of their container
          tooltip={filteredSchemaProps.description}
          tooltipOptions={{ position: "top" }}
          {...filteredSchemaProps} // Spread schema props (without options, non_negative, bold, mandatory)
          {...componentSpecificProps} // Override with specific handlers/props
        />
        {formErrors[fieldname] && (
          <small className="p-error block mt-1">{formErrors[fieldname]}</small>
        )}
      </div>
    );
  };

  const buildLayout = (layoutElements, allFields) => {
    if (!layoutElements || layoutElements.length === 0) {
      return (
        <div className="grid">
          <div className="col-12 md:col-6 lg:col-4 xl:col-3">
            {allFields
              .filter((f) => !f.hidden)
              .map((fieldSchema) => renderFormField(fieldSchema))}
          </div>
        </div>
      );
    }

    const tabs = [];
    let currentTabElements = [];
    let currentTabLabel = formSchema?.label || "Details";

    layoutElements.forEach((element) => {
      if (element.type === "TabBreak") {
        if (currentTabElements.length > 0) {
          tabs.push({
            label: currentTabLabel,
            elements: [...currentTabElements],
          });
        }
        currentTabLabel = element.label || `Tab ${tabs.length + 1}`;
        currentTabElements = [];
      } else {
        currentTabElements.push(element);
      }
    });
    if (currentTabElements.length > 0) {
      tabs.push({ label: currentTabLabel, elements: currentTabElements });
    }
    if (tabs.length === 0 && allFields.length > 0) {
      tabs.push({ label: currentTabLabel, elements: layoutElements });
    }

    return (
      <TabView
        activeIndex={activeTabIndex}
        onTabChange={(e) => setActiveTabIndex(e.index)}
      >
        {tabs.map((tab, tabIdx) => {
          const columns = [[]]; // Max 2 columns
          let currentColumnIndex = 0;
          let currentSectionFields = null;
          let currentSectionConfig = null;

          tab.elements.forEach((element, elIdx) => {
            if (element.type === "ColumnBreak") {
              if (currentSectionFields) {
                // Finalize pending section before column break
                columns[currentColumnIndex].push(
                  <Panel
                    key={
                      currentSectionConfig.fieldname ||
                      `section-pending-${elIdx}`
                    }
                    header={currentSectionConfig.label}
                    toggleable={currentSectionConfig.collapsible}
                    collapsed={currentSectionConfig.collapsible && elIdx > 0}
                  >
                    {currentSectionFields}
                    {currentSectionConfig.description && (
                      <p className="text-xs text-text-color-secondary mt-1">
                        {currentSectionConfig.description}
                      </p>
                    )}
                  </Panel>
                );
                currentSectionFields = null;
                currentSectionConfig = null;
              }
              if (currentColumnIndex < columns.length - 1) currentColumnIndex++; // Move to next column if available
              if (!columns[currentColumnIndex])
                columns[currentColumnIndex] = []; // Initialize new column array
              return;
            }

            if (element.type === "SectionBreak") {
              if (currentSectionFields) {
                // Finalize previous section
                columns[currentColumnIndex].push(
                  <Panel
                    key={
                      currentSectionConfig.fieldname || `section-prev-${elIdx}`
                    }
                    header={currentSectionConfig.label}
                    toggleable={currentSectionConfig.collapsible}
                    collapsed={currentSectionConfig.collapsible && elIdx > 0}
                  >
                    {currentSectionFields}
                    {currentSectionConfig.description && (
                      <p className="text-xs text-text-color-secondary mt-1">
                        {currentSectionConfig.description}
                      </p>
                    )}
                  </Panel>
                );
              }
              currentSectionConfig = element;
              currentSectionFields = []; // Start new section's field collection
            } else {
              const fieldSchema = allFields.find(
                (f) => f.fieldname === element.fieldname
              );
              if (fieldSchema && !fieldSchema.hidden) {
                const renderedField = renderFormField(fieldSchema);
                if (currentSectionFields !== null) {
                  // If inside a section
                  currentSectionFields.push(renderedField);
                } else {
                  // Not in a section, add directly to current column
                  columns[currentColumnIndex].push(renderedField);
                }
              }
            }
          });
          if (currentSectionFields) {
            // Finalize any last open section
            columns[currentColumnIndex].push(
              <Panel
                key={currentSectionConfig.fieldname || `section-last`}
                header={currentSectionConfig.label}
                toggleable={currentSectionConfig.collapsible}
                collapsed={
                  currentSectionConfig.collapsible && tab.elements.length > 1
                }
              >
                {currentSectionFields}
                {currentSectionConfig.description && (
                  <p className="text-xs text-text-color-secondary mt-1">
                    {currentSectionConfig.description}
                  </p>
                )}
              </Panel>
            );
          }

          return (
            <TabPanel key={tabIdx} header={tab.label}>
              <div className="grid">
                <div className="col-12 md:col-6 pr-md-2">{columns[0]}</div>
                {columns.length > 1 && columns[1].length > 0 && (
                  <div className="col-12 md:col-6 pl-md-2">{columns[1]}</div>
                )}
              </div>
            </TabPanel>
          );
        })}
      </TabView>
    );
  };

  if (isLoadingSchema || (isLoadingDoc && !isCreateMode)) {
    return (
      <div className="flex justify-center items-center h-full">
        <ProgressSpinner />
      </div>
    );
  }
  if (
    (schemaError && !formSchema) ||
    (docError && !isCreateMode && employeeId)
  ) {
    return (
      <div className="p-card p-5 bg-red-100 text-red-700">
        Error:{" "}
        {schemaError?.message || docError?.message || "Could not load data."}
      </div>
    );
  }
  if (
    !formSchema ||
    !formSchema.fields ||
    !formSchema.layout ||
    !formSchema.layout.elements
  ) {
    return (
      <div className="p-card p-5">
        Form schema is not available or incomplete. Please wait or check API
        response.
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <AppBreadcrumb
        items={[
          { label: "Employees", url: "/employees" },
          {
            label: isCreateMode
              ? "New"
              : employeeData?.employee_name || employeeId || "Edit",
          },
        ]}
        home={{ icon: "pi pi-home", url: "/" }}
      />
      <Card
        title={
          isCreateMode
            ? "Create New Employee"
            : `Edit Employee: ${employeeData?.employee_name || ""}`
        }
        className="mt-4 shadow-lg rounded-xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="p-fluid"
        >
          {buildLayout(formSchema.layout.elements, formSchema.fields)}
          <Divider className="my-6" />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text rounded-lg"
              onClick={() =>
                navigate(
                  isCreateMode ? "/employees" : `/employees/view/${employeeId}`
                )
              }
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
    </>
  );
};

export default EditEmployeePage;
