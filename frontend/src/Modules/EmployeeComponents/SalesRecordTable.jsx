import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

import InsuranceUpload from "./UploadInsurance";
import ViewDetails from "./ViewDetails";
import { toast } from "react-toastify";
const SaleRecordTable = () => {
  const [clients, setClients] = useState([]); // Initialize as an empty array
  const [filteredClients, setFilteredClients] = useState([]); // Initialize as an empty array
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(true);
  const [sale, setSale] = useState(null);
  // Calculate total pages based on filtered clients
  const totalPages = Math.ceil(filteredClients.length / rowsPerPage);

  // Calculate records to display
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const handleOpenModal = (sale) => {
    setSale(sale);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleOpenViewModal = (sale) => {
    setSale(sale);
    setIsViewModalOpen(true);
  };
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
  };
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const salesCollection = collection(db, "sales");
        const salesSnapshot = await getDocs(salesCollection);

        if (!salesSnapshot.empty) {
          const salesData = salesSnapshot.docs.map((doc) => ({
            id: doc.id, // This is the document ID, which corresponds to the user ID
            ...doc.data(),
          }));
          console.log(salesData);
          setClients(salesData);
          setFilteredClients(salesData); // Initially set filteredClients to all clients
        } else {
          toast.info("No sales data found.");
        }
      } catch (err) {
        toast.error(`Error fetching sales data: ${err.message}`);
      }
    };

    fetchSalesData();
  }, []);
  const handleFundStatus = async (clientId, index) => {
    try {
      const docRef = doc(db, "sales", clientId); // Use clientId here
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Get the sales array
        const salesArray = docSnap.data().sales;

        // Update the FundStatus field within the specific array element
        const updatedSales = salesArray.map((sale, idx) =>
          idx === index ? { ...sale, FundStatus: true } : sale
        );

        // Update Firestore document
        await updateDoc(docRef, { sales: updatedSales });

        // Update local state
        setClients((prevClients) =>
          prevClients.map((client) =>
            client.id === clientId ? { ...client, sales: updatedSales } : client
          )
        );
        setFilteredClients((prevFilteredClients) =>
          prevFilteredClients.map((client) =>
            client.id === clientId ? { ...client, sales: updatedSales } : client
          )
        );

        toast.success("Car Funded Successfully");
      } else {
        toast.error("Document does not exist");
      }
    } catch (error) {
      toast.error("Error funding car: " + error.message);
    }
  };
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when rows per page changes
  };

  // Handle filter by date
  const handleFilter = () => {
    if (startDate && endDate) {
      const filteredClients = clients.filter((client) => {
        const clientDate = new Date(client.saleDate);
        return clientDate >= startDate && clientDate <= endDate;
      });
      setFilteredClients(filteredClients); // Update filtered state
      setCurrentPage(1); // Reset to first page when filter is applied
    } else {
      setFilteredClients(clients); // Reset filter
    }
  };

  // Clear filter
  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setFilteredClients(clients); // Reset to original data
    setCurrentPage(1);
  };
  // Format date to "dd MMMM, yyyy" (matches your example data)

  return (
    <>
      <div className="relative h-full p-6 overflow-x-auto bg-white shadow-lg sm:rounded-lg">
        {showDatePicker && (
          <div className="flex justify-end mb-4">
            <div className="flex items-center mr-4">
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
              onClick={handleFilter}
              className="px-4 py-2 ml-4 text-white bg-blue-500 rounded-lg"
            >
              Apply Filter
            </button>
            <button
              onClick={handleClearFilter}
              className="px-4 py-2 ml-4 text-white bg-red-500 rounded-lg"
            >
              Clear Filter
            </button>
          </div>
        )}

        <table className="w-full h-full text-sm text-left text-black rtl:text-right dark:text-black font-radios">
          <thead className="w-full p-4 text-sm text-gray-700 uppercase bg-gray-50 dark:bg-[#1FABFA] dark:text-white rounded-t-md">
            <tr>
              <th scope="col" className="px-4 py-4 rounded-tl-md">
                Client Name
              </th>
              <th scope="col" className="px-4 py-4">
                Car Name
              </th>
              <th scope="col" className="px-4 py-4">
                Sale Date
              </th>
              <th scope="col" className="px-4 py-4">
                Insurance Status
              </th>
              <th scope="col" className="px-4 py-4">
                Fund Status
              </th>
              <th scope="col" className="px-4 py-4 rounded-tr-md">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="border-t-0 border-gray-300 border-1">
            {currentClients && Array.isArray(currentClients) ? (
              currentClients.map((client, index) =>
                client.sales && Array.isArray(client.sales) ? (
                  client.sales.map((sale, saleIndex) => (
                    <tr
                      key={`${index}-${saleIndex}`}
                      className="bg-white border-b dark:bg-white dark:border-gray-300"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-black">
                        {sale.customerName}
                      </td>
                      <td className="px-4 py-4 text-gray-900">
                        {sale.vehicleMake}
                      </td>
                      <td className="px-4 py-4 text-gray-900">
                        {sale.saleDate}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block w-3 h-3 rounded-full mr-2 ${
                            sale.InsuranceStatus ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></span>
                        {sale.InsuranceStatus ? "Completed" : "Pending"}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block w-3 h-3 rounded-full mr-2 ${
                            sale.FundStatus ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></span>
                        {sale.FundStatus ? "Completed" : "Pending"}
                      </td>
                      <td className="flex px-4 py-4 space-x-7">
                        <button
                          className="px-6 py-2.5 text-white bg-blue-600 rounded-lg dark:bg-[#0E376C]"
                          onClick={() => handleOpenViewModal(sale)}
                        >
                          View Details
                        </button>

                        {sale.InsuranceStatus ? (
                          // Display the "Fund Car" button if InsuranceStatus is true
                          <button
                            className={`py-2.5 w-[40%] text-white rounded-lg ${
                              sale.FundStatus
                                ? "bg-[#10C900] px-4"
                                : "bg-gray-400 px-6"
                            }`}
                            onClick={() =>
                              handleFundStatus(client.id, saleIndex)
                            }
                            disabled={sale.FundStatus}
                          >
                            {sale.FundStatus ? "Car Funded" : "Fund Car"}
                          </button>
                        ) : (
                          // Display the "Upload Insurance" button if InsuranceStatus is false
                          <button
                            className="w-[40%] py-2.5 text-white bg-green-600 rounded-lg dark:bg-[#6636C0]"
                            onClick={() => handleOpenModal(sale)}
                          >
                            Upload Insurance
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr key={index}>
                    <td colSpan="100%" className="w-full p-2 text-center">
                      No sales data available
                    </td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td colSpan="100%" className="w-full p-2 text-center">
                  No clients data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-4">
        <div>
          <label
            htmlFor="rows-per-page"
            className="p-3 mr-2 text-white bg-green-500 rounded-lg font-radios"
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

        <div className="flex items-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 border rounded-l-lg"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 border rounded-r-lg"
          >
            Next
          </button>
        </div>
      </div>
      {isModalOpen ? (
        <InsuranceUpload
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          sale={sale}
        />
      ) : null}
      {isViewModalOpen ? (
        <ViewDetails onClose={handleCloseViewModal} sale={sale} />
      ) : null}
    </>
  );
};

export default SaleRecordTable;
