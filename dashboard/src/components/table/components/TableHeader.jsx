// dashboard/src/components/common/table-components/TableHeader.jsx
import React, { useRef } from "react";
import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import { Chip } from "primereact/chip";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Menu } from "primereact/menu";
import { VIEW_MODES } from "../constants";

const TableHeader = ({
  doctype,
  title,
  tableDataLength,
  headerActions,
  globalFilterValue,
  onGlobalFilterChange,
  filterPresets,
  activePresetId,
  onLoadPreset,
  onDeletePreset,
  onSavePreset,
  activeFilterCount,
  viewMode,
  onViewModeChange,
  visibleColumns,
  columnsConfig,
  onOpenColumnDialog,
  sortField,
  sortOrder,
  onClearFilters,
  onExportCSV,
  onResetView,
  mutate,
}) => {
  const settingsMenu = useRef(null);
  const viewModeMenu = useRef(null);

  // Settings menu items
  const settingsMenuItems = [
    {
      label: "Export CSV",
      icon: "pi pi-download",
      command: onExportCSV,
    },
    { separator: true },
    {
      label: "Reset View",
      icon: "pi pi-refresh",
      command: onResetView,
      className: "text-red-600",
    },
  ];

  // View mode menu items
  const viewModeMenuItems = [
    {
      label: "View Modes",
      items: Object.values(VIEW_MODES).map((mode) => ({
        label: mode.name,
        icon: `pi ${mode.icon}`,
        command: () => onViewModeChange(mode),
        className: viewMode === mode ? "bg-primary-50 text-primary-600" : "",
      })),
    },
  ];

  return (
    <div className="bg-white border-b border-surface-200 p-6 space-y-4">
      {/* Top Row - Title and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <IconField iconPosition="left">
              <InputIcon className="pi pi-search text-surface-400" />
              <InputText
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder={`Search All ${title}`}
                aria-label={`Search ${title} records`}
                className="w-full pl-10 pr-4 py-2 border-surface-300 rounded-3xl text-sm"
              />
            </IconField>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon="pi pi-refresh"
            tooltip="Refresh Data"
            tooltipOptions={{ position: "top" }}
            className="p-button-text p-button-rounded"
            onClick={mutate}
          />

          <Menu
            model={settingsMenuItems}
            popup
            ref={settingsMenu}
            id="settings_menu"
          />
          <Button
            icon="pi pi-cog"
            tooltip="Table Settings"
            tooltipOptions={{ position: "top" }}
            className="p-button-text p-button-rounded"
            onClick={(event) => settingsMenu.current?.toggle(event)}
          />
          {headerActions}
        </div>
      </div>

      {/* Second Row - Search */}

      {/* Third Row - Filter Presets */}

      {/* Fourth Row - View Mode and Statistics */}
      <div className="flex items-center justify-between pt-2 border-surface-100">
        <div className="flex items-center gap-4">
          <Menu
            model={viewModeMenuItems}
            popup
            ref={viewModeMenu}
            id="view_mode_menu"
          />
          <div
            className="flex items-center gap-2 text-sm text-surface-600 cursor-pointer hover:text-primary-500 transition-colors"
            onClick={(e) => viewModeMenu.current?.toggle(e)}
          >
            <i className={`pi ${viewMode.icon} text-primary-500`}></i>
            <span>{viewMode.name} View</span>
            <i className="pi pi-chevron-down text-xs"></i>
          </div>

          <div
            className="flex items-center gap-2 text-sm text-surface-600 cursor-pointer hover:text-primary-500 transition-colors"
            onClick={onOpenColumnDialog}
          >
            <i className="pi pi-eye text-surface-400"></i>
            <span>
              {visibleColumns.length} of {columnsConfig.length} columns
            </span>
          </div>

          {sortField && (
            <div className="flex items-center gap-2 text-sm text-surface-600">
              <i
                className={`pi pi-sort-${
                  sortOrder === 1 ? "amount-up" : "amount-down"
                } text-surface-400`}
              ></i>
              <span>Sorted by {sortField}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 border-x mx-3 px-3">
          {filterPresets.map((preset) => (
            <Chip
              key={preset.id}
              label={`${preset.icon || "📋"} ${preset.name}`}
              className={`cursor-pointer transition-all ${
                activePresetId === preset.id
                  ? "bg-primary-100 text-primary-700"
                  : "bg-surface-100 text-surface-700 hover:bg-surface-200"
              }`}
              onClick={() => onLoadPreset(preset)}
              removable
              onRemove={() => onDeletePreset(preset)}
            />
          ))}
          <Button
            icon="pi pi-plus"
            rounded
            text
            severity="secondary"
            aria-label="Add Preset"
            onClick={onSavePreset}
            disabled={activeFilterCount === 0}
          />
        </div>

        {/* Active Filters Indicator */}
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Chip
              label={`${activeFilterCount} filter${
                activeFilterCount > 1 ? "s" : ""
              } active`}
              icon="pi pi-filter"
              className="bg-orange-100 text-orange-700 text-xs"
              removable
              onRemove={onClearFilters}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TableHeader;
