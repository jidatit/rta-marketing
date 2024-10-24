const SalesTable = ({
  currentClients,
  handleDeleteSale,
  handleOpenViewModal,
}) => {
  return (
    <table className="w-full text-sm text-left text-black rtl:text-right dark:text-black font-radios">
      <thead className="w-full p-4 text-sm text-gray-700 uppercase bg-gray-50 dark:bg-[#003160] dark:text-white rounded-t-md">
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
        {currentClients && currentClients.length > 0 ? (
          currentClients.map((sale, saleIndex) => (
            <tr
              key={saleIndex}
              className="bg-white border-b dark:bg-white dark:border-gray-300"
            >
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-black">
                {sale.customerName}
              </td>
              <td className="px-4 py-4 text-gray-900">{sale.vehicleMake}</td>
              <td className="px-4 py-4 text-gray-900">{sale.saleDate}</td>
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

                <button
                  className="w-[40%] py-2.5 text-white bg-red-500 rounded-lg"
                  onClick={() => {
                    handleDeleteSale(sale.saleId, sale.documentId);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="100%" className="w-full p-2 text-center">
              No sales data available{" "}
              <button
                className="text-blue-600 font-radios font-semibold"
                onClick={() => setShowModal(true)}
              >
                Add New Sale
              </button>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default SalesTable;
