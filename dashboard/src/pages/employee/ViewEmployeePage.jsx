// src/pages/employee/ViewEmployeePage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UniversalDocViewer from "@/components/common/UniversalDocViewer";
import DocToolbar from "@/components/common/DocToolbar";
import { Avatar } from "primereact/avatar";
import { RUA_EMPLOYEE_DOCTYPE } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { useFrappeGetDoc } from "frappe-react-sdk";

const ViewEmployeePage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { /* setPageTitle, */ setBreadcrumbItems, setHomeLink } = useLayout(); // Page title handled by Viewer

  const [toolbarLeftContentData, setToolbarLeftContentData] = useState(null);
  const [docToolbarTabProps, setDocToolbarTabProps] = useState({
    tabs: [],
    activeIndex: 0,
    onTabSelect: null,
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
    // console.log("[ViewPage] Received tabs config:", config); // Optional: Keep for debugging if needed
    setDocToolbarTabProps(
      config || { tabs: [], activeIndex: 0, onTabSelect: null }
    );
  }, []);

  // console.log("[ViewPage] DocToolbarTabProps:", docToolbarTabProps); // Optional

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
      className: "p-button-primary",
      tooltip: "Edit this employee's details",
    },
  ];

  const viewerSecondaryActions = [
    {
      id: "deleteEmployee",
      label: "Delete",
      icon: "pi pi-trash",
      command: () => console.log("Delete action for", employeeId), // Implement actual delete
      className: "p-button-danger p-button-text",
      tooltip: "Delete this employee",
    },
    {
      id: "printEmployee",
      label: "Print",
      icon: "pi pi-print",
      command: () => window.print(),
    },
  ];

  let customToolbarLeftContent = null;
  if (isLoadingMinimalData && employeeId) {
    customToolbarLeftContent = (
      <div className="text-sm text-text-color-secondary">
        Loading details...
      </div>
    );
  } else if (toolbarLeftContentData) {
    customToolbarLeftContent = (
      <div className="flex items-center gap-2 overflow-hidden">
        <Avatar
          image={toolbarLeftContentData.image || undefined}
          label={
            !toolbarLeftContentData.image
              ? toolbarLeftContentData.name?.[0]?.toUpperCase() ||
                RUA_EMPLOYEE_DOCTYPE.name?.[0]?.toUpperCase() ||
                "D"
              : undefined
          }
          shape="circle"
          size="large"
          className="bg-primary-100 text-primary-color flex-shrink-0"
          imageAlt={toolbarLeftContentData.name || "Document"}
          onError={(e) => {
            if (e.target) e.target.style.display = "none";
          }}
        />
        <div className="flex flex-col overflow-hidden">
          <span
            className="font-semibold text-text-color text-lg truncate"
            title={toolbarLeftContentData.name}
          >
            {toolbarLeftContentData.name || "Document"}
          </span>
          {toolbarLeftContentData.branch && (
            <span
              className="text-sm text-text-color-secondary truncate"
              title={toolbarLeftContentData.branch}
            >
              {toolbarLeftContentData.branch}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <DocToolbar
        onBack={handleBack}
        primaryActions={viewerPrimaryActions}
        secondaryActions={viewerSecondaryActions}
        leftContent={customToolbarLeftContent}
        tabs={docToolbarTabProps.tabs}
        activeTabIndex={docToolbarTabProps.activeIndex}
        onTabSelect={docToolbarTabProps.onTabSelect}
      />
      <UniversalDocViewer
        doctypeName={RUA_EMPLOYEE_DOCTYPE.name}
        docname={employeeId}
        externalTabsEnabled={true}
        onTabsConfigChange={handleTabsConfigFromViewer}
        // customUIAugmentations={...} // Pass if needed
        // fieldDisplayConfig={...} // Pass if needed
      />
    </div>
  );
};

export default ViewEmployeePage;
