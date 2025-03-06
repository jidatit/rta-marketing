import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
// Import icons from react-icons
import { FaChartLine, FaUsers, FaExchangeAlt, FaDollarSign } from 'react-icons/fa';

const SalesAnalysisChart = () => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        height: 500,
        type: "bar",
        zoom: { enabled: true, type: "x" },
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
        scrollbar: {
          enabled: true,
        },
        background: "#f8fafc",
        fontFamily: "'Inter', 'Helvetica', sans-serif",
      },
      colors: ["#00c22a", "#0a99ff", "#FFC107", "#ff0008"],
      xaxis: {
        categories: [],
        title: {
          text: "Date",
          style: {
            color: "#64748b",
            fontWeight: 600,
            fontSize: "12px",
          },
        },
        labels: {
          rotate: -45,
          rotateAlways: true,
          style: {
            colors: "#4b5563",
            fontSize: "10px",
            fontWeight: 500,
          },
        },
        tickPlacement: "on",
        axisBorder: {
          show: true,
          color: "#e2e8f0",
        },
        axisTicks: {
          show: true,
          color: "#e2e8f0",
        },
      },
      yaxis: [
        {
          title: {
            text: "Total Leads",
            style: {
              color: "#00c22a",
              fontWeight: 600,
              fontSize: "12px",
            },
          },
          labels: {
            style: {
              colors: "#00c22a",
              fontWeight: 500,
            },
            formatter: (value) => Math.round(value),
          },
          seriesName: "Total Leads",
          axisBorder: {
            show: true,
            color: "#00c22a",
          },
          axisTicks: {
            show: true,
            color: "#00c22a",
          },
        },
        {
          opposite: true,
          title: {
            text: "Total Sales",
            style: {
              color: "#0a99ff",
              fontWeight: 600,
              fontSize: "12px",
            },
          },
          labels: {
            style: {
              colors: "#0a99ff",
              fontWeight: 500,
            },
            formatter: (value) => Math.round(value),
          },
          seriesName: "Total Sales",
          axisBorder: {
            show: true,
            color: "#0a99ff",
          },
          axisTicks: {
            show: true,
            color: "#0a99ff",
          },
        },
        {
          opposite: true,
          title: {
            text: "Conversion Rate (%)",
            style: {
              color: "#FFC107",
              fontWeight: 600,
              fontSize: "12px",
            },
          },
          min: 0,
          max: 100,
          labels: {
            formatter: (value) => `${value.toFixed(1)}%`,
            style: {
              colors: "#FFC107",
              fontWeight: 500,
            },
          },
          seriesName: "Conversion Rate",
          axisBorder: {
            show: true,
            color: "#FFC107",
          },
          axisTicks: {
            show: true,
            color: "#FFC107",
          },
        },
        {
          opposite: true,
          title: {
            text: "Cost Per Sale ($)",
            style: {
              color: "#ff0008",
              fontWeight: 600,
              fontSize: "12px",
            },
          },
          labels: {
            formatter: (value) => `$${value.toFixed(0)}`,
            style: {
              colors: "#ff0008",
              fontWeight: 500,
            },
          },
          seriesName: "Cost Per Sale",
          axisBorder: {
            show: true,
            color: "#ff0008",
          },
          axisTicks: {
            show: true,
            color: "#ff0008",
          },
        },
      ],
      plotOptions: {
        bar: {
          columnWidth: "65%",
          borderRadius: 2,
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: [0, 0, 3, 3],
        curve: "smooth",
        colors: ["#00c22a", "#0a99ff", "#FFC107", "#ff0008"],
      },
      grid: {
        show: true,
        borderColor: "#e5e7eb",
        strokeDashArray: 5,
        position: "back",
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
        // Adding specific grid lines for each y-axis
        row: {
          colors: undefined,
          opacity: 0.5,
        },
        column: {
          colors: undefined,
          opacity: 0.5,
        },
        padding: {
          right: 10,
          left: 10,
        },
      },
      legend: {
        show: true,
        position: "bottom",
        horizontalAlign: "center",
        fontSize: "12px",
        fontWeight: 500,
        markers: {
          width: 12,
          height: 12,
          radius: 6,
        },
        itemMargin: {
          horizontal: 15,
          vertical: 5,
        },
      },
      tooltip: {
        theme: "light",
        shared: true,
        intersect: false,
        style: {
          fontSize: "12px",
        },
        y: {
          formatter: function (value, { seriesIndex, dataPointIndex, w }) {
            const seriesName = w.config.series[seriesIndex].name;
            if (seriesName === "Total Leads" || seriesName === "Total Sales") {
              return Math.round(value);
            }
            if (seriesName === "Conversion Rate") {
              return `${value.toFixed(1)}%`;
            }
            if (seriesName === "Cost Per Sale") {
              return `$${value.toFixed(0)}`;
            }
            return value;
          },
        },
        marker: {
          show: true,
        },
      },
      responsive: [
        {
          breakpoint: 1024,
          options: {
            chart: {
              height: 400,
            },
            xaxis: {
              labels: {
                rotate: -90,
                style: {
                  fontSize: "8px",
                },
              },
            },
          },
        },
        {
          breakpoint: 600,
          options: {
            chart: {
              height: 300,
            },
            xaxis: {
              labels: {
                rotate: -90,
                style: {
                  fontSize: "6px",
                },
              },
            },
          },
        },
      ],
    },
  });

  // New state for the summary stats
  const [summaryStats, setSummaryStats] = useState({
    totalLeads: 0,
    totalSales: 0,
    conversionRate: 0,
    costPerSale: 0
  });

  const [dateFrom, setDateFrom] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1)
  );
  const [dateTo, setDateTo] = useState(new Date());
  const [leadSources, setLeadSources] = useState([]);
  const [selectedLeadSource, setSelectedLeadSource] = useState("All");
  const [dateGrouping, setDateGrouping] = useState("day"); // 'day', 'month', 'year', or 'hour'
  const [timeRangeFilter, setTimeRangeFilter] = useState("custom"); // New time range filter

  // Time range options
  const timeRangeOptions = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastWeek", label: "Last Week" },
    { value: "lastYear", label: "Last Year" },
    { value: "custom", label: "Custom Range" },
  ];

  // Apply time range filter
  useEffect(() => {
    if (timeRangeFilter === "custom") {
      // No change to dates, use the custom date picker values
      return;
    }

    const now = new Date();
    let newDateFrom, newDateTo;

    switch (timeRangeFilter) {
      case "today":
        // Set from and to to today (00:00 to 23:59)
        newDateFrom = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0
        );
        newDateTo = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59
        );
        setDateGrouping("hour");
        break;
      case "yesterday":
        // Set from and to to yesterday (00:00 to 23:59)
        newDateFrom = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1,
          0,
          0,
          0
        );
        newDateTo = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1,
          23,
          59,
          59
        );
        setDateGrouping("hour");
        break;
      case "thisMonth":
        // Set from to first day of current month and to to today
        newDateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        newDateTo = new Date(now);
        break;
      case "lastWeek":
        // Set from to 7 days ago and to to today
        newDateFrom = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 7
        );
        newDateTo = new Date(now);
        break;
      case "lastYear":
        // Set from to 1 year ago and to to today
        newDateFrom = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate()
        );
        newDateTo = new Date(now);
        break;
      default:
        return;
    }

    setDateFrom(newDateFrom);
    setDateTo(newDateTo);
  }, [timeRangeFilter]);

  useEffect(() => {
    const fetchLeadSources = async () => {
      const querySnapshot = await getDocs(collection(db, "leads"));
      const sources = querySnapshot.docs.map((doc) => doc.data().leadName);
      setLeadSources(["All", ...new Set(sources)]);
    };
    fetchLeadSources();
  }, []);

  // Determine appropriate date grouping based on date range
  useEffect(() => {
    // Only set date grouping if not already set by time range filter
    if (timeRangeFilter !== "today" && timeRangeFilter !== "yesterday") {
      const daysDifference = Math.ceil(
        (dateTo - dateFrom) / (1000 * 60 * 60 * 24)
      );

      let newGrouping = "day";
      if (daysDifference <= 2) {
        newGrouping = "hour"; // For 1-2 day differences, show hourly data
      } else if (daysDifference > 90) {
        newGrouping = "month";
      } else if (daysDifference > 730) {
        newGrouping = "year";
      }

      setDateGrouping(newGrouping);
    }
  }, [dateFrom, dateTo, timeRangeFilter]);

  // Helper function to format dates based on grouping
  const formatDate = (date, grouping) => {
    const d = new Date(date);
    if (grouping === "hour") {
      return `${d.toISOString().split("T")[0]}-${String(d.getHours()).padStart(
        2,
        "0"
      )}`;
    } else if (grouping === "day") {
      return d.toISOString().split("T")[0];
    } else if (grouping === "month") {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    } else if (grouping === "year") {
      return `${d.getFullYear()}`;
    }
  };

  // Helper function for displaying formatted dates in UI
  const getDisplayFormat = (dateStr, grouping) => {
    if (grouping === "hour") {
      const [datePart, hour] = dateStr.split("-");
      const dateObj = new Date(datePart);
      return `${dateObj.toLocaleDateString()} ${hour}:00`;
    } else if (grouping === "day") {
      return new Date(dateStr).toLocaleDateString();
    } else if (grouping === "month") {
      const [year, month] = dateStr.split("-");
      return `${new Date(year, month - 1).toLocaleString("default", {
        month: "short",
      })} ${year}`;
    } else {
      return dateStr; // Year
    }
  };

  // Generate date range based on grouping
  const generateDateRange = (start, end, grouping) => {
    const dates = [];
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Set time based on grouping
    if (grouping !== "hour") {
      // Set time to beginning of day for non-hourly groupings
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999); // End of the day
    }

    if (grouping === "year") {
      // For yearly grouping
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();

      for (let year = startYear; year <= endYear; year++) {
        dates.push(year.toString());
      }
    } else if (grouping === "month") {
      // For monthly grouping
      const currentDate = new Date(startDate);
      // Set to the 1st day of month to ensure consistent month iteration
      currentDate.setDate(1);

      while (currentDate <= endDate) {
        const dateStr = formatDate(currentDate, "month");
        dates.push(dateStr);

        // Move to the first day of the next month
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    } else if (grouping === "hour") {
      // For hourly grouping
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = formatDate(currentDate, "hour");
        dates.push(dateStr);

        // Move to the next hour
        currentDate.setHours(currentDate.getHours() + 1);
      }
    } else {
      // For daily grouping
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = formatDate(currentDate, "day");
        dates.push(dateStr);

        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return dates;
  };

  useEffect(() => {
    const fetchData = async () => {
      const leadsSnapshot = await getDocs(collection(db, "employees"));
      const salesSnapshot = await getDocs(collection(db, "sales"));

      let leadsData = {};
      let salesData = {};
      let leadAmountData = {};
      let leadCostData = {};
      let leadsBySource = {};
      let salesBySource = {};
      const start = dateFrom.getTime();
      const end = dateTo.getTime();

      // For summary stats
      let totalLeads = 0;
      let totalSales = 0;
      let totalLeadAmount = 0;
      let totalLeadCost = 0;

      // Generate all dates between start and end based on grouping
      const dateRange = generateDateRange(dateFrom, dateTo, dateGrouping);

      // Collect leads, lead amounts, and lead costs
      leadsSnapshot.forEach((doc) => {
        const employeeLeads = doc.data().leads || [];
        employeeLeads.forEach((lead) => {
          const leadTime = lead.timestamp.seconds * 1000;
          if (leadTime >= start && leadTime <= end) {
            const leadSource = lead.leadSource || "Unknown";

            // Track total leads by source
            leadsBySource[leadSource] = (leadsBySource[leadSource] || 0) + 1;

            if (
              selectedLeadSource === "All" ||
              leadSource === selectedLeadSource
            ) {
              const dateStr = formatDate(new Date(leadTime), dateGrouping);
              leadsData[dateStr] = (leadsData[dateStr] || 0) + 1;

              // Increment total leads for summary stats
              totalLeads++;
              
              // Add lead amount to total
              totalLeadAmount += lead.leadAmount;

              // Sum lead amounts for each date
              leadAmountData[dateStr] =
                (leadAmountData[dateStr] || 0) + lead.leadAmount;

              // Calculate total lead cost (lead amount * lead cost)
              const leadCost = lead.leadAmount * lead.leadCost;
              totalLeadCost += leadCost;
              leadCostData[dateStr] = (leadCostData[dateStr] || 0) + leadCost;
            }
          }
        });
      });

      // Collect sales
      salesSnapshot.forEach((doc) => {
        const salesArray = doc.data().sales || [];
        salesArray.forEach((sale) => {
          const saleTime = new Date(sale.saleDate).getTime();
          if (saleTime >= start && saleTime <= end) {
            const leadSource = sale.leadSource?.trim() || "Unknown";

            // Track total sales by source
            salesBySource[leadSource] = (salesBySource[leadSource] || 0) + 1;

            if (
              selectedLeadSource === "All" ||
              leadSource === selectedLeadSource
            ) {
              const dateStr = formatDate(new Date(saleTime), dateGrouping);
              salesData[dateStr] = (salesData[dateStr] || 0) + 1;
              
              // Increment total sales for summary stats
              totalSales++;
            }
          }
        });
      });

      // Calculate summary stats
      const conversionRate = totalLeadAmount > 0 
        ? ((totalSales / totalLeadAmount) * 100).toFixed(2) 
        : 0;
      
      const costPerSale = totalSales > 0 
        ? (totalLeadCost / totalSales).toFixed(2) 
        : 0;

      // Update summary stats state
      setSummaryStats({
        totalLeads,
        totalSales,
        conversionRate,
        costPerSale
      });

      // Prepare series data for full date range
      const seriesDataLeads = dateRange.map((date) => leadsData[date] || 0);
      const seriesDataSales = dateRange.map((date) => salesData[date] || 0);
      const seriesDataConversionRate = dateRange.map((date) => {
        const leadAmount = leadAmountData[date] || 0;
        const sales = salesData[date] || 0;
        return leadAmount > 0 ? ((sales / leadAmount) * 100).toFixed(2) : 0;
      });
      const seriesDataCostPerSale = dateRange.map((date) => {
        const leadCost = leadCostData[date] || 0;
        const sales = salesData[date] || 0;
        return sales > 0 ? (leadCost / sales).toFixed(2) : 0;
      });

      // Find the maximum lead count for any individual date
      const maxLeadsPerDay = Math.max(
        ...Object.values(leadsData).map(Number),
        1
      );

      // Find the maximum sale count for any individual date
      const maxSalesPerDay = Math.max(
        ...Object.values(salesData).map(Number),
        1
      );

      // Find highest lead source count (which lead source has the most leads)
      const maxLeadsBySource = Math.max(
        ...Object.values(leadsBySource).map(Number),
        1
      );

      // Find highest sales source count
      const maxSalesBySource = Math.max(
        ...Object.values(salesBySource).map(Number),
        1
      );

      // Dynamic Y-axis for Total Leads
      const leadsMin = 0;
      const leadsMax = Math.max(maxLeadsPerDay, maxLeadsBySource) * 1.2; // Add 20% padding
      const leadsTickAmount = Math.min(
        10,
        Math.max(5, Math.ceil(leadsMax / 5))
      );

      // Dynamic Y-axis for Total Sales
      const salesMin = 0;
      const salesMax = Math.max(maxSalesPerDay, maxSalesBySource) * 1.2; // Add 20% padding
      const salesTickAmount = Math.min(
        10,
        Math.max(5, Math.ceil(salesMax / 5))
      );

      // Dynamic Y-axis for Cost Per Sale
      const costPerSaleValues = seriesDataCostPerSale
        .map(Number)
        .filter((val) => val > 0);
      const minCostPerSale = costPerSaleValues.length
        ? Math.min(...costPerSaleValues) * 0.8 // 20% lower padding
        : 0;
      const maxCostPerSale = costPerSaleValues.length
        ? Math.max(...costPerSaleValues) * 1.2 // 20% upper padding
        : 100;
      const costPerSaleTickAmount = Math.min(
        10,
        Math.max(5, Math.ceil((maxCostPerSale - minCostPerSale) / 5))
      );

      // Create display labels for x-axis
      const displayDates = dateRange.map((date) =>
        getDisplayFormat(date, dateGrouping)
      );

      // Get time range text for chart title
      let timeRangeText;
      if (timeRangeFilter !== "custom") {
        const option = timeRangeOptions.find(
          (opt) => opt.value === timeRangeFilter
        );
        timeRangeText = option ? option.label : "Custom Range";
      } else {
        timeRangeText = `${dateFrom.toLocaleDateString()} - ${dateTo.toLocaleDateString()}`;
      }

      setChartData((prevState) => ({
        ...prevState,
        series: [
          {
            name: "Total Leads",
            type: "column",
            data: seriesDataLeads,
          },
          {
            name: "Total Sales",
            type: "column",
            data: seriesDataSales,
          },
          {
            name: "Conversion Rate",
            type: "column",
            data: seriesDataConversionRate,
          },
          {
            name: "Cost Per Sale",
            type: "column",
            data: seriesDataCostPerSale,
          },
        ],
        options: {
          ...prevState.options,
          chart: {
            ...prevState.options.chart,
            toolbar: {
              show: true,
              tools: {
                download: true,
                selection: true,
                zoom: true,
                zoomout: true,
                pan: true,
                reset: true,
              },
              export: {
                csv: {
                  filename: `Sales_Analysis_${timeRangeText.replace(
                    / /g,
                    "_"
                  )}`,
                  columnDelimiter: ",",
                },
                svg: {
                  filename: `Sales_Analysis_${timeRangeText.replace(
                    / /g,
                    "_"
                  )}`,
                },
                png: {
                  filename: `Sales_Analysis_${timeRangeText.replace(
                    / /g,
                    "_"
                  )}`,
                },
              },
            },
          },
          title: {
            text: `Sales Leads Analysis - ${timeRangeText}`,
            align: "center",
            margin: 10,
            offsetY: 10,
            style: {
              fontSize: "18px",
              fontWeight: "bold",
              color: "#1f2937",
            },
          },
          subtitle: {
            text:
              selectedLeadSource !== "All"
                ? `Lead Source: ${selectedLeadSource}`
                : "All Lead Sources",
            align: "center",
            margin: 5,
            offsetY: 35,
            style: {
              fontSize: "14px",
              color: "#4b5563",
            },
          },
          xaxis: {
            ...prevState.options.xaxis,
            categories: displayDates,
            title: {
              ...prevState.options.xaxis.title,
              text: `Date (${
                dateGrouping === "hour" ? "hourly" : dateGrouping
              } view)`,
            },
          },
          yaxis: [
            {
              ...prevState.options.yaxis[0],
              min: leadsMin,
              max: leadsMax,
              tickAmount: leadsTickAmount,
              title: {
                ...prevState.options.yaxis[0].title,
                text: `Total Leads`,
              },
              labels: {
                ...prevState.options.yaxis[0].labels,
                formatter: (value) => Math.round(value),
              },
              // Adding specific grid styling for first y-axis
              axisBorder: {
                show: true,
                color: "#00c22a",
                width: 2,
              },
              axisTicks: {
                show: true,
                color: "#00c22a",
              },
            },
            {
              ...prevState.options.yaxis[1],
              min: salesMin,
              max: salesMax,
              tickAmount: salesTickAmount,
              title: {
                ...prevState.options.yaxis[1].title,
                text: `Total Sales`,
              },
              labels: {
                ...prevState.options.yaxis[1].labels,
                formatter: (value) => Math.round(value),
              },
              // Adding specific grid styling for second y-axis
              axisBorder: {
                show: true,
                color: "#0a99ff",
                width: 2,
              },
              axisTicks: {
                show: true,
                color: "#0a99ff",
              },
            },
            {
              ...prevState.options.yaxis[2],
              // Adding specific grid styling for third y-axis
              axisBorder: {
                show: true,
                color: "#FFC107",
                width: 2,
              },
              axisTicks: {
                show: true,
                color: "#FFC107",
              },
            },
            {
              ...prevState.options.yaxis[3],
              min: minCostPerSale,
              max: maxCostPerSale,
              tickAmount: costPerSaleTickAmount,
              // Adding specific grid styling for fourth y-axis
              axisBorder: {
                show: true,
                color: "#ff0008",
                width: 2,
              },
              axisTicks: {
                show: true,
                color: "#ff0008",
              },
            },
          ],
          grid: {
            show: true,
            borderColor: "#e5e7eb",
            strokeDashArray: 5,
            position: "back",
            xaxis: {
              lines: {
                show: true,
              },
            },
            yaxis: {
              lines: {
                show: true,
              },
            },
            padding: {
              right: 10,
              left: 10,
            },
          },
        },
      }));
    };
    fetchData();
  }, [dateFrom, dateTo, selectedLeadSource, dateGrouping]);

  // Handler for custom date inputs to reset time range filter
  const handleCustomDateChange = (date, isFrom) => {
    if (timeRangeFilter !== "custom") {
      setTimeRangeFilter("custom");
    }

    if (isFrom) {
      setDateFrom(new Date(date));
    } else {
      setDateTo(new Date(date));
    }
  };

  // Function to get the title for the stats section based on selected time range
  const getStatsTitle = () => {
    if (timeRangeFilter !== "custom") {
      const option = timeRangeOptions.find(opt => opt.value === timeRangeFilter);
      return `${option?.label || 'Custom'} Stats`;
    } else {
      return 'Custom Range Stats';
    }
  };