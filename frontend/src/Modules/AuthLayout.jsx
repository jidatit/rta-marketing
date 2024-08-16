import { Outlet } from "react-router";

const AuthLayout = () => {
  return (
    <div className="flex items-center justify-center w-full">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
