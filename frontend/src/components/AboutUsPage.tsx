import {
  FaBullseye,
  FaCalendarAlt,
  FaHandshake,
  FaTrophy,
  FaUsers
} from "react-icons/fa";
// import { GiShuttlecock } from "react-icons/gi";
import { useEffect } from "react";
import KeyPersonsSection from "./AboutUsPage/KeyPersonsSection";

const AboutUsPage = () => {
  useEffect(() => {
    document.title = "ChibiBadminton - About Us";
  }, []);


  const values = [
    {
      icon: FaUsers,
      title: "Community First",
      description:
        "We believe in building a welcoming and inclusive community where everyone feels valued and supported.",
    },
    {
      icon: FaTrophy,
      title: "Excellence",
      description:
        "We strive for excellence in everything we do, from organizing events to supporting player development.",
    },
    {
      icon: FaHandshake,
      title: "Sportsmanship",
      description:
        "Fair play, respect, and camaraderie are at the heart of our community values.",
    },
    {
      icon: FaBullseye,
      title: "Accessibility",
      description:
        "Badminton should be accessible to everyone, regardless of skill level or background.",
    },
  ];
  // bg-gradient-to-b from-gray-100 to-gray-200
  return (
    <div className="w-full overflow-x-hidden min-h-screen pt-20 bg-gradient-to-r from-rose-50 to-rose-100">

      <div className="px-4 md:px-8  max-w-7xl mx-auto min-h-full">
        {/* Introduction Section */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium mb-6 font-huglove">
              Welcome to the Chibi Badminton Club
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-6 font-calibri">
              Founded in 2020, Chibi Badminton Club has grown into a vibrant community
              of badminton enthusiasts. Our mission is to make badminton
              accessible to everyone, from casual players to competitive
              athletes.
            </p>
            <p className="text-base md:text-lg leading-relaxed font-calibri">
              We organise regular tournaments, training sessions, and social
              events to foster skill development and camaraderie among our
              members. Whether you're looking to improve your game, meet new
              people, or simply have fun, you'll find a welcoming home at
              Chibi.
            </p>
          </div>
        </section>
        {/* Key Persons / Meet Our Team */}
        <KeyPersonsSection />

        {/* Mission & Vision Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Mission */}
            <div className="bg-gradient-to-r from-rose-50 to-rose-100 rounded-lg shadow-lg p-8 md:p-10">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center mr-4">
                  <FaBullseye className="text-white" size={24} />
                </div>
                <h3 className="text-2xl md:text-3xl font-medium text-gray-800 font-calibri font-huglove">
                  Our Goal
                </h3>
              </div>
              <p className="text-base md:text-lg leading-relaxed text-justify font-calibri">
                To create an inclusive badminton community with lots of social interaction and positive vibes. We
                aim to make badminton accessible to everyone while fostering a supportive and competitive environment.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-r from-rose-50 to-rose-100 rounded-lg shadow-lg p-8 md:p-10">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center mr-4">
                  <FaTrophy className="text-white" size={24} />
                </div>
                <h3 className="text-2xl md:text-3xl font-medium text-gray-800 font-calibri font-huglove">
                  Our Vision
                </h3>
              </div>
              <p className="text-gray-800 text-base md:text-lg leading-relaxed text-justify font-calibri">
                To be recognised as a club that players would want to be a part of. Bringing forth new and intuitive ideas within the badminton community.
                And to provide you with services for your convenience.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium mb-4 font-huglove">
              Our Core Values
            </h2>
            <p className="text-base md:text-lg max-w-2xl mx-auto font-calibri">
              The principles that we stand by within the club
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-r from-rose-50 to-rose-100 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-rose-500 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-medium mb-3 text-gray-800 font-calibri font-huglove">
                    {value.title}
                  </h3>
                  <p className="text-base md:text-lg leading-relaxed text-justify font-calibri">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>



        {/* What We Offer Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-rose-50 to-rose-100 rounded-lg shadow-lg p-8 md:p-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium mb-8 text-center font-huglove">
              What We Offer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCalendarAlt className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-medium mb-3 text-gray-800 font-calibri font-huglove">
                  Regular Sessions
                </h3>
                <p className="text-base md:text-lg font-calibri">
                  Weekly badminton sessions every Wednesday and Friday from 7:00
                  PM to 10:00 PM. Primarily consisting of Intermediate players.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTrophy className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-medium mb-3 text-gray-800 font-calibri font-huglove">
                  Tournaments
                </h3>
                <p className="text-base md:text-lg font-calibri">
                  We host a small number of tournaments each annual year. We refer to them as "Battle Royale" - A fun way to describe our competitions :).
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUsers className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-medium mb-3 text-gray-800 font-calibri font-huglove">
                  Community Events
                </h3>
                <p className="text-base md:text-lg font-calibri  ">
                  Social gatherings and late night food runs to undo our hard work hah! :D
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AboutUsPage;
