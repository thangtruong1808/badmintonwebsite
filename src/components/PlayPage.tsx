import React, { useState, useEffect, useMemo } from "react";
import SearchBar from "./PlayPage/SearchBar";
import EventList from "./PlayPage/EventList";
import RegistrationModal from "./PlayPage/RegistrationModal";
import Pagination from "./PlayPage/Pagination";
import { socialEvents as initialSocialEvents } from "../data/socialEvents";
import { setCartItems, getCartItems, clearCart } from "../utils/cartStorage";
import { getInitialEvents, getUserRegistrations } from "../utils/registrationService";
import { getOrCreateUserId } from "../utils/userStorage";
import type { SocialEvent, Registration } from "../types/socialEvent";

const PlayPage: React.FC = () => {
  useEffect(() => {
    document.title = "ChibiBadminton - Play Sessions";
  }, []);

  const userId = getOrCreateUserId();

  // State management
  const [allEvents, setAllEvents] = useState<SocialEvent[]>(() => getInitialEvents(initialSocialEvents));
  const [userRegistrations, setUserRegistrations] = useState<Registration[]>([]);
  const [myRegistrationsFilter, setMyRegistrationsFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "completed"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "regular" | "tournament"
  >("all");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>(() => getCartItems());
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationEvents, setRegistrationEvents] = useState<SocialEvent[]>([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SocialEvent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setUserRegistrations(getUserRegistrations(userId));
  }, [userId, allEvents]); // Re-fetch registrations if events change (e.g., after a new registration)

  const EVENTS_PER_PAGE = 8; // 2 rows × 4 columns = 8 events

  // Filter and search logic
  const filteredEvents = useMemo(() => {
    let eventsToFilter = allEvents;

    if (myRegistrationsFilter) {
      const registeredEventIds = userRegistrations.map(reg => reg.eventId);
      eventsToFilter = allEvents.filter(event => registeredEventIds.includes(event.id));
    }

    return eventsToFilter.filter((event) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          event.title.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "available" && event.status !== "available") {
          return false;
        }
        if (statusFilter === "completed" && event.status !== "completed") {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== "all" && event.category !== categoryFilter) {
        return false;
      }

      // Day of week filter
      if (selectedDays.length > 0 && !selectedDays.includes(event.dayOfWeek)) {
        return false;
      }

      return true;
    });
  }, [allEvents, searchQuery, statusFilter, categoryFilter, selectedDays, myRegistrationsFilter, userRegistrations]);

  // Get selected events
  const selectedEvents = useMemo(() => {
    return allEvents.filter((event) => selectedEventIds.includes(event.id));
  }, [allEvents, selectedEventIds]);

  // Event handlers
  const handleSelectEvent = (eventId: number) => {
    setSelectedEventIds((prev) => {
      const newIds = prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId];
      setCartItems(newIds);
      return newIds;
    });
  };

  const handleClearCart = () => {
    setSelectedEventIds([]);
    clearCart();
  };

  const handleRegister = (event: SocialEvent) => {
    // Only allow registration for available events
    if (event.status === "available" || event.status === "full") {
      setRegistrationEvents([event]);
      setIsRegistrationModalOpen(true);
    }
  };

  const handleBookAll = () => {
    if (selectedEvents.length > 0) {
      // Filter to only available events
      const availableEvents = selectedEvents.filter(
        (e) => e.status === "available"
      );
      if (availableEvents.length > 0) {
        setRegistrationEvents(availableEvents);
        setIsRegistrationModalOpen(true);
      }
    }
  };

  const handleViewDetails = (event: SocialEvent) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  const handleDayFilterChange = (day: string) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setSelectedDays([]);
    setMyRegistrationsFilter(false);
  };

  const handleRegistrationSuccess = (updatedEvents: SocialEvent[]) => {
    // Update all events with the new state
    setAllEvents(updatedEvents);
    // Clear selected events after successful registration
    setSelectedEventIds([]);
    clearCart();
  };

  // Sort events: available first, then by date
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      // Available events first
      if (a.status === "available" && b.status !== "available") return -1;
      if (a.status !== "available" && b.status === "available") return 1;
      // Then sort by date (future dates first)
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [filteredEvents]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedEvents.length / EVENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
  const endIndex = startIndex + EVENTS_PER_PAGE;
  const paginatedEvents = sortedEvents.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter, selectedDays, myRegistrationsFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of events list
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="pt-6 min-h-screen bg-gradient-to-b from-pink-100 to-pink-200">
      <div className="container mx-auto px-4 py-8 ">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-huglove">
            Play Sessions
          </h1>
          <p className="text-gray-600 text-xl max-w-7xl mx-auto">
            Register for our social badminton sessions. Select multiple events
            and book them all at once!
          </p>
        </div>

        {/* Search and Filters */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          selectedDays={selectedDays}
          onDayFilterChange={handleDayFilterChange}
          myRegistrationsFilter={myRegistrationsFilter}
          onMyRegistrationsFilterChange={setMyRegistrationsFilter}
          onClearFilters={handleClearFilters}
        />

        {/* Main Content */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 font-calibri">
              {sortedEvents.length} Event{sortedEvents.length !== 1 ? "s" : ""}{" "}
              Found
              {totalPages > 1 && (
                <span className="text-lg font-normal text-gray-600 ml-2 font-calibri">
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </h2>
            {selectedEventIds.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 font-calibri">
                  {selectedEventIds.length} event{selectedEventIds.length !== 1 ? "s" : ""} selected
                </span>
                <button
                  onClick={handleBookAll}
                  className="bg-rose-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-rose-600 transition-colors font-calibri"
                >
                  Book All ({selectedEventIds.length})
                </button>
                <button
                  onClick={handleClearCart}
                  className="text-sm text-gray-600 hover:text-gray-900 font-calibri"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          <EventList
            events={paginatedEvents}
            selectedEventIds={selectedEventIds}
            onSelectEvent={handleSelectEvent}
            onRegister={handleRegister}
            onViewDetails={handleViewDetails}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        events={registrationEvents}
        isMultiEvent={registrationEvents.length > 1}
        onSuccess={handleRegistrationSuccess}
      />

      {/* Event Details Modal (Simple version) */}
      {isDetailsModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedEvent.title}
              </h2>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {selectedEvent.imageUrl && (
                <img
                  src={selectedEvent.imageUrl}
                  alt={selectedEvent.title}
                  className="w-full h-full object-contain rounded-lg mb-4"
                />
              )}
              <div className="space-y-3 mb-4">
                <p className="text-gray-700">
                  <strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-gray-700">
                  <strong>Time:</strong> {selectedEvent.time}
                </p>
                <p className="text-gray-700">
                  <strong>Location:</strong> {selectedEvent.location}
                </p>
                <p className="text-gray-700">
                  <strong>Capacity:</strong> {selectedEvent.currentAttendees} / {selectedEvent.maxCapacity} attendees
                </p>
                {selectedEvent.price && (
                  <p className="text-gray-700">
                    <strong>Price:</strong> ${selectedEvent.price}
                  </p>
                )}
                <p className="text-gray-700">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded text-sm font-semibold ${selectedEvent.status === "available"
                      ? "bg-green-100 text-green-800"
                      : selectedEvent.status === "full"
                        ? "bg-orange-100 text-orange-800"
                        : selectedEvent.status === "completed"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                      }`}
                  >
                    {selectedEvent.status.toUpperCase()}
                  </span>
                </p>
              </div>
              <p className="text-gray-700 whitespace-pre-line">
                {selectedEvent.description}
              </p>
              {selectedEvent.status === "available" && (
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    handleRegister(selectedEvent);
                  }}
                  className="mt-6 w-full bg-rose-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-rose-600 transition-colors"
                >
                  Register Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayPage;
