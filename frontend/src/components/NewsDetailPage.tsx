import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaPaperPlane, FaArrowLeft } from "react-icons/fa";
import { apiFetch } from "../utils/api";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(dateStr: string): string {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return dateStr;
  const [, y, mo, d] = m;
  const month = MONTHS[parseInt(mo, 10) - 1] ?? dateStr;
  const day = parseInt(d, 10);
  return `${month} ${day}, ${y}`;
}

/** News article from news_articles table (GET /api/news/:id) */
interface NewsArticle {
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

const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = article ? `${article.title} - ChibiBadminton` : "News - ChibiBadminton";
    return () => {
      document.title = "ChibiBadminton";
    };
  }, [article]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Invalid article ID");
      return;
    }
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/api/news/${id}`, { skipAuth: true });
        if (res.ok) {
          const data = await res.json();
          setArticle(data);
        } else if (res.status === 404) {
          setArticle(null);
          setError("Article not found");
        } else {
          setArticle(null);
          setError("Failed to load article");
        }
      } catch {
        setArticle(null);
        setError("Failed to load article");
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-r from-rose-50 to-rose-100">
        <div className="container mx-auto px-4 pt-12 pb-8 min-h-[40vh] flex items-center justify-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-rose-500 border-t-transparent flex-shrink-0" aria-hidden />
            <span className="font-calibri text-gray-600">Loading…</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-r from-rose-50 to-rose-100">
        <div className="container mx-auto px-4 pt-12 pb-8">
          <div className="text-center py-16">
            <p className="text-gray-600 font-calibri mb-4">{error ?? "Article not found"}</p>
            <Link
              to="/featured-news"
              className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-calibri font-medium"
            >
              <FaArrowLeft size={14} />
              Back to Featured News
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasLink = article.link && article.link.trim();

  return (
    <div className="w-full overflow-x-hidden min-h-screen bg-gradient-to-r from-rose-50 to-rose-100">
      <div className="container mx-auto px-4 pt-6 sm:pt-8 pb-12 max-w-3xl">
        <Link
          to="/featured-news"
          className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-calibri text-sm sm:text-base mb-6"
        >
          <FaArrowLeft size={14} />
          Back to Featured News
        </Link>

        <article className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          {/* Image */}
          <div className="relative w-full aspect-video sm:aspect-[2/1] bg-gray-100">
            {article.image ? (
              <img
                src={article.image}
                alt=""
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-calibri">
                No image
              </div>
            )}
            <span className="absolute top-3 right-3 text-white text-sm font-bold px-3 py-1 rounded font-calibri bg-rose-500">
              {article.badge}
            </span>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-gray-900 font-huglove mb-4">
              {article.title}
            </h1>

            <dl className="space-y-2 sm:space-y-3 text-gray-600 font-calibri text-sm sm:text-base mb-6">
              {article.date && (
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <dt className="font-semibold text-gray-700">Date:</dt>
                  <dd>{formatDate(article.date)}</dd>
                </div>
              )}
              {article.time && (
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <dt className="font-semibold text-gray-700">Time:</dt>
                  <dd>{article.time}</dd>
                </div>
              )}
              {article.location && (
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <dt className="font-semibold text-gray-700">Location:</dt>
                  <dd>{article.location}</dd>
                </div>
              )}
              {article.category && (
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <dt className="font-semibold text-gray-700">Category:</dt>
                  <dd>{article.category}</dd>
                </div>
              )}
            </dl>

            {article.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 font-calibri mb-2">
                  Description
                </h2>
                <p className="text-gray-600 font-calibri whitespace-pre-wrap leading-relaxed">
                  {article.description}
                </p>
              </div>
            )}

            {hasLink && (
              <div className="pt-2">
                <a
                  href={article.link!.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 px-5 rounded-lg text-sm sm:text-base font-calibri transition-colors"
                >
                  <FaPaperPlane size={16} />
                  Read more
                </a>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};

export default NewsDetailPage;
