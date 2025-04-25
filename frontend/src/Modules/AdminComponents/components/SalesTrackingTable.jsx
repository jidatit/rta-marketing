import React from "react";

export default function SalesTrackingTable({ sales = [] }) {
  // Sample data if no sales are provided

  const displaySales = sales.length > 0 ? sales : [];

  // Calculate True Gross (this would be replaced with actual calculation if needed)
  const calculateTrueGross = (sale) => {
    return sale.gap || "";
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#011c64]">
            <th className="border border-[#011c64] text-white p-2 text-sm ">
              Customer Name
            </th>
            <th className="border border-[#011c64] text-white p-2 text-sm ">
              Lead Source
            </th>
            <th className="border border-[#011c64] text-white p-2 text-sm ">
              Date Lead Received
            </th>
            <th className="border border-[#011c64] text-white p-2 text-sm ">
              Sale Date
            </th>
            <th className="border border-[#011c64] text-white p-2 text-sm ">
              Sales Rep
            </th>
            <th className="border border-[#011c64] text-white p-2 text-sm ">
              Gross
            </th>
            <th className="border border-[#011c64] text-white p-2 text-sm ">
              Sales Gross
            </th>
            <th className="border border-[#011c64] text-white p-2 text-sm ">
              Commission
            </th>
            <th className="border border-[#011c64] text-white p-2 text-sm">
              True Gross
            </th>
            <th className="border border-[#011c64] text-white p-2 text-sm">
              Finance Provider
            </th>
            <th className="border border-[#011c64] text-white p-2 text-sm">
              Interest Rate
            </th>
            <th className="border border-[#011c64] text-white p-2 text-sm">
              Stock #
            </th>
            <th className="border border-[#011c64] text-white p-2 text-sm">
              Vehicle
            </th>
            <th className="border border-[#011c64] text-white p-2 text-sm">
              Trade Description
            </th>
            <th className="border border-[#011c64] text-white p-2 text-sm">
              Lien
            </th>
          </tr>
        </thead>
        {displaySales.length === 0 && (
          <tbody>
            <tr>
              <td colSpan="15" className="text-center p-4 text-gray-500 border">
                No sales data available.
              </td>
            </tr>
          </tbody>
        )}
        <tbody className="w-full">
          {displaySales.map((sale, index) => (
            <tr key={index}>
              <td className="border border-gray-300 p-2 text-sm">
                {sale.customerName || ""}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {sale.leadSource || ""}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {/* {sale.intermediateDate || ""} */}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {sale.saleDate || ""}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {/* {sale.admin || ""} */}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {sale.grossProfit || ""}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {sale.salePrice || ""}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {/* {sale.reserve || ""} */}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {/* {calculateTrueGross(sale)} */}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {/* {sale.documentId || ""} */}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {/* {sale.gapCost || ""} */}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {sale.stockNumber || ""}
              </td>
              <td className="border border-gray-300 p-2 text-sm">{`${
                sale.vehicleMake || ""
              } ${sale.vehicleModel || ""}`}</td>
              <td className="border border-gray-300 p-2 text-sm">
                {/* {sale.VIN || ""} */}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {sale.warr || ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
