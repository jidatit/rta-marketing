import { useState } from "react";
import { Link } from "react-router-dom";

const SideBar = () => {
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
            className={`w-full text-white transition-all duration-300 ease-in-out ${
              activeItem === "Sales"
                ? "bg-white rounded-md shadow-lg text-blue-900"
                : ""
            }`}
            onClick={() => handleItemClick("Sales")}
          >
            <p className="w-full p-3 transition-all duration-300 ease-in-out rounded-md font-radios hover:bg-white hover:text-blue-900">
              Sales
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
