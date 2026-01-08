const GalleryPage = () => (
  <div className="p-4 md:p-8 max-w-6xl mx-auto bg-[var(--bg-primary)] min-h-full">
    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
      Our Gallery
    </h1>
    <p className="text-base md:text-lg mb-6 text-center max-w-2xl mx-auto">
      Browse through our amazing collection of photos and videos capturing the
      best moments from our tournaments and community gatherings.
    </p>

    <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-center">
      Photos
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <img
        src="https://picsum.photos/id/30/300/200"
        alt="Gallery Image 1"
        className="w-full h-auto rounded-lg shadow-md"
      />
      <img
        src="https://picsum.photos/id/40/300/200"
        alt="Gallery Image 2"
        className="w-full h-auto rounded-lg shadow-md"
      />
      <img
        src="https://picsum.photos/id/50/300/200"
        alt="Gallery Image 3"
        className="w-full h-auto rounded-lg shadow-md"
      />
      <img
        src="https://picsum.photos/id/60/300/200"
        alt="Gallery Image 4"
        className="w-full h-auto rounded-lg shadow-md"
      />
      <img
        src="https://picsum.photos/id/70/300/200"
        alt="Gallery Image 5"
        className="w-full h-auto rounded-lg shadow-md"
      />
      <img
        src="https://picsum.photos/id/80/300/200"
        alt="Gallery Image 6"
        className="w-full h-auto rounded-lg shadow-md"
      />
    </div>

    <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-center">
      Videos
    </h2>
    <div className="flex justify-center mb-8">
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded-lg shadow-lg w-full max-w-2xl h-64 md:h-80"
      ></iframe>
    </div>
    <p className="text-sm md:text-md text-center">
      Stay tuned for more exciting video highlights from our events!
    </p>
  </div>
);

export default GalleryPage;
