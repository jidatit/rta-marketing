import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

const SalesPage = () => {
  const [dataLoading, setDataLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setDataLoading(true);
    const fetchLeads = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "sales"));
        console.log(querySnapshot);
        // const fetchedSales = querySnapshot.docs.map(
        //   doc =>{

        // );
        setDataLoading(false);
      } catch (error) {
        console.error("Error fetching leads: ", error);
        toast.error("Failed to fetch leads: " + error.message);
      }
    };

    fetchLeads();
  }, []);
  return (
    <div className="w-full h-full p-10">
      <div>
        <h1 className="text-[20px] font-semibold ">Sales</h1>

        <div className="overflow-x-auto bg-white w-full h-full p-2 rounded-md shadow-[0_0_50px_0_rgba(88,88,88,0.25)] mt-4">
          <table className="min-w-full bg-white overflow-hidden rounded-md">
            <thead>
              <tr className="bg-[#1FABFA] text-white ">
                <th className="py-2 px-4">Client Name</th>
                <th className="py-2 px-4">Car Name</th>
                <th className="py-2 px-4">Sale Date</th>
                <th className="py-2 px-4">Sales Person</th>
                <th className="py-2 px-4">Insurance Status</th>
                <th className="py-2 px-4">Car Funded Status</th>
                <th className="py-2 px-4"></th>
              </tr>
            </thead>
            {!dataLoading ? (
              <tbody className="text-[10px]">
                {data.map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{row.clientName}</td>
                    <td className="py-2 px-4">{row.carName}</td>
                    <td className="py-2 px-4">{row.saleDate}</td>
                    <td className="py-2 px-4">{row.salesPerson}</td>
                    <td className="py-2 px-4 ">
                      <div className="flex items-center justify-center">
                        <span
                          className={`${
                            row.insuranceCompleted
                              ? "text-green-500"
                              : "text-red-500"
                          } text-2xl  p-1 `}
                        >
                          ●
                        </span>{" "}
                        {row.insuranceStatus}
                      </div>
                    </td>

                    <td className="py-2 px-4 ">
                      <div className="flex items-center justify-center">
                        <span
                          className={`${
                            row.carFunded ? "text-green-500" : "text-red-500"
                          } text-2xl p-1 `}
                        >
                          ●
                        </span>{" "}
                        {row.carFundedStatus}
                      </div>
                    </td>
                    <td className="py-2 px-4 ">
                      <div className="flex items-center justify-center">
                        <button className="bg-[#0E376C] text-white py-2 px-3 rounded-md mr-2 text-[12px] font-medium">
                          View Details
                        </button>
                        <button className="bg-[#DA0000] text-white py-2 px-3 rounded-md text-[12px] font-medium">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <div>Loading...</div>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
