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
      className={`font-huglove block lg:inline-block ml-0 lg:ml-4 py-3 lg:py-0 px-4 lg:px-0 cursor-pointer transition-colors duration-300 border-b lg:border-b-0  border-rose-200 lg:border-0 ${isActive
        ? "text-rose-500 font-semibold bg-transparent underline decoration-rose-500 decoration-4 underline-offset-[10px]"
        : "text-black lg:text-xl hover:bg-rose-200 lg:hover:bg-transparent lg:hover:text-rose-500"
        }`}
    >
      <span className={`inline-flex items-center relative ${isActive ? "pb-1 after:content-[''] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-1 after:bg-rose-500" : ""}`}>
        {renderPageName()}
      </span>
    </Link>
  );
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="p-3 lg:p-4 w-full fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-rose-50 to-rose-100 shadow-md">
      <div className="flex items-center justify-between lg:justify-center w-full max-w-7xl mx-auto">
        {/* LOGO */}
        <Link to="/" className="flex flex-col items-center leading-tight lg:mr-16">
          <img
            src={ChibiLogo}
            alt="ChibiBadminton Logo"
            className="h-8 lg:h-10 w-auto object-cover"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center lg:ml-16">
          <div className="flex items-center space-x-6 justify-center flex-grow text-xl">
            <NavItem
              to="/"
              setIsOpen={setIsOpen}
              pageName={
                <>
                  h
                  <FaRegHeart className="inline-block w-4 h-4 mx-0.5" />
                  me
                </>
              }
            />
            <NavItem to="/play" pageName="play" setIsOpen={setIsOpen} />
            <NavItem to="/events" pageName="events" setIsOpen={setIsOpen} />
            <NavItem to="/shop" setIsOpen={setIsOpen} pageName={<>sh
              <FaRegHeart className="inline-block w-4 h-4 mx-0.5" />
              p
            </>} />
            <NavItem to="/gallery" pageName="gallery" setIsOpen={setIsOpen} />
            <NavItem
              to="/contact-us"
              setIsOpen={setIsOpen} pageName={<>c
                <FaRegHeart className="inline-block w-4 h-4 mx-0.5" />
                ntact-us
              </>} />
            <NavItem
              to="/about-us"
              setIsOpen={setIsOpen} pageName={<>ab
                <FaRegHeart className="inline-block w-4 h-4 mx-0.5" />
                ut-us
              </>} />
            <NavItem to="/Sign-In" pageName="sign-in" setIsOpen={setIsOpen} />

          </div>

        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-rose-500 text-3xl focus:outline-none hover:text-rose-700 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="lg:hidden absolute left-0 right-0 top-full bg-rose-100 shadow-xl w-full border-t border-rose-200 text-black">
          <div className="w-full">
            <NavItem
              to="/"
              setIsOpen={setIsOpen}
              pageName={
                <>
                  h
                  <FaRegHeart className="inline-block w-4 h-4 mx-0.5" />
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
                  sh
                  <FaRegHeart className="inline-block w-4 h-4 mx-0.5" />
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
                  c
                  <FaRegHeart className="inline-block w-4 h-4 mx-0.5" />
                  ntact Us
                </>
              }
            />
            <NavItem
              to="/about-us"
              setIsOpen={setIsOpen}
              pageName={
                <>
                  ab
                  <FaRegHeart className="inline-block w-4 h-4 mx-0.5" />
                  ut Us
                </>
              }
            />
            <NavItem to="/Sign-In" pageName="sign-in" setIsOpen={setIsOpen} />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
