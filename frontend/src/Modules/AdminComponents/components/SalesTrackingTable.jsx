import React from "react";

export default function SalesTrackingTable({ sales = [] }) {
  // Sample data if no sales are provided

  const displaySales = sales.length > 0 ? sales : [];

  // Calculate True Gross (this would be replaced with actual calculation if needed)

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
                {sale.customerName || "N/A"}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {sale.leadSource || "N/A"}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {sale.dateLeadReceived || "N/A"}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {sale.saleDate || "N/A"}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {sale.salesRep || "N/A"}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {sale.grossProfit || "N/A"}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {sale.salesGross || "N/A"}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {sale.commission || "N/A"}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {sale.trueGross || "N/A"}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {sale.financeProvider || "N/A"}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {sale.interestRate || "N/A"}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {sale.stockNumber || "N/A"}
              </td>
              <td className="border border-gray-300 p-2 text-sm">{`${
                sale.vehicle || "N/A"
              } ${sale.vehicleModel || "N/A"}`}</td>
              <td className="border border-gray-300 p-2 text-sm">
                {(sale.tradeDescription || "N/A").slice(0, 15)}
              </td>
              <td className="border border-gray-300 p-2 text-sm">
                {sale.lienAmount || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
