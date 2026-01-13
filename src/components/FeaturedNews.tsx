import React from "react";
import { Link } from "react-router-dom";

// import MapleStory from "../assets/MapleStory.png";
import MapleStory2 from "../assets/MapleStory2.png";
import MapleStory3 from "../assets/MapleStory3.png";
import MapleStory4 from "../assets/MapleStory4.png";
import MapleStory5 from "../assets/MapleStory5.png";
import kaisen1 from "../assets/kaisen1.png";


const newsData = [
  {
    id: 1,
    image: kaisen1,
    title: "Kaisen x ChibiBadminton Collaboration",
    description: "Join us for a special collaboration event with Kaisen and ChibiBadminton!",
    badge: "COLLABORATION",
  },
  {
    id: 2,
    image: MapleStory2,
    title: "Store-wide Sale",
    description: "Get up to 50% off on selected items this weekend.",
    badge: "SALE",
  },
  {
    id: 3,
    image: MapleStory3,
    title: "Youth Training Camp",
    description: "Enroll your kids in our professional training camp.",
    badge: "EVENTS",
  },
  {
    id: 4,
    image: MapleStory4,
    title: "New Arrivals: Yonex Gear",
    description: "Latest collection from Yonex is now available in our store.",
    badge: "GENERAL",
  },
  {
    id: 5,
    image: MapleStory5,
    title: "Club Membership Open",
    description: "Become a member and enjoy exclusive benefits.",
    badge: "GENERAL",
  },
];

const badgeColor = (badge: string) => {
  switch (badge) {
    case "SALE":
      return "bg-red-500";
    case "EVENTS":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
};

const FeaturedNews: React.FC = () => {
  const featured = newsData.slice(0, 3);

  return (
    <div className="p-8 bg-gradient-to-b from-pink-100 to-pink-300">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 font-huglove">
          Featured News
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((news) => (
            <div
              key={news.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col"
            >
              <div className="relative flex-grow overflow-hidden">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-contain"
                />
                <span
                  className={`absolute top-2 right-2 text-white text-md font-bold px-2 py-1 rounded ${badgeColor(
                    news.badge
                  )}`}
                >
                  {news.badge}
                </span>
              </div>
              <div className="p-4 flex-shrink-0">
                <h3 className="font-bold text-xl mb-2">{news.title}</h3>
                <p className="text-gray-700 text-sm">{news.description}</p>
                <Link to={`/featured-news/${news.id}`} className="text-rose-500 hover:underline mt-4 inline-block font-semibold">
                  Read More
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/featured-news"
            className="bg-rose-500 text-white font-bold py-2 px-6 rounded-full hover:bg-rose-600 transition-colors"
          >
            View More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedNews;
