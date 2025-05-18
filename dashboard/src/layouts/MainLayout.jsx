import React from "react";
import Sidebar from "./Sidebar"; // Adjust path as needed
import Header from "./Header"; // Adjust path as needed
import { useLayout } from "../contexts/LayoutContext"; // Adjust path as needed

const MainLayout = ({ children, user, onLogout }) => {
  const { pageTitle } = useLayout();

  return (
    <div className="h-screen bg-surface-ground text-text-color flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={onLogout} pageTitle={pageTitle} />
        <main
          style={{ boxShadow: "inset 0 3px 4px rgba(0, 0, 0, 0.1)" }}
          className="flex-1 bg-surface-ground overflow-y-auto relative p-4 md:p-6 rounded-tl-3xl rounded-tr-xl"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
