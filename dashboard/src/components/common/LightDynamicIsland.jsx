// src/components/common/LightDynamicIsland.jsx - Updated with mouse hover and simplified expanded state
import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { CSSTransition } from "react-transition-group";
import { formatDisplayDateTime } from "@/utils/formatters";

const LightDynamicIsland = ({
  title,
  primaryActions = [],
  secondaryActions = [],
  onBack,
  leftContent,
  docData,
  showAuditInfo = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef(null);
  const expandedRef = useRef(null);
  const collapsedRef = useRef(null);

  // Auto-collapse after 5 seconds of no interaction, but not if hovered
  useEffect(() => {
    if (isExpanded && !isHovered) {
      const timer = setTimeout(() => setIsExpanded(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, isHovered]);

  const formatUserName = (username) => {
    if (!username) return "Unknown";
    if (username === "Administrator") return "Admin";
    return username;
  };

  const moreActionsModel = secondaryActions
    .filter((action) => action.visible !== false)
    .map((action) => ({
      label: action.label,
      icon: action.icon,
      command: action.command,
      disabled: action.disabled,
    }));

  const hasAuditInfo =
    showAuditInfo && docData && (docData.creation || docData.modified);

  // Calculate how many primary actions we can show before moving to secondary menu
  const maxPrimaryActions = 4; // Adjust based on your UI needs
  const visiblePrimaryActions = primaryActions.slice(0, maxPrimaryActions);
  const overflowActions = primaryActions.slice(maxPrimaryActions);
  const allSecondaryActions = [...overflowActions, ...moreActionsModel];

  return (
    <>
      {/* Light Mode Dynamic Island */}
      <div className="fixed top-30 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out">
        <div
          className={`
            bg-surface-ground backdrop-blur-xl rounded-full shadow-2xl
              transition-all duration-700 ease-out
              hover:bg-surface-50/95 hover:shadow-xl hover:border-surface-300 hover:scale-105
              px-4 py-3
            ${
              isExpanded
                ? "px-8 py-4 min-w-[600px] rounded-3xl"
                : "px-6 py-3 min-w-[400px]"
            }
          `}
          onClick={() => !isExpanded && setIsExpanded(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Collapsed State */}
          <CSSTransition
            in={!isExpanded}
            timeout={600}
            classNames="dynamic-island-collapse"
            unmountOnExit
            nodeRef={collapsedRef}
          >
            <div
              ref={collapsedRef}
              className="flex items-center justify-between text-text-color w-full"
            >
              {/* Left: User Avatar + Info */}
              <div className="flex items-center gap-3">
                {leftContent}
                {title && !leftContent && (
                  <span className="font-medium text-sm truncate max-w-[150px] text-text-color-secondary">
                    {title}
                  </span>
                )}
              </div>

              {/* Right: Primary Action + Menu */}
              <div className="flex items-center gap-2">
                {primaryActions.length > 0 && (
                  <Button
                    icon={primaryActions[0].icon}
                    className="p-button-primary p-button-rounded p-button-sm transition-all duration-300 hover:scale-110 shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      primaryActions[0].command();
                    }}
                    tooltip={primaryActions[0].label}
                    tooltipOptions={{ position: "bottom" }}
                    disabled={primaryActions[0].disabled}
                    loading={primaryActions[0].loading}
                  />
                )}

                <Button
                  icon="pi pi-ellipsis-h"
                  className="p-button-text p-button-rounded p-button-sm text-text-color-secondary hover:text-text-color hover:bg-surface-100 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                  }}
                  tooltip="More actions"
                  tooltipOptions={{ position: "bottom" }}
                />
              </div>
            </div>
          </CSSTransition>

          {/* Expanded State - Focus on Actions */}
          <CSSTransition
            in={isExpanded}
            timeout={600}
            classNames="dynamic-island-expand"
            unmountOnExit
            nodeRef={expandedRef}
          >
            <div ref={expandedRef} className="text-text-color space-y-4">
              {/* Main Actions Row */}
              <div className="flex items-center justify-center gap-3">
                {/* All Visible Primary Actions */}
                {visiblePrimaryActions.map((action, index) => (
                  <Button
                    key={action.id || `primary-${index}`}
                    label={action.label}
                    icon={action.icon}
                    className={`
                      p-button-sm rounded-full transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105
                      ${
                        index === 0
                          ? "p-button-primary shadow-lg hover:shadow-xl"
                          : "p-button-outlined border-surface-300 text-text-color hover:bg-surface-100"
                      }
                    `}
                    onClick={action.command}
                    disabled={action.disabled}
                    loading={action.loading}
                  />
                ))}

                {/* More Actions Menu */}
                {allSecondaryActions.length > 0 && (
                  <>
                    <Menu
                      model={allSecondaryActions}
                      popup
                      ref={menuRef}
                      className="shadow-xl border border-surface-border"
                    />
                    <Button
                      icon="pi pi-ellipsis-h"
                      className="p-button-text p-button-rounded text-text-color-secondary hover:text-text-color hover:bg-surface-100"
                      onClick={(event) => menuRef.current?.toggle(event)}
                    />
                  </>
                )}

                {/* Back and Collapse Actions */}
                <div className="flex items-center gap-2 ml-4 pl-4 border-l border-surface-border">
                  {onBack && (
                    <Button
                      icon="pi pi-arrow-left"
                      className="p-button-text p-button-rounded text-text-color-secondary hover:text-text-color hover:bg-surface-100"
                      onClick={onBack}
                      tooltip="Go back"
                      tooltipOptions={{ position: "bottom" }}
                    />
                  )}
                  <Button
                    icon="pi pi-times"
                    className="p-button-text p-button-rounded text-text-color-secondary hover:text-text-color"
                    onClick={() => setIsExpanded(false)}
                    tooltip="Collapse"
                    tooltipOptions={{ position: "bottom" }}
                  />
                </div>
              </div>

              {/* Audit Info Row */}
              {hasAuditInfo && (
                <div className="flex items-center justify-center text-xs text-text-color-secondary border-t border-surface-border pt-3">
                  <div className="flex items-center gap-4">
                    {docData.creation && docData.owner && (
                      <div className="flex items-center gap-1">
                        <i className="pi pi-plus-circle text-green-500"></i>
                        <span>
                          {formatDisplayDateTime(docData.creation)} by{" "}
                          <span className="text-text-color font-medium">
                            {formatUserName(docData.owner)}
                          </span>
                        </span>
                      </div>
                    )}
                    {docData.modified &&
                      docData.modified_by &&
                      new Date(docData.modified) >
                        new Date(docData.creation || 0) && (
                        <div className="flex items-center gap-1">
                          <i className="pi pi-pencil text-orange-500"></i>
                          <span>
                            Updated {formatDisplayDateTime(docData.modified)} by{" "}
                            <span className="text-text-color font-medium">
                              {formatUserName(docData.modified_by)}
                            </span>
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          </CSSTransition>
        </div>
      </div>

      {/* Spacer to prevent content overlap */}
      <div className="h-20" />
    </>
  );
};

export default LightDynamicIsland;
