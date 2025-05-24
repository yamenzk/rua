// src/components/formFields/LinkFormField.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";

const LinkFormField = ({
  id, // fieldname
  value, // current selected value
  onChange, // callback function
  disabled,
  className,
  placeholder,
  fieldSchemaItem,
  linkedDoctype,
  fetchLinkOptions,
  isLoading = false,
  showClear = true,
  ...otherProps
}) => {
  const [options, setOptions] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Debounced search term for API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce the search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch options when component mounts or when search term changes
  const loadOptions = useCallback(
    async (search = "", isInitialLoad = false) => {
      if (!linkedDoctype || !fetchLinkOptions) return;

      setIsLoadingOptions(true);
      try {
        const fetchedOptions = await fetchLinkOptions(
          linkedDoctype,
          fieldSchemaItem?.description || "",
          search
        );
        setOptions(fetchedOptions || []);
      } catch (error) {
        console.error("Error loading link options:", error);
        setOptions([]);
      } finally {
        setIsLoadingOptions(false);
      }
    },
    [linkedDoctype, fetchLinkOptions, fieldSchemaItem?.description]
  );

  // Load initial options when component mounts
  useEffect(() => {
    loadOptions("", true);
  }, [loadOptions]);

  // Load options when debounced search term changes
  useEffect(() => {
    if (isDropdownOpen) {
      loadOptions(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, loadOptions, isDropdownOpen]);

  // Handle dropdown show/hide
  const handleDropdownShow = useCallback(() => {
    setIsDropdownOpen(true);
    // Reload options when dropdown opens to get fresh data
    loadOptions(searchTerm);
  }, [loadOptions, searchTerm]);

  const handleDropdownHide = useCallback(() => {
    setIsDropdownOpen(false);
    setSearchTerm("");
  }, []);

  // Handle selection change
  const handleChange = useCallback(
    (e) => {
      if (onChange) {
        // For PrimeReact Dropdown, the event structure is different
        // We need to create the expected event structure for the form handler
        const syntheticEvent = {
          target: {
            name: id,
            value: e.value,
          },
          // Include the original event for reference if needed
          originalEvent: e.originalEvent,
        };
        onChange(syntheticEvent);
      }
    },
    [onChange, id]
  );

  // Handle search/filter
  const handleFilter = useCallback((e) => {
    setSearchTerm(e.filter || "");
  }, []);

  // Refresh button handler
  const handleRefresh = useCallback(() => {
    loadOptions(searchTerm, false, true); // Force refresh
  }, [loadOptions, searchTerm]);

  // Memoized dropdown props
  const dropdownProps = useMemo(() => {
    // Filter out props that shouldn't be passed to DOM elements
    const {
      fetchLinkOptions: _fetchLinkOptions,
      fieldSchemaItem: _fieldSchemaItem,
      linkedDoctype: _linkedDoctype,
      resetFilter: _resetFilter,
      ...safeOtherProps
    } = otherProps;

    return {
      id,
      value: value || null,
      options,
      onChange: handleChange,
      disabled: disabled || isLoading,
      className: `${className || ""} ${
        isLoadingOptions ? "p-dropdown-loading" : ""
      }`,
      placeholder: isLoadingOptions
        ? "Loading options..."
        : placeholder || `Select ${linkedDoctype || "option"}...`,
      showClear: showClear && !disabled,
      filter: true,
      filterBy: "label",
      filterPlaceholder: `Search ${linkedDoctype || "options"}...`,
      onFilter: handleFilter,
      onShow: handleDropdownShow,
      onHide: handleDropdownHide,
      emptyMessage: isLoadingOptions
        ? "Loading..."
        : searchTerm
        ? `No ${linkedDoctype || "options"} found matching "${searchTerm}"`
        : `No ${linkedDoctype || "options"} available`,
      // Don't pass resetFilter to the DOM element
      ...safeOtherProps,
    };
  }, [
    id,
    value,
    options,
    handleChange,
    disabled,
    isLoading,
    className,
    isLoadingOptions,
    placeholder,
    linkedDoctype,
    showClear,
    handleFilter,
    handleDropdownShow,
    handleDropdownHide,
    searchTerm,
    otherProps,
  ]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 relative">
        <Dropdown {...dropdownProps} />
        {isLoadingOptions && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
            <ProgressSpinner size="16" strokeWidth="4" />
          </div>
        )}
      </div>

      {/* Refresh button */}
      <Button
        icon="pi pi-refresh"
        text
        rounded
        size="small"
        onClick={handleRefresh}
        disabled={disabled || isLoadingOptions}
        tooltip="Refresh options"
        tooltipOptions={{ position: "top" }}
        className="p-button-sm flex-shrink-0"
      />
    </div>
  );
};

export default LinkFormField;
