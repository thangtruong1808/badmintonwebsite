import React from "react";

import DemonSlayerWednesday from "../assets/DemonSlayerW.png";
import MapleStoryFriday from "../assets/MapleStoryF.png";

const FeaturedImages: React.FC = () => {
  return (
    <div className="pt-8 px-8 pb-0 bg-gradient-to-t from-pink-100 to-pink-300">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 font-huglove">
          Featured Images
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Image */}
          <div className="text-center">
            <img
              src={DemonSlayerWednesday}
              alt="Chibi Wednesday Playtime"
              className="rounded-lg shadow-2xl hover:shadow-3xl transition-all duration-300 mb-4 w-full h-auto object-cover"
            />
            <p className="text-md md:text-lg text-gray-700">
              Chibi Wednesday Playtime from 7:00 PM to 10:00 PM
            </p>
          </div>

          {/* Right Image */}
          <div className="text-center">
            <img
              src={MapleStoryFriday}
              alt="Chibi Friday Playtime"
              className="rounded-lg shadow-2xl hover:shadow-3xl transition-all duration-300 mb-4 w-full h-auto object-cover"
            />
            <p className="text-md md:text-lg text-gray-700">
              Chibi Friday Playtime from 7:00 PM to 10:00 PM
            </p>
          </div>

          {/* Note Section — centered under both images */}
          <div className="text-center text-md md:text-lg md:col-span-2 text-gray-700 mb-8">
            Please contact us for any questions or to schedule a time. Please
            check the events page for the most up to date information.
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedImages;
