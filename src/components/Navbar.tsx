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
          className={`inline-flex items-center relative px-2 lg:px-4 py-1 rounded-full transition-colors duration-300 ${
            isActive
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
      className={`font-huglove text-xl lg:text-2xl block lg:inline-block py-3 lg:py-0 px-2 lg:px-4 cursor-pointer transition-colors duration-300 border-b lg:border-b-0 border-rose-200 lg:border-0 ${
        isActive
          ? "text-rose-500 font-semibold bg-transparent underline decoration-rose-500 decoration-4 underline-offset-[10px]"
          : "text-black hover:text-black hover:bg-rose-300 lg:hover:bg-transparent lg:hover:text-rose-500 rounded-md"
      }`}
    >
      <span
        className={`inline-flex items-center relative ${
          isActive
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="p-3 lg:p-4 w-full fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-rose-50 to-rose-100 shadow-md">
      <div className="flex items-center justify-between lg:justify-center w-full max-w-7xl mx-auto">
        {/* LOGO */}
        <Link
          to="/"
          className="flex flex-col items-center leading-tight lg:mr-16"
        >
          <img
            src={ChibiLogo}
            alt="ChibiBadminton Logo"
            className="h-8 lg:h-10 w-auto object-cover"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center lg:ml-16">
          <div className="flex items-center space-x-4 justify-center flex-grow text-2xl">
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
            <NavItem to="/signin" pageName="sign-in" setIsOpen={setIsOpen} />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center">
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
            <NavItem to="/signin" pageName="sign-in" setIsOpen={setIsOpen} />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
