import { FaStar, FaUserCircle } from "react-icons/fa";
import Banner from "../assets/BannerMain.png";

interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  review: string;
  isVerified: boolean;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    date: "2 weeks ago",
    review: "Amazing badminton club! The community is so welcoming and friendly. I've been playing here for 6 months and the coaching staff are excellent. The facilities are well-maintained and the weekly sessions are always fun. Highly recommend to anyone looking to join a badminton community!",
    isVerified: true,
  },
  {
    id: 2,
    name: "Michael Chen",
    rating: 5,
    date: "1 month ago",
    review: "Best badminton experience I've had! The tournaments are well-organized and the skill level is diverse, so there's something for everyone. The Wednesday and Friday sessions are perfect for my schedule. Great value for money and fantastic people!",
    isVerified: true,
  },
  {
    id: 3,
    name: "Emma Williams",
    rating: 5,
    date: "3 weeks ago",
    review: "I was a complete beginner when I joined, and the coaches were so patient and helpful. The beginner workshops really helped me improve my game. The social aspect is also great - I've made so many friends here. Definitely worth joining!",
    isVerified: true,
  },
  {
    id: 4,
    name: "David Kim",
    rating: 5,
    date: "1 week ago",
    review: "Professional setup with excellent facilities. The championship events are fantastic and the competitive atmosphere pushes you to improve. The community is supportive and the admin team is always responsive. Five stars!",
    isVerified: true,
  },
  {
    id: 5,
    name: "Lisa Anderson",
    rating: 5,
    date: "2 months ago",
    review: "Love the social mixer events! Great combination of badminton and socializing. The BBQ events are amazing and the venue is always clean. The members are respectful and the games are fair. Perfect for both competitive and casual players.",
    isVerified: true,
  },
  {
    id: 6,
    name: "James Taylor",
    rating: 5,
    date: "3 weeks ago",
    review: "Outstanding club with a fantastic community spirit. The advanced skills clinic really helped me take my game to the next level. The coaches have great expertise and the training sessions are well-structured. Can't recommend enough!",
    isVerified: true,
  },
  {
    id: 7,
    name: "Sophie Brown",
    rating: 5,
    date: "1 month ago",
    review: "Great value and amazing people! I've been to several badminton clubs, but this one stands out. The scheduling is convenient, the facilities are top-notch, and everyone is so friendly. The weekly sessions are always fun and competitive!",
    isVerified: true,
  },
  {
    id: 8,
    name: "Robert Martinez",
    rating: 5,
    date: "2 weeks ago",
    review: "Excellent organization and management. The events calendar is always updated, and the communication is clear. The tournament finals were spectacular - great venue and well-run. The community here is like a second family!",
    isVerified: true,
  },
  {
    id: 9,
    name: "Amanda Lee",
    rating: 5,
    date: "4 weeks ago",
    review: "Perfect for all skill levels! As an intermediate player, I appreciate the variety of sessions available. The community is inclusive and supportive. The equipment is in good condition and the courts are always available when booked. Highly satisfied!",
    isVerified: true,
  },
];

const ReviewsPage = () => {
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const totalReviews = reviews.length;

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`${i < rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
              }`}
            size={16}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Banner Section - Entirely below navbar */}
      <div className="relative w-full mb-12 overflow-hidden pt-16 md:pt-16">
        <div className="relative w-full h-[30vh] md:h-[30vh] lg:h-[30vh]">
          <img
            src={Banner}
            alt="ChibiBadminton Banner"
            className="w-full h-full object-contain"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40 opacity-50"></div>

          {/* Header Text Over Banner */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white drop-shadow-lg">
              Reviews
            </h1>
            <p className="text-base md:text-xl lg:text-2xl text-white max-w-3xl mx-auto drop-shadow-md font-medium">
              What our community says about us
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-12 md:py-16 max-w-7xl mx-auto min-h-full">
        {/* Reviews Summary Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-12 text-center">
          <div className="flex flex-col items-center mb-6">
            <div className="text-5xl md:text-6xl font-bold text-gray-800 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(averageRating)} />
            <p className="text-gray-600 mt-2 text-lg">
              Based on {totalReviews} reviews
            </p>
          </div>
          <p className="text-gray-700 text-base md:text-lg max-w-3xl mx-auto">
            ChibiBadminton is rated <strong>{averageRating.toFixed(1)}</strong> out of 5 based on{" "}
            <strong>{totalReviews}</strong> verified reviews from our community members.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black text-center md:text-left">
            Community Reviews
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col h-full"
              >
                {/* Reviewer Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <FaUserCircle className="text-gray-400" size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-black truncate">
                          {review.name}
                        </h3>
                        {review.isVerified && (
                          <span className="text-blue-600 text-xs font-medium bg-blue-50 px-2 py-0.5 rounded">
                            Verified
                          </span>
                        )}
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                </div>

                {/* Review Date */}
                <p className="text-xs text-gray-500 mb-3">{review.date}</p>

                {/* Review Text */}
                <p className="text-gray-700 text-sm md:text-base leading-relaxed flex-grow mb-4">
                  {review.review}
                </p>

                {/* Google Review Link (SEO) */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 italic">
                    This review was helpful
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-slate-50 rounded-lg shadow-lg p-6 md:p-8 text-center mt-12">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-black">
            Share Your Experience
          </h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Have you played with us? We'd love to hear about your experience!
            Join our community and leave a review.
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-300">
            Write a Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
