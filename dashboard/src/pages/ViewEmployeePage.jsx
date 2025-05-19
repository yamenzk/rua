// Example: src/pages/ViewEmployeePage.jsx (Simplified)
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import UniversalDocViewer from "@/components/common/UniversalDocViewer";
import { RUA_EMPLOYEE_DOCTYPE } from "@/constants";

const ViewEmployeePage = () => {
  const { employeeId } = useParams(); // This is the 'docname'
  const navigate = useNavigate();

  const handleEdit = (doctype, docname) => {
    navigate(employeeId ? `/employees/edit/${employeeId}` : "/employees");
  };

  const handleBack = () => {
    navigate("/employees"); // Adjust to your list page route
  };

  return (
    <UniversalDocViewer
      doctypeName={RUA_EMPLOYEE_DOCTYPE.name}
      docname={employeeId}
      onEdit={handleEdit}
      onBack={handleBack}
      listPageUrl="/employees" // Pass the URL for the list page for breadcrumbs
    />
  );
};

export default ViewEmployeePage;
