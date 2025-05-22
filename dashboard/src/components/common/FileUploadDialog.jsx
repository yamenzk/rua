// src/components/common/FileUploadDialog.jsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import { Card } from "primereact/card";
import { ProgressBar } from "primereact/progressbar";

const FileUploadDialog = ({
  visible,
  onHide,
  onFileSelect,
  targetFieldname,
  isNewDocument,
  uploadProgress = 0,
  isUploading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleHide = useCallback(() => {
    setSelectedFile(null);
    setIsDragOver(false);
    setFilePreviewUrl(null);
    onHide();
  }, [onHide]);

  const createFilePreview = useCallback((file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreviewUrl(null);
    }
  }, []);

  const handleFileSelect = useCallback(
    (file) => {
      if (file && file.size <= 10000000) {
        // 10MB limit
        setSelectedFile(file);
        createFilePreview(file);
      } else if (file && file.size > 10000000) {
        // Handle file too large - you might want to show a toast instead
        console.warn("File too large. Maximum size is 10MB.");
      }
    },
    [createFilePreview]
  );

  const handleConfirmSelection = useCallback(() => {
    if (selectedFile && targetFieldname) {
      onFileSelect(selectedFile, targetFieldname);
      // Don't hide immediately - let the parent component handle it after upload completes
    }
  }, [selectedFile, targetFieldname, onFileSelect]);

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
    setFilePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Clean up object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (filePreviewUrl && filePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

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

  const getProgressMessage = () => {
    if (isUploading) {
      if (uploadProgress < 100) {
        return `Uploading... ${uploadProgress}%`;
      } else {
        return "Processing...";
      }
    }
    return null;
  };

  const dialogFooter = (
    <div className="flex justify-between gap-2">
      <Button
        link
        label="Cancel"
        icon="pi pi-times"
        onClick={handleHide}
        className="p-button-text"
        disabled={isUploading}
      />
      <Button
        type="button"
        label={isUploading ? "Uploading..." : "Attach"}
        icon={isUploading ? "pi pi-spin pi-spinner" : "pi pi-upload"}
        onClick={handleConfirmSelection}
        disabled={!selectedFile || isUploading}
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
      dismissableMask={!isUploading}
      className="p-dialog-custom"
      closable={!isUploading}
    >
      <div className="space-y-4">
        {isNewDocument && (
          <Message
            severity="warning"
            className="border-l-4 border-primary-color"
            content={
              <div className="flex items-center gap-2">
                <i className="pi pi-info-circle"></i>
                <span>File will be attached after you save the document</span>
              </div>
            }
          />
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-color-secondary">
                {getProgressMessage()}
              </span>
              <span className="text-sm text-text-color-secondary">
                {uploadProgress}%
              </span>
            </div>
            <ProgressBar
              value={uploadProgress}
              className="h-2"
              showValue={false}
            />
          </div>
        )}

        {/* File Drop Zone - Only show if no file selected */}
        {!selectedFile && (
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
        )}

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
            <Card
              className="p-0 shadow-none"
              pt={{
                body: {
                  className: "p-0",
                },
              }}
            >
              <div className="p-0">
                <div className="flex items-start gap-3">
                  {/* File Icon or Image Thumbnail */}
                  <div className="flex-shrink-0">
                    {filePreviewUrl ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-surface-border">
                        <img
                          src={filePreviewUrl}
                          alt={selectedFile.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-primary-50 flex items-center justify-center">
                        <i
                          className={`${getFileIcon(
                            selectedFile
                          )} text-primary-color text-xl`}
                        ></i>
                      </div>
                    )}
                  </div>

                  {/* File Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-color truncate mb-1">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-text-color-secondary mb-2">
                          {formatFileSize(selectedFile.size)}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            <i className="pi pi-check mr-1"></i>
                            Ready to attach
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      {!isUploading && (
                        <Button
                          type="button"
                          icon="pi pi-times"
                          onClick={clearSelection}
                          className="p-button-text p-button-rounded p-button-sm"
                          tooltip="Remove file"
                          tooltipOptions={{ position: "top" }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Change File Button */}
                {!isUploading && (
                  <div className="mt-6 pt-2 border-t border-surface-border">
                    <Button
                      text
                      label="Choose Different File"
                      icon="pi pi-refresh"
                      onClick={openFileSelector}
                      className="p-button-text p-button-sm"
                    />
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </Dialog>
  );
};

export default FileUploadDialog;
