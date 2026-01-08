import logo from "../assets/chibi-logo.png";

const HomePage = () => (
  <div className="p-4 md:p-8 max-w-full mx-auto min-h-full">
    <div className="flex justify-center mb-6">
      <img
        src={logo}
        alt="ChibiBadminton Logo"
        className="h-48 w-48 mx-auto mb-6 md:w-72 md:h-72"
      />
    </div>

    {/* Intro Section */}
    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
      Welcome to ChibiBadminton Social Groups
    </h1>
    <p className="text-base md:text-lg mb-6 text-center max-w-2xl mx-auto">
      Your ultimate resource for all things badminton. Whether you're a beginner
      or a seasoned pro, join our community to stay updated on events, tips, and
      exclusive content.
    </p>

    {/* Featured Images Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      <div className="text-center">
        <img
          src="https://picsum.photos/id/10/400/250"
          alt="Badminton Court"
          className="rounded-lg shadow-lg mb-4 w-full h-auto"
        />

        <p className="text-sm md:text-md">
          Discover the joy of badminton on our state-of-the-art courts.
        </p>
      </div>
      <div className="text-center">
        <img
          src="https://picsum.photos/id/20/400/250"
          alt="Badminton Racket"
          className="rounded-lg shadow-lg mb-4 w-full h-auto"
        />
        <p className="text-sm md:text-md">
          Find the perfect gear and improve your game with expert advice.
        </p>
      </div>
    </div>

    {/* Featured Sections */}
    <section className="py-16 px-4 md:px-8 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        Explore Our Community
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Events Preview */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
          <img
            src="https://picsum.photos/id/20/400/250"
            alt="Events"
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">Upcoming Events</h3>
            <p className="text-gray-600 mb-4">
              Check out our latest badminton tournaments and social gatherings.
            </p>
            <button className="text-blue-600 hover:text-blue-800 font-semibold">
              View Events →
            </button>
          </div>
        </div>

        {/* Gallery Preview */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
          <img
            src="https://picsum.photos/id/30/400/250"
            alt="Gallery"
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">Photo Gallery</h3>
            <p className="text-gray-600 mb-4">
              Browse amazing moments from our tournaments and events.
            </p>
            <button className="text-blue-600 hover:text-blue-800 font-semibold">
              View Gallery →
            </button>
          </div>
        </div>

        {/* Reviews Preview */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
          <img
            src="https://picsum.photos/id/40/400/250"
            alt="Reviews"
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">Community Reviews</h3>
            <p className="text-gray-600 mb-4">
              Hear what our members say about the ChibiBadminton experience.
            </p>
            <button className="text-blue-600 hover:text-blue-800 font-semibold">
              Read Reviews →
            </button>
          </div>
        </div>
      </div>
    </section>

    {/* Call to Action Section */}
    <section className="bg-gray-100 py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Join the Fun?
        </h2>
        <p className="text-lg md:text-xl mb-8 text-gray-600">
          Whether you're a beginner or a pro, there's a place for you in our
          community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300">
            Sign Up Now
          </button>
          <button className="bg-white hover:bg-gray-50 text-green-600 border border-green-600 font-bold py-3 px-8 rounded-lg text-lg transition duration-300">
            Learn More
          </button>
        </div>
      </div>
    </section>
  </div>
);

export default HomePage;
