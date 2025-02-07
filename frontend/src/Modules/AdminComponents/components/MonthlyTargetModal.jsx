import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";

const MonthlyTargetModal = ({ setShowModal, fetchData }) => {
  const [salesPerson, setSalesPerson] = useState("");
  const [salesPersonId, setSalesPersonId] = useState("");
  const [uploading, setUploading] = useState(false);
  // console.log("selected id", salesPersonId);

  const [month, setMonth] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7);
  });
  const [targetAmount, setTargetAmount] = useState(0);
  const [employees, setEmployees] = useState([]);
  // console.log(employees);
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "employees"));
        const employeeList = querySnapshot.docs.map((doc) => ({
          name: doc.data().name,
          id: doc.data().uid,
        }));
        setEmployees(employeeList);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  // const handleAddTarget = async () => {
  //   if (!salesPersonId || !targetAmount) {
  //     alert("Please select a salesperson and enter a valid target amount.");
  //     return;
  //   }
  //   setUploading(true);

  //   try {
  //     const monthRef = doc(db, "monthlyTargets", month);
  //     const monthDoc = await getDoc(monthRef);

  //     let newData = {
  //       target: targetAmount,
  //       updatedAt: serverTimestamp(),
  //     };

  //     if (!monthDoc.exists()) {
  //       // If the month document doesn't exist, create it
  //       await setDoc(monthRef, {
  //         [salesPersonId]: {
  //           ...newData,
  //           createdAt: serverTimestamp(),
  //         },
  //       });
  //     } else {
  //       // If the month document exists, update the target for the salesperson
  //       await setDoc(
  //         monthRef,
  //         {
  //           [salesPersonId]: {
  //             ...newData,
  //             createdAt:
  //               monthDoc.data()?.[salesPersonId]?.createdAt ||
  //               serverTimestamp(),
  //           },
  //         },
  //         { merge: true }
  //       );
  //     }

  //     console.log("Target successfully set for", salesPerson);
  //     setShowModal(false);
  //     setUploading(false);
  //   } catch (error) {
  //     console.error("Error setting target:", error);
  //     setUploading(false);
  //   }
  // };

  const handleAddTarget = async () => {
    if (!salesPersonId || !salesPerson || !targetAmount) {
      alert("Please select a salesperson and enter a valid target amount.");
      return;
    }
    setUploading(true);

    try {
      const monthRef = doc(db, "monthlyTargets", month);
      const monthDoc = await getDoc(monthRef);

      let newData = {
        name: salesPerson, // Store the salesperson's name
        target: targetAmount,
        updatedAt: serverTimestamp(),
      };

      if (!monthDoc.exists()) {
        // If the month document doesn't exist, create it
        await setDoc(monthRef, {
          [salesPersonId]: {
            ...newData,
            createdAt: serverTimestamp(),
          },
        });
      } else {
        // If the month document exists, update the target for the salesperson
        await setDoc(
          monthRef,
          {
            [salesPersonId]: {
              ...newData,
              createdAt:
                monthDoc.data()?.[salesPersonId]?.createdAt ||
                serverTimestamp(),
            },
          },
          { merge: true }
        );
      }

      // console.log("Target successfully set for", salesPerson);
      setShowModal(false);
      setUploading(false);
      fetchData();
    } catch (error) {
      console.error("Error setting target:", error);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-full overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="relative w-full max-w-[1024px] mx-auto ">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none pt-[90px] pb-[70px] pl-[103px] pr-[135px] z-10">
          {/* Header */}
          <button
            onClick={() => setShowModal(false)}
            className="hover:bg-gray-100 p-1 rounded-full absolute   right-[30px] top-[41px]"
          >
            <IoMdClose size={24} />
          </button>
          <div className="flex items-center justify-start mb-8">
            <h1 className="text-[26px] font-semibold">Monthly Target</h1>
          </div>

          {/* Body */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-2xl mb-2">Sales Person</label>
                <select
                  className="w-full p-3 border rounded-lg h-[57px] bg-white text-gray-600"
                  value={salesPersonId}
                  onChange={(e) => {
                    const selectedEmployee = employees.find(
                      (emp) => emp.id === e.target.value
                    );
                    setSalesPerson(selectedEmployee?.name || "");
                    setSalesPersonId(selectedEmployee?.id || "");
                  }}
                >
                  <option value="">Select Sales Person</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-2xl mb-2">Select Month</label>
                <input
                  type="month"
                  className="w-full p-3 border rounded-lg h-[57px] bg-white text-gray-600"
                  value={month}
                  placeholder="select months"
                  onChange={(e) => setMonth(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-2xl mb-2">Target Amount</label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full p-3 border rounded-lg pr-16 h-[57px]"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(Number(e.target.value))}
                  placeholder="Enter target amount"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    onClick={() => setTargetAmount(targetAmount - 1)}
                    className="hover:bg-gray-100 p-1 rounded-full"
                  >
                    <FaMinusCircle className="text-red-500 text-lg" />
                  </button>
                  <button
                    onClick={() => setTargetAmount(targetAmount + 1)}
                    className="hover:bg-gray-100 p-1 rounded-full"
                  >
                    <FaPlusCircle className="text-green-500 text-lg" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end">
            <button
              className="bg-blue-900 text-white px-6 py-2 rounded-lg text-2xl font-medium hover:bg-blue-800 mt-[50px] transition-colors"
              onClick={handleAddTarget}
              disabled={uploading}
            >
              {uploading ? "Adding..." : "Add Target"}
            </button>
          </div>
        </div>
      </div>
      <div className="fixed inset-0 bg-black opacity-25"></div>
    </div>
  );
};

export default MonthlyTargetModal;
