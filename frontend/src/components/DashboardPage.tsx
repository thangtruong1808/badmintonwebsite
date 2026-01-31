import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaChartLine,
  FaUsers,
  FaCalendarAlt,
  FaClipboardList,
  FaCoins,
  FaBox,
  FaImages,
  FaNewspaper,
  FaStar,
  FaEnvelope,
  FaComments,
  FaTools,
  FaCreditCard,
  FaFileInvoice,
  FaHome,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import ChibiLogo from "../assets/ChibiLogo.png";
import { getCurrentUser, clearCurrentUser } from "../utils/mockAuth";
import type { UserRole } from "../types/user";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const AUTH_TOKEN_KEY = "chibibadminton_token";

interface DashboardStats {
  usersCount: number;
  eventsCount: number;
  registrationsCount: number;
  rewardTransactionsCount: number;
}

const MOCK_STATS: DashboardStats = {
  usersCount: 1,
  eventsCount: 0,
  registrationsCount: 0,
  rewardTransactionsCount: 0,
};

const isAdmin = (role?: UserRole): boolean =>
  role === "admin" || role === "super_admin";

// Sidebar sections aligned to schema (users, events, registrations, reward_point_transactions, products, gallery, news, reviews, newsletter, contact_messages, service_requests, payments, invoices)
type DashboardSection =
  | "overview"
  | "users"
  | "events"
  | "registrations"
  | "reward-transactions"
  | "products"
  | "gallery"
  | "news"
  | "reviews"
  | "newsletter"
  | "contact-messages"
  | "service-requests"
  | "payments"
  | "invoices";

