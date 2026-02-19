import { useState, useEffect, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FaEnvelope,
  FaCheckCircle,
  FaExclamationCircle,
  FaLock,
} from "react-icons/fa";
import { apiFetch } from "../utils/api";

interface ResetFormData {
  email: string;
}

interface SetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");

  useEffect(() => {
    document.title = "ChibiBadminton - Reset Password";
  }, []);

  const [resetData, setResetData] = useState<ResetFormData>({
    email: "",
  });
  const [setPasswordData, setSetPasswordData] = useState<SetPasswordFormData>({
    newPassword: "",
    confirmPassword: "",
  });
  const [resetErrors, setResetErrors] = useState<FormErrors>({});
  const [setPasswordErrors, setSetPasswordErrors] = useState<FormErrors>({});
  const [isResetting, setIsResetting] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
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

  const validateSetPassword = (): boolean => {
    const errors: FormErrors = {};
    if (setPasswordData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }
    if (setPasswordData.newPassword !== setPasswordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setSetPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetData((prev) => ({ ...prev, [name]: value }));
    if (resetErrors[name]) {
      setResetErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSetPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSetPasswordData((prev) => ({ ...prev, [name]: value }));
    if (setPasswordErrors[name]) {
      setSetPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleResetSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateReset()) return;

    setIsResetting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const res = await apiFetch("/api/auth/request-password-reset", {
        method: "POST",
        body: JSON.stringify({ email: resetData.email }),
        skipAuth: true,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSubmitStatus({
          type: "success",
          message: data.message || "If an account exists with this email, you will receive a password reset link.",
        });
        setResetData({ email: "" });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.message || "Something went wrong. Please try again.",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleSetPasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tokenFromUrl || !validateSetPassword()) return;

    setIsSettingPassword(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const res = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token: tokenFromUrl,
          newPassword: setPasswordData.newPassword,
          confirmPassword: setPasswordData.confirmPassword,
        }),
        skipAuth: true,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success === false) {
        setSubmitStatus({
          type: "error",
          message: data.message || "Invalid or expired reset link. Please request a new password reset.",
        });
      } else if (res.ok) {
        setSubmitStatus({
          type: "success",
          message: data.message || "Password has been reset. You can now sign in with your new password.",
        });
        setSetPasswordData({ newPassword: "", confirmPassword: "" });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.message || "Invalid or expired reset link. Please request a new password reset.",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSettingPassword(false);
    }
  };

  const isSetPasswordMode = Boolean(tokenFromUrl);

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-rose-50 to-rose-100 px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium mb-2 font-huglove">
            Reset Password
          </h1>
          <p className="text-xl lg:text-2xl font-medium">
            {isSetPasswordMode
              ? "Enter your new password below"
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full rounded-lg shadow-xl overflow-hidden bg-gradient-to-r from-rose-50 to-rose-100">
          <div className="p-8 md:p-10">

            {isSetPasswordMode ? (
              <form onSubmit={handleSetPasswordSubmit} className="space-y-6">
                {/* New Password Field */}
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-semibold text-gray-700 mb-2 font-calibri text-lg"
                  >
                    <FaLock className="inline mr-2" size={14} />
                    <span className="text-lg">New Password</span> <span className="text-red-500 font-calibri text-lg">*</span>
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    name="newPassword"
                    value={setPasswordData.newPassword}
                    onChange={handleSetPasswordChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 font-calibri text-lg ${setPasswordErrors.newPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                      }`}
                    placeholder="At least 8 characters"
                  />
                  {setPasswordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-500 flex items-center font-calibri text-lg">
                      <FaExclamationCircle className="mr-1" size={12} />
                      {setPasswordErrors.newPassword}
                    </p>
                  )}
                </div>
                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-semibold text-gray-700 mb-2 font-calibri text-lg"
                  >
                    <FaLock className="inline mr-2" size={14} />
                    <span className="text-lg">Confirm Password</span> <span className="text-red-500 font-calibri text-lg">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    name="confirmPassword"
                    value={setPasswordData.confirmPassword}
                    onChange={handleSetPasswordChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 font-calibri text-lg ${setPasswordErrors.confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                      }`}
                    placeholder="Confirm your new password"
                  />
                  {setPasswordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500 flex items-center font-calibri text-lg">
                      <FaExclamationCircle className="mr-1" size={12} />
                      {setPasswordErrors.confirmPassword}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSettingPassword}
                  className={`w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 font-calibri text-lg ${isSettingPassword ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  {isSettingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></div>
                      <span className="font-calibri text-lg">Saving...</span>
                    </>
                  ) : (
                    "Set New Password"
                  )}
                </button>
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
                    <span className="text-sm font-medium font-calibri text-lg">{submitStatus.message}</span>
                  </div>
                )}
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-sm font-semibold text-gray-700 mb-2 font-calibri text-lg"
                  >
                    <FaEnvelope className="inline mr-2" size={14} />
                    <span className="text-lg">Email Address</span> <span className="text-red-500 font-calibri text-lg">*</span>
                  </label>
                  <input
                    type="email"
                    id="reset-email"
                    name="email"
                    value={resetData.email}
                    onChange={handleResetChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 font-calibri text-lg ${resetErrors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                      }`}
                    placeholder="Enter your email"
                  />
                  {resetErrors.email && (
                    <p className="mt-1 text-sm text-red-500 flex items-center font-calibri text-lg">
                      <FaExclamationCircle className="mr-1" size={12} />
                      {resetErrors.email}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isResetting}
                  className={`w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 font-calibri text-lg ${isResetting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  {isResetting ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="font-calibri text-lg">Sending...</span></> : "Send Reset Link"}
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
                    <span className="text-sm font-medium font-calibri text-lg">{submitStatus.message}</span>
                  </div>
                )}
              </form>
            )}

            {/* Back to Sign In Link */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <span className="text-gray-500 text-md font-calibri text-lg text-rose-500">Remember your password? </span>
              <Link
                to="/signin"
                className="text-rose-500 hover:text-rose-600 font-semibold font-calibri text-md hover:underline"
              >
                ← Back to Sign In
              </Link>
            </div>

            {/* Authenticated / Secure Message */}
            <div className="w-full rounded-lg p-4 flex flex-row flex-wrap items-center justify-center gap-2 text-gray-500 text-sm font-calibri">
              <FaLock className="text-rose-500 flex-shrink-0" size={14} />
              <span>
                Secure authentication powered by encrypted connections.
              </span>
            </div>


          </div>
        </div>
      </div>
    </div >
  );
};

export default ResetPasswordPage;
