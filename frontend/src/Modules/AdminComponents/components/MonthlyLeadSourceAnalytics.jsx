import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../config/firebaseConfig";

const MonthlyLeadSourceAnalytics = () => {
  const [leadSourceData, setLeadSourceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allSalesData, setAllSalesData] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [selectedLeadSource, setSelectedLeadSource] = useState("all");

  // Filter state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Prepare date range for display
  const startDate = new Date(selectedYear, selectedMonth, 1);
  const endDate = new Date(selectedYear, selectedMonth + 1, 0);

  // Format dates for display
  const formatDisplayDate = (date) => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setIsLoading(true);

        // Fetch all sales documents
        const salesSnapshot = await getDocs(collection(db, "sales"));

        // Store all sales data with dates
        const allSales = [];
        const uniqueLeadSources = new Set();

        // Process all sales records
        salesSnapshot.forEach((salesDoc) => {
          const salesData = salesDoc.data();
          const salesDocId = salesDoc.id;

          if (salesData.sales && Array.isArray(salesData.sales)) {
            salesData.sales.forEach((sale) => {
              // Extract date from sale
              let saleDate = null;
              if (sale.saleDate) {
                const dateParts = sale.saleDate.split(" ");
                if (dateParts.length >= 3) {
                  const day = parseInt(dateParts[0]);
                  const month = [
                    "january",
                    "february",
                    "march",
                    "april",
                    "may",
                    "june",
                    "july",
                    "august",
                    "september",
                    "october",
                    "november",
                    "december",
                  ].indexOf(dateParts[1].toLowerCase());
                  const year = parseInt(dateParts[2]);
                  if (!isNaN(day) && month !== -1 && !isNaN(year)) {
                    saleDate = new Date(year, month, day);
                  }
                }
              }

              // Get lead source
              let leadSource = sale.leadSource || "Unknown";
              if (leadSource !== "Unknown") {
                leadSource = leadSource.trim().toLowerCase(); // normalize
                uniqueLeadSources.add(leadSource);
              }

              // Add this sale with its date and lead source info
              if (leadSource !== "Unknown") {
                allSales.push({
                  sale,
                  saleDate,
                  salespersonId: salesDocId,
                  leadSource,
                });
              }
            });
          }
        });

        setAllSalesData(allSales);
        setLeadSources(Array.from(uniqueLeadSources).sort());

        // Initial processing with default filters
        processSalesData(allSales, selectedLeadSource);
      } catch (err) {
        console.error("Error fetching sales data:", err);
        setError("Failed to load sales data");
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  // Process data when filters change
  useEffect(() => {
    if (allSalesData.length > 0) {
      processSalesData(allSalesData, selectedLeadSource);
    }
  }, [selectedMonth, selectedYear, selectedLeadSource, allSalesData]);

  const processSalesData = (salesData, leadSourceFilter) => {
    try {
      setIsLoading(true);

      // Filter sales data by selected month and year
      let filteredSales = salesData.filter((item) => {
        if (!item.saleDate) return false;

        return (
          item.saleDate.getMonth() === selectedMonth &&
          item.saleDate.getFullYear() === selectedYear
        );
      });

      // Apply lead source filter if not "all"
      if (leadSourceFilter !== "all") {
        filteredSales = filteredSales.filter(
          (item) => item.leadSource === leadSourceFilter
        );
      }

      const leadSourceMap = new Map();

      // Process filtered sales
      filteredSales.forEach(({ sale, leadSource }) => {
        if (!leadSourceMap.has(leadSource)) {
          leadSourceMap.set(leadSource, {
            name: leadSource,
            leadCost: 0,
            dealsBooked: 0,
            daysToDelivery: [],
            daysToFunding: [],
            amountFunded: 0,
            gross: 0,
            salesGross: 0,
            commission: 0,
            trueGross: 0,
          });
        }

        const source = leadSourceMap.get(leadSource);

        source.dealsBooked += 1;

        if (sale.referralCost) {
          source.leadCost += parseFloat(sale.referralCost) || 0;
        }

        if (sale.daysToDelivery) {
          source.daysToDelivery.push(parseInt(sale.daysToDelivery) || 0);
        }

        if (sale.daysToFunding) {
          source.daysToFunding.push(parseInt(sale.daysToFunding) || 0);
        }

        source.amountFunded += parseFloat(sale.amountFunded || 0);
        source.gross += parseFloat(sale.gross || 0);
        source.salesGross += parseFloat(sale.salesGross || 0);
        source.commission += parseFloat(sale.commission || 0);
        source.trueGross += parseFloat(sale.trueGross || 0);
      });

      const leadSourceArray = Array.from(leadSourceMap.values()).map(
        (source) => {
          const avgDaysToDelivery =
            source.daysToDelivery.length > 0
              ? source.daysToDelivery.reduce((a, b) => a + b, 0) /
                source.daysToDelivery.length
              : 0;

          const avgDaysToFunding =
            source.daysToFunding.length > 0
              ? source.daysToFunding.reduce((a, b) => a + b, 0) /
                source.daysToFunding.length
              : 0;

          const avgAmountFunded =
            source.dealsBooked > 0
              ? source.amountFunded / source.dealsBooked
              : 0;

          const avgGross =
            source.dealsBooked > 0 ? source.gross / source.dealsBooked : 0;

          const avgSalesGross =
            source.dealsBooked > 0 ? source.salesGross / source.dealsBooked : 0;

          const avgCommission =
            source.dealsBooked > 0 ? source.commission / source.dealsBooked : 0;

          const avgTrueGross =
            source.dealsBooked > 0 ? source.trueGross / source.dealsBooked : 0;

          return {
            name: source.name,
            leadCost: source.leadCost,
            dealsBooked: source.dealsBooked,
            avgDaysToDelivery: parseFloat(avgDaysToDelivery.toFixed(2)),
            avgDaysToFunding: parseFloat(avgDaysToFunding.toFixed(2)),
            totalAmountFunded: source.amountFunded,
            avgAmountFunded: parseFloat(avgAmountFunded.toFixed(2)),
            totalGross: source.gross,
            avgGross: parseFloat(avgGross.toFixed(2)),
            totalSalesGross: source.salesGross,
            avgSalesGross: parseFloat(avgSalesGross.toFixed(2)),
            totalCommission: source.commission,
            avgCommission: parseFloat(avgCommission.toFixed(2)),
            totalTrueGross: source.trueGross,
            avgTrueGross: parseFloat(avgTrueGross.toFixed(2)),
          };
        }
      );

      setLeadSourceData(leadSourceArray);
    } catch (err) {
      console.error("Error processing sales data:", err);
      setError("Failed to process sales data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle month change
  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  // Handle year change
  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  // Handle lead source change
  const handleLeadSourceChange = (e) => {
    setSelectedLeadSource(e.target.value);
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Get array of years (current year and 5 years back)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - i);
  };

  if (isLoading && leadSourceData.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003160]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}. Please try again later.
      </div>
    );
  }

  return (
    <div>
      {/* Date and Lead Source filters */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="min-w-[140px]">
            <label
              htmlFor="month"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Month
            </label>
            <select
              id="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#003160] focus:border-[#003160]"
            >
              <option value="0">January</option>
              <option value="1">February</option>
              <option value="2">March</option>
              <option value="3">April</option>
              <option value="4">May</option>
              <option value="5">June</option>
              <option value="6">July</option>
              <option value="7">August</option>
              <option value="8">September</option>
              <option value="9">October</option>
              <option value="10">November</option>
              <option value="11">December</option>
            </select>
          </div>

          <div className="min-w-[120px]">
            <label
              htmlFor="year"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Year
            </label>
            <select
              id="year"
              value={selectedYear}
              onChange={handleYearChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#003160] focus:border-[#003160]"
            >
              {getYearOptions().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[200px]">
            <label
              htmlFor="leadSource"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Lead Source
            </label>
            <select
              id="leadSource"
              value={selectedLeadSource}
              onChange={handleLeadSourceChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#003160] focus:border-[#003160]"
            >
              <option value="all">All Sources</option>
              {leadSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date range chip */}
        <div className="ml-0 md:ml-4 mt-4 md:mt-0">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#003160] text-white">
            {formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center min-h-[100px] mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#003160]"></div>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[1200px] md:min-w-0 min-h-[280px]">
          <table className="w-full table-fixed text-sm text-left text-black rtl:text-right dark:text-black font-radios">
            <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-[#003160] dark:text-white">
              <tr>
                <th
                  scope="col"
                  className="px-2 py-3 sm:px-4 sm:py-4 rounded-tl-md"
                >
                  Lead Source
                </th>
                <th scope="col" className="px-2 py-3 sm:px-4 sm:py-4">
                  Lead Cost
                </th>
                <th scope="col" className="px-2 py-3 sm:px-4 sm:py-4">
                  Deals Booked
                </th>
                <th scope="col" className="px-2 py-3 sm:px-4 sm:py-4">
                  Average Days to Delivery
                </th>
                <th scope="col" className="px-2 py-3 sm:px-4 sm:py-4">
                  Average Days to Funding
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 sm:px-4 sm:py-4 text-center"
                  colSpan="2"
                >
                  Amount Funded
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 sm:px-4 sm:py-4 text-center"
                  colSpan="2"
                >
                  Gross
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 sm:px-4 sm:py-4 text-center"
                  colSpan="2"
                >
                  Sales Gross
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 sm:px-4 sm:py-4 text-center"
                  colSpan="2"
                >
                  Commission
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 sm:px-4 sm:py-4 text-center rounded-tr-md"
                  colSpan="2"
                >
                  True Gross
                </th>
              </tr>
              <tr className="dark:bg-[#003160] dark:text-white">
                <th scope="col" className="px-2 py-1 sm:px-4 sm:py-2"></th>
                <th scope="col" className="px-2 py-1 sm:px-4 sm:py-2"></th>
                <th scope="col" className="px-2 py-1 sm:px-4 sm:py-2"></th>
                <th scope="col" className="px-2 py-1 sm:px-4 sm:py-2"></th>
                <th scope="col" className="px-2 py-1 sm:px-4 sm:py-2"></th>
                <th
                  scope="col"
                  className="px-2 py-1 sm:px-4 sm:py-2 text-center"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 sm:px-4 sm:py-2 text-center"
                >
                  Average
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 sm:px-4 sm:py-2 text-center"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 sm:px-4 sm:py-2 text-center"
                >
                  Average
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 sm:px-4 sm:py-2 text-center"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 sm:px-4 sm:py-2 text-center"
                >
                  Average
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 sm:px-4 sm:py-2 text-center"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 sm:px-4 sm:py-2 text-center"
                >
                  Average
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 sm:px-4 sm:py-2 text-center"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 sm:px-4 sm:py-2 text-center"
                >
                  Average
                </th>
              </tr>
            </thead>
            <tbody className="border-t-0 border-gray-300 border-1">
              {leadSourceData.length > 0 ? (
                leadSourceData.map((source, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b dark:bg-white dark:border-gray-300"
                  >
                    <td className="px-2 py-3 sm:px-4 sm:py-4 font-medium text-gray-900 whitespace-nowrap dark:text-black">
                      {source.name.substring(0, 10)}..
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4">
                      {formatCurrency(source.leadCost)}
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4">
                      {source.dealsBooked}
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4">
                      {source.avgDaysToDelivery}
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4">
                      {source.avgDaysToFunding}
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4 text-center">
                      {formatCurrency(source.totalAmountFunded)}
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4 text-center">
                      {formatCurrency(source.avgAmountFunded)}
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4 text-center">
                      {formatCurrency(source.totalGross)}
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4 text-center">
                      {formatCurrency(source.avgGross)}
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4 text-center">
                      {formatCurrency(source.totalSalesGross)}
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4 text-center">
                      {formatCurrency(source.avgSalesGross)}
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4 text-center">
                      {formatCurrency(source.totalCommission)}
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4 text-center">
                      {formatCurrency(source.avgCommission)}
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4 text-center">
                      {formatCurrency(source.totalTrueGross)}
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4 text-center">
                      {formatCurrency(source.avgTrueGross)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="15" className="w-full p-4 text-center">
                    No sales data available for {formatDisplayDate(startDate)} -{" "}
                    {formatDisplayDate(endDate)}
                    {selectedLeadSource !== "all" &&
                      ` for lead source: ${selectedLeadSource}`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyLeadSourceAnalytics;
