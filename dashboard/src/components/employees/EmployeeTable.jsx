// dashboard/src/components/employees/EmployeeTable.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFrappeGetDocList, useFrappeDeleteDoc } from "frappe-react-sdk";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { RUA_EMPLOYEE_DOCTYPE } from "@/constants";

import DynamicDataTable from "@/components/common/DynamicDataTable"; // Adjust path as needed
import ConfirmDialog from "@/components/common/ConfirmDialog"; // Adjust path as needed
import nationalities from "@/utils/nationalities.json"; // For Nationality options

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

  const userOptions = usersList
    ? usersList.map((u) => ({ label: u.full_name || u.name, value: u.name }))
    : [];

  const nationalityOptions = nationalities.map((n) => ({
    label: `${n.flag} ${n.name}`,
    value: n.name,
  }));

  const {
    deleteDoc,
    loading: deleteLoading,
    error: deleteError,
    isCompleted: deleteCompleted,
  } = useFrappeDeleteDoc();

  useEffect(() => {
    if (deleteCompleted && !deleteError) {
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Employee deleted successfully",
        life: 3000,
      });
      // Trigger a re-fetch of the employee list in DynamicDataTable by calling its mutate function
      // This needs DynamicDataTable to expose its mutate function, or re-fetch based on a prop change.
      // For now, a page refresh or navigating away and back would show the change.
      // A more direct way is to pass the `mutate` function from DynamicDataTable up or use a global state/event.
    }
    if (deleteError) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `Failed to delete employee: ${deleteError.message}`,
        life: 5000,
      });
    }
  }, [deleteCompleted, deleteError]);

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
        await deleteDoc("RUA Employee", employeeToDelete.name);
        // DataTable will re-fetch via its own useFrappeGetDocList SWR hook if data changes globally or mutate is called.
      } catch (e) {
        // Error already handled by the deleteError useEffect
      } finally {
        setShowDeleteDialog(false);
        setEmployeeToDelete(null);
      }
    }
  };

  const contextMenuItemsModel = [
    {
      label: "View",
      icon: "pi pi-fw pi-search",
      command: (e) => handleRowClick(employeeToDelete || e.data),
    }, // e.data is from DataTable's event if not using selectedRow state for menu
    {
      label: "Edit",
      icon: "pi pi-fw pi-pencil",
      command: () => handleEditEmployee(employeeToDelete),
    },
    { separator: true },
    {
      label: "Delete",
      icon: "pi pi-fw pi-times",
      command: () => handleDeleteEmployee(employeeToDelete),
    },
  ];

  // Define columns for the RUA Employee doctype
  const employeeColumnsConfig = [
    {
      fieldname: "image",
      header: "Avatar",
      fieldtype: "Attach Image",
      sortable: false,
      filterable: false,
      defaultVisible: true,
      displayProps: { asAvatar: true },
      minWidth: "80px",
    },
    {
      fieldname: "employee_name",
      header: "Name",
      fieldtype: "Data",
      sortable: true,
      filterable: true,
      defaultVisible: true,
      minWidth: "200px",
    },
    {
      fieldname: "name",
      header: "Employee ID",
      fieldtype: "Data", // This is the 'name' (primary key)
      sortable: true,
      filterable: true,
      defaultVisible: true,
      minWidth: "150px",
    },
    {
      fieldname: "user",
      header: "User Account",
      fieldtype: "Link",
      options: "User", // Doctype being linked
      filterOptions: userOptions, // Pass fetched options for the filter dropdown
      sortable: true,
      filterable: true,
      defaultVisible: false,
      minWidth: "200px",
    },
    {
      fieldname: "position",
      header: "Position",
      fieldtype: "Data",
      sortable: true,
      filterable: true,
      defaultVisible: true,
      minWidth: "180px",
    },
    {
      fieldname: "branch",
      header: "Branch",
      fieldtype: "Select",
      options: ["Main", "Branch 1", "Branch 2"], // Static options from schema
      displayProps: {
        asChip: true,
        chipColors: {
          Main: "info",
          "Branch 1": "success",
          "Branch 2": "warning",
        },
        chipRounded: true,
      },
      sortable: true,
      filterable: true,
      defaultVisible: true,
      minWidth: "120px",
    },
    {
      fieldname: "phone",
      header: "Phone",
      fieldtype: "Data", // Frappe fieldtype 'Data' with options 'Phone'
      sortable: false,
      filterable: true,
      defaultVisible: true,
      minWidth: "150px",
    },
    {
      fieldname: "email",
      header: "Email",
      fieldtype: "Data", // Frappe fieldtype 'Data' with options 'Email'
      sortable: true,
      filterable: true,
      defaultVisible: true,
      minWidth: "250px",
    },
    {
      fieldname: "salary",
      header: "Salary",
      fieldtype: "Currency",
      sortable: true,
      filterable: true,
      defaultVisible: true,
      minWidth: "120px",
    },
    {
      fieldname: "basic",
      header: "Basic Salary",
      fieldtype: "Currency",
      sortable: true,
      filterable: true,
      defaultVisible: false, // Hidden by default
      minWidth: "120px",
    },
    {
      fieldname: "allowance",
      header: "Allowance",
      fieldtype: "Currency",
      sortable: true,
      filterable: true,
      defaultVisible: false, // Hidden by default
      minWidth: "120px",
    },
    {
      fieldname: "joining_date",
      header: "Joining Date",
      fieldtype: "Date",
      sortable: true,
      filterable: true,
      defaultVisible: true,
      minWidth: "150px",
    },
    {
      fieldname: "nationality",
      header: "Nationality",
      fieldtype: "Data", // Using 'Data' type with special handling
      options: nationalityOptions, // Pass formatted options for filter dropdown
      sortable: true,
      filterable: true,
      defaultVisible: false,
      minWidth: "180px",
    },
    {
      fieldname: "gender",
      header: "Gender",
      fieldtype: "Select",
      options: ["Male", "Female"],
      displayProps: { asChip: true, chipRounded: true },
      sortable: true,
      filterable: true,
      defaultVisible: false,
      minWidth: "100px",
    },
    {
      fieldname: "date_of_birth",
      header: "Date of Birth",
      fieldtype: "Date",
      sortable: true,
      filterable: true,
      defaultVisible: false,
      minWidth: "150px",
    },
  ];

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

  return (
    <>
      <Toast ref={toast} />
      <DynamicDataTable
        doctype="RUA Employee"
        uniqueTableKey="rua_employee_list"
        columnsConfig={employeeColumnsConfig}
        // fetchArgs={{ orderBy: { field: 'employee_name', order: 'asc' } }} // Example initial sort
        onRowClick={handleRowClick}
        contextMenuItemsModel={contextMenuItemsModel}
        globalFilterFields={[
          "name",
          "employee_name",
          "position",
          "email",
          "phone",
          "branch",
        ]}
        headerActions={headerActions}
        dataKey="name" // Use the unique identifier for rows
      />
      <ConfirmDialog
        visible={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        onConfirm={confirmDeleteEmployee}
        header="Delete Employee"
        message={`Are you sure you want to delete ${
          employeeToDelete?.employee_name || "this employee"
        }? This action cannot be undone.`}
        confirmationText={employeeToDelete?.name} // Confirm by typing employee ID (name)
        confirmButtonLabel="Delete"
        confirmButtonIcon="pi pi-trash"
      />
    </>
  );
};

export default EmployeeTable;
