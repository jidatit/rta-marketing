import { Outlet, useNavigate } from "react-router";
import Navbar from "../UIComponents/Navbar";

import { useAuth } from "../../AuthContext";
import SideBarVA from "./components/SideBarVA";

const VirtualAssistantLayout = () => {
  const navigate = useNavigate();

  const { isEmailVerified } = useAuth();
  return (
    <>
      {isEmailVerified ? (
        <div className="flex w-full min-h-screen">
          {/* Sidebar - Fixed to the Left */}
          <div className="w-[15%] h-screen fixed top-0 left-0 bg-white shadow-lg">
            <SideBarVA />
          </div>

          {/* Main Content - Takes Remaining Space & Scrolls Independently */}
          <div className="flex flex-col w-[85%] min-h-screen ml-[15%] overflow-auto">
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
