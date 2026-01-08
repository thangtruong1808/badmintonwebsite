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
  <button
    onClick={() => {
      setCurrentPage(pageName);
      setIsOpen(false);
    }}
    className="block md:inline-block ml-0 md:ml-4 hover:text-blue-400 py-2 md:py-0"
  >
    {pageName}
  </button>
);

interface NavbarProps {
  setCurrentPage: (page: string) => void;
  toggleTheme: () => void;
  theme: string;
}

const Navbar: React.FC<NavbarProps> = ({
  setCurrentPage,
  toggleTheme,
  theme,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="Navbar p-4 bg-[var(--navbar-bg)] text-[var(--navbar-text)]">
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold">ChibiBadminton</div>
        <div className="hidden md:flex items-center">
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
          <button
            onClick={() => {
              toggleTheme();
              setIsOpen(false);
            }}
            className="ml-4 px-3 py-1 bg-[var(--navbar-mobile-bg)] rounded text-[var(--navbar-text)]"
          >
            {theme === "white" ? "🌙" : "🌞"}
          </button>
        </div>
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[var(--navbar-text)] text-2xl"
          >
            ☰
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-[var(--navbar-mobile-bg)] p-4 mt-2 rounded">
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
          <button
            onClick={() => {
              toggleTheme();
              setIsOpen(false);
            }}
            className="block mt-2 px-3 py-1 bg-[var(--navbar-bg)] rounded text-[var(--navbar-text)]"
          >
            {theme === "white" ? "🌙" : "🌞"}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
