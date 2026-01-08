const ReviewsPage = () => (
  <div className="p-4 md:p-8 max-w-6xl mx-auto bg-[var(--bg-primary)] min-h-full">
    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Reviews</h1>
    <p className="text-base md:text-lg mb-6 text-center max-w-2xl mx-auto">
      What our community says about us.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <p className="italic">"Great club, amazing people!"</p>
        <p className="mt-2 font-semibold">- A Happy Member</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <p className="italic">"Best badminton experience ever!"</p>
        <p className="mt-2 font-semibold">- Pro Player</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <p className="italic">"Fun and welcoming community."</p>
        <p className="mt-2 font-semibold">- Beginner</p>
      </div>
    </div>
  </div>
);

export default ReviewsPage;
