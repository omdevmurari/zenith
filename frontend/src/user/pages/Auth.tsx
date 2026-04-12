import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PasswordField from "../../components/PasswordField";
import { apiUrl } from "../../lib/api";

const NAME_REGEX = /^[A-Za-z]+(?:[A-Za-z ]*[A-Za-z])?$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$/;
const OTP_REGEX = /^\d{6}$/;

type AuthView = "login" | "register" | "forgot";
type OtpPurpose = "register" | "login";
type OtpContext = {
  purpose: OtpPurpose;
  email: string;
  title: string;
  subtitle: string;
  actionLabel: string;
  endpoint: string;
};

const getNameValidationMessage = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "Name is required.";
  if (trimmed.replace(/[^A-Za-z]/g, "").length < 2) {
    return "Name must include at least 2 alphabets.";
  }
  if (!NAME_REGEX.test(trimmed)) {
    return "Name can contain only alphabets and spaces.";
  }
  return "";
};

const getEmailValidationMessage = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "Email is required.";
  if (!EMAIL_REGEX.test(trimmed)) {
    return "Enter a valid email like name@college.ac.in or name@example.com.";
  }
  const domain = trimmed.split("@")[1] || "";
  if (domain.split(".").filter(Boolean).length < 2) {
    return "Email domain must include a valid extension.";
  }
  return "";
};

const getPasswordValidationMessage = (value: string) => {
  if (!value) return "Password is required.";
  if (!PASSWORD_REGEX.test(value)) {
    return "Password must be 8+ chars with upper, lower, number, and symbol.";
  }
  return "";
};

const getOtpValidationMessage = (value: string) => {
  if (!value.trim()) return "OTP is required.";
  if (!OTP_REGEX.test(value.trim())) return "OTP must be exactly 6 digits.";
  return "";
};

