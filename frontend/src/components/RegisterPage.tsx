import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationCircle,
  FaPhone,
} from "react-icons/fa";
import { setCredentials } from "../store/authSlice";
import type { User } from "../types/user";
import { API_BASE } from "../utils/api";

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "ChibiBadminton - Register";
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [registerErrors, setRegisterErrors] = useState<FormErrors>({});
  const [isRegistering, setIsRegistering] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const validateRegister = (): boolean => {
    const errors: FormErrors = {};
    if (!registerData.firstName.trim()) {
      errors.firstName = "First name is required";
    }
    if (!registerData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }
    if (!registerData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (registerData.phone && !/^[\d\s\-\+\(\)]+$/.test(registerData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }
    if (!registerData.password) {
      errors.password = "Password is required";
    } else if (registerData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    if (!registerData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    if (registerErrors[name]) {
      setRegisterErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setIsRegistering(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: registerData.firstName.trim(),
          lastName: registerData.lastName.trim(),
          email: registerData.email.trim(),
          phone: registerData.phone.trim() || undefined,
          password: registerData.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.user) {
        dispatch(setCredentials({
          user: data.user as User,
          refreshTokenExpiresAt: data.refreshTokenExpiresAt,
        }));
        setSubmitStatus({
          type: "success",
          message: "Account created successfully! You can now sign in.",
        });
        setRegisterData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });
        setTimeout(() => navigate("/signin"), 1500);
      } else {
        setSubmitStatus({
          type: "error",
          message: data.message || "Registration failed. Please try again.",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Could not reach server. Please try again.",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div
      className="w-full flex flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-rose-100 px-4 py-8 overflow-x-hidden overflow-y-hidden"
      style={{
        minHeight: "calc(100vh - var(--navbar-height, 56px) - 4.5rem)",
        maxHeight: "calc(100vh - var(--navbar-height, 56px) - 4.5rem)",
      }}
    >
      <div className="w-full max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 font-huglove">
            Create Account
          </h1>
          <p className="text-gray-600 text-lg">
            Register for a new account to get started
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full rounded-lg shadow-xl overflow-hidden bg-gradient-to-r from-rose-50 to-rose-100">
          <div className="p-8 md:p-10 overflow-hidden">
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              {/* First Name + Last Name side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name Field */}
                <div>
                  <label
                    htmlFor="register-firstName"
                    className="block text-lg font-semibold text-gray-700 mb-2 font-calibri"
                  >
                    <FaUser className="inline mr-2" size={14} />
                    First Name <span className="text-red-500 font-calibri">*</span>
                  </label>
                  <input
                    type="text"
                    id="register-firstName"
                    name="firstName"
                    autoComplete="given-name"
                    value={registerData.firstName}
                    onChange={handleRegisterChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 font-calibri text-lg ${registerErrors.firstName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                      }`}
                    placeholder="Enter your first name"
                  />
                  {registerErrors.firstName && (
                    <p className="mt-1 text-sm text-red-500 flex items-center font-calibri text-lg">
                      <FaExclamationCircle className="mr-1" size={12} />
                      {registerErrors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name Field */}
                <div>
                  <label
                    htmlFor="register-lastName"
                    className="block text-lg font-semibold text-gray-700 mb-2 font-calibri"
                  >
                    <FaUser className="inline mr-2" size={14} />
                    Last Name <span className="text-red-500 font-calibri">*</span>
                  </label>
                  <input
                    type="text"
                    id="register-lastName"
                    name="lastName"
                    autoComplete="family-name"
                    value={registerData.lastName}
                    onChange={handleRegisterChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 font-calibri text-lg ${registerErrors.lastName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                      }`}
                    placeholder="Enter your last name"
                  />
                  {registerErrors.lastName && (
                    <p className="mt-1 text-sm text-red-500 flex items-center font-calibri text-lg">
                      <FaExclamationCircle className="mr-1" size={12} />
                      {registerErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email + Phone side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="register-email"
                    className="block text-lg font-semibold text-gray-700 mb-2 font-calibri"
                  >
                    <FaEnvelope className="inline mr-2" size={14} />
                    Email Address <span className="text-red-500 font-calibri">*</span>
                  </label>
                  <input
                    type="email"
                    id="register-email"
                    name="email"
                    autoComplete="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 font-calibri text-lg ${registerErrors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                      }`}
                    placeholder="Enter your email"
                  />
                  {registerErrors.email && (
                    <p className="mt-1 text-sm text-red-500 flex items-center font-calibri text-lg">
                      <FaExclamationCircle className="mr-1" size={12} />
                      {registerErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label
                    htmlFor="register-phone"
                    className="block text-lg font-semibold text-gray-700 mb-2 font-calibri"
                  >
                    <FaPhone className="inline mr-2" size={14} />
                    Phone Number{" "}
                    <span className="text-red-500 text-sm font-calibri">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="register-phone"
                    name="phone"
                    autoComplete="tel"
                    value={registerData.phone}
                    onChange={handleRegisterChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 font-calibri text-lg   ${registerErrors.phone
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                      }`}
                    placeholder="Enter your phone number"
                  />
                  {registerErrors.phone && (
                    <p className="mt-1 text-sm text-red-500 flex items-center font-calibri text-lg">
                      <FaExclamationCircle className="mr-1" size={12} />
                      {registerErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Password + Confirm Password side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password Field */}
                <div>
                  <label
                    htmlFor="register-password"
                    className="block text-lg font-semibold text-gray-700 mb-2 font-calibri"
                  >
                    <FaLock className="inline mr-2" size={14} />
                    Password <span className="text-red-500 font-calibri">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="register-password"
                      name="password"
                      autoComplete="new-password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 font-calibri text-lg ${registerErrors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                        }`}
                      placeholder="Enter your password (min. 8 characters)"
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
                  {registerErrors.password && (
                    <p className="mt-1 text-sm text-red-500 flex items-center font-calibri text-lg">
                      <FaExclamationCircle className="mr-1" size={12} />
                      {registerErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="register-confirm-password"
                    className="block text-lg font-semibold text-gray-700 mb-2 font-calibri"
                  >
                    <FaLock className="inline mr-2" size={14} />
                    Confirm Password <span className="text-red-500 font-calibri">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="register-confirm-password"
                      name="confirmPassword"
                      autoComplete="new-password"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 font-calibri text-lg ${registerErrors.confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                        }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label="Toggle password visibility"
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash size={18} />
                      ) : (
                        <FaEye size={18} />
                      )}
                    </button>
                  </div>
                  {registerErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500 flex items-center font-calibri text-lg">
                      <FaExclamationCircle className="mr-1" size={12} />
                      {registerErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isRegistering}
                className={`w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 font-calibri text-lg ${isRegistering ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {isRegistering ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="font-calibri text-lg">Creating Account...</span></> : "Create Account"}
              </button>

              {/* Submit Status */}
              {submitStatus.message && (
                <div
                  className={`p-4 rounded-lg flex items-center ${submitStatus.type === "success"
                    ? "bg-rose-500 text-white border border-green-200 font-calibri text-lg"
                    : "bg-red-50 text-red-800 border border-red-200 font-calibri text-lg"
                    }`}
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

            {/* Sign In Link */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm font-calibri">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="text-rose-500 hover:text-rose-600 font-semibold"
                >
                  Sign in
                </Link>
              </p>
              <div className="mt-4 flex items-center justify-center text-gray-500 text-sm font-calibri">
                <FaLock className="mr-2 text-rose-500" size={14} />
                <span>Secure authentication powered by encrypted connections</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
