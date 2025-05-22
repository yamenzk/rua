// dashboard/src/components/common/table-components/TableSkeleton.jsx
import React from "react";
import { Skeleton } from "primereact/skeleton";

const TableSkeleton = ({
  rows = 8,
  columns = 5,
  showHeader = true,
  showFilters = false,
  showPagination = true,
  animated = true,
}) => {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      {showHeader && (
        <div className="bg-white border border-surface-200 rounded-lg p-6 space-y-4">
          {/* Title and Actions Row */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Skeleton width="180px" height="2rem" />
              <Skeleton width="60px" height="1.5rem" className="rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton width="100px" height="2rem" />
              <Skeleton width="32px" height="2rem" className="rounded-full" />
              <Skeleton width="32px" height="2rem" className="rounded-full" />
            </div>
          </div>

          {/* Search Row */}
          <div className="flex justify-between items-center">
            <Skeleton width="300px" height="2.5rem" className="rounded-lg" />
          </div>

          {/* Presets Row */}
          <div className="flex gap-2">
            <Skeleton width="120px" height="2rem" className="rounded-full" />
            <Skeleton width="140px" height="2rem" className="rounded-full" />
            <Skeleton width="100px" height="2rem" className="rounded-full" />
          </div>

          {/* View Mode Row */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-surface-100">
            <div className="flex gap-4">
              <Skeleton width="120px" height="1rem" />
              <Skeleton width="140px" height="1rem" />
              <Skeleton width="100px" height="1rem" />
            </div>
            <Skeleton width="120px" height="1rem" />
          </div>
        </div>
      )}

      {/* Table Skeleton */}
      <div className="bg-white border border-surface-200 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-surface-100 border-b border-surface-200 p-4">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton width="16px" height="16px" className="rounded" />
                <Skeleton width="80%" height="1.25rem" />
              </div>
            ))}
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-surface-100">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className={`p-4 ${animated ? "animate-pulse" : ""}`}
              style={{ animationDelay: `${rowIndex * 50}ms` }}
            >
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
              >
                {Array.from({ length: columns }).map((_, colIndex) => {
                  // Vary skeleton widths for more realistic appearance
                  const widths = ["60%", "80%", "70%", "90%", "75%"];
                  const width = widths[colIndex % widths.length];

                  return (
                    <Skeleton
                      key={colIndex}
                      width={width}
                      height="1rem"
                      className={colIndex === 0 ? "font-medium" : ""}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        {showPagination && (
          <div className="bg-surface-50 border-t border-surface-200 p-4">
            <div className="flex justify-between items-center">
              <Skeleton width="200px" height="1rem" />
              <div className="flex gap-2">
                <Skeleton width="32px" height="32px" className="rounded" />
                <Skeleton width="32px" height="32px" className="rounded" />
                <Skeleton width="32px" height="32px" className="rounded" />
                <Skeleton width="32px" height="32px" className="rounded" />
                <Skeleton width="32px" height="32px" className="rounded" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableSkeleton;
