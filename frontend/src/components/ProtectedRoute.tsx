import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/authSlice";
import { useTokenValidation } from "../hooks/useTokenValidation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute: requires user to be logged in.
 * Redirects to /signin if not authenticated, then returns to original path after login.
 * Automatically validates and refreshes access token on mount.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  // Validate and refresh token if needed
  useTokenValidation();

  if (!isAuthenticated) {
    // Redirect to signin with return path so user can come back after login
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
