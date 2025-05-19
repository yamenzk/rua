// Debug version of ViewEmployeePage.jsx
// Add this temporarily to debug the tab issue

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
  const { setPageTitle, setBreadcrumbItems, setHomeLink } = useLayout();

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

  const doctypeInfo = React.useMemo(
    () => ({
      name: RUA_EMPLOYEE_DOCTYPE.name,
      pluralLabel: RUA_EMPLOYEE_DOCTYPE.pluralLabel,
      route: RUA_EMPLOYEE_DOCTYPE.route,
    }),
    []
  );

  useEffect(() => {
    let employeeNameToDisplay = employeeId || "Employee";

    if (employeeMinimalData) {
      employeeNameToDisplay =
        employeeMinimalData.employee_name || employeeId || "Employee";
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
        label: doctypeInfo.pluralLabel,
        url: `/${doctypeInfo.route}`,
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
    doctypeInfo,
  ]);

  // Callback from UniversalDocViewer to receive tab configuration
  const handleTabsConfigFromViewer = useCallback((config) => {
    // DEBUG: Log the received config
    console.log("Received tab config from viewer:", config);

    setDocToolbarTabProps(
      config || { tabs: [], activeIndex: 0, onTabSelect: null }
    );
  }, []);

  // DEBUG: Log the current tab props state
  useEffect(() => {
    console.log("Current docToolbarTabProps:", docToolbarTabProps);
  }, [docToolbarTabProps]);

  const handleEdit = useCallback(() => {
    navigate(`/employees/edit/${employeeId}`);
  }, [navigate, employeeId]);

  const handleBack = useCallback(() => {
    navigate(`/${doctypeInfo.route}`);
  }, [navigate, doctypeInfo.route]);

  const handleDelete = useCallback(() => {
    console.log("Delete action triggered for", employeeId);
  }, [employeeId]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const viewerPrimaryActions = React.useMemo(
    () => [
      {
        id: "editEmployee",
        label: "Edit",
        icon: "pi pi-pencil",
        command: handleEdit,
        className: "p-button-primary",
        tooltip: "Edit this employee's details",
      },
    ],
    [handleEdit]
  );

  const viewerSecondaryActions = React.useMemo(
    () => [
      {
        id: "deleteEmployee",
        label: "Delete",
        icon: "pi pi-trash",
        command: handleDelete,
        className: "p-button-danger p-button-text",
        tooltip: "Delete this employee",
      },
      {
        id: "printEmployee",
        label: "Print",
        icon: "pi pi-print",
        command: handlePrint,
      },
    ],
    [handleDelete, handlePrint]
  );

  // Constructing leftContent for DocToolbar
  let customToolbarLeftContent = null;
  if (employeeId) {
    if (isLoadingMinimalData) {
      customToolbarLeftContent = (
        <div className="text-sm text-text-color-secondary animate-pulse">
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
                  doctypeInfo.name?.[0] ||
                  "D"
                : undefined
            }
            shape="circle"
            size="large"
            className="bg-primary-100 text-primary-color flex-shrink-0"
            onError={(e) => {
              if (e.target && e.target.style) e.target.style.display = "none";
            }}
          />
          <div className="flex flex-col overflow-hidden">
            <span
              className="font-semibold text-text-color text-lg truncate"
              title={toolbarLeftContentData.name || "Employee"}
            >
              {toolbarLeftContentData.name || "Employee Details"}
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
    } else {
      customToolbarLeftContent = (
        <div className="flex items-center gap-2 overflow-hidden">
          <Avatar
            icon="pi pi-user"
            size="large"
            shape="circle"
            className="bg-surface-300 text-surface-600"
          />
          <span className="font-semibold text-text-color text-lg truncate">
            {employeeId}
          </span>
        </div>
      );
    }
  }

  return (
    <>
      <div className="page-container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <DocToolbar
          onBack={handleBack}
          primaryActions={viewerPrimaryActions}
          secondaryActions={viewerSecondaryActions}
          leftContent={customToolbarLeftContent}
          // DEBUG: Explicitly spread and log the tab props
          tabs={docToolbarTabProps.tabs}
          activeTabIndex={docToolbarTabProps.activeIndex}
          onTabSelect={docToolbarTabProps.onTabSelect}
        />

        {/* DEBUG: Show tab state visually */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <h3 className="font-bold text-yellow-800">DEBUG: Tab State</h3>
          <p>
            <strong>Tabs count:</strong> {docToolbarTabProps.tabs?.length || 0}
          </p>
          <p>
            <strong>Active index:</strong> {docToolbarTabProps.activeIndex}
          </p>
          <p>
            <strong>Has onTabSelect:</strong>{" "}
            {!!docToolbarTabProps.onTabSelect ? "Yes" : "No"}
          </p>
          {docToolbarTabProps.tabs?.length > 0 && (
            <div>
              <strong>Tabs:</strong>
              <ul>
                {docToolbarTabProps.tabs.map((tab, idx) => (
                  <li key={idx}>
                    {idx}: {tab.label} (id: {tab.id}, slug: {tab.slug})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {employeeId ? (
          <UniversalDocViewer
            doctypeName={doctypeInfo.name}
            docname={employeeId}
            externalTabsEnabled={true}
            onTabsConfigChange={handleTabsConfigFromViewer}
          />
        ) : (
          <div className="p-4 m-4 bg-surface-card rounded-lg shadow">
            <p className="text-text-color-secondary">
              Employee ID not specified.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewEmployeePage;
