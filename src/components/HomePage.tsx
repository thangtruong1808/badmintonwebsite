import { useState, useEffect } from "react";
import { GiShuttlecock } from "react-icons/gi";

import MapleStory from "../assets/MapleStory.png";
import MapleStory2 from "../assets/MapleStory2.png";
import MapleStory3 from "../assets/MapleStory3.png";
import MapleStory4 from "../assets/MapleStory4.png";
import MapleStory5 from "../assets/MapleStory5.png";
import DemonSlayerWednesday from "../assets/DemonSlayerW.png";
import MapleStoryFriday from "../assets/MapleStoryF.png";

const images = [MapleStory, MapleStory2, MapleStory3, MapleStory4, MapleStory5];

const HomePage = () => {
  const [index, setIndex] = useState(0);

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-x-hidden">
      <div className="px-4 md:p-8 max-w-6xl mx-auto min-h-full">
        {/* banner */}

        {/* Intro Section */}
        <h1 className="text-2xl md:text-4xl font-bold mb-6 text-center">
          Welcome to ChibiBadminton's Social Groups
        </h1>

        {/* Carousel */}
        <div className="relative w-full flex justify-center mb-6 h-48 md:h-72 overflow-hidden">
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
        </div>

        <p className="text-md md:text-lg mb-6 max-w-5xl mx-auto text-center px-4 text-black">
          Your ultimate resource for all things badminton. Whether you're a
          beginner or a seasoned pro, join our community to stay updated on
          events, tips, and exclusive content.
        </p>
        {/* Featured Images Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 bg-slate-50 p-6 md:p-8 rounded-lg mb-16 max-w-7xl mx-auto">

          {/* Left Image */}
          <div className="text-center">
            <img
              src={DemonSlayerWednesday}
              alt="Chibi Wednesday Playtime"
              className="rounded-lg shadow-lg mb-4 w-full h-auto object-cover"
            />
            <p className="text-md md:text-lg text-blue-600">
              Chibi Wednesday Playtime from 7:00 PM to 10:00 PM
            </p>
          </div>

          {/* Right Image */}
          <div className="text-center">
            <img
              src={MapleStoryFriday}
              alt="Chibi Friday Playtime"
              className="rounded-lg shadow-lg mb-4 w-full h-auto object-cover"
            />
            <p className="text-md md:text-lg text-blue-600">
              Chibi Friday Playtime from 7:00 PM to 10:00 PM
            </p>
          </div>

          {/* Note Section — centered under both images */}
          <div className="text-center text-md md:text-lg md:col-span-2 text-black">
            Please contact us for any questions or to schedule a time.
            Please check the events page for the most up to date information.
          </div>

        </div>

        {/* Call to Action Section */}
        <section className="bg-slate-50 py-16 px-4 md:px-8 w-full">
          <div className="max-w-4xl mx-auto text-center w-full">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 text-black">
              Ready to Join the Fun?
            </h2>
            <p className="text-center text-md md:text-lg md:col-span-2 mb-6 text-black">
              Whether you're a beginner or a pro, there's a place for you in our
              community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300">
                <GiShuttlecock size={24} />
                Let's Play!
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
