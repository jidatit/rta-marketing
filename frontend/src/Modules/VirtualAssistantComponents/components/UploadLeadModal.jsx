import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import {
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "../../../config/firebaseConfig";
import { useAuth } from "../../../AuthContext";

const UploadLeadModal = ({
  isOpen,
  onClose,
  leadSources,
  SalesPerson,
  mode = "create",
  setModalMode,
  initialData = null,
}) => {
  const [selectedSalesPerson, setSelectedSalesPerson] = useState("");
  const [leadRows, setLeadRows] = useState([{ leadSource: "", leadAmount: 1 }]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (initialData && mode !== "create") {
      setOriginalData(initialData); // Store original data for comparison
      if (initialData.allLeads) {
        setLeadRows(
          initialData.allLeads.map((lead) => ({
            leadSource: lead.leadSource,
            leadAmount: lead.leadAmount,
            VAName: lead.VAName,
            VAUid: lead.VAUid,
            timestamp: lead.timestamp,
          }))
        );
      }
    }
  }, [initialData, mode]);
  console.log("iniaitaldata", initialData);
  const addNewRow = () => {
    setLeadRows([...leadRows, { leadSource: "", leadAmount: 1 }]);
  };

  const removeRow = (index) => {
    const newRows = leadRows.filter((_, idx) => idx !== index);
    setLeadRows(newRows);
  };

  const handleLeadSourceChange = (index, value) => {
    if (!isEditing && mode === "view") return;
    const newRows = [...leadRows];
    newRows[index].leadSource = value;
    setLeadRows(newRows);
  };

  const handleLeadAmountChange = (index, value) => {
    if (!isEditing && mode === "view") return;
    const newRows = [...leadRows];
    newRows[index].leadAmount = Math.max(1, parseInt(value) || 1);
    setLeadRows(newRows);
  };

  const handleEdit = () => {
    setModalMode("edit");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Reset to original data
    if (originalData) {
      setLeadRows(
        originalData.allLeads.map((lead) => ({
          leadSource: lead.leadSource,
          leadAmount: lead.leadAmount,
          VAName: lead.VAName,
          VAUid: lead.VAUid,
          timestamp: lead.timestamp,
        }))
      );
    }
    setIsEditing(false);
  };

  const handleUpdateLeads = async () => {
    setLoading(true);

    try {
      const employeesRef = collection(db, "employees");
      const q = query(
        employeesRef,
        where("uid", "==", initialData.salesPersonId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Sales Person not found in database!");
        setLoading(false);
        return;
      }

      const employeeDocRef = querySnapshot.docs[0].ref;

      // Update leads array, without serverTimestamp inside array elements
      const updatedLeads = leadRows.map((lead) => ({
        leadSource: lead.leadSource,
        leadAmount: lead.leadAmount,
        VAName: lead.VAName || currentUser.email,
        VAUid: lead.VAUid || currentUser.uid,
        timestamp: lead.timestamp || new Date(),
      }));

      // Use serverTimestamp for the lastUpdated field
      await updateDoc(employeeDocRef, {
        leads: updatedLeads,
        lastUpdated: serverTimestamp(),
      });
      onClose();
      toast.success("Leads updated successfully!");
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error("Error updating leads:", error);
      toast.error("Failed to update leads.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (mode === "edit" && isEditing) {
      await handleUpdateLeads();
      return;
    }

    // Original upload logic for new leads
    if (!selectedSalesPerson) {
      toast.error("Please select a Sales Person.");
      return;
    }

    setLoading(true);

    try {
      const employeesRef = collection(db, "employees");
      const q = query(employeesRef, where("uid", "==", selectedSalesPerson));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Sales Person not found in database!");
        setLoading(false);
        return;
      }

      const employeeDocRef = querySnapshot.docs[0].ref;
      const employeeData = querySnapshot.docs[0].data();

      // New leads to add
      const newLeads = leadRows.map((lead) => ({
        leadSource: lead.leadSource,
        leadAmount: lead.leadAmount,
        VAName: currentUser.email,
        VAUid: currentUser.uid,
        timestamp: new Date(),
      }));

      // Check for existing leads
      const existingLeads = employeeData.leads || [];

      // Merge existing and new leads
      const updatedLeads = [...existingLeads, ...newLeads];

      // Update the employee's leads and set lastUpdated timestamp
      await updateDoc(employeeDocRef, {
        leads: updatedLeads,
        lastUpdated: serverTimestamp(),
      });

      toast.success("Leads uploaded successfully!");
      onClose();
      setLeadRows([{ leadSource: "", leadAmount: 1 }]);
      setSelectedSalesPerson("");
    } catch (error) {
      console.error("Error handling leads:", error);
      toast.error("Failed to upload leads.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  console.log("salesperson", SalesPerson);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {mode === "view"
              ? isEditing
                ? "Edit Leads"
                : "View Leads"
              : "Upload Lead"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6 ">
          {/* Sales Person Dropdown */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sales Person
            </label>
            <select
              value={
                mode == "view" ? initialData?.salesPerson : selectedSalesPerson
              }
              onChange={(e) => setSelectedSalesPerson(e.target.value)}
              disabled={mode === "view" || isEditing}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Sales Person</option>
              {SalesPerson.map((person) => (
                <option
                  key={person.uid}
                  value={mode == "view" ? person.name : person.uid}
                >
                  {person.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lead Source and Amount Rows */}
          {leadRows.map((row, index) => (
            <div key={index} className="flex gap-4 items-end justify-center">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Source
                </label>
                <select
                  value={row.leadSource}
                  onChange={(e) =>
                    handleLeadSourceChange(index, e.target.value)
                  }
                  disabled={!isEditing && mode === "view"}
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                >
                  <option value="">Select Lead Source</option>
                  {leadSources.map((source, i) => (
                    <option key={i} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Amount
                </label>
                <input
                  type="number"
                  min="1"
                  value={row.leadAmount}
                  onChange={(e) =>
                    handleLeadAmountChange(index, e.target.value)
                  }
                  disabled={!isEditing && mode === "view"}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              {(isEditing || mode === "create") && (
                <div className="flex justify-center items-center gap-2">
                  {index > 0 && (
                    <button
                      onClick={() => removeRow(index)}
                      className="text-white p-2 bg-red-500 rounded hover:bg-red-700"
                    >
                      <X size={20} />
                    </button>
                  )}
                  {index === leadRows.length - 1 && (
                    <button
                      onClick={addNewRow}
                      className="text-white p-2 bg-blue-600 hover:bg-blue-700 rounded"
                    >
                      <Plus size={20} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {mode === "view" && initialData?.allLeads?.[0]?.VAName && (
            <div className="flex flex-col gap-y-3 text-sm text-gray-600">
              <p>Added by: {initialData.allLeads[0].VAName}</p>
              <p>
                Date:{" "}
                {initialData.allLeads[0].timestamp
                  ?.toDate()
                  .toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-2 ">
          {!isEditing && (
            <button
              onClick={onClose}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
          )}

          {mode === "view" && !isEditing && (
            <button
              onClick={handleEdit}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Edit
            </button>
          )}

          {isEditing && (
            <>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLeads}
                className="bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-900"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}

          {mode === "create" && (
            <button
              onClick={handleUpload}
              className="bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-900"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadLeadModal;
