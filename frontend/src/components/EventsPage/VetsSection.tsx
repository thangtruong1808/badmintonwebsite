import React, { useState } from "react";
import { FaUsers, FaTrophy, FaCalendarCheck } from "react-icons/fa";
import VetsInterestModal from "./VetsInterestModal";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";

const VetsSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  const handleOpenModal = () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-rose-50 to-rose-100">
        <section className="pt-8 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-block bg-green-600 text-white px-4 py-2 rounded-full text-md font-semibold mb-4 font-calibri">
                VETS
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium mb-4 text-black drop-shadow-lg font-huglove">
                Veterans Events
              </h2>
              <p className="text-black text-base md:text-lg max-w-2xl mx-auto drop-shadow-md font-calibri">
                Join our exclusive veterans badminton events! Sign up to express your interest
                and we'll keep you updated on upcoming tournaments throughout the year.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300">
                <div className="p-8 lg:p-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="flex flex-col items-center text-center p-4 bg-rose-50 rounded-xl">
                      <div className="bg-rose-100 p-3 rounded-full mb-3">
                        <FaUsers className="text-rose-600 text-2xl" />
                      </div>
                      <h4 className="font-calibri font-semibold text-gray-800 mb-1">
                        Community
                      </h4>
                      <p className="font-calibri text-sm text-gray-600">
                        Connect with fellow veteran players
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center p-4 bg-green-50 rounded-xl">
                      <div className="bg-green-100 p-3 rounded-full mb-3">
                        <FaTrophy className="text-green-600 text-2xl" />
                      </div>
                      <h4 className="font-calibri font-semibold text-gray-800 mb-1">
                        Competitions
                      </h4>
                      <p className="font-calibri text-sm text-gray-600">
                        Participate in age-appropriate events
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-xl">
                      <div className="bg-blue-100 p-3 rounded-full mb-3">
                        <FaCalendarCheck className="text-blue-600 text-2xl" />
                      </div>
                      <h4 className="font-calibri font-semibold text-gray-800 mb-1">
                        Stay Updated
                      </h4>
                      <p className="font-calibri text-sm text-gray-600">
                        Get notified about upcoming VETS events
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="font-calibri font-semibold text-lg text-gray-800 mb-3">
                      How It Works
                    </h3>
                    <ol className="font-calibri text-gray-700 space-y-2 list-decimal list-inside">
                      <li>
                        Click the "Register Interest" button below to fill out the form
                      </li>
                      <li>
                        Select the VETS events you're interested in attending
                      </li>
                      <li>
                        We'll contact you with event details and registration information
                      </li>
                    </ol>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleOpenModal}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 font-calibri"
                    >
                      Register Interest
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {isModalOpen && <VetsInterestModal onClose={handleCloseModal} user={user} />}

      {showLoginDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-calibri font-semibold text-gray-900 mb-3">
              Please sign in to continue
            </h3>
            <p className="font-calibri text-gray-700 mb-6">
              To register your interest in Veterans Events, please sign in so we can keep your
              details accurate and make contacting you easier.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-calibri hover:bg-gray-50 transition-colors"
                onClick={() => setShowLoginDialog(false)}
              >
                Maybe later
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-2 rounded-lg bg-rose-500 text-white font-calibri font-semibold hover:bg-rose-600 transition-colors"
                onClick={() => {
                  setShowLoginDialog(false);
                  navigate("/signin", { state: { from: "/events" } });
                }}
              >
                Go to Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VetsSection;
