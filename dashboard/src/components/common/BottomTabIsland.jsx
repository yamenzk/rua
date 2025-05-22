// src/components/common/BottomTabIsland.jsx - Using imported emoji utilities
import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { CSSTransition } from "react-transition-group";
import { parseEmojiFromText } from "@/constants/emojiRegex";

const BottomTabIsland = ({ tabs = [], activeTabIndex = 0, onTabSelect }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Show island only when tabs are available
  useEffect(() => {
    setIsVisible(tabs && tabs.length > 0);
  }, [tabs]);

  if (!isVisible || !tabs || tabs.length === 0) return null;

  // Helper function to extract emoji and text from tab label
  const parseTabLabel = (label) => {
    if (!label) return { icon: null, text: "Tab" };

    // Use the imported utility function
    const { emoji, remainingText } = parseEmojiFromText(label);

    if (emoji) {
      return {
        icon: emoji,
        text: remainingText || label,
      };
    }

    // If no emoji, check if entire label is short enough to be used as icon
    if (label.length <= 3) {
      return { icon: label, text: label };
    }

    return { icon: null, text: label };
  };

  // Helper function to get display icon for tab
  const getTabIcon = (tab, index) => {
    const parsed = parseTabLabel(tab.label);
    return parsed.icon || (index + 1).toString();
  };

  // Helper function to get tooltip text
  const getTooltipText = (tab) => {
    const parsed = parseTabLabel(tab.label);
    return parsed.text;
  };

  const handleTabClick = (index, tab) => {
    if (onTabSelect) {
      onTabSelect(index, tab);
    }
  };

  return (
    <>
      {/* Bottom Tab Island */}
      <CSSTransition
        in={isVisible}
        timeout={500}
        classNames="dynamic-island-slide"
        unmountOnExit
      >
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <div
            className="
              bg-surface-ground backdrop-blur-xl rounded-full border border-surface-border shadow-2xl
              transition-all duration-700 ease-out
              hover:bg-surface-50/95 hover:shadow-xl hover:border-surface-300 hover:scale-105
              px-4 py-3
            "
          >
            <div className="flex items-center gap-2">
              {tabs.map((tab, index) => (
                <Button
                  key={tab.id || `tab-${index}`}
                  className={`
                    p-button-rounded transition-all duration-300 ease-out
                    w-10 h-10 text-sm font-semibold transform hover:scale-110
                    flex items-center justify-center
                    ${
                      index === activeTabIndex
                        ? "p-button-primary shadow-lg scale-110 ring-2 ring-primary-200"
                        : "p-button-outlined border-surface-300 text-text-color hover:bg-surface-100 hover:border-surface-400"
                    }
                  `}
                  onClick={() => handleTabClick(index, tab)}
                  disabled={tab.disabled}
                  tooltip={getTooltipText(tab)}
                  tooltipOptions={{
                    position: "top",
                    showDelay: 300,
                    className: "text-xs",
                  }}
                >
                  <span className="flex items-center justify-center w-full h-full">
                    {getTabIcon(tab, index)}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CSSTransition>
    </>
  );
};

export default BottomTabIsland;
