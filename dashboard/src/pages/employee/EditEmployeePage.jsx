// src/pages/employee/EditEmployeePage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UniversalDocEditor from "@/components/common/UniversalDocEditor";
import DocToolbar from "@/components/common/DocToolbar";
import { Avatar } from "primereact/avatar";
import { RUA_EMPLOYEE_DOCTYPE } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { useFrappeGetDoc } from "frappe-react-sdk";

const EditEmployeePage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { setBreadcrumbItems, setHomeLink, setPageTitle } = useLayout();
  const editorRef = useRef(null); // Ref to access UniversalDocEditor's exposed methods

  const [toolbarLeftContentData, setToolbarLeftContentData] = useState(null);
  const [isEditorCurrentlySaving, setIsEditorCurrentlySaving] = useState(false); // To manage button loading state

  // Fetch minimal employee data for toolbar if in edit mode
  const { data: employeeMinimalData, isLoading: isLoadingMinimalData } =
    useFrappeGetDoc(RUA_EMPLOYEE_DOCTYPE.name, employeeId, {
      fields: ["employee_name", "image", "branch"],
      enabled: !!employeeId,
    });

  useEffect(() => {
    let pageTitleText = "";
    const baseBreadcrumbs = [
      {
        label: RUA_EMPLOYEE_DOCTYPE.pluralLabel,
        url: `/${RUA_EMPLOYEE_DOCTYPE.route}`,
      },
    ];

    if (employeeId) {
      const displayName = employeeMinimalData?.employee_name || employeeId;
      pageTitleText = `Edit: ${displayName}`;
      setToolbarLeftContentData({
        name: employeeMinimalData?.employee_name,
        image: employeeMinimalData?.image,
        branch: employeeMinimalData?.branch,
      });
      baseBreadcrumbs.push({
        label: displayName,
        url: `/employees/view/${employeeId}`,
      });
      baseBreadcrumbs.push({ label: "Edit" });
    } else {
      pageTitleText = `Create New ${RUA_EMPLOYEE_DOCTYPE.name}`;
      setToolbarLeftContentData(null);
      baseBreadcrumbs.push({ label: "New" });
    }

    setPageTitle(pageTitleText);
    setBreadcrumbItems(baseBreadcrumbs);
    setHomeLink({ icon: "pi pi-home", url: "/" });

    return () => {
      setBreadcrumbItems([]);
      // setPageTitle("Dashboard"); // Reset if navigating away completely
    };
  }, [
    employeeId,
    employeeMinimalData,
    setBreadcrumbItems,
    setHomeLink,
    setPageTitle,
    RUA_EMPLOYEE_DOCTYPE,
  ]);

  const handleSaveSuccess = (savedDoc) => {
    setIsEditorCurrentlySaving(false); // Reset saving state
    navigate(`/employees/view/${savedDoc.name}`);
  };

  const handleSaveError = () => {
    setIsEditorCurrentlySaving(false); // Reset saving state on error too
    // Toast for error is handled within UniversalDocEditor
  };

  const handleCancel = () => {
    navigate(
      employeeId
        ? `/employees/view/${employeeId}`
        : `/${RUA_EMPLOYEE_DOCTYPE.route}`
    );
  };

  const triggerSave = useCallback(async () => {
    if (
      editorRef.current &&
      typeof editorRef.current.triggerSubmit === "function"
    ) {
      setIsEditorCurrentlySaving(true); // Set loading state for the button
      try {
        await editorRef.current.triggerSubmit();
        // Success is handled by onSaveSuccess prop, error by onSaveError
      } catch (error) {
        // This catch is for the triggerSubmit promise itself, if it rejects.
        // UniversalDocEditor should ideally handle its own toast for internal errors.
        console.error("Error during editor submit process:", error);
        setIsEditorCurrentlySaving(false);
      }
    } else {
      console.warn(
        "UniversalDocEditor does not expose a submit trigger via ref or it's not ready."
      );
      // Optionally show a toast here if the ref isn't wired correctly, though UDE should handle internal errors
    }
  }, [editorRef]);

  const editorPrimaryActions = [
    {
      id: "saveEmployee",
      label: isEditorCurrentlySaving ? "Saving..." : "Save",
      icon: "pi pi-check",
      command: triggerSave,
      loading: isEditorCurrentlySaving,
      className: "p-button-primary",
      tooltip: employeeId ? "Save changes" : "Create employee",
    },
  ];

  let customToolbarLeftContent = null;
  if (employeeId && !isLoadingMinimalData && toolbarLeftContentData) {
    customToolbarLeftContent = (
      <div className="flex items-center gap-3 overflow-hidden">
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
  } else if (!employeeId) {
    customToolbarLeftContent = (
      <div className="flex items-center gap-2 overflow-hidden">
        <Avatar
          icon="pi pi-user-plus"
          shape="circle"
          size="large"
          className="bg-primary-100 text-primary-color flex-shrink-0"
        />
        <div className="flex flex-col overflow-hidden">
          <span className="font-semibold text-text-color text-lg truncate">
            New {RUA_EMPLOYEE_DOCTYPE.name}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[1200px] mx-auto">
        <DocToolbar
          onBack={handleCancel}
          primaryActions={editorPrimaryActions}
          leftContent={customToolbarLeftContent}
        />
        <UniversalDocEditor
          ref={editorRef} // Pass the ref to UniversalDocEditor
          doctypeName={RUA_EMPLOYEE_DOCTYPE.name}
          docname={employeeId}
          onSaveSuccess={handleSaveSuccess}
          onSaveError={handleSaveError} // Pass error handler
          // onCancel is now handled by DocToolbar's onBack
        />
      </div>
    </>
  );
};

export default EditEmployeePage;
