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
import { setCookie, getCookie } from "@/utils/cookies.js"; // Ensure .jsx if it contains JSX

import * as formatters from "@/utils/formatters.jsx"; // Ensure .jsx if it contains JSX
import { getFieldConfig } from "@/utils/FieldManager.jsx"; // Ensure .jsx

const DynamicDataTable = ({
  doctype,
  columnsConfig,
  fetchArgs = {},
  onRowClick,
  contextMenuItemsModel,
  globalFilterFields = ["name"],
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
  uniqueTableKey, // IMPORTANT: For cookie state
  headerActions,
}) => {
  const {
    data,
    error,
    isLoading: frappeIsLoading,
    mutate, // SWR mutate function to re-fetch data
  } = useFrappeGetDocList(
    doctype,
    {
      fields: ["*"],
      limit: 0, // Fetch all for client-side initially
      ...fetchArgs,
    },
    {}
  );
  const handleDocTypeUpdate = useCallback(
    (eventData) => {
      // eventData contains { doctype, name, user }
      // We only care if the doctype matches the one this table is for.
      if (eventData.doctype === doctype) {
        console.log(
          `Realtime event 'list_update' received for doctype ${doctype}, docname ${eventData.name}. Re-fetching list...`
        );
        mutate(); // Re-fetch the list for this table
      }
    },
    [doctype, mutate]
  ); // Dependencies for the callback

  // Use the FrappeDocTypeEventListener
  useFrappeDocTypeEventListener(doctype, handleDocTypeUpdate);

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({});
  const [selectedRow, setSelectedRow] = useState(null);

  // Cookie and state initialization logic
  const tableStateCookieKey = uniqueTableKey
    ? `datatable_${uniqueTableKey}_state`
    : null;

  const loadStateFromCookie = useCallback(() => {
    if (tableStateCookieKey) {
      const savedStateString = getCookie(tableStateCookieKey);
      if (savedStateString) {
        try {
          const parsedState = JSON.parse(savedStateString);
          return parsedState; // Will contain { visibleColumns: [...fieldnames], ...otherProps }
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
      savedState &&
      savedState.visibleColumns &&
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

  const [first, setFirst] = useState(() => {
    const savedState = loadStateFromCookie();
    return savedState?.first || 0;
  });

  const [rows, setRows] = useState(() => {
    const savedState = loadStateFromCookie();
    return savedState?.rows || initialRows;
  });

  // Add state for sorting
  const [sortField, setSortField] = useState(() => {
    const savedState = loadStateFromCookie();
    return savedState?.sortField || fetchArgs.orderBy?.field || null;
  });
  const [sortOrder, setSortOrder] = useState(() => {
    const savedState = loadStateFromCookie();
    return (
      savedState?.sortOrder || (fetchArgs.orderBy?.order === "desc" ? -1 : 1)
    );
  });

  const dt = useRef(null);
  const cm = useRef(null);

  // Effect to save state to cookie
  useEffect(() => {
    if (tableStateCookieKey) {
      const columnFieldnamesToSave = visibleColumns.map((col) => col.fieldname);

      let existingCookieState = {};
      try {
        const currentStateString = getCookie(tableStateCookieKey);
        if (currentStateString)
          existingCookieState = JSON.parse(currentStateString);
      } catch (e) {
        /* ignore */
      }

      const newStateToSave = {
        ...existingCookieState,
        visibleColumns: columnFieldnamesToSave,
        first,
        rows,
        sortField,
        sortOrder,
        // Note: Saving filters object directly can be complex due to FilterMatchMode objects.
        // Consider saving only filter values if needed, or a simplified filter representation.
      };
      setCookie(tableStateCookieKey, JSON.stringify(newStateToSave), 30);
    }
  }, [visibleColumns, first, rows, sortField, sortOrder, tableStateCookieKey]);

  useEffect(() => {
    if (frappeIsLoading) {
      setLoading(true);
      return;
    }
    if (data) {
      setTableData(data);
      initializeFilters(loadStateFromCookie()?.filters); // Pass saved filters if available
      setLoading(false);
    }
    if (error) {
      console.error(`Error fetching ${doctype} list:`, error);
      setLoading(false);
    }
  }, [data, error, frappeIsLoading, doctype, loadStateFromCookie]);

  const initializeFilters = (savedFilters) => {
    const initialFilters = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    };
    columnsConfig.forEach((colConfig) => {
      if (colConfig.filterable !== false) {
        const fieldConfig = getFieldConfig(
          colConfig.fieldtype,
          colConfig.fieldname
        );
        let matchMode = FilterMatchMode.CONTAINS;
        if (
          fieldConfig.dataType === "numeric" ||
          fieldConfig.dataType === "date"
        ) {
          matchMode = FilterMatchMode.EQUALS;
        } else if (fieldConfig.dataType === "boolean") {
          matchMode = FilterMatchMode.EQUALS;
        } else if (
          colConfig.fieldtype === "Select" ||
          colConfig.fieldtype === "Link"
        ) {
          matchMode = FilterMatchMode.IN;
        }
        initialFilters[colConfig.fieldname] = {
          value: savedFilters?.[colConfig.fieldname]?.value || null,
          matchMode:
            savedFilters?.[colConfig.fieldname]?.matchMode || matchMode,
        };
      }
    });
    setFilters(initialFilters);
    if (savedFilters?.global) {
      setGlobalFilterValue(savedFilters.global.value || "");
    }
  };

  const onColumnToggle = (event) => {
    const selectedColumnsFromToggle = event.value; // These are column config objects
    const newVisibleColumns = columnsConfig.filter((configCol) =>
      selectedColumnsFromToggle.some(
        (selectedCol) => selectedCol.fieldname === configCol.fieldname
      )
    );
    // To maintain user's preferred order, we re-order `newVisibleColumns` based on `columnsConfig`
    // This ensures newly added columns appear in a predictable place, and then user can reorder.
    const orderedNewVisibleColumns = columnsConfig.filter((configCol) =>
      newVisibleColumns.some(
        (newVisCol) => newVisCol.fieldname === configCol.fieldname
      )
    );
    setVisibleColumns(orderedNewVisibleColumns);
  };

  const onColumnReorder = (event) => {
    if (event.columns && Array.isArray(event.columns)) {
      const reorderedColumnFieldnames = event.columns
        .map((primeColumn) => primeColumn.props.field)
        .filter(Boolean); // Filter out non-data columns like reorder handle

      const newVisibleColumns = reorderedColumnFieldnames
        .map((fieldname) =>
          columnsConfig.find((cfg) => cfg.fieldname === fieldname)
        )
        .filter(Boolean);

      setVisibleColumns(newVisibleColumns);
    }
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => (
    <div className="flex flex-wrap items-center justify-between gap-2 py-2">
      <div className="flex items-center gap-2">
        {headerActions}
        <Button
          icon="pi pi-refresh"
          rounded
          text
          severity="secondary"
          aria-label="Refresh Data"
          onClick={() => mutate()}
          tooltip="Refresh Data"
          tooltipOptions={{ position: "top" }}
        />
      </div>
      <div className="flex items-center gap-2">
        {showColumnToggle && (
          <MultiSelect
            value={visibleColumns}
            options={columnsConfig} // Show all possible columns in the toggler
            optionLabel="header"
            onChange={onColumnToggle}
            className="w-full sm:w-auto md:w-60 p-multiselect-sm"
            display="chip"
            placeholder="Toggle Columns"
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
  );

  const handleRowSelect = (event) => {
    setSelectedRow(event.data); // Update selectedRow for context menu logic
    if (onRowClick) {
      onRowClick(event.data);
    }
  };

  const handleRowUnselect = () => {
    setSelectedRow(null);
  };

  const dynamicColumns = useMemo(() => {
    return visibleColumns.map((colConfig) => {
      const fieldConfig = getFieldConfig(
        colConfig.fieldtype,
        colConfig.fieldname
      );
      const bodyRenderer = colConfig.bodyTemplate
        ? (rowData) => colConfig.bodyTemplate(rowData, formatters)
        : fieldConfig.tableBodyComponent
        ? (rowData) =>
            fieldConfig.tableBodyComponent(
              rowData,
              colConfig.fieldname,
              colConfig.displayProps,
              formatters
            )
        : (rowData) => rowData[colConfig.fieldname];

      const filterElementRenderer = colConfig.filterElementTemplate
        ? (options) =>
            colConfig.filterElementTemplate(
              options,
              colConfig.options || colConfig.filterOptions
            )
        : fieldConfig.tableFilterElement
        ? (options) =>
            fieldConfig.tableFilterElement(
              colConfig,
              colConfig.fieldname,
              options.value,
              options.filterApplyCallback,
              colConfig.filterOptions || colConfig.options
            )
        : null;

      return (
        <Column
          key={colConfig.fieldname}
          columnKey={colConfig.fieldname} // Important for reordering
          field={colConfig.fieldname}
          header={colConfig.header}
          body={bodyRenderer}
          sortable={
            colConfig.sortable !== false && fieldConfig.sortable !== false
          }
          filter={
            colConfig.filterable !== false && fieldConfig.filterable !== false
          }
          filterElement={filterElementRenderer}
          filterMatchMode={filters[colConfig.fieldname]?.matchMode} // Ensure this uses the state
          dataType={fieldConfig.dataType || "text"}
          style={{
            minWidth: colConfig.minWidth || "150px",
            ...colConfig.style,
          }}
          showFilterMatchModes={
            colConfig.showFilterMatchModes !== false &&
            fieldConfig.dataType !== "boolean"
          }
          filterMatchModeOptions={colConfig.filterMatchModeOptions}
        />
      );
    });
  }, [visibleColumns, columnsConfig, filters]); // Add filters to dependencies if filterMatchMode relies on it

  if (loading && !tableData.length) {
    // Show spinner only on initial load or if data is truly empty
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
          onClick={() => mutate()}
        />
      </div>
    );
  }

  const headerContent = renderHeader();

  return (
    <div className="card">
      {contextMenuItemsModel && (
        <ContextMenu
          model={contextMenuItemsModel}
          ref={cm}
          onHide={() => setSelectedRow(null)}
        />
      )}
      <DataTable
        ref={dt}
        value={tableData}
        loading={loading || frappeIsLoading} // Show loading indicator during SWR revalidations too
        dataKey={dataKey}
        paginator={showPaginator}
        rows={rows}
        first={first}
        onPage={(e) => {
          setFirst(e.first);
          setRows(e.rows);
        }}
        rowsPerPageOptions={rowsPerPageOptions}
        filters={filters}
        onFilter={(e) => {
          setFilters(e.filters);
          // Optionally save filters to cookie here if desired
        }}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={(e) => {
          setSortField(e.sortField);
          setSortOrder(e.sortOrder);
        }}
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
        onRowSelect={handleRowSelect} // Ensure this updates selectedRow for context menu
        onRowUnselect={handleRowUnselect}
        contextMenuSelection={selectedRow}
        onContextMenuSelectionChange={(e) => setSelectedRow(e.value)}
        onContextMenu={(e) => {
          setSelectedRow(e.data);
          cm.current?.show(e.originalEvent);
        }} // Set selectedRow on context menu event
        rowGroupMode={rowGroupMode}
        groupRowsBy={groupRowsBy}
        rowGroupHeaderTemplate={rowGroupHeaderTemplate}
        rowGroupFooterTemplate={rowGroupFooterTemplate}
      >
        {/* Column for row reordering handle (if row reordering is needed, separate from column reordering) */}
        {/* {enableRowReordering && <Column rowReorder style={{ width: '3rem' }} />}  */}
        {dynamicColumns}
      </DataTable>
    </div>
  );
};

export default DynamicDataTable;
