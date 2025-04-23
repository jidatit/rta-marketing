import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import MonthlyFinanceProviderAnalytics from "../components/FinanceProviderAnalytics";
import MonthlyLeadSourceAnalytics from "../components/MonthlyLeadSourceAnalytics";
import SalePersonMonthlyAnalytics from "../components/MonthlySalePersonAnalytics";
import { FaCalendar } from "react-icons/fa6";
import { useState } from "react";

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
  return (
    <div className="flex flex-col items-end h-full overflow-y-auto  w-full px-5 pt-5">
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <Box className="mb-6 flex flex-col md:flex-row gap-4  w-full justify-end">
          <Box className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-6">
            <FormControl
              className="min-w-full md:w-80"
              size="small"
              variant="outlined"
            >
              <InputLabel
                id="month-label"
                className="text-gray-700 bg-white p-1"
              >
                Select Month
              </InputLabel>
              <Select
                labelId="month-label"
                id="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                label="Month"
                className="bg-white"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 224, // This will show about 7 items at once (32px per item)
                      overflowY: "auto",
                    },
                  },
                  // This ensures the menu aligns properly with the select input
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#E5E7EB",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#003160",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#003160",
                  },
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                }}
              >
                {months.map((month, index) => (
                  <MenuItem key={index} value={index}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              className="min-w-full md:w-80"
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
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 224, // This will show about 7 items at once (32px per item)
                      overflowY: "auto",
                    },
                  },
                  // This ensures the menu aligns properly with the select input
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                }}
                className="bg-white"
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#E5E7EB",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#003160",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#003160",
                  },
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                }}
              >
                {getYearOptions().map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {startDate && endDate && (
            <Box className="">
              <Chip
                icon={<FaCalendar size={16} className="ml-2" color="#ffffff" />}
                label={`${formatDisplayDate(startDate)} - ${formatDisplayDate(
                  endDate
                )}`}
                className="bg-blue-900 text-white font-medium"
                sx={{
                  backgroundColor: "#003160",
                  color: "white",
                  fontWeight: 500,
                  paddingY: "1.2rem", // Increased from 0.9rem
                  paddingX: "0.5rem", // Added horizontal padding
                  fontSize: "0.875rem",
                  borderRadius: "9999px",
                  boxShadow: "0 2px 4px rgba(0, 49, 96, 0.2)",
                  "& .MuiChip-label": {
                    paddingLeft: "1.2rem", // Increased from 0.9rem
                    paddingRight: "1rem", // Increased from 0.75rem
                    paddingY: "1.6rem", // Increased from 1.4rem
                  },
                  "& .MuiChip-icon": {
                    marginLeft: "0.75rem", // Added more space for the icon
                  },
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: "#00264d",
                    boxShadow: "0 4px 6px rgba(0, 49, 96, 0.3)",
                  },
                }}
              />
            </Box>
          )}
        </Box>
      </div>{" "}
      <div className="flex flex-col items-end h-full overflow-y-auto  w-full px-5 py-5 gap-y-10">
        {/* Date filter */}
        <SalePersonMonthlyAnalytics
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          startDate={startDate}
          endDate={endDate}
        />
        <MonthlyFinanceProviderAnalytics
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          startDate={startDate}
          endDate={endDate}
        />
        <MonthlyLeadSourceAnalytics
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </div>
  );
};

export default MonthlyAnalytics;
