// src/layouts/ModernMainLayout.jsx
import React from "react";
import ModernSidebar from "./ModernSidebar";
import ModernHeader from "./ModernHeader";
import { useLayout } from "../contexts/LayoutContext";

const ModernMainLayout = ({ children, user, onLogout }) => {
  const { pageTitle, breadcrumbItems, homeLink } = useLayout();

  return (
    <div className="min-h-screen bg-surface-ground">
      {/* Top Header */}
      <ModernHeader user={user} onLogout={onLogout} />

      <div className="flex">
        {/* Left Sidebar */}
        <ModernSidebar />

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {/* Page Header Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {/* Left: Page Title & Breadcrumbs */}
              <div className="flex-1">
                {breadcrumbItems && breadcrumbItems.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-text-color-secondary mb-3">
                    <i className="pi pi-home"></i>
                    <div className="flex items-center gap-2">
                      {breadcrumbItems.map((item, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && <span>/</span>}
                          {item.url ? (
                            <a
                              href={item.url}
                              className="hover:text-primary-color transition-colors"
                            >
                              {item.label}
                            </a>
                          ) : (
                            <span className="text-text-color font-medium">
                              {item.label}
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Page Title with Back Button */}
                <div className="flex items-center gap-3">
                  {breadcrumbItems && breadcrumbItems.length > 1 && (
                    <button
                      onClick={() => {
                        const previousItem =
                          breadcrumbItems[breadcrumbItems.length - 2];
                        if (previousItem?.url) {
                          window.location.href = previousItem.url;
                        } else {
                          window.history.back();
                        }
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-text-color-secondary hover:text-text-color hover:bg-surface-hover transition-all duration-200"
                      title="Go back"
                    >
                      <i className="pi pi-arrow-left text-sm"></i>
                    </button>
                  )}

                  <h1 className="text-2xl font-bold text-text-color">
                    {typeof pageTitle === "function"
                      ? pageTitle()
                      : pageTitle || "Dashboard"}
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Area - Takes 3 columns */}
            <div className="lg:col-span-3">
              <div className="bg-surface-card rounded-3xl shadow-sm border border-surface-border p-8 overflow-y-auto h-[82vh] scrollbar-hide">
                {children}
              </div>
            </div>

            {/* Side Area - Takes 1 column */}
            <div className="lg:col-span-1">
              <div className="bg-surface-card rounded-3xl shadow-sm border border-surface-border p-6 overflow-y-auto h-[82vh] scrollbar-hide">
                <div className="text-text-color-secondary text-sm text-center">
                  Side panel content
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernMainLayout;
