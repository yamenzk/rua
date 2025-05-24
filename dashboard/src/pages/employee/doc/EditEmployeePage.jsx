// src/pages/employee/doc/EditEmployeePage.jsx - Complete version with unsaved changes tracking
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Chip } from "primereact/chip";
import { Badge } from "primereact/badge";
import { ProgressSpinner } from "primereact/progressspinner";
import DocEditor from "@/components/document/DocEditor";
import ModernTabNavigation from "@/components/common/ModernTabNavigation";
import { RUA_EMPLOYEE_DOCTYPE } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { useFrappeGetDoc } from "frappe-react-sdk";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

const EditEmployeePage = () => {
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
  const editorRef = useRef(null);

  const [isEditorCurrentlySaving, setIsEditorCurrentlySaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [docToolbarTabProps, setDocToolbarTabProps] = useState({
    tabs: [],
    activeIndex: 0,
    onTabSelect: null,
  });

  const isCreateMode = !employeeId;

  // Handle unsaved changes navigation warning
  const { navigateWithWarning } = useUnsavedChanges(
    hasUnsavedChanges && !isEditorCurrentlySaving,
    "You have unsaved changes. Are you sure you want to leave this page?"
  );

  // Fetch minimal employee data for header
  const { data: employeeMinimalData, isLoading: isLoadingMinimalData } =
    useFrappeGetDoc(RUA_EMPLOYEE_DOCTYPE.name, employeeId, {
      fields: ["employee_name", "image", "position", "branch"],
      enabled: !!employeeId,
    });

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

  // Handle form changes to track unsaved state
  const handleFormChange = useCallback(() => {
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    }
  }, [hasUnsavedChanges]);

  // Safe navigation function that checks for unsaved changes
  const handleCancel = useCallback(() => {
    const destination = employeeId
      ? `/employees/view/${employeeId}`
      : "/employees";
    navigateWithWarning(destination);
  }, [employeeId, navigateWithWarning]);

  const handleSaveSuccess = (savedDoc) => {
    setIsEditorCurrentlySaving(false);
    setHasUnsavedChanges(false); // Clear unsaved changes flag
    navigate(`/employees/view/${savedDoc.name}`);
  };

  const handleSaveError = (error) => {
    setIsEditorCurrentlySaving(false);
    console.error("Save Error:", error);
  };

  const handleTabsConfigFromEditor = useCallback((config) => {
    setDocToolbarTabProps(
      config || { tabs: [], activeIndex: 0, onTabSelect: null }
    );
  }, []);

  // Set page title, breadcrumbs and actions
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
        <div className="relative p-2">
          <Chip label={displayName} image={employeeMinimalData?.image} />
          <Badge
            value={<i className="pi pi-pencil text-sm"></i>}
            severity="warning"
            className="absolute top-0 right-0  w-6 h-6 flex items-center justify-center rounded-full"
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
        <div className="relative p-2">
          <Chip label="New Employee" icon="pi pi-user-plus" />
          <Badge
            value={<i className="pi pi-plus text-sm"></i>}
            severity="success"
            className="absolute top-0 right-0  w-6 h-6 flex items-center justify-center rounded-full"
          />
        </div>
      ));

      baseBreadcrumbs.push({ label: "New Employee" });
    }

    setBreadcrumbItems(baseBreadcrumbs);
    setHomeLink({ icon: "pi pi-home", url: "/" });

    // Set page actions
    setPrimaryAction({
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
      disabled: isEditorCurrentlySaving,
      loading: isEditorCurrentlySaving,
      showLabel: true, // Show label for primary save action
    });

    setSecondaryActions([
      {
        label: "Cancel",
        icon: "pi pi-times",
        command: handleCancel, // Use safe navigation
        disabled: isEditorCurrentlySaving,
      },
    ]);

    // Optional menu actions for edit mode
    if (!isCreateMode) {
      setMenuActions([
        {
          label: "Preview",
          icon: "pi pi-eye",
          command: () => navigateWithWarning(`/employees/view/${employeeId}`), // Use safe navigation
        },
        {
          label: "Reset Form",
          icon: "pi pi-refresh",
          command: () => window.location.reload(),
        },
      ]);
    } else {
      setMenuActions([]); // No menu actions for create mode
    }

    return () => {
      clearActions();
      setBreadcrumbItems([]);
    };
  }, [
    employeeId,
    employeeMinimalData,
    isEditorCurrentlySaving,
    isCreateMode,
    navigate,
    triggerSave,
    handleCancel,
    navigateWithWarning,
    // Layout setter functions are stable and don't need to be in dependencies
  ]);

  return (
    <div className="space-y-6 h-full">
      {/* Editor Content - Removed local action header */}
      <div className="bg-surface-0 h-full rounded-3xl overflow-hidden">
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
          onFormChange={handleFormChange} // Track form changes
          externalTabsEnabled={true}
          onTabsConfigChange={handleTabsConfigFromEditor}
          disableAutoTitle={true}
        />
      </div>
    </div>
  );
};

export default EditEmployeePage;
