// dashboard/src/components/common/DynamicDataTable.jsx - Clean Version
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
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { ContextMenu } from "primereact/contextmenu";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { ProgressSpinner } from "primereact/progressspinner";
import { setCookie, getCookie } from "@/utils/cookies";

import * as formatters from "@/utils/formatters";
import { getFieldConfig } from "@/utils/fieldTypeConfigurations.jsx";
import { parseDescription } from "@/utils/schemaUtils";

const DynamicDataTable = ({
  doctype,
  columnsConfig,
  fetchArgs = {},
  onRowClick,
  contextMenuItemsModel,
  globalFilterFields = ["name"],
  showColumnToggle = true,
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

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({});
  const [selectedRow, setSelectedRow] = useState(null);

  const tableStateCookieKey = useMemo(
    () => (uniqueTableKey ? `datatable_${uniqueTableKey}_state` : null),
    [uniqueTableKey]
  );

  const loadStateFromCookie = useCallback(() => {
    if (tableStateCookieKey) {
      const savedStateString = getCookie(tableStateCookieKey);
      if (savedStateString) {
        try {
          return JSON.parse(savedStateString);
        } catch (e) {
          console.error("Error parsing saved table state from cookie:", e);
        }
      }
    }
    return null;
  }, [tableStateCookieKey]);

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const savedState = loadStateFromCookie();
    if (
      savedState?.visibleColumns &&
      Array.isArray(savedState.visibleColumns)
    ) {
      const validSavedColumnObjects = savedState.visibleColumns
        .map((fieldname) =>
          columnsConfig.find((cfg) => cfg.fieldname === fieldname)
        )
        .filter(Boolean);
      if (validSavedColumnObjects.length > 0) {
        return validSavedColumnObjects;
      }
    }
    return columnsConfig.filter((col) => col.defaultVisible !== false);
  });

  const [first, setFirst] = useState(() => loadStateFromCookie()?.first || 0);
  const [rows, setRows] = useState(
    () => loadStateFromCookie()?.rows || initialRows
  );
  const [sortField, setSortField] = useState(
    () => loadStateFromCookie()?.sortField || fetchArgs.orderBy?.field || null
  );
  const [sortOrder, setSortOrder] = useState(
    () =>
      loadStateFromCookie()?.sortOrder ||
      (fetchArgs.orderBy?.order === "desc" ? -1 : 1)
  );

  const dt = useRef(null);
  const cm = useRef(null);

  // Initialize filters following PrimeReact pattern
  const initFilters = useCallback(() => {
    const initialFilters = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    };

    columnsConfig.forEach((colConfig) => {
      if (colConfig.filterable !== false) {
        const fieldCfg = getFieldConfig(
          colConfig.fieldtype,
          colConfig.fieldname
        );
        if (fieldCfg.filterable === false) return;

        let matchMode = FilterMatchMode.CONTAINS;
        let operator = FilterOperator.AND;

        // Set appropriate match modes based on data type
        if (fieldCfg.dataType === "numeric") {
          matchMode = FilterMatchMode.EQUALS;
        } else if (fieldCfg.dataType === "date") {
          matchMode = FilterMatchMode.DATE_IS;
        } else if (fieldCfg.dataType === "boolean") {
          matchMode = FilterMatchMode.EQUALS;
        } else if (
          colConfig.fieldtype === "Select" ||
          colConfig.fieldtype === "Autocomplete"
        ) {
          matchMode = FilterMatchMode.EQUALS;
        } else if (
          colConfig.fieldtype === "Link" ||
          colConfig.fieldtype === "Nationality"
        ) {
          matchMode = FilterMatchMode.IN;
          operator = FilterOperator.OR;
        }

        // Use constraint-based filtering for most fields
        if (fieldCfg.dataType === "numeric" || fieldCfg.dataType === "date") {
          initialFilters[colConfig.fieldname] = {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode }],
          };
        } else if (
          colConfig.fieldtype === "Link" ||
          colConfig.fieldtype === "Nationality"
        ) {
          // Multi-select filters don't use constraints
          initialFilters[colConfig.fieldname] = {
            value: null,
            matchMode,
          };
        } else {
          // Text-based filters
          initialFilters[colConfig.fieldname] = {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode }],
          };
        }
      }
    });

    setFilters(initialFilters);
    setGlobalFilterValue("");
  }, [columnsConfig]);

  // Effect to save state to cookie
  useEffect(() => {
    if (tableStateCookieKey) {
      const stateToSave = {
        visibleColumns: visibleColumns.map((col) => col.fieldname),
        first,
        rows,
        sortField,
        sortOrder,
        globalFilter: globalFilterValue,
      };
      setCookie(tableStateCookieKey, JSON.stringify(stateToSave), 30);
    }
  }, [
    visibleColumns,
    first,
    rows,
    sortField,
    sortOrder,
    globalFilterValue,
    tableStateCookieKey,
  ]);

  useEffect(() => {
    if (frappeIsLoading) {
      setLoading(true);
      return;
    }
    if (data) {
      // Transform data to convert date strings to Date objects and boolean strings to booleans
      const transformedData = formatters.transformDataForSpecialFields(
        data,
        columnsConfig
      );
      setTableData(transformedData);
      initFilters();
      setLoading(false);
    }
    if (error) {
      console.error(`Error fetching ${doctype} list:`, error);
      setLoading(false);
    }
  }, [data, error, frappeIsLoading, doctype, columnsConfig, initFilters]);

  const onColumnToggle = useCallback(
    (event) => {
      const selectedToggleColumns = event.value;
      const newVisible = columnsConfig.filter((col) =>
        selectedToggleColumns.some(
          (selectedCol) => selectedCol.fieldname === col.fieldname
        )
      );
      setVisibleColumns(newVisible);
    },
    [columnsConfig]
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
    [columnsConfig]
  );

  const onGlobalFilterChange = useCallback((e) => {
    const value = e.target.value;
    setFilters((prevFilters) => ({
      ...prevFilters,
      global: { ...prevFilters.global, value },
    }));
    setGlobalFilterValue(value);
  }, []);

  const onTableFilter = useCallback((e) => {
    setFilters(e.filters);
  }, []);

  const onTablePage = useCallback((e) => {
    setFirst(e.first);
    setRows(e.rows);
  }, []);

  const onTableSort = useCallback((e) => {
    setSortField(e.sortField);
    setSortOrder(e.sortOrder);
  }, []);

  const handleRowSelect = useCallback(
    (event) => {
      setSelectedRow(event.data);
      if (onRowClick) {
        onRowClick(event.data);
      }
    },
    [onRowClick]
  );

  const handleRowUnselect = useCallback(() => {
    setSelectedRow(null);
  }, []);

  const handleContextMenu = useCallback((e) => {
    setSelectedRow(e.data);
    cm.current?.show(e.originalEvent);
  }, []);

  const handleContextMenuHide = useCallback(() => {
    setSelectedRow(null);
  }, []);

  const clearFilters = useCallback(() => {
    initFilters();
  }, [initFilters]);

  const headerContent = useMemo(
    () => (
      <div className="flex flex-wrap items-center justify-between gap-2 py-2">
        <div className="flex items-center gap-2">
          {headerActions}
          <Button
            icon="pi pi-filter-slash"
            label="Clear"
            outlined
            onClick={clearFilters}
            tooltip="Clear all filters"
            tooltipOptions={{ position: "top" }}
          />
          <Button
            icon="pi pi-refresh"
            rounded
            text
            severity="secondary"
            aria-label="Refresh Data"
            onClick={mutate}
            tooltip="Refresh Data"
            tooltipOptions={{ position: "top" }}
          />
        </div>
        <div className="flex items-center gap-2">
          {showColumnToggle && (
            <MultiSelect
              value={visibleColumns}
              options={columnsConfig}
              optionLabel="header"
              onChange={onColumnToggle}
              className="w-full sm:w-auto md:w-60 p-multiselect-sm"
              display="chip"
              placeholder="Toggle Columns"
              itemTemplate={(option) => (
                <span>{option.header || option.fieldname}</span>
              )}
            />
          )}
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Global Search"
              className="w-full sm:w-auto p-inputtext-sm"
            />
          </IconField>
        </div>
      </div>
    ),
    [
      headerActions,
      clearFilters,
      mutate,
      showColumnToggle,
      visibleColumns,
      columnsConfig,
      onColumnToggle,
      globalFilterValue,
      onGlobalFilterChange,
    ]
  );

  const dynamicColumns = useMemo(() => {
    return visibleColumns.map((colConfig) => {
      const fieldCfg = getFieldConfig(colConfig.fieldtype, colConfig.fieldname);

      const bodyRenderer = colConfig.bodyTemplate
        ? (rowData) => colConfig.bodyTemplate(rowData, formatters)
        : fieldCfg.tableBodyComponent
        ? (rowData) =>
            fieldCfg.tableBodyComponent(
              rowData,
              colConfig.fieldname,
              colConfig.displayProps,
              formatters
            )
        : (rowData) => {
            const value = rowData[colConfig.fieldname];
            // Default formatting for common types
            if (
              ["Date", "Datetime", "Time"].includes(colConfig.fieldtype) &&
              value instanceof Date
            ) {
              if (colConfig.fieldtype === "Date") {
                return formatters.formatDisplayDate(value);
              } else if (colConfig.fieldtype === "Time") {
                return formatters.formatDisplayTime(value, true);
              } else if (colConfig.fieldtype === "Datetime") {
                return formatters.formatDisplayDateTime(value);
              }
            } else if (colConfig.fieldtype === "Check") {
              return value ? "✓" : "✗";
            }
            return value;
          };

      const filterElementRenderer = fieldCfg.tableFilterElement
        ? (options) =>
            fieldCfg.tableFilterElement(colConfig, colConfig.fieldname, options)
        : null;

      return (
        <Column
          key={colConfig.fieldname}
          columnKey={colConfig.fieldname}
          field={colConfig.fieldname}
          header={colConfig.header || colConfig.label || colConfig.fieldname}
          body={bodyRenderer}
          sortable={colConfig.sortable !== false && fieldCfg.sortable !== false}
          filter={
            colConfig.filterable === true && fieldCfg.filterable !== false
          }
          filterElement={filterElementRenderer}
          dataType={fieldCfg.dataType || "text"}
          style={{ minWidth: colConfig.minWidth, ...(colConfig.style || {}) }}
          showFilterMatchModes={
            colConfig.showFilterMatchModes !== false &&
            fieldCfg.dataType !== "boolean"
          }
          filterMatchModeOptions={colConfig.filterMatchModeOptions}
          headerTooltip={parseDescription(colConfig.description)?.tooltip}
        />
      );
    });
  }, [visibleColumns, columnsConfig]);

  if (loading && !tableData.length) {
    return (
      <div
        className="flex justify-center items-center p-4"
        style={{ height: "300px" }}
      >
        <ProgressSpinner
          style={{ width: "50px", height: "50px" }}
          strokeWidth="8"
        />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-card p-4 rounded-lg bg-red-100 border border-red-400 text-red-700">
        <p className="font-bold">Error loading data for {doctype}:</p>
        <p>{error.message || JSON.stringify(error)}</p>
        <Button
          label="Retry"
          icon="pi pi-refresh"
          className="p-button-sm mt-2"
          onClick={mutate}
        />
      </div>
    );
  }

  return (
    <div className="card">
      {contextMenuItemsModel && (
        <ContextMenu
          model={contextMenuItemsModel}
          ref={cm}
          onHide={handleContextMenuHide}
        />
      )}
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
        header={headerContent}
        emptyMessage={emptyMessage}
        resizableColumns
        showGridlines
        tableStyle={tableStyle}
        selectionMode={contextMenuItemsModel || onRowClick ? "single" : null}
        selection={selectedRow}
        onSelectionChange={(e) => setSelectedRow(e.value)}
        onRowSelect={handleRowSelect}
        onRowUnselect={handleRowUnselect}
        contextMenuSelection={selectedRow}
        onContextMenuSelectionChange={(e) => setSelectedRow(e.value)}
        onContextMenu={handleContextMenu}
      >
        {dynamicColumns}
      </DataTable>
    </div>
  );
};

export default DynamicDataTable;
