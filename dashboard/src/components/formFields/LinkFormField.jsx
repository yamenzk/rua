// src/components/formFields/LinkFormField.jsx - Refactored with Central Styles
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import {
  FormFieldWrapper,
  useFormFieldState,
  PRIMEREACT_PT_CONFIGS,
} from "./styles/formFieldStyles";

const LinkFormField = ({
  id, // fieldname
  value, // current selected value
  onChange, // callback function
  disabled,
  className,
  placeholder,
  tooltip,
  required,
  error,
  size = "base",
  fieldSchemaItem,
  linkedDoctype,
  fetchLinkOptions,
  isLoading = false,
  showClear = false, // Default to false for consistency
  ...otherProps
}) => {
  const [options, setOptions] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Use central state management
  const {
    isFocused,
    isHovered,
    handleFocus,
    handleBlur,
    handleMouseEnter,
    handleMouseLeave,
  } = useFormFieldState();

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

  // Filter out props that shouldn't be passed to DOM elements
  const {
    fetchLinkOptions: _fetchLinkOptions,
    fieldSchemaItem: _fieldSchemaItem,
    linkedDoctype: _linkedDoctype,
    onFocus,
    onBlur,
    ...safeOtherProps
  } = otherProps;

  // Get PrimeReact PassThrough config with enhanced dropdown styling
  const ptConfig = {
    ...PRIMEREACT_PT_CONFIGS.dropdown({
      isFocused,
      isHovered,
      disabled,
      error: !!error,
      size,
      className,
    }),
    // Enhanced panel styling for elegant dropdown
    panel: {
      className:
        "border-none shadow-xl rounded-2xl mt-2 overflow-hidden bg-surface-0 backdrop-blur-sm",
    },
    list: {
      className: "p-2",
    },
    item: {
      className:
        "px-3 py-2 mx-1 rounded-xl hover:bg-primary-50 transition-all duration-150 cursor-pointer border-none text-sm",
    },
    filterContainer: {
      className: "p-3 border-b border-surface-100",
    },
    filterInput: {
      className:
        "w-full px-3 py-2 text-sm border border-surface-200 rounded-xl focus:border-primary-400 focus:outline-none transition-colors",
    },
    // Hide the clear button completely
    clearIcon: {
      className: "hidden",
    },
    // Loading state styling
    loadingIcon: {
      className: "text-primary-500",
    },
  };

  return (
    <FormFieldWrapper
      id={id}
      error={error}
      required={required}
      disabled={disabled}
      isFocused={isFocused}
      isHovered={isHovered}
      onMouseEnter={() => handleMouseEnter(disabled)}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Dropdown
            id={id}
            value={value || null}
            options={options}
            onChange={handleChange}
            onFocus={(e) => handleFocus(e, safeOtherProps.onFocus)}
            onBlur={(e) => handleBlur(e, safeOtherProps.onBlur)}
            disabled={disabled || isLoading}
            placeholder={
              isLoadingOptions
                ? "Loading options..."
                : placeholder || `Select ${linkedDoctype || "option"}...`
            }
            showClear={false}
            filter={true}
            filterBy="label"
            filterPlaceholder={`Search ${linkedDoctype || "options"}...`}
            onFilter={handleFilter}
            onShow={handleDropdownShow}
            onHide={handleDropdownHide}
            emptyMessage={
              isLoadingOptions
                ? "Loading..."
                : searchTerm
                ? `No ${
                    linkedDoctype || "options"
                  } found matching "${searchTerm}"`
                : `No ${linkedDoctype || "options"} available`
            }
            pt={ptConfig}
            title={tooltip}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            {...safeOtherProps}
          />

          {/* Loading spinner overlay */}
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
          className="p-button-sm flex-shrink-0 text-text-color-secondary hover:text-primary-500 hover:bg-primary-50 transition-all duration-200"
          pt={{
            root: {
              className:
                "w-8 h-8 rounded-xl border border-surface-200 hover:border-primary-300 transition-all duration-200",
            },
            icon: {
              className: "text-sm",
            },
          }}
        />
      </div>
    </FormFieldWrapper>
  );
};

export default LinkFormField;
