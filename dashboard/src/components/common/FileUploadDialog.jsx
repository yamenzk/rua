// src/components/common/FileUploadDialog.jsx
import React, { useState, useRef, useCallback } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import { Card } from "primereact/card";

const FileUploadDialog = ({
  visible,
  onHide,
  onFileSelect,
  targetFieldname,
  isNewDocument,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleHide = useCallback(() => {
    setSelectedFile(null);
    setIsDragOver(false);
    onHide();
  }, [onHide]);

  const handleFileSelect = useCallback((file) => {
    if (file && file.size <= 10000000) {
      // 10MB limit
      setSelectedFile(file);
    } else if (file && file.size > 10000000) {
      // Handle file too large - you might want to show a toast instead
      console.warn("File too large. Maximum size is 10MB.");
    }
  }, []);

  const handleConfirmSelection = useCallback(() => {
    if (selectedFile && targetFieldname) {
      onFileSelect(selectedFile, targetFieldname);
      handleHide();
    }
  }, [selectedFile, targetFieldname, onFileSelect, handleHide]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e) => {
      const files = e.target.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const openFileSelector = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file) => {
    if (!file) return "pi pi-file";

    const type = file.type.toLowerCase();
    if (type.startsWith("image/")) return "pi pi-image";
    if (type.includes("pdf")) return "pi pi-file-pdf";
    if (type.includes("word") || type.includes("document"))
      return "pi pi-file-word";
    if (type.includes("excel") || type.includes("sheet"))
      return "pi pi-file-excel";
    if (type.includes("powerpoint") || type.includes("presentation"))
      return "pi pi-chart-bar";
    return "pi pi-file";
  };

  const dialogFooter = (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        label="Cancel"
        icon="pi pi-times"
        onClick={handleHide}
        className="p-button-text"
      />
      <Button
        type="button"
        label="Attach File"
        icon="pi pi-check"
        onClick={handleConfirmSelection}
        disabled={!selectedFile}
        className="p-button-primary"
      />
    </div>
  );

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2">
          <i className="pi pi-upload text-primary-color"></i>
          <span>Attach File</span>
          {targetFieldname && (
            <span className="text-text-color-secondary text-sm">
              for {targetFieldname.replace(/_/g, " ")}
            </span>
          )}
        </div>
      }
      visible={visible}
      style={{ width: "90vw", maxWidth: "500px" }}
      modal
      footer={dialogFooter}
      onHide={handleHide}
      blockScroll
      dismissableMask={false}
      className="p-dialog-custom"
    >
      <div className="space-y-4">
        {isNewDocument && (
          <Message
            severity="info"
            className="border-l-4 border-primary-color"
            content={
              <div className="flex items-center gap-2">
                <i className="pi pi-info-circle"></i>
                <span>File will be attached after you save the document</span>
              </div>
            }
          />
        )}

        {/* File Drop Zone */}
        <Card className="p-0 shadow-sm border-2 border-dashed border-surface-border hover:border-primary-color transition-colors">
          <div
            className={`p-6 text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? "bg-primary-50 border-primary-color"
                : "hover:bg-surface-hover"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileSelector}
          >
            <div className="space-y-3">
              <div
                className={`text-4xl ${
                  isDragOver
                    ? "text-primary-color"
                    : "text-text-color-secondary"
                }`}
              >
                <i className="pi pi-cloud-upload"></i>
              </div>
              <div>
                <p className="text-text-color font-medium mb-1">
                  {isDragOver
                    ? "Drop your file here"
                    : "Click to browse or drag & drop"}
                </p>
                <p className="text-text-color-secondary text-sm">
                  Maximum file size: 10MB
                </p>
              </div>
              <p className="text-xs text-text-color-secondary opacity-75">
                Supported: Images, PDF, Word, Excel, PowerPoint, Text files
              </p>
            </div>
          </div>
        </Card>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,.txt,.csv"
          style={{ display: "none" }}
        />

        {/* Selected File Preview */}
        {selectedFile && (
          <>
            <Divider className="my-4" />
            <Card className="p-0 shadow-sm">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                      <i
                        className={`${getFileIcon(
                          selectedFile
                        )} text-primary-color`}
                      ></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-color truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-text-color-secondary">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    icon="pi pi-times"
                    onClick={clearSelection}
                    className="p-button-text p-button-rounded p-button-sm"
                    tooltip="Remove file"
                    tooltipOptions={{ position: "top" }}
                  />
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </Dialog>
  );
};

export default FileUploadDialog;
