import { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import EventsPage from "./components/EventsPage";
import GalleryPage from "./components/GalleryPage";
import ContactUsPage from "./components/ContactUsPage";
import ReviewsPage from "./components/ReviewsPage";
import AboutUsPage from "./components/AboutUsPage";

function App() {
  const [currentPage, setCurrentPage] = useState("Home");

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
    <div className="app-container min-h-screen flex flex-col transition-all duration-300">
      <Navbar setCurrentPage={setCurrentPage} />
      <main className="flex-grow my-10">{renderPage()}</main>
      <Footer />
    </div>
  );
}

export default App;
