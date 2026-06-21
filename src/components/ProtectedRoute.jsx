import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { isLoggedIn, userRole } = useAuth();
  const location = useLocation();

  //Not logged in- send to login
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  //logged in wrong role- send home
  if (requiredRole && useerRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
