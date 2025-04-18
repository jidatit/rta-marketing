import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../../images/rta-logo.png";

const SideBarVA = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("");

  // Update the active item based on the pathname
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("leads")) {
      setActiveItem("Leads");
    } else if (path.includes("sales")) {
      setActiveItem("sales");
    } else if (path.includes("tv")) {
      setActiveItem("tv");
    }
  }, [location]);

  const handleItemClick = (item) => {
    setActiveItem(item);
  };

  const getLinkClasses = (item) => {
    return `w-full transition-all duration-300 ease-in-out rounded-md ${
      activeItem === item
        ? "bg-white shadow-lg text-blue-800"
        : "hover:bg-white hover:text-blue-900"
    }`;
  };

  const getTextClasses = (item) => {
    return `w-full p-3 rounded-md font-radios ${
      activeItem === item ? "text-blue-800" : "text-white"
    }`;
  };

  return (
    <div className="bg-[#011c64] h-full w-full">
      <div className="flex flex-col items-center justify-start w-full h-full px-5 py-5 gap-y-10">
        <div className="flex w-full justify-center bg-white py-2 rounded-lg">
          <img src={logo} className="max-w-[160px]" alt="Logo" />
        </div>
        <div className="flex flex-col w-full gap-y-4">
          <Link
            to="/virtualAssistantLayout/leads"
            className={getLinkClasses("Leads")}
            onClick={() => handleItemClick("Leads")}
            aria-current={activeItem === "Leads" ? "page" : undefined}
          >
            <p className={getTextClasses("Leads")}>Leads</p>
          </Link>
          <Link
            to="/virtualAssistantLayout/sales"
            className={getLinkClasses("sales")}
            onClick={() => handleItemClick("sales")}
            aria-current={activeItem === "sales" ? "page" : undefined}
          >
            <p className={getTextClasses("sales")}>Sales</p>
          </Link>
          <Link
            to="/tv"
            className={getLinkClasses("tv")}
            onClick={() => handleItemClick("tv")}
            aria-current={activeItem === "tv" ? "page" : undefined}
          >
            <p className={getTextClasses("tv")}>TV Screen</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SideBarVA;
