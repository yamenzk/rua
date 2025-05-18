import React, { useState, useEffect, useCallback } from "react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb"; // Adjust path as needed
import EmployeeTable from "@/components/employees/EmployeeTable"; // Adjust path as needed
import { setCookie, getCookie } from "@/utils/cookies"; // Adjust path as needed
import { useLayout } from "@/contexts/LayoutContext"; // Adjust path as needed

const VIEW_MODE_COOKIE = "employee_view_mode";

const EmployeesPage = () => {
  const { setLayoutConfig } = useLayout();
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    setLayoutConfig({ title: "Employees Management" });
    const savedViewMode = getCookie(VIEW_MODE_COOKIE);
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, [setLayoutConfig]);

  const handleToggleView = useCallback((newViewMode) => {
    setViewMode(newViewMode);
    setCookie(VIEW_MODE_COOKIE, newViewMode, 30);
  }, []);

  const breadcrumbItems = [
    { label: "Employees", url: "/employees" },
    {
      label: viewMode === "list" ? "List View" : "Grid View",
      template: () => (
        <div className="flex items-center">
          <a
            onClick={() => handleToggleView("list")}
            className={`p-menuitem-link cursor-pointer ${
              viewMode === "list"
                ? "text-primary-color font-semibold"
                : "hover:text-primary-color"
            }`}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === "Enter" && handleToggleView("list")}
          >
            <span className="pi pi-list mr-2" /> List
          </a>
          <span className="mx-2 text-text-color-secondary">/</span>
          <a
            onClick={() => handleToggleView("grid")}
            className={`p-menuitem-link cursor-pointer ${
              viewMode === "grid"
                ? "text-primary-color font-semibold"
                : "hover:text-primary-color"
            }`}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === "Enter" && handleToggleView("grid")}
          >
            <span className="pi pi-th-large mr-2" /> Grid
          </a>
        </div>
      ),
    },
  ];

  const homeBreadcrumb = { icon: "pi pi-home", url: "/" };

  return (
    <>
      <AppBreadcrumb items={breadcrumbItems} home={homeBreadcrumb} />
      {viewMode === "list" && <EmployeeTable />}
      {viewMode === "grid" && (
        <div className="p-card p-5 rounded-lg bg-surface-card shadow-md">
          <h3 className="text-xl font-semibold text-text-color mb-2">
            Grid View
          </h3>
          <p className="text-text-color-secondary">
            Employee grid view (using DataView) will be implemented here.
          </p>
        </div>
      )}
    </>
  );
};

export default EmployeesPage;
