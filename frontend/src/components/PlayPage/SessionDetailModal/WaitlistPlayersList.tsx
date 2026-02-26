import React from "react";
import { FaList } from "react-icons/fa";
import type { WaitlistPlayer } from "./types";

interface WaitlistPlayersListProps {
  waitlistPlayers: WaitlistPlayer[];
  loading: boolean;
}

const WaitlistPlayersList: React.FC<WaitlistPlayersListProps> = ({ waitlistPlayers, loading }) => {
  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-2 font-calibri">
        <FaList className="text-amber-500" />
        Waiting list ({waitlistPlayers.length})
      </h3>
      {loading ? (
        <p className="text-sm text-gray-500 py-2 font-calibri">Loading…</p>
      ) : waitlistPlayers.length === 0 ? (
        <p className="text-sm text-gray-500 py-2 font-calibri">No one on the waitlist.</p>
      ) : (
        <ul className="max-h-[min(200px,30vh)] overflow-y-auto pr-1 space-y-1.5">
          {waitlistPlayers.map((w, i) => {
            const isAddGuests = w.type === "add_guests";
            const hasType = w.type != null;
            const label = hasType
              ? isAddGuests
                ? `+${w.guestCount} friend${w.guestCount !== 1 ? "s" : ""} waiting`
                : "waiting for spot"
              : `+${w.guestCount}`;
            return (
              <li
                key={i}
                className="flex items-center gap-2 text-sm text-gray-700 font-calibri py-1.5 px-3 rounded-lg bg-amber-50 border border-amber-200"
              >
                <span className="font-medium text-gray-900 truncate">{w.name}</span>
                <span className="text-amber-600 font-medium flex-shrink-0">{label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default WaitlistPlayersList;
