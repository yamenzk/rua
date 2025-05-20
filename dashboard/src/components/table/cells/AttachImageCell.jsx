// dashboard/src/components/table/cells/AttachImageCell.jsx
import React from "react";
import { Avatar } from "primereact/avatar";
import { Image as PrimeImage } from "primereact/image";

const PLACEHOLDER_IMAGE =
  "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png";

const AttachImageCell = ({ rowData, fieldname, displayProps }) => {
  const imageUrl = rowData[fieldname];
  if (!imageUrl) return null;

  const altText = rowData.name || fieldname; // Use rowData.name for alt if available

  if (displayProps?.asAvatar) {
    return (
      <Avatar
        image={imageUrl}
        shape="circle"
        size={displayProps?.avatarSize || "large"}
        alt={`${altText} avatar`}
        onError={(e) => {
          e.target.src = PLACEHOLDER_IMAGE;
        }}
      />
    );
  }
  return (
    <PrimeImage
      src={imageUrl}
      alt={altText}
      width={displayProps?.imageWidth || "50"}
      preview
      imageClassName={displayProps?.imageClassName || "object-contain"}
      onError={(e) => {
        e.target.src = PLACEHOLDER_IMAGE;
      }}
    />
  );
};

export default AttachImageCell;