const SIDEBAR_ICON_SIZE = 24;
const SIDEBAR_ITEMS: { id: DashboardSection; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <FaChartLine size={SIDEBAR_ICON_SIZE} /> },
  { id: "users", label: "Users", icon: <FaUsers size={SIDEBAR_ICON_SIZE} /> },
  { id: "events", label: "Events", icon: <FaCalendarAlt size={SIDEBAR_ICON_SIZE} /> },
  { id: "registrations", label: "Registrations", icon: <FaClipboardList size={SIDEBAR_ICON_SIZE} /> },
  { id: "reward-transactions", label: "Reward Transactions", icon: <FaCoins size={SIDEBAR_ICON_SIZE} /> },
  { id: "products", label: "Products", icon: <FaBox size={SIDEBAR_ICON_SIZE} /> },
  { id: "gallery", label: "Gallery", icon: <FaImages size={SIDEBAR_ICON_SIZE} /> },
  { id: "news", label: "News", icon: <FaNewspaper size={SIDEBAR_ICON_SIZE} /> },
  { id: "reviews", label: "Reviews", icon: <FaStar size={SIDEBAR_ICON_SIZE} /> },
  { id: "newsletter", label: "Newsletter", icon: <FaEnvelope size={SIDEBAR_ICON_SIZE} /> },
  { id: "contact-messages", label: "Contact Messages", icon: <FaComments size={SIDEBAR_ICON_SIZE} /> },
  { id: "service-requests", label: "Service Requests", icon: <FaTools size={SIDEBAR_ICON_SIZE} /> },
  { id: "payments", label: "Payments", icon: <FaCreditCard size={SIDEBAR_ICON_SIZE} /> },
  { id: "invoices", label: "Invoices", icon: <FaFileInvoice size={SIDEBAR_ICON_SIZE} /> },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "ChibiBadminton - Admin Dashboard";
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !isAdmin(user.role)) {
      navigate("/", { replace: true });
      return;
    }

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/api/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setStats(data);
            return;
          }
          setError("Could not load dashboard stats. Showing mock data.");
        } catch {
          setError("Could not reach the server. Showing mock data.");
        }
      }
      setStats(MOCK_STATS);
    };

    fetchStats().finally(() => setLoading(false));
  }, [navigate]);

  const user = getCurrentUser();
  if (!user || !isAdmin(user.role)) {
    return null;
  }

  const toggleSidebar = () => setSidebarOpen((o) => !o);
  const openMobileSidebar = () => setMobileSidebarOpen(true);
  const closeMobileSidebar = () => setMobileSidebarOpen(false);
  const selectSection = (id: DashboardSection) => {
    setActiveSection(id);
    closeMobileSidebar();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out ${sidebarOpen ? "w-72" : "w-20"
          }`}
      >
        <div className={`flex items-center justify-center border-b border-gray-200 shrink-0 overflow-hidden ${sidebarOpen ? "min-h-[4.5rem] px-4 py-3" : "h-14 px-0"}`}>
          <img
            src={ChibiLogo}
            alt="ChibiBadminton Logo"
            className={`shrink-0 object-contain ${sidebarOpen ? "h-12 w-auto max-w-full" : "h-10 w-auto"}`}
          />
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {SIDEBAR_ITEMS.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => selectSection(id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left font-calibri text-base transition-colors ${activeSection === id
                ? "bg-rose-50 text-rose-700 border-r-4 border-rose-500"
                : "text-gray-700 hover:bg-rose-50/50"
                } ${sidebarOpen ? "justify-start" : "justify-center px-0"}`}
            >
              <span className="shrink-0 text-gray-600 [&>svg]:w-6 [&>svg]:h-6">{icon}</span>
              {sidebarOpen && <span className="text-base">{label}</span>}
            </button>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              clearCurrentUser();
              navigate("/signin");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-gray-700 hover:bg-rose-50 hover:text-rose-700 font-calibri text-base transition-colors ${sidebarOpen ? "justify-start" : "justify-center px-0"}`}
          >
            <FaSignOutAlt className="shrink-0 w-6 h-6" size={SIDEBAR_ICON_SIZE} />
            {sidebarOpen && <span className="text-base">Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobileSidebar}
          aria-hidden
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 flex flex-col bg-white border-r border-gray-200 shadow-xl transition-transform duration-300 lg:hidden ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between min-h-[4.5rem] px-4 py-3 border-b border-gray-200 gap-3">
          <img
            src={ChibiLogo}
            alt="ChibiBadminton Logo"
            className="h-12 w-auto object-contain shrink-0 max-w-[120px]"
          />
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 shrink-0"
            aria-label="Close menu"
          >
            <FaTimes size={24} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {SIDEBAR_ITEMS.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => selectSection(id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left font-calibri text-base transition-colors ${activeSection === id
                ? "bg-rose-50 text-rose-700 border-r-4 border-rose-500"
                : "text-gray-700 hover:bg-rose-50/50"
                }`}
            >
              <span className="shrink-0 [&>svg]:w-6 [&>svg]:h-6">{icon}</span>
              <span className="text-base">{label}</span>
            </button>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              clearCurrentUser();
              navigate("/signin");
              closeMobileSidebar();
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-gray-700 hover:bg-rose-50 hover:text-rose-700 font-calibri text-base transition-colors"
          >
            <FaSignOutAlt className="shrink-0 w-6 h-6" size={SIDEBAR_ICON_SIZE} />
            <span className="text-base">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-14 shrink-0 flex items-center justify-between gap-4 px-4 lg:px-6 bg-white border-b border-gray-200 shadow-sm">
          <button
            type="button"
            onClick={() => (window.innerWidth >= 1024 ? toggleSidebar() : openMobileSidebar())}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label="Toggle sidebar"
          >
            <FaBars size={22} />
          </button>
          <h1 className="font-calibri font-semibold text-gray-800 truncate capitalize">
            {activeSection.replace(/-/g, " ")}
          </h1>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-rose-50 hover:text-rose-700 font-calibri text-sm"
            >
              <FaHome size={16} />
              Back to site
            </Link>
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <FaUser className="text-gray-500" size={16} />
              <span className="font-calibri text-sm text-gray-700 truncate max-w-[120px]">
                {user.name}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeSection === "overview" && (
            <div>
              <p className="font-calibri text-gray-600 mb-6">
                Admin overview for ChibiBadminton. Data aligns with database schema (users, events, registrations, reward_point_transactions, etc.).
              </p>
              {loading && (
                <p className="font-calibri text-gray-600">Loading stats…</p>
              )}
              {error && (
                <p className="font-calibri text-rose-600 mb-4">{error}</p>
              )}
              {!loading && stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow border border-rose-100 p-6">
                    <p className="font-calibri text-sm text-gray-500 uppercase tracking-wide mb-1">
                      Total Users
                    </p>
                    <p className="font-huglove text-2xl md:text-3xl text-rose-600">
                      {stats.usersCount}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow border border-rose-100 p-6">
                    <p className="font-calibri text-sm text-gray-500 uppercase tracking-wide mb-1">
                      Total Events
                    </p>
                    <p className="font-huglove text-2xl md:text-3xl text-rose-600">
                      {stats.eventsCount}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow border border-rose-100 p-6">
                    <p className="font-calibri text-sm text-gray-500 uppercase tracking-wide mb-1">
                      Registrations
                    </p>
                    <p className="font-huglove text-2xl md:text-3xl text-rose-600">
                      {stats.registrationsCount}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow border border-rose-100 p-6">
                    <p className="font-calibri text-sm text-gray-500 uppercase tracking-wide mb-1">
                      Reward Transactions
                    </p>
                    <p className="font-huglove text-2xl md:text-3xl text-rose-600">
                      {stats.rewardTransactionsCount}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection !== "overview" && (
            <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
              <p className="font-calibri text-gray-600">
                <strong className="capitalize text-gray-800">{activeSection.replace(/-/g, " ")}</strong> management will be available here. This section maps to the corresponding table(s) in the database schema (e.g. users, events, registrations, reward_point_transactions, products, gallery_photos, gallery_videos, news_articles, reviews, newsletter_subscriptions, contact_messages, service_requests, payments, invoices).
              </p>
              <p className="font-calibri text-gray-500 mt-4 text-sm">
                Coming soon: list, create, edit, and delete actions.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
