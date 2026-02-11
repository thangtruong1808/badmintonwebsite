import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { apiFetch } from "../utils/api";

export interface HomepageBanner {
  id: number;
  imageUrl: string;
  altText: string;
  title?: string;
}

const BannerCarousel: React.FC = () => {
  const [banners, setBanners] = useState<HomepageBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/api/homepage-banners", { skipAuth: true });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setBanners(Array.isArray(data) ? data : []);
        } else {
          setBanners([]);
        }
      } catch {
        if (!cancelled) setBanners([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isPaused || banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="pb-16 bg-gradient-to-r from-rose-50 to-rose-100">
        <div className="container mx-auto px-4">
          <div className="relative w-full overflow-hidden aspect-[1920/600] max-h-[400px] bg-rose-200/50 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="pb-16 bg-gradient-to-r from-rose-50 to-rose-100">
        <div className="container mx-auto px-4">
          <div className="relative w-full overflow-hidden aspect-[1920/600] max-h-[400px] bg-rose-200/50 rounded-lg flex items-center justify-center text-rose-600">
            No banners yet. Add them from the dashboard.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16 bg-gradient-to-r from-rose-50 to-rose-100">
      <div className="container mx-auto px-4">
        <div
          className="relative w-full overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative w-full">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`transition-opacity duration-700 ease-in-out ${
                  index === currentIndex
                    ? "opacity-100 block"
                    : "opacity-0 absolute top-0 left-0 w-full pointer-events-none"
                }`}
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.altText}
                  className="w-full h-auto object-fill"
                />
              </div>
            ))}
          </div>

          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 z-10"
            aria-label="Previous banner"
          >
            <FaChevronLeft size={24} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 z-10"
            aria-label="Next banner"
          >
            <FaChevronRight size={24} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerCarousel;
