import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

// Import your Auth context

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) {
    // Render a loading spinner or some placeholder UI
    return <div>Loading...</div>;
  }
  if (!currentUser) {
    // Redirect to the login page if user is not authenticated
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
