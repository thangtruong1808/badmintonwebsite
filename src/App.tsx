import { useState } from "react";
import "./App.css";
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import EventsPage from './components/EventsPage';
import GalleryPage from './components/GalleryPage';
import ContactUsPage from './components/ContactUsPage';
import ReviewsPage from './components/ReviewsPage';
import AboutUsPage from './components/AboutUsPage';

function App() {
  const [currentPage, setCurrentPage] = useState("Home");
  const [theme, setTheme] = useState("white"); // 'white' or 'cartoon'

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "white" ? "cartoon" : "white"));
  };

  const renderPage = () => {
    switch (currentPage) {
      case "Home":
        return <HomePage />;
      case "Events":
        return <EventsPage />;
      case "Gallery":
        return <GalleryPage />;
      case "Contact Us":
        return <ContactUsPage />;
      case "Reviews":
        return <ReviewsPage />;
      case "About Us":
        return <AboutUsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className={`app-container ${theme}-theme min-h-screen flex flex-col transition-all duration-300`}>
      <Navbar setCurrentPage={setCurrentPage} toggleTheme={toggleTheme} theme={theme} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
