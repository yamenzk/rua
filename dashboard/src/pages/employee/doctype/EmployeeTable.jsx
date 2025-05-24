// dashboard/src/pages/employee/doctype/EmployeeTable.jsx - Updated with audit fields
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useFrappeGetDocList,
  useFrappeDeleteDoc,
  useFrappeGetCall,
} from "frappe-react-sdk";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { RUA_EMPLOYEE_DOCTYPE } from "@/constants";

import DynamicDataTable from "@/components/table/DynamicDataTable";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import nationalities from "@/utils/nationalities.json";
import { transformSchemaToColumnConfig } from "@/components/document/utils/schemaToColumns";

const EmployeeTable = () => {
  const navigate = useNavigate();
  const toast = useRef(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);


  // Fetch the form schema for RUA Employee
  const {
    data: schemaApiResponse,
    isLoading: isLoadingSchema,
    error: schemaError,
  } = useFrappeGetCall(
    "rua.apiv2.get_doctype_form_schema",
    { doctype_name: RUA_EMPLOYEE_DOCTYPE.name },
    `doctype_schema_${RUA_EMPLOYEE_DOCTYPE.name}`
  );
  const formSchema = schemaApiResponse?.message;

  const { deleteDoc, loading: deleteLoading } = useFrappeDeleteDoc();

  const employeeColumnsConfig = useMemo(() => {
    if (!formSchema) return [];

    const customArgs = {
      includeAuditFields: true, // Enable audit fields
    };
    return transformSchemaToColumnConfig(formSchema, customArgs);
  }, [formSchema]);

  const globalFilterFields = useMemo(() => {
    if (!formSchema || !formSchema.fields)
      return ["name", "employee_name", "position", "email", "phone", "branch"];

    const gfs = formSchema.fields
      .filter((f) => f.in_global_search === true)
      .map((f) => f.fieldname);

    // Add audit fields to global search
    const auditSearchFields = ["owner", "modified_by"];
    return gfs.length > 0
      ? [...gfs, ...auditSearchFields]
      : ["name", "employee_name", ...auditSearchFields];
  }, [formSchema]);

  const handleRowClick = (rowData) => {
    navigate(`/employees/view/${rowData.name}`);
  };

  const handleEditEmployee = (rowData) => {
    navigate(`/employees/edit/${rowData.name}`);
  };

  const handleDeleteEmployee = (rowData) => {
    setEmployeeToDelete(rowData);
    setShowDeleteDialog(true);
  };

  const confirmDeleteEmployee = async () => {
    if (employeeToDelete) {
      try {
        await deleteDoc(RUA_EMPLOYEE_DOCTYPE.name, employeeToDelete.name);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Employee deleted successfully",
          life: 3000,
        });
      } catch (e) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: `Failed to delete employee: ${e.message || "Unknown error"}`,
          life: 5000,
        });
      } finally {
        setShowDeleteDialog(false);
        setEmployeeToDelete(null);
      }
    }
  };

  const contextMenuItemsModel = useMemo(
    () => [
      {
        label: "View",
        icon: "pi pi-fw pi-search",
        command: () => employeeToDelete && handleRowClick(employeeToDelete),
      },
      {
        label: "Edit",
        icon: "pi pi-fw pi-pencil",
        command: () => employeeToDelete && handleEditEmployee(employeeToDelete),
      },
      { separator: true },
      {
        label: "Delete",
        icon: "pi pi-fw pi-times",
        command: () =>
          employeeToDelete && handleDeleteEmployee(employeeToDelete),
      },
    ],
    [employeeToDelete, handleRowClick, handleEditEmployee, handleDeleteEmployee]
  );

  const headerActions = (
    <Button
      label="New"
      icon="pi pi-plus"
      className="p-button-sm rounded-lg"
      onClick={() => {
        navigate(`/${RUA_EMPLOYEE_DOCTYPE.route}/new`);
      }}
    />
  );

  if (isLoadingSchema) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-20rem)]">
        <ProgressSpinner />
      </div>
    );
  }

  if (schemaError) {
    return (
      <div className="p-card p-4 m-4 rounded-lg bg-red-100 border border-red-400 text-red-700">
        <p className="font-bold">
          Error loading schema for {RUA_EMPLOYEE_DOCTYPE.name}:
        </p>
        <p>{schemaError.message || JSON.stringify(schemaError)}</p>
      </div>
    );
  }

  if (!formSchema || employeeColumnsConfig.length === 0) {
    return (
      <div className="p-card p-4 m-4 rounded-lg">
        <p>
          No columns configured for display. Please check the DocType schema
          configuration for '{RUA_EMPLOYEE_DOCTYPE.name}'.
        </p>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <DynamicDataTable
        doctype={RUA_EMPLOYEE_DOCTYPE.name}
        title={`${RUA_EMPLOYEE_DOCTYPE.title}s`}
        uniqueTableKey={`rua_employee_list_${RUA_EMPLOYEE_DOCTYPE.name}`}
        columnsConfig={employeeColumnsConfig}
        onRowClick={handleRowClick}
        contextMenuItemsModel={contextMenuItemsModel}
        globalFilterFields={globalFilterFields}
        // headerActions={headerActions}
        dataKey="name"
      />
      <ConfirmDialog
        visible={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        onConfirm={confirmDeleteEmployee}
        header="Delete Employee"
        message={`Are you sure you want to delete ${
          employeeToDelete?.employee_name || "this employee"
        }? This action cannot be undone.`}
        confirmationText={employeeToDelete?.name}
        confirmButtonLabel="Delete"
        confirmButtonIcon="pi pi-trash"
        loading={deleteLoading}
      />
    </>
  );
};

export default EmployeeTable;
