import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ChibiBattleRoyale4 from "../assets/ChibiBattleRoyale4.png";
import MapleStory3 from "../assets/MapleStory3.png";
import WednesdaySocialPlaytime from "../assets/WednesdaySocialPlaytime.png";
import { socialEvents } from "../data/socialEvents";
import type { SocialEvent } from "../types/socialEvent";
import RegistrationModal from "./PlayPage/RegistrationModal";
import { FaArrowRight } from "react-icons/fa";

// Simulated fake news data
const allNewsData = [
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
    category: "Events",
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
    category: "Latest",
    link: "https://docs.google.com/forms/d/e/1FAIpQLSc-JLX4pyrKoz8-G0CUKdFDrorKanOHJ_d1XmRB7TZoYS1ozQ/viewform",
  },
  {
    id: 3,
    image: MapleStory3,
    title: "Registration new players",
    date: "Every Wednesday",
    time: "7:00 PM - 10:00 PM",
    location: "Altona SportsPoint Badminton Club",
    description: "Register for yourself or your friends. Tap Register Now to find all information about the event",
    badge: "OPEN",
    category: "Info",
    link: "https://badmintonwebsite.vercel.app/signin",
  },
  {
    id: 4,
    image: ChibiBattleRoyale4,
    title: "Chibi Battle Royale #3 Recap",
    date: "January 2026",
    time: "9:00 AM - 4:00 PM",
    location: "ACM Truganina - 48, Saintly Drive, Truganina VIC 3029",
    description:
      "Thank you to everyone who participated in our third Battle Royale tournament! Check out the highlights and results from this exciting event.",
    badge: "UPCOMING",
    category: "Updates",
    link: "#",
  },
  {
    id: 5,
    image: WednesdaySocialPlaytime,
    title: "Friday Night Social Sessions",
    date: "Every Friday",
    time: "7:00 PM - 10:00 PM",
    location: "Altona SportsPoint Badminton Club",
    description:
      "Join us every Friday for our evening social badminton sessions. Great way to unwind after a long week and meet fellow players!",
    badge: "REGULAR",
    category: "Latest",
    link: "#",
  },
  {
    id: 6,
    image: MapleStory3,
    title: "New Equipment Available",
    date: "Ongoing",
    time: "All Day",
    location: "Club Facilities",
    description:
      "We've added new rackets and shuttlecocks to our equipment collection. Members can now access premium gear for their games.",
    badge: "OPEN",
    category: "Info",
    link: "#",
  },
  {
    id: 7,
    image: ChibiBattleRoyale4,
    title: "Summer Tournament Announcement",
    date: "March 2026",
    time: "10:00 AM - 6:00 PM",
    location: "TBA",
    description:
      "Get ready for our biggest tournament of the year! Registration opens soon. Stay tuned for more details and early bird discounts.",
    badge: "UPCOMING",
    category: "Events",
    link: "#",
  },
  {
    id: 8,
    image: WednesdaySocialPlaytime,
    title: "Coaching Sessions Available",
    date: "Every Saturday",
    time: "2:00 PM - 4:00 PM",
    location: "Altona SportsPoint Badminton Club",
    description:
      "Professional coaching sessions now available for all skill levels. Improve your technique and strategy with our experienced coaches.",
    badge: "REGULAR",
    category: "Info",
    link: "#",
  },
  {
    id: 9,
    image: MapleStory3,
    title: "Member Spotlight: Player of the Month",
    date: "February 2026",
    time: "All Month",
    location: "Club",
    description:
      "Congratulations to our Player of the Month! Read about their journey and achievements in badminton.",
    badge: "OPEN",
    category: "Updates",
    link: "#",
  },
  {
    id: 10,
    image: ChibiBattleRoyale4,
    title: "Youth Development Program",
    date: "Starting March 2026",
    time: "Saturdays 10:00 AM - 12:00 PM",
    location: "Altona SportsPoint Badminton Club",
    description:
      "New program designed for young players aged 8-16. Focus on fundamentals, fun, and building a love for the sport.",
    badge: "UPCOMING",
    category: "Events",
    link: "#",
  },
  {
    id: 11,
    image: WednesdaySocialPlaytime,
    title: "Facility Improvements Complete",
    date: "February 2026",
    time: "All Day",
    location: "Club Facilities",
    description:
      "Our recent facility upgrades are now complete! New lighting, improved court surfaces, and updated amenities for all members.",
    badge: "OPEN",
    category: "Updates",
    link: "#",
  },
  {
    id: 12,
    image: MapleStory3,
    title: "Weekend Doubles Tournament",
    date: "February 15, 2026",
    time: "9:00 AM - 5:00 PM",
    location: "ACM Truganina",
    description:
      "Team up for our doubles tournament! Open to all members. Prizes and trophies for winners. Registration required.",
    badge: "UPCOMING",
    category: "Events",
    link: "#",
  },
];

type FilterType = "All" | "Latest" | "Info" | "Updates" | "Events";

