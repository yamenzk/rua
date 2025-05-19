// src/components/custom/EmployeePerformanceReport.jsx (New File - replacing EmployeePerformanceChart.jsx)
import React from "react";
import { ProgressBar } from "primereact/progressbar"; // We can use ProgressBar as it's a core PrimeReact component

const EmployeePerformanceReport = ({ docData, customComponentContext }) => {
  // Mock performance data - in a real app, this would come from docData or an API call
  const performanceMetrics = [
    {
      metric: "Sales Target Achievement",
      value: docData?.sales_achievement || 75, // Example: use actual fields or random
      target: 100,
      color: "#4CAF50", // Green
    },
    {
      metric: "Customer Satisfaction Score",
      value: docData?.customer_satisfaction || 88,
      target: 90,
      color: "#2196F3", // Blue
    },
    {
      metric: "Project Completion Rate",
      value: docData?.project_completion_rate || 92,
      target: 95,
      color: "#FFC107", // Amber
    },
    {
      metric: "Training Hours Completed",
      value: docData?.training_hours || 35,
      target: 40,
      color: "#9C27B0", // Purple
    },
  ];

  return (
    <div className="p-4 bg-surface-card rounded-lg shadow-md">
      <h4 className="text-lg font-semibold mb-4 text-text-color">
        Performance Report for{" "}
        {docData?.employee_name || customComponentContext?.docname}
      </h4>
      <div className="space-y-6">
        {performanceMetrics.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-text-color-secondary">
                {item.metric}
              </span>
              <span className="text-sm font-medium text-text-color">
                {item.value}% (Target: {item.target}%)
              </span>
            </div>
            <ProgressBar
              value={item.value}
              showValue={false} // We show value manually above
              style={{ height: "10px" }}
              pt={{
                value: { style: { background: item.color } },
              }}
            />
            {item.value < item.target && (
              <small className="text-orange-500 mt-1 block">
                Needs improvement (Below target of {item.target}%)
              </small>
            )}
            {item.value >= item.target && (
              <small className="text-green-500 mt-1 block">
                Meeting or exceeding target!
              </small>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 p-3 bg-surface-ground rounded-md">
        <h5 className="text-md font-semibold mb-2 text-text-color-secondary">
          Overall Summary (Demo)
        </h5>
        <p className="text-sm text-text-color">
          {docData?.employee_name || "The employee"} shows strong performance in
          project completion and good customer satisfaction. Sales target
          achievement and training hours are areas for potential growth. Further
          details can be discussed in the upcoming review.
        </p>
      </div>
    </div>
  );
};

export default EmployeePerformanceReport;
