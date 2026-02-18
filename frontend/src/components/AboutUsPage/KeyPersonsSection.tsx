import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { apiFetch } from "../../utils/api";

export interface KeyPerson {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  description?: string;
  imageUrl?: string;
}

const KeyPersonsSection = () => {
  const [persons, setPersons] = useState<KeyPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/key-persons", { skipAuth: true });
        if (!res.ok) throw new Error("Failed to load key persons");
        const data = await res.json();
        if (!cancelled) setPersons(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section className="mb-16 bg-gradient-to-r from-rose-50 to-rose-100 min-h-[40vh] flex items-center justify-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-rose-500 border-t-transparent flex-shrink-0" aria-hidden />
          <span className="font-calibri text-gray-900 font-medium text-lg">Loading…</span>
        </div>
      </section>
    );
  }

  if (error) return null;

  if (persons.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-gray-900 font-huglove mb-4">
          Meet Our Team
        </h2>
        <p className="text-gray-900 max-w-2xl mx-auto font-calibri font-medium text-lg">
          The people behind Chibi Badminton Club
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {persons.map((person) => (
          <div
            key={person.id}
            className="bg-gradient-to-r from-rose-50 to-rose-100 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="w-32 h-32 rounded-full overflow-hidden bg-rose-200 flex items-center justify-center mb-4 shrink-0">
              {person.imageUrl ? (
                <img
                  src={person.imageUrl}
                  alt={`${person.firstName} ${person.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="text-rose-600" size={48} aria-hidden />
              )}
            </div>
            <h3 className="text-gray-900 font-calibri text-lg xl:text-2xl mb-2 font-huglove">
              {person.firstName} {person.lastName}
            </h3>
            <p className="text-rose-600 font-calibri text-base xl:text-lg mb-2 font-huglove">
              {person.role}
            </p>
            {person.description && (
              <p className="text-gray-900 leading-relaxed text-justify font-calibri text-lg line-clamp-4 font-medium">
                {person.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default KeyPersonsSection;
