import React, { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { Link } from "react-router-dom";
import ChibiBattleRoyale4 from "../assets/ChibiBattleRoyale4.jpg";


import WednesdaySocialPlaytime from "../assets/WednesdaySocialPlaytime.png";
import MapleStory3 from "../assets/MapleStory3.png";
import RegistrationModal from "./PlayPage/RegistrationModal";
import { socialEvents } from "../data/socialEvents";
import type { SocialEvent } from "../types/socialEvent";

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
    link: "https://docs.google.com/forms/d/e/1FAIpQLSc-JLX4pyrKoz8-G0CUKdFDrorKanOHJ_d1XmRB7TZoYS1ozQ/viewform",
  },
  {
    id: 2,
    image: WednesdaySocialPlaytime,
    title: "Wednesday Social Playtime",
    date: "Every Wednesday",
    time: "7:00 PM - 10:00 PM",
    location: "Altona SportsPoint Badminton Club",
    description:
      "Weekly Wednesday social play session. All skill levels welcome! Perfect way to start your week with some badminton action.",
    badge: "REGULAR",
    link: "https://docs.google.com/forms/d/e/1FAIpQLSc-JLX4pyrKoz8-G0CUKdFDrorKanOHJ_d1XmRB7TZoYS1ozQ/viewform",
  },
  {
    id: 3,
    image: MapleStory3,
    title: "Registration new players",
    description: "Register for yourself or your friends. Tap Register Now to find all information about the event",
    badge: "OPEN",
    link: "https://badmintonwebsite.vercel.app/signin",
  },
  // {
  //   id: 4,
  //   image: MapleStory4,
  //   title: "New Arrivals: Yonex Gear",
  //   description: "Latest collection from Yonex is now available in our store.",
  //   badge: "GENERAL",
  // },
  // {
  //   id: 5,
  //   image: MapleStory5,
  //   title: "Club Membership Open",
  //   description: "Become a member and enjoy exclusive benefits.",
  //   badge: "GENERAL",
  // },
];

const badgeColor = (badge: string) => {
  switch (badge) {
    case "UPCOMING":
      return "bg-green-500";
    case "REGULAR":
      return "bg-yellow-500";
    case "OPEN":
      return "bg-red-500";
    default:
      return "bg-rose-500";
  }
};


const FeaturedNews: React.FC = () => {
  const featured = newsData.slice(0, 3);

  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationEvents, setRegistrationEvents] = useState<SocialEvent[]>([]);

  const handleRegisterClick = (news: (typeof newsData)[number]) => {
    // For Wednesday Social Playtime, open the registration modal (like PlayPage)
    if (news.title === "Wednesday Social Playtime") {
      const wednesdayEvent = socialEvents.find(
        (event) => event.title === "Wednesday Playtime"
      );

      if (wednesdayEvent) {
        setRegistrationEvents([wednesdayEvent]);
        setIsRegistrationModalOpen(true);
        return;
      }
    }

    // Fallback: open external link (existing behaviour)
    if (news.link) {
      window.open(news.link, "_blank");
    }
  };

  return (
    <div className="p-16 bg-gradient-to-b from-pink-100 to-pink-200">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 font-huglove">
          Featured News
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              <div className="p-4 flex-shrink-0">
                <button
                  onClick={() => handleRegisterClick(news)}

                  className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 font-calibri"
                >
                  <div className="flex items-center justify-center gap-4">
                    <FaPaperPlane size={18} />
                    <span className="font-calibri text-md font-bold">Register Now</span>
                  </div>
                </button>
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
      {/* Registration Modal for Wednesday Playtime */}
      <RegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        events={registrationEvents}
        isMultiEvent={registrationEvents.length > 1}
        onSuccess={(_updatedEvents) => {
          // No-op for now on the homepage; PlayPage handles updates in detail
        }}
      />
    </div>
  );
};

export default FeaturedNews;
