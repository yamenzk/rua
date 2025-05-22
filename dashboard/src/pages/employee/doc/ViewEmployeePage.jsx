// Updated ViewEmployeePage.jsx with enhanced avatar for dynamic island
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DocViewer from "@/components/document/DocViewer";

// Import both islands
import LightDynamicIsland from "@/components/common/LightDynamicIsland";
import BottomTabIsland from "@/components/common/BottomTabIsland";

import { Avatar } from "primereact/avatar";
import { RUA_EMPLOYEE_DOCTYPE } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { useFrappeGetDoc } from "frappe-react-sdk";

const ViewEmployeePage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { setBreadcrumbItems, setHomeLink } = useLayout();

  const [toolbarLeftContentData, setToolbarLeftContentData] = useState(null);
  const [docToolbarTabProps, setDocToolbarTabProps] = useState({
    tabs: [],
    activeIndex: 0,
    onTabSelect: null,
  });

  // Fetch full employee data including audit fields
  const { data: employeeFullData, isLoading: isLoadingFullData } =
    useFrappeGetDoc(RUA_EMPLOYEE_DOCTYPE.name, employeeId, {
      fields: ["*"],
      enabled: !!employeeId,
    });

  const { data: employeeMinimalData, isLoading: isLoadingMinimalData } =
    useFrappeGetDoc(RUA_EMPLOYEE_DOCTYPE.name, employeeId, {
      fields: ["employee_name", "image", "branch"],
      enabled: !!employeeId,
    });

  useEffect(() => {
    let employeeNameToDisplay = employeeId || "Employee";
    if (employeeMinimalData) {
      employeeNameToDisplay = employeeMinimalData.employee_name || employeeId;
      setToolbarLeftContentData({
        name: employeeMinimalData.employee_name,
        image: employeeMinimalData.image,
        branch: employeeMinimalData.branch,
      });
    } else if (employeeId && !isLoadingMinimalData) {
      setToolbarLeftContentData({
        name: employeeId,
        image: null,
        branch: null,
      });
    }

    // Set breadcrumbs
    const breadcrumbPath = [
      {
        label: RUA_EMPLOYEE_DOCTYPE.pluralLabel,
        url: `/${RUA_EMPLOYEE_DOCTYPE.route}`,
      },
      { label: employeeNameToDisplay },
    ];
    setBreadcrumbItems(breadcrumbPath);
    setHomeLink({ icon: "pi pi-home", url: "/" });

    return () => {
      setBreadcrumbItems([]);
    };
  }, [
    employeeId,
    employeeMinimalData,
    isLoadingMinimalData,
    setBreadcrumbItems,
    setHomeLink,
    RUA_EMPLOYEE_DOCTYPE,
  ]);

  const handleTabsConfigFromViewer = useCallback((config) => {
    setDocToolbarTabProps(
      config || { tabs: [], activeIndex: 0, onTabSelect: null }
    );
  }, []);

  const handleEdit = () => {
    navigate(`/employees/edit/${employeeId}`);
  };

  const handleBack = () => {
    navigate(`/${RUA_EMPLOYEE_DOCTYPE.route}`);
  };

  const viewerPrimaryActions = [
    {
      id: "editEmployee",
      label: "Edit",
      icon: "pi pi-pencil",
      command: handleEdit,
      tooltip: "Edit this employee's details",
    },
    {
      id: "duplicateEmployee",
      label: "Duplicate",
      icon: "pi pi-copy",
      command: () => console.log("Duplicate action"),
      tooltip: "Create a copy of this employee",
    },
  ];

  const viewerSecondaryActions = [
    {
      id: "deleteEmployee",
      label: "Delete",
      icon: "pi pi-trash",
      command: () => console.log("Delete action for", employeeId),
      tooltip: "Delete this employee",
    },
    {
      id: "printEmployee",
      label: "Print",
      icon: "pi pi-print",
      command: () => window.print(),
      tooltip: "Print employee details",
    },
    {
      id: "exportEmployee",
      label: "Export",
      icon: "pi pi-download",
      command: () => console.log("Export action"),
      tooltip: "Export employee data",
    },
    {
      id: "shareEmployee",
      label: "Share",
      icon: "pi pi-share-alt",
      command: () => console.log("Share action"),
      tooltip: "Share employee profile",
    },
  ];

  // Create enhanced left content with bigger avatar for dynamic island
  const customLeftContent = toolbarLeftContentData && (
    <div className="flex items-center gap-3">
      <Avatar
        image={toolbarLeftContentData.image || undefined}
        label={
          !toolbarLeftContentData.image
            ? toolbarLeftContentData.name?.[0]?.toUpperCase() || "E"
            : undefined
        }
        shape="circle"
        size="xlarge" // Changed from "large" to "xlarge" for bigger avatar
        className="bg-primary-100 text-primary-600 border-2 border-primary-200 shadow-lg"
        imageAlt={toolbarLeftContentData.name || "Employee"}
        style={{
          width: "48px",
          height: "48px",
          fontSize: "1.25rem", // Ensure text scales properly
        }}
      />
      <div className="flex flex-col min-w-0">
        {" "}
        {/* Added min-w-0 for proper truncation */}
        <span className="font-semibold text-base text-text-color truncate">
          {toolbarLeftContentData.name || "Employee"}
        </span>
        {toolbarLeftContentData.branch && (
          <span className="text-sm text-text-color-secondary truncate">
            {toolbarLeftContentData.branch}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Top Dynamic Island - Actions & Document Info */}
      <div className="dynamic-island-container">
        <LightDynamicIsland
          onBack={handleBack}
          primaryActions={viewerPrimaryActions}
          secondaryActions={viewerSecondaryActions}
          leftContent={customLeftContent}
          docData={employeeFullData}
          showAuditInfo={true}
        />
      </div>

      {/* Bottom Tab Island - Navigation */}
      <div className="dynamic-island-container">
        <BottomTabIsland
          tabs={docToolbarTabProps.tabs}
          activeTabIndex={docToolbarTabProps.activeIndex}
          onTabSelect={docToolbarTabProps.onTabSelect}
        />
      </div>

      {/* Document Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DocViewer
          doctypeName={RUA_EMPLOYEE_DOCTYPE.name}
          docname={employeeId}
          externalTabsEnabled={true}
          onTabsConfigChange={handleTabsConfigFromViewer}
          externalDocData={employeeFullData}
        />
      </div>

      {/* Bottom padding to prevent overlap with tab island */}
      <div className="h-24" />
    </div>
  );
};

export default ViewEmployeePage;
