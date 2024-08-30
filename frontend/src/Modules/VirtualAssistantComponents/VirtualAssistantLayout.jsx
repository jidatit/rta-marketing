import { Outlet, useNavigate } from "react-router";
import Navbar from "../UIComponents/Navbar";
import SideBar from "../UIComponents/SideBar";
import { useAuth } from "../../AuthContext";

const VirtualAssistantLayout = () => {
  const navigate = useNavigate();

  const { isEmailVerified } = useAuth();
  return (
    <>
      {isEmailVerified ? (
        <div className="flex flex-row w-full h-screen">
          <div className="w-[15%] h-full">
            <SideBar />
          </div>
          <div className="w-[85%] flex flex-col h-full">
            <Navbar />
            <div className="flex items-center justify-center flex-grow w-full">
              <Outlet />
            </div>
          </div>
        </div>
      ) : (
        navigate("/signIn")
      )}
    </>
  );
};

export default VirtualAssistantLayout;
