import { Outlet } from "react-router";
import Navbar from "./Navbar";
import "../index.css";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex flex-row w-full h-screen">
      <div className="w-[15%] h-full">
        <AdminSidebar />
      </div>
      <div className="w-[85%] flex flex-col h-full">
        <Navbar />
        <div className="flex items-center justify-center flex-grow w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
