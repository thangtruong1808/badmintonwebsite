import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectAuthInitialized } from "../store/authSlice";

interface GuestOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * GuestOnlyRoute: redirects authenticated users away from sign-in, register, reset-password.
 * When user is logged in, redirect to /profile instead of showing the auth page.
 */
const GuestOnlyRoute: React.FC<GuestOnlyRouteProps> = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authInitialized = useSelector(selectAuthInitialized);

  if (!authInitialized) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

export default GuestOnlyRoute;
