import { useState, useEffect } from "react";
import { FaPlay, FaImages, FaVideo } from "react-icons/fa";
import type { Photo } from "../types/gallery";
import { apiFetch } from "../utils/api";
import { parseYouTubeId } from "../utils/youtube";
import playlistPlaceholder from "../assets/WednesdayPlaytime.png";

export interface GalleryVideoFromApi {
  id: number;
  title: string;
  embed_id: string;
  thumbnail: string | null;
  category: string;
  display_order?: number;
  created_at?: string;
}

/**
 * Business rules:
 * - Wednesday, Friday: single videos per entry. embed_id = video ID. Link opens one video.
 * - Tournament, Playlists: playlists per entry. embed_id = playlist ID. Link opens playlist.
 */
function isPlaylistCategory(category: string): boolean {
  return category === "tournament" || category === "playlists";
}

/**
 * Thumbnail: Prefer stored thumbnail when valid.
 * Wednesday/Friday: derive from video ID.
 * Tournament/Playlists: derive from video ID (when embed_id has v=), else use custom or placeholder.
 */
function getThumbnailUrl(video: GalleryVideoFromApi): string {
  if (video.thumbnail && /^https?:\/\//.test(video.thumbnail)) {
    return video.thumbnail;
  }
  const videoId = parseYouTubeId(video.embed_id, "video");
  const playlistId = parseYouTubeId(video.embed_id, "playlist");
  if (isPlaylistCategory(video.category)) {
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : playlistPlaceholder;
  }
  return videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : playlistPlaceholder;
}

/**
 * Link: Wed/Fri = single video (watch?v=). Tournament/Playlists = playlist (playlist?list=).
 */
function getVideoUrl(video: GalleryVideoFromApi): string | null {
  const isPlaylistCat = isPlaylistCategory(video.category);
  const videoId = parseYouTubeId(video.embed_id, "video");
  const playlistId = parseYouTubeId(video.embed_id, "playlist");
  if (isPlaylistCat) {
    return playlistId
      ? `https://www.youtube.com/playlist?list=${playlistId}`
      : null;
  }
  return videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : null;
}

const GalleryPage = () => {
  useEffect(() => {
    document.title = "ChibiBadminton - Gallery";
  }, []);

  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [allVideos, setAllVideos] = useState<GalleryVideoFromApi[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      setPhotosLoading(true);
      setVideosLoading(true);
      setError(null);
      try {
        const [photosRes, videosRes] = await Promise.all([
          apiFetch("/api/gallery/photos", { skipAuth: true }),
          apiFetch("/api/gallery/videos", { skipAuth: true }),
        ]);
        if (photosRes.ok) {
          const list = await photosRes.json();
          setAllPhotos(Array.isArray(list) ? list : []);
        }
        if (videosRes.ok) {
          const list = await videosRes.json();
          setAllVideos(Array.isArray(list) ? list : []);
        }
        if (!photosRes.ok && !videosRes.ok) {
          setError("Could not load gallery.");
        }
      } catch {
        setError("Could not load gallery.");
        setAllPhotos([]);
        setAllVideos([]);
      } finally {
        setPhotosLoading(false);
        setVideosLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPhotoFilter, setSelectedPhotoFilter] = useState<
    "all" | "chibi-tournament" | "veteran-tournament"
  >("all");
  const [selectedVideoCategory, setSelectedVideoCategory] = useState<
    "all" | "Wednesday" | "Friday" | "tournament" | "playlists"
  >("all");

  const filteredPhotos = allPhotos.filter((photo) => {
    if (selectedPhotoFilter === "all") return true;
    return photo.type === selectedPhotoFilter;
  });

  const filteredVideos = (() => {
    let videos: GalleryVideoFromApi[];
    if (selectedVideoCategory === "all") {
      videos = allVideos;
    } else if (selectedVideoCategory === "Wednesday") {
      videos = allVideos.filter((video) => video.category === "Wednesday");
    } else if (selectedVideoCategory === "Friday") {
      videos = allVideos.filter((video) => video.category === "Friday");
    } else if (selectedVideoCategory === "tournament") {
      videos = allVideos.filter((video) => video.category === "tournament");
    } else if (selectedVideoCategory === "playlists") {
      videos = allVideos.filter((video) => video.category === "playlists");
    } else {
      videos = [];
    }
    return [...videos].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
  })();

  const photoFilterOptions: Array<{
    label: string;
    value: "all" | "chibi-tournament" | "veteran-tournament";
  }> = [
      { label: "All", value: "all" },
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
    <div className="w-full overflow-x-hidden min-h-screen relative bg-gradient-to-r from-rose-50 to-rose-100">
      <div className="w-full overflow-x-hidden min-h-screen">
        <div className="px-4 md:px-8 py-8 md:py-12 max-w-7xl mx-auto min-h-full">
          {error && (
            <div className="text-center mb-4 p-4 rounded-lg bg-rose-50 text-rose-700 font-calibri">
              {error}
            </div>
          )}
          {(photosLoading || videosLoading) && (
            <div className="text-center mb-4 font-calibri text-gray-600">
              Loading gallery…
            </div>
          )}
          {/* Header Message */}
          <div className="text-center mb-10 p-6 rounded-lg shadow-xl bg-gradient-to-t from-rose-50 to-rose-100">
            <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
              Welcome to Our Badminton Gallery!
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto font-calibri">
              Explore our vibrant collection of photos and videos, capturing the excitement of tournaments, the joy of social events, and memorable moments with our Chibi Badminton community.
            </p>
          </div>

          {/* Two Column Layout: Photos (70%) and Videos (30%) */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 md:gap-8">
            {/* Photos Column - 70% width (7/10 columns) */}
            <div className="lg:col-span-7">
              <div className="bg-gradient-to-t from-rose-50 to-rose-100 rounded-lg shadow-lg p-6 md:p-8 mb-6">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center mr-4">
                    <FaImages className="text-white" size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-black">
                    Photo Gallery
                  </h2>
                </div>
                <p className="text-gray-600 mb-6 text-sm md:text-base font-calibri">
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
                          option.value as "all" | "chibi-tournament" | "veteran-tournament"
                        )
                      }
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 font-calibri ${selectedPhotoFilter === option.value
                        ? "bg-rose-500 text-white"
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
                        className="w-full h-48 md:h-56 object-cover group-hover:scale-110 transition-transform duration-300 font-calibri"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/90 rounded-full p-3">
                            <FaImages className="text-rose-500" size={24} />
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
              <div className="bg-gradient-to-t from-rose-50 to-rose-100 rounded-lg shadow-lg p-6 md:p-8 sticky top-24">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center mr-4">
                    <FaVideo className="text-white" size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-black">
                    Videos
                  </h2>
                </div>
                <p className="text-gray-600 mb-6 text-sm md:text-base font-calibri">
                  Watch highlights and recaps from our events and playlists
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
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 font-calibri ${selectedVideoCategory === option.value
                        ? "bg-rose-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 font-calibri"
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="gallery-videos-scroll pr-2 overflow-y-auto max-h-[calc(3*(200px+1.5rem))]">
                  <div className="space-y-6">
                    {filteredVideos.map((video) => {
                      const thumbnailUrl = getThumbnailUrl(video);
                      const videoUrl = getVideoUrl(video);
                      const videoIdForFallback = parseYouTubeId(
                        video.embed_id,
                        "video"
                      );
                      return (
                        <div
                          key={video.id}
                          className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="relative aspect-video bg-gray-200 flex items-center justify-center">
                            <img
                              src={thumbnailUrl}
                              alt={video.title}
                              className="w-full h-full object-cover font-calibri"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (
                                  videoIdForFallback &&
                                  target.src.includes("hqdefault")
                                ) {
                                  target.src = `https://img.youtube.com/vi/${videoIdForFallback}/mqdefault.jpg`;
                                } else {
                                  target.src = playlistPlaceholder;
                                }
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all duration-300">
                              {videoUrl ? (
                                <a
                                  href={videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`Watch ${video.title}`}
                                  className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors duration-300 transform hover:scale-110 cursor-pointer font-calibri"
                                >
                                  <FaPlay className="text-white ml-1" size={20} />
                                </a>
                              ) : (
                                <div
                                  className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center font-calibri"
                                  aria-hidden
                                >
                                  <FaPlay className="text-white ml-1" size={20} />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="p-3 bg-white">
                            <h3 className="font-semibold text-sm md:text-base text-black line-clamp-2 font-calibri">
                              {video.title}
                            </h3>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-500 text-center mt-6 italic font-calibri">
                  Stay tuned for more exciting video highlights!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 font-calibri"
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
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black rounded-full p-2 transition-colors duration-300 font-calibri"
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
