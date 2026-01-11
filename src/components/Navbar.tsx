import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaRegHeart } from "react-icons/fa";
import ChibiLogo from "../assets/ChibiLogo.png";

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
    if (typeof pageName === 'string') {
      return pageName.split('').map((char, index) => {
        if (char.toLowerCase() === 'o') {
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

  return (
    <Link
      to={to}
      onClick={() => setIsOpen(false)}
      className={`font-huglove block md:inline-block ml-0 md:ml-4 py-3 md:py-0 px-4 md:px-0 cursor-pointer transition-colors duration-300 border-b md:border-b-0 border-gray-200 md:border-0 ${isActive
        ? "text-white font-semibold bg-gray-100 md:bg-transparent md:text-blue-600"
        : "text-white hover:text-gray-600 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-gray-700"
        }`}
    >
      {renderPageName()}
    </Link>
  );
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="p-3 md:p-4 w-full fixed top-0 left-0 right-0 z-50 bg-neutral-800 shadow-md">
      <div className="flex items-center justify-between md:justify-center w-full max-w-7xl mx-auto">
        {/* LOGO */}
        <Link to="/" className="flex flex-col items-center leading-tight md:mr-16">
          <img
            src={ChibiLogo}
            alt="ChibiBadminton Logo"
            className="h-8 md:h-10 w-auto object-cover"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center ml-16">
          <div className="flex items-center space-x-6 justify-center flex-grow text-xl">
            <NavItem
              to="/"
              setIsOpen={setIsOpen}
              pageName={
                <>
                  H
                  <FaRegHeart className="inline-block w-4 h-4 mx-0.5 text-red-500" />
                  me
                </>
              }
            />
            <NavItem to="/play" pageName="play" setIsOpen={setIsOpen} />
            <NavItem to="/events" pageName="events" setIsOpen={setIsOpen} />
            <NavItem to="/shop" setIsOpen={setIsOpen} pageName={<>Sh
              <FaRegHeart className="inline-block w-4 h-4 mx-0.5 text-red-500" />
              p
            </>} />
            <NavItem to="/gallery" pageName="gallery" setIsOpen={setIsOpen} />
            <NavItem
              to="/contact-us"
              setIsOpen={setIsOpen} pageName={<>C
                <FaRegHeart className="inline-block w-4 h-4 mx-0.5 text-red-500" />
                ntact Us
              </>} />
            <NavItem to="/Sign-In" pageName="SignIn" setIsOpen={setIsOpen} />

          </div>

        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white text-3xl focus:outline-none hover:text-gray-600 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-white shadow-xl w-full border-t border-gray-200">
          <div className="w-full">
            <NavItem
              to="/"
              setIsOpen={setIsOpen}
              pageName={
                <>
                  H
                  <FaRegHeart className="inline-block w-4 h-4 mx-0.5 text-red-500" />
                  me
                </>
              }
            />
            <NavItem to="/play" pageName="play" setIsOpen={setIsOpen} />
            <NavItem to="/events" pageName="events" setIsOpen={setIsOpen} />
            <NavItem
              to="/shop"
              setIsOpen={setIsOpen}
              pageName={
                <>
                  Sh
                  <FaRegHeart className="inline-block w-4 h-4 mx-0.5 text-red-500" />
                  p
                </>
              }
            />
            <NavItem to="/gallery" pageName="gallery" setIsOpen={setIsOpen} />
            <NavItem
              to="/contact-us"
              setIsOpen={setIsOpen}
              pageName={
                <>
                  C
                  <FaRegHeart className="inline-block w-4 h-4 mx-0.5 text-red-500" />
                  ntact Us
                </>
              }
            />
            <NavItem to="/Sign-In" pageName="SignIn" setIsOpen={setIsOpen} />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
