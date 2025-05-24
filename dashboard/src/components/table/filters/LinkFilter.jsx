// src/components/table/filters/LinkFilter.jsx
import React, { useState, useEffect, useCallback } from "react";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";

const LinkFilter = ({
  options, // PrimeReact filter options object
  linkedDoctype,
  fieldDescription = "",
  fetchLinkOptions,
  placeholder = "Any",
  maxSelectedLabels = 3,
}) => {
  const [selectOptions, setSelectOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Load options when component mounts
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
        setSelectOptions(fetchedOptions || []);
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
    loadOptions();
  }, [loadOptions]);

  // Handle search in MultiSelect
  const handleFilter = useCallback(
    (e) => {
      const newSearchTerm = e.filter || "";
      setSearchTerm(newSearchTerm);

      // Debounce the API call
      const timer = setTimeout(() => {
        loadOptions(newSearchTerm);
      }, 300);

      return () => clearTimeout(timer);
    },
    [loadOptions]
  );

  // Handle selection change
  const handleSelectionChange = useCallback(
    (e) => {
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
        <MultiSelect
          value={options.value || []} // Ensure it's always an array
          options={selectOptions}
          onChange={handleSelectionChange}
          placeholder={isLoading ? "Loading..." : placeholder}
          className="p-column-filter"
          maxSelectedLabels={maxSelectedLabels}
          showClear
          filter
          filterBy="label"
          filterPlaceholder={`Search ${linkedDoctype}...`}
          onFilter={handleFilter}
          emptyMessage={
            isLoading
              ? "Loading..."
              : searchTerm
              ? `No ${linkedDoctype} found matching "${searchTerm}"`
              : `No ${linkedDoctype} available`
          }
          disabled={isLoading}
          // Ensure controlled component behavior
          resetFilterOnHide={false}
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
