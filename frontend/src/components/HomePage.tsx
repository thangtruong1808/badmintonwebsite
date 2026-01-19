import { useEffect } from "react";

import BannerCarousel from "./BannerCarousel";
import FeaturedNews from "./FeaturedNews";
import FeaturedImages from "./FeaturedImages";

const HomePage = () => {
  useEffect(() => {
    document.title = "ChibiBadminton - Home";
  }, []);

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Banner Section - Entirely below navbar */}
      <FeaturedNews />
      <BannerCarousel />


      <FeaturedImages />
      {/* Description Section */}
      {/* <div className="text-center mb-8">
          <p className="text-md md:text-xl mb-6 max-w-7xl mx-auto px-4 text-gray-700">
            Whether you're a beginner or a seasoned pro, join our social groups
            to stay updated on events, tips, and exclusive content. We are a
            group of badminton enthusiasts who are dedicated to promoting
            badminton excellence and social engagement.
          </p>
        </div> */}

      {/* Carousel */}
      {/* <div className="relative w-full flex justify-center mb-12 h-48 md:h-72 overflow-hidden">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="ChibiBadminton Logo"
              className={`
              absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700 ease-in-out
              ${i === index ? "opacity-100" : "opacity-0"}
              max-h-48 max-w-48 md:max-h-72 md:max-w-72 w-auto h-auto object-contain
            `}
            />
          ))}
        </div> */}
      {/* Featured Images Section */}


      {/* Call to Action Section */}
      {/* <section className="bg-white py-16 px-4 md:px-8 w-full rounded-lg shadow-lg">
          <div className="max-w-4xl mx-auto text-center w-full">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-700">
              Ready to Join the Fun?
            </h2>
            <p className="text-center text-md md:text-lg md:col-span-2 mb-6 text-gray-700">
              Whether you're a beginner or a pro, there's a place for you in our
              social groups.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <span className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300">
                <GiShuttlecock size={24} />
                Let's Play!
              </span>
            </div>
          </div>
        </section> */}
    </div>
  );
};

export default HomePage;
