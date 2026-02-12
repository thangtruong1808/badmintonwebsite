import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaPaperPlane } from "react-icons/fa";
import { apiFetch } from "../utils/api";

/** News article from news_articles table (GET /api/news) */
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(dateStr: string): string {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return dateStr;
  const [, y, mo, d] = m;
  const month = MONTHS[parseInt(mo, 10) - 1] ?? dateStr;
  const day = parseInt(d, 10);
  return `${month} ${day}, ${y}`;
}

const FeaturedNewsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "ChibiBadminton - Featured News";
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/api/news", { skipAuth: true });
        if (res.ok) {
          const list = await res.json();
          setArticles(Array.isArray(list) ? list : []);
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

  const tabs = useMemo(() => {
    const badges = [...new Set(articles.map((a) => a.badge).filter((b) => b != null && b !== ""))].sort(
      (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })
    );
    return [{ key: "all", label: "All" }, ...badges.map((badge) => ({ key: badge, label: badge }))];
  }, [articles]);

  useEffect(() => {
    if (activeTab !== "all" && !articles.some((a) => a.badge === activeTab)) {
      setActiveTab("all");
    }
  }, [articles, activeTab]);

  const filteredArticles =
    activeTab === "all" ? articles : articles.filter((a) => a.badge === activeTab);

  return (
    <div className="w-full overflow-x-hidden min-h-screen bg-gradient-to-r from-rose-50 to-rose-100">
      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="text-center mb-10 p-12 rounded-lg shadow-xl bg-gradient-to-t from-rose-50 to-rose-100 mt-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 font-huglove text-center">
            Featured News
          </h1>
          <p className="text-center text-gray-600 font-calibri text-sm sm:text-base">
            All news articles from the club
          </p>
        </div>

        {/* Filter tabs */}
        <nav
          className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 mb-6 sm:mb-8 border-b border-gray-200 pb-2"
          aria-label="Filter news"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`uppercase px-4 py-2 text-sm sm:text-base font-calibri font-medium rounded-t transition-colors ${activeTab === tab.key
                ? "text-rose-600 border-b-2 border-rose-600 -mb-[9px] bg-white/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/30"
                }`}
              aria-pressed={activeTab === tab.key}
              aria-current={activeTab === tab.key ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {loading && (
          <div className="min-h-[40vh] flex items-center justify-center">
            <p className="text-gray-600 font-calibri">Loading…</p>
          </div>
        )}

        {!loading && filteredArticles.length === 0 && (
          <div className="text-center py-12 sm:py-16 font-calibri text-gray-600">
            {activeTab === "all"
              ? "No news articles at the moment. Check back soon!"
              : `No news articles with badge "${activeTab}".`}
          </div>
        )}

        {!loading && filteredArticles.length > 0 && (
          <ul className="space-y-4 sm:space-y-6" role="list">
            {filteredArticles.map((article) => (
              <li key={article.id}>
                <ArticleCard article={article} formatDate={formatDate} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

function ArticleCard({
  article,
  formatDate,
}: {
  article: NewsArticle;
  formatDate: (s: string) => string;
}) {
  const hasLink = article.link && article.link.trim();
  const content = (
    <>
      <div className="relative w-full sm:w-48 lg:w-56 flex-shrink-0 aspect-video sm:aspect-[4/3] overflow-hidden">
        {article.image ? (
          <img
            src={article.image}
            alt=""
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-calibri text-sm">
            No image
          </div>
        )}
        <span className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-0.5 rounded font-calibri bg-rose-500">
          {article.badge}
        </span>
      </div>
      <div className="flex-1 p-4 sm:p-5 flex flex-col sm:justify-between min-w-0">
        <div>
          <h2 className="font-bold text-lg sm:text-xl mb-1 font-calibri text-gray-900 line-clamp-2 group-hover:text-rose-600 transition-colors">
            {article.title}
          </h2>
          <p className="text-gray-600 text-sm font-calibri line-clamp-2 mb-3">
            {article.description ?? ""}
          </p>
          {article.date && (
            <p className="text-gray-500 text-sm font-calibri">
              {formatDate(article.date)}
            </p>
          )}
        </div>
        <div className="mt-3 sm:mt-4">
          <span className="inline-flex items-center gap-2 text-rose-600 font-semibold text-sm font-calibri group-hover:underline">
            <FaPaperPlane size={14} />
            Read more
          </span>
        </div>
      </div>
    </>
  );

  return (
    <article className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {hasLink ? (
        <a
          href={article.link!.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col sm:flex-row sm:min-h-0"
        >
          {content}
        </a>
      ) : (
        <Link
          to={`/featured-news/${article.id}`}
          className="group flex flex-col sm:flex-row sm:min-h-0"
        >
          {content}
        </Link>
      )}
    </article>
  );
}

export default FeaturedNewsPage;
