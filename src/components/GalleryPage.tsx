import { useState } from "react";
import { FaPlay, FaImages, FaVideo } from "react-icons/fa";
import Banner from "../assets/BannerMain.png";

const GalleryPage = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const photos = [
    { id: 1, src: "https://picsum.photos/id/30/800/600", alt: "Tournament Match 1" },
    { id: 2, src: "https://picsum.photos/id/40/800/600", alt: "Social Event" },
    { id: 3, src: "https://picsum.photos/id/50/800/600", alt: "Championship Finals" },
    { id: 4, src: "https://picsum.photos/id/60/800/600", alt: "Training Session" },
    { id: 5, src: "https://picsum.photos/id/70/800/600", alt: "Community Gathering" },
    { id: 6, src: "https://picsum.photos/id/80/800/600", alt: "Award Ceremony" },
    { id: 7, src: "https://picsum.photos/id/90/800/600", alt: "Beginner Workshop" },
    { id: 8, src: "https://picsum.photos/id/100/800/600", alt: "Team Photo" },
    { id: 9, src: "https://picsum.photos/id/110/800/600", alt: "Tournament Match 2" },
  ];

  const videos = [
    {
      id: 1,
      title: "Summer Tournament Highlights",
      embedId: "dQw4w9WgXcQ",
      thumbnail: "https://picsum.photos/id/120/400/225",
    },
    {
      id: 2,
      title: "Championship Finals Recap",
      embedId: "dQw4w9WgXcQ",
      thumbnail: "https://picsum.photos/id/130/400/225",
    },
    {
      id: 3,
      title: "Community Social Event",
      embedId: "dQw4w9WgXcQ",
      thumbnail: "https://picsum.photos/id/140/400/225",
    },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Banner Section - Entirely below navbar */}
      <div className="relative w-full mb-12 overflow-hidden pt-16 md:pt-16">
        <div className="relative w-full h-[30vh] md:h-[30vh] lg:h-[30vh]">
          <img
            src={Banner}
            alt="ChibiBadminton Banner"
            className="w-full h-full object-contain"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40 opacity-50"></div>

          {/* Header Text Over Banner */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white drop-shadow-lg">
              Our Gallery
            </h1>
            <p className="text-base md:text-xl lg:text-2xl text-white max-w-3xl mx-auto drop-shadow-md font-medium">
              Browse through our amazing collection of photos and videos
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-8 md:py-12 max-w-7xl mx-auto min-h-full">
        {/* Two Column Layout: Photos (70%) and Videos (30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 md:gap-8">
          {/* Photos Column - 70% width (7/10 columns) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                  <FaImages className="text-white" size={24} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-black">
                  Photo Gallery
                </h2>
              </div>
              <p className="text-gray-600 mb-6 text-sm md:text-base">
                Capturing the best moments from our tournaments, events, and community gatherings
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    onClick={() => setSelectedImage(photo.src)}
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="w-full h-48 md:h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 rounded-full p-3">
                          <FaImages className="text-green-600" size={24} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Videos Column - 30% width (3/10 columns) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 sticky top-24">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mr-4">
                  <FaVideo className="text-white" size={24} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-black">
                  Videos
                </h2>
              </div>
              <p className="text-gray-600 mb-6 text-sm md:text-base">
                Watch highlights and recaps from our events
              </p>
              <div className="space-y-6">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative aspect-video bg-gray-200">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all duration-300">
                        <a
                          href={`https://www.youtube.com/watch?v=${video.embedId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors duration-300 transform hover:scale-110"
                        >
                          <FaPlay className="text-white ml-1" size={20} />
                        </a>
                      </div>
                    </div>
                    <div className="p-3 bg-white">
                      <h3 className="font-semibold text-sm md:text-base text-black line-clamp-2">
                        {video.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs md:text-sm text-gray-500 text-center mt-6 italic">
                Stay tuned for more exciting video highlights!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black rounded-full p-2 transition-colors duration-300"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
