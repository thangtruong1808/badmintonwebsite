import { useEffect, useState } from "react";
import EventsHistory from "./EventsHistory";
import UpcomingEvents from "./UpcomingEvents";
import type { EventDisplay } from "../types/event";
import { useEventsData } from "./EventsPage/useEventsData";
import EventsLoadingState from "./EventsPage/EventsLoadingState";
import EventsEmptyState from "./EventsPage/EventsEmptyState";
import EventsRegistrationModal from "./EventsPage/EventsRegistrationModal";

const EventsPage = () => {
  useEffect(() => {
    document.title = "ChibiBadminton - Events";
  }, []);

  const { events, loading, error, completedEvents, upcomingEvents } = useEventsData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDisplay | null>(null);

  const closeRegistrationModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleViewDetails = (event: EventDisplay) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-gradient-to-r from-rose-50 to-rose-100 w-full min-h-screen overflow-x-hidden relative">
      <div className="relative z-10">
        {loading && <EventsLoadingState />}
        {error && (
          <div className="container mx-auto px-4 py-4 text-center font-calibri text-rose-600">
            {error}
          </div>
        )}
        <UpcomingEvents upcomingEvents={upcomingEvents} />
        <EventsHistory completedEvents={completedEvents} onViewDetails={handleViewDetails} />
        {!loading && events.length === 0 && <EventsEmptyState />}
        {isModalOpen && selectedEvent && (
          <EventsRegistrationModal
            event={selectedEvent}
            onClose={closeRegistrationModal}
            detailOnly={selectedEvent.status === "completed"}
          />
        )}
      </div>
    </div>
  );
};

export default EventsPage;
