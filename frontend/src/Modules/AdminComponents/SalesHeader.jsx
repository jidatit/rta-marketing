import React, { useState } from "react";
import { Pencil, Trash2, Check } from "lucide-react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

const SalesHeader = () => {
  const [showModal, setShowModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  return (
    <>
      <div className="flex items-center justify-between w-full">
        <div className="text-2xl pt-4 font-bold">Sales</div>
        <div className="flex flex-row gap-4">
          <button
            className="bg-[#003160] hover:bg-[#173652] text-white px-10 py-2 rounded-full text-lg"
            onClick={() => setShowModal(true)}
          >
            Lead sources
          </button>
          <button
            className="bg-[#003160] hover:bg-[#173652] text-white px-10 py-2 rounded-full text-lg"
            onClick={() => setShowLimitModal(true)}
          >
            Set Limit
          </button>
        </div>
      </div>
      <LeadSourceModal open={showModal} onClose={() => setShowModal(false)} />
      <LimitModal
        open={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
    </>
  );
};

const LimitModal = ({ open, onClose }) => {
  const [limit, setLimit] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (limit.trim() === "") {
      toast.error("Limit cannot be empty");
      return;
    }
    try {
      await addDoc(collection(db, "SalesLimit"), {
        limit: limit,
        createdAt: new Date(),
      });
      toast.success("Limit added successfully!");
      onClose();
      setLimit("");
    } catch (error) {
      toast.error("Error adding lead: " + error.message);
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          width: "60%",
          maxWidth: "700px",
          margin: "32px auto",
          borderRadius: "12px",
          height: "auto",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogContent
        sx={{
          padding: "24px",
          overflow: "auto",
        }}
      >
        <DialogTitle sx={{ padding: "0 0 24px 0" }}>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-radios">Set Limit</h1>
          </div>
        </DialogTitle>
        <div className="w-full px-6">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full items-end"
          >
            <label
              htmlFor="sales-limit"
              className="text-xl font-medium self-start"
            >
              {"Sales Limit"}
            </label>
            <input
              type="number"
              value={limit}
              placeholder="Sales Limit"
              className="block border-2 w-full border-gray-300 p-3 rounded-md my-2"
              onChange={(e) => setLimit(e.target.value)}
            />
            <div className="flex gap-4 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-2 text-xl rounded-md border-2 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-900 text-white py-2 px-8 text-xl rounded-md"
              >
                Upload
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const LeadSourceModal = ({ open, onClose }) => {
  const [leads, setLeads] = useState([]);
  const [inputLead, setInputLead] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  React.useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "leads"));
      const fetchedLeads = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        leadName: doc.data().leadName,
      }));
      setLeads(fetchedLeads);
    } catch (error) {
      console.error("Error fetching leads: ", error);
      toast.error("Failed to fetch leads: " + error.message);
    }
  };

  const handleInput = (e) => {
    setInputLead(e.target.value);
  };

  const startEditing = (lead) => {
    setEditingId(lead.id);
    setEditText(lead.leadName);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleDelete = async (leadId) => {
    try {
      await deleteDoc(doc(db, "leads", leadId));
      toast.success("Lead deleted successfully!");
      fetchLeads();
    } catch (error) {
      toast.error("Error deleting lead: " + error.message);
    }
  };

  const handleSubmitEdit = async (leadId) => {
    if (editText.trim() === "") {
      toast.error("Lead Source cannot be empty");
      return;
    }

    const lowerCaseEdit = editText.toLowerCase();
    const capitalizedEdit =
      lowerCaseEdit.charAt(0).toUpperCase() + lowerCaseEdit.slice(1);

    const isDuplicate = leads.some(
      (lead) =>
        lead.id !== leadId &&
        lead.leadName.toLowerCase() === capitalizedEdit.toLowerCase()
    );

    if (isDuplicate) {
      toast.error("Lead Source already exists");
      return;
    }

    try {
      await updateDoc(doc(db, "leads", leadId), {
        leadName: capitalizedEdit,
        updatedAt: new Date(),
      });
      toast.success("Lead Source updated successfully!");
      setEditingId(null);
      fetchLeads();
    } catch (error) {
      toast.error("Error updating lead: " + error.message);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (inputLead.trim() === "") {
      toast.error("Lead Source cannot be empty");
      return;
    }

    const lowerCaseLead = inputLead.toLowerCase();
    const capitalizedLead =
      lowerCaseLead.charAt(0).toUpperCase() + lowerCaseLead.slice(1);

    const isDuplicate = leads.some(
      (lead) => lead.leadName.toLowerCase() === capitalizedLead.toLowerCase()
    );

    if (isDuplicate) {
      toast.error("Lead Source already exists");
      return;
    }

    try {
      await addDoc(collection(db, "leads"), {
        leadName: capitalizedLead,
        createdAt: new Date(),
      });
      toast.success("Lead Source added successfully!");
      setShowForm(false);
      setInputLead("");
      fetchLeads();
    } catch (error) {
      toast.error("Error adding lead: " + error.message);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          width: "60%",
          maxWidth: "700px",
          margin: "32px auto",
          borderRadius: "12px",
          height: "auto",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogContent
        sx={{
          padding: "24px",
          overflow: "auto",
        }}
      >
        <DialogTitle sx={{ padding: "0 0 24px 0" }}>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-radios">Lead Sources</h1>
            <button
              className="bg-blue-900 text-white px-10 py-2 rounded-full text-2xl"
              onClick={() => setShowForm(true)}
            >
              Add lead source <span>+</span>
            </button>
          </div>
        </DialogTitle>
        {showForm && (
          <div className="w-full px-6">
            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col w-full items-end"
            >
              <label
                htmlFor="lead-source"
                className="text-xl font-medium self-start"
              >
                {"New Lead Source"}
              </label>
              <input
                type="text"
                value={inputLead}
                placeholder="Lead source"
                className="block border-2 w-full border-gray-300 p-3 rounded-md my-2"
                onChange={handleInput}
              />
              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-8 py-2 text-xl rounded-md border-2 border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-900 text-white py-2 px-8 text-xl rounded-md"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        )}
        <div>
          <ul className="py-10 px-6 space-y-4">
            {leads.map((lead) => (
              <li
                key={lead.id}
                className="flex items-center justify-between text-xl font-medium bg-white shadow-lg p-4 rounded-xl text-white"
              >
                {editingId === lead.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="text-blue-500 bg-transparent border-b-2 border-blue-500 focus:outline-none px-1"
                    autoFocus
                  />
                ) : (
                  <span className="list-disc text-blue-500">
                    {lead.leadName}
                  </span>
                )}
                <div className="flex gap-4">
                  {editingId === lead.id ? (
                    <button
                      onClick={() => handleSubmitEdit(lead.id)}
                      className="bg-green-600 hover:bg-green-800 text-white p-2 rounded-md"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(lead)}
                        className="bg-blue-600 hover:bg-blue-800 text-white p-2 rounded-md"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="bg-red-600 hover:bg-red-800 text-white p-2 rounded-md"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SalesHeader;
