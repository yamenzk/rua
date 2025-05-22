// src/components/common/document/SectionWrapper.jsx
import React, { useState, memo } from "react";
import { Button } from "primereact/button";

const SectionWrapper = memo(
  ({ children, config, isFirstSection, columnCount }) => {
    const [isCollapsed, setIsCollapsed] = useState(() => {
      if (!config || !config.collapsible) return false;
      return config.collapsible && !isFirstSection;
    });

    if (
      !config ||
      (!config.label &&
        columnCount === 0 &&
        (!config.description || !config.collapsible))
    ) {
      return <>{children}</>;
    }

    return (
      <div className="space-y-4">
        {(config.label || config.collapsible) && (
          <div className="border-b border-surface-border pb-3">
            <div className="flex items-center justify-between">
              <div>
                {config.label && (
                  <h3 className="text-lg font-semibold text-text-color">
                    {config.label}
                  </h3>
                )}
                {config?.description && (
                  <p className="text-sm text-text-color-secondary mt-1">
                    {config.description}
                  </p>
                )}
              </div>
              {config.collapsible && (
                <Button
                  icon={`pi ${
                    isCollapsed ? "pi-chevron-down" : "pi-chevron-up"
                  }`}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  text
                  rounded
                  aria-label={
                    isCollapsed ? "Expand section" : "Collapse section"
                  }
                />
              )}
            </div>
          </div>
        )}
        {(!config || !config.collapsible || !isCollapsed) && children}
      </div>
    );
  }
);
SectionWrapper.displayName = "SectionWrapper";

export default SectionWrapper;
