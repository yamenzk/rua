// src/components/table/filters/LinkFilter.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Dropdown } from "primereact/dropdown"; // Changed from MultiSelect
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";

const LinkFilter = ({
  options, // PrimeReact filter options object
  linkedDoctype,
  fieldDescription = "",
  fetchLinkOptions,
  placeholder = "Any",
}) => {
  const [selectOptions, setSelectOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Load options when component mounts or search term changes
  const loadOptions = useCallback(
    async (search = "") => {
      if (!linkedDoctype || !fetchLinkOptions) return;

      setIsLoading(true);
      try {
        const fetchedOptions = await fetchLinkOptions(
          linkedDoctype,
          fieldDescription,
          search
        );
        // Ensure options have 'label' and 'value' properties
        setSelectOptions(
          fetchedOptions.map((opt) => ({
            label: opt.label || opt.value, // Fallback in case 'label' is missing
            value: opt.value,
          })) || []
        );
      } catch (error) {
        console.error(
          "Error loading link filter options:",
          error,
          linkedDoctype
        );
        setSelectOptions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [linkedDoctype, fetchLinkOptions, fieldDescription]
  );

  useEffect(() => {
    // Initial load when component mounts
    loadOptions();
  }, [loadOptions]);

  // Handle search (filtering) in Dropdown
  const handleFilter = useCallback(
    (e) => {
      const newSearchTerm = e.filter || "";
      setSearchTerm(newSearchTerm);

      // Debounce the API call for dynamic loading
      const timer = setTimeout(() => {
        loadOptions(newSearchTerm);
      }, 300); // Adjust debounce time as needed

      return () => clearTimeout(timer); // Cleanup on re-render or unmount
    },
    [loadOptions]
  );

  // Normalize the value for the Dropdown component
  const selectedValue = useMemo(() => {
    // If options.value is an array (from MultiSelect past), take the first element.
    // Otherwise, use the value directly.
    if (Array.isArray(options.value)) {
      return options.value.length > 0 ? options.value[0] : null;
    }
    return options.value || null;
  }, [options.value]);

  // Handle selection change for Dropdown
  const handleSelectionChange = useCallback(
    (e) => {
      // Dropdown's onChange event directly gives the selected value
      options.filterCallback(e.value);
    },
    [options]
  );

  // Refresh handler
  const handleRefresh = useCallback(() => {
    loadOptions(searchTerm);
  }, [loadOptions, searchTerm]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 relative">
        <Dropdown
          value={selectedValue} // Pass the single selected value
          options={selectOptions}
          onChange={handleSelectionChange}
          placeholder={isLoading ? "Loading..." : placeholder}
          className="p-column-filter"
          showClear // Allows clearing the selection
          filter // Enables client-side filtering (if options are loaded) or triggers onFilter for remote
          filterBy="label" // Specifies the property to filter by
          filterPlaceholder={`Search ${linkedDoctype}...`}
          onFilter={handleFilter} // Custom filter handler for remote loading
          emptyMessage={
            isLoading
              ? "Loading..."
              : searchTerm
              ? `No ${linkedDoctype} found matching "${searchTerm}"`
              : `No ${linkedDoctype} available`
          }
          disabled={isLoading}
          // The `resetFilterOnHide` is not a direct prop for Dropdown,
          // but its behavior is often managed by the `onFilter` and `value` state.
          // For Dropdown, the filter state is usually tied to the `filter` prop itself.
        />
        {isLoading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
            <ProgressSpinner size="14" strokeWidth="4" />
          </div>
        )}
      </div>

      <Button
        icon="pi pi-refresh"
        text
        rounded
        size="small"
        onClick={handleRefresh}
        disabled={isLoading}
        tooltip="Refresh options"
        tooltipOptions={{ position: "top" }}
        className="p-button-sm flex-shrink-0"
      />
    </div>
  );
};

export default LinkFilter;
