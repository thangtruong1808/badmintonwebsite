import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import Banner from "../assets/BannerMain.png";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  attendees: number;
  imageUrl: string;
  status: "completed" | "upcoming";
}

const events: Event[] = [
  {
    id: 1,
    title: "Summer Badminton Tournament 2024",
    date: "January 15, 2024",
    time: "9:00 AM - 5:00 PM",
    location: "Main Badminton Court",
    description: "An exciting summer tournament featuring players from all skill levels. Join us for a day of competitive matches and fun!",
    attendees: 45,
    imageUrl: "https://picsum.photos/id/20/600/400",
    status: "completed",
  },
  {
    id: 2,
    title: "Weekly Social Badminton Session",
    date: "January 22, 2024",
    time: "7:00 PM - 10:00 PM",
    location: "Community Sports Center",
    description: "Regular weekly session for badminton enthusiasts. All levels welcome!",
    attendees: 32,
    imageUrl: "https://picsum.photos/id/25/600/400",
    status: "completed",
  },
  {
    id: 3,
    title: "ChibiBadminton Championship Finals",
    date: "February 5, 2024",
    time: "10:00 AM - 6:00 PM",
    location: "Olympic Badminton Hall",
    description: "The grand finale of our championship series. Watch the best players compete for the title!",
    attendees: 80,
    imageUrl: "https://picsum.photos/id/30/600/400",
    status: "completed",
  },
  {
    id: 4,
    title: "Beginner's Workshop & Practice",
    date: "February 12, 2024",
    time: "6:00 PM - 8:00 PM",
    location: "Training Court A",
    description: "Perfect for beginners! Learn basic techniques and practice with fellow newcomers.",
    attendees: 25,
    imageUrl: "https://picsum.photos/id/40/600/400",
    status: "completed",
  },
  {
    id: 5,
    title: "Social Mixer - Badminton & BBQ",
    date: "February 20, 2024",
    time: "5:00 PM - 10:00 PM",
    location: "Outdoor Courts & BBQ Area",
    description: "Combine your love for badminton with great food! Social mixer event with BBQ dinner.",
    attendees: 60,
    imageUrl: "https://picsum.photos/id/50/600/400",
    status: "completed",
  },
  {
    id: 6,
    title: "Advanced Skills Clinic",
    date: "March 1, 2024",
    time: "2:00 PM - 5:00 PM",
    location: "Advanced Training Facility",
    description: "For intermediate and advanced players. Focus on advanced techniques and strategies.",
    attendees: 28,
    imageUrl: "https://picsum.photos/id/60/600/400",
    status: "completed",
  },
  {
    id: 7,
    title: "Spring Badminton Open",
    date: "March 15, 2024",
    time: "9:00 AM - 6:00 PM",
    location: "Spring Sports Complex",
    description: "Annual spring tournament open to all members. Register now!",
    attendees: 0,
    imageUrl: "https://picsum.photos/id/70/600/400",
    status: "upcoming",
  },
];

const EventsPage = () => {
  const completedEvents = events.filter((event) => event.status === "completed");
  const upcomingEvents = events.filter((event) => event.status === "upcoming");

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Banner Section - No gap to navbar */}
      <div className="relative w-full overflow-hidden">
        <div className="relative w-full h-[30vh] md:h-[30vh] lg:h-[30vh]">
          <img
            src={Banner}
            alt="ChibiBadminton Banner"
            className="w-full h-full object-contain"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>

          {/* Header Text Over Banner */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white drop-shadow-lg">
              Events History
            </h1>
            <p className="text-base md:text-xl lg:text-2xl text-white max-w-3xl mx-auto drop-shadow-md font-medium">
              Explore Our Badminton Events & Social Gatherings
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-12 md:py-16 max-w-7xl mx-auto min-h-full">
        {/* Upcoming Events Section - Full Width */}
        {upcomingEvents.length > 0 && (
          <section className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-black">
                Upcoming Events
              </h2>
              <p className="text-gray-600 text-lg">
                Don't miss out on these exciting upcoming events!
              </p>
            </div>
            <div className="w-full space-y-6">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-green-500 w-full"
                >
                  <div className="flex flex-col md:flex-row w-full">
                    <div className="relative w-full md:w-1/3 h-64 md:h-auto overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        Upcoming
                      </div>
                    </div>
                    <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-black">
                          {event.title}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center text-gray-600">
                            <FaCalendarAlt className="mr-3 text-green-600" size={18} />
                            <span className="text-base">{event.date}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaClock className="mr-3 text-green-600" size={18} />
                            <span className="text-base">{event.time}</span>
                          </div>
                          <div className="flex items-center text-gray-600 md:col-span-2">
                            <FaMapMarkerAlt className="mr-3 text-green-600" size={18} />
                            <span className="text-base">{event.location}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 text-base mb-6 leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 text-lg">
                          Register Now
                        </button>
                        <button className="flex-1 bg-white hover:bg-gray-50 text-green-600 border-2 border-green-600 font-semibold py-3 px-6 rounded-lg transition duration-300 text-lg">
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Events History Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-black">
              Events History
            </h2>
            <p className="text-gray-600 text-lg">
              Take a look back at our amazing past events and gatherings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {completedEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Completed
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-black line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="mr-2 text-green-600" size={16} />
                      <span className="text-sm">{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaClock className="mr-2 text-green-600" size={16} />
                      <span className="text-sm">{event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="mr-2 text-green-600" size={16} />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaUsers className="mr-2 text-green-600" size={16} />
                      <span className="text-sm">{event.attendees} Attendees</span>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {event.description}
                  </p>
                  <div className="pt-4 border-t border-gray-200">
                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Empty State (if no events) */}
        {events.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-slate-50 rounded-lg p-8 md:p-12 max-w-2xl mx-auto">
              <FaCalendarAlt className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-2xl font-bold mb-2 text-gray-700">
                No Events Yet
              </h3>
              <p className="text-gray-600">
                Check back soon for upcoming events and gatherings!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
