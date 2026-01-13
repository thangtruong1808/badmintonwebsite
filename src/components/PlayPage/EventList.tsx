import React from "react";
import EventCard from "./EventCard";
import type { SocialEvent } from "../../types/socialEvent";

interface EventListProps {
  events: SocialEvent[];
  selectedEventIds: number[];
  onSelectEvent: (eventId: number) => void;
  onRegister: (event: SocialEvent) => void;
  onViewDetails: (event: SocialEvent) => void;
}

const EventList: React.FC<EventListProps> = ({
  events,
  selectedEventIds,
  onSelectEvent,
  onRegister,
  onViewDetails,
}) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
        <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          isSelected={selectedEventIds.includes(event.id)}
          onSelect={onSelectEvent}
          onRegister={onRegister}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default EventList;
