import { Outlet } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const AuthLayout = () => {
  return (
    <>
      <div className="flex items-center justify-center w-full">
        <Outlet />
      </div>
      <ToastContainer />
    </>
  );
};

export default AuthLayout;
