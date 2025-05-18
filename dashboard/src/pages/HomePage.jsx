import React, { useEffect } from "react";
import { useLayout } from "../contexts/LayoutContext"; // Adjust path as needed
// import { Button } from 'primereact/button'; // Example import, if needed

const HomePage = () => {
  const { setLayoutConfig } = useLayout();

  useEffect(() => {
    setLayoutConfig({ title: "Dashboard Overview" });
  }, [setLayoutConfig]);

  return (
    <div className="p-fluid">
      <div className="grid">
        <div className="col-12">
          <div className="card bg-surface-card p-4 rounded-lg shadow-md">
            <h5 className="text-xl font-semibold text-text-color mb-3">
              Welcome to Rua!
            </h5>
            <p className="text-text-color-secondary line-height-3">
              This is your central dashboard. Navigate using the sidebar to
              manage different aspects of your application. The page title is
              now dynamically set to "Dashboard Overview".
            </p>
          </div>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <div className="card bg-surface-card p-4 rounded-lg shadow-md h-full">
            <div className="flex justify-between mb-3">
              <div>
                <span className="block text-text-color-secondary font-medium mb-3">
                  Orders
                </span>
                <div className="text-text-color text-xl font-semibold">152</div>
              </div>
              <div
                className="flex items-center justify-center bg-blue-100 rounded-md"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-shopping-cart text-blue-500 text-xl"></i>
              </div>
            </div>
            <span className="text-green-500 font-medium">24 new </span>
            <span className="text-text-color-secondary">since last visit</span>
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="card bg-surface-card p-4 rounded-lg shadow-md h-full">
            <div className="flex justify-between mb-3">
              <div>
                <span className="block text-text-color-secondary font-medium mb-3">
                  Revenue
                </span>
                <div className="text-text-color text-xl font-semibold">
                  $2.100
                </div>
              </div>
              <div
                className="flex items-center justify-center bg-orange-100 rounded-md"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-map-marker text-orange-500 text-xl"></i>
              </div>
            </div>
            <span className="text-green-500 font-medium">+52% </span>
            <span className="text-text-color-secondary">since last week</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
