// src/pages/employee/doc/EditEmployeePage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { ProgressSpinner } from "primereact/progressspinner";
import { Chip } from "primereact/chip";
import { Badge } from "primereact/badge";
import DocEditor from "@/components/document/DocEditor";
import ModernTabNavigation from "@/components/common/ModernTabNavigation";
import { RUA_EMPLOYEE_DOCTYPE } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { useFrappeGetDoc } from "frappe-react-sdk";

const EditEmployeePage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { setPageTitle, setBreadcrumbItems, setHomeLink } = useLayout();
  const editorRef = useRef(null);

  const [isEditorCurrentlySaving, setIsEditorCurrentlySaving] = useState(false);
  const [docToolbarTabProps, setDocToolbarTabProps] = useState({
    tabs: [],
    activeIndex: 0,
    onTabSelect: null,
  });

  const isCreateMode = !employeeId;

  // Fetch minimal employee data for header
  const { data: employeeMinimalData, isLoading: isLoadingMinimalData } =
    useFrappeGetDoc(RUA_EMPLOYEE_DOCTYPE.name, employeeId, {
      fields: ["employee_name", "image", "position", "branch"],
      enabled: !!employeeId,
    });

  // Set page title and breadcrumbs
  useEffect(() => {
    const baseBreadcrumbs = [
      {
        label: "Employees",
        url: "/employees",
      },
    ];

    if (employeeId) {
      const displayName =
        employeeMinimalData?.employee_name || employeeId || "Employee";

      // Set custom page title component for edit mode
      setPageTitle(() => (
        <div className="relative inline-block">
          <Chip
            label={displayName}
            image={employeeMinimalData?.image}
          />
          <Badge
            value={<i className="pi pi-pencil text-sm"></i>}
            severity="warning"
            className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full"
          />
        </div>
      ));

      baseBreadcrumbs.push({
        label: displayName,
        url: `/employees/view/${employeeId}`,
      });
      baseBreadcrumbs.push({ label: "Edit" });
    } else {
      // Set custom page title component for create mode
      setPageTitle(() => (
        <div className="relative inline-block">
          <Chip
            label="New Employee"
            icon="pi pi-user-plus"
          />
          <Badge
            value={<i className="pi pi-plus text-sm"></i>}
            severity="success"
            className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full"
          />
        </div>
      ));

      baseBreadcrumbs.push({ label: "New Employee" });
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
    setPageTitle,
    setHomeLink,
  ]);

  const handleTabsConfigFromEditor = useCallback((config) => {
    setDocToolbarTabProps(
      config || { tabs: [], activeIndex: 0, onTabSelect: null }
    );
  }, []);

  const handleSaveSuccess = (savedDoc) => {
    setIsEditorCurrentlySaving(false);
    navigate(`/employees/view/${savedDoc.name}`);
  };

  const handleSaveError = (error) => {
    setIsEditorCurrentlySaving(false);
    console.error("Save Error:", error);
  };

  const handleCancel = () => {
    navigate(employeeId ? `/employees/view/${employeeId}` : "/employees");
  };

  const triggerSave = useCallback(async () => {
    if (editorRef.current?.triggerSubmit) {
      setIsEditorCurrentlySaving(true);
      try {
        const savedDoc = await editorRef.current.triggerSubmit();
        if (!savedDoc && !isEditorCurrentlySaving) {
          setIsEditorCurrentlySaving(false);
        }
      } catch (error) {
        console.error("Error from triggerSubmit:", error);
        setIsEditorCurrentlySaving(false);
      }
    }
  }, [isEditorCurrentlySaving]);

  return (
    <div className="space-y-6">
      {/* Employee Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!isCreateMode ? (
            isLoadingMinimalData ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-100 rounded-full animate-pulse" />
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-surface-100 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-surface-100 rounded animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Avatar
                  image={employeeMinimalData?.image || undefined}
                  label={
                    !employeeMinimalData?.image
                      ? employeeMinimalData?.employee_name?.[0]?.toUpperCase() ||
                        "E"
                      : undefined
                  }
                  shape="circle"
                  size="large"
                  className="bg-primary-100 text-primary-600 border-2 border-primary-200"
                />

                <div>
                  <h2 className="text-xl font-semibold text-text-color">
                    Edit {employeeMinimalData?.employee_name || "Employee"}
                  </h2>
                  {employeeMinimalData?.position && (
                    <p className="text-text-color-secondary">
                      {employeeMinimalData.position}
                    </p>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center gap-4">
              <Avatar
                icon="pi pi-user-plus"
                shape="circle"
                size="large"
                className="bg-primary-100 text-primary-600 border-2 border-primary-200"
              />

              <div>
                <h2 className="text-xl font-semibold text-text-color">
                  New Employee
                </h2>
                <p className="text-text-color-secondary">
                  Create a new employee record
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            label="Cancel"
            text
            onClick={handleCancel}
            className="text-text-color-secondary hover:text-text-color"
            disabled={isEditorCurrentlySaving}
          />

          <Button
            label={
              isEditorCurrentlySaving
                ? "Saving..."
                : employeeId
                ? "Save Changes"
                : "Create Employee"
            }
            icon={
              isEditorCurrentlySaving
                ? undefined
                : employeeId
                ? "pi pi-save"
                : "pi pi-user-plus"
            }
            onClick={triggerSave}
            loading={isEditorCurrentlySaving}
            className="bg-primary-color text-primary-color-text hover:bg-primary-600"
            disabled={isEditorCurrentlySaving}
          />
        </div>
      </div>

      {/* Modern Tab Navigation */}

      {/* Editor Content */}
      <div className="bg-surface-100 rounded-3xl overflow-hidden">
        {docToolbarTabProps.tabs && docToolbarTabProps.tabs.length > 0 && (
          <ModernTabNavigation
            tabs={docToolbarTabProps.tabs}
            activeIndex={docToolbarTabProps.activeIndex}
            onTabSelect={docToolbarTabProps.onTabSelect}
          />
        )}
        {isEditorCurrentlySaving && (
          <div className="absolute inset-0 bg-surface-overlay bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface-card p-4 rounded-lg shadow-lg flex items-center gap-3">
              <ProgressSpinner size="30" strokeWidth="4" />
              <span className="text-text-color">Saving changes...</span>
            </div>
          </div>
        )}

        <DocEditor
          ref={editorRef}
          doctypeName={RUA_EMPLOYEE_DOCTYPE.name}
          docname={employeeId}
          onSaveSuccess={handleSaveSuccess}
          onSaveError={handleSaveError}
          externalTabsEnabled={true}
          onTabsConfigChange={handleTabsConfigFromEditor}
          disableAutoTitle={true}
        />
      </div>
    </div>
  );
};

export default EditEmployeePage;
