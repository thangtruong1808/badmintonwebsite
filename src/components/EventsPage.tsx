const EventsPage = () => (
  <div className="p-4 md:p-8 max-w-6xl mx-auto bg-[var(--bg-primary)] min-h-full">
    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
      Upcoming Events
    </h1>
    <p className="text-base md:text-lg mb-6 text-center max-w-2xl mx-auto">
      Check out our latest badminton events. Stay tuned for registration
      details!
    </p>
    {/* Placeholder for event list */}
    <div className="text-center">
      <p>No upcoming events at the moment. Check back soon!</p>
    </div>
  </div>
);

export default EventsPage;
