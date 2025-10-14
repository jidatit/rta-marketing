import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../../index.css";
import logo from "../../images/rta-logo.png";
import { useSalesCounts } from "../../SalesContext";

const AdminSidebar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("");
  const { withReportHistory, statusCount } = useSalesCounts();

  const menuItems = [
    {
      name: "Sales",
      route: "/",
      matcher: (route) => route === "/AdminLayout",
    },
    {
      name: "Users",
      route: "users",
      matcher: (route) => route === "/AdminLayout/users",
    },
    {
      name: "TV Screen",
      route: "/tv",
      matcher: (route) => route === "/tv",
    },
    {
      name: "Salespeople",
      route: "SalesPersons",
      matcher: (route) => route === "/AdminLayout/SalesPersons",
    },
    {
      name: "Monthly Target",
      route: "monthly-target",
      matcher: (route) => route === "/AdminLayout/monthly-target",
    },
    {
      name: "Leads",
      route: "leads",
      matcher: (route) => route === "/AdminLayout/leads",
    },
    {
      name: "Analytics",
      route: "graphs",
      matcher: (route) => route === "/AdminLayout/graphs",
    },
    {
      name: "Monthly Analytics",
      route: "monthlyAnalytics",
      matcher: (route) => route === "/AdminLayout/monthlyAnalytics",
    },
    {
      name: "Commission Sheet",
      route: "comission",
      matcher: (route) => route === "/AdminLayout/comission",
    },
    {
      name: "Dynamic Commission",
      route: "dynamic-comission",
      matcher: (route) => route === "/AdminLayout/dynamic-comission",
    },
    {
      name: "Public Api Leads",
      route: "api-leads",
      matcher: (route) => route === "/AdminLayout/api-leads",
    },
    {
      name: "Inventory",
      route: "inventory",
      matcher: (route) => route === "/AdminLayout/inventory",
    },
  ];

  // Update active item whenever location changes
  useEffect(() => {
    const currentPath = location.pathname;
    const matchedItem = menuItems.find((item) => item.matcher(currentPath));
    if (matchedItem) {
      setActiveItem(matchedItem.name);
    }
  }, [location.pathname]);

  return (
    <div className="bg-[#011c64] h-full w-full">
      <div className="flex flex-col items-center justify-start w-full h-full px-5 py-5 gap-y-10">
        <div className="flex w-full justify-center bg-white py-2 rounded-lg">
          <img src={logo} alt="RTA Logo" className="max-w-[160px]" />
        </div>
        <div className="flex flex-col w-full gap-y-4">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.route}
              className={`w-full transition-all duration-300 ease-in-out rounded-md ${activeItem === item.name
                ? "bg-white rounded-md shadow-lg"
                : "hover:bg-white rounded-md hover:text-blue-900"
                }`}
            >
              <p
                className={`w-full p-3  rounded-md font-radios  hover:bg-white hover:text-blue-900 ${activeItem === item.name ? "text-blue-800" : "text-white"
                  } flex items-center justify-between`}
              >
                {item.name}
                {item.name === "Commission Sheet" && statusCount > 0 && (
                  <span
                    className={`   ${activeItem === item.name
                      ? " text-white bg-[#011c64] "
                      : "text-[#011c64] bg-white"
                      }  w-5 h-5 flex items-center justify-center rounded-full text-sm `}
                  >
                    {statusCount}
                  </span>
                )}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
