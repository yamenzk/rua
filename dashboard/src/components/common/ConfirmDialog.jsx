// src/components/ConfirmDialog.jsx
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

/**
 * A reusable confirmation dialog.
 * @param {object} props
 * @param {boolean} props.visible - Whether the dialog is visible.
 * @param {function} props.onHide - Function to call when the dialog is hidden.
 * @param {function} props.onConfirm - Function to call when the action is confirmed.
 * @param {string} props.header - The header text for the dialog.
 * @param {string} props.message - The main message/question for the dialog.
 * @param {string} props.confirmationText - The text the user needs to type to confirm. If null/empty, no input needed.
 * @param {string} props.confirmButtonLabel - Label for the confirm button (default: "Confirm").
 * @param {string} props.confirmButtonIcon - Icon for the confirm button (default: "pi pi-check").
 * @param {string} props.rejectButtonLabel - Label for the reject button (default: "Cancel").
 * @param {string} props.rejectButtonIcon - Icon for the reject button (default: "pi pi-times").
 */
const ConfirmDialog = ({
  visible,
  onHide,
  onConfirm,
  header = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmationText = null, // e.g., the name of the item to delete
  confirmButtonLabel = "Confirm",
  confirmButtonIcon = "pi pi-check",
  rejectButtonLabel = "Cancel",
  rejectButtonIcon = "pi pi-times",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(!confirmationText); // Directly confirmed if no text needed

  useEffect(() => {
    if (visible) {
      setInputValue(""); // Reset input when dialog becomes visible
      setIsConfirmed(!confirmationText); // Re-evaluate confirmation status
    }
  }, [visible, confirmationText]);

  useEffect(() => {
    if (confirmationText) {
      setIsConfirmed(inputValue.trim() === confirmationText.trim());
    } else {
      setIsConfirmed(true); // No input needed, so it's always "confirmed" for enabling button
    }
  }, [inputValue, confirmationText]);

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      onHide(); // Close dialog after confirm
    }
  };

  const dialogFooter = (
    <div className="flex justify-end gap-2 pt-4">
      <Button
        label={rejectButtonLabel}
        icon={rejectButtonIcon}
        onClick={onHide}
        className="p-button-text rounded-lg"
      />
      <Button
        label={confirmButtonLabel}
        icon={confirmButtonIcon}
        onClick={handleConfirm}
        disabled={!isConfirmed}
        className="p-button-primary rounded-lg"
        severity="danger" // Often used for destructive actions
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: "min(90vw, 450px)" }} // Responsive width
      header={header}
      modal
      footer={dialogFooter}
      onHide={onHide}
      blockScroll
      className="rounded-lg shadow-xl" // Tailwind classes for styling
    >
      <div className="confirmation-content">
        <i
          className="pi pi-exclamation-triangle mr-3 text-yellow-500"
          style={{ fontSize: "2rem" }}
        />
        <span className="text-text-color">{message}</span>
      </div>
      {confirmationText && (
        <div className="mt-4">
          <p className="mb-2 text-sm text-text-color-secondary">
            To confirm, please type "<strong>{confirmationText}</strong>" in the
            box below:
          </p>
          <InputText
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={confirmationText}
            className="w-full rounded-lg p-inputtext-sm" // Tailwind rounded-lg
          />
        </div>
      )}
    </Dialog>
  );
};

export default ConfirmDialog;
