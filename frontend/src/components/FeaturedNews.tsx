import React from "react";
import { Link } from "react-router-dom";
import ChibiBattleRoyale4 from "../assets/ChibiBattleRoyale4.jpg";


import MapleStory2 from "../assets/MapleStory2.png";
import MapleStory3 from "../assets/MapleStory3.png";
import MapleStory4 from "../assets/MapleStory4.png";
import MapleStory5 from "../assets/MapleStory5.png";

const newsData = [
  {
    id: 1,
    image: ChibiBattleRoyale4,
    title: "Chibi Battle Royale #4",
    date: "February 2026",
    time: " 9:30 AM - 5:00 PM",
    location: "ACM Truganina - 48, Saintly Drive, Truganina VIC 3029",
    description:
      "This is a team-based event consisting of 4 players. Tap Register Now to find all information about the event",
    badge: "UPCOMING",
  },
  {
    id: 2,
    image: MapleStory2,
    title: "Chibi Battle Royale #3",
    date: "November 12, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Altona Meadows Badminton Club",
    description:
      "The third ever ChibiBadminton Battle Royale. 104 players competed for the title of ChibiBadminton Champion. The event was a success and we are looking forward to the next one!",
    badge: "COMPLETED",
  },
  {
    id: 3,
    image: MapleStory3,
    title: "Youth Training Camp",
    description: "Enroll your kids in our professional training camp.",
    badge: "COMPLETED",
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
      return "bg-rose-500";
  }
};


const FeaturedNews: React.FC = () => {
  const featured = newsData.slice(0, 3);

  return (
    <div className="p-8 bg-gradient-to-b from-pink-100 to-pink-300">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 font-huglove">
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
                  className="w-full h-auto object-contain"
                />
                <span
                  className={`absolute top-2 right-2 text-white text-md font-bold px-2 py-1 rounded font-calibri ${badgeColor(
                    news.badge
                  )}`}
                >
                  {news.badge}
                </span>
              </div>
              <div className="p-4 flex-shrink-0">
                <h3 className="font-bold text-3xl mb-2 font-calibri">{news.title}</h3>
                <p className="text-gray-800 text-lg font-calibri text-justify">{news.description}</p>
                <p className="text-gray-800 text-lg font-calibri">Date: {news.date}</p>
                <p className="text-gray-800 text-lg font-calibri">Time: {news.time}</p>
                <p className="text-gray-800 text-lg font-calibri">Location: {news.location}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8 ">
          <Link
            to="/featured-news"
            className="bg-rose-500 text-white font-bold py-2 px-6 rounded-full hover:bg-rose-600 transition-colors font-calibri"
          >
            View More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedNews;
