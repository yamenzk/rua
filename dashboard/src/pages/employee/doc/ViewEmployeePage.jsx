// src/pages/employee/doc/ViewEmployeePage.jsx - Updated with audit info
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DocViewer from "@/components/document/DocViewer";
import DocToolbar from "@/components/common/DocToolbar";
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

  // Fetch full employee data including audit fields for DocToolbar
  const { data: employeeFullData, isLoading: isLoadingFullData } =
    useFrappeGetDoc(RUA_EMPLOYEE_DOCTYPE.name, employeeId, {
      fields: ["*"], // Get all fields including audit fields
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
      className: "p-button-primary",
      tooltip: "Edit this employee's details",
    },
  ];

  const viewerSecondaryActions = [
    {
      id: "deleteEmployee",
      label: "Delete",
      icon: "pi pi-trash",
      command: () => console.log("Delete action for", employeeId),
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
        // Pass audit information to DocToolbar
        docData={employeeFullData}
        showAuditInfo={true}
      />
      <DocViewer
        doctypeName={RUA_EMPLOYEE_DOCTYPE.name}
        docname={employeeId}
        externalTabsEnabled={true}
        onTabsConfigChange={handleTabsConfigFromViewer}
        // Pass the full data to DocViewer so it has audit fields available
        externalDocData={employeeFullData}
        // customUIAugmentations={...} // Pass if needed
        // fieldDisplayConfig={...} // Pass if needed
      />
    </div>
  );
};

export default ViewEmployeePage;
