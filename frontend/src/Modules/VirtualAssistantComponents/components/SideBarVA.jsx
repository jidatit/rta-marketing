import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../../images/rta-logo.png";

const SideBarVA = () => {
  const [activeItem, setActiveItem] = useState("Leads");

  const handleItemClick = (item) => {
    setActiveItem(item);
  };
  return (
    <div className="bg-[#011c64] h-full w-full">
      <div className="flex flex-col items-center justify-start w-full h-full px-5 py-5 gap-y-10">
        <div className="flex w-full justify-center bg-white py-2 rounded-lg">
          <img src={logo} className="max-w-[160px]" />
        </div>
        <div className="flex flex-col w-full gap-y-4">
          <Link
            to="/virtualAssistantLayout/leads"
            className={`w-full transition-all duration-300 ease-in-out rounded-md ${
              activeItem === "Leads"
                ? "bg-white rounded-md shadow-lg"
                : "hover:bg-white rounded-md hover:text-blue-900"
            }`}
            onClick={() => handleItemClick("Leads")}
          >
            <p
              className={`w-full p-3 rounded-md font-radios hover:bg-white hover:text-blue-900 ${
                activeItem === "Leads" ? "text-blue-800" : "text-white"
              }`}
            >
              Leads
            </p>
          </Link>
          <Link
            to="/tv"
            className={`w-full transition-all duration-300 ease-in-out rounded-md ${
              activeItem === "tv"
                ? "bg-white rounded-md shadow-lg"
                : "hover:bg-white rounded-md hover:text-blue-900"
            }`}
            onClick={() => handleItemClick("tv")}
          >
            <p
              className={`w-full p-3 rounded-md font-radios hover:bg-white hover:text-blue-900 ${
                activeItem === "tv" ? "text-blue-800" : "text-white"
              }`}
            >
              TV Screen
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SideBarVA;
