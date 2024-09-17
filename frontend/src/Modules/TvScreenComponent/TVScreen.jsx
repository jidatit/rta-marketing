import React, { useEffect, useState } from "react";
import { FaCheck, FaFacebookF } from "react-icons/fa6";
import { db } from "../../config/firebaseConfig";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";

const TVScreen = () => {
  const [SalesPersons, setSalesPersons] = useState(null);
  const [updatedSalesPerson, setUpdatedSalesPerson] = useState([]);
  const [sortedSalesPerson, setSortedSalesPerson] = useState([]);
  const [totalSales, setTotalSales] = useState(0);

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

  const fetchSales = () => {
    if (SalesPersons && SalesPersons?.length > 0) {
      const tempUpdatedSalesPerson = [...updatedSalesPerson];

      const unsubscribeList = SalesPersons.map((person, index) => {
        const salesRef = doc(db, "sales", person.uid);

        return onSnapshot(salesRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            let leadSource = "--";
            let sales = 0;

            if (data?.sales?.length > 0) {
              const leadSourceTemp = data.sales.map((sale) => sale.leadSource);
              leadSource = [...new Set(leadSourceTemp)].join(",");
              sales = data.sales.length;
            }

            tempUpdatedSalesPerson[index] = {
              ...person,
              leadSource: leadSource,
              totalSales: sales,
              sales: data?.sales || [],
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

  console.log(SalesPersons);
  console.log(updatedSalesPerson);

  useEffect(() => {
    if (updatedSalesPerson.length > 0) {
      const sortedSalesPersons = updatedSalesPerson.sort(
        (a, b) => b.totalSales - a.totalSales
      );
      setSortedSalesPerson(sortedSalesPersons);
      const totalSalesCount = updatedSalesPerson.reduce(
        (total, person) => total + person.totalSales,
        0
      );
      setTotalSales(totalSalesCount);
    }
  }, [updatedSalesPerson]);

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
        <header className="flex justify-between items-top py-6">
          <div className=" flex items-start flex-col justify-center">
            <div className="text-3xl font-extrabold">Logo</div>
            <p className="text-2xl font-bold mt-10">
              People we have helped this month
            </p>
          </div>
          <div className="flex items-center gap-5 ">
            <div className="text-2xl font-bold ">{getFormattedDate()}</div>
            <div className="flex justify-end mb-8 gap-5">
              <StatButton
                label="22/20"
                duration="Mid-Month"
                color="bg-[#003160]"
              />
              <StatButton
                label="22/40 "
                duration="End-Month"
                color="bg-[#1FABFA]"
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-4 gap-8 mb-8  w-[100%] ">
          <InfoCard title="Total Leads" value="78" src="icon-1.png" />
          <InfoCard
            title="Lead Sources"
            value={leads.length}
            src="icon-3.png"
            delegate={leads}
          />
          <InfoCard title="Total Sales" value={totalSales} src="icon-2.png" />
          <InfoCard title="Conversion Rate" value="21%" src="icon-4.png" />
        </div>

        {/* People Grid */}
        <div className="masonry">
          {sortedSalesPerson && sortedSalesPerson?.length > 0 ? (
            sortedSalesPerson.map((person) => {
              return (
                <PersonCard
                  name={person.name}
                  uid={person.uid}
                  sales={person.sales}
                  key={person.uid}
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
    <div className="bg-white p-6 rounded-lg shadow-custom-drop flex items-center space-x-4 justify-between ">
      <div className=" h-full pt-7 w-[60%]">
        <div className="text-2xl font-bold ">{title}</div>
        <div className="text-4xl mt-5 ">
          {value}
          {delegate ? (
            <span className="text-lg font-normal max-w-xs block truncate">
              ({leadSources})
            </span>
          ) : null}
        </div>
      </div>
      <div className="text-4xl ">
        <img src={src} className="w-28" />
      </div>
    </div>
  );
};

const StatButton = ({ label, color, duration }) => (
  <button
    className={` text-white flex  w-32 h-32 justify-center items-center flex-col rounded-full font-bold ${color}`}
  >
    <p className="text-xl "> {label}</p>
    <span className="text-md">{duration}</span>
  </button>
);

const ClientCard = ({ name, company, color, leadSource }) => (
  <div
    className={`p-2 rounded-lg shadow-md ${color} text-white flex justify-between items-center flex-col`}
  >
    <div className="flex items-start justify-between gap-4 w-full p-1">
      <h3 className="font-semibold">{name}</h3>
    </div>

    <div className="flex items-start justify-between gap-4 w-full p-1">
      <p className="text-sm">{company}</p>

      <div>
        <p className="text-sm ">{leadSource}</p>
      </div>
    </div>
  </div>
);

const PersonCard = ({ name, uid, sales }) => {
  console.log("Sales From Person Card", name, sales);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-[#D9D9D9]  max-h-[441px] overflow-auto masonry-item">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold mb-4">{name}</h2>

        <div className="flex justify-end space-x-2 mb-4">
          <button className="px-4 py-2 bg-[#003160] text-white rounded-lg">
            22/20 Mid - Month
          </button>
          <button className="px-4 py-2 bg-[#1FABFA] text-white rounded-lg">
            22/40 End - Month
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 ">
        {sales && sales.length > 0 ? (
          sales.map((sale, idx) => (
            <ClientCard
              key={idx}
              name={sale.customerName}
              company={sale.vehicleMake}
              leadSource={sale.leadSource}
              color={"bg-[#0E376C]"}
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
