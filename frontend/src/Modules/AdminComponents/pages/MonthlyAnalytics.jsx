import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
// import MonthlyFinanceProviderAnalytics from "../components/FinanceProviderAnalytics";
// import MonthlyLeadSourceAnalytics from "../components/MonthlyLeadSourceAnalytics";
// import SalePersonMonthlyAnalytics from "../components/MonthlySalePersonAnalytics";
import { FaCalendar } from "react-icons/fa6";
import { useEffect, useState } from "react";
import SalesTrackingTable from "../components/SalesTrackingTable";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";

const MonthlyAnalytics = () => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSalesperson, setSelectedSalesperson] = useState("All");
  const [allSales, setAllSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [monthlyTargets, setMonthlyTargets] = useState(0);
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    totalSalesPrice: 0,
  });

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  // Prepare date range for display
  const startDate = new Date(selectedYear, selectedMonth, 1);
  const endDate = new Date(selectedYear, selectedMonth + 1, 0);
  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  // Handle year change
  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 1900;
    const endYear = currentYear; // Include 5 years into the future

    // Create array with all years from 1900 to current year + 5
    return Array.from(
      { length: endYear - startYear + 1 },
      (_, i) => startYear + i
    ).reverse(); // Show most recent years first
  };

  const handleSalespersonChange = (event) => {
    setSelectedSalesperson(event.target.value);
  };

  useEffect(() => {
    const fetchAllSales = async () => {
      const snapshot = await getDocs(collection(db, "sales"));
      const all = [];

      snapshot.forEach((doc) => {
        const userId = doc.id;
        const salesArray = doc.data().sales || [];
        salesArray.forEach((sale) => {
          all.push({ ...sale, userId }); // Keep userId if needed for reference
        });
      });

      setAllSales(all);
    };

    fetchAllSales();
  }, []);

  useEffect(() => {
    const filterSalesByDate = (sales, month, year) => {
      return sales.filter((sale) => {
        const date = new Date(sale.saleDate);
        return date.getMonth() === month && date.getFullYear() === year;
      });
    };

    const filterSalesBySalesperson = (sales, person) => {
      if (person === "All") return sales;
      return sales.filter((sale) => sale.salesperson === person);
    };

    const calculateSalesStats = (sales) => {
      const totalSales = sales.length;
      const totalSalesPrice = sales.reduce(
        (acc, curr) => acc + parseFloat(curr.salePrice || 0),
        0
      );
      return { totalSales, totalSalesPrice };
    };

    const applyFilters = () => {
      const dateFiltered = filterSalesByDate(
        allSales,
        selectedMonth,
        selectedYear
      );
      const finalFiltered = filterSalesBySalesperson(
        dateFiltered,
        selectedSalesperson
      );
      setFilteredSales(finalFiltered);

      const stats = calculateSalesStats(finalFiltered);
      setSalesStats(stats);
    };

    applyFilters();
  }, [allSales, selectedMonth, selectedYear, selectedSalesperson]);

  const getMonthlyTargets = async (year, month, selectedUserId = null) => {
    const monthId = `${year}-${String(month + 1).padStart(2, "0")}`; // e.g. "2025-02"
    const docRef = doc(db, "monthlyTargets", monthId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.warn(`No data found for ${monthId}`);
      return {
        totalTarget: 0,
        userTarget: 0,
      };
    }

    const data = docSnap.data();

    // Sum all user targets
    const totalTarget = Object.values(data).reduce((sum, entry) => {
      return sum + (entry.target || 0);
    }, 0);

    // Get selected user’s target if needed
    const userTarget =
      selectedUserId && data[selectedUserId]?.target
        ? data[selectedUserId].target
        : 0;

    return {
      totalTarget,
      userTarget,
    };
  };

  useEffect(() => {
    const loadTargets = async () => {
      const { totalTarget, userTarget } = await getMonthlyTargets(
        selectedYear,
        selectedMonth
      );
      console.log("Total:", totalTarget);
      console.log("User Target:", userTarget);
      setMonthlyTargets(totalTarget);
    };

    loadTargets();
  }, [selectedMonth, selectedYear]);
  return (
    <div className="flex flex-col items-center h-full w-full bg-white px-5">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start w-full  pt-5 pb-3">
        <div className="mb-4 md:mb-0">
          <img src="/logo.png" alt="RightTurn Auto Credit" className="h-16" />
        </div>

        <div className="flex flex-col w-full md:w-auto gap-4 ">
          <div className="flex flex-col md:flex-row gap-4 justify-end pt-8  ">
            <FormControl
              className="min-w-full md:w-52"
              size="small"
              variant="outlined"
            >
              <InputLabel id="month-label" className="text-gray-700 bg-white">
                Select Month
              </InputLabel>
              <Select
                labelId="month-label"
                id="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                label="Month"
                className="bg-white"
              >
                {months.map((month, index) => (
                  <MenuItem key={index} value={index}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              className="min-w-full md:w-52"
              size="small"
              variant="outlined"
            >
              <InputLabel id="year-label" className="text-gray-700 bg-white">
                Select Year
              </InputLabel>
              <Select
                labelId="year-label"
                id="year"
                value={selectedYear}
                onChange={handleYearChange}
                label="Year"
                className="bg-white"
              >
                {getYearOptions().map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <div className="flex items-center">
              <span className="text-[#011c64] font-semibold mr-2">
                Select Salesperson
              </span>
              <FormControl size="small" variant="outlined" className="min-w-32">
                <Select
                  value={selectedSalesperson}
                  onChange={handleSalespersonChange}
                  className="bg-white"
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="John Doe">John Doe</MenuItem>
                  <MenuItem value="Jane Smith">Jane Smith</MenuItem>
                  <MenuItem value="Mike Johnson">Mike Johnson</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
            {startDate && endDate && (
              <div className="flex items-center">
                <div className="flex flex-col mr-6">
                  <span className="text-[#011c64] font-semibold">
                    Start Date
                  </span>
                  <span className="text-blue-900 font-bold">
                    {formatDisplayDate(startDate)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[#011c64] font-semibold">End Date</span>
                  <span className="text-blue-900 font-bold">
                    {formatDisplayDate(endDate)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full max-w-full  my-6">
        {/* Header Row */}
        <div className="flex w-full min-w-full">
          <div className="flex-1 min-w-32 text-left font-bold text-[#011c64]"></div>
          <div className="w-36 md:w-48 lg:w-64 text-center font-bold text-[#011c64]">
            Units Sold
          </div>
          <div className="w-36 md:w-48 lg:w-64 text-center font-bold text-[#011c64]">
            Sales Gross
          </div>
        </div>

        {/* Target Row */}
        <div className="flex w-full min-w-full items-center my-1">
          <div className="flex-1 min-w-32 text-left font-bold text-[#011c64]">
            Target
          </div>
          <div className="w-36 md:w-48 lg:w-64 bg-white text-[#011c64] font-bold text-center p-1 border border-gray-300">
            {monthlyTargets}
          </div>
          <div className="w-36 md:w-48 lg:w-64 bg-white text-[#011c64] font-bold text-center p-1 border border-gray-300 ">
            $0.00
          </div>
        </div>

        {/* Month To Date Row */}
        <div className="flex w-full min-w-full items-center my-1">
          <div className="flex-1 min-w-32 text-left font-bold text-[#011c64]">
            Month To Date
          </div>
          <div className="w-36 md:w-48 lg:w-64  text-white font-bold bg-[#011c64] text-center p-1 border border-gray-300">
            {salesStats.totalSales || "N/A"}
          </div>
          <div className="w-36 md:w-48 lg:w-64 text-white font-bold bg-[#011c64]  text-center p-1 border border-gray-300">
            ${salesStats.totalSalesPrice.toFixed(2) || "N/A"}
          </div>
        </div>

        {/* Gap to Target Row */}
        <div className="flex w-full min-w-full items-center my-1">
          <div className="flex-1 min-w-32 text-left font-bold text-[#011c64]">
            Gap to Target
          </div>
          <div className="w-36 md:w-48 lg:w-64 bg-green-100 text-center p-1 border border-gray-300 font-bold">
            {salesStats.totalSales > monthlyTargets
              ? "Target Met"
              : salesStats?.totalSales - monthlyTargets || "N/A"}
          </div>
          <div className="w-36 md:w-48 lg:w-64 bg-red-50 text-center p-1 border border-gray-300 font-bold">
            #N/A
          </div>
        </div>

        {/* Average Row */}
        <div className="flex w-full min-w-full items-center my-1">
          <div className="flex-1 min-w-32 text-left font-bold text-[#011c64]">
            Average
          </div>
          <div className="w-36 md:w-48 lg:w-64"></div>
          <div className="w-36 md:w-48 lg:w-64 bg-yellow-100 text-center p-1 border border-gray-300 text-[#011c64] font-bold">
            #N/A
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full ">
        <SalesTrackingTable sales={filteredSales} />
      </div>
    </div>
  );
};

export default MonthlyAnalytics;
