// src/pages/employee/EmployeesPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import EmployeeTable from "@/pages/employee/doctype/EmployeeTable";
import { setCookie, getCookie } from "@/utils/cookies";
import { useLayout } from "@/contexts/LayoutContext";
import { Button } from "primereact/button";

const VIEW_MODE_COOKIE = "employee_view_mode";

const EmployeesPage = () => {
  const { setPageTitle, setBreadcrumbItems, setHomeLink } = useLayout();
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

  // Effect for setting page title and breadcrumbs
  useEffect(() => {
    setPageTitle("Employees");
    setHomeLink({ icon: "pi pi-home", url: "/" });

    const currentBreadcrumbItems = [
      { label: "Employees", url: "/employees" },
      {
        label: viewMode === "list" ? "List View" : "Grid View",
        template: () => (
          <div className="flex items-center gap-3">
            <Button
              icon="pi pi-list"
              text
              rounded
              size="small"
              className={`${
                viewMode === "list"
                  ? "text-primary-color bg-primary-50"
                  : "text-text-color-secondary hover:text-text-color hover:bg-surface-hover"
              }`}
              onClick={() => handleToggleView("list")}
              tooltip="List View"
              tooltipOptions={{ position: "bottom" }}
            />
            <Button
              icon="pi pi-th-large"
              text
              rounded
              size="small"
              className={`${
                viewMode === "grid"
                  ? "text-primary-color bg-primary-50"
                  : "text-text-color-secondary hover:text-text-color hover:bg-surface-hover"
              }`}
              onClick={() => handleToggleView("grid")}
              tooltip="Grid View"
              tooltipOptions={{ position: "bottom" }}
            />
          </div>
        ),
      },
    ];
    setBreadcrumbItems(currentBreadcrumbItems);

    return () => {
      setBreadcrumbItems([]);
    };
  }, [
    setPageTitle,
    setBreadcrumbItems,
    setHomeLink,
    viewMode,
    handleToggleView,
  ]);

  return (
    <div className="space-y-6">
      {/* View Toggle Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-color">
            Employee {viewMode === "list" ? "List" : "Grid"}
          </h2>
          <p className="text-sm text-text-color-secondary">
            Manage your employees and their information
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon="pi pi-list"
            text={viewMode !== "list"}
            outlined={viewMode === "list"}
            size="small"
            className={
              viewMode === "list"
                ? "bg-primary-color text-primary-color-text"
                : ""
            }
            onClick={() => handleToggleView("list")}
            tooltip="List View"
          />
          <Button
            icon="pi pi-th-large"
            text={viewMode !== "grid"}
            outlined={viewMode === "grid"}
            size="small"
            className={
              viewMode === "grid"
                ? "bg-primary-color text-primary-color-text"
                : ""
            }
            onClick={() => handleToggleView("grid")}
            tooltip="Grid View"
          />
        </div>
      </div>

      {/* Content Based on View Mode */}
      {viewMode === "list" && (
        <div className="bg-surface-card rounded-xl shadow-sm border border-surface-border overflow-hidden">
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
