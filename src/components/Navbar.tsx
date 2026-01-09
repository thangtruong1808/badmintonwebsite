import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaFacebook, FaYoutube } from "react-icons/fa";

interface NavItemProps {
  to: string;
  pageName: string;
  setIsOpen: (open: boolean) => void;
}

const NavItem: React.FC<NavItemProps> = ({
  to,
  pageName,
  setIsOpen,
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={() => setIsOpen(false)}
      className={`block md:inline-block ml-0 md:ml-4 py-2 md:py-0 cursor-pointer transition-colors duration-300 ${isActive
        ? "text-blue-400 font-semibold"
        : "text-white hover:text-blue-400"
        }`}
    >
      {pageName}
    </Link>
  );
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="p-4 bg-slate-500 text-white w-full fixed top-0 left-0 right-0 z-10">
      <div className="flex items-center justify-between w-full">
        {/* LOGO + TEXT STACKED */}
        <Link to="/" className="flex flex-col items-start leading-tight">
          <span className="text-xl font-bold whitespace-nowrap text-white hover:text-blue-400 transition-colors duration-300">
            ChibiBadminton
          </span>
        </Link>

        {/* RIGHT — nav items start from the left of this column */}
        <div className="hidden md:flex items-center space-x-6 justify-center flex-grow text-lg font-medium">
          <NavItem
            to="/"
            pageName="Home"
            setIsOpen={setIsOpen}
          />

          <NavItem
            to="/events"
            pageName="Events"
            setIsOpen={setIsOpen}
          />
          <NavItem
            to="/gallery"
            pageName="Gallery"
            setIsOpen={setIsOpen}
          />
          <NavItem
            to="/contact-us"
            pageName="Contact Us"
            setIsOpen={setIsOpen}
          />
          <NavItem
            to="/reviews"
            pageName="Reviews"
            setIsOpen={setIsOpen}
          />
          <NavItem
            to="/about-us"
            pageName="About Us"
            setIsOpen={setIsOpen}
          />
        </div>

        {/* Social Media Icons - Desktop */}
        <div className="hidden md:flex items-center space-x-3">
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1877F2] text-white hover:bg-[#166FE5] hover:scale-110 hover:shadow-lg transition-all duration-300 ease-in-out"
            aria-label="Facebook"
          >
            <FaFacebook size={18} />
          </a>
          <a
            href="https://www.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FF0000] text-white hover:bg-[#CC0000] hover:scale-110 hover:shadow-lg transition-all duration-300 ease-in-out"
            aria-label="YouTube"
          >
            <FaYoutube size={18} />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden relative flex items-center space-x-3">
          {/* Social Media Icons - Mobile (visible when menu is closed) */}
          {!isOpen && (
            <div className="flex items-center space-x-2">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1877F2] text-white hover:bg-[#166FE5] hover:scale-110 hover:shadow-lg transition-all duration-300 ease-in-out"
                aria-label="Facebook"
              >
                <FaFacebook size={16} />
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-[#FF0000] text-white hover:bg-[#CC0000] hover:scale-110 hover:shadow-lg transition-all duration-300 ease-in-out"
                aria-label="YouTube"
              >
                <FaYoutube size={16} />
              </a>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white text-2xl focus:outline-none"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden absolute right-4 top-full mt-2 bg-gray-700 p-4 rounded w-48 shadow-lg">
          <NavItem
            to="/"
            pageName="Home"
            setIsOpen={setIsOpen}
          />
          <NavItem
            to="/events"
            pageName="Events"
            setIsOpen={setIsOpen}
          />
          <NavItem
            to="/gallery"
            pageName="Gallery"
            setIsOpen={setIsOpen}
          />
          <NavItem
            to="/contact-us"
            pageName="Contact Us"
            setIsOpen={setIsOpen}
          />
          <NavItem
            to="/reviews"
            pageName="Reviews"
            setIsOpen={setIsOpen}
          />
          <NavItem
            to="/about-us"
            pageName="About Us"
            setIsOpen={setIsOpen}
          />
          {/* Social Media Icons in Mobile Menu */}
          <div className="flex items-center justify-center space-x-3 mt-4 pt-4 border-t border-gray-600">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1877F2] text-white hover:bg-[#166FE5] hover:scale-110 hover:shadow-lg transition-all duration-300 ease-in-out"
              aria-label="Facebook"
              onClick={() => setIsOpen(false)}
            >
              <FaFacebook size={18} />
            </a>
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FF0000] text-white hover:bg-[#CC0000] hover:scale-110 hover:shadow-lg transition-all duration-300 ease-in-out"
              aria-label="YouTube"
              onClick={() => setIsOpen(false)}
            >
              <FaYoutube size={18} />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
