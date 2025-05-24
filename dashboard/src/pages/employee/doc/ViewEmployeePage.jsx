// src/pages/employee/doc/ViewEmployeePage.jsx - Updated to use layout actions
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const {
    setPageTitle,
    setBreadcrumbItems,
    setHomeLink,
    setPrimaryAction,
    setSecondaryActions,
    setMenuActions,
    clearActions,
  } = useLayout();

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

  // Set page title, breadcrumbs and actions
  useEffect(() => {
    const employeeName =
      employeeData?.employee_name || employeeId || "Employee";

    // Set a custom page title component with badge on chip
    setPageTitle(() => (
      <div className="relative p-2">
        {" "}
        {/* Added padding to make space for the badge */}
        <Chip label={employeeName} image={employeeData?.image} />
        <Badge
          value={<i className="pi pi-eye text-sm"></i>}
          severity="info"
          className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center rounded-full"
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

    // Set page actions
    setPrimaryAction({
      label: "Edit",
      icon: "pi pi-pencil",
      command: () => navigate(`/employees/edit/${employeeId}`),
    });

    setSecondaryActions([
      {
        label: "Refresh",
        icon: "pi pi-refresh",
        command: () => window.location.reload(),
      },
      {
        label: "Share",
        icon: "pi pi-share-alt",
        command: () => console.log("Share employee:", employeeId),
      },
    ]);

    setMenuActions([
      {
        label: "Duplicate",
        icon: "pi pi-copy",
        command: () => console.log("Duplicate employee:", employeeId),
      },
      {
        label: "Export PDF",
        icon: "pi pi-file-pdf",
        command: () => console.log("Export PDF:", employeeId),
      },
      { separator: true },
      {
        label: "Archive",
        icon: "pi pi-archive",
        command: () => console.log("Archive employee:", employeeId),
      },
      {
        label: "Delete",
        icon: "pi pi-trash",
        command: () => console.log("Delete employee:", employeeId),
        className: "text-red-600",
      },
    ]);

    // Cleanup function to clear actions when component unmounts
    return () => {
      clearActions();
      setBreadcrumbItems([]);
    };
  }, [
    employeeId,
    employeeData,
    navigate,
    // Layout setter functions are stable and don't need to be in dependencies
  ]);

  const handleTabsConfigFromViewer = useCallback((config) => {
    setDocToolbarTabProps(
      config || { tabs: [], activeIndex: 0, onTabSelect: null }
    );
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <i className="pi pi-spin pi-spinner text-2xl text-primary-color"></i>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full">
      {/* Document Content - Removed local action header */}
      <div className="bg-surface-0 h-full rounded-3xl overflow-hidden">
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
