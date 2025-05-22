// dashboard/src/components/common/DocToolbar.jsx - Enhanced with audit info
import React from "react";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import AuditInfo from "./AuditInfo";

const DocToolbar = ({
  title,
  primaryActions = [],
  secondaryActions = [],
  onBack,
  leftContent,
  // New props for tabs
  tabs = [],
  activeTabIndex,
  onTabSelect,
  // New prop for audit information
  docData, // Pass document data to show audit info
  showAuditInfo = true, // Toggle audit info display
}) => {
  const menuRef = React.useRef(null);

  const moreActionsModel = secondaryActions
    .filter((action) => action.visible !== false)
    .map((action) => ({
      label: action.label,
      icon: action.icon,
      command: action.command,
      disabled: action.disabled,
      className: action.className,
      style: action.style,
    }));

  return (
    <div className="doc-toolbar bg-surface-section m-[1.25rem] shadow-xl p-3 rounded-xl sticky top-0 z-50">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left side: Back button, Custom Left Content */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {onBack && (
            <Button
              icon="pi pi-arrow-left"
              text
              rounded
              aria-label="Back"
              onClick={onBack}
              className="p-button-secondary text-text-color-secondary hover:text-primary-color hover:bg-surface-hover flex-shrink-0"
              tooltip="Back"
              tooltipOptions={{ position: "bottom" }}
            />
          )}

          <div className="flex flex-col gap-1">
            {/* Custom content area (e.g., Avatar, name) */}
            {leftContent && (
              <div className="flex items-center gap-3">{leftContent}</div>
            )}

            {/* Optional Title - Render if provided and no custom leftContent */}
            {title && !leftContent && (
              <h2 className="text-xl font-semibold text-text-color m-0 truncate">
                {title}
              </h2>
            )}

            {/* Audit Information */}
            {showAuditInfo && docData && <AuditInfo docData={docData} />}
          </div>
        </div>

        {/* Middle: Tabs (if any) */}
        {tabs &&
          tabs.length > 0 &&
          typeof activeTabIndex === "number" &&
          onTabSelect && (
            <div className="flex-grow flex justify-center items-center gap-1 sm:gap-2 px-2 sm:px-0 md:px-4 overflow-x-auto no-scrollbar py-2">
              {tabs.map((tab, index) => (
                <Button
                  key={tab.id || tab.slug || `toolbar-tab-${index}`}
                  label={tab.label}
                  icon={
                    tab.icon
                      ? tab.icon.startsWith("pi ")
                        ? tab.icon
                        : `pi ${tab.icon}`
                      : undefined
                  }
                  className={`p-button-sm rounded-full whitespace-nowrap transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                    index === activeTabIndex
                      ? "bg-primary text-primary-contrast hover:bg-primary-emphasis"
                      : "p-button-text text-text-color-secondary hover:bg-surface-hover hover:text-text-color"
                  }`}
                  onClick={() => onTabSelect(index, tab)}
                  disabled={tab.disabled}
                  tooltip={tab.tooltip || tab.label}
                  tooltipOptions={{ position: "bottom" }}
                />
              ))}
            </div>
          )}

        {/* Right side: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {primaryActions
            .filter((action) => action.visible !== false)
            .map((action, index) => (
              <Button
                key={action.id || `primary-action-${index}`}
                label={action.label}
                icon={action.icon}
                onClick={action.command}
                className={`p-button-sm rounded-md ${
                  action.className || "p-button-primary"
                }`}
                disabled={action.disabled}
                loading={action.loading}
                tooltip={action.tooltip}
                tooltipOptions={{ position: "top", ...action.tooltipOptions }}
              />
            ))}
          {moreActionsModel.length > 0 && (
            <>
              <Menu
                model={moreActionsModel}
                popup
                ref={menuRef}
                id="doc_toolbar_actions_menu"
              />
              <Button
                icon="pi pi-ellipsis-v"
                text
                rounded
                aria-label="More actions"
                onClick={(event) => menuRef.current?.toggle(event)}
                aria-haspopup
                aria-controls="doc_toolbar_actions_menu"
                className="p-button-secondary text-text-color-secondary hover:text-primary-color hover:bg-surface-hover"
                tooltip="More Actions"
                tooltipOptions={{ position: "top" }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocToolbar;
