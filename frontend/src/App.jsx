import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignUpPage from "./Modules/AuthComponents/SignUpPage";
import { AuthProvider, useAuth } from "./AuthContext";
import AuthLayout from "./Modules/AuthComponents/AuthLayout";
import EmployeeLayout from "./Modules/EmployeeComponents/EmployeeLayout";
import EmployeeDashboard from "./Modules/EmployeeComponents/EmployeeDashboard";
import VirtualAssistantLayout from "./Modules/VirtualAssistantComponents/VirtualAssistantLayout";
import VirtualAssistantDashboard from "./Modules/VirtualAssistantComponents/VirtualAssistantDashboard";
import AdminDashboard from "./Modules/AdminComponents/AdminDashboard";
import AdminLayout from "./Modules/AdminComponents/AdminLayout";
import AllUsers from "./Modules/AdminComponents/AllUsers";
import VerificationPage from "./Modules/AuthComponents/VerificationPage";
import SignInPage from "./Modules/AuthComponents/SignInPage";
import ForgotPassword from "./Modules/AuthComponents/ForgotPasswordAdmin";
import ChangePassword from "./Modules/AuthComponents/ChangePassword";
import InsuranceUploadForm from "./Modules/EmployeeComponents/InsuranceUploadForm";
import LeadSource from "./Modules/AdminComponents/LeadSource";
import SalesPage from "./Modules/AdminComponents/SalesPage";
import SaleForm1 from "./Modules/EmployeeComponents/SaleForm1";
import SalesPersonPage from "./Modules/AdminComponents/SalesPersonPage";
import EmployeeSales from "./Modules/AdminComponents/EmployeeSales";
import AllUsersPage from "./Modules/AdminComponents/AllUsersPage";
import TVScreen from "./Modules/TvScreenComponent/TVScreen";
import LeadsPage from "./Modules/VirtualAssistantComponents/pages/LeadsPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SalesPerson from "./Modules/AdminComponents/pages/SalesPerson.jsx";
import SalesOfSalesPerson from "./Modules/AdminComponents/pages/SalesOfSalesPerson.jsx";
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen loading-spinner">
    <div className="w-16 h-16 border-4 rounded-full border-t-transparent border-gray-900/50 animate-spin"></div>
  </div>
);

function App() {
  const { currentUser, loading } = useAuth();

  const getDashboardPath = (userType) => {
    switch (userType) {
      case "Employee":
        return "/EmployeeLayout";
      case "Virtual Assistant":
        return "/VirtualAssistantLayout";
      case "Admin":
        return "/AdminLayout";
      default:
        return "/";
    }
  };

  return (
    <div className="w-full h-auto overflow-hidden bg-white">
      <Router>
        <AuthProvider>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <Routes>
              <Route path="/" element={<AuthLayout />}>
                <Route
                  index
                  element={
                    currentUser ? (
                      <Navigate to={getDashboardPath(currentUser.userType)} />
                    ) : (
                      <SignInPage />
                    )
                  }
                />
                <Route path="signUp" element={<SignUpPage />} />
                <Route path="verificationPage" element={<VerificationPage />} />
                <Route path="signIn" element={<SignInPage />} />
                <Route path="forgotPassword" element={<ForgotPassword />} />
                <Route path="changePassword" element={<ChangePassword />} />
              </Route>
              <Route path="/EmployeeLayout" element={<EmployeeLayout />}>
                <Route
                  index
                  element={
                    currentUser ? <EmployeeDashboard /> : <Navigate to="/" />
                  }
                />
                <Route
                  path="changePassword"
                  element={
                    currentUser ? <ChangePassword /> : <Navigate to="/" />
                  }
                />
                <Route
                  path="insuranceUpload"
                  element={
                    currentUser ? <InsuranceUploadForm /> : <Navigate to="/" />
                  }
                />
                <Route
                  path="saleForm1"
                  element={currentUser ? <SaleForm1 /> : <Navigate to="/" />}
                />
              </Route>
              <Route
                path="/VirtualAssistantLayout"
                element={<VirtualAssistantLayout />}
              >
                <Route
                  index
                  element={currentUser ? <LeadsPage /> : <Navigate to="/" />}
                />
                {/* <Route
                  index
                  element={
                    currentUser ? (
                      <VirtualAssistantDashboard />
                    ) : (
                      <Navigate to="/" />
                    )
                  }
                /> */}
                <Route
                  path="leads"
                  element={currentUser ? <LeadsPage /> : <Navigate to="/" />}
                />
              </Route>
              <Route path="/AdminLayout" element={<AdminLayout />}>
                {/* <Route
                  index
                  element={
                    currentUser ? <AdminDashboard /> : <Navigate to="/" />
                  }
                /> */}
                <Route
                  index
                  // path="sales"
                  element={currentUser ? <SalesPage /> : <Navigate to="/" />}
                />
                {/* <Route
                  path="users"
                  element={currentUser ? <AllUsers /> : <Navigate to="/" />}
                /> */}
                <Route
                  path="changePassword"
                  element={
                    currentUser ? <ChangePassword /> : <Navigate to="/" />
                  }
                />
                <Route
                  path="leads-source"
                  element={currentUser ? <LeadSource /> : <Navigate to="/" />}
                />
                <Route
                  path="SalesPersons"
                  element={currentUser ? <SalesPerson /> : <Navigate to="/" />}
                />
                <Route
                  path="SalesOfSalesPerson/:id"
                  element={
                    currentUser ? <SalesOfSalesPerson /> : <Navigate to="/" />
                  }
                />
                <Route
                  path="sales-person"
                  element={
                    currentUser ? <SalesPersonPage /> : <Navigate to="/" />
                  }
                />
                <Route
                  path="sale/:id"
                  element={
                    currentUser ? <EmployeeSales /> : <Navigate to="/" />
                  }
                />
                <Route
                  path="users"
                  element={currentUser ? <AllUsersPage /> : <Navigate to="/" />}
                />
              </Route>
              <Route path="/tv" element={<TVScreen />} />
            </Routes>
          )}
        </AuthProvider>
        <ToastContainer />
      </Router>
    </div>
  );
}

export default App;
