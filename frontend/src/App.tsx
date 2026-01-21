import { Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import EventsPage from "./components/EventsPage";
import GalleryPage from "./components/GalleryPage";
import ShopPage from "./components/ShopPage";
import ProductDetailPage from "./components/ProductDetailPage";
import ServicesPage from "./components/ServicesPage";
import ContactUsPage from "./components/ContactUsPage";
import ReviewsPage from "./components/ReviewsPage";
import AboutUsPage from "./components/AboutUsPage";
import SignInPage from "./components/SignInPage";
import RegisterPage from "./components/RegisterPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import FeaturedNewsPage from "./components/FeaturedNewsPage";
import PlayPage from "./components/PlayPage";
import NewsDetailPage from "./components/NewsDetailPage";
import UserProfilePage from "./components/UserProfilePage/UserProfilePage";

function App() {
  return (
    <div className="min-h-screen flex flex-col transition-all duration-300 w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-grow w-full pt-[56px] lg:pt-[72px] relative">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/product/:id" element={<ProductDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/featured-news" element={<FeaturedNewsPage />} />
          <Route path="/featured-news/:id" element={<NewsDetailPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
