// src/pages/employee/EmployeesPage.jsx - Updated to use layout actions
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeTable from "@/pages/employee/doctype/EmployeeTable";
import { setCookie, getCookie } from "@/utils/cookies";
import { useLayout } from "@/contexts/LayoutContext";
import { RUA_EMPLOYEE_DOCTYPE } from "@/constants";

const VIEW_MODE_COOKIE = "employee_view_mode";

const EmployeesPage = () => {
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
  const [viewMode, setViewMode] = useState("list");

  // Effect for initializing viewMode from cookie
  useEffect(() => {
    const savedViewMode = getCookie(VIEW_MODE_COOKIE);
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  const handleToggleView = useCallback((newViewMode) => {
    setViewMode(newViewMode);
    setCookie(VIEW_MODE_COOKIE, newViewMode, 30);
  }, []);

  // Effect for setting page title, breadcrumbs and actions
  useEffect(() => {
    setPageTitle("Employees");
    setHomeLink({ icon: "pi pi-home", url: "/" });

    const currentBreadcrumbItems = [
      { label: "Employees", url: "/employees" },
      {
        label: viewMode === "list" ? "List View" : "Grid View",
      },
    ];
    setBreadcrumbItems(currentBreadcrumbItems);

    // Set page actions
    setPrimaryAction({
      label: "New Employee",
      icon: "pi pi-plus",
      command: () => navigate(`/${RUA_EMPLOYEE_DOCTYPE.route}/new`),
      showLabel: true,
    });

    setSecondaryActions([
      {
        label: "List View",
        icon: "pi pi-list",
        command: () => handleToggleView("list"),
        className:
          viewMode === "list" ? "text-primary-color bg-primary-50" : "",
      },
      {
        label: "Grid View",
        icon: "pi pi-th-large",
        command: () => handleToggleView("grid"),
        className:
          viewMode === "grid" ? "text-primary-color bg-primary-50" : "",
      },
      {
        label: "Refresh",
        icon: "pi pi-refresh",
        command: () => window.location.reload(),
      },
    ]);

    setMenuActions([
      {
        label: "Export All",
        icon: "pi pi-download",
        command: () => console.log("Export all employees"),
      },
      {
        label: "Import",
        icon: "pi pi-upload",
        command: () => console.log("Import employees"),
      },
      { separator: true },
      {
        label: "Settings",
        icon: "pi pi-cog",
        command: () => console.log("Employee settings"),
      },
    ]);

    return () => {
      clearActions();
      setBreadcrumbItems([]);
    };
  }, [
    viewMode,
    navigate,
    // Layout setter functions are stable and don't need to be in dependencies
  ]);

  return (
    <div className="space-y-6">
      {/* Content Based on View Mode - Removed local header */}
      {viewMode === "list" && (
        <div className="bg-surface-card rounded-3xl shadow-sm border border-surface-border overflow-hidden">
          <EmployeeTable />
        </div>
      )}

      {viewMode === "grid" && (
        <div className="bg-surface-card rounded-xl shadow-sm border border-surface-border p-6">
          <div className="text-center py-12">
            <i className="pi pi-th-large text-4xl text-text-color-secondary mb-4 block"></i>
            <h3 className="text-lg font-semibold text-text-color mb-2">
              Grid View
            </h3>
            <p className="text-text-color-secondary">
              Employee grid view (using DataView) will be implemented here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
