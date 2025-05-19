// dashboard/src/components/employees/EmployeeTable.jsx
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
import { RUA_EMPLOYEE_DOCTYPE } from "@/constants"; //

import DynamicDataTable from "@/components/common/DynamicDataTable"; //
import ConfirmDialog from "@/components/common/ConfirmDialog"; //
import nationalities from "@/utils/nationalities.json"; //
import { transformSchemaToColumnConfig } from "@/utils/schemaToColumns"; //

const EmployeeTable = () => {
  const navigate = useNavigate();
  const toast = useRef(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // For Link field filters - e.g., User
  const { data: usersList } = useFrappeGetDocList("User", {
    fields: ["name", "full_name"],
    limit: 0, // Fetch all users for filter dropdown
  });

  const userOptions = useMemo(() => {
    return usersList
      ? usersList.map((u) => ({ label: u.full_name || u.name, value: u.name }))
      : [];
  }, [usersList]);

  const nationalityOptions = useMemo(() => {
    return nationalities.map((n) => ({
      label: `${n.flag} ${n.name}`,
      value: n.name,
    }));
  }, []);

  // Fetch the form schema for RUA Employee
  const {
    data: schemaApiResponse,
    isLoading: isLoadingSchema,
    error: schemaError,
  } = useFrappeGetCall(
    "rua.apiv2.get_doctype_form_schema", //
    { doctype_name: RUA_EMPLOYEE_DOCTYPE.name }, //
    `doctype_schema_${RUA_EMPLOYEE_DOCTYPE.name}` //
  );
  const formSchema = schemaApiResponse?.message;

  const { deleteDoc, loading: deleteLoading } = useFrappeDeleteDoc();

  // Using separate useEffect for delete operation feedback to avoid conflicts
  useEffect(() => {
    // This useEffect is just for observing delete operation.
    // Actual delete success/error is handled by the deleteDoc promise in confirmDeleteEmployee
  }, []);

  const employeeColumnsConfig = useMemo(() => {
    if (!formSchema) return [];

    const customArgs = {
      linkFieldFilterOptions: {
        User: userOptions,
      },
      // Pass nationalityOptions to be used for a 'Select' field with fieldname 'nationality'
      // This assumes transformSchemaToColumnConfig uses selectOverrides for such cases.
      selectOverrides: {
        nationality: nationalityOptions,
      },
    };
    return transformSchemaToColumnConfig(formSchema, customArgs); //
  }, [formSchema, userOptions, nationalityOptions]);

  const globalFilterFields = useMemo(() => {
    if (!formSchema || !formSchema.fields)
      return ["name", "employee_name", "position", "email", "phone", "branch"]; // Default

    const gfs = formSchema.fields
      .filter((f) => f.in_global_search === true)
      .map((f) => f.fieldname);
    return gfs.length > 0 ? gfs : ["name", "employee_name"]; // Ensure some defaults if none are marked
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
        await deleteDoc(RUA_EMPLOYEE_DOCTYPE.name, employeeToDelete.name); //
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
    [employeeToDelete, handleRowClick, handleEditEmployee, handleDeleteEmployee] // Added dependencies
  );

  const headerActions = (
    <Button
      label="New Employee"
      icon="pi pi-plus"
      className="p-button-sm rounded-lg"
      onClick={() => {
        navigate(`/${RUA_EMPLOYEE_DOCTYPE.route}/new`); //
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
          Error loading schema for {RUA_EMPLOYEE_DOCTYPE.name}: {/* */}
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
          configuration for '{RUA_EMPLOYEE_DOCTYPE.name}'. {/* */}
        </p>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <DynamicDataTable
        doctype={RUA_EMPLOYEE_DOCTYPE.name} //
        uniqueTableKey={`rua_employee_list_${RUA_EMPLOYEE_DOCTYPE.name}`} //
        columnsConfig={employeeColumnsConfig}
        onRowClick={handleRowClick}
        contextMenuItemsModel={contextMenuItemsModel}
        globalFilterFields={globalFilterFields}
        headerActions={headerActions}
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
        confirmationText={employeeToDelete?.name} // For matching confirmation input
        confirmButtonLabel="Delete"
        confirmButtonIcon="pi pi-trash"
        loading={deleteLoading}
      />
    </>
  );
};

export default EmployeeTable;
