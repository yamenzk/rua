// src/components/table/cells/NationalityCell.jsx - Optimized Version
import React, { memo } from "react";
import nationalities from "@/utils/nationalities.json";

// Create a Map for O(1) lookup performance instead of array.find()
const nationalityMap = new Map(nationalities.map((n) => [n.name, n]));

const NationalityCell = memo(({ rowData, fieldname }) => {
  const nationalityName = rowData[fieldname];

  if (!nationalityName) {
    return <span className="text-text-color-secondary">—</span>;
  }

  const nat = nationalityMap.get(nationalityName);

  if (!nat) {
    return <span className="text-sm">{String(nationalityName)}</span>;
  }

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span
        className="inline-block w-5 h-5 text-center leading-5"
        style={{ fontSize: "1.1em" }}
        title={nat.name}
      >
        {nat.flag}
      </span>
      <span className="text-sm truncate max-w-[120px]" title={nat.name}>
        {nat.name}
      </span>
    </div>
  );
});

NationalityCell.displayName = "NationalityCell";

export default NationalityCell;
