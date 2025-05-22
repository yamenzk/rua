// dashboard/src/components/common/DynamicDataTable.jsx
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
import { FilterMatchMode } from "primereact/api";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { ProgressSpinner } from "primereact/progressspinner";
import { setCookie, getCookie } from "@/utils/cookies"; // .js or .jsx as appropriate

import * as formatters from "@/utils/formatters"; // .jsx not needed if build system handles it
import { getFieldConfig } from "@/utils/fieldTypeConfigurations.jsx"; // Corrected path
import { parseDescription } from "@/utils/schemaUtils";

// Utility function to safely parse dates from Frappe backend
const parseDateValue = (value, fieldtype) => {
  if (!value) return null;

  // If it's already a Date object, return it
  if (value instanceof Date) return value;

  // If it's a string, try to parse it
  if (typeof value === "string") {
    // Handle different date/time formats from Frappe
    let parsedDate;

    if (fieldtype === "Datetime") {
      // Frappe datetime format: YYYY-MM-DD HH:MM:SS
      parsedDate = new Date(value);
    } else if (fieldtype === "Date") {
      // Frappe date format: YYYY-MM-DD
      parsedDate = new Date(value + "T00:00:00"); // Add time to avoid timezone issues
    } else if (fieldtype === "Time") {
      // Frappe time format: HH:MM:SS
      // Create a date with today's date but the specified time
      const today = new Date();
      const [hours, minutes, seconds] = value.split(":").map(Number);
      parsedDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        hours,
        minutes,
        seconds || 0
      );
    }

    // Check if the parsed date is valid
    if (parsedDate && !isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  return null;
};

// Utility function to safely parse boolean values from Frappe backend
const parseBooleanValue = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string")
    return value === "1" || value.toLowerCase() === "true";
  return false;
};

// Transform data to convert date strings to Date objects and boolean strings to booleans
const transformDataForSpecialFields = (data, columnsConfig) => {
  if (!data || !Array.isArray(data)) return data;

  const dateFields = columnsConfig.filter((col) =>
    ["Date", "Datetime", "Time"].includes(col.fieldtype)
  );

  const booleanFields = columnsConfig.filter(
    (col) => col.fieldtype === "Check"
  );

  if (dateFields.length === 0 && booleanFields.length === 0) return data;

  return data.map((row) => {
    const transformedRow = { ...row };

    // Transform date fields
    dateFields.forEach((field) => {
      if (transformedRow[field.fieldname]) {
        transformedRow[field.fieldname] = parseDateValue(
          transformedRow[field.fieldname],
          field.fieldtype
        );
      }
    });

    // Transform boolean fields
    booleanFields.forEach((field) => {
      if (typeof transformedRow[field.fieldname] !== "undefined") {
        transformedRow[field.fieldname] = parseBooleanValue(
          transformedRow[field.fieldname]
        );
      }
    });

    return transformedRow;
  });
};

