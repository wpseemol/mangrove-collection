import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";

export default function AuthPages() {
     const [currentPage, setCurrentPage] = useState("login"); // 'login' or 'register'
     const [showPassword, setShowPassword] = useState(false);
     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
     const [formData, setFormData] = useState({
          email: "",
          password: "",
          name: "",
          confirmPassword: "",
     });
     const [errors, setErrors] = useState({});
     const [warnings, setWarnings] = useState({});

     // Password strength validation
     const validatePassword = (password) => {
          const requirements = {
               length: password.length >= 8,
               uppercase: /[A-Z]/.test(password),
               lowercase: /[a-z]/.test(password),
               number: /\d/.test(password),
               special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
          };

          const strength = Object.values(requirements).filter(Boolean).length;
          return { requirements, strength };
     };

     const handleInputChange = (e) => {
          const { name, value } = e.target;
          setFormData((prev) => ({ ...prev, [name]: value }));

          // Clear errors for this field
          if (errors[name]) {
               setErrors((prev) => ({ ...prev, [name]: "" }));
          }

          // Password validation for register page
          if (name === "password" && currentPage === "register") {
               const { requirements, strength } = validatePassword(value);
               if (strength < 5 && value.length > 0) {
                    setWarnings((prev) => ({
                         ...prev,
                         password: requirements,
                    }));
               } else {
                    setWarnings((prev) => ({ ...prev, password: null }));
               }
          }

          // Confirm password validation
          if (name === "confirmPassword" && currentPage === "register") {
               if (value !== formData.password && value.length > 0) {
                    setErrors((prev) => ({
                         ...prev,
                         confirmPassword: "Passwords do not match",
                    }));
               } else {
                    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
               }
          }
     };

     const validateForm = () => {
          const newErrors = {};

          // Email validation
          if (!formData.email) {
               newErrors.email = "Email is required";
          } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
               newErrors.email = "Please enter a valid email address";
          }

          // Password validation
          if (!formData.password) {
               newErrors.password = "Password is required";
          } else if (currentPage === "register") {
               const { strength } = validatePassword(formData.password);
               if (strength < 5) {
                    newErrors.password =
                         "Password must meet all security requirements";
               }
          }

          // Register-specific validations
          if (currentPage === "register") {
               if (!formData.name.trim()) {
                    newErrors.name = "Full name is required";
               }

               if (!formData.confirmPassword) {
                    newErrors.confirmPassword = "Please confirm your password";
               } else if (formData.password !== formData.confirmPassword) {
                    newErrors.confirmPassword = "Passwords do not match";
               }
          }

          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
     };

     const handleSubmit = () => {
          if (validateForm()) {
               console.log("Form submitted:", formData);
               // Add your authentication logic here
          }
     };

     const switchPage = (page) => {
          setCurrentPage(page);
          setFormData({
               email: "",
               password: "",
               name: "",
               confirmPassword: "",
          });
          setErrors({});
          setWarnings({});
     };

     const PasswordStrengthIndicator = ({ requirements }) => {
          if (!requirements) return null;

          const indicators = [
               { key: "length", text: "At least 8 characters" },
               { key: "uppercase", text: "One uppercase letter" },
               { key: "lowercase", text: "One lowercase letter" },
               { key: "number", text: "One number" },
               { key: "special", text: "One special character" },
          ];

          return (
               <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                         Password must contain:
                    </p>
                    <div className="space-y-1">
                         {indicators.map(({ key, text }) => (
                              <div
                                   key={key}
                                   className="flex items-center text-sm"
                              >
                                   {requirements[key] ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                                   ) : (
                                        <X className="w-4 h-4 text-red-500 mr-2" />
                                   )}
                                   <span
                                        className={
                                             requirements[key]
                                                  ? "text-green-700"
                                                  : "text-red-700"
                                        }
                                   >
                                        {text}
                                   </span>
                              </div>
                         ))}
                    </div>
               </div>
          );
     };

     return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
               <div className="max-w-md w-full space-y-8">
                    {/* Header */}
                    <div className="text-center">
                         <h2 className="text-3xl font-bold text-gray-900">
                              {currentPage === "login"
                                   ? "Sign in to your account"
                                   : "Create your account"}
                         </h2>
                         <p className="mt-2 text-sm text-gray-600">
                              {currentPage === "login"
                                   ? "Welcome back! Please sign in to continue."
                                   : "Join us today and start shopping."}
                         </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                         <button
                              onClick={() => switchPage("login")}
                              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                   currentPage === "login"
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                              }`}
                         >
                              Sign In
                         </button>
                         <button
                              onClick={() => switchPage("register")}
                              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                   currentPage === "register"
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                              }`}
                         >
                              Sign Up
                         </button>
                    </div>

                    {/* Form */}
                    <div className="bg-white py-8 px-6 shadow-sm rounded-lg border">
                         <div className="space-y-6">
                              {/* Name Field (Register only) */}
                              {currentPage === "register" && (
                                   <div>
                                        <label
                                             htmlFor="name"
                                             className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                             Full Name
                                        </label>
                                        <input
                                             id="name"
                                             name="name"
                                             type="text"
                                             value={formData.name}
                                             onChange={handleInputChange}
                                             className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                  errors.name
                                                       ? "border-red-500"
                                                       : "border-gray-300"
                                             }`}
                                             placeholder="Enter your full name"
                                        />
                                        {errors.name && (
                                             <p className="mt-1 text-sm text-red-600 flex items-center">
                                                  <AlertCircle className="w-4 h-4 mr-1" />
                                                  {errors.name}
                                             </p>
                                        )}
                                   </div>
                              )}

                              {/* Email Field */}
                              <div>
                                   <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                   >
                                        Email Address
                                   </label>
                                   <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                             errors.email
                                                  ? "border-red-500"
                                                  : "border-gray-300"
                                        }`}
                                        placeholder="Enter your email"
                                   />
                                   {errors.email && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                             <AlertCircle className="w-4 h-4 mr-1" />
                                             {errors.email}
                                        </p>
                                   )}
                              </div>

                              {/* Password Field */}
                              <div>
                                   <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                   >
                                        Password
                                   </label>
                                   <div className="relative">
                                        <input
                                             id="password"
                                             name="password"
                                             type={
                                                  showPassword
                                                       ? "text"
                                                       : "password"
                                             }
                                             value={formData.password}
                                             onChange={handleInputChange}
                                             className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                  errors.password
                                                       ? "border-red-500"
                                                       : "border-gray-300"
                                             }`}
                                             placeholder="Enter your password"
                                        />
                                        <button
                                             type="button"
                                             onClick={() =>
                                                  setShowPassword(!showPassword)
                                             }
                                             className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                             {showPassword ? (
                                                  <EyeOff className="w-4 h-4" />
                                             ) : (
                                                  <Eye className="w-4 h-4" />
                                             )}
                                        </button>
                                   </div>
                                   {errors.password && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                             <AlertCircle className="w-4 h-4 mr-1" />
                                             {errors.password}
                                        </p>
                                   )}
                                   {currentPage === "register" &&
                                        warnings.password && (
                                             <PasswordStrengthIndicator
                                                  requirements={
                                                       warnings.password
                                                  }
                                             />
                                        )}
                              </div>

                              {/* Confirm Password Field (Register only) */}
                              {currentPage === "register" && (
                                   <div>
                                        <label
                                             htmlFor="confirmPassword"
                                             className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                             Confirm Password
                                        </label>
                                        <div className="relative">
                                             <input
                                                  id="confirmPassword"
                                                  name="confirmPassword"
                                                  type={
                                                       showConfirmPassword
                                                            ? "text"
                                                            : "password"
                                                  }
                                                  value={
                                                       formData.confirmPassword
                                                  }
                                                  onChange={handleInputChange}
                                                  className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                       errors.confirmPassword
                                                            ? "border-red-500"
                                                            : "border-gray-300"
                                                  }`}
                                                  placeholder="Confirm your password"
                                             />
                                             <button
                                                  type="button"
                                                  onClick={() =>
                                                       setShowConfirmPassword(
                                                            !showConfirmPassword
                                                       )
                                                  }
                                                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                             >
                                                  {showConfirmPassword ? (
                                                       <EyeOff className="w-4 h-4" />
                                                  ) : (
                                                       <Eye className="w-4 h-4" />
                                                  )}
                                             </button>
                                        </div>
                                        {errors.confirmPassword && (
                                             <p className="mt-1 text-sm text-red-600 flex items-center">
                                                  <AlertCircle className="w-4 h-4 mr-1" />
                                                  {errors.confirmPassword}
                                             </p>
                                        )}
                                   </div>
                              )}

                              {/* Forgot Password (Login only) */}
                              {currentPage === "login" && (
                                   <div className="text-right">
                                        <button
                                             type="button"
                                             className="text-sm text-blue-600 hover:text-blue-500"
                                        >
                                             Forgot your password?
                                        </button>
                                   </div>
                              )}

                              {/* Terms Notice (Register only) */}
                              {currentPage === "register" && (
                                   <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-sm">
                                             By creating an account, you agree
                                             to our Terms of Service and Privacy
                                             Policy.
                                        </AlertDescription>
                                   </Alert>
                              )}

                              {/* Submit Button */}
                              <button
                                   onClick={handleSubmit}
                                   className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              >
                                   {currentPage === "login"
                                        ? "Sign In"
                                        : "Create Account"}
                              </button>
                         </div>
                    </div>

                    {/* Social Login */}
                    <div className="bg-white py-6 px-6 shadow-sm rounded-lg border">
                         <div className="relative mb-4">
                              <div className="absolute inset-0 flex items-center">
                                   <div className="w-full border-t border-gray-300" />
                              </div>
                              <div className="relative flex justify-center text-sm">
                                   <span className="px-2 bg-white text-gray-500">
                                        Or continue with
                                   </span>
                              </div>
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                   Google
                              </button>
                              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                   Facebook
                              </button>
                         </div>
                    </div>
               </div>
          </div>
     );
}
