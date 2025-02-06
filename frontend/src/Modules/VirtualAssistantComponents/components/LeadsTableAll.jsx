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
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  // Single source of truth for real-time data
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
          const salesData = [];
          const salesPersonData = [];
          let totalLeadsCount = 0; // Add counter for all leads

          querySnapshot.forEach((doc) => {
            const employeeData = doc.data();
            const { leads, name, uid } = employeeData;

            // Count total leads for this employee
            if (leads && Array.isArray(leads)) {
              totalLeadsCount += leads.length; // Add this employee's leads to total
            }

            // Store sales person data
            salesPersonData.push({ name, uid });

            if (leads && Array.isArray(leads)) {
              const vaLeads = leads.filter(
                (lead) => lead.VAUid === currentUser?.uid
              );

              if (vaLeads.length > 0) {
                const leadSources = vaLeads
                  .slice(0, 3)
                  .map((lead) => lead.leadSource.trim())
                  .join(", ");
                const totalAmount = vaLeads.reduce(
                  (sum, lead) => sum + lead.leadAmount,
                  0
                );

                salesData.push({
                  saleId: doc.id,
                  salesPerson: name,
                  leadSource: leadSources,
                  amount: `$${totalAmount}`,
                  allLeads: vaLeads,
                  salesPersonId: uid,
                });
              }
            }
          });

          console.log("Total leads across all employees:", totalLeadsCount); // Log the total count
          setSalesPerson(salesPersonData);
          setAllSales(salesData);
          setTotalLeads(totalLeadsCount); // Add this state setter if you want to use the count in your UI
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

  // Filter logic
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
        sale.allLeads.some((lead) => lead.leadSource === selectedLeadSource)
      );
    }

    if (startDate && endDate) {
      filteredSales = filteredSales.filter((sale) =>
        sale.allLeads.some((lead) => {
          const leadDate = lead.timestamp.toDate();
          return leadDate >= startDate && leadDate <= endDate;
        })
      );
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

  const handleDeleteSale = (employeeId) => {
    setEmployeeToDelete(employeeId);
    setIsDeleteModalOpen(true);
  };
  const handleConfirmDelete = async () => {
    try {
      // Query the employees collection to find document with matching uid
      const employeesRef = collection(db, "employees");
      const q = query(employeesRef, where("uid", "==", employeeToDelete));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Employee not found");
        return;
      }

      // Get the first (and should be only) document
      const employeeDoc = querySnapshot.docs[0];
      const employeeData = employeeDoc.data();

      // Create updated employee data keeping everything but clearing their leads
      const updatedEmployeeData = {
        ...employeeData,
        leads: [], // Reset leads to empty array
        lastUpdated: new Date(), // Update the lastUpdated timestamp
      };

      // Update the document
      await updateDoc(
        doc(db, "employees", employeeDoc.id),
        updatedEmployeeData
      );
      toast.success("Leads deleted successfully");
    } catch (error) {
      console.error("Error deleting leads:", error);
      toast.error("Failed to delete leads: " + error.message);
    } finally {
      setIsDeleteModalOpen(false);
      setEmployeeToDelete(null);
    }
  };
  // Table columns configuration
  const salesColumns = [
    { key: "salesPerson", label: "Sales Person" },
    { key: "leadSource", label: "Lead Source" },
    { key: "amount", label: "Amount" },
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
            onClick={() => handleDeleteSale(row.salesPersonId)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // Pagination calculations
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredClients.length / rowsPerPage)
  );

  return (
    <>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setEmployeeToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete All Leads"
        message="Are you sure you want to delete all leads for this employee? This action cannot be undone."
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
      <div className="px-4 flex items-start justify-start w-full h-full py-8 overflow-y-auto">
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
