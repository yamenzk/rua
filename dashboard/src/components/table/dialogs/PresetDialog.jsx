// dashboard/src/components/common/table-components/PresetDialog.jsx
import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Chip } from "primereact/chip";

const PresetDialog = ({
  visible,
  onHide,
  onSave,
  activeFilterCount,
  filters,
  globalFilterValue,
  existingPresets,
}) => {
  const [presetName, setPresetName] = useState("");
  const [presetIcon, setPresetIcon] = useState("");

  const handleSave = () => {
    if (presetName.trim()) {
      onSave(presetName.trim(), presetIcon.trim());
      setPresetName("");
      setPresetIcon("");
      onHide();
    }
  };

  const handleHide = () => {
    setPresetName("");
    setPresetIcon("");
    onHide();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && presetName.trim()) {
      handleSave();
    }
  };

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2">
          <i className="pi pi-bookmark text-primary-500"></i>
          <span>Save Filter Preset</span>
        </div>
      }
      visible={visible}
      style={{ width: "450px" }}
      onHide={handleHide}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text"
            onClick={handleHide}
          />
          <Button
            label="Save Preset"
            icon="pi pi-check"
            onClick={handleSave}
            disabled={!presetName.trim()}
          />
        </div>
      }
      modal
      draggable={false}
      resizable={false}
    >
      <div className="space-y-6">
        <div className="text-surface-600">
          <p className="mb-3">
            Save your current filter configuration as a preset for quick access
            later.
          </p>

          {/* Current Filters Summary */}
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 rounded-lg border border-primary-200">
            <h4 className="font-semibold text-surface-700 mb-3 flex items-center gap-2">
              <i className="pi pi-info-circle text-primary-500"></i>
              Current Active Filters ({activeFilterCount})
            </h4>

            <div className="space-y-2">
              {globalFilterValue && (
                <div className="flex items-center gap-2">
                  <Chip
                    label={`Global: "${globalFilterValue}"`}
                    className="bg-white text-surface-700 text-xs"
                    icon="pi pi-search"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, filter]) => {
                  if (key === "global" || !filter) return null;

                  let filterValue = "";
                  if (filter.constraints) {
                    const activeConstraints = filter.constraints.filter(
                      (c) =>
                        c.value !== null &&
                        c.value !== undefined &&
                        c.value !== ""
                    );
                    if (activeConstraints.length > 0) {
                      filterValue = activeConstraints
                        .map((c) => c.value)
                        .join(", ");
                    }
                  } else if (
                    filter.value !== null &&
                    filter.value !== undefined &&
                    filter.value !== ""
                  ) {
                    if (Array.isArray(filter.value)) {
                      filterValue =
                        filter.value.length > 0 ? filter.value.join(", ") : "";
                    } else {
                      filterValue = filter.value.toString();
                    }
                  }

                  if (!filterValue) return null;

                  return (
                    <Chip
                      key={key}
                      label={`${key}: ${
                        filterValue.length > 20
                          ? filterValue.substring(0, 20) + "..."
                          : filterValue
                      }`}
                      className="bg-white text-surface-700 text-xs"
                      icon="pi pi-filter"
                    />
                  );
                })}
              </div>

              {activeFilterCount === 0 && !globalFilterValue && (
                <div className="text-surface-500 text-sm italic">
                  No active filters to save
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="preset-name"
              className="block text-sm font-semibold text-surface-700 mb-2"
            >
              Preset Name *
            </label>
            <InputText
              id="preset-name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Enter a descriptive name for this preset..."
              className="w-full"
              onKeyPress={handleKeyPress}
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="preset-icon"
              className="block text-sm font-semibold text-surface-700 mb-2"
            >
              Icon (Optional)
            </label>
            <InputText
              id="preset-icon"
              value={presetIcon}
              onChange={(e) => setPresetIcon(e.target.value)}
              placeholder="📋 Enter an emoji..."
              className="w-full"
              maxLength={2}
            />
            <small className="text-surface-500 mt-1 block">
              💡 Tip: Use Windows key + . (Windows) or Ctrl + Cmd + Space (Mac)
              to open emoji picker
            </small>
          </div>
        </div>

        {/* Existing Presets */}
        {existingPresets.length > 0 && (
          <div>
            <h4 className="font-semibold text-surface-700 mb-3">
              Existing Presets ({existingPresets.length})
            </h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {existingPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-2 bg-surface-50 rounded text-sm"
                >
                  <span className="font-medium text-surface-700">
                    {preset.icon && <span className="mr-2">{preset.icon}</span>}
                    {preset.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default PresetDialog;
