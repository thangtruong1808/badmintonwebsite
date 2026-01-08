const HomePage = () => (
  <div className="p-4 md:p-8 max-w-6xl mx-auto bg-[var(--bg-primary)] min-h-full">
    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
      Welcome to ChibiBadminton!
    </h1>
    <p className="text-base md:text-lg mb-6 text-center max-w-2xl mx-auto">
      Your ultimate resource for all things badminton. Whether you're a beginner
      or a seasoned pro, join our community to stay updated on events, tips, and
      exclusive content.
    </p>
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
  </div>
);

export default HomePage;
