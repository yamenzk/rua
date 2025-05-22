// dashboard/src/components/common/table-components/ColumnDialog.jsx
import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { ScrollPanel } from "primereact/scrollpanel";
import { getFieldConfig } from "@/components/document/utils/fieldTypeConfigurations.jsx";

const ColumnDialog = ({
  visible,
  onHide,
  columnsConfig,
  visibleColumns,
  onColumnToggle,
}) => {
  return (
    <Dialog
      header={
        <div className="flex items-center gap-2">
          <i className="pi pi-eye text-primary-500"></i>
          <span>Select Columns</span>
        </div>
      }
      visible={visible}
      style={{ width: "500px", maxHeight: "80vh" }}
      onHide={onHide}
      footer={
        <div className="flex justify-between items-center">
          <div className="text-sm text-surface-600">
            {visibleColumns.length} of {columnsConfig.length} columns selected
          </div>
          <Button label="Done" icon="pi pi-check" onClick={onHide} />
        </div>
      }
      modal
      draggable={true}
      resizable={false}
    >
      <div className="space-y-4">
        <div className="text-surface-600 text-sm mb-4">
          Select which columns to display in the table. Changes are saved
          automatically.
        </div>

        <ScrollPanel style={{ width: "100%", height: "400px" }}>
          <div className="space-y-2 pr-4">
            {columnsConfig.map((column) => {
              const isVisible = visibleColumns.some(
                (col) => col.fieldname === column.fieldname
              );
              const fieldConfig = getFieldConfig(
                column.fieldtype,
                column.fieldname
              );

              return (
                <div
                  key={column.fieldname}
                  className="flex items-center justify-between p-3 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isVisible}
                      onChange={(e) =>
                        onColumnToggle(column.fieldname, e.checked)
                      }
                    />
                    <div className="flex items-center gap-2">
                      <i
                        className={`pi pi-${
                          fieldConfig.icon || "minus"
                        } text-surface-400`}
                      ></i>
                      <div>
                        <div className="font-medium text-surface-700">
                          {column.header || column.label || column.fieldname}
                        </div>
                        <div className="text-xs text-surface-500">
                          {column.fieldtype} • {column.fieldname}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {column.defaultVisible === false && (
                      <i
                        className="pi pi-eye-slash text-surface-400 text-xs"
                        title="Hidden by default"
                      ></i>
                    )}
                    {column.filterable && (
                      <i
                        className="pi pi-filter text-surface-400 text-xs"
                        title="Filterable"
                      ></i>
                    )}
                    {column.sortable !== false && (
                      <i
                        className="pi pi-sort text-surface-400 text-xs"
                        title="Sortable"
                      ></i>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollPanel>
      </div>
    </Dialog>
  );
};

export default ColumnDialog;
