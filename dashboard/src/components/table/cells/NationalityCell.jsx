// dashboard/src/components/table/cells/NationalityCell.jsx
import React from "react";
import nationalities from "@/utils/nationalities.json";

const NationalityCell = ({ rowData, fieldname }) => {
  const nationalityName = rowData[fieldname];
  if (!nationalityName) return String(nationalityName ?? "");

  const nat = nationalities.find((n) => n.name === nationalityName);
  return nat ? (
    <span className="whitespace-nowrap">
      {nat.flag} {nat.name}
    </span>
  ) : (
    String(nationalityName)
  );
};

export default NationalityCell;
