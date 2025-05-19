// src/components/common/document/CustomItemRenderer.jsx
import React, { memo } from "react";
import { Card as PrimeReactCard } from "primereact/card";

const CustomItemRenderer = ({ itemBlock, docData, customComponentContext }) => {
  const customItemConfig = itemBlock._itemConfig;

  if (!customItemConfig) {
    return (
      <div className="text-red-500">
        Error: Custom item configuration missing.
      </div>
    );
  }

  const contentElement =
    typeof customItemConfig.content === "function"
      ? customItemConfig.content(docData, customComponentContext)
      : customItemConfig.content;

  if (customItemConfig.type === "Card") {
    return (
      <PrimeReactCard
        key={itemBlock.id}
        title={customItemConfig.title}
        className={`custom-injected-item ${
          customItemConfig.className || "shadow-lg rounded-xl"
        }`}
        pt={{ body: { className: "p-4" } }}
      >
        {contentElement}
      </PrimeReactCard>
    );
  } else if (customItemConfig.type === "SectionHeader") {
    return (
      <div
        key={itemBlock.id}
        className={`custom-injected-item ${
          customItemConfig.className || ""
        } border-b border-surface-border pb-3`}
      >
        <h3 className="text-lg font-semibold text-text-color">
          {customItemConfig.title}
        </h3>
        {customItemConfig.description && (
          <p className="text-sm text-text-color-secondary mt-1">
            {customItemConfig.description}
          </p>
        )}
      </div>
    );
  }

  // Default rendering for other custom items or "CustomComponent" type
  return (
    <div
      key={itemBlock.id}
      className={`custom-injected-item ${customItemConfig.className || ""}`}
    >
      {customItemConfig.title && (
        <h4 className="text-md font-medium text-text-color mb-2">
          {customItemConfig.title}
        </h4>
      )}
      {contentElement}
    </div>
  );
};

export default memo(CustomItemRenderer);
