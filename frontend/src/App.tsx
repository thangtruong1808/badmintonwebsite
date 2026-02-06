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
import ShopCheckoutPage from "./components/ShopPage/ShopCheckoutPage";
import ShopPaymentPage from "./components/ShopPage/ShopPaymentPage";
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
import PlayCheckoutPage from "./components/PlayPage/PlayCheckoutPage";
import SessionRegistrationsPage from "./components/PlayPage/SessionRegistrationsPage";
import PlayPaymentPage from "./components/PlayPage/PlayPaymentPage";
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
  const isPlayRoute = location.pathname === "/play";

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
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      {!isDashboard && <Navbar />}
      <main
        className={`flex-grow w-full relative ${isPlayRoute ? "bg-gradient-to-r from-rose-50 to-rose-100" : ""}`}
        style={!isDashboard ? { paddingTop: "var(--navbar-height, 56px)" } : undefined}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/play/session/:eventId/registrations" element={<SessionRegistrationsPage />} />
          <Route path="/play/checkout" element={<PlayCheckoutPage />} />
          <Route
            path="/play/payment"
            element={
              <ProtectedRoute>
                <PlayPaymentPage />
              </ProtectedRoute>
            }
          />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/checkout" element={<ShopCheckoutPage />} />
          <Route path="/shop/payment" element={<ShopPaymentPage />} />
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
