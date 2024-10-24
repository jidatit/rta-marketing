import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../../index.css";
import logo from "../../images/rta-logo.png";

const AdminSidebar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("");

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
  ];

  // Update active item whenever location changes
  useEffect(() => {
    const currentPath = location.pathname;
    const matchedItem = menuItems.find((item) => item.matcher(currentPath));
    if (matchedItem) {
      console.log("matchedItem", matchedItem);
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
              className={`w-full transition-all duration-300 ease-in-out rounded-md ${
                activeItem === item.name
                  ? "bg-white rounded-md shadow-lg"
                  : "hover:bg-white rounded-md hover:text-blue-900"
              }`}
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
