import { useState } from "react";
import { FaFacebook, FaYoutube } from "react-icons/fa";

interface NavItemProps {
  setCurrentPage: (page: string) => void;
  pageName: string;
  setIsOpen: (open: boolean) => void;
}

const NavItem: React.FC<NavItemProps> = ({
  setCurrentPage,
  pageName,
  setIsOpen,
}) => (
  <span
    onClick={() => {
      setCurrentPage(pageName);
      setIsOpen(false);
    }}
    className="block md:inline-block ml-0 md:ml-4 text-white hover:text-blue-400 py-2 md:py-0 cursor-pointer transition-colors duration-00"
  >
    {pageName}
  </span>
);

interface NavbarProps {
  setCurrentPage: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setCurrentPage }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="p-4 bg-slate-500 text-white w-full fixed top-0 left-0 right-0 z-10">
      <div className="flex items-center justify-between w-full">
        {/* LOGO + TEXT STACKED */}
        <div className="flex flex-col items-start leading-tight">
          <span className="text-xl font-bold whitespace-nowrap">
            ChibiBadminton
          </span>
        </div>

        {/* RIGHT — nav items start from the left of this column */}
        <div className="hidden md:flex items-center space-x-6 justify-center flex-grow text-lg font-medium">
          <NavItem
            setCurrentPage={setCurrentPage}
            pageName="Home"
            setIsOpen={setIsOpen}
          />

          <NavItem
            setCurrentPage={setCurrentPage}
            pageName="Events"
            setIsOpen={setIsOpen}
          />
          <NavItem
            setCurrentPage={setCurrentPage}
            pageName="Gallery"
            setIsOpen={setIsOpen}
          />
          <NavItem
            setCurrentPage={setCurrentPage}
            pageName="Contact Us"
            setIsOpen={setIsOpen}
          />
          <NavItem
            setCurrentPage={setCurrentPage}
            pageName="Reviews"
            setIsOpen={setIsOpen}
          />
          <NavItem
            setCurrentPage={setCurrentPage}
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
            setCurrentPage={setCurrentPage}
            pageName="Home"
            setIsOpen={setIsOpen}
          />
          <NavItem
            setCurrentPage={setCurrentPage}
            pageName="Events"
            setIsOpen={setIsOpen}
          />
          <NavItem
            setCurrentPage={setCurrentPage}
            pageName="Gallery"
            setIsOpen={setIsOpen}
          />
          <NavItem
            setCurrentPage={setCurrentPage}
            pageName="Contact Us"
            setIsOpen={setIsOpen}
          />
          <NavItem
            setCurrentPage={setCurrentPage}
            pageName="Reviews"
            setIsOpen={setIsOpen}
          />
          <NavItem
            setCurrentPage={setCurrentPage}
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
