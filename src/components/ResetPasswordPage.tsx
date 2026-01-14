import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  FaEnvelope,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

interface ResetFormData {
  email: string;
}

interface FormErrors {
  [key: string]: string;
}

const ResetPasswordPage = () => {
  useEffect(() => {
    document.title = "ChibiBadminton - Reset Password";
  }, []);

  const [resetData, setResetData] = useState<ResetFormData>({
    email: "",
  });
  const [resetErrors, setResetErrors] = useState<FormErrors>({});
  const [isResetting, setIsResetting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const validateReset = (): boolean => {
    const errors: FormErrors = {};
    if (!resetData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetData.email)) {
      errors.email = "Please enter a valid email address";
    }
    setResetErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetData((prev) => ({ ...prev, [name]: value }));
    if (resetErrors[name]) {
      setResetErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleResetSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateReset()) return;

    setIsResetting(true);
    setSubmitStatus({ type: null, message: "" });

    // Simulate API call
    setTimeout(() => {
      setIsResetting(false);
      setSubmitStatus({
        type: "success",
        message: "Password reset link has been sent to your email!",
      });
      setResetData({ email: "" });
    }, 1500);
  };

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-pink-100 to-pink-200 px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 font-huglove">
            Reset Password
          </h1>
          <p className="text-gray-600 text-lg">
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full rounded-lg shadow-xl overflow-hidden bg-white">
          <div className="p-8 md:p-10">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  <FaEnvelope className="inline mr-2" size={14} />
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="reset-email"
                  name="email"
                  value={resetData.email}
                  onChange={handleResetChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 ${resetErrors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500"
                    }`}
                  placeholder="Enter your email"
                />
                {resetErrors.email && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <FaExclamationCircle className="mr-1" size={12} />
                    {resetErrors.email}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isResetting}
                className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ${isResetting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {isResetting ? "Sending..." : "Send Reset Link"}
              </button>

              {/* Submit Status */}
              {submitStatus.message && (
                <div
                  className={`p-4 rounded-lg flex items-center ${submitStatus.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                    }`}
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

            {/* Back to Sign In Link */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <Link
                to="/signin"
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                ← Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
