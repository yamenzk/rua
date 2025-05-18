// dashboard/src/pages/ViewEmployeePage.jsx
import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useFrappeGetDoc } from "frappe-react-sdk";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Tag } from "primereact/tag";
import { ProgressSpinner } from "primereact/progressspinner";
import { Image as PrimeImage } from "primereact/image";

import AppBreadcrumb from "@/components/common/AppBreadcrumb.jsx";
import { useLayout } from "@/contexts/LayoutContext.jsx";
import { getFieldConfig } from "@/utils/FieldManager.jsx";
import * as formatters from "@/utils/formatters.jsx";
import { RUA_EMPLOYEE_DOCTYPE } from "@/constants"; // We'll create this constants file

// It's good practice to get the doctype schema (field order, labels)
// For now, we'll manually define a display order or use a simplified approach.
// Ideally, you'd fetch doctype meta if you want it to be fully dynamic based on Frappe's field order.
// We'll use the field_order from the RUA Employee JSON for now.

const fieldOrder = [
  "employee_name",
  "image",
  "name",
  "user",
  "position",
  "branch",
  "phone",
  "email",
  "joining_date",
  "date_of_birth",
  "gender",
  "nationality",
  "basic",
  "allowance",
  "salary",
  "test",
  // Add other fields as needed, respecting column breaks for layout
];

// Helper to get label from doctype meta (simplified, ideally from fetched meta)
const getFieldLabel = (fieldname, doctypeSchema) => {
  if (!doctypeSchema || !doctypeSchema.fields) return fieldname; // Fallback
  const field = doctypeSchema.fields.find((f) => f.fieldname === fieldname);
  return field
    ? field.label
    : fieldname.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const ViewEmployeePage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { setLayoutConfig } = useLayout();

  // Fetch RUA Employee Doctype meta for labels and fieldtypes
  // Note: RUA_EMPLOYEE_DOCTYPE.name should be "RUA Employee"
  const { data: employeeDoctypeMeta, isLoading: isLoadingMeta } =
    useFrappeGetDoc("DocType", RUA_EMPLOYEE_DOCTYPE.name);

  const {
    data: employee,
    isLoading: isLoadingDoc,
    error,
  } = useFrappeGetDoc(RUA_EMPLOYEE_DOCTYPE.name, employeeId, {
    fields: ["*"], // Fetch all fields
  });

  useEffect(() => {
    if (employee) {
      setLayoutConfig({
        title: `View Employee: ${employee.employee_name || employeeId}`,
      });
    } else {
      setLayoutConfig({ title: "View Employee" });
    }
  }, [employee, employeeId, setLayoutConfig]);

  const breadcrumbItems = [
    { label: "Employees", url: "/employees" },
    { label: employee?.employee_name || employeeId },
  ];
  const homeBreadcrumb = { icon: "pi pi-home", url: "/" };

  if (isLoadingDoc || isLoadingMeta) {
    return (
      <div className="flex justify-center items-center h-full">
        <ProgressSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-card p-5 bg-red-100 text-red-700">
        Error fetching employee data: {error.message}
      </div>
    );
  }

  if (!employee) {
    return <div className="p-card p-5">Employee not found.</div>;
  }

  const renderField = (fieldname) => {
    const value = employee[fieldname];
    if (value === null || value === undefined || value === "")
      return <span className="text-text-color-secondary italic">Not set</span>;

    const fieldSchema = employeeDoctypeMeta?.fields?.find(
      (f) => f.fieldname === fieldname
    );
    const fieldtype = fieldSchema?.fieldtype || "Data"; // Default to 'Data' if not found in meta

    // Use displayProps from columnConfig if you have a shared config, or define them here
    let displayProps = {};
    if (fieldname === "image") displayProps = { asAvatar: false }; // Prefer larger image here
    if (fieldname === "branch" || fieldname === "gender") {
      displayProps = {
        asChip: true,
        chipRounded: true,
        chipColors:
          fieldname === "branch"
            ? { Main: "info", "Branch 1": "success", "Branch 2": "warning" }
            : undefined,
      };
    }

    const config = getFieldConfig(fieldtype, fieldname);
    if (config.tableBodyComponent) {
      // Reusing tableBodyComponent for view page
      return config.tableBodyComponent(
        employee,
        fieldname,
        displayProps,
        formatters
      );
    }
    return String(value); // Fallback
  };

  const cardHeader = (
    <div className="flex items-center gap-4 p-4 border-b border-surface-border">
      {employee.image ? (
        <PrimeImage
          src={employee.image}
          alt={employee.employee_name}
          width="100"
          height="100"
          imageClassName="rounded-full object-cover"
          preview
        />
      ) : (
        <Avatar
          label={(employee.employee_name || "E").charAt(0)}
          size="xlarge"
          shape="circle"
          className="bg-primary-color text-primary-color-text text-3xl"
        />
      )}
      <div>
        <h2 className="text-2xl font-bold text-text-color">
          {employee.employee_name}
        </h2>
        <p className="text-text-color-secondary">
          {employee.position || "Position not set"}
        </p>
        <Tag value={employee.name} className="mt-1 text-xs" />
      </div>
    </div>
  );

  return (
    <>
      <AppBreadcrumb items={breadcrumbItems} home={homeBreadcrumb} />
      <Card
        header={cardHeader}
        className="mt-4 shadow-lg rounded-xl overflow-hidden"
        pt={{
          content: { className: "p-0" }, // Remove default padding from card content
        }}
      >
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {fieldOrder
            .filter(
              (f) =>
                f !== "image" &&
                f !== "employee_name" &&
                f !== "position" &&
                f !== "name"
            )
            .map((fieldname) => (
              <div key={fieldname} className="flex flex-col">
                <span className="text-sm font-medium text-text-color-secondary mb-1">
                  {getFieldLabel(fieldname, employeeDoctypeMeta)}
                </span>
                <span className="text-text-color text-base">
                  {renderField(fieldname)}
                </span>
              </div>
            ))}
        </div>
        <div className="p-6 border-t border-surface-border flex justify-end gap-2">
          <Button
            label="Back to List"
            icon="pi pi-arrow-left"
            className="p-button-text rounded-lg"
            onClick={() => navigate("/employees")}
          />
          <Button
            label="Edit Employee"
            icon="pi pi-pencil"
            className="p-button-primary rounded-lg"
            onClick={() => navigate(`/employees/edit/${employeeId}`)}
          />
        </div>
      </Card>
    </>
  );
};

export default ViewEmployeePage;
