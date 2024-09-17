import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  deleteField,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../config/firebaseConfig";
import { FaSearch, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { toast } from "react-toastify";

const AllUsersPage = () => {
  const [loading, setLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [virtualAssistants, setVirtualAssistant] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [currentPage, setCurrentPage] = useState(1);
  const apiUrl = import.meta.env.VITE_BLOCK_USER_API || "https://rta-marketing.onrender.com";

  const fetchUsers = async () => {
    const employeesRef = collection(db, "employees");
    const virtualAssistantRef = collection(db, "virtual-assistants");
    try {
      setLoading(true);

      const employeesSnap = await getDocs(employeesRef);
      const employeeList = employeesSnap.docs.map((doc) => {
        const data = doc.data();
        delete data.password;
        return {
          id: doc.id,
          ...data,
        };
      });
      setEmployees(employeeList);

      const virtualAssistantSnap = await getDocs(virtualAssistantRef);
      const virtualAssistantList = virtualAssistantSnap.docs.map((doc) => {
        const data = doc.data();
        delete data.password;
        return {
          id: doc.id,
          ...data,
        };
      });
      setVirtualAssistant(virtualAssistantList);

      const combinedUsers = [...employeeList, ...virtualAssistantList];
      setAllUsers(combinedUsers);
      setFilteredUsers(combinedUsers);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = allUsers.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchQuery, allUsers]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleBlockUser = async (uid, userType) => {
    setBlockLoading(uid);

    try {
      const response = await fetch(`${apiUrl}/disableUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });

      if (!response.ok) {
        throw new Error("Failed to block user");
      }

      // If userType exists, proceed to update Firestore

      const userTypeCollectionRef =
        userType === "Virtual Assistant" ? "virtual-assistants" : "employees";

      // Query for the document with the given uid
      const q = query(
        collection(db, userTypeCollectionRef),
        where("uid", "==", uid)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Update all matching documents
        querySnapshot.forEach(async (docSnapshot) => {
          const userDocRef = docSnapshot.ref;
          await updateDoc(userDocRef, {
            userStatus: "blocked",
          });
        });
      } else {
        toast.error("No matching document found for the given UID");
      }

      // Update UI (you can refetch users or update state here)
      const updatedUsers = allUsers.map((user) =>
        user.uid === uid ? { ...user, userStatus: "blocked" } : user
      );
      setAllUsers(updatedUsers);
      setFilteredUsers(updatedUsers);

      toast.success("User blocked successfully");
    } catch (error) {
      console.error("Error blocking user: ", error);
    }
    setBlockLoading(null);
  };

  const handleUnblockUser = async (uid, userType) => {
    setBlockLoading(uid);
    try {
      const response = await fetch(`${apiUrl}/enableUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });

      if (!response.ok) {
        throw new Error("Failed to unblock user 2");
      }

      const userTypeCollectionRef =
        userType === "Virtual Assistant" ? "virtual-assistants" : "employees";

      const q = query(
        collection(db, userTypeCollectionRef),
        where("uid", "==", uid)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (docSnapshot) => {
          const userDocRef = docSnapshot.ref;
          await updateDoc(userDocRef, {
            userStatus: deleteField(),
          });
        });
      } else {
        toast.error("No matching document found for the given UID");
      }

      // Update the UI
      const updatedUsers = allUsers.map((user) =>
        user.uid === uid ? { ...user, userStatus: "active" } : user
      );
      setAllUsers(updatedUsers);
      setFilteredUsers(updatedUsers);

      toast.success("User Unblocked");
    } catch (error) {
      console.error("Error unblocking user: ", error);
    }
    setBlockLoading(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex items-start justify-start w-full h-full px-12 py-8 overflow-y-auto">
        <div className="flex flex-col w-full h-full gap-y-8">
          <div className="text-[24px] pt-4 font-bold">All Users</div>
          <div className="relative p-2 bg-white shadow-lg sm:rounded-lg">
            <div className="flex justify-end p-3">
              <div className="relative">
                <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  className="w-full pl-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0E376C]"
                  placeholder="Search User"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <table className="w-full text-sm text-left text-black font-radios">
              <thead className="w-full text-sm text-gray-700 uppercase bg-gray-50 dark:bg-[#003160] dark:text-white rounded-t-md">
                <tr>
                  <th scope="col" className="px-4 py-4 rounded-tl-md">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-4">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-4">
                    User Type
                  </th>
                  <th scope="col" className="px-4 py-4">
                    Date Joined
                  </th>
                  <th scope="col" className="px-4 py-4 rounded-tr-md">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="border-t-0 border-gray-300 border-1">
                {currentUsers.length > 0 ? (
                  currentUsers.map((user, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b dark:bg-white dark:border-gray-300"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-black">
                        {user.name}
                      </td>
                      <td className="px-4 py-4 text-gray-900">{user.email}</td>
                      <td className="px-4 py-4 text-gray-900">
                        {user.userType}
                      </td>
                      <td className="px-4 py-4 text-gray-900">
                        {user.dateCreated instanceof Object &&
                        user.dateCreated.seconds
                          ? new Date(
                              user.dateCreated.seconds * 1000
                            ).toLocaleDateString()
                          : user.dateCreated}
                      </td>

                      <td className="flex px-4 py-4 ">
                        {blockLoading === user.uid ? (
                          <button
                            className="w-[70%] p-2.5 text-white bg-red-500 rounded-lg"
                            onClick={() => handleUnblockUser(user.uid)}
                          >
                            processing...
                          </button>
                        ) : user.userStatus === "blocked" ? (
                          <button
                            className="w-[70%] p-2.5 text-white bg-[#1a9346] rounded-lg"
                            onClick={() => handleUnblockUser(user.uid)}
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            className="w-[70%] p-2.5 text-white bg-red-500 rounded-lg"
                            onClick={() => handleBlockUser(user.uid)}
                          >
                            Block user
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="100%" className="w-full p-2 text-center">
                      No users data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
              <div>
                <label
                  htmlFor="rows-per-page"
                  className="p-3 mr-2 text-white bg-[#003160] rounded-lg font-radios"
                >
                  Rows per page:
                </label>
                <select
                  id="rows-per-page"
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="px-6 py-3 border-gray-300 rounded-md border-1"
                >
                  <option value={5}>5 per page</option>
                  <option value={7}>7 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={15}>15 per page</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 border rounded-l-lg flex items-center space-x-1 ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-800"
                  }`}
                >
                  <FaArrowLeft />
                </button>
                <span className="px-4 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 border rounded-r-lg flex items-center space-x-1 ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-800"
                  }`}
                >
                  <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllUsersPage;