const FeaturedNewsPage: React.FC = () => {
  useEffect(() => {
    document.title = "ChibiBadminton - Featured News";
  }, []);

  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All");
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationEvents, setRegistrationEvents] = useState<SocialEvent[]>([]);
  const [itemsToShow, setItemsToShow] = useState(6); // Show 6 items initially
  const itemsPerLoad = 6; // Load 6 more items each time

  const filterOptions: FilterType[] = ["All", "Latest", "Info", "Updates", "Events"];

  const filteredNews = allNewsData.filter((news) => {
    if (selectedFilter === "All") return true;
    return news.category === selectedFilter;
  });

  // Featured banner cards (first 3 items)
  const featuredNews = filteredNews.slice(0, 3);

  // News list (excluding the first 3 featured items)
  const listNews = filteredNews.slice(3);
  const displayedNews = listNews.slice(0, itemsToShow);
  const hasMore = listNews.length > itemsToShow;

  const handleLoadMore = () => {
    setItemsToShow((prev) => prev + itemsPerLoad);
  };

  // Reset items to show when filter changes
  useEffect(() => {
    setItemsToShow(6);
  }, [selectedFilter]);

  const handleRegisterClick = (news: (typeof allNewsData)[number]) => {
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
    <div className="w-full overflow-x-hidden min-h-screen bg-gradient-to-r from-rose-50 to-rose-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-huglove text-center">
            Featured News
          </h1>
        </div>

        {/* Featured Banner - 3 Cards */}
        {featuredNews.length > 0 && (
          <div className="mb-8 md:mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {featuredNews.map((news) => (
                <div
                  key={news.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200"
                  onClick={() => handleRegisterClick(news)}
                >
                  {/* Image */}
                  <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-100">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-full object-contain p-3"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-base md:text-lg mb-2 font-calibri text-gray-900 line-clamp-2">
                      {news.title}
                    </h3>
                    <p className="text-gray-600 text-sm font-calibri mb-3 line-clamp-2">
                      {news.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 font-calibri">
                      <span>{news.date}</span>
                      <Link
                        to={`/featured-news/${news.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-rose-500 hover:text-rose-600 transition-colors"
                      >
                        {news.category}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-8 md:mb-10 flex flex-wrap gap-2 md:gap-3 border-b border-gray-200 pb-4">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 text-sm md:text-base font-medium transition-colors duration-200 font-calibri border-b-2 ${selectedFilter === filter
                ? "text-rose-500 border-rose-500"
                : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* News List - Vertical Layout */}
        <div className="space-y-4 md:space-y-6">
          {displayedNews.map((news) => (
            <div
              key={news.id}
              className="flex flex-col md:flex-row gap-4 md:gap-6 pb-4 md:pb-6 border-b border-gray-200 last:border-b-0 hover:bg-white/50 transition-colors duration-200 rounded-lg p-2 md:p-3 -m-2 md:-m-3 bg-white/30"
            >
              {/* Image Section - Smaller, square-like */}
              <div className="relative w-full md:w-48 lg:w-56 h-48 md:h-48 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-contain p-2"
                />
              </div>

              {/* Content Section */}
              <div className="flex-1 flex flex-col min-w-0">
                <h3 className="font-bold text-lg md:text-xl mb-2 font-calibri text-gray-900 hover:text-rose-500 transition-colors cursor-pointer">
                  {news.title}
                </h3>
                <p className="text-gray-600 text-sm md:text-base font-calibri mb-3 line-clamp-2">
                  {news.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 font-calibri mb-3">
                  {news.date && <span>{news.date}</span>}
                </div>
                <div className="mt-auto flex items-center gap-3">
                  <button
                    onClick={() => handleRegisterClick(news)}
                    className="text-rose-500 hover:text-rose-600 font-medium text-sm md:text-base font-calibri transition-colors"
                  >
                    Register Now
                  </button>
                  <span className="text-gray-300">|</span>
                  <Link
                    to={`/featured-news/${news.id}`}
                    className="text-gray-600 hover:text-gray-900 font-medium text-sm md:text-base font-calibri transition-colors"
                  >
                    {news.category}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-8 md:mt-12">
            <button
              onClick={handleLoadMore}
              className="text-rose-500 hover:text-rose-600 font-medium text-base md:text-lg font-calibri transition-colors font-calibri bg-rose-500 text-white px-4 py-2 rounded-full flex items-center justify-center gap-2"
            >
              <span className="font-calibri text-lg font-bold">Load More</span> <FaArrowRight className="text-lg" />
            </button>
          </div>
        )}
        {/* Show message if only banner items exist */}
        {featuredNews.length > 0 && listNews.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm font-calibri">
              Showing all available news items above.
            </p>
          </div>
        )}
      </div>

      {/* Registration Modal for Wednesday Playtime */}
      <RegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        events={registrationEvents}
        isMultiEvent={registrationEvents.length > 1}
        onSuccess={(_updatedEvents) => {
          // No-op for now; PlayPage handles updates in detail
        }}
      />
    </div>
  );
};

export default FeaturedNewsPage;
