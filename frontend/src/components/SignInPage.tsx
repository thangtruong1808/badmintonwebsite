import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationCircle,
  FaCoins,
  FaTimes,
} from "react-icons/fa";
import { setCredentials } from "../store/authSlice";
import { getUserEventHistory } from "../utils/rewardPointsService";
import type { UserEventHistory, User } from "../types/user";
import { API_BASE } from "../utils/api";

interface SignInFormData {
  email: string;
  password: string;
}

interface FormErrors {
  [key: string]: string;
}

const SignInPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "ChibiBadminton - Sign In";
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [signInData, setSignInData] = useState<SignInFormData>({
    email: "",
    password: "",
  });
  const [signInErrors, setSignInErrors] = useState<FormErrors>({});
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [unclaimedEvents, setUnclaimedEvents] = useState<UserEventHistory[]>([]);

  const validateSignIn = (): boolean => {
    const errors: FormErrors = {};
    if (!signInData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signInData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!signInData.password) {
      errors.password = "Password is required";
    } else if (signInData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    setSignInErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignInData((prev) => ({ ...prev, [name]: value }));
    if (signInErrors[name]) {
      setSignInErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSignInSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateSignIn()) return;

    setIsSigningIn(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signInData.email,
          password: signInData.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.user) {
        dispatch(setCredentials({
          user: data.user as User,
          refreshTokenExpiresAt: data.refreshTokenExpiresAt,
        }));
        const user = data.user as User;
        const history = getUserEventHistory(user.id);
        const unclaimed = history.filter(
          (h) => h.attendanceStatus === "attended" && !h.pointsClaimed
        );
        setSignInData({ email: "", password: "" });
        if (unclaimed.length > 0) {
          setUnclaimedEvents(unclaimed);
          setShowRewardModal(true);
        } else {
          navigate("/profile");
        }
      } else {
        setSubmitStatus({
          type: "error",
          message: data.message || "Invalid email or password. Please try again.",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Could not reach server. Please try again.",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-rose-50 to-rose-100 px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 font-huglove">
            Sign In
          </h1>
          <p className="text-gray-600 text-lg">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full rounded-lg shadow-xl overflow-hidden bg-gradient-to-l from-rose-50 to-rose-100">
          <div className="p-8 md:p-10">
            <form onSubmit={handleSignInSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="signin-email"
                  className="block text-lg font-semibold text-gray-700 mb-2 font-calibri"
                >
                  <FaEnvelope className="inline mr-2" size={14} />
                  Email Address <span className="text-red-500 font-calibri">*</span>
                </label>
                <input
                  type="email"
                  id="signin-email"
                  name="email"
                  autoComplete="email"
                  value={signInData.email}
                  onChange={handleSignInChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 font-calibri text-lg ${signInErrors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500"
                    }`}
                  placeholder="Enter your email"
                />
                {signInErrors.email && (
                  <p className="mt-1 text-sm text-red-500 flex items-center font-calibri text-lg">
                    <FaExclamationCircle className="mr-1" size={12} />
                    {signInErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="signin-password"
                  className="block text-lg font-semibold text-gray-700 mb-2 font-calibri"
                >
                  <FaLock className="inline mr-2" size={14} />
                  Password <span className="text-red-500 font-calibri">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="signin-password"
                    name="password"
                    autoComplete="current-password"
                    value={signInData.password}
                    onChange={handleSignInChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 font-calibri text-lg ${signInErrors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                      }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                {signInErrors.password && (
                  <p className="mt-1 text-sm text-red-500 flex items-center font-calibri text-lg">
                    <FaExclamationCircle className="mr-1" size={12} />
                    {signInErrors.password}
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  to="/reset-password"
                  className="text-rose-500 hover:text-rose-600 text-sm font-medium font-calibri"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSigningIn}
                className={`w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 font-calibri text-lg ${isSigningIn ? "opacity-90 cursor-wait" : ""
                  }`}
              >
                {isSigningIn ? (
                  <>
                    <span className="animate-spin inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Submit Status */}
              {submitStatus.message && (
                <div
                  className={`p-4 rounded-lg flex items-center ${submitStatus.type === "success"
                    ? "bg-rose-500 text-white border border-green-200 font-calibri text-lg"
                    : "bg-red-50 text-red-800 border border-red-200 font-calibri text-lg"
                    } font-calibri text-lg`}
                >
                  {submitStatus.type === "success" ? (
                    <FaCheckCircle className="mr-2" size={20} />
                  ) : (
                    <FaExclamationCircle className="mr-2" size={20} />
                  )}
                  <span className="text-sm font-medium">{submitStatus.message}</span>
                </div>
              )}
            </form>

            {/* Register Link */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-md font-calibri">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-rose-500 hover:text-rose-600 font-semibold font-calibri"
                >
                  Create an account
                </Link>
              </p>
              <div className="mt-4 flex items-center justify-center text-gray-500 text-xs">
                <FaLock className="mr-2 text-rose-500" size={14} />
                <span>Secure authentication powered by encrypted connections</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reward Points Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 font-huglove">
                Welcome Back!
              </h2>
              <button
                onClick={() => {
                  setShowRewardModal(false);
                  navigate("/profile");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <FaCoins className="text-yellow-600" size={32} />
                </div>
                <p className="text-gray-700 font-calibri">
                  You have {unclaimedEvents.length} event{unclaimedEvents.length !== 1 ? "s" : ""} with unclaimed reward points!
                </p>
                <p className="text-sm text-gray-600 mt-2 font-calibri">
                  Visit your profile to claim them.
                </p>
              </div>
              {unclaimedEvents.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3 font-calibri">
                    Unclaimed Points:
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {unclaimedEvents.map((event) => (
                      <div
                        key={event.eventId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-sm text-gray-900 font-calibri">
                            {event.eventTitle}
                          </p>
                          <p className="text-xs text-gray-600 font-calibri">
                            +{event.pointsEarned} points
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRewardModal(false);
                    navigate("/profile");
                  }}
                  className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-semibold font-calibri"
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignInPage;
