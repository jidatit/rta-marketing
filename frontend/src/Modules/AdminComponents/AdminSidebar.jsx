import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../index.css";

const AdminSidebar = () => {
  // Initialize activeItem with a value from localStorage or default to "Sales"
  const [activeItem, setActiveItem] = useState(() => {
    return localStorage.getItem("activeItem") || "Sales";
  });

  const [menuItems] = useState([
    { name: "Sales", route: "/" },
    { name: "Lead Source", route: "leads-source" },
    // { name: "Sales Person", route: "sales-person" },
    { name: "Users", route: "users" },
    { name: "TV Screen", route: "/tv" },
  ]);

  const handleItemClick = (item) => {
    setActiveItem(item);
    localStorage.setItem("activeItem", item);
  };

  return (
    <div className="bg-[#234dc0] h-full w-full">
      <div className="flex flex-col items-center justify-start w-full h-full px-5 py-5 gap-y-10">
        <div className="flex w-full">
          <h1 className="text-2xl font-bold text-white">Logo</h1>
        </div>
        <div className="flex flex-col w-full gap-y-4">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.route}
              className={`w-full transition-all duration-300 ease-in-out rounded-md ${
                activeItem === item.name
                  ? "bg-white rounded-md shadow-lg"
                  : "hover:bg-white rounded-md hover:text-blue-900"
              }`}
              onClick={() => handleItemClick(item.name)}
            >
              <p
                className={`w-full p-3 rounded-md font-radios hover:bg-white hover:text-blue-900 ${
                  activeItem === item.name ? "text-blue-800" : "text-white"
                }`}
              >
                {item.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
