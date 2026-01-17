import {
  FaUsers,
  FaTrophy,
  FaCalendarAlt,
  FaHeart,
  FaBullseye,
  FaHandshake,
} from "react-icons/fa";
// import { GiShuttlecock } from "react-icons/gi";
import { useEffect } from "react";

const AboutUsPage = () => {
  useEffect(() => {
    document.title = "ChibiBadminton - About Us";
  }, []);

  const stats = [
    { icon: FaUsers, value: "100+", label: "Active Members" },
    { icon: FaTrophy, value: "20+", label: "Tournaments" },
    { icon: FaCalendarAlt, value: "3+", label: "Events Hosted" },
    { icon: FaHeart, value: "4.7/5", label: "Member Rating" },
  ];

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

  return (
    <div className="w-full overflow-x-hidden min-h-screen pt-20 bg-gradient-to-b from-pink-100 to-pink-200">

      <div className="px-4 md:px-8  max-w-7xl mx-auto min-h-full">
        {/* Introduction Section */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-700">
              Welcome to ChibiBadminton
            </h2>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6 font-calibri">
              Founded in 2020, ChibiBadminton has grown into a vibrant community
              of badminton enthusiasts. Our mission is to make badminton
              accessible to everyone, from casual players to competitive
              athletes.
            </p>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed font-calibri">
              We organize regular tournaments, training sessions, and social
              events to foster skill development and camaraderie among our
              members. Whether you're looking to improve your game, meet new
              people, or simply have fun, you'll find a welcoming home at
              ChibiBadminton.
            </p>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                      <IconComponent className="text-gray-800" size={32} />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 font-calibri">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base text-gray-600 font-medium font-calibri">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Mission */}
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-10">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mr-4">
                  <FaBullseye className="text-gray-800" size={24} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 font-calibri">
                  Our Mission
                </h3>
              </div>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed text-justify font-calibri">
                To create an inclusive badminton community that promotes
                physical fitness, skill development, and social connection. We
                aim to make badminton accessible to players of all levels while
                fostering a supportive and competitive environment.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-10">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mr-4">
                  <FaTrophy className="text-gray-800" size={24} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 font-calibri">
                  Our Vision
                </h3>
              </div>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed text-justify font-calibri">
                To become the premier badminton community in the region, known
                for excellence, inclusivity, and the positive impact we make on
                our members' lives. We envision a future where badminton brings
                people together and creates lasting friendships.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-700">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-calibri">
              The principles that guide everything we do at ChibiBadminton
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="text-gray-800" size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800 font-calibri">
                    {value.title}
                  </h3>
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed text-justify font-calibri">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* What We Offer Section */}
        <section className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-800">
              What We Offer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCalendarAlt className="text-gray-800" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 font-calibri">
                  Regular Sessions
                </h3>
                <p className="text-gray-700 font-calibri">
                  Weekly badminton sessions every Wednesday and Friday from 7:00
                  PM to 10:00 PM. Perfect for players of all skill levels.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTrophy className="text-gray-800" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 font-calibri">
                  Tournaments
                </h3>
                <p className="text-gray-700 font-calibri">
                  Exciting tournaments and championships throughout the year.
                  Compete, improve, and have fun with fellow members.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUsers className="text-gray-800" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 font-calibri">
                  Community Events
                </h3>
                <p className="text-gray-700 font-calibri  ">
                  Social mixers, workshops, and special events that bring our
                  community together beyond the court.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        {/* <section className="text-center">
          <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-lg shadow-xl p-8 md:p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Our Community Today!
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Whether you're a beginner or a pro, there's a place for you in our
              social groups. Come experience the ChibiBadminton difference!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <span className="flex items-center justify-center gap-2 text-xl md:text-2xl lg:text-3xl  text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300">
                <GiShuttlecock size={35} />
                Let's Play!
              </span>
            </div>
          </div>
        </section> */}
      </div>
    </div>
  );
};

export default AboutUsPage;