const DynamicDataTable = ({
  doctype,
  columnsConfig, // Array of objects with fieldname, fieldtype, header, filterable, sortable, defaultVisible, options, displayProps, minWidth, style, description etc.
  fetchArgs = {},
  onRowClick,
  contextMenuItemsModel,
  globalFilterFields = ["name"], // Fields to be searched by global filter
  rowGroupMode,
  groupRowsBy,
  rowGroupHeaderTemplate,
  rowGroupFooterTemplate,
  showColumnToggle = true,
  showPaginator = true,
  rowsPerPageOptions = [10, 25, 50, 100],
  initialRows = 10,
  dataKey = "name",
  tableStyle = { minWidth: "50rem" },
  emptyMessage = "No records found.",
  enableColumnReordering = true,
  uniqueTableKey, // IMPORTANT: For cookie state persistence
  headerActions, // JSX or component for actions in the header
}) => {
  const {
    data,
    error,
    isLoading: frappeIsLoading,
    mutate,
  } = useFrappeGetDocList(
    doctype,
    {
      fields: ["*"], // Fetch all fields, filtering/selection happens client-side or via columnsConfig
      limit: 0, // Fetch all for client-side operations initially
      ...fetchArgs, // Allows overriding fields, limit, filters, orderBy etc.
    },
    {} // SWR config options if needed
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
      // Restore based on fieldnames, ensuring they still exist in current columnsConfig
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

  // Effect to save state to cookie
  useEffect(() => {
    if (tableStateCookieKey) {
      const stateToSave = {
        visibleColumns: visibleColumns.map((col) => col.fieldname),
        first,
        rows,
        sortField,
        sortOrder,
        filters: {
          // Save only filter values, not complex objects
          global: { value: globalFilterValue },
          ...Object.entries(filters)
            .filter(([key]) => key !== "global")
            .reduce((acc, [key, value]) => {
              if (value && typeof value.value !== "undefined") {
                // For date filters, save as ISO string to preserve value
                let filterValue = value.value;
                if (filterValue instanceof Date) {
                  filterValue = filterValue.toISOString();
                }
                acc[key] = { value: filterValue };
              }
              return acc;
            }, {}),
        },
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
    filters,
    tableStateCookieKey,
  ]);

  const initializeFilters = useCallback(
    (savedFilterValues) => {
      const initialFilters = {
        global: {
          value: savedFilterValues?.global?.value || null,
          matchMode: FilterMatchMode.CONTAINS,
        },
      };
      columnsConfig.forEach((colConfig) => {
        if (colConfig.filterable !== false) {
          // Check schema-defined filterable
          const fieldCfg = getFieldConfig(
            colConfig.fieldtype,
            colConfig.fieldname
          );
          if (fieldCfg.filterable === false) return; // Check field type config filterable

          let matchMode = FilterMatchMode.CONTAINS; // Default
          if (fieldCfg.dataType === "numeric") {
            matchMode = FilterMatchMode.EQUALS;
          } else if (fieldCfg.dataType === "date") {
            matchMode = FilterMatchMode.DATE_IS;
          } else if (fieldCfg.dataType === "boolean") {
            matchMode = FilterMatchMode.EQUALS;
          } else if (
            colConfig.fieldtype === "Select" ||
            colConfig.fieldtype === "Link" ||
            fieldCfg.formComponent === MultiSelect
          ) {
            matchMode = FilterMatchMode.IN;
          }
          if (
            fieldCfg.tableFilterElement &&
            (colConfig.fieldtype === "Link" ||
              colConfig.fieldtype === "Dynamic Link")
          ) {
            matchMode = FilterMatchMode.IN;
          }

          // Handle saved filter values for different field types
          let savedValue =
            savedFilterValues?.[colConfig.fieldname]?.value || null;
          if (savedValue !== null) {
            if (["Date", "Datetime", "Time"].includes(colConfig.fieldtype)) {
              // Convert saved ISO string back to Date object
              if (typeof savedValue === "string") {
                savedValue = new Date(savedValue);
                if (isNaN(savedValue.getTime())) {
                  savedValue = null;
                }
              }
            } else if (colConfig.fieldtype === "Check") {
              // Ensure boolean values for Check fields
              savedValue = parseBooleanValue(savedValue);
            }
          }

          initialFilters[colConfig.fieldname] = {
            value: savedValue,
            matchMode: matchMode, // Set programmatically, not from cookie for matchMode
          };
        }
      });
      setFilters(initialFilters);
      if (savedFilterValues?.global?.value) {
        setGlobalFilterValue(savedFilterValues.global.value);
      }
    },
    [columnsConfig]
  ); // Removed getFieldConfig from deps, it's stable

  useEffect(() => {
    if (frappeIsLoading) {
      setLoading(true);
      return;
    }
    if (data) {
      // Transform data to convert date strings to Date objects and boolean strings to booleans
      const transformedData = transformDataForSpecialFields(
        data,
        columnsConfig
      );
      setTableData(transformedData);

      const savedState = loadStateFromCookie();
      initializeFilters(savedState?.filters);
      setLoading(false);
    }
    if (error) {
      console.error(`Error fetching ${doctype} list:`, error);
      setLoading(false);
    }
  }, [
    data,
    error,
    frappeIsLoading,
    doctype,
    columnsConfig,
    initializeFilters,
    loadStateFromCookie,
  ]);

  const onColumnToggle = useCallback(
    (event) => {
      const selectedToggleColumns = event.value; // These are column config objects from MultiSelect
      // Preserve the order from the original columnsConfig for newly added columns
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
        // event.columns are the PrimeReact Column components in their new order
        const reorderedFieldnames = event.columns
          .map((primeCol) => primeCol.props.field)
          .filter(Boolean);
        const newReorderedVisibleColumns = reorderedFieldnames
          .map((fieldname) =>
            visibleColumns.find((vc) => vc.fieldname === fieldname)
          ) // Find from current visible
          .filter(Boolean);

        // If a column was reordered that wasn't previously visible (shouldn't happen with current setup)
        // or to ensure all are from original config:
        const finalOrderedColumns = reorderedFieldnames
          .map((fieldname) =>
            columnsConfig.find((cfg) => cfg.fieldname === fieldname)
          )
          .filter(Boolean);

        setVisibleColumns(finalOrderedColumns);
      }
    },
    [columnsConfig, visibleColumns]
  ); // Added visibleColumns as it's used indirectly for reordering

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
    setSelectedRow(e.data); // Important to set the selected row for context menu actions
    cm.current?.show(e.originalEvent);
  }, []);

  const handleContextMenuHide = useCallback(() => {
    setSelectedRow(null);
  }, []);

  const headerContent = useMemo(
    () => (
      <div className="flex flex-wrap items-center justify-between gap-2 py-2">
        <div className="flex items-center gap-2">
          {headerActions}
          <Button
            icon="pi pi-refresh"
            rounded
            text
            severity="secondary"
            aria-label="Refresh Data"
            onClick={mutate} // mutate is stable from SWR
            tooltip="Refresh Data"
            tooltipOptions={{ position: "top" }}
          />
        </div>
        <div className="flex items-center gap-2">
          {showColumnToggle && (
            <MultiSelect
              value={visibleColumns} // These are column config objects
              options={columnsConfig} // All possible columns
              optionLabel="header" // Display 'header' property of colConfig objects
              onChange={onColumnToggle}
              className="w-full sm:w-auto md:w-60 p-multiselect-sm"
              display="chip"
              placeholder="Toggle Columns"
              itemTemplate={(option) => (
                <span>{option.header || option.fieldname}</span>
              )} // Ensure label if header missing
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
            // For display purposes, format dates and booleans appropriately
            if (
              ["Date", "Datetime", "Time"].includes(colConfig.fieldtype) &&
              value instanceof Date
            ) {
              if (colConfig.fieldtype === "Date") {
                return value.toLocaleDateString();
              } else if (colConfig.fieldtype === "Time") {
                return value.toLocaleTimeString();
              } else if (colConfig.fieldtype === "Datetime") {
                return value.toLocaleString();
              }
            } else if (colConfig.fieldtype === "Check") {
              // Display checkmark or X for boolean values
              return value ? "✓" : "✗";
            }
            return value;
          };

      const filterElementRenderer = colConfig.filterElementTemplate
        ? (options) =>
            colConfig.filterElementTemplate(
              options,
              colConfig.options || colConfig.filterOptions
            )
        : fieldCfg.tableFilterElement
        ? (options) =>
            fieldCfg.tableFilterElement(
              colConfig,
              colConfig.fieldname,
              options.value,
              options.filterApplyCallback,
              colConfig.filterOptions && colConfig.filterOptions.length > 0
                ? colConfig.filterOptions
                : colConfig.options || [] // options from schema (e.g. for Select)
            )
        : null;

      const columnFilterConfig = filters[colConfig.fieldname];

      return (
        <Column
          key={colConfig.fieldname}
          columnKey={colConfig.fieldname} // Important for reordering and state
          field={colConfig.fieldname}
          header={colConfig.header || colConfig.label || colConfig.fieldname} // Fallback for header
          body={bodyRenderer}
          sortable={colConfig.sortable !== false && fieldCfg.sortable !== false}
          filter={
            colConfig.filterable === true && fieldCfg.filterable !== false
          }
          filterElement={filterElementRenderer}
          filterMatchMode={columnFilterConfig?.matchMode} // Use the one from filters state
          dataType={fieldCfg.dataType || "text"}
          style={{ minWidth: colConfig.minWidth, ...(colConfig.style || {}) }}
          showFilterMatchModes={
            colConfig.showFilterMatchModes !== false &&
            fieldCfg.dataType !== "boolean"
          }
          filterMatchModeOptions={colConfig.filterMatchModeOptions} // Allow override from schema
          headerTooltip={parseDescription(colConfig.description)?.tooltip}
        />
      );
    });
  }, [visibleColumns, columnsConfig, filters]); // getFieldConfig removed from deps as it's stable

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
        onSelectionChange={(e) => setSelectedRow(e.value)} // PrimeReact internal selection
        onRowSelect={handleRowSelect} // Custom handler for click/programmatic select
        onRowUnselect={handleRowUnselect}
        contextMenuSelection={selectedRow} // For PrimeReact's built-in context menu selection tracking
        onContextMenuSelectionChange={(e) => setSelectedRow(e.value)}
        onContextMenu={handleContextMenu}
        rowGroupMode={rowGroupMode}
        groupRowsBy={groupRowsBy}
        rowGroupHeaderTemplate={rowGroupHeaderTemplate}
        rowGroupFooterTemplate={rowGroupFooterTemplate}
      >
        {dynamicColumns}
      </DataTable>
    </div>
  );
};

export default DynamicDataTable;
