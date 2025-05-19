// src/components/common/FileUploadDialog.jsx
import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { Message } from "primereact/message";
// No frappe SDK import needed here anymore

const FileUploadDialog = ({
  visible,
  onHide,
  onFileSelect, // Changed from onUploadComplete: (selectedFile: File, targetFieldname: string) => void
  targetFieldname,
  isNewDocument, // New prop to indicate if the parent document is new
}) => {
  const fileUploadRef = useRef(null);

  const handleHide = () => {
    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
    onHide();
  };

  // This is now the primary action: selecting a file.
  // The PrimeReact FileUpload component will call this when a file is chosen by the user.
  const handleFileSelectionAndConfirm = (event) => {
    const file = event.files[0];
    if (file && targetFieldname) {
      onFileSelect(file, targetFieldname); // Pass the raw File object back
      handleHide(); // Close dialog after selection
    } else if (fileUploadRef.current) {
      // If somehow called without a file (e.g. user cancels OS dialog)
      // ensure the FileUpload component is cleared if needed.
      // This might be redundant if onClear handles it.
    }
  };

  const dialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={handleHide}
        className="p-button-text"
      />
      {/* The FileUpload component itself will trigger file selection.
          We don't need a separate "Upload" button in the dialog footer
          if the FileUpload's "Choose" button implicitly leads to onFileSelect via its uploadHandler.
          PrimeReact's FileUpload with customUpload=true expects uploadHandler to do the work.
          We'll use its "Choose" (or "Select") button effectively as the confirmation.
      */}
    </div>
  );

  // This handler is for the FileUpload component's internal clear button
  const handleClearInFileUpload = () => {
    // setSelectedFile(null); // No local selectedFile state needed anymore
  };

  return (
    <Dialog
      header={`Select File for ${targetFieldname || "Attachment"}`}
      visible={visible}
      style={{ width: "50vw", maxWidth: "600px" }}
      modal
      footer={dialogFooter} // Footer might be optional if FileUpload's own UI is sufficient
      onHide={handleHide}
      blockScroll
    >
      <div className="p-fluid">
        {isNewDocument && ( // Use the new prop
          <Message
            severity="info"
            className="mb-3"
            text="For new documents, the file will be attached after you save the document."
          />
        )}
        <FileUpload
          ref={fileUploadRef}
          name="dialogFileUploader" // Just a name for the input
          customUpload // Crucial for this flow
          uploadHandler={handleFileSelectionAndConfirm} // This is called when user "uploads" via component UI
          onClear={handleClearInFileUpload}
          multiple={false}
          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,.txt,.csv"
          maxFileSize={10000000} // 10MB
          chooseLabel="Choose File"
          // uploadLabel="Confirm Selection" // The "upload" button in FileUpload UI now confirms selection
          // cancelLabel="Clear" // The "cancel" button in FileUpload UI clears the selection
          progressBarTemplate={<></>} // No progress bar inside dialog anymore
          emptyTemplate={
            <p className="m-0">Drag and drop a file here or click to browse.</p>
          }
        />
        {/* No upload progress or error display within the dialog itself anymore */}
      </div>
    </Dialog>
  );
};

export default FileUploadDialog;
