// src/pages/employee/doc/ViewEmployeePage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Menu } from "primereact/menu";
import { Chip } from "primereact/chip";
import { Badge } from "primereact/badge";
import DocViewer from "@/components/document/DocViewer";
import ModernTabNavigation from "@/components/common/ModernTabNavigation";
import { RUA_EMPLOYEE_DOCTYPE } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { useFrappeGetDoc } from "frappe-react-sdk";

const ViewEmployeePage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { setPageTitle, setBreadcrumbItems, setHomeLink } = useLayout();
  const menuRef = React.useRef(null);

  const [docToolbarTabProps, setDocToolbarTabProps] = useState({
    tabs: [],
    activeIndex: 0,
    onTabSelect: null,
  });

  // Fetch employee data
  const { data: employeeData, isLoading } = useFrappeGetDoc(
    RUA_EMPLOYEE_DOCTYPE.name,
    employeeId,
    {
      fields: ["*"],
      enabled: !!employeeId,
    }
  );

  // Set page title and breadcrumbs
  useEffect(() => {
    const employeeName =
      employeeData?.employee_name || employeeId || "Employee";

    // Set a custom page title component with badge on chip
    setPageTitle(() => (
      <div className="relative inline-block">
        <Chip label={employeeName} image={employeeData?.image} />
        <Badge
          value={<i className="pi pi-eye text-sm"></i>}
          severity="info"
          className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full"
        />
      </div>
    ));

    setHomeLink({ icon: "pi pi-home", url: "/" });

    setBreadcrumbItems([
      {
        label: "Employees",
        url: "/employees",
      },
      {
        label: employeeName,
      },
    ]);

    return () => {
      setBreadcrumbItems([]);
    };
  }, [employeeId, employeeData, setBreadcrumbItems, setPageTitle, setHomeLink]);

  const handleTabsConfigFromViewer = useCallback((config) => {
    setDocToolbarTabProps(
      config || { tabs: [], activeIndex: 0, onTabSelect: null }
    );
  }, []);

  const handleEdit = () => {
    navigate(`/employees/edit/${employeeId}`);
  };

  const handleDelete = () => {
    console.log("Delete employee:", employeeId);
    // Implement delete functionality
  };

  const handleDuplicate = () => {
    console.log("Duplicate employee:", employeeId);
    // Implement duplicate functionality
  };

  const actionMenuItems = [
    {
      label: "Edit",
      icon: "pi pi-pencil",
      command: handleEdit,
    },
    {
      label: "Duplicate",
      icon: "pi pi-copy",
      command: handleDuplicate,
    },
    { separator: true },
    {
      label: "Delete",
      icon: "pi pi-trash",
      command: handleDelete,
      className: "text-red-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <i className="pi pi-spin pi-spinner text-2xl text-primary-color"></i>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Employee Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            image={employeeData?.image || undefined}
            label={
              !employeeData?.image
                ? employeeData?.employee_name?.[0]?.toUpperCase() || "E"
                : undefined
            }
            shape="circle"
            size="xlarge"
            className="bg-primary-100 text-primary-600 border-2 border-primary-200"
          />

          <div>
            <h2 className="text-xl font-semibold text-text-color">
              {employeeData?.employee_name || "Employee"}
            </h2>
            {employeeData?.position && (
              <p className="text-text-color-secondary">
                {employeeData.position} -{" "}
                {employeeData.branch || "No Branch Assigned"}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            label="Edit"
            icon="pi pi-pencil"
            onClick={handleEdit}
            className="bg-primary-color text-primary-color-text hover:bg-primary-600"
          />

          <Menu model={actionMenuItems} popup ref={menuRef} className="mt-2" />
          <Button
            icon="pi pi-ellipsis-v"
            text
            rounded
            onClick={(e) => menuRef.current?.toggle(e)}
            className="text-text-color-secondary hover:text-text-color hover:bg-surface-hover"
            tooltip="More Actions"
          />
        </div>
      </div>

      {/* Document Content */}
      <div className="bg-surface-100 rounded-3xl overflow-hidden">
        {docToolbarTabProps.tabs && docToolbarTabProps.tabs.length > 0 && (
          <ModernTabNavigation
            tabs={docToolbarTabProps.tabs}
            activeIndex={docToolbarTabProps.activeIndex}
            onTabSelect={docToolbarTabProps.onTabSelect}
          />
        )}
        <DocViewer
          doctypeName={RUA_EMPLOYEE_DOCTYPE.name}
          docname={employeeId}
          externalTabsEnabled={true}
          onTabsConfigChange={handleTabsConfigFromViewer}
          externalDocData={employeeData}
          disableAutoTitle={true}
        />
      </div>
    </div>
  );
};

export default ViewEmployeePage;
