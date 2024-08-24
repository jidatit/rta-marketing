import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "react-toastify/dist/ReactToastify.css";

import { ToastContainer } from "react-toastify";
import SignUpPage from "./Modules/AuthComponents/SignUpPage";
import SignInPage from "./Modules/AuthComponents/SigninPage";
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

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen loading-spinner">
    {/* Spinner */}
    <div className="w-16 h-16 border-4 rounded-full border-t-transparent border-gray-900/50 animate-spin"></div>
  </div>
);
function App() {
  const { currentUser, loading } = useAuth();
  return (
    <div className="w-full h-auto overflow-hidden bg-white">
      <Router>
        <AuthProvider>
          <ToastContainer />

          {loading ? (
            <LoadingSpinner />
          ) : (
            <Routes>
              <Route path="/" element={<AuthLayout />}>
                <Route
                  index
                  element={
                    currentUser ? (
                      <Navigate to="/EmployeeLayout" />
                    ) : (
                      <SignInPage />
                    )
                  }
                />
                <Route path="signUp" element={<SignUpPage />} />
                <Route path="verificationPage" element={<VerificationPage />} />
                <Route path="signIn" element={<SignInPage />} />
              </Route>
              <Route path="/EmployeeLayout" element={<EmployeeLayout />}>
                <Route
                  index
                  element={
                    currentUser ? <EmployeeDashboard /> : <Navigate to="/" />
                  }
                />
              </Route>
              <Route
                path="/VirtualAssistantLayout"
                element={<VirtualAssistantLayout />}
              >
                <Route
                  index
                  element={
                    currentUser ? (
                      <VirtualAssistantDashboard />
                    ) : (
                      <Navigate to="/" />
                    )
                  }
                />
              </Route>
              <Route path="/AdminLayout" element={<AdminLayout />}>
                <Route
                  index
                  element={
                    currentUser ? <AdminDashboard /> : <Navigate to="/" />
                  }
                />
                <Route
                  path="users"
                  element={currentUser ? <AllUsers /> : <Navigate to="/" />}
                />
              </Route>
            </Routes>
          )}
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
