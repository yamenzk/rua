// src/contexts/LayoutContext.jsx
import React, { createContext, useState, useContext } from "react";

const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [breadcrumbItems, setBreadcrumbItems] = useState([]);
  const [homeLink, setHomeLink] = useState({ icon: "pi pi-home", url: "/" }); // Default home link

  return (
    <LayoutContext.Provider
      value={{
        pageTitle,
        setPageTitle,
        breadcrumbItems,
        setBreadcrumbItems,
        homeLink,
        setHomeLink,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => useContext(LayoutContext);
