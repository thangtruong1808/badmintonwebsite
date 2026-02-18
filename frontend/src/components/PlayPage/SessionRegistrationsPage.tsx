import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUsers } from "react-icons/fa";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface RegisteredPlayer {
  name: string;
  email?: string;
}

const SessionRegistrationsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<RegisteredPlayer[]>([]);
  const [eventInfo, setEventInfo] = useState<{ title?: string; date?: string; time?: string; location?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;
      setLoading(true);
      try {
        const [regRes, eventRes] = await Promise.all([
          fetch(`${API_BASE}/api/events/${eventId}/registrations`, { credentials: "include" }),
          fetch(`${API_BASE}/api/events/${eventId}`, { credentials: "include" }),
        ]);
        if (regRes.ok) {
          const data = await regRes.json();
          setPlayers(data.registrations || []);
        }
        if (eventRes.ok) {
          const evt = await eventRes.json();
          setEventInfo({ title: evt.title, date: evt.date, time: evt.time, location: evt.location });
        }
      } catch {
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  if (!eventId) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-rose-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="font-calibri text-gray-600 mb-4">Invalid session.</p>
          <button onClick={() => navigate("/play")} className="text-rose-600 hover:underline font-calibri">
            Back to Play Sessions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-rose-50 to-rose-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/play")}
          className="flex items-center gap-2 text-rose-600 hover:text-rose-700 font-calibri mb-6"
        >
          <FaArrowLeft size={18} />
          Back to Play Sessions
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {eventInfo && (
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-calibri text-gray-900 font-huglove mb-2">{eventInfo.title}</h1>
              {eventInfo.date && (
                <p className="text-gray-600 font-calibri text-lg">
                  {new Date(eventInfo.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  {eventInfo.time && ` • ${eventInfo.time}`}
                </p>
              )}
              {eventInfo.location && (
                <p className="text-gray-600 font-calibri text-lg">{eventInfo.location}</p>
              )}
            </div>
          )}

          <div className="p-6">
            <h2 className="flex items-center gap-2 text-gray-900 font-calibri text-lg mb-4">
              <FaUsers size={20} />
              Registered players ({players.length})
            </h2>

            {loading ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-rose-500 border-t-transparent flex-shrink-0" aria-hidden />
                <span className="font-calibri text-gray-600">Loading…</span>
              </div>
            ) : players.length === 0 ? (
              <p className="font-calibri text-gray-600">No players registered yet.</p>
            ) : (
              <ul className="space-y-2">
                {players.map((p, i) => (
                  <li key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg font-calibri text-lg">
                    <span className="font-medium text-gray-900 font-calibri text-lg">{p.name}</span>
                    {p.email && <span className="text-gray-500 font-calibri text-lg truncate max-w-[60%]">{p.email}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionRegistrationsPage;
