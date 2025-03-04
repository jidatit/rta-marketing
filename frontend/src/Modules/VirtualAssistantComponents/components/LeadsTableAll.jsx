import { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";
import Filters from "../../../shared/VirtualAssistantComponents/TableFilters";
import SalesTableVA from "../../../shared/VirtualAssistantComponents/TableComponent";
import { db } from "../../../config/firebaseConfig";
import PaginationVA from "../../../shared/VirtualAssistantComponents/Pagination";
import { useAuth } from "../../../AuthContext";
import UploadLeadModal from "./UploadLeadModal";
import ConfirmationModal from "./DeleteConfirmation";

const LeadsPageVA = ({
  leadSources,
  setLeadSources,
  SalesPerson,
  setSalesPerson,
  setTotalLeads,
}) => {
  const [allSales, setAllSales] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLeadSource, setSelectedLeadSource] = useState("");
  const [selectedSalesPerson, setSelectedSalesPerson] = useState("");
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [modalData, setModalData] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);

  useEffect(() => {
    const unsubscribeEmployees = setupEmployeesListener();
    const unsubscribeLeads = setupLeadsListener();

    return () => {
      unsubscribeEmployees && unsubscribeEmployees();
      unsubscribeLeads && unsubscribeLeads();
    };
  }, [currentUser?.uid]);

  const setupEmployeesListener = () => {
    try {
      const employeesCollection = collection(db, "employees");
      return onSnapshot(
        employeesCollection,
        (querySnapshot) => {
          let salesData = [];
          const salesPersonData = [];
          let totalLeadsCount = 0;

          querySnapshot.forEach((doc) => {
            const employeeData = doc.data();
            const { leads, name, uid } = employeeData;

            if (leads && Array.isArray(leads)) {
              totalLeadsCount += leads.length;
            }

            salesPersonData.push({ name, uid });

            if (leads && Array.isArray(leads)) {
              let relevantLeads = leads;

              if (currentUser?.userType !== "Admin") {
                relevantLeads = leads.filter(
                  (lead) => lead.VAUid === currentUser?.uid
                );
              }

              if (relevantLeads.length > 0) {
                const groupedSales = {}; // Object to store grouped sales

                relevantLeads.forEach((lead, index) => {
                  const leadDateTime = lead.timestamp
                    ?.toDate()
                    .toISOString()
                    .slice(0, 16); // Format YYYY-MM-DD HH:MM

                  const key = ` ${name}-${leadDateTime}`; // Unique key to group by salesperson & timestamp

                  if (!groupedSales[key]) {
                    groupedSales[key] = {
                      saleId: doc.id,
                      salesPerson: name,
                      leadSource: new Set(),
                      amount: 0,
                      dateTime: leadDateTime.replace("T", " "), // Format properly
                      salesPersonId: uid,
                      // Store indices of leads for deletion later
                      leadIndices: [],
                      // Store all leads for view modal
                      allLeads: [],
                    };
                  }

                  groupedSales[key].leadSource.add(lead.leadSource.trim());
                  groupedSales[key].amount += lead.leadAmount;
                  groupedSales[key].leadIndices.push(index);
                  groupedSales[key].allLeads.push(lead);
                });

                salesData.push(
                  ...Object.values(groupedSales).map((sale) => ({
                    ...sale,
                    leadSource: Array.from(sale.leadSource).join(", "), // Convert Set to comma-separated string
                  }))
                );
              }
            }
          });

          setSalesPerson(salesPersonData);
          setAllSales(salesData);
          setTotalLeads(totalLeadsCount);
        },
        (error) => {
          console.error("Error in employees listener:", error);
          toast.error("Error loading employee data");
        }
      );
    } catch (error) {
      console.error("Error setting up employees listener:", error);
      return null;
    }
  };

  const setupLeadsListener = () => {
    try {
      const leadsCollection = collection(db, "leads");
      return onSnapshot(
        leadsCollection,
        (querySnapshot) => {
          const fetchedLeads = querySnapshot.docs.map(
            (doc) => doc.data().leadName
          );
          setLeadSources(fetchedLeads);
        },
        (error) => {
          console.error("Error in leads listener:", error);
          toast.error("Error loading lead sources");
        }
      );
    } catch (error) {
      console.error("Error setting up leads listener:", error);
      return null;
    }
  };

  useEffect(() => {
    handleFilter();
  }, [selectedLeadSource, selectedSalesPerson, startDate, endDate, allSales]);

  const handleFilter = () => {
    let filteredSales = [...allSales];

    if (selectedSalesPerson) {
      filteredSales = filteredSales.filter(
        (sale) => sale.salesPersonId === selectedSalesPerson
      );
    }

    if (selectedLeadSource) {
      filteredSales = filteredSales.filter((sale) =>
        sale.leadSource.includes(selectedLeadSource)
      );
    }

    if (startDate && endDate) {
      filteredSales = filteredSales.filter((sale) => {
        if (!sale.dateTime) return false; // Ensure date exists

        const saleDate = new Date(sale.dateTime); // Convert to Date object
        const start = new Date(startDate).setHours(0, 0, 0, 0); // Reset time for accuracy
        const end = new Date(endDate).setHours(23, 59, 59, 999); // Include the full day

        return saleDate.getTime() >= start && saleDate.getTime() <= end;
      });
    }

    setFilteredClients(filteredSales);
    setCurrentPage(1);
  };

  const handleFilterChange = (filters) => {
    const { selectedLeadSource, selectedSalesPerson, startDate, endDate } =
      filters;
    setSelectedLeadSource(selectedLeadSource);
    setSelectedSalesPerson(selectedSalesPerson);
    setStartDate(startDate);
    setEndDate(endDate);
  };

  const handleFilterToggle = () => setShowFilters(!showFilters);

  const handleOpenViewModal = (row) => {
    setModalMode("view");
    setModalData(row);
    setIsModalOpen(true);
  };

  const handleDeleteSale = (row) => {
    setLeadToDelete(row);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!leadToDelete) {
        toast.error("No lead selected for deletion");
        return;
      }

      const employeeDocRef = doc(db, "employees", leadToDelete.saleId);
      const employeeDoc = await getDoc(employeeDocRef);

      if (!employeeDoc.exists()) {
        toast.error("Employee document not found");
        return;
      }

      const employeeData = employeeDoc.data();
      const leads = [...employeeData.leads];

      // Remove the leads at the stored indices
      const indicesToRemove = leadToDelete.leadIndices;
      const sortedIndices = [...indicesToRemove].sort((a, b) => b - a);
      sortedIndices.forEach((index) => {
        if (index >= 0 && index < leads.length) {
          leads.splice(index, 1);
        }
      });

      // Update the document with the modified leads array
      await updateDoc(employeeDocRef, {
        leads: leads,
        lastUpdated: new Date(),
      });

      toast.success("Lead(s) deleted successfully");

      // Check if the updated lead count falls below 10 for the current month
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const monthYearKey = `${currentYear}-${currentMonth + 1}`;

      const currentMonthLeads = leads.filter((lead) => {
        const leadDate = lead.timestamp?.toDate
          ? lead.timestamp.toDate()
          : new Date(lead.timestamp);
        return (
          leadDate.getMonth() === currentMonth &&
          leadDate.getFullYear() === currentYear
        );
      });

      if (currentMonthLeads.length < 10) {
        // Reference to notification history document
        const notificationDocRef = doc(
          db,
          "notificationHistory",
          "leadThresholds",
          "monthlyRecords",
          monthYearKey
        );

        const notificationDocSnap = await getDoc(notificationDocRef);

        if (notificationDocSnap.exists()) {
          const notificationData = notificationDocSnap.data();
          const updatedNotifiedUserIds = (
            notificationData.notifiedUserIds || []
          ).filter((uid) => uid !== employeeData.uid);

          // Update Firestore with the modified list
          await updateDoc(notificationDocRef, {
            notifiedUserIds: updatedNotifiedUserIds,
            updatedAt: new Date(),
          });

          console.log(
            `Removed ${employeeData.uid} from notification history as their lead count fell below 10`
          );
        }
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead: " + error.message);
    } finally {
      setIsDeleteModalOpen(false);
      setLeadToDelete(null);
    }
  };

  const salesColumns = [
    { key: "dateTime", label: "Date & Time" },
    { key: "salesPerson", label: "Sales Person" },
    { key: "leadSource", label: "Lead Source" },
    { key: "amount", label: "Lead Amount" },
    {
      key: "actions",
      label: "Actions",
      render: (value, row) => (
        <div className="flex space-x-4">
          <button
            className="px-4 py-2 text-white bg-[#003160] rounded-lg"
            onClick={() => handleOpenViewModal(row)}
          >
            View Details
          </button>
          <button
            className="px-4 py-2 text-white bg-red-600 rounded-lg"
            onClick={() => handleDeleteSale(row)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredClients.length / rowsPerPage)
  );
  console.log("currentClients: " + allSales);
  return (
    <>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setLeadToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
      />

      <UploadLeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalMode("create");
          setModalData(null);
        }}
        leadSources={leadSources}
        SalesPerson={SalesPerson}
        mode={modalMode}
        setModalMode={setModalMode}
        initialData={modalData}
      />
      <div className="px-4 flex items-start justify-start w-full h-full pb-8 overflow-y-auto ">
        <div className="flex flex-col w-full h-full gap-y-8 overflow-y-auto">
          <Filters
            leadSources={leadSources}
            salesPersons={SalesPerson}
            onFilterChange={handleFilterChange}
            showFilters={showFilters}
            otherFilters={true}
            handleFilterToggle={handleFilterToggle}
            selectedLeadSource={selectedLeadSource}
            setSelectedLeadSource={setSelectedLeadSource}
            selectedSalesPerson={selectedSalesPerson}
            setSelectedSalesPerson={setSelectedSalesPerson}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
          <SalesTableVA
            columns={salesColumns}
            data={currentClients}
            handleDeleteSale={handleDeleteSale}
            handleOpenViewModal={handleOpenViewModal}
          />
          <PaginationVA
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </div>
      </div>
    </>
  );
};

export default LeadsPageVA;
