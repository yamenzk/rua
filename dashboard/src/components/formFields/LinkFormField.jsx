// src/components/formFields/LinkFormField.jsx - Enhanced with Presets
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import {
  FormFieldWrapper,
  useFormFieldState,
  PRIMEREACT_PT_CONFIGS,
  DESIGN_TOKENS,
} from "./styles/formFieldStyles";

const LinkFormField = ({
  id,
  value,
  onChange,
  disabled,
  className,
  placeholder,
  tooltip,
  required,
  error,
  size = "base",
  preset = "elevated", // New preset support!
  fieldSchemaItem,
  linkedDoctype,
  fetchLinkOptions,
  isLoading = false,
  showClear = false,
  ...otherProps
}) => {
  const [options, setOptions] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    isFocused,
    isHovered,
    handleFocus,
    handleBlur,
    handleMouseEnter,
    handleMouseLeave,
  } = useFormFieldState();

  const t = DESIGN_TOKENS;
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  useEffect(() => {
    loadOptions("", true);
  }, [loadOptions]);

  useEffect(() => {
    if (isDropdownOpen) {
      loadOptions(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, loadOptions, isDropdownOpen]);

  const handleDropdownShow = useCallback(() => {
    setIsDropdownOpen(true);
    loadOptions(searchTerm);
  }, [loadOptions, searchTerm]);

  const handleDropdownHide = useCallback(() => {
    setIsDropdownOpen(false);
    setSearchTerm("");
  }, []);

  const handleChange = useCallback(
    (e) => {
      if (onChange) {
        const syntheticEvent = {
          target: { name: id, value: e.value },
          originalEvent: e.originalEvent,
        };
        onChange(syntheticEvent);
      }
    },
    [onChange, id]
  );

  const handleFilter = useCallback((e) => {
    setSearchTerm(e.filter || "");
  }, []);

  const handleRefresh = useCallback(() => {
    loadOptions(searchTerm, false, true);
  }, [loadOptions, searchTerm]);

  const {
    fetchLinkOptions: _fetchLinkOptions,
    fieldSchemaItem: _fieldSchemaItem,
    linkedDoctype: _linkedDoctype,
    onFocus,
    onBlur,
    ...safeOtherProps
  } = otherProps;

  const ptConfig = {
    ...PRIMEREACT_PT_CONFIGS.dropdown(
      {
        isFocused,
        isHovered,
        disabled,
        error: !!error,
        size,
        className,
      },
      preset // Pass preset
    ),
    panel: {
      className: `${t.borders.width.none} ${t.effects.shadow.xl} ${t.radius.base} ${t.spacing.panel.margin} ${t.layout.overflow.hidden} ${t.colors.background.surface} backdrop-blur-sm`,
    },
    list: { className: t.spacing.panel.paddingSmall },
    item: {
      className: `px-3 py-2 mx-1 ${t.radius.small} hover:bg-primary-50 ${t.effects.transition.colors} ${t.interactions.cursor.pointer} ${t.borders.width.none} ${t.typography.sm}`,
    },
    filterContainer: {
      className: `${t.spacing.panel.padding} ${t.borders.sides.bottom} ${t.colors.border.light}`,
    },
    filterInput: {
      className: `${t.sizing.component.fullWidth} px-3 py-2 ${t.typography.sm} ${t.borders.width.base} ${t.colors.border.medium} ${t.radius.small} focus:${t.colors.border.focus} ${t.effects.focusRing} ${t.effects.transition.colors}`,
    },
    clearIcon: { className: t.layout.display.hidden },
    loadingIcon: { className: t.colors.text.primary },
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
      preset={preset}
    >
      <div className={`${t.layout.flex.center} ${t.spacing.gap.small}`}>
        <div
          className={`${t.sizing.component.flexGrow} ${t.layout.position.relative}`}
        >
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

          {isLoadingOptions && (
            <div
              className={`${t.layout.position.absolute} right-8 ${t.layout.position.topHalf} ${t.interactions.pointerEvents.none}`}
            >
              <ProgressSpinner size="16" strokeWidth="4" />
            </div>
          )}
        </div>

        {/* Enhanced Refresh Button */}
        <Button
          icon="pi pi-refresh"
          text
          rounded
          size="small"
          onClick={handleRefresh}
          disabled={disabled || isLoadingOptions}
          tooltip="Refresh options"
          tooltipOptions={{ position: "top" }}
          className={`${t.sizing.component.flexShrink} ${t.colors.text.secondary} hover:${t.colors.text.primary} hover:${t.colors.background.primaryLight} ${t.effects.transition.base}`}
          pt={{
            root: {
              className: `${t.sizing.icon.xl} ${t.radius.small} ${t.borders.width.base} ${t.colors.border.medium} hover:${t.colors.border.focus} ${t.effects.transition.base}`,
            },
            icon: { className: t.typography.sm },
          }}
        />
      </div>
    </FormFieldWrapper>
  );
};
export default LinkFormField;