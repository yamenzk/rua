// src/components/common/UniversalLayoutRenderer.jsx
import React, { memo, useEffect } from "react"; // useEffect might still be needed for onTabsProcessed
import { TabView, TabPanel } from "primereact/tabview";
import { Message } from "primereact/message";

// Custom Hooks
import { useTabConfiguration } from "@/hooks/useTabConfiguration";
import { useTabLayoutRouting } from "@/hooks/useTabLayoutRouting";

// Child Components
import TabContentOrchestrator from "@/components/document/TabContentOrchestrator";
// layoutUtils are primarily used within the hooks and child components now

const UniversalLayoutRendererInternal = ({
  formSchema,
  allFieldsSchema,
  renderFieldItem,
  initialActiveTabIndex = 0,
  onTabChangeCallback,
  customUIAugmentations,
  docData,
  customComponentContext,
  tabViewBackgroundColor = "transparent",
  tabContentBackgroundColor = "transparent",
  tabPadding = "0",
  bubbleStyle = true,
  // Routing and External Tab Control props
  enableRouting = false,
  onTabsProcessed, // Callback to parent when tabs are configured
  externalActiveTabIndex,
  hideInternalTabViewHeader = false,
  // baseUrl, // Not directly used here anymore if routing logic is in the hook
}) => {
  // 1. Get Tab Configuration
  const trulyFinalTabsConfig = useTabConfiguration(
    formSchema,
    allFieldsSchema,
    customUIAugmentations
  );

  // 2. Manage Tab Routing and Active State
  const { activeTabIndex, handleTabChange } = useTabLayoutRouting({
    trulyFinalTabsConfig,
    enableRouting,
    initialActiveTabIndex,
    externalActiveTabIndex,
    hideInternalTabViewHeader,
    onTabChangeCallback, // This hook can call onTabChangeCallback internally
    // onTabsProcessed // This hook could also call onTabsProcessed, or ULR can do it.
    // Let's have ULR call it to keep the hook focused on routing.
  });

  // Effect to inform parent about processed tabs.
  // This is important if the parent needs the tab list (e.g., for DocToolbar).
  useEffect(() => {
    if (onTabsProcessed) {
      onTabsProcessed(trulyFinalTabsConfig);
    }
  }, [trulyFinalTabsConfig, onTabsProcessed]);

  // --- UI Feedback for Loading/Error States ---
  if (!formSchema || !allFieldsSchema) {
    return (
      <Message
        severity="warn"
        text="Form schema or allFieldsSchema is missing for UniversalLayoutRenderer."
        className="m-4"
      />
    );
  }

  // If no tabs are derived (even after default logic in useTabConfiguration)
  if (trulyFinalTabsConfig.length === 0 && !onTabsProcessed) {
    // Only show this if tabs are NOT externally managed and expected to be processed later
    // If onTabsProcessed exists, the parent might be about to provide tabs via customUIAugmentations
    // or handle the "no tabs" state itself.
    // However, trulyFinalTabsConfig is the source of truth FROM THIS COMPONENT.
    // So if it's empty, it means ULR itself couldn't find/generate tabs.
    return (
      <Message
        severity="info"
        text="No layout elements or tabs to display."
        className="m-4"
      />
    );
  }

  // --- TabView Styling Configuration ---
  const tabViewPt = {
    root: {
      style: { backgroundColor: tabViewBackgroundColor },
      className: "p-tabview-custom",
    },
    navContainer: {
      style: { display: hideInternalTabViewHeader ? "none" : "block" },
    },
    nav: {
      style: {
        backgroundColor: "transparent",
        border: "none",
        padding:
          bubbleStyle && !hideInternalTabViewHeader ? "8px 2px 16px 2px" : "0",
        display: hideInternalTabViewHeader ? "none" : undefined,
      },
      className:
        bubbleStyle && !hideInternalTabViewHeader
          ? "flex gap-2 justify-start flex-wrap"
          : "",
    },
    inkbar: {
      style: {
        display: bubbleStyle || hideInternalTabViewHeader ? "none" : "block",
      },
    },
    panelContainer: {
      style: {
        backgroundColor: tabContentBackgroundColor,
        padding: tabPadding,
        border: "none",
      },
    },
  };

  const getTabPanelPt = (isActiveTab) => ({
    headerAction: {
      className:
        bubbleStyle && !hideInternalTabViewHeader
          ? `px-4 py-3 rounded-full border-0 transition-all duration-200 text-sm font-medium focus:outline-none ${
              isActiveTab
                ? "bg-primary text-primary-contrast shadow-md"
                : "bg-surface-ground text-text-color hover:border-primary-emphasis hover:bg-primary-emphasis"
            }`
          : !hideInternalTabViewHeader
          ? `rounded-t-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
              isActiveTab
                ? "bg-surface-card"
                : "bg-surface-ground hover:bg-surface-hover"
            }`
          : "",
      style:
        bubbleStyle && !hideInternalTabViewHeader
          ? { border: "none", borderRadius: "9999px" }
          : {},
    },
    content: {
      style: {
        backgroundColor: tabContentBackgroundColor,
        border: "none",
      },
      className: bubbleStyle ? "border-none" : "rounded-b-lg border-none",
    },
  });

  // --- Main Rendering ---
  // Conditional rendering for when tabs are truly empty and parent isn't expected to fill them.
  // This check is a bit tricky if tabs are dynamically supplied to customUIAugmentations and onTabsProcessed is used.
  // For now, if trulyFinalTabsConfig is empty after all processing, and no external mechanism is obviously waiting,
  // it's safer to render the "no tabs" message earlier.
  // The routing hook should handle the case where trulyFinalTabsConfig is empty and prevent errors.
  if (trulyFinalTabsConfig.length === 0) {
    // This condition might already be caught above, but good for safety if onTabsProcessed exists.
    // If onTabsProcessed is defined, it's possible the parent *will* provide tabs or handle "no tabs".
    // But if ULR itself generates no tabs, and parent doesn't provide any, this is the fallback.
    if (!onTabsProcessed) {
      return (
        <Message
          severity="info"
          text="No layout elements or tabs to display based on current configuration."
          className="m-4"
        />
      );
    }
    // If onTabsProcessed exists, we assume the parent might handle the empty state,
    // or is in the process of supplying tabs. Render minimal or nothing to avoid erroring.
    // An alternative is to show a loading spinner here if `onTabsProcessed` exists but `trulyFinalTabsConfig` is empty.
    return null; // Or a loading indicator if tabs are expected from parent
  }

  return (
    <TabView
      activeIndex={activeTabIndex}
      onTabChange={hideInternalTabViewHeader ? undefined : handleTabChange}
      pt={tabViewPt}
      className={
        bubbleStyle && !hideInternalTabViewHeader ? "custom-bubble-tabs" : ""
      }
    >
      {trulyFinalTabsConfig.map((tab, tabIdx) => (
        <TabPanel
          key={tab.id || `tab-${tabIdx}-${tab.slug || "default"}`}
          // Header is only needed if TabView itself is rendering headers
          header={hideInternalTabViewHeader ? " " : tab.label} // Minimal header if hidden for PrimeReact's structure
          headerStyle={
            hideInternalTabViewHeader ? { display: "none" } : undefined
          } // Completely hide if external
          leftIcon={hideInternalTabViewHeader ? undefined : tab.icon}
          disabled={tab.disabled}
          pt={getTabPanelPt(tabIdx === activeTabIndex)}
        >
          {/*
            Conditionally render TabContentOrchestrator only for the active tab
            if performance is a concern for very complex tabs.
            However, PrimeReact's TabPanel usually handles visibility,
            and rendering all of them once might be fine. Test this.
            For now, let's render it, as TabPanel controls display.
          */}
          <TabContentOrchestrator
            tab={tab}
            allFieldsSchema={allFieldsSchema}
            renderFieldItem={renderFieldItem}
            docData={docData}
            customComponentContext={customComponentContext}
            customUIAugmentations={customUIAugmentations} // For injectIntoTabs within orchestrator
          />
        </TabPanel>
      ))}
    </TabView>
  );
};
UniversalLayoutRendererInternal.displayName = "UniversalLayoutRendererInternal";

const UniversalLayoutRenderer = memo(UniversalLayoutRendererInternal);
UniversalLayoutRenderer.displayName = "UniversalLayoutRenderer";

export default UniversalLayoutRenderer;
