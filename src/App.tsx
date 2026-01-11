import { Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import EventsPage from "./components/EventsPage";
import GalleryPage from "./components/GalleryPage";
import ShopPage from "./components/ShopPage";
import ProductDetailPage from "./components/ProductDetailPage";
import ContactUsPage from "./components/ContactUsPage";
import ReviewsPage from "./components/ReviewsPage";
import AboutUsPage from "./components/AboutUsPage";
import SignInPage from "./components/SignInPage";

function App() {
  return (
    <div className="min-h-screen flex flex-col transition-all duration-300 w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-grow w-full pt-[56px] lg:pt-[72px]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/product/:id" element={<ProductDetailPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/signin" element={<SignInPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
