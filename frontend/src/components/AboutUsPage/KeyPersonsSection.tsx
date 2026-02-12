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
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-700">
            Meet Our Team
          </h2>
          <p className="text-lg text-gray-800 max-w-2xl mx-auto font-calibri">
            The people behind Chibi Badminton Club
          </p>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500" />
        </div>
      </section>
    );
  }

  if (error) return null;

  if (persons.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-700">
          Meet Our Team
        </h2>
        <p className="text-lg text-gray-800 max-w-2xl mx-auto font-calibri">
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
            <h3 className="text-xl font-bold text-gray-800 font-calibri">
              {person.firstName} {person.lastName}
            </h3>
            <p className="text-rose-600 font-semibold text-sm md:text-base font-calibri mb-2">
              {person.role}
            </p>
            {person.description && (
              <p className="text-gray-800 text-sm md:text-base leading-relaxed text-justify font-calibri line-clamp-4">
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
