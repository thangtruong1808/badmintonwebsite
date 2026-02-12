import { useEffect } from "react";

import BannerCarousel from "./BannerCarousel";
import FeaturedNews from "./FeaturedNews";
import NewsletterPopup from "./NewsletterPopup";
// import FeaturedImages from "./FeaturedImages";

const HomePage = () => {
  useEffect(() => {
    document.title = "ChibiBadminton - Home";
  }, []);

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Banner Section - Entirely below navbar */}
      <FeaturedNews />
      <BannerCarousel />
      <NewsletterPopup />
    </div>
  );
};

export default HomePage;
