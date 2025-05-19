// src/pages/employee/ViewEmployeePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UniversalDocViewer from "@/components/common/UniversalDocViewer";
import DocToolbar from "@/components/common/DocToolbar";
import { Avatar } from "primereact/avatar"; // Import Avatar
import { RUA_EMPLOYEE_DOCTYPE } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { useFrappeGetDoc } from "frappe-react-sdk";

const ViewEmployeePage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { setPageTitle, setBreadcrumbItems, setHomeLink } = useLayout();
  const [toolbarLeftContentData, setToolbarLeftContentData] = useState(null);

  const { data: employeeMinimalData, isLoading: isLoadingMinimalData } =
    useFrappeGetDoc(RUA_EMPLOYEE_DOCTYPE.name, employeeId, {
      fields: ["employee_name", "image", "branch"],
      enabled: !!employeeId,
    });

  useEffect(() => {
    let employeeNameToDisplay = employeeId;
    if (employeeMinimalData) {
      employeeNameToDisplay = employeeMinimalData.employee_name || employeeId;
      setToolbarLeftContentData({
        name: employeeMinimalData.employee_name,
        image: employeeMinimalData.image,
        branch: employeeMinimalData.branch,
      });
    }

    setPageTitle(
      `${RUA_EMPLOYEE_DOCTYPE.pluralLabel}: ${employeeNameToDisplay}`
    );
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
    setPageTitle,
    setBreadcrumbItems,
    setHomeLink,
    RUA_EMPLOYEE_DOCTYPE,
  ]);

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
      command: () => {
        console.log(
          "Delete action triggered for",
          employeeId
        ); /* Implement delete */
      },
      className: "p-button-danger p-button-text",
      tooltip: "Delete this employee",
    },
    {
      id: "printEmployee",
      label: "Print",
      icon: "pi pi-print",
      command: () => {
        window.print();
      },
    },
  ];

  let customToolbarLeftContent = null;
  if (employeeId && toolbarLeftContentData && !isLoadingMinimalData) {
    customToolbarLeftContent = (
      <div className="flex items-center gap-2 overflow-hidden">
        <Avatar
          image={toolbarLeftContentData.image || undefined}
          label={
            !toolbarLeftContentData.image
              ? toolbarLeftContentData.name?.[0]?.toUpperCase() || "E"
              : undefined
          }
          shape="circle"
          size="large"
          className="bg-primary-100 text-primary-color flex-shrink-0"
          imageAlt={toolbarLeftContentData.name || "Employee"}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        <div className="flex flex-col overflow-hidden">
          <span
            className="font-semibold text-text-color text-lg truncate"
            title={toolbarLeftContentData.name}
          >
            {toolbarLeftContentData.name || "Employee"}
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
  } else if (employeeId && isLoadingMinimalData) {
    customToolbarLeftContent = (
      <div className="text-sm text-text-color-secondary">
        Loading details...
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[1200px] mx-auto">
        <DocToolbar
          onBack={handleBack}
          primaryActions={viewerPrimaryActions}
          secondaryActions={viewerSecondaryActions}
          leftContent={customToolbarLeftContent}
        />
        <UniversalDocViewer
          doctypeName={RUA_EMPLOYEE_DOCTYPE.name}
          docname={employeeId}
          listPageUrl={`/${RUA_EMPLOYEE_DOCTYPE.route}`}
        />
      </div>
    </>
  );
};

export default ViewEmployeePage;
