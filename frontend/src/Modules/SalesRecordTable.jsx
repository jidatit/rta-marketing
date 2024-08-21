import { useState } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const SaleRecordTable = () => {
  const [clients, setClients] = useState([
    {
      clientName: "Client Name abcxyz",
      carName: "Car Name abcxyz",
      saleDate: "25 july 2024",
      insuranceStatus: "Completed",
      fundStatus: "Pending",
    },
    {
      clientName: "Client Name abcxyz",
      carName: "Car Name abcxyz",
      saleDate: "24 july 2024",
      insuranceStatus: "Completed",
      fundStatus: "Completed",
    },
    {
      clientName: "Client Name abcxyz",
      carName: "Car Name abcxyz",
      saleDate: "24 july 2024",
      insuranceStatus: "Completed",
      fundStatus: "Pending",
    },
    {
      clientName: "Client Name abcxyz",
      carName: "Car Name abcxyz",
      saleDate: "23 july 2024",
      insuranceStatus: "Pending",
      fundStatus: "Pending",
    },
    {
      clientName: "Client Name abcxyz",
      carName: "Car Name abcxyz",
      saleDate: "27 july 2024",
      insuranceStatus: "Pending",
      fundStatus: "Pending",
    },
    {
      clientName: "Client Name abcxyz",
      carName: "Car Name abcxyz",
      saleDate: "26 july 2024",
      insuranceStatus: "Completed",
      fundStatus: "Completed",
    },
    {
      clientName: "Client Name abcxyz",
      carName: "Car Name abcxyz",
      saleDate: "28 july 2024",
      insuranceStatus: "Pending",
      fundStatus: "Pending",
    },
    {
      clientName: "Client Name abcxyz",
      carName: "Car Name abcxyz",
      saleDate: "27 july 2024",
      insuranceStatus: "Completed",
      fundStatus: "Pending",
    },
    {
      clientName: "Client Name abcxyz",
      carName: "Car Name abcxyz",
      saleDate: "23 july 2024",
      insuranceStatus: "Completed",
      fundStatus: "Completed",
    },
    {
      clientName: "Client Name abcxyz",
      carName: "Car Name abcxyz",
      saleDate: "28 july 2024",
      insuranceStatus: "Pending",
      fundStatus: "Pending",
    },
  ]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(true);
  const [filteredClients, setFilteredClients] = useState(clients); // State to hold filtered data

  const totalPages = Math.ceil(filteredClients.length / rowsPerPage);

  // Calculate records to display
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

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
  const formatDate = (date) => {
    const options = { day: "2-digit", month: "long", year: "numeric" };
    return date.toLocaleDateString("en-GB", options);
  };

  return (
    <div>
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
          <thead className="w-full p-4 text-sm text-gray-700 uppercase bg-gray-50 dark:bg-blue-500 dark:text-white rounded-t-md">
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
            {currentClients.map((client, index) => (
              <tr
                key={index}
                className="bg-white border-b dark:bg-white dark:border-gray-300"
              >
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-black">
                  {client.clientName}
                </td>
                <td className="px-4 py-4">{client.carName}</td>
                <td className="px-4 py-4">{client.saleDate}</td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      client.insuranceStatus === "Completed"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></span>
                  {client.insuranceStatus}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      client.fundStatus === "Completed"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></span>
                  {client.fundStatus}
                </td>
                <td className="flex px-4 py-4">
                  <button className="px-6 py-2.5 text-white bg-blue-600 rounded-lg dark:bg-blue-500">
                    View Details
                  </button>
                  <button className="px-6 ml-7 py-2.5 text-white bg-green-600 rounded-lg dark:bg-purple-600">
                    Upload Insurance
                  </button>
                  <button className="px-6 ml-7 py-2.5 text-white bg-gray-400 rounded-lg dark:bg-gray-400">
                    Fund Car
                  </button>
                </td>
              </tr>
            ))}
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
    </div>
  );
};

export default SaleRecordTable;
