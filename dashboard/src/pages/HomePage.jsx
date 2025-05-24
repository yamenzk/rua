// src/pages/HomePage.jsx
import React, { useEffect } from "react";
import { useLayout } from "../contexts/LayoutContext";

const HomePage = () => {
  const { setPageTitle, setBreadcrumbItems, setHomeLink } = useLayout();

  useEffect(() => {
    setPageTitle("Dashboard Overview");
    setBreadcrumbItems([{ label: "Dashboard", url: "/" }]);
    setHomeLink({ icon: "pi pi-home", url: "/" });
  }, [setPageTitle, setBreadcrumbItems, setHomeLink]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-8 text-primary-color-text">
        <h2 className="text-2xl font-bold mb-2">Welcome back! 👋</h2>
        <p className="text-primary-100">Here's your dashboard overview.</p>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-surface-card rounded-xl shadow-sm border border-surface-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-color">
              Recent Activity
            </h3>
            <button className="text-sm text-primary-color hover:text-primary-600">
              View all
            </button>
          </div>
          <div className="text-center text-text-color-secondary py-8">
            <i className="pi pi-clock text-3xl mb-4 block"></i>
            <p>No recent activity</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface-card rounded-xl shadow-sm border border-surface-border p-6">
          <h3 className="text-lg font-semibold text-text-color mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "New Item", icon: "pi pi-plus" },
              { label: "Import", icon: "pi pi-upload" },
              { label: "Export", icon: "pi pi-download" },
              { label: "Settings", icon: "pi pi-cog" },
            ].map((action, index) => (
              <button
                key={index}
                className="p-4 rounded-lg border-2 border-dashed border-surface-border transition-all duration-200 hover:border-primary-color hover:bg-surface-hover"
              >
                <div className="text-center">
                  <i
                    className={`${action.icon} text-2xl text-text-color-secondary mb-2 block`}
                  ></i>
                  <span className="text-sm font-medium text-text-color">
                    {action.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
