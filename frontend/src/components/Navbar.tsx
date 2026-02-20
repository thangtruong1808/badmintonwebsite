import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaRegHeart, FaShoppingCart, FaUser, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import ChibiLogo from "../assets/ChibiLogo.png";
import { getCartCount } from "../utils/cartStorage";
import { API_BASE } from "../utils/api";
import { selectUser, selectIsAuthenticated, logout } from "../store/authSlice";

interface NavItemProps {
  to: string;
  pageName: string | React.ReactNode;
  setIsOpen: (open: boolean) => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, pageName, setIsOpen }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  // Replace 'o' and 'O' with empty heart icon (only if pageName is a string)
  const renderPageName = () => {
    if (typeof pageName === "string") {
      return pageName.split("").map((char, index) => {
        if (char.toLowerCase() === "o") {
          return (
            <span key={index} className="inline-flex items-center">
              <FaRegHeart className="inline" size={12} />
            </span>
          );
        }
        return char;
      });
    }
    return pageName; // Return as-is if it's already a ReactNode
  };

  if (pageName === "sign-in") {
    return (
      <Link
        to={to}
        onClick={() => setIsOpen(false)}
        className="font-huglove text-xl lg:text-2xl xl:text-3xl block lg:inline-block py-2.5 lg:py-0 px-2 cursor-pointer border-b lg:border-b-0 border-rose-200 lg:border-0"
      >
        <span
          className={`inline-flex items-center relative px-2 2xl:px-4 py-1 rounded-full transition-colors duration-300 ${isActive
            ? "bg-rose-600 text-white "
            : "bg-rose-500 text-white hover:bg-rose-600 "
            }`}
        >
          {renderPageName()}
        </span>
      </Link>
    );
  }
  return (
    <Link
      to={to}
      onClick={() => setIsOpen(false)}
      className={`font-huglove font-normal block lg:inline-block py-2.5 lg:py-0 px-2 lg:px-2 cursor-pointer transition-colors duration-300 border-b lg:border-b-0 border-rose-200 lg:border-0 whitespace-nowrap lg:px-3 xl:px-4 xl:py-2 text-xl lg:text-2xl xl:text-3xl   ${isActive
        ? "text-rose-500 bg-transparent underline decoration-rose-500 decoration-4 underline-offset-[10px]"
        : "text-black hover:text-black hover:bg-rose-300 lg:hover:bg-transparent lg:hover:text-rose-500 rounded-md"
        }`}
    >
      <span
        className={`inline-flex items-center relative ${isActive
          ? "pb-0.5 after:content-[''] after:absolute after:bottom-0 after:left-1 after:right-1 after:h-0.5 after:bg-rose-500"
          : ""
          }`}
      >
        {renderPageName()}
      </span>
    </Link>
  );
};

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);

  // Report navbar height for main content padding (prevents white gap on resize)
  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const updateHeight = () => {
      document.documentElement.style.setProperty("--navbar-height", `${el.offsetHeight}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--navbar-height");
    };
  }, []);

  // Update cart count when it changes
  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartCount());
    };

    // Initial load
    updateCartCount();

    // Listen for cart updates
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } finally {
      dispatch(logout());
      setShowUserMenu(false);
      navigate("/signin");
    }
  };

  return (
    <nav ref={navRef} className="px-3 py-2.5 lg:py-3 w-full fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-rose-50 to-rose-100 shadow-md">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto gap-2 sm:gap-4">
        {/* LOGO */}
        <Link
          to="/"
          className="relative z-10 flex flex-col items-center leading-tight flex-shrink-0"
        >
          <img
            src={ChibiLogo}
            alt="ChibiBadminton Logo"
            className="h-8 w-auto object-cover xl:h-10 xl:w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center flex-1 justify-center min-w-0 relative z-20">
          <div className="flex items-center justify-center flex-nowrap gap-x-1 py-1 overflow-hidden">
            <NavItem
              to="/"
              setIsOpen={setIsOpen}
              pageName={<span>home</span>}
            />
            <NavItem to="/play" pageName="play" setIsOpen={setIsOpen} />
            <NavItem to="/events" pageName="events" setIsOpen={setIsOpen} />
            <NavItem
              to="/shop"
              setIsOpen={setIsOpen}
              pageName={<span>shop</span>}
            />
            <NavItem to="/services" pageName="services" setIsOpen={setIsOpen} />
            <NavItem to="/gallery" pageName="gallery" setIsOpen={setIsOpen} />
            <NavItem
              to="/contact-us"
              setIsOpen={setIsOpen}
              pageName={<span>contact-us</span>}
            />
            <NavItem
              to="/about-us"
              setIsOpen={setIsOpen}
              pageName={<span>about-us</span>}
            />
            {!isAuthenticated || !user ? (
              <NavItem to="/signin" pageName="sign-in" setIsOpen={setIsOpen} />
            ) : null}
          </div>
          {/* Avatar + dropdown outside overflow-hidden so dropdown is visible */}
          {isAuthenticated && user ? (
            <div className="relative flex-shrink-0 ml-1 self-center">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="font-huglove text-lg lg:text-xl font-normal inline-flex items-center gap-1 p-0.5 rounded-full hover:ring-2 hover:ring-rose-400 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                aria-label={`${user.firstName} ${user.lastName} - account menu`}
                aria-expanded={showUserMenu}
                title={`${user.firstName} ${user.lastName}`}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {`${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`.toUpperCase() || "?"}
                  </span>
                )}
                <FaChevronDown
                  className={`flex-shrink-0 text-rose-600 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
                  size={12}
                  aria-hidden
                />
              </button>
              {showUserMenu && (
                <>
                  {/* Backdrop to close menu when clicking outside */}
                  <div
                    className="fixed inset-0 z-[45]"
                    onClick={() => setShowUserMenu(false)}
                  />
                  {/* Dropdown menu - positioned below the navbar */}
                  <div className="absolute right-0 top-full mt-4 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[60]">
                    <Link
                      to="/profile"
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsOpen(false);
                      }}
                      className="block px-4 py-2 text-gray-700 hover:bg-rose-50 transition-colors font-calibri"
                    >
                      <FaUser className="inline mr-2" size={14} />
                      My Profile
                    </Link>
                    {(user.role === "admin" || user.role === "super_admin") && (
                      <Link
                        to="/dashboard"
                        onClick={() => {
                          setShowUserMenu(false);
                          setIsOpen(false);
                        }}
                        className="block px-4 py-2 text-gray-700 hover:bg-rose-50 transition-colors font-calibri"
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-rose-50 transition-colors font-calibri"
                    >
                      <FaSignOutAlt className="inline mr-2" size={14} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>

        {/* Cart Icon */}
        <div className="hidden lg:flex items-center ml-2 flex-shrink-0 relative z-10">
          <button
            onClick={() => navigate("/play")}
            className="relative p-1.5 text-gray-700 hover:text-rose-500 transition-colors"
            aria-label="View cart"
          >
            <FaShoppingCart className="text-2xl md:text-2xl" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Menu Button and Cart */}
        <div className="px-2 lg:hidden flex items-center gap-3 flex-shrink-0 relative z-10">
          <button
            onClick={() => navigate("/play")}
            className="relative p-1.5 text-gray-700"
            aria-label="View cart"
          >
            <FaShoppingCart className="text-2xl md:text-2xl" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-rose-500 text-2xl md:text-2xl focus:outline-none hover:text-rose-700 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="lg:hidden absolute left-0 right-0 top-full bg-gradient-to-r from-rose-50 to-rose-100 shadow-xl w-full border-t border-rose-200 text-black z-50">
          <div className="w-full">
            <NavItem
              to="/"
              setIsOpen={setIsOpen}
              pageName={<span>home</span>}
            />
            <NavItem to="/play" pageName="play" setIsOpen={setIsOpen} />
            <NavItem to="/events" pageName="events" setIsOpen={setIsOpen} />
            <NavItem
              to="/shop"
              setIsOpen={setIsOpen}
              pageName={<span>shop</span>}
            />
            <NavItem to="/services" pageName="services" setIsOpen={setIsOpen} />
            <NavItem to="/gallery" pageName="gallery" setIsOpen={setIsOpen} />
            <NavItem
              to="/contact-us"
              setIsOpen={setIsOpen}
              pageName={<span>contact-us</span>}
            />
            <NavItem
              to="/about-us"
              setIsOpen={setIsOpen}
              pageName={<span>about-us</span>}
            />
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  className="font-huglove text-lg font-normal flex items-center py-2.5 px-2 border-b border-rose-200 text-black hover:bg-rose-300 rounded-md"
                  aria-label={`${user.firstName} ${user.lastName} - My Profile`}
                  title={`${user.firstName} ${user.lastName}`}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {`${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`.toUpperCase() || "?"}
                    </span>
                  )}
                </Link>
                {(user.role === "admin" || user.role === "super_admin") && (
                  <Link
                    to="/dashboard"
                    onClick={() => {
                      setIsOpen(false);
                    }}
                    className="font-huglove text-lg font-normal block py-2.5 px-2 border-b border-rose-200 text-black hover:bg-rose-300 rounded-md"
                  >
                    Dashboard
                  </Link>
                )}
              </>
            ) : (
              <NavItem to="/signin" pageName="sign-in" setIsOpen={setIsOpen} />
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
