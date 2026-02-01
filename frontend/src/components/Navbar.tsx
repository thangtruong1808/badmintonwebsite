import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaRegHeart, FaShoppingCart, FaUser, FaSignOutAlt } from "react-icons/fa";
import ChibiLogo from "../assets/ChibiLogo.png";
import { getCartCount } from "../utils/cartStorage";
import { selectUser, logout } from "../store/authSlice";

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
              <FaRegHeart className="inline" size={14} />
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
        className="font-huglove text-xl lg:text-2xl inline-block cursor-pointer"
      >
        <span
          className={`inline-flex items-center relative px-2 2xl:px-4 py-1 rounded-full transition-colors duration-300 ${isActive
            ? "bg-rose-600 text-white"
            : "bg-rose-500 text-white hover:bg-rose-600"
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
      className={`font-huglove text-xl lg:text-2xl block lg:inline-block py-3 lg:py-0 px-2 lg:px-4 cursor-pointer transition-colors duration-300 border-b lg:border-b-0 border-rose-200 lg:border-0 whitespace-nowrap ${isActive
        ? "text-rose-500 font-semibold bg-transparent underline decoration-rose-500 decoration-4 underline-offset-[10px]"
        : "text-black hover:text-black hover:bg-rose-300 lg:hover:bg-transparent lg:hover:text-rose-500 rounded-md"
        }`}
    >
      <span
        className={`inline-flex items-center relative ${isActive
          ? "pb-1 after:content-[''] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-1 after:bg-rose-500"
          : ""
          }`}
        style={{
          textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
        }}
      >
        {renderPageName()}
      </span>
    </Link>
  );
};

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

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

  const handleLogout = () => {
    dispatch(logout());
    setShowUserMenu(false);
    navigate("/signin");
  };

  return (
    <nav className="p-3 lg:p-4 w-full fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-rose-50 to-rose-100 shadow-md">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* LOGO */}
        <Link
          to="/"
          className="flex flex-col items-center leading-tight flex-shrink-0"
        >
          <img
            src={ChibiLogo}
            alt="ChibiBadminton Logo"
            className="h-10 w-auto object-cover"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center flex-1 justify-center min-w-0">
          <div className="flex items-center space-x-1 2xl:space-x-1 justify-center flex-nowrap whitespace-nowrap">
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
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="font-huglove text-xl lg:text-2xl inline-flex items-center gap-2 px-2 2xl:px-4 py-1 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                >
                  <FaUser size={16} />
                  <span className="hidden md:inline">{user.name.split(" ")[0]}</span>
                </button>
                {showUserMenu && (
                  <>
                    {/* Backdrop to close menu when clicking outside */}
                    <div
                      className="fixed inset-0 z-[45]"
                      onClick={() => setShowUserMenu(false)}
                    />
                    {/* Dropdown menu - positioned below the button */}
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[60]">
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
            ) : (
              <NavItem to="/signin" pageName="sign-in" setIsOpen={setIsOpen} />
            )}
          </div>
        </div>

        {/* Cart Icon */}
        <div className="hidden lg:flex items-center ml-4">
          <button
            onClick={() => navigate("/play")}
            className="relative p-2 text-gray-700 hover:text-rose-500 transition-colors"
            aria-label="View cart"
          >
            <FaShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Menu Button and Cart */}
        <div className="lg:hidden flex items-center gap-3">
          <button
            onClick={() => navigate("/play")}
            className="relative p-2 text-gray-700"
            aria-label="View cart"
          >
            <FaShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-rose-500 text-3xl focus:outline-none hover:text-rose-700 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="lg:hidden absolute left-0 right-0 top-full bg-gradient-to-r from-rose-50 to-rose-100 shadow-xl w-full border-t border-rose-200 text-black">
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
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  className="font-huglove text-xl block py-3 px-2 border-b border-rose-200 text-black hover:bg-rose-300 rounded-md"
                >
                  <FaUser className="inline mr-2" size={14} />
                  Profile
                </Link>
                {(user.role === "admin" || user.role === "super_admin") && (
                  <Link
                    to="/dashboard"
                    onClick={() => {
                      setIsOpen(false);
                    }}
                    className="font-huglove text-xl block py-3 px-2 border-b border-rose-200 text-black hover:bg-rose-300 rounded-md"
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
