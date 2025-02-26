import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import Filters from "../../../shared/VirtualAssistantComponents/TableFilters";
import SalesTableVA from "../../../shared/VirtualAssistantComponents/TableComponent";
import PaginationVA from "../../../shared/VirtualAssistantComponents/Pagination";
import { db } from "../../../config/firebaseConfig";
import DateRangeMonthFilter from "./DateRangeMonthFilter";

const LeadPagesAnalytics = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedLeadSource, setSelectedLeadSource] = useState("");
  const [selectedSalesPerson, setSelectedSalesPerson] = useState("");
  const [leadSources, setLeadSources] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  // const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  console.log(selectedMonth);

  useEffect(() => {
    fetchLeadSources();
  }, []);

  console.log(leadSources.length > 0);

  useEffect(() => {
    if (leadSources.length > 0) {
      console.log("fetching...");
      fetchData();
    }
  }, [startDate, endDate, leadSources, selectedMonth]);

  // Fetch admin-defined lead sources
  const fetchLeadSources = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "leads"));
      const sources = querySnapshot.docs.map((doc) => doc.data().leadName);
      setLeadSources(sources);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  // const fetchData = async () => {
  //   const currentMonthStart = new Date();
  //   currentMonthStart.setDate(1);
  //   currentMonthStart.setHours(0, 0, 0, 0);

  //   const currentMonthEnd = new Date();
  //   currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
  //   currentMonthEnd.setDate(0);
  //   currentMonthEnd.setHours(23, 59, 59, 999);

  //   const start = startDate || currentMonthStart;
  //   const end = endDate || currentMonthEnd;

  //   // Fetch leads from employees
  //   const employeesRef = collection(db, "employees");
  //   const employeeSnapshot = await getDocs(employeesRef);
  //   const leadCounts = {};

  //   employeeSnapshot.forEach((doc) => {
  //     const employee = doc.data();
  //     if (employee.leads && Array.isArray(employee.leads)) {
  //       employee.leads.forEach((lead) => {
  //         const leadTime = lead.timestamp?.toDate();
  //         if (
  //           leadTime >= start &&
  //           leadTime <= end &&
  //           leadSources.includes(lead.leadSource) // Ensure it's an admin-defined source
  //         ) {
  //           leadCounts[lead.leadSource] =
  //             (leadCounts[lead.leadSource] || 0) + 1;
  //         }
  //       });
  //     }
  //   });

  //   // Fetch sales (without onSnapshot to ensure data updates properly)
  //   const salesSnapshot = await getDocs(collection(db, "sales"));
  //   const salesCounts = {};

  //   // salesSnapshot.forEach((doc) => {
  //   //   const sale = doc.data();
  //   //   if (sale.sales && Array.isArray(sale.sales)) {
  //   //     sale.sales.forEach((s) => {
  //   //       const saleTime = s.saleDate?.toDate();
  //   //       if (saleTime >= start && saleTime <= end) {
  //   //         salesCounts[s.leadSource] = (salesCounts[s.leadSource] || 0) + 1;
  //   //       }
  //   //     });
  //   //   }
  //   // });

  //   // Merge Data

  //   salesSnapshot.forEach((doc) => {
  //     const sale = doc.data();
  //     if (sale.sales && Array.isArray(sale.sales)) {
  //       sale.sales.forEach((s) => {
  //         let saleTime;

  //         // Check if saleDate is a Firestore Timestamp
  //         if (s.saleDate && typeof s.saleDate.toDate === "function") {
  //           saleTime = s.saleDate.toDate();
  //         }
  //         // If saleDate is a string, parse it as a Date
  //         else if (typeof s.saleDate === "string") {
  //           saleTime = new Date(s.saleDate);
  //         }
  //         // If saleDate is already a JavaScript Date object
  //         else if (s.saleDate instanceof Date) {
  //           saleTime = s.saleDate;
  //         }

  //         if (saleTime && saleTime >= start && saleTime <= end) {
  //           salesCounts[s.leadSource] = (salesCounts[s.leadSource] || 0) + 1;
  //         }
  //       });
  //     }
  //   });

  //   const tableData = Object.keys(leadCounts).map((leadSource) => {
  //     const totalLeads = leadCounts[leadSource] || 0;
  //     const totalSales = salesCounts[leadSource] || 0;
  //     const conversionRate = totalLeads
  //       ? ((totalSales / totalLeads) * 100).toFixed(2)
  //       : "0.00";

  //     return {
  //       leadSource,
  //       totalLeads,
  //       totalSales,
  //       conversionRate: `${conversionRate}%`,
  //     };
  //   });

  //   setData(tableData);
  // };

  // const fetchData = async () => {
  //   let start, end;

  //   if (selectedMonth !== "") {
  //     const year = new Date().getFullYear();
  //     start = new Date(year, selectedMonth, 1);
  //     end = new Date(year, selectedMonth + 1, 0, 23, 59, 59, 999);
  //   } else {
  //     start =
  //       startDate ||
  //       new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  //     end =
  //       endDate ||
  //       new Date(
  //         new Date().getFullYear(),
  //         new Date().getMonth() + 1,
  //         0,
  //         23,
  //         59,
  //         59,
  //         999
  //       );
  //   }

  //   // Fetch leads from employees
  //   const employeesRef = collection(db, "employees");
  //   const employeeSnapshot = await getDocs(employeesRef);
  //   const leadCounts = {};

  //   employeeSnapshot.forEach((doc) => {
  //     const employee = doc.data();
  //     if (employee.leads && Array.isArray(employee.leads)) {
  //       employee.leads.forEach((lead) => {
  //         const leadTime = lead.timestamp?.toDate();
  //         if (
  //           leadTime >= start &&
  //           leadTime <= end &&
  //           leadSources.includes(lead.leadSource)
  //         ) {
  //           leadCounts[lead.leadSource] =
  //             (leadCounts[lead.leadSource] || 0) + 1;
  //         }
  //       });
  //     }
  //   });

  //   // Fetch sales
  //   const salesSnapshot = await getDocs(collection(db, "sales"));
  //   const salesCounts = {};

  //   salesSnapshot.forEach((doc) => {
  //     const sale = doc.data();
  //     if (sale.sales && Array.isArray(sale.sales)) {
  //       sale.sales.forEach((s) => {
  //         let saleTime;

  //         if (s.saleDate && typeof s.saleDate.toDate === "function") {
  //           saleTime = s.saleDate.toDate();
  //         } else if (typeof s.saleDate === "string") {
  //           saleTime = new Date(s.saleDate);
  //         } else if (s.saleDate instanceof Date) {
  //           saleTime = s.saleDate;
  //         }

  //         if (saleTime && saleTime >= start && saleTime <= end) {
  //           salesCounts[s.leadSource] = (salesCounts[s.leadSource] || 0) + 1;
  //         }
  //       });
  //     }
  //   });

  //   const tableData = Object.keys(leadCounts).map((leadSource) => {
  //     const totalLeads = leadCounts[leadSource] || 0;
  //     const totalSales = salesCounts[leadSource] || 0;
  //     const conversionRate = totalLeads
  //       ? ((totalSales / totalLeads) * 100).toFixed(2)
  //       : "0.00";

  //     return {
  //       leadSource,
  //       totalLeads,
  //       totalSales,
  //       conversionRate: `${conversionRate}%`,
  //     };
  //   });

  //   setData(tableData);
  // };

  const fetchData = async () => {
    let start, end;

    if (selectedMonth !== "") {
      const year = new Date().getFullYear();
      start = new Date(year, selectedMonth, 1);
      end = new Date(year, selectedMonth + 1, 0, 23, 59, 59, 999);
    }

    // If a custom date range is set, use it instead
    if (startDate && endDate) {
      start = startDate;
      end = endDate;
    }

    // If neither month nor date range is set, default to the current month
    if (!start || !end) {
      const year = new Date().getFullYear();
      const month = new Date().getMonth();
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    }

    // Fetch leads from employees
    const employeesRef = collection(db, "employees");
    const employeeSnapshot = await getDocs(employeesRef);
    const leadCounts = {};

    employeeSnapshot.forEach((doc) => {
      const employee = doc.data();
      if (employee.leads && Array.isArray(employee.leads)) {
        employee.leads.forEach((lead) => {
          const leadTime = lead.timestamp?.toDate();
          if (
            leadTime >= start &&
            leadTime <= end &&
            leadSources.includes(lead.leadSource)
          ) {
            leadCounts[lead.leadSource] =
              (leadCounts[lead.leadSource] || 0) + 1;
          }
        });
      }
    });

    // Fetch sales
    const salesSnapshot = await getDocs(collection(db, "sales"));
    const salesCounts = {};

    salesSnapshot.forEach((doc) => {
      const sale = doc.data();
      if (sale.sales && Array.isArray(sale.sales)) {
        sale.sales.forEach((s) => {
          let saleTime;
          if (s.saleDate && typeof s.saleDate.toDate === "function") {
            saleTime = s.saleDate.toDate();
          } else if (typeof s.saleDate === "string") {
            saleTime = new Date(s.saleDate);
          } else if (s.saleDate instanceof Date) {
            saleTime = s.saleDate;
          }

          if (saleTime && saleTime >= start && saleTime <= end) {
            salesCounts[s.leadSource] = (salesCounts[s.leadSource] || 0) + 1;
          }
        });
      }
    });

    const tableData = Object.keys(leadCounts).map((leadSource) => {
      const totalLeads = leadCounts[leadSource] || 0;
      const totalSales = salesCounts[leadSource] || 0;
      const conversionRate = totalLeads
        ? ((totalSales / totalLeads) * 100).toFixed(2)
        : "0.00";

      return {
        leadSource,
        totalLeads,
        totalSales,
        conversionRate: `${conversionRate}%`,
      };
    });

    setData(tableData);
  };

  const salesColumns = [
    { key: "leadSource", label: "Lead Source" },
    { key: "totalLeads", label: "Total Leads" },
    { key: "totalSales", label: "Sales Leads" },
    { key: "conversionRate", label: "Conversion Rate" },
  ];

  const getMonthName = (monthIndex) => {
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

    return months[monthIndex] || "Invalid Month";
  };

  return (
    <div className="flex flex-col w-full h-full gap-y-8 overflow-y-auto">
      <DateRangeMonthFilter
        onFilterChange={() => fetchData()}
        showFilters={showFilters}
        handleFilterToggle={() => setShowFilters(!showFilters)}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />
      <div>
        <h2 className="text-lg font-bold">
          {startDate && endDate
            ? `Showing results from (${startDate.toLocaleDateString(
                "en-GB"
              )}) to (${endDate.toLocaleDateString("en-GB")})`
            : `Showing leads for month: ${getMonthName(selectedMonth)}`}
        </h2>
      </div>
      <SalesTableVA columns={salesColumns} data={data} />
      <PaginationVA
        currentPage={currentPage}
        totalPages={Math.max(1, Math.ceil(data.length / rowsPerPage))}
        onPageChange={setCurrentPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
      />
    </div>
  );
};

export default LeadPagesAnalytics;
