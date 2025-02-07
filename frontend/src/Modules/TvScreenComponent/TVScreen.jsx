import React, { useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { db } from "../../config/firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import logo from "../../images/rta-logo.png";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useSalesData } from "../../SalesDataContext";

const TVScreen = () => {
  const [SalesPersons, setSalesPersons] = useState(null);
  const [updatedSalesPerson, setUpdatedSalesPerson] = useState([]);
  const [sortedSalesPerson, setSortedSalesPerson] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalSalestarget, setTotalSalestarget] = useState(0);
  const [totalCompletedSales, setTotalCompletedSales] = useState(0);
  const [midMonthSales, setMidMonthSales] = useState(0);
  const [totalLeadsCount, setTotalLeads] = useState(0);
  const { salesData, loading, selectedMonth, setSelectedMonth } =
    useSalesData();

  // useEffect(() => {
  //   setSelectedMonth(() => {
  //     const today = new Date();
  //     return today.toISOString().slice(0, 7);
  //   });
  //   console.log(salesData);
  //   if (salesData?.length > 0) {
  //     // Compute total completed sales
  //     const totalSalesCount = salesData.reduce(
  //       (total, person) => total + (person.salesCompleted || 0),
  //       0
  //     );

  //     // Compute mid-month sales total (sales before or on the 15th)
  //     const midMonthSalesTotal = salesData.reduce(
  //       (total, person) => total + (person.midMonthSales || 0),
  //       0
  //     );

  //     setTotalCompletedSales(totalSalesCount);
  //     setMidMonthSales(midMonthSalesTotal);
  //   }
  // }, [salesData]);

  // useEffect(() => {
  //   console.log("salesData", salesData);
  //   if (salesData?.length > 0) {
  //     // Compute total target
  //     const totalTarget = salesData.reduce(
  //       (total, person) => total + (person.target || 0),
  //       0
  //     );

  //     // Compute total completed sales
  //     const totalSalesCount = salesData.reduce(
  //       (total, person) => total + (person.salesCompleted || 0),
  //       0
  //     );

  //     // Compute mid-month sales total
  //     const midMonthSalesTotal = salesData.reduce(
  //       (total, person) => total + (person.midMonth || 0),
  //       0
  //     );

  //     setTotalSales(totalTarget); // Store total target
  //     setTotalCompletedSales(totalSalesCount);
  //     setMidMonthSales(midMonthSalesTotal);
  //   }
  // }, [salesData]);

  useEffect(() => {
    setSelectedMonth(() => {
      const today = new Date();
      return today.toISOString().slice(0, 7);
    });
  }, []);
  useEffect(() => {
    // console.log("salesData", salesData);

    if (salesData?.length > 0) {
      // Compute total target
      const totalTarget = salesData.reduce((total, person, index) => {
        // console.log(`Loop ${index}: person.target =`, person.target);
        return total + (person.target || 0);
      }, 0);
      // console.log("Final totalTarget:", totalTarget);

      // Compute total completed sales
      const totalSalesCount = salesData.reduce((total, person, index) => {
        // console.log(
        //   `Loop ${index}: person.salesCompleted =`,
        //   person.salesCompleted
        // );
        return total + (person.salesCompleted || 0);
      }, 0);
      // console.log("Final totalSalesCount:", totalSalesCount);

      // Compute mid-month sales total
      const midMonthSalesTotal = salesData.reduce((total, person, index) => {
        // console.log(`Loop ${index}: person.midMonth =`, person.midMonth);
        return total + (person.midMonth || 0);
      }, 0);
      // console.log("Final midMonthSalesTotal:", midMonthSalesTotal);

      setTotalSalestarget(totalTarget); // Store total target
      setTotalCompletedSales(totalSalesCount);
      setMidMonthSales(midMonthSalesTotal);
    }
  }, [salesData]);

  // console.log("total completed sales", totalCompletedSales);
  // console.log("mid month sales", midMonthSales);
  // console.log("target", totalSales);

  const [leads, setLeads] = useState([]);

  const fetchSalesPerson = () => {
    try {
      const SalePersonsRef = collection(db, "employees");

      const q = query(SalePersonsRef, where("userType", "==", "Employee"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const results = [];
        querySnapshot.forEach((doc) => {
          const SalePerson = doc.data();
          const { password, ...rest } = SalePerson;
          results.push(rest);
        });

        setSalesPersons(results);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching Sale Persons: ", error);
      toast.error("Failed to fetch Sales Person: " + error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = fetchSalesPerson();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribeEmployees = setupEmployeesListener();
    return () => {
      unsubscribeEmployees && unsubscribeEmployees();
    };
  }, []);

  const setupEmployeesListener = () => {
    try {
      const employeesCollection = collection(db, "employees");
      return onSnapshot(
        employeesCollection,
        (querySnapshot) => {
          let totalLeadsCount = 0;
          const currentMonth = new Date().getMonth(); // Get current month (0-indexed)
          const currentYear = new Date().getFullYear(); // Get current year

          querySnapshot.forEach((doc) => {
            const employeeData = doc.data();
            const { leads } = employeeData;

            if (leads && Array.isArray(leads)) {
              const filteredLeads = leads.filter((lead) => {
                if (lead.timestamp) {
                  const leadDate = lead.timestamp.toDate(); // Convert Firestore timestamp to Date
                  return (
                    leadDate.getMonth() === currentMonth &&
                    leadDate.getFullYear() === currentYear
                  );
                }
                return false;
              });

              totalLeadsCount += filteredLeads.length; // Count only leads from the current month
            }
          });

          // console.log("Total leads for the current month:", totalLeadsCount);
          setTotalLeads(totalLeadsCount);
        },
        (error) => {
          console.error("Error in employees listener:", error);
          toast.error("Error loading employee data");
        }
      );
    } catch (error) {
      console.error("Error setting up employees listener:", error);
      return null;
    }
  };

  // console.log(totalLeadsCount);

  const fetchSales = () => {
    if (SalesPersons && SalesPersons?.length > 0) {
      const tempUpdatedSalesPerson = [...updatedSalesPerson];

      const currentMonth = new Date().getMonth(); // Get current month (0-indexed)
      // console.log("month", currentMonth);

      const unsubscribeList = SalesPersons.map((person, index) => {
        const salesRef = doc(db, "sales", person.uid);

        return onSnapshot(salesRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            let leadSource = "--";
            let sales = 0;
            let filteredSales = [];
            // console.log("person ", index, data);

            if (data?.sales?.length > 0) {
              // Filter sales by current month
              filteredSales = data.sales.filter((sale) => {
                if (!sale.saleDate) return false;
                const saleDate = new Date(sale.saleDate);
                // console.log(sale);
                // console.log("get month", saleDate.getMonth());
                return saleDate.getMonth() === currentMonth;
              });

              const leadSourceTemp = filteredSales.map(
                (sale) => sale.leadSource
              );
              leadSource = [...new Set(leadSourceTemp)].join(",");
              sales = filteredSales.length;
            }

            tempUpdatedSalesPerson[index] = {
              ...person,
              leadSource: leadSource,
              totalSales: sales,
              sales: filteredSales || [], // Use filtered sales
            };
          } else {
            tempUpdatedSalesPerson[index] = {
              ...person,
              leadSource: "--",
              totalSales: 0,
              sales: [],
            };
          }

          setUpdatedSalesPerson([...tempUpdatedSalesPerson]);
        });
      });

      return () => {
        unsubscribeList.forEach((unsubscribe) => unsubscribe());
      };
    }
  };

  useEffect(() => {
    const unsubscribe = fetchSales();
    return unsubscribe;
  }, [SalesPersons]);

  useEffect(() => {
    if (updatedSalesPerson.length > 0 && salesData.length > 0) {
      const mergedSalesPersons = updatedSalesPerson.map((person) => {
        const matchingSalesData = salesData.find(
          (sale) => sale.userId === person.uid
        );

        return {
          ...person,
          midMonthSales: matchingSalesData ? matchingSalesData.midMonth : 0,
          salesCompleted: matchingSalesData
            ? matchingSalesData.salesCompleted
            : 0,
          target: matchingSalesData ? matchingSalesData.target : 0,
        };
      });

      // Sort based on total sales
      const sortedSalesPersons = mergedSalesPersons.sort(
        (a, b) => b.totalSales - a.totalSales
      );

      setSortedSalesPerson(sortedSalesPersons);
      const totalSalesCount = mergedSalesPersons.reduce((total, person) => {
        return total + (person?.totalSales || 0);
      }, 0);

      setTotalSales(totalSalesCount);
    }
  }, [updatedSalesPerson, salesData]);

  // console.log("sorted", sortedSalesPerson);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "leads"),
      (snapshot) => {
        const fetchedLeads = snapshot.docs.map((doc) => doc.data().leadName);
        setLeads(fetchedLeads);
      },
      (error) => {
        console.error("Error fetching leads: ", error);
        toast.error("Failed to fetch leads: " + error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  function getFormattedDate() {
    const date = new Date();

    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();

    const suffix = (day) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${day}${suffix(day)} ${month}, ${year}`;
  }

  // console.log(totalSales);

  if (!SalesPersons) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div className=" min-h-screen  w-full  px-12 mx-auto">
        <header className="flex justify-between items-top pt-6 pb-2">
          <div className=" flex  gap-8  items-center justify-center">
            <Link to="/">
              <img src={logo} className="max-w-[220px]" />
            </Link>
            <p className="text-2xl font-bold">
              People we have helped this month
            </p>
          </div>
          <div className="flex items-center gap-5 mb-5 ">
            <div className="text-xl font-bold ">{getFormattedDate()}</div>
            <div className="flex justify-end gap-5">
              <StatButton
                label={`${midMonthSales}/${Math.ceil(totalSalestarget / 2)}`}
                duration="Mid-Month"
                color="bg-[#003160]"
              />
              <StatButton
                label={`${totalCompletedSales}/${totalSalestarget}`}
                duration="End-Month"
                color="bg-[#1FABFA]"
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-4 gap-3 mb-8  max-w-[1500px] ">
          <InfoCard
            title="Total Leads"
            value={totalLeadsCount}
            src="icon-1.png"
          />
          {/* <InfoCard
            title="Lead Sources"
            value={leads.length}
            src="icon-3.png"
            delegate={leads}
          /> */}
          <InfoCard title="Total Sales" value={totalSales} src="icon-2.png" />
          <InfoCard title="Conversion Rate" value="21%" src="icon-4.png" />
        </div>

        {/* People Grid */}
        <div className="masonry">
          {sortedSalesPerson && sortedSalesPerson?.length > 0 ? (
            sortedSalesPerson.map((person) => {
              return (
                <PersonCard
                  name={person?.name}
                  uid={person?.uid}
                  sales={person?.sales}
                  key={person?.uid}
                  target={person?.target}
                  salesCompleted={person?.salesCompleted}
                  midMonthSales={person?.midMonthSales}
                />
              );
            })
          ) : !SalesPersons ? (
            <div className="flex items-center justify-center w-full h-full">
              Loading...
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ title, value, src, delegate = null }) => {
  let leadSources = "";
  if (delegate) {
    leadSources = delegate.join(",");
  }

  return (
    <div className="bg-white rounded-lg shadow-custom-drop flex items-center  py-4  px-6 justify-between  max-w-[400px]">
      <div className="text-xl font-bold ">{title}</div>
      <div className="text-xl  font-bold">
        {value}
        {/* {delegate ? (
          <span className="text-sm font-normal w-full block truncate">
            ({leadSources})
          </span>
        ) : null} */}
      </div>
    </div>
  );
};

const StatButton = ({ label, color, duration }) => (
  <button
    className={` text-white flex  gap-2   justify-center items-center px-5 py-3 rounded-lg font-bold ${color}`}
  >
    <p className="text-xl "> {label}</p>
    <span className="text-xl">{duration}</span>
  </button>
);

const ClientCard = ({
  name,
  company,
  grossProfit,
  leadSource,
  InsuranceStatus,
  FundStatus,
  vehicleModel,
}) => {
  const [limit, setLimit] = useState([]);
  React.useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "SalesLimit"));
      const fetchedLimits = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        limit: doc.data().limit,
      }));

      setLimit(fetchedLimits);
    } catch (error) {
      console.error("Error fetching leads: ", error);
      toast.error("Failed to fetch leads: " + error.message);
    }
  };
  // console.log(name, grossProfit);
  let color = "";

  if (FundStatus && InsuranceStatus) {
    color = "#10C900";
  } else if (InsuranceStatus && !FundStatus) {
    // console.log(
    //   "InsuranceStatus && !FundStatus",
    //   name,
    //   InsuranceStatus,
    //   FundStatus
    // );
    color = "#0E376C";
  } else {
    color = "#6636C0";
  }

  return (
    <div
      className={`p-2 rounded-lg shadow-md bg-[${color}] w-full max-w-[185px] xl:max-w-none  text-white flex justify-between items-center flex-col `}
    >
      <div className="flex items-center justify-between gap-4 w-full p-1">
        <h3 className="font-semibold">{name}</h3>

        {grossProfit >= Number(limit[0]?.limit) ? <FaCircleCheck /> : null}
      </div>

      <div className="fle flex-col gap-4 w-full p-1">
        <p className="text-sm">
          {company} {vehicleModel}
        </p>

        <div className="w-full">
          <p className="text-sm w-full text-end">{leadSource}</p>
        </div>
      </div>
    </div>
  );
};

const PersonCard = ({
  name,
  uid,
  sales,
  target,
  salesCompleted,
  midMonthSales,
}) => {
  // console.log("Sales From Person Card", name, sales);

  return (
    <div className="bg-white p-4 rounded-lg  border border-[#989898]  m-1 shadow-lg w-full max-w-[650px] h-fit  overflow-auto masonry-item ">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold mb-4">{name}</h2>

        <div className="flex justify-end space-x-2 mb-4">
          <button className="px-4 py-2 bg-[#003160] text-white rounded-lg">
            {midMonthSales}/{Math.ceil(target / 2)} Mid - Month
          </button>
          <button className="px-4 py-2 bg-[#1FABFA] text-white rounded-lg">
            {salesCompleted}/{target} End - Month
          </button>
        </div>
      </div>

      <div className="grid masonry-2 gap-4 ">
        {sales && sales.length > 0 ? (
          sales.map((sale, idx) => (
            <ClientCard
              key={idx}
              name={sale.customerName}
              company={sale.vehicleMake}
              vehicleModel={sale.vehicleModel}
              leadSource={sale.leadSource}
              FundStatus={sale.FundStatus}
              InsuranceStatus={sale.InsuranceStatus}
              grossProfit={sale.grossProfit}
            />
          ))
        ) : (
          <div className="flex items-center justify-center w-full h-full col-span-4 row-span-4">
            No sales yet
          </div>
        )}
      </div>
    </div>
  );
};

export default TVScreen;
