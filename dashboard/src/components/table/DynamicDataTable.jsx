// dashboard/src/components/common/DynamicDataTable.jsx - Main Component
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  useFrappeGetDocList,
  useFrappeDocTypeEventListener,
} from "frappe-react-sdk";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ContextMenu } from "primereact/contextmenu";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";
import { ConfirmDialog } from "primereact/confirmdialog";

import * as formatters from "@/utils/formatters";
import { getFieldConfig } from "@/utils/fieldTypeConfigurations.jsx";
import { parseDescription } from "@/utils/schemaUtils";

// Import modular components
import TableHeader from "@/components/table/components/TableHeader";
import TableSkeleton from "@/components/table/TableSkeleton";
import ColumnDialog from "@/components/table/dialogs/ColumnDialog";
import PresetDialog from "@/components/table/dialogs/PresetDialog";
import { useTableState } from "@/components/table/hooks/useTableState";
import { useTableFilters } from "@/components/table/hooks/useTableFilters";
import { usePresetManager } from "@/components/table/hooks/usePresetManager";
import styles from "@/components/table/DynamicDataTable.module.css";

const DynamicDataTable = ({
  doctype,
  title,
  columnsConfig,
  fetchArgs = {},
  onRowClick,
  contextMenuItemsModel,
  globalFilterFields = ["name"],
  showPaginator = true,
  rowsPerPageOptions = [10, 25, 50, 100],
  initialRows = 10,
  dataKey = "name",
  tableStyle = { minWidth: "50rem" },
  emptyMessage = "No records found.",
  enableColumnReordering = true,
  uniqueTableKey,
  headerActions,
}) => {
  const {
    data,
    error,
    isLoading: frappeIsLoading,
    mutate,
  } = useFrappeGetDocList(
    doctype,
    {
      fields: ["*"],
      limit: 0,
      ...fetchArgs,
    },
    {}
  );

  const handleDocTypeUpdate = useCallback(
    (eventData) => {
      if (eventData.doctype === doctype) {
        console.log(
          `Realtime event 'list_update' for ${doctype}, doc: ${eventData.name}. Re-fetching...`
        );
        mutate();
      }
    },
    [doctype, mutate]
  );

  useFrappeDocTypeEventListener(doctype, handleDocTypeUpdate);

  // State management hooks
  const {
    tableData,
    setTableData,
    loading,
    setLoading,
    showSkeleton,
    setShowSkeleton,
    selectedRow,
    setSelectedRow,
    first,
    setFirst,
    rows,
    setRows,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    visibleColumns,
    setVisibleColumns,
    viewMode,
    setViewMode,
    showColumnDialog,
    setShowColumnDialog,
  } = useTableState(columnsConfig, fetchArgs, initialRows, uniqueTableKey);

  const {
    filters,
    setFilters,
    globalFilterValue,
    setGlobalFilterValue,
    activeFilterCount,
    initFilters,
    clearFilters,
  } = useTableFilters(columnsConfig);

  const {
    filterPresets,
    activePresetId,
    showPresetDialog,
    setShowPresetDialog,
    saveFilterPreset,
    loadFilterPreset,
    deleteFilterPreset,
    resetView,
  } = usePresetManager(
    uniqueTableKey,
    filters,
    globalFilterValue,
    viewMode,
    visibleColumns,
    columnsConfig,
    fetchArgs,
    initialRows,
    initFilters,
    setFilters,
    setGlobalFilterValue,
    setViewMode,
    setVisibleColumns,
    setFirst,
    setRows,
    setSortField,
    setSortOrder
  );

  // Confirmation dialogs state
  const [confirmDeletePreset, setConfirmDeletePreset] = useState(false);
  const [confirmResetView, setConfirmResetView] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState(null);

  const dt = useRef(null);
  const cm = useRef(null);

  // Enhanced data loading with skeleton
  useEffect(() => {
    if (frappeIsLoading) {
      setLoading(true);
      setShowSkeleton(true);
      return;
    }
    if (data) {
      setTimeout(() => {
        const transformedData = formatters.transformDataForSpecialFields(
          data,
          columnsConfig
        );
        setTableData(transformedData);
        initFilters();
        setLoading(false);
        setShowSkeleton(false);
      }, 300);
    }
    if (error) {
      console.error(`Error fetching ${doctype} list:`, error);
      setLoading(false);
      setShowSkeleton(false);
    }
  }, [
    data,
    error,
    frappeIsLoading,
    doctype,
    columnsConfig,
    initFilters,
    setTableData,
    setLoading,
    setShowSkeleton,
  ]);

  // Event handlers
  const onColumnToggle = useCallback(
    (fieldname, checked) => {
      if (checked) {
        const columnToAdd = columnsConfig.find(
          (col) => col.fieldname === fieldname
        );
        if (
          columnToAdd &&
          !visibleColumns.find((col) => col.fieldname === fieldname)
        ) {
          setVisibleColumns([...visibleColumns, columnToAdd]);
        }
      } else {
        setVisibleColumns(
          visibleColumns.filter((col) => col.fieldname !== fieldname)
        );
      }
    },
    [columnsConfig, visibleColumns, setVisibleColumns]
  );

  const onColumnReorder = useCallback(
    (event) => {
      if (event.columns && Array.isArray(event.columns)) {
        const reorderedFieldnames = event.columns
          .map((primeCol) => primeCol.props.field)
          .filter(Boolean);
        const finalOrderedColumns = reorderedFieldnames
          .map((fieldname) =>
            columnsConfig.find((cfg) => cfg.fieldname === fieldname)
          )
          .filter(Boolean);
        setVisibleColumns(finalOrderedColumns);
      }
    },
    [columnsConfig, setVisibleColumns]
  );

  const onGlobalFilterChange = useCallback(
    (e) => {
      const value = e.target.value;
      setFilters((prevFilters) => ({
        ...prevFilters,
        global: { ...prevFilters.global, value },
      }));
      setGlobalFilterValue(value);
    },
    [setFilters, setGlobalFilterValue]
  );

  const onTableFilter = useCallback(
    (e) => {
      setFilters(e.filters);
    },
    [setFilters]
  );

  const onTablePage = useCallback(
    (e) => {
      setFirst(e.first);
      setRows(e.rows);
    },
    [setFirst, setRows]
  );

  const onTableSort = useCallback(
    (e) => {
      setSortField(e.sortField);
      setSortOrder(e.sortOrder);
    },
    [setSortField, setSortOrder]
  );

  const handleRowSelect = useCallback(
    (event) => {
      setSelectedRow(event.data);
      if (onRowClick) {
        onRowClick(event.data);
      }
    },
    [onRowClick, setSelectedRow]
  );

  const handleRowUnselect = useCallback(() => {
    setSelectedRow(null);
  }, [setSelectedRow]);

  const handleContextMenu = useCallback(
    (e) => {
      setSelectedRow(e.data);
      cm.current?.show(e.originalEvent);
    },
    [setSelectedRow]
  );

  const handleContextMenuHide = useCallback(() => {
    setSelectedRow(null);
  }, [setSelectedRow]);

  // Export functions
  const exportCSV = useCallback(() => {
    dt.current?.exportCSV();
  }, []);

  // Confirmation handlers
  const handleDeletePresetClick = useCallback((preset) => {
    setPresetToDelete(preset);
    setConfirmDeletePreset(true);
  }, []);

  const handleDeletePresetConfirm = useCallback(() => {
    if (presetToDelete) {
      deleteFilterPreset(presetToDelete.id);
      setPresetToDelete(null);
    }
    setConfirmDeletePreset(false);
  }, [presetToDelete, deleteFilterPreset]);

  const handleResetViewClick = useCallback(() => {
    setConfirmResetView(true);
  }, []);

  const handleResetViewConfirm = useCallback(() => {
    resetView();
    setConfirmResetView(false);
  }, [resetView]);

  // Enhanced dynamic columns with view mode styling
  const dynamicColumns = useMemo(() => {
    return visibleColumns.map((colConfig) => {
      const fieldCfg = getFieldConfig(colConfig.fieldtype, colConfig.fieldname);

      const bodyRenderer = colConfig.bodyTemplate
        ? (rowData) => colConfig.bodyTemplate(rowData, formatters)
        : fieldCfg.tableBodyComponent
        ? (rowData) => (
            <div className={`${viewMode.bodySize} ${viewMode.spacing}`}>
              {fieldCfg.tableBodyComponent(
                rowData,
                colConfig.fieldname,
                colConfig.displayProps,
                formatters
              )}
            </div>
          )
        : (rowData) => {
            const value = rowData[colConfig.fieldname];
            let displayValue = value;

            if (
              ["Date", "Datetime", "Time"].includes(colConfig.fieldtype) &&
              value instanceof Date
            ) {
              if (colConfig.fieldtype === "Date") {
                displayValue = formatters.formatDisplayDate(value);
              } else if (colConfig.fieldtype === "Time") {
                displayValue = formatters.formatDisplayTime(value, true);
              } else if (colConfig.fieldtype === "Datetime") {
                displayValue = formatters.formatDisplayDateTime(value);
              }
            } else if (colConfig.fieldtype === "Check") {
              displayValue = value ? (
                <i className="pi pi-check text-green-600"></i>
              ) : (
                <i className="pi pi-times text-red-400"></i>
              );
            }

            return (
              <div
                className={`${viewMode.bodySize} ${viewMode.spacing} truncate`}
              >
                {displayValue}
              </div>
            );
          };

      const headerRenderer = () => (
        <div
          className={`flex items-center gap-2 ${viewMode.headerSize} font-medium text-surface-700`}
        >
          <i
            className={`pi pi-${
              getFieldConfig(colConfig.fieldtype).icon || "minus"
            } text-surface-400`}
          ></i>
          <span>
            {colConfig.header || colConfig.label || colConfig.fieldname}
          </span>
        </div>
      );

      const filterElementRenderer = fieldCfg.tableFilterElement
        ? (options) =>
            fieldCfg.tableFilterElement(colConfig, colConfig.fieldname, options)
        : null;

      return (
        <Column
          key={colConfig.fieldname}
          columnKey={colConfig.fieldname}
          field={colConfig.fieldname}
          header={headerRenderer}
          body={bodyRenderer}
          sortable={colConfig.sortable !== false && fieldCfg.sortable !== false}
          filter={
            colConfig.filterable === true && fieldCfg.filterable !== false
          }
          filterElement={filterElementRenderer}
          dataType={fieldCfg.dataType || "text"}
          style={{
            minWidth: colConfig.minWidth,
            ...(colConfig.style || {}),
            padding: viewMode.spacing,
          }}
          showFilterMatchModes={
            colConfig.showFilterMatchModes !== false &&
            fieldCfg.dataType !== "boolean"
          }
          filterMatchModeOptions={colConfig.filterMatchModeOptions}
          headerTooltip={parseDescription(colConfig.description)?.tooltip}
          className={`${
            viewMode.size === "small"
              ? "p-column-small"
              : viewMode.size === "large"
              ? "p-column-large"
              : ""
          }`}
        />
      );
    });
  }, [visibleColumns, columnsConfig, viewMode]);

  // Loading state with skeleton
  if (showSkeleton && !tableData.length) {
    return <TableSkeleton rows={8} columns={visibleColumns.length} />;
  }

  // Error state with enhanced styling
  if (error && !data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <i className="pi pi-exclamation-triangle text-red-500 text-xl"></i>
            <h3 className="text-red-800 font-medium text-lg">
              Error loading {doctype} data
            </h3>
          </div>
          <p className="text-red-700 mb-4">
            {error.message || JSON.stringify(error)}
          </p>
          <Button
            label="Retry"
            icon="pi pi-refresh"
            className="p-button-sm"
            onClick={mutate}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.dynamicDataTable} bg-white rounded-3xl shadow-none overflow-hidden`}
    >
      {/* Context Menu */}
      {contextMenuItemsModel && (
        <ContextMenu
          model={contextMenuItemsModel}
          ref={cm}
          onHide={handleContextMenuHide}
        />
      )}

      {/* Enhanced Header */}
      <TableHeader
        doctype={doctype}
        title={title}
        tableDataLength={tableData.length}
        headerActions={headerActions}
        globalFilterValue={globalFilterValue}
        onGlobalFilterChange={onGlobalFilterChange}
        filterPresets={filterPresets}
        activePresetId={activePresetId}
        onLoadPreset={loadFilterPreset}
        onDeletePreset={handleDeletePresetClick}
        onSavePreset={() => setShowPresetDialog(true)}
        activeFilterCount={activeFilterCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        visibleColumns={visibleColumns}
        columnsConfig={columnsConfig}
        onOpenColumnDialog={() => setShowColumnDialog(true)}
        sortField={sortField}
        sortOrder={sortOrder}
        onClearFilters={clearFilters}
        onExportCSV={exportCSV}
        onResetView={handleResetViewClick}
        mutate={mutate}
      />

      {/* Main Data Table */}
      <div className={`relative`}>
        <DataTable
          ref={dt}
          value={tableData}
          loading={loading || frappeIsLoading}
          dataKey={dataKey}
          paginator={showPaginator}
          rows={rows}
          first={first}
          onPage={onTablePage}
          rowsPerPageOptions={rowsPerPageOptions}
          filters={filters}
          onFilter={onTableFilter}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={onTableSort}
          reorderableColumns={enableColumnReordering}
          onColReorder={enableColumnReordering ? onColumnReorder : undefined}
          globalFilterFields={globalFilterFields}
          emptyMessage={
            <div className="text-center py-12">
              <div className="mb-4">
                <i className="pi pi-search text-4xl text-surface-300"></i>
              </div>
              <h3 className="text-lg font-medium text-surface-600 mb-2">
                No records found
              </h3>
              <p className="text-surface-400 mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button
                label="Clear Filters"
                icon="pi pi-filter-slash"
                className="p-button-text"
                onClick={clearFilters}
              />
            </div>
          }
          resizableColumns
          showGridlines={viewMode.size !== "compact"}
          tableStyle={{
            ...tableStyle,
            fontSize:
              viewMode.size === "compact"
                ? "0.75rem"
                : viewMode.size === "large"
                ? "0.875rem"
                : "0.8125rem",
          }}
          selectionMode={contextMenuItemsModel || onRowClick ? "single" : null}
          selection={selectedRow}
          onSelectionChange={(e) => setSelectedRow(e.value)}
          onRowSelect={handleRowSelect}
          onRowUnselect={handleRowUnselect}
          contextMenuSelection={selectedRow}
          onContextMenuSelectionChange={(e) => setSelectedRow(e.value)}
          onContextMenu={handleContextMenu}
          rowClassName={(rowData, options) => {
            return {
              "hover:bg-surface-50 transition-colors duration-150": true,
              "bg-primary-50":
                selectedRow && selectedRow[dataKey] === rowData[dataKey],
              [`${viewMode.spacing}`]: true,
            };
          }}
          paginatorClassName="border-t border-surface-200 bg-white"
          className={`
            ${viewMode.size === "compact" ? "p-datatable-sm" : ""}
            ${viewMode.size === "large" ? "p-datatable-lg" : ""}
          `}
          stripedRows={viewMode.size !== "compact"}
          pt={{
            header: {
              className: "bg-surface-50 border-b border-surface-200",
            },
            headerRow: {
              className: "bg-surface-100",
            },
            headerCell: {
              className: `${viewMode.headerSize} font-semibold text-surface-700 ${viewMode.spacing}`,
            },
            bodyRow: {
              className:
                "hover:bg-surface-50 transition-colors duration-150 border-b border-surface-100",
            },
            bodyCell: {
              className: `${viewMode.bodySize} text-surface-600 ${viewMode.spacing}`,
            },
            paginator: {
              root: {
                className:
                  "bg-surface-50 text-surface-600 border-t border-surface-200",
              },
            },
          }}
        >
          {dynamicColumns}
        </DataTable>

        {/* Loading Overlay */}
        {(loading || frappeIsLoading) && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <ProgressSpinner size="30" strokeWidth="4" />
              <span className="text-sm text-surface-600">Loading data...</span>
            </div>
          </div>
        )}
      </div>

      {/* Column Selection Dialog */}
      <ColumnDialog
        visible={showColumnDialog}
        onHide={() => setShowColumnDialog(false)}
        columnsConfig={columnsConfig}
        visibleColumns={visibleColumns}
        onColumnToggle={onColumnToggle}
      />

      {/* Filter Preset Save Dialog */}
      <PresetDialog
        visible={showPresetDialog}
        onHide={() => setShowPresetDialog(false)}
        onSave={saveFilterPreset}
        activeFilterCount={activeFilterCount}
        filters={filters}
        globalFilterValue={globalFilterValue}
        existingPresets={filterPresets}
      />

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        visible={confirmDeletePreset}
        onHide={() => setConfirmDeletePreset(false)}
        message={`Are you sure you want to delete the preset "${presetToDelete?.name}"?`}
        header="Delete Filter Preset"
        icon="pi pi-exclamation-triangle"
        accept={handleDeletePresetConfirm}
        reject={() => setConfirmDeletePreset(false)}
        acceptClassName="p-button-danger"
        acceptLabel="Delete"
        rejectLabel="Cancel"
      />

      <ConfirmDialog
        visible={confirmResetView}
        onHide={() => setConfirmResetView(false)}
        message="This will reset the table view to default settings and delete all saved filter presets. This action cannot be undone."
        header="Reset Table View"
        icon="pi pi-exclamation-triangle"
        accept={handleResetViewConfirm}
        reject={() => setConfirmResetView(false)}
        acceptClassName="p-button-danger"
        acceptLabel="Reset"
        rejectLabel="Cancel"
      />

      {/* Enhanced Statistics Footer */}
      <div className="bg-white border-t border-surface-100 px-6 py-3 text-xs text-surface-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>
              Showing {Math.min(first + 1, tableData.length)}-
              {Math.min(first + rows, tableData.length)} of {tableData.length}{" "}
              records
            </span>
            {filterPresets.find((p) => p.id === activePresetId) && (
              <span className="text-blue-600">
                • Using preset "
                {filterPresets.find((p) => p.id === activePresetId)?.icon}
                {filterPresets.find((p) => p.id === activePresetId)?.name}"
              </span>
            )}
            {filterPresets.length > 0 && !activePresetId && (
              <span className="text-green-600">
                • {filterPresets.length} saved preset
                {filterPresets.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span>View: {viewMode.name}</span>
            <span>•</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicDataTable;
