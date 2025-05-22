// src/components/common/DocLayoutRenderer.jsx
import React, { memo, useEffect } from "react";
import { Message } from "primereact/message"; // Keep Message for error/info

// Custom Hooks
import { useTabConfiguration } from "@/components/document/hooks/useTabConfiguration";
import { useTabLayoutRouting } from "@/components/document/hooks/useTabLayoutRouting";

// Child Components
import TabContentOrchestrator from "@/components/document/layout/TabContentOrchestrator";

const DocLayoutRendererInternal = ({
  formSchema,
  allFieldsSchema,
  renderFieldItem,
  initialActiveTabIndex = 0,
  // onTabChangeCallback, // No longer directly used by ULR with custom tab handling
  customUIAugmentations,
  docData,
  customComponentContext,
  // Styling props for PrimeReact TabView are no longer needed
  enableRouting = false,
  onTabsProcessed,
  externalActiveTabIndex,
  // hideInternalTabViewHeader is effectively always true
}) => {
  const trulyFinalTabsConfig = useTabConfiguration(
    formSchema,
    allFieldsSchema,
    customUIAugmentations
  );

  const { activeTabIndex } = useTabLayoutRouting({
    trulyFinalTabsConfig,
    enableRouting,
    initialActiveTabIndex,
    externalActiveTabIndex,
    hideInternalTabViewHeader: true, // Since we are not using PrimeReact TabView headers
    // onTabChangeCallback, // Not used by this ULR version
  });

  useEffect(() => {
    if (onTabsProcessed) {
      onTabsProcessed(trulyFinalTabsConfig);
    }
  }, [trulyFinalTabsConfig, onTabsProcessed]);

  if (!formSchema || !allFieldsSchema) {
    return (
      <Message
        severity="warn"
        text="Form schema or allFieldsSchema is missing for DocLayoutRenderer."
        className="m-4"
      />
    );
  }

  // Optional: Light logging for crucial state if needed for future debugging
  // console.log(
  //   "[ULR] State: activeTabIndex:", activeTabIndex,
  //   "Tabs Count:", trulyFinalTabsConfig?.length
  // );

  const activeTabObject = trulyFinalTabsConfig[activeTabIndex];

  if (trulyFinalTabsConfig.length === 0) {
    if (!onTabsProcessed) {
      return (
        <Message
          severity="info"
          text="No layout elements or tabs to display based on current configuration."
          className="m-4"
        />
      );
    }
    return null; // Parent (via onTabsProcessed) is expected to handle empty tabs
  }

  if (!activeTabObject) {
    // This state indicates an issue, possibly activeTabIndex out of bounds
    // or trulyFinalTabsConfig became unexpectedly empty after initial checks.
    console.warn(
      `[ULR] No active tab content for index: ${activeTabIndex}. Total tabs: ${trulyFinalTabsConfig.length}. Attempting to render first tab if available.`
    );
    const firstTabFallback = trulyFinalTabsConfig[0];
    if (firstTabFallback) {
      return (
        <div className="tab-content-wrapper">
          {" "}
          {/* Default padding, can be configured via props if needed */}
          <TabContentOrchestrator
            key={`orchestrator-${firstTabFallback.id || 0}-fallback`}
            tab={firstTabFallback}
            allFieldsSchema={allFieldsSchema}
            renderFieldItem={renderFieldItem}
            docData={docData}
            customComponentContext={customComponentContext}
            customUIAugmentations={customUIAugmentations}
          />
        </div>
      );
    }
    return (
      <Message
        severity="warn"
        text="No active tab content could be determined or displayed."
        className="m-4"
      />
    );
  }

  return (
    <div className="tab-content-wrapper">
      {" "}
      {/* Default padding, can be configured via props if needed */}
      <TabContentOrchestrator
        key={`orchestrator-${activeTabObject.id || activeTabIndex}`}
        tab={activeTabObject}
        allFieldsSchema={allFieldsSchema}
        renderFieldItem={renderFieldItem}
        docData={docData}
        customComponentContext={customComponentContext}
        customUIAugmentations={customUIAugmentations}
      />
    </div>
  );
};
DocLayoutRendererInternal.displayName = "DocLayoutRendererInternal";

const DocLayoutRenderer = memo(DocLayoutRendererInternal);
DocLayoutRenderer.displayName = "DocLayoutRenderer";

export default DocLayoutRenderer;
