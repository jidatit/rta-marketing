// import { useEffect, useState } from "react";
// import { collection, onSnapshot, query, where } from "firebase/firestore";
// import Filters from "../../../shared/VirtualAssistantComponents/TableFilters";
// import SalesTableVA from "../../../shared/VirtualAssistantComponents/TableComponent";
// import PaginationVA from "../../../shared/VirtualAssistantComponents/Pagination";
// import { db } from "../../../config/firebaseConfig";

// const LeadPagesAnalytics = () => {
//   const [data, setData] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(7);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [selectedLeadSource, setSelectedLeadSource] = useState("");
//   const [selectedSalesPerson, setSelectedSalesPerson] = useState("");

//   useEffect(() => {
//     fetchData();
//   }, [startDate, endDate]);

//   const fetchData = async () => {
//     const currentMonthStart = new Date();
//     currentMonthStart.setDate(1);
//     currentMonthStart.setHours(0, 0, 0, 0);

//     const currentMonthEnd = new Date();
//     currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
//     currentMonthEnd.setDate(0);
//     currentMonthEnd.setHours(23, 59, 59, 999);

//     const leadsQuery = query(
//       collection(db, "leads"),
//       where("timestamp", ">=", startDate || currentMonthStart),
//       where("timestamp", "<=", endDate || currentMonthEnd)
//     );

//     const salesQuery = query(
//       collection(db, "sales"),
//       where("saleDate", ">=", startDate || currentMonthStart),
//       where("saleDate", "<=", endDate || currentMonthEnd)
//     );

//     onSnapshot(leadsQuery, (leadSnapshot) => {
//       const leadCounts = {};
//       leadSnapshot.forEach((doc) => {
//         const lead = doc.data();
//         console.log("leads ", lead);
//         leadCounts[lead.leadSource] = (leadCounts[lead.leadSource] || 0) + 1;
//       });

//       onSnapshot(salesQuery, (salesSnapshot) => {
//         const salesCounts = {};
//         salesSnapshot.forEach((doc) => {
//           const sale = doc.data();
//           salesCounts[sale.leadSource] =
//             (salesCounts[sale.leadSource] || 0) + 1;
//         });

//         const tableData = Object.keys(leadCounts).map((leadSource) => {
//           const totalLeads = leadCounts[leadSource] || 0;
//           const totalSales = salesCounts[leadSource] || 0;
//           const conversionRate = totalLeads
//             ? ((totalSales / totalLeads) * 100).toFixed(2)
//             : "0.00";

//           return {
//             leadSource,
//             totalLeads,
//             totalSales,
//             conversionRate: `${conversionRate}%`,
//           };
//         });

//         setData(tableData);
//       });
//     });
//   };

//   const salesColumns = [
//     { key: "leadSource", label: "Lead Source" },
//     { key: "totalLeads", label: "Total Leads" },
//     { key: "totalSales", label: "Sales Leads" },
//     { key: "conversionRate", label: "Conversion Rate" },
//   ];

//   console.log(data);

//   return (
//     <div className="flex flex-col w-full h-full gap-y-8 overflow-y-auto">
//       {/* <Filters
//         // leadSources={leadSources}
//         // salesPersons={SalesPerson}
//         onFilterChange={(filters) => {
//           setStartDate(filters.startDate);
//           setEndDate(filters.endDate);
//           setSelectedLeadSource(filters.selectedLeadSource);
//           setSelectedSalesPerson(filters.selectedSalesPerson);
//         }}
//         showFilters={true}
//       /> */}
//       <SalesTableVA columns={salesColumns} data={data} />
//       <PaginationVA
//         currentPage={currentPage}
//         totalPages={Math.max(1, Math.ceil(data.length / rowsPerPage))}
//         onPageChange={setCurrentPage}
//         rowsPerPage={rowsPerPage}
//         onRowsPerPageChange={setRowsPerPage}
//       />
//     </div>
//   );
// };

// export default LeadPagesAnalytics;

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Filters from "../../../shared/VirtualAssistantComponents/TableFilters";
import SalesTableVA from "../../../shared/VirtualAssistantComponents/TableComponent";
import PaginationVA from "../../../shared/VirtualAssistantComponents/Pagination";
import { db } from "../../../config/firebaseConfig";

const LeadPagesAnalytics = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedLeadSource, setSelectedLeadSource] = useState("");
  const [selectedSalesPerson, setSelectedSalesPerson] = useState("");
  const [leadSources, setLeadSources] = useState([]);

  useEffect(() => {
    fetchLeadSources();
  }, []);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

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

  const fetchData = async () => {
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const currentMonthEnd = new Date();
    currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
    currentMonthEnd.setDate(0);
    currentMonthEnd.setHours(23, 59, 59, 999);

    const start = startDate || currentMonthStart;
    const end = endDate || currentMonthEnd;

    // Fetch leads from employees
    const employeesRef = collection(db, "employees");
    const employeeSnapshot = await getDocs(employeesRef);
    const leadCounts = {};

    employeeSnapshot.forEach((doc) => {
      const employee = doc.data();
      if (employee.leads && Array.isArray(employee.leads)) {
        employee.leads.forEach((lead) => {
          if (
            lead.timestamp?.toDate() >= start &&
            lead.timestamp?.toDate() <= end &&
            leadSources.includes(lead.leadSource) // Ensure it's an admin-defined source
          ) {
            leadCounts[lead.leadSource] =
              (leadCounts[lead.leadSource] || 0) + 1;
          }
        });
      }
    });

    // Fetch sales
    const salesQuery = query(
      collection(db, "sales")
      //   where("saleDate", ">=", start),
      //   where("saleDate", "<=", end)
    );

    onSnapshot(salesQuery, (salesSnapshot) => {
      const salesCounts = {};
      salesSnapshot.forEach((doc) => {
        const sale = doc.data();
        console.log("sales..", sale);

        if (sale.sales && Array.isArray(sale.sales)) {
          sale.sales.forEach((s) => {
            salesCounts[s.leadSource] = (salesCounts[s.leadSource] || 0) + 1;
          });
        }
      });

      // Merge Data
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
    });
  };

  const salesColumns = [
    { key: "leadSource", label: "Lead Source" },
    { key: "totalLeads", label: "Total Leads" },
    { key: "totalSales", label: "Sales Leads" },
    { key: "conversionRate", label: "Conversion Rate" },
  ];

  return (
    <div className="flex flex-col w-full h-full gap-y-8 overflow-y-auto">
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
