import React from "react";
import { FaUsers } from "react-icons/fa";
import type { RegisteredPlayer } from "./types";

interface RegisteredPlayersListProps {
  players: RegisteredPlayer[];
  loading: boolean;
}

const RegisteredPlayersList: React.FC<RegisteredPlayersListProps> = ({ players, loading }) => {
  return (
    <div className="border-t border-gray-200 pt-4">
      <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-2 font-calibri">
        <FaUsers className="text-rose-500" />
        Registered players ({players.length})
      </h3>
      {loading ? (
        <p className="text-sm text-gray-500 py-2 font-calibri">Loading…</p>
      ) : players.length === 0 ? (
        <p className="text-sm text-gray-500 py-2 font-calibri">No players registered yet.</p>
      ) : (
        <ul className="max-h-[min(360px,55vh)] overflow-y-auto pr-1 flex flex-wrap gap-3 pt-4">
          {players.map((p, i) => {
            const parts = (p.name || "").trim().split(/\s+/);
            const initials =
              parts.length === 0 || !parts[0]
                ? "?"
                : parts.length === 1
                  ? parts[0].charAt(0).toUpperCase()
                  : (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
            const guestCount =
              p.guestNames && p.guestNames.length > 0
                ? p.guestNames.length
                : (p.guestCount ?? 0);
            const hasGuests = guestCount >= 1;
            const guestNamesList =
              p.guestNames && p.guestNames.length > 0
                ? p.guestNames.filter((n) => (n ?? "").trim())
                : [];
            const tooltipText =
              guestNamesList.length > 0 ? `${p.name}: ${guestNamesList.join(", ")}` : p.name;
            const badgeLabel =
              guestNamesList.length > 0 ? guestNamesList.join(", ") : undefined;
            const borderClass = hasGuests
              ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-white shadow-sm"
              : "shadow-sm";
            return (
              <li
                key={i}
                className="flex-shrink-0 pt-1"
                title={tooltipText}
              >
                <div
                  className={`relative inline-flex items-center justify-center rounded-full bg-white ${borderClass}`}
                >
                  {p.avatar && String(p.avatar).trim() ? (
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold">
                      {initials}
                    </span>
                  )}
                  {hasGuests && (
                    <span
                      className="absolute -bottom-1 -right-1 rounded-full bg-amber-500 text-white text-[10px] leading-none px-1.5 py-0.5 shadow-sm"
                      aria-label={badgeLabel}
                    >
                      +{guestCount}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RegisteredPlayersList;
