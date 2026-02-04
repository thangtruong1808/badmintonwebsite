import { useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTokenValidation } from "./hooks/useTokenValidation";
import { setCredentials, logout, setAuthInitialized } from "./store/authSlice";
import { API_BASE } from "./utils/api";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import EventsPage from "./components/EventsPage";
import GalleryPage from "./components/GalleryPage";
import ShopPage from "./components/ShopPage";
import ProductDetailPage from "./components/ProductDetailPage";
import ServicesPage from "./components/ServicesPage";
import ContactUsPage from "./components/ContactUsPage";
import ReviewsPage from "./components/ReviewsPage";
import AboutUsPage from "./components/AboutUsPage";
import SignInPage from "./components/SignInPage";
import RegisterPage from "./components/RegisterPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import FeaturedNewsPage from "./components/FeaturedNewsPage";
import PlayPage from "./components/PlayPage";
import NewsDetailPage from "./components/NewsDetailPage";
import UserProfilePage from "./components/UserProfilePage/UserProfilePage";
import DashboardPage from "./components/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDashboard = location.pathname === "/dashboard";

  useTokenValidation();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.user) {
          dispatch(setCredentials({
            user: data.user,
            refreshTokenExpiresAt: data.refreshTokenExpiresAt,
          }));
        } else {
          dispatch(logout());
        }
      } catch {
        dispatch(logout());
      } finally {
        dispatch(setAuthInitialized(true));
      }
    };
    restoreSession();
  }, [dispatch]);

  useEffect(() => {
    const handleForceLogout = () => navigate("/signin", { replace: true });
    window.addEventListener("auth:forceLogout", handleForceLogout);
    return () => window.removeEventListener("auth:forceLogout", handleForceLogout);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col transition-all duration-300 w-full overflow-x-hidden">
      {!isDashboard && <Navbar />}
      <main className={`flex-grow w-full relative ${isDashboard ? "" : "pt-[56px] lg:pt-[72px]"}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/product/:id" element={<ProductDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/featured-news" element={<FeaturedNewsPage />} />
          <Route path="/featured-news/:id" element={<NewsDetailPage />} />

          {/* Auth Routes (public) */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Routes (require login) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes (require admin/super_admin role) */}
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <DashboardPage />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
}

export default App;
