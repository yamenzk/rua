// src/components/custom/EmployeeNotesCard.jsx (New File)
import React from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Card } from "primereact/card"; // Optional, if the renderer doesn't wrap it

const EmployeeNotesCard = ({ docData, customComponentContext }) => {
  // docData and customComponentContext are passed from UniversalDocViewer
  // customComponentContext might contain: { docname, doctypeName, navigate, setPageTitle, etc. }

  const [notes, setNotes] = React.useState(docData?.custom_notes || ""); // Assuming 'custom_notes' might be a field or just for demo

  const handleSaveNotes = () => {
    // In a real scenario, you might call an API here
    // using customComponentContext.docname, etc.
    console.log(`Saving notes for ${customComponentContext?.docname}:`, notes);
    alert("Notes (demo) would be saved!");
  };

  return (
    // The UniversalLayoutRenderer can wrap this in a PrimeReactCard if type: 'Card' is specified
    // Or, you can include your own Card component here if you want more control.
    <div>
      <p className="mb-2">
        This is a custom notes section for employee:{" "}
        <strong>
          {docData?.employee_name || customComponentContext?.docname}
        </strong>
        .
      </p>
      <InputTextarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        className="w-full mb-2"
        placeholder="Enter private notes here..."
      />
      <Button
        label="Save Notes (Demo)"
        icon="pi pi-save"
        onClick={handleSaveNotes}
        size="small"
      />
    </div>
  );
};

export default EmployeeNotesCard;
