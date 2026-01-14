import { useState, useEffect } from "react";
import { FaPlay, FaImages, FaVideo } from "react-icons/fa";
import { photos as allPhotos, videos as allVideos } from "../data/galleryData";

const GalleryPage = () => {
  useEffect(() => {
    document.title = "ChibiBadminton - Gallery";
  }, []);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPhotoFilter, setSelectedPhotoFilter] = useState<
    "all" | "social" | "chibi-tournament" | "veteran-tournament"
  >("all");
  const [selectedVideoCategory, setSelectedVideoCategory] = useState<
    "all" | "Wednesday" | "Friday" | "tournament" | "playlists"
  >("all");

  const filteredPhotos = allPhotos.filter((photo) => {
    if (selectedPhotoFilter === "all") return true;
    return photo.type === selectedPhotoFilter;
  });

  const filteredVideos = allVideos.filter((video) => {
    if (selectedVideoCategory === "all") return true;
    const lowerCaseCategory = selectedVideoCategory.toLowerCase();
    return video.category.toLowerCase() === lowerCaseCategory;
  });

  const photoFilterOptions = [
    { label: "All", value: "all" },
    { label: "Social", value: "social" },
    { label: "Chibi Tournament", value: "chibi-tournament" },
    { label: "Veteran Tournament", value: "veteran-tournament" },
  ];

  const videoCategoryOptions = [
    { label: "All", value: "all" },
    { label: "Wednesday", value: "Wednesday" },
    { label: "Friday", value: "Friday" },
    { label: "Tournament", value: "tournament" },
    { label: "Playlists", value: "playlists" },
  ];

  return (
    <div className="w-full overflow-x-hidden min-h-screen relative bg-gradient-to-b from-pink-100 to-pink-300">
      <div className="w-full overflow-x-hidden min-h-screen">
        <div className="px-4 md:px-8 py-8 md:py-12 max-w-7xl mx-auto min-h-full">
          {/* Header Message */}
          <div className="text-center mb-10 p-6 bg-white/90 rounded-lg shadow-xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-green-700 mb-4">
              Welcome to Our Badminton Gallery!
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
              Explore our vibrant collection of photos and videos, capturing the excitement of tournaments, the joy of social events, and memorable moments with our Chibi Badminton community.
            </p>
          </div>

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
                  Capturing the best moments from our tournaments, events, and
                  community gatherings
                </p>

                {/* Photo Filter Buttons */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {photoFilterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setSelectedPhotoFilter(
                          option.value as "all" | "social" | "chibi-tournament" | "veteran-tournament"
                        )
                      }
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${selectedPhotoFilter === option.value
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredPhotos.map((photo) => (
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

                {/* Video Category Buttons */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {videoCategoryOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setSelectedVideoCategory(
                          option.value as
                          | "all"
                          | "Wednesday"
                          | "Friday"
                          | "tournament"
                          | "playlists"
                        )
                      }
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${selectedVideoCategory === option.value
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="overflow-y-auto max-h-[calc(3*(200px+1.5rem))] pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                  <div className="space-y-6">
                    {filteredVideos.map((video) => (
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
                              href={
                                video.category === "playlists"
                                  ? `https://www.youtube.com/playlist?list=${video.embedId}`
                                  : `https://www.youtube.com/watch?v=${video.embedId}`
                              }
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
    </div>
  );
};

export default GalleryPage;
