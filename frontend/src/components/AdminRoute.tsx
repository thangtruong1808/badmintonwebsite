import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectUser } from "../store/authSlice";
import { useTokenValidation } from "../hooks/useTokenValidation";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute: requires user to be logged in AND have admin or super_admin role.
 * Redirects to /signin if not authenticated, or to / if authenticated but not admin.
 * Automatically validates and refreshes access token on mount.
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const location = useLocation();

  // Validate and refresh token if needed
  useTokenValidation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
