import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectAuthInitialized } from "../store/authSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute: requires user to be logged in.
 * Waits for initial session restore before redirecting (keeps user on page on refresh if tokens valid).
 * Redirects to /signin if not authenticated after init, then returns to original path after login.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authInitialized = useSelector(selectAuthInitialized);
  const location = useLocation();

  if (!authInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
