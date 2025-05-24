// src/contexts/LayoutContext.jsx - Enhanced with actions
import React, { createContext, useState, useContext } from "react";

const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [breadcrumbItems, setBreadcrumbItems] = useState([]);
  const [homeLink, setHomeLink] = useState({ icon: "pi pi-home", url: "/" });

  // New action states
  const [primaryAction, setPrimaryAction] = useState(null);
  const [secondaryActions, setSecondaryActions] = useState([]);
  const [menuActions, setMenuActions] = useState([]);

  // Helper to clear all actions
  const clearActions = () => {
    setPrimaryAction(null);
    setSecondaryActions([]);
    setMenuActions([]);
  };

  return (
    <LayoutContext.Provider
      value={{
        pageTitle,
        setPageTitle,
        breadcrumbItems,
        setBreadcrumbItems,
        homeLink,
        setHomeLink,
        // Action management
        primaryAction,
        setPrimaryAction,
        secondaryActions,
        setSecondaryActions,
        menuActions,
        setMenuActions,
        clearActions,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};
