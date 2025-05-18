import React, { createContext, useState, useContext } from "react";

const LayoutContext = createContext();

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider = ({ children }) => {
  const [pageTitle, setPageTitle] = useState("Dashboard");

  const setLayoutConfig = ({ title }) => {
    if (title) {
      setPageTitle(title);
    }
  };

  return (
    <LayoutContext.Provider value={{ pageTitle, setLayoutConfig }}>
      {children}
    </LayoutContext.Provider>
  );
};
