// Example: src/pages/EditEmployeePage.jsx (Simplified)
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import UniversalDocEditor from "@/components/common/UniversalDocEditor";
import { RUA_EMPLOYEE_DOCTYPE } from "@/constants"; // { name: "RUA Employee" }

const EditEmployeePage = () => {
  const { employeeId } = useParams(); // docname for the editor
  const navigate = useNavigate();

  const handleSaveSuccess = (savedDoc) => {
    // Navigate to the view page or list page after save
    navigate(`/employees/view/${savedDoc.name}`);
  };

  const handleCancel = () => {
    navigate(employeeId ? `/employees/view/${employeeId}` : "/employees");
  };

  return (
    <UniversalDocEditor
      doctypeName={RUA_EMPLOYEE_DOCTYPE.name}
      docname={employeeId} // Pass undefined/null if it's a "create new" route
      onSaveSuccess={handleSaveSuccess}
      onCancel={handleCancel}
    />
  );
};

export default EditEmployeePage;
