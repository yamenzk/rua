// dashboard/src/pages/EmployeesPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import EmployeeTable from "@/pages/employee/doctype/EmployeeTable"; // Adjust path as needed
import { setCookie, getCookie } from "@/utils/cookies"; // Adjust path as needed
import { useLayout } from "@/contexts/LayoutContext"; // Adjust path as needed


const VIEW_MODE_COOKIE = "employee_view_mode";

const EmployeesPage = () => {
  const { setPageTitle, setBreadcrumbItems, setHomeLink } = useLayout();
  const [viewMode, setViewMode] = useState("list"); // Default view mode

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
  }, []); // Empty dependency array as setViewMode and setCookie are stable

  // Effect for setting page title and breadcrumbs
  useEffect(() => {
    setPageTitle("Employees Management");
    setHomeLink({ icon: "pi pi-home", url: "/" });

    const currentBreadcrumbItems = [
      { label: "Employees", url: "/employees" }, // Or remove URL if it's the current page and should not be clickable
      {
        label: viewMode === "list" ? "List View" : "Grid View", // Fallback label for screen readers or if template doesn't render
        template: () => (
          <div className="flex items-center">
            <a
              onClick={() => handleToggleView("list")}
              className={`p-menuitem-link cursor-pointer ${
                viewMode === "list"
                  ? "text-primary-color font-semibold" // Example: highlight active view
                  : "hover:text-primary-color"
              }`}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === "Enter" && handleToggleView("list")}
              aria-label="Switch to List View"
            >
              <span className="pi pi-list mr-2" /> List
            </a>
            <span className="mx-2 text-text-color-secondary">/</span>
            <a
              onClick={() => handleToggleView("grid")}
              className={`p-menuitem-link cursor-pointer ${
                viewMode === "grid"
                  ? "text-primary-color font-semibold" // Example: highlight active view
                  : "hover:text-primary-color"
              }`}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === "Enter" && handleToggleView("grid")}
              aria-label="Switch to Grid View"
            >
              <span className="pi pi-th-large mr-2" /> Grid
            </a>
          </div>
        ),
      },
    ];
    setBreadcrumbItems(currentBreadcrumbItems);

    // Cleanup function to clear breadcrumbs when the component unmounts
    return () => {
      setBreadcrumbItems([]);
      // Optionally reset page title if needed, e.g., setPageTitle("Dashboard");
    };
  }, [
    setPageTitle,
    setBreadcrumbItems,
    setHomeLink,
    viewMode,
    handleToggleView,
  ]);

  return (
    <>
      {/* AppBreadcrumb is no longer rendered here. It's in MainLayout > Header */}
      {viewMode === "list" && (
        <div class="max-w-[1500px] mx-auto">
        <EmployeeTable />
        </div>
    )}
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
