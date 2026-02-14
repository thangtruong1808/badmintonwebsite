import React, { useState, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

/** News article from news_articles table (GET /api/news) */
export interface NewsArticle {
  id: number;
  image?: string | null;
  title: string;
  date?: string | null;
  time?: string | null;
  location?: string | null;
  description?: string | null;
  badge: string;
  category?: string | null;
  link?: string | null;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

const FEATURED_LIMIT = 3;

const badgeColor = (badge: string) => {
  switch (badge) {
    case "UPCOMING":
      return "bg-rose-600";
    case "REGULAR":
      return "bg-green-500";
    case "OPEN":
      return "bg-blue-500";
    default:
      return "bg-rose-500";
  }
};

const FeaturedNews: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/api/news", { skipAuth: true });
        if (res.ok) {
          const list = await res.json();
          const data = Array.isArray(list) ? list : [];
          setArticles(data);
        } else {
          setArticles([]);
        }
      } catch {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featuredItems = articles.slice(0, FEATURED_LIMIT);

  const handleReadMore = (article: NewsArticle) => {
    if (article.link && article.link.trim()) {
      window.open(article.link.trim(), "_blank");
    } else {
      navigate("/featured-news");
    }
  };

  return (
    <div className="py-16 bg-gradient-to-r from-rose-50 to-rose-100">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 font-huglove">
          Featured News
        </h2>
        {loading && (
          <div className="bg-gradient-to-r from-rose-50 to-rose-100 min-h-[40vh] flex items-center justify-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-rose-500 border-t-transparent flex-shrink-0" aria-hidden />
              <span className="font-calibri text-gray-600">Loading…</span>
            </div>
          </div>
        )}
        {!loading && featuredItems.length === 0 && (
          <div className="text-center py-12 font-calibri text-gray-600">
            No featured content at the moment. Check back soon!
          </div>
        )}
        {!loading && featuredItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredItems.map((article) => {
              const title = article.title;
              const image = article.image ?? undefined;
              const description = article.description ?? "";
              const date = article.date ?? null;
              const time = article.time ?? null;
              const location = article.location ?? null;
              const badge = article.badge ?? "OPEN";

              return (
                <div
                  key={article.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full"
                >
                  <div className="relative h-64 overflow-hidden bg-white flex items-center justify-center">
                    {image ? (
                      <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-contain pt-4"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-calibri">
                        No image
                      </div>
                    )}
                    <span
                      className={`absolute top-2 right-2 text-white text-md font-bold px-2 py-1 rounded font-calibri ${badgeColor(badge)}`}
                    >
                      {badge}
                    </span>
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <h3 className="font-bold text-2xl sm:text-3xl mb-2 font-calibri min-h-[3.5rem]">{title}</h3>
                    <p className="text-gray-800 text-base sm:text-lg font-calibri text-justify mb-2 line-clamp-3">{description}</p>
                    <div className="space-y-1 mb-4">
                      {date && <p className="text-gray-800 text-base sm:text-lg font-calibri">Date: {date}</p>}
                      {time && <p className="text-gray-800 text-base sm:text-lg font-calibri">Time: {time}</p>}
                      {location && <p className="text-gray-800 text-base sm:text-lg font-calibri">Location: {location}</p>}
                    </div>
                  </div>
                  <div className="p-4 pt-0 mt-auto">
                    <button
                      type="button"
                      onClick={() => handleReadMore(article)}
                      className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 font-calibri"
                    >
                      <div className="flex items-center justify-center gap-4">
                        <FaPaperPlane size={18} />
                        <span className="font-calibri text-md font-bold">Read more</span>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="text-center mt-8">
          <Link
            to="/featured-news"
            className="bg-rose-500 text-white font-bold py-2 px-6 rounded-full hover:bg-rose-600 transition-colors font-calibri"
          >
            View More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedNews;
