import { useState } from "react";

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
    className="block md:inline-block ml-0 md:ml-4 text-white hover:text-blue-400 py-2 md:py-0 cursor-pointer transition-colors duration-800"
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
      <div className="flex items-center justify-start space-x-4">
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
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white text-2xl"
          >
            ☰
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-gray-700 p-4 mt-2 rounded">
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
      )}
    </nav>
  );
};

export default Navbar;
