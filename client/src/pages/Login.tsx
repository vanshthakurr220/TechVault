import { useState } from "react";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { SITE_CONFIG } from "@/config/siteConfig";
import Loader from "@/components/Loader";

export default function Login() {
  const { login, loading, sendForgotPasswordOTP, resetPasswordWithOTP } =
    useApp();
  const [, navigate] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const [forgotPasswordStep, setForgotPasswordStep] = useState<
    "email" | "reset"
  >("email");

  const [forgotEmail, setForgotEmail] = useState("");

  const [forgotOTP, setForgotOTP] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [forgotErrors, setForgotErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      setErrors({ form: "Login failed" });
    }
  };

  const handleSendForgotPasswordOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!forgotEmail) {
      newErrors.forgotEmail = "Email is required";
    } else if (!forgotEmail.includes("@")) {
      newErrors.forgotEmail = "Please enter a valid email";
    }

    if (Object.keys(newErrors).length > 0) {
      setForgotErrors(newErrors);
      return;
    }

    try {
      await sendForgotPasswordOTP(forgotEmail);
      setForgotPasswordStep("reset");
      setForgotErrors({});
    } catch (error) {
      setForgotErrors({
        forgotEmail: "Failed to send OTP",
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!forgotOTP) {
      newErrors.forgotOTP = "OTP is required";
    } else if (forgotOTP.length !== 6) {
      newErrors.forgotOTP = "OTP must be 6 digits";
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setForgotErrors(newErrors);
      return;
    }

    try {
      await resetPasswordWithOTP(
        forgotEmail,
        forgotOTP,
        newPassword,
        confirmPassword,
      );

      setShowForgotPasswordModal(false);
      setForgotPasswordStep("email");
      setForgotEmail("");
      setForgotOTP("");
      setNewPassword("");
      setConfirmPassword("");
      setForgotErrors({});
    } catch (error) {
      setForgotErrors({
        forgotOTP: "Failed to reset password",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-card text-card-foreground p-8 rounded-lg border border-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold monospace mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to your {SITE_CONFIG.companyName} account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({});
                  }}
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

              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPasswordModal(true);
                    setForgotPasswordStep("email");
                    setForgotEmail("");
                    setForgotOTP("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setForgotErrors({});
                  }}
                  className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {errors.form && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
                {errors.form}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-bold monospace hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2 btn-active disabled:opacity-50"
            >
              {loading ? (
                <Loader text="Logging in..." variant="button" />
              ) : (
                "Sign In"
              )}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup">
                <a className="text-primary font-bold hover:text-primary/80 transition-colors">
                  Sign up here
                </a>
              </Link>
            </p>
          </div>
        </div>
      </div>

      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-xl border border-border p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold monospace">
                {forgotPasswordStep === "email"
                  ? "Forgot Password"
                  : "Reset Password"}
              </h3>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPasswordModal(false);
                  setForgotPasswordStep("email");
                  setForgotEmail("");
                  setForgotOTP("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setForgotErrors({});
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {forgotPasswordStep === "email" ? (
              <form
                onSubmit={handleSendForgotPasswordOTP}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Enter your registered email address. We will send you a
                  6-digit OTP to reset your password.
                </p>

                <div>
                  <label className="block text-sm font-bold monospace mb-2">
                    Registered Email
                  </label>

                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-3 text-muted-foreground"
                      size={18}
                    />

                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        setForgotErrors({});
                      }}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {forgotErrors.forgotEmail && (
                    <p className="text-red-600 text-xs mt-1">
                      {forgotErrors.forgotEmail}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-bold monospace hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader text="Sending OTP..." variant="button" />
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter the OTP sent to{" "}
                  <span className="font-semibold">{forgotEmail}</span> and
                  create a new password.
                </p>

                <div>
                  <label className="block text-sm font-bold monospace mb-2">
                    Verification OTP
                  </label>

                  <input
                    type="text"
                    value={forgotOTP}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setForgotOTP(value);
                      setForgotErrors({});
                    }}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest font-bold"
                  />

                  {forgotErrors.forgotOTP && (
                    <p className="text-red-600 text-xs mt-1">
                      {forgotErrors.forgotOTP}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold monospace mb-2">
                    New Password
                  </label>

                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-3 text-muted-foreground"
                      size={18}
                    />

                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setForgotErrors({});
                      }}
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-12 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {forgotErrors.newPassword && (
                    <p className="text-red-600 text-xs mt-1">
                      {forgotErrors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold monospace mb-2">
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-3 text-muted-foreground"
                      size={18}
                    />

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setForgotErrors({});
                      }}
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-12 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {forgotErrors.confirmPassword && (
                    <p className="text-red-600 text-xs mt-1">
                      {forgotErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-bold monospace hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader text="Resetting..." variant="button" />
                  ) : (
                    "Reset Password"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordStep("email");
                    setForgotOTP("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setForgotErrors({});
                  }}
                  className="w-full border border-border py-2 rounded-lg font-bold monospace hover:bg-black hover:text-white hover:border-black transition-colors"
                >
                  Back
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
