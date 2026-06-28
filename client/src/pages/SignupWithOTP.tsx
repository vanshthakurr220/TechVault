import { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { navigate } from "wouter/use-browser-location";
import { useApp } from "@/contexts/AppContext";
import { SITE_CONFIG } from "@/config/siteConfig";

type SignupStep = "email" | "emailOtp" | "mobile" | "mobileOtp" | "details";

export default function SignupWithOTP() {
  const {
    sendOTPSignup,
    verifyOTPSignup,
    sendMobileOTPSignup,
    verifyMobileOTPSignup,
    signup,
    loading,
  } = useApp();

  const [step, setStep] = useState<SignupStep>("email");
  const [mobile, setMobile] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpAttempts, setOtpAttempts] = useState(0);

  // Step 1: Send OTP to email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = "Email is required";
    if (!email.includes("@")) newErrors.email = "Please enter a valid email";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await sendOTPSignup(email);
      setStep("emailOtp");
      setErrors({});
      setOtpAttempts(0);
    } catch (error) {
      setErrors({ email: "Failed to send OTP" });
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!otp) newErrors.otp = "OTP is required";
    if (otp.length !== 6) newErrors.otp = "OTP must be 6 digits";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await verifyOTPSignup(email, otp);
      setStep("mobile");
      setErrors({});
    } catch (error) {
      setOtpAttempts(otpAttempts + 1);
      setErrors({ otp: "Invalid OTP" });
    }
  };

  // Step 3: Complete signup with details
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!mobile) newErrors.mobile = "Mobile number is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await signup(formData.username, email, formData.password, mobile);
      navigate("/");
    } catch (error) {
      setErrors({ form: "Signup failed" });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleResendOTP = async () => {
    try {
      await sendOTPSignup(email);
      setOtp("");
      setOtpAttempts(0);
    } catch (error) {
      setErrors({ otp: "Failed to resend OTP" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-card text-card-foreground p-8 rounded-lg border border-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold monospace mb-2">
              Create Account
            </h1>
            <p className="text-muted-foreground">
              Join {SITE_CONFIG.companyName} and start shopping
            </p>
            <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className={`h-2 w-8 rounded-full ${
                    (item === 1 && step === "email") ||
                    (item === 2 && step === "emailOtp") ||
                    (item === 3 && step === "mobile") ||
                    (item === 4 && step === "mobileOtp") ||
                    (item === 5 && step === "details")
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step 1: Email Verification */}
          {step === "email" && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-bold monospace mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-3 text-muted-foreground"
                    size={18}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors({});
                    }}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                We'll send you a verification code to confirm your email
                address.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-bold monospace hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2 btn-active disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP"}
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === "emailOtp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-bold monospace mb-2">
                  Verification Code
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Enter the 6-digit code sent to <strong>{email}</strong>
                </p>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(value);
                    setErrors({});
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest font-bold"
                />
                {errors.otp && (
                  <p className="text-red-600 text-xs mt-1">{errors.otp}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-bold monospace hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2 btn-active disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP"}
                <CheckCircle size={18} />
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="w-full text-primary py-2 rounded-lg font-bold monospace hover:text-primary/80 transition-colors duration-200"
              >
                Resend OTP
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setErrors({});
                }}
                className="w-full text-muted-foreground py-2 rounded-lg font-bold monospace hover:text-foreground transition-colors duration-200"
              >
                Change Email
              </button>
            </form>
          )}

          {/* Step 3: Mobile Number */}
          {step === "mobile" && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                const newErrors: Record<string, string> = {};

                if (!mobile) {
                  newErrors.mobile = "Mobile number is required";
                } else if (!/^\d{10}$/.test(mobile)) {
                  newErrors.mobile = "Enter a valid 10-digit mobile number";
                }

                if (Object.keys(newErrors).length > 0) {
                  setErrors(newErrors);
                  return;
                }

                try {
                  await sendMobileOTPSignup(mobile);
                  setErrors({});
                  setStep("mobileOtp");
                } catch (error) {
                  setErrors({
                    mobile: "Failed to send OTP",
                  });
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-bold monospace mb-2">
                  Mobile Number
                </label>

                <div className="relative">
                  <Phone
                    className="absolute left-3 top-3 text-muted-foreground"
                    size={18}
                  />

                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setMobile(value);
                      setErrors({});
                    }}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {errors.mobile && (
                  <p className="text-red-600 text-xs mt-1">{errors.mobile}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-bold monospace hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2 btn-active disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Mobile OTP"}

                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* Step 4: Mobile OTP */}
          {step === "mobileOtp" && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                const newErrors: Record<string, string> = {};

                if (!mobileOtp) {
                  newErrors.mobileOtp = "OTP is required";
                } else if (mobileOtp.length !== 6) {
                  newErrors.mobileOtp = "OTP must be 6 digits";
                }

                if (Object.keys(newErrors).length > 0) {
                  setErrors(newErrors);
                  return;
                }

                try {
                  await verifyMobileOTPSignup(mobile, mobileOtp);

                  setErrors({});
                  setStep("details");
                } catch (error) {
                  setErrors({
                    mobileOtp: "Invalid OTP",
                  });
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-bold monospace mb-2">
                  Mobile OTP
                </label>

                <p className="text-xs text-muted-foreground mb-3">
                  Enter the 6-digit OTP sent to <strong>{mobile}</strong>
                </p>

                <input
                  type="text"
                  value={mobileOtp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setMobileOtp(value);
                    setErrors({});
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-center text-2xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                />

                {errors.mobileOtp && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.mobileOtp}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || mobileOtp.length !== 6}
                className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-bold monospace hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2 btn-active disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify Mobile OTP"}

                <CheckCircle size={18} />
              </button>

              <button
                type="button"
                onClick={async () => {
                  await sendMobileOTPSignup(mobile);
                  setMobileOtp("");
                }}
                className="w-full text-primary py-2 rounded-lg font-bold monospace"
              >
                Resend OTP
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("mobile");
                  setMobileOtp("");
                }}
                className="w-full text-muted-foreground py-2 rounded-lg font-bold monospace"
              >
                Change Mobile Number
              </button>
            </form>
          )}

          {/* Step 5: Account Details */}
          {step === "details" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  Email verified: {email}
                </span>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  Mobile verified: {mobile}
                </span>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-bold monospace mb-2">
                  Username
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-3 text-muted-foreground"
                    size={18}
                  />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="johndoe"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {errors.username && (
                  <p className="text-red-600 text-xs mt-1">{errors.username}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold monospace mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3 text-muted-foreground"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-bold monospace mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3 text-muted-foreground"
                    size={18}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-bold monospace hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2 btn-active disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
