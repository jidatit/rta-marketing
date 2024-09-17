import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  deleteField,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

import ViewDetails from "../EmployeeComponents/ViewDetails";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBan,
  FaChevronDown,
} from "react-icons/fa6";
import { FaCalendarAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import SalesTable from "./SalesTable";

const SalesPage = ({ setShowModal }) => {
  const [allSales, setAllSales] = useState([]);
  const [sales, setSales] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [leadSources, setLeadSources] = useState([]);
  const [selectedLeadSource, setSelectedLeadSource] = useState("");
  const [SalesPerson, setSalesPerson] = useState([""]);
  const [selectedSalesPerson, setSelectedSalesPerson] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [sale, setSale] = useState(null);
  const [showDateFilter, setShowDateFilter] = useState(false);

  const [uId, setUid] = useState([]);

  const fetchSalesData = async () => {
    try {
      const salesCollection = collection(db, "sales");
      const querySnapshot = await getDocs(salesCollection);
      const salesData = [];
      const uIds = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;
        uIds.push(id);
        const dataWithId = data.sales.map((el) => ({
          documentId: doc.id,
          ...el,
        }));
        const dataObject = {
          sales: dataWithId,
          id: id,
        };
        console.log(uIds);

        salesData.push(dataObject);
        setUid(uIds);
      });

      setSales(salesData);

      const allSales = salesData.flatMap((item) => item.sales);
      setAllSales(allSales);
      setFilteredClients(allSales);
    } catch (error) {
      console.error("Error fetching sales data: ", error);
    }
  };

  const fetchLeads = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "leads"));
      console.log(querySnapshot);
      const fetchedLeads = querySnapshot.docs.map((doc) => doc.data().leadName);
      setLeadSources(fetchedLeads);
    } catch (error) {
      console.error("Error fetching leads: ", error);
      toast.error("Failed to fetch leads: " + error.message);
    }
  };

  const fetchSalesPerson = async () => {
    try {
      if (uId) {
        const SalePersonsRef = collection(db, "employees");
        const queryPromises = uId?.map((source) => {
          const q = query(SalePersonsRef, where("uid", "==", source));
          return getDocs(q);
        });
        const querySnapshots = await Promise.all(queryPromises);
        const results = [];
        querySnapshots.forEach((snapshot) => {
          snapshot.forEach((doc) => {
            const { name, uid } = doc.data();
            results.push({ name, uid });
          });
        });

        console.log("Sales Person", results);
        setSalesPerson(results);
      }
    } catch (error) {
      console.error("Error fetching Sale Persons: ", error);
      toast.error("Failed to fetch Sales Person : " + error.message);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleOpenViewModal = (sale) => {
    console.log(sale);
    setSale(sale);
    setIsViewModalOpen(true);
  };
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
  };

  useEffect(() => {
    fetchLeads();
    fetchSalesData();
  }, []);
  console.log(selectedSalesPerson);

  useEffect(() => {
    fetchSalesPerson();
  }, [uId]);

  const handleDeleteSale = async (saleId, documentId) => {
    try {
      const docRef = doc(db, "sales", documentId);

      const salesItem = sales.find((item) => item.id === documentId);

      if (salesItem) {
        const arrayItem = salesItem.sales;

        const updatedArrayItems = arrayItem.filter(
          (item) => item.saleId !== saleId
        );

        console.log(arrayItem);
        console.log(updatedArrayItems);

        if (updatedArrayItems.length === 0) {
          // Delete the document if the updated array is empty
          await deleteDoc(docRef);
          console.log(`Document with id ${documentId} deleted successfully!`);
          toast.success("Document deleted successfully");
        } else {
          // Otherwise, update the document with the new array
          await updateDoc(docRef, { sales: updatedArrayItems });
          console.log(`Object with saleId ${saleId} deleted successfully!`);
          toast.success("Sale deleted successfully");
        }

        fetchSalesData();
      } else {
        console.log("Sale item not found");
        toast.error("Something happened: try again");
      }
    } catch (error) {
      console.error("Error deleting object:", error);
      toast.error("Error deleting object: please try again");
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };
  console.log("ALL sales from sales page", allSales);
  const handleFilter = () => {
    if (startDate && endDate) {
      const filteredSales = allSales.filter((sale) => {
        const saleDate = new Date(sale.saleDate);
        return saleDate >= startDate && saleDate <= endDate;
      });
      setFilteredClients(filteredSales);
      setCurrentPage(1);
    } else {
      setFilteredClients(allSales);
    }
    if (selectedLeadSource) {
      const filteredSales = allSales.filter(
        (sale) => sale.leadSource === selectedLeadSource
      );
      setFilteredClients(filteredSales);
    }
    if (selectedSalesPerson) {
      const filteredSales = allSales.filter(
        (sale) => sale.documentId === selectedSalesPerson
      );
      setFilteredClients(filteredSales);
    }
  };

  useEffect(() => {
    handleFilter();
  }, [selectedSalesPerson, selectedLeadSource]);

  // Clear filter
  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setFilteredClients(allSales);
    setCurrentPage(1);
    setSelectedLeadSource("");
    setSelectedSalesPerson("");
    setShowDateFilter(false);
    console.log(showDateFilter);
  };
  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const sortedFilteredClients = filteredClients.sort((a, b) => {
    const dateA = new Date(a.saleDate);
    const dateB = new Date(b.saleDate);
    return dateB - dateA;
  });

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const currentClients = sortedFilteredClients.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const totalPages = Math.ceil(filteredClients.length / rowsPerPage);

  const handleSelect = (event, setValue) => {
    console.log(event.target.value);
    if (event.target.value === "") setFilteredClients(allSales);

    setValue(event.target.value);
  };
  console.log(selectedLeadSource);
  return (
    <>
      <div className="flex items-start justify-start w-full h-full px-12 py-8 overflow-y-auto">
        <div className="flex flex-col w-full h-full gap-y-8  ">
          <div className="text-[24px] pt-4 font-bold">Sales</div>
          <div className="relative p-2  bg-white shadow-lg sm:rounded-lg  ">
            <div className="w-full text-end flex justify-end">
              <button
                onClick={handleFilterToggle}
                className="flex items-center px-4 py-3 mb-4 text-white bg-[#003160] rounded-lg "
              >
                <FaCalendarAlt className="mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>

            <div
              className={`${
                showFilters ? "max-h-screen" : "max-h-0"
              } overflow-hidden transition-all duration-500 ease-in-out `}
            >
              <div className="flex justify-end items-center mb-4">
                <div className="relative w-52 mx-4">
                  <select
                    name="Sales Person"
                    id="demo-simple-select-helper-label"
                    value={selectedSalesPerson}
                    onChange={(event) => {
                      handleSelect(event, setSelectedSalesPerson);
                    }}
                    className="w-full appearance-none px-8 py-2 pr-4 border border-gray-300 rounded-md focus:outline-1  focus:outline-[#003160] bg-white text-gray-500 cursor-pointer"
                  >
                    <option value="">Sales Person</option>
                    {SalesPerson.map((salePerson) => {
                      return (
                        <option key={salePerson.uid} value={salePerson.uid}>
                          {salePerson.name}
                        </option>
                      );
                    })}
                  </select>

                  <FaChevronDown className="absolute top-1/2 right-7 transform -translate-y-1/2 pointer-events-none text-gray-400 text-sm" />
                </div>

                <div className="relative w-52 mx-4">
                  <select
                    name="leads Sources"
                    id=""
                    value={selectedLeadSource}
                    onChange={(event) => {
                      handleSelect(event, setSelectedLeadSource);
                    }}
                    className="w-full appearance-none px-8 py-2 pr-4 border border-gray-300 rounded-md focus:outline-1  focus:outline-[#003160] bg-white text-gray-500 cursor-pointer"
                  >
                    <option value="">Lead Source</option>
                    {leadSources.map((lead) => (
                      <option key={lead} value={lead}>
                        {lead}
                      </option>
                    ))}
                  </select>

                  <FaChevronDown className="absolute top-1/2 right-7 transform -translate-y-1/2 pointer-events-none text-gray-400 text-sm" />
                </div>
                {!showDateFilter ? (
                  <div
                    onClick={() => {
                      setShowDateFilter(true);
                    }}
                    className="px-8 py-2 border w-52 border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white text-gray-500 mx-4 cursor-pointer text-center"
                  >
                    Select Date
                  </div>
                ) : (
                  <div className=" flex items-center  ">
                    <div className="flex items-center mr-4 ">
                      <label htmlFor="start-date" className="mr-2 font-radios">
                        From:
                      </label>
                      <DatePicker
                        id="start-date"
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat="dd MMMM yyyy"
                        className="px-3 py-2 border-gray-300 rounded-lg border-1"
                      />
                    </div>
                    <div className="flex items-center">
                      <label htmlFor="end-date" className="mr-2 font-radios">
                        To:
                      </label>
                      <DatePicker
                        id="end-date"
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        dateFormat="dd MMMM yyyy"
                        className="px-3 py-2 border-gray-300 rounded-lg border-1"
                      />
                    </div>
                    <button
                      onClick={() => handleFilter(startDate, endDate)}
                      className="px-3 py-2 mx-4 text-white bg-[#003160] rounded-lg"
                    >
                      Apply Filter
                    </button>
                    <button
                      onClick={handleClearFilter}
                      className="px-3 py-2     text-white bg-red-500 rounded-lg"
                    >
                      Clear Filter
                    </button>
                  </div>
                )}
              </div>
            </div>
            <SalesTable
              currentClients={currentClients}
              handleDeleteSale={handleDeleteSale}
              handleOpenViewModal={handleOpenViewModal}
            />
            <div className="flex items-center justify-between mt-4">
              <div>
                <label
                  htmlFor="rows-per-page"
                  className="p-3 mr-2 text-white bg-[#003160] rounded-lg font-radios"
                >
                  Rows per page :
                </label>
                <select
                  id="rows-per-page"
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="px-6 py-3 border-gray-300 rounded-md border-1"
                >
                  <option value={5} className="p-3">
                    5 per page
                  </option>
                  <option value={7} className="p-3">
                    7 per page
                  </option>
                  <option value={10} className="p-3">
                    10 per page
                  </option>
                  <option value={15} className="p-3">
                    15 per page
                  </option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 border rounded-l-lg flex items-center space-x-1 ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-800"
                    }`}
                  >
                    <FaArrowLeft />
                  </button>
                  {currentPage === 1 && (
                    <div className="absolute inset-0 flex items-center justify-center text-red-500 opacity-0 hover:opacity-100">
                      <FaBan size={20} />
                    </div>
                  )}
                </div>

                <span className="px-4 py-2">
                  Page {currentPage} of {totalPages}
                </span>

                <div className="relative">
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 border rounded-r-lg flex items-center space-x-1 ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-800"
                    }`}
                  >
                    <FaArrowRight />
                  </button>
                  {currentPage === totalPages && (
                    <div className="absolute inset-0 flex items-center justify-center text-red-500 opacity-0 hover:opacity-100">
                      <FaBan size={20} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isViewModalOpen ? (
        <ViewDetails onClose={handleCloseViewModal} sale={sale} />
      ) : null}
    </>
  );
};

export default SalesPage;