export default function Auth() {
  const navigate = useNavigate();
  const [authView, setAuthView] = useState<AuthView>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpContext, setOtpContext] = useState<OtpContext | null>(null);
  const [forgotStage, setForgotStage] = useState<"request" | "reset">("request");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetMessages = () => {
    setErrors({});
    setSubmitError("");
    setSuccessMessage("");
  };

  const resetSensitiveFields = () => {
    setPassword("");
    setConfirmPassword("");
    setOtp("");
  };

  const switchView = (nextView: AuthView) => {
    setAuthView(nextView);
    setOtpContext(null);
    setForgotStage("request");
    setName("");
    setEmail("");
    resetSensitiveFields();
    resetMessages();
  };

  const setFieldError = (field: string) => {
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validateLoginForm = () => {
    const nextErrors: Record<string, string> = {};
    const emailError = getEmailValidationMessage(email);
    const passwordError = getPasswordValidationMessage(password);
    if (emailError) nextErrors.email = emailError;
    if (passwordError) nextErrors.password = passwordError;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const nextErrors: Record<string, string> = {};
    const nameError = getNameValidationMessage(name);
    const emailError = getEmailValidationMessage(email);
    const passwordError = getPasswordValidationMessage(password);
    if (nameError) nextErrors.name = nameError;
    if (emailError) nextErrors.email = emailError;
    if (passwordError) nextErrors.password = passwordError;
    if (!confirmPassword) nextErrors.confirmPassword = "Confirm password is required.";
    else if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateForgotRequest = () => {
    const nextErrors: Record<string, string> = {};
    const emailError = getEmailValidationMessage(email);
    if (emailError) nextErrors.email = emailError;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateForgotReset = () => {
    const nextErrors: Record<string, string> = {};
    const emailError = getEmailValidationMessage(email);
    const otpError = getOtpValidationMessage(otp);
    const passwordError = getPasswordValidationMessage(password);
    if (emailError) nextErrors.email = emailError;
    if (otpError) nextErrors.otp = otpError;
    if (passwordError) nextErrors.password = passwordError;
    if (!confirmPassword) nextErrors.confirmPassword = "Confirm password is required.";
    else if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateOtpForm = () => {
    const nextErrors: Record<string, string> = {};
    const otpError = getOtpValidationMessage(otp);
    if (otpError) nextErrors.otp = otpError;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const sendRequest = async (path: string, body: Record<string, unknown>) => {
    const res = await fetch(apiUrl(`/api/auth${path}`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Request failed.");
    return data;
  };

  const completeAuth = (data: any) => {
    localStorage.setItem("token", data.token);
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);
    }
    if (data.user?.role === "admin" || data.user?.role === "owner") {
      navigate("/admin", { replace: true });
      return;
    }
    navigate("/", { replace: true });
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMessages();
    if (!validateLoginForm()) return;
    setIsSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const data = await sendRequest("/login", { email: normalizedEmail, password });
      setOtpContext({
        purpose: "login",
        email: normalizedEmail,
        title: "Verify Login OTP",
        subtitle: "We sent a 6-digit OTP to your email. Enter it to complete sign in.",
        actionLabel: "Verify And Enter Zenith",
        endpoint: "/verify-login-otp",
      });
      setOtp("");
      setSuccessMessage(data.message || "Login OTP sent.");
    } catch (error: any) {
      setSubmitError(error.message || "Something went wrong while signing in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMessages();
    if (!validateRegisterForm()) return;
    setIsSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const data = await sendRequest("/register", {
        name: name.trim(),
        email: normalizedEmail,
        password,
      });
      setOtpContext({
        purpose: "register",
        email: normalizedEmail,
        title: "Verify Registration OTP",
        subtitle: "Your Zenith account is almost ready. Enter the OTP sent to your email.",
        actionLabel: "Verify And Create Account",
        endpoint: "/verify-register-otp",
      });
      setOtp("");
      setSuccessMessage(data.message || "Registration OTP sent.");
    } catch (error: any) {
      setSubmitError(error.message || "Something went wrong while creating your account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMessages();
    if (!otpContext || !validateOtpForm()) return;
    setIsSubmitting(true);
    try {
      const data = await sendRequest(otpContext.endpoint, {
        email: otpContext.email,
        otp: otp.trim(),
      });
      completeAuth(data);
    } catch (error: any) {
      setSubmitError(error.message || "Unable to verify OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMessages();
    if (!validateForgotRequest()) return;
    setIsSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const data = await sendRequest("/forgot-password/request-otp", { email: normalizedEmail });
      setEmail(normalizedEmail);
      setForgotStage("reset");
      setOtp("");
      setSuccessMessage(data.message || "Password reset OTP sent.");
    } catch (error: any) {
      setSubmitError(error.message || "Unable to send password reset OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMessages();
    if (!validateForgotReset()) return;
    setIsSubmitting(true);
    try {
      const data = await sendRequest("/forgot-password/reset", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        password,
      });
      const preservedEmail = email.trim().toLowerCase();
      setAuthView("login");
      setForgotStage("request");
      setOtpContext(null);
      setEmail(preservedEmail);
      resetSensitiveFields();
      setSuccessMessage(data.message || "Password reset successful.");
    } catch (error: any) {
      setSubmitError(error.message || "Unable to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    resetMessages();
    const purpose = otpContext?.purpose || (forgotStage === "reset" ? "forgot_password" : null);
    const normalizedEmail = email.trim().toLowerCase() || otpContext?.email;
    if (!purpose || !normalizedEmail) return;
    setIsSubmitting(true);
    try {
      const data = await sendRequest("/resend-otp", { email: normalizedEmail, purpose });
      setSuccessMessage(data.message || "A fresh OTP has been sent.");
    } catch (error: any) {
      setSubmitError(error.message || "Unable to resend OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInfoBox = () => (
    <>
      {submitError && (
        <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {submitError}
        </div>
      )}
      {successMessage && (
        <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successMessage}
        </div>
      )}
    </>
  );

  return (
    <section className="min-h-screen w-full bg-[#020617] flex items-center justify-center relative overflow-hidden border-t border-slate-800">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 600" preserveAspectRatio="none">
        {Array.from({ length: 200 }).map((_, i) => {
          const cx = Math.random() * 1200;
          const cy = Math.random() * 600;
          const r = Math.random() * 0.7 + 0.2;
          return (
            <motion.circle
              key={`small-${i}`}
              cx={cx}
              cy={cy}
              r={r}
              fill="#ffffff"
              initial={{ opacity: 0.1 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2 + Math.random() * 4, delay: Math.random() * 5, repeat: Infinity, ease: "easeInOut" }}
            />
          );
        })}
        {Array.from({ length: 80 }).map((_, i) => {
          const cx = Math.random() * 1200;
          const cy = Math.random() * 600;
          const r = Math.random() * 1.3 + 0.6;
          return (
            <motion.circle
              key={`mid-${i}`}
              cx={cx}
              cy={cy}
              r={r}
              fill="#ffffff"
              initial={{ opacity: 0.2 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3 + Math.random() * 3, delay: Math.random() * 4, repeat: Infinity }}
            />
          );
        })}
        {Array.from({ length: 25 }).map((_, i) => {
          const cx = Math.random() * 1200;
          const cy = Math.random() * 600;
          const r = Math.random() * 2 + 1;
          return (
            <motion.circle
              key={`big-${i}`}
              cx={cx}
              cy={cy}
              r={r}
              fill="#ffffff"
              style={{ filter: "drop-shadow(0 0 6px white)" }}
              initial={{ opacity: 0.4 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4 + Math.random() * 4, delay: Math.random() * 5, repeat: Infinity }}
            />
          );
        })}
      </svg>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] md:text-[25vw] font-black text-[#0b1229] whitespace-nowrap pointer-events-none select-none tracking-tighter z-10 drop-shadow-2xl"
      >
        ZENITH
      </motion.div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none z-15" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-20 w-full max-w-md bg-slate-900/50 backdrop-blur-2xl border border-slate-700/50 rounded-[2.5rem] p-10 shadow-2xl"
      >
        {!otpContext && (
          <div className="flex bg-slate-950/50 p-1.5 rounded-full border border-slate-800 mb-10 relative cursor-none">
            <button onClick={() => switchView("login")} className={`flex-1 relative z-10 py-2.5 rounded-full text-sm font-bold transition-colors cursor-none ${authView === "login" ? "text-slate-950" : "text-slate-400 hover:text-white"}`}>
              Sign In
            </button>
            <button onClick={() => switchView("register")} className={`flex-1 relative z-10 py-2.5 rounded-full text-sm font-bold transition-colors cursor-none ${authView === "register" ? "text-slate-950" : "text-slate-400 hover:text-white"}`}>
              Create Account
            </button>
            <motion.div
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-emerald-400 rounded-full z-0 shadow-[0_0_15px_rgba(52,211,153,0.4)]"
              animate={{ left: authView === "login" ? "6px" : "calc(50% + 0px)" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>
        )}

        <div className="relative min-h-[420px]">
          {renderInfoBox()}

          <AnimatePresence mode="wait">
            {otpContext ? (
              <motion.form key={`otp-${otpContext.purpose}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="flex flex-col gap-5" onSubmit={handleVerifyOtp}>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-[0.3em]">OTP Verification</p>
                  <h2 className="text-3xl font-black text-white">{otpContext.title}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">{otpContext.subtitle}</p>
                  <p className="text-xs text-slate-500">Destination: <span className="text-slate-300">{otpContext.email}</span></p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">One-Time Password</label>
                  <input
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setFieldError("otp");
                    }}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    className={`w-full bg-slate-950/80 border rounded-xl px-5 py-4 text-white tracking-[0.4em] text-center placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-none ${errors.otp ? "border-rose-500/70" : "border-slate-800"}`}
                  />
                  {errors.otp && <p className="pl-1 text-xs text-rose-300">{errors.otp}</p>}
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full mt-2 bg-white hover:bg-slate-200 disabled:opacity-60 text-slate-950 font-black text-lg py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-none">
                  {isSubmitting ? "Verifying..." : otpContext.actionLabel}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button type="button" onClick={handleResendOtp} disabled={isSubmitting} className="text-emerald-400 hover:text-emerald-300 disabled:opacity-60 cursor-none">Resend OTP</button>
                  <button type="button" onClick={() => { setOtpContext(null); setOtp(""); resetMessages(); }} className="text-slate-400 hover:text-white cursor-none">Back</button>
                </div>
              </motion.form>
            ) : authView === "forgot" ? (
              forgotStage === "request" ? (
                <motion.form key="forgot-request" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="flex flex-col gap-5" onSubmit={handleForgotRequest}>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-[0.3em]">Password Recovery</p>
                    <h2 className="text-3xl font-black text-white">Forgot Password</h2>
                    <p className="text-sm text-slate-400 leading-relaxed">Enter your verified email and we will send a reset OTP.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                    <input
                      value={email}
                      type="email"
                      placeholder="name@college.ac.in"
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setFieldError("email");
                      }}
                      className={`w-full bg-slate-950/80 border rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-none ${errors.email ? "border-rose-500/70" : "border-slate-800"}`}
                    />
                    {errors.email && <p className="pl-1 text-xs text-rose-300">{errors.email}</p>}
                  </div>

                  <button type="submit" disabled={isSubmitting} className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black text-lg py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(52,211,153,0.3)] cursor-none">
                    {isSubmitting ? "Sending OTP..." : "Send Reset OTP"}
                  </button>

                  <button type="button" onClick={() => switchView("login")} className="text-sm text-slate-400 hover:text-white cursor-none">Back to Sign In</button>
                </motion.form>
              ) : (
                <motion.form key="forgot-reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="flex flex-col gap-5" onSubmit={handleForgotReset}>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-[0.3em]">Reset Password</p>
                    <h2 className="text-3xl font-black text-white">Enter OTP And New Password</h2>
                    <p className="text-sm text-slate-400 leading-relaxed">We sent a reset OTP to {email}. Enter it with your new password.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">One-Time Password</label>
                    <input
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setFieldError("otp");
                      }}
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123456"
                      className={`w-full bg-slate-950/80 border rounded-xl px-5 py-4 text-white tracking-[0.4em] text-center placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-none ${errors.otp ? "border-rose-500/70" : "border-slate-800"}`}
                    />
                    {errors.otp && <p className="pl-1 text-xs text-rose-300">{errors.otp}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">New Password</label>
                    <PasswordField
                      value={password}
                      onChange={(value) => {
                        setPassword(value);
                        setFieldError("password");
                      }}
                      inputClassName={`${errors.password ? "border-rose-500/70" : "border-slate-800"} cursor-none`}
                    />
                    {errors.password && <p className="pl-1 text-xs text-rose-300">{errors.password}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Confirm Password</label>
                    <PasswordField
                      value={confirmPassword}
                      onChange={(value) => {
                        setConfirmPassword(value);
                        setFieldError("confirmPassword");
                      }}
                      inputClassName={`${errors.confirmPassword ? "border-rose-500/70" : "border-slate-800"} cursor-none`}
                    />
                    {errors.confirmPassword && <p className="pl-1 text-xs text-rose-300">{errors.confirmPassword}</p>}
                  </div>

                  <button type="submit" disabled={isSubmitting} className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black text-lg py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(52,211,153,0.3)] cursor-none">
                    {isSubmitting ? "Resetting Password..." : "Reset Password"}
                  </button>

                  <div className="flex items-center justify-between text-sm">
                    <button type="button" onClick={handleResendOtp} disabled={isSubmitting} className="text-emerald-400 hover:text-emerald-300 disabled:opacity-60 cursor-none">Resend OTP</button>
                    <button type="button" onClick={() => { setForgotStage("request"); resetSensitiveFields(); resetMessages(); }} className="text-slate-400 hover:text-white cursor-none">Change Email</button>
                  </div>
                </motion.form>
              )
            ) : authView === "login" ? (
              <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="flex flex-col gap-5" onSubmit={handleLogin}>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                  <input
                    value={email}
                    type="email"
                    placeholder="name@college.ac.in"
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldError("email");
                    }}
                    className={`w-full bg-slate-950/80 border rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-none ${errors.email ? "border-rose-500/70" : "border-slate-800"}`}
                  />
                  {errors.email && <p className="pl-1 text-xs text-rose-300">{errors.email}</p>}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center pl-1 pr-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                    <button type="button" onClick={() => switchView("forgot")} className="text-xs font-bold text-emerald-500 hover:text-emerald-400 cursor-none">Forgot?</button>
                  </div>
                  <PasswordField
                    value={password}
                    onChange={(value) => {
                      setPassword(value);
                      setFieldError("password");
                    }}
                    inputClassName={`${errors.password ? "border-rose-500/70" : "border-slate-800"} cursor-none`}
                  />
                  {errors.password && <p className="pl-1 text-xs text-rose-300">{errors.password}</p>}
                  <p className="pl-1 text-[11px] text-slate-500">Sign in requires your password first, then a login OTP.</p>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-white hover:bg-slate-200 disabled:opacity-60 text-slate-950 font-black text-lg py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-none">
                  {isSubmitting ? "Sending Login OTP..." : "Initialize Session"}
                </button>
              </motion.form>
            ) : (
              <motion.form key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="flex flex-col gap-5" onSubmit={handleRegister}>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                  <input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setFieldError("name");
                    }}
                    type="text"
                    placeholder="Om Devmurari"
                    className={`w-full bg-slate-950/80 border rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-none ${errors.name ? "border-rose-500/70" : "border-slate-800"}`}
                  />
                  {errors.name && <p className="pl-1 text-xs text-rose-300">{errors.name}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                  <input
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldError("email");
                    }}
                    type="email"
                    placeholder="name@college.ac.in"
                    className={`w-full bg-slate-950/80 border rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-none ${errors.email ? "border-rose-500/70" : "border-slate-800"}`}
                  />
                  {errors.email && <p className="pl-1 text-xs text-rose-300">{errors.email}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Password</label>
                  <PasswordField
                    value={password}
                    onChange={(value) => {
                      setPassword(value);
                      setFieldError("password");
                    }}
                    inputClassName={`${errors.password ? "border-rose-500/70" : "border-slate-800"} cursor-none`}
                  />
                  {errors.password && <p className="pl-1 text-xs text-rose-300">{errors.password}</p>}
                  <p className="pl-1 text-[11px] text-slate-500">Use 8+ characters with uppercase, lowercase, number, and symbol.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Confirm Password</label>
                  <PasswordField
                    value={confirmPassword}
                    onChange={(value) => {
                      setConfirmPassword(value);
                      setFieldError("confirmPassword");
                    }}
                    inputClassName={`${errors.confirmPassword ? "border-rose-500/70" : "border-slate-800"} cursor-none`}
                  />
                  {errors.confirmPassword && <p className="pl-1 text-xs text-rose-300">{errors.confirmPassword}</p>}
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black text-lg py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(52,211,153,0.3)] cursor-none">
                  {isSubmitting ? "Sending Registration OTP..." : "Create Zenith ID"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}





