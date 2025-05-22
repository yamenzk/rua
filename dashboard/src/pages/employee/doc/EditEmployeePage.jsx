// src/pages/employee/EditEmployeePage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DocEditor from "@/components/document/DocEditor";
import DocToolbar from "@/components/common/DocToolbar";
import { Avatar } from "primereact/avatar";
import { RUA_EMPLOYEE_DOCTYPE } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { useFrappeGetDoc } from "frappe-react-sdk";

const EditEmployeePage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { setBreadcrumbItems, setHomeLink /*, setPageTitle */ } = useLayout(); // Page title handled by Editor
  const editorRef = useRef(null);

  const [toolbarLeftContentData, setToolbarLeftContentData] = useState(null);
  const [isEditorCurrentlySaving, setIsEditorCurrentlySaving] = useState(false);
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
    const baseBreadcrumbs = [
      {
        label: RUA_EMPLOYEE_DOCTYPE.pluralLabel,
        url: `/${RUA_EMPLOYEE_DOCTYPE.route}`,
      },
    ];

    if (employeeId) {
      const displayName =
        employeeMinimalData?.employee_name || employeeId || "Employee";
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
      setToolbarLeftContentData(null);
      baseBreadcrumbs.push({ label: "New" });
    }
    setBreadcrumbItems(baseBreadcrumbs);
    setHomeLink({ icon: "pi pi-home", url: "/" });
    return () => {
      setBreadcrumbItems([]);
    };
  }, [
    employeeId,
    employeeMinimalData,
    setBreadcrumbItems,
    setHomeLink,
    RUA_EMPLOYEE_DOCTYPE,
  ]);

  const handleTabsConfigFromEditor = useCallback((config) => {
    // console.log("[EditPage] Received tabs config:", config); // Optional
    setDocToolbarTabProps(
      config || { tabs: [], activeIndex: 0, onTabSelect: null }
    );
  }, []);

  // console.log("[EditPage] DocToolbarTabProps:", docToolbarTabProps); // Optional

  const handleSaveSuccess = (savedDoc) => {
    setIsEditorCurrentlySaving(false);
    navigate(`/employees/view/${savedDoc.name}`);
  };

  const handleSaveError = (error) => {
    setIsEditorCurrentlySaving(false);
    console.error("Save Error on Page:", error); // Keep error log for page context
  };

  const handleCancel = () => {
    navigate(
      employeeId
        ? `/employees/view/${employeeId}`
        : `/${RUA_EMPLOYEE_DOCTYPE.route}`
    );
  };

  const triggerSave = useCallback(async () => {
    if (editorRef.current?.triggerSubmit) {
      setIsEditorCurrentlySaving(true);
      try {
        const savedDoc = await editorRef.current.triggerSubmit();
        if (!savedDoc && !isEditorCurrentlySaving) {
          // If submit fails and doesn't call onSaveError
          // This check is tricky, onSaveError should ideally always be called by the submission hook on failure.
          // The hook sets its own loading state, so this might be redundant if hook manages its own state.
        }
      } catch (error) {
        console.error("Error from triggerSubmit promise on page:", error);
        setIsEditorCurrentlySaving(false);
      }
    } else {
      console.warn("DocEditor ref or triggerSubmit not available.");
      setIsEditorCurrentlySaving(false);
    }
  }, [editorRef]); // isEditorCurrentlySaving removed from deps as it's set inside

  const editorPrimaryActions = [
    {
      id: "saveEmployee",
      label: isEditorCurrentlySaving
        ? "Saving..."
        : employeeId
        ? "Save Changes"
        : "Create Employee",
      icon: isEditorCurrentlySaving
        ? undefined
        : employeeId
        ? "pi pi-save"
        : "pi pi-user-plus",
      command: triggerSave,
      loading: isEditorCurrentlySaving,
      className: "p-button-primary",
      tooltip: employeeId ? "Save changes" : "Create employee",
    },
  ];

  let customToolbarLeftContent = null;
  if (employeeId) {
    if (isLoadingMinimalData) {
      customToolbarLeftContent = (
        <div className="text-sm text-text-color-secondary">
          Loading details...
        </div>
      );
    } else if (toolbarLeftContentData) {
      const isEditing = Boolean(employeeId);
      const displayName = toolbarLeftContentData.name || "Document";
      customToolbarLeftContent = (
        <div className="flex items-center gap-3 overflow-hidden">
          <Avatar
            image={toolbarLeftContentData.image || undefined}
            label={
              !toolbarLeftContentData.image
                ? displayName?.[0]?.toUpperCase() ||
                  RUA_EMPLOYEE_DOCTYPE.name?.[0]?.toUpperCase()
                : undefined
            }
            shape="circle"
            size="large"
            className="bg-primary-100 text-primary-color flex-shrink-0"
            imageAlt={displayName}
            onError={(e) => {
              if (e.target) e.target.style.display = "none";
            }}
          />
          <div className="flex flex-col overflow-hidden">
            <span
              className="font-semibold text-text-color text-lg truncate"
              title={displayName}
            >
              {isEditing ? `Editing ${displayName}` : displayName}
            </span>
            {!isEditing && toolbarLeftContentData.branch && (
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
  } else {
    customToolbarLeftContent = (
      /* ... New Employee Avatar JSX ... */
      <div className="flex items-center gap-2 overflow-hidden">
        <Avatar
          icon="pi pi-user-plus"
          shape="circle"
          size="large"
          className="bg-primary-100 text-primary-color flex-shrink-0"
        />
        <div className="flex flex-col overflow-hidden">
          <span className="font-semibold text-text-color text-lg truncate">
            New {RUA_EMPLOYEE_DOCTYPE.title}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <DocToolbar
        onBack={handleCancel}
        primaryActions={editorPrimaryActions}
        leftContent={customToolbarLeftContent}
        tabs={docToolbarTabProps.tabs}
        activeTabIndex={docToolbarTabProps.activeIndex}
        onTabSelect={docToolbarTabProps.onTabSelect}
      />
      <DocEditor
        ref={editorRef}
        doctypeName={RUA_EMPLOYEE_DOCTYPE.name}
        docname={employeeId}
        onSaveSuccess={handleSaveSuccess}
        onSaveError={handleSaveError}
        externalTabsEnabled={true}
        onTabsConfigChange={handleTabsConfigFromEditor}
        // customUIAugmentations={...} // Pass if needed
      />
    </div>
  );
};

export default EditEmployeePage;
