import { useState } from "react";
import { Link } from "react-router-dom";
import "../index.css";

const AdminSidebar = () => {
  const [activeItem, setActiveItem] = useState("Sales");

  const handleItemClick = (item) => {
    setActiveItem(item);
  };

  return (
    <div className="bg-[#071b52] h-full w-full">
      <div className="flex flex-col items-center justify-start w-full h-full px-5 py-5 gap-y-10">
        <div className="flex w-full">
          <h1 className="text-2xl font-bold text-white">Logo</h1>
        </div>
        <div className="flex flex-col w-full gap-y-4">
          <Link
            to=""
            className={`w-full transition-all duration-300 ease-in-out rounded-md ${
              activeItem === "Sales"
                ? "bg-white rounded-md shadow-lg"
                : "hover:bg-white rounded-md hover:text-blue-900"
            }`}
            onClick={() => handleItemClick("Sales")}
          >
            <p
              className={`w-full p-3 rounded-md font-radios hover:bg-white hover:text-blue-900 ${
                activeItem === "Sales" ? "text-blue-800" : "text-white"
              }`}
            >
              Sales
            </p>
          </Link>
          <Link
            to="users"
            className={`w-full transition-all duration-300 ease-in-out rounded-md ${
              activeItem === "Users"
                ? "bg-white rounded-md shadow-lg"
                : "hover:bg-white rounded-md hover:text-blue-900"
            }`}
            onClick={() => handleItemClick("Users")}
          >
            <p
              className={`w-full p-3 rounded-md font-radios hover:bg-white hover:text-blue-900 ${
                activeItem === "Users" ? "text-blue-800" : "text-white"
              }`}
            >
              Users
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
