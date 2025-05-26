import React, { createContext, useContext } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children, theme = "elevated" }) => {
  const themeConfig = {
    // Current theme
    preset: theme,

    // Theme-specific configurations
    themes: {
      corporate: {
        preset: "gentle",
        colors: "professional",
        spacing: "comfortable",
      },
      creative: {
        preset: "dynamic",
        colors: "vibrant",
        spacing: "compact",
      },
      minimal: {
        preset: "minimal",
        colors: "monochrome",
        spacing: "tight",
      },
    },
  };

  return (
    <ThemeContext.Provider value={themeConfig}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
