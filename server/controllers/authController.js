import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

const NAME_REGEX = /^[A-Za-z]+(?:[A-Za-z ]*[A-Za-z])?$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$/;
const OTP_TTL_MS = 10 * 60 * 1000;

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const normalizeName = (name = "") => name.trim().replace(/\s+/g, " ");
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const getUserId = (req) => req.user?.id || req.user?._id;

const getUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  isDisabled: user.isDisabled,
  xp: user.xp,
  streak: user.streak,
  longestStreak: user.longestStreak,
  clonedRoadmaps: user.clonedRoadmaps,
  completedNodes: user.completedNodes,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const getToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const getNameValidationMessage = (value = "") => {
  const trimmed = normalizeName(value);
  if (!trimmed) return "Name is required.";
  if (trimmed.replace(/[^A-Za-z]/g, "").length < 2) {
    return "Name must include at least 2 alphabets.";
  }
  if (!NAME_REGEX.test(trimmed)) {
    return "Name can contain only alphabets and spaces.";
  }
  return "";
};

const getEmailValidationMessage = (value = "") => {
  const trimmed = normalizeEmail(value);
  if (!trimmed) return "Email is required.";
  if (!EMAIL_REGEX.test(trimmed)) {
    return "Enter a valid email address.";
  }
  const domain = trimmed.split("@")[1] || "";
  if (domain.split(".").filter(Boolean).length < 2) {
    return "Email domain must include a valid extension.";
  }
  return "";
};

const getPasswordValidationMessage = (value = "") => {
  if (!value) return "Password is required.";
  if (!PASSWORD_REGEX.test(value)) {
    return "Password must be 8+ characters with uppercase, lowercase, number, and symbol.";
  }
  return "";
};

const clearOtpState = (user) => {
  user.otp = null;
  user.otpPurpose = null;
  user.otpExpires = null;
};

const setOtpState = (user, purpose) => {
  user.otp = generateOtp();
  user.otpPurpose = purpose;
  user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
};

const ensureValidOtp = (user, purpose, otp) => {
  if (
    !user ||
    !otp ||
    user.otpPurpose !== purpose ||
    user.otp !== otp ||
    !user.otpExpires ||
    user.otpExpires.getTime() < Date.now()
  ) {
    return false;
  }
  return true;
};

const sendOtpEmail = async ({ email, name, otp, purpose }) => {
  const purposeCopy = {
    register: {
      subject: "Zenith verification code",
      intro: `Welcome to Zenith, ${name || "Explorer"}.`,
      action: "Use this OTP to verify your new account.",
    },
    login: {
      subject: "Zenith login code",
      intro: `A login attempt was started for ${email}.`,
      action: "Use this OTP to complete sign in.",
    },
    forgot_password: {
      subject: "Zenith password reset code",
      intro: `A password reset was requested for ${email}.`,
      action: "Use this OTP to reset your password.",
    },
    change_password: {
      subject: "Zenith change password code",
      intro: `A password change was requested for ${email}.`,
      action: "Use this OTP to confirm your new password inside Zenith.",
    },
  };

  const template = purposeCopy[purpose];

  await sendEmail({
    email,
    subject: template.subject,
    message: `${template.intro}\n\n${template.action}\n\nOTP: ${otp}\n\nThis code expires in 10 minutes. If this was not you, please ignore this email.`,
  });
};

export const getMe = async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ user: getUserResponse(user) });
  } catch (error) {
    console.error("Get Me Error:", error);
    return res.status(500).json({ message: "Server error while fetching profile." });
  }
};

export const register = async (req, res) => {
  try {
    const name = normalizeName(req.body?.name);
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password || "";

    const nameError = getNameValidationMessage(name);
    const emailError = getEmailValidationMessage(email);
    const passwordError = getPasswordValidationMessage(password);

    if (nameError || emailError || passwordError) {
      return res.status(400).json({ message: nameError || emailError || passwordError });
    }

    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!user) {
      user = new User({ name, email, password: hashedPassword, isVerified: false });
    } else {
      user.name = name;
      user.password = hashedPassword;
      user.isVerified = false;
    }

    setOtpState(user, "register");
    await user.save();

    await sendOtpEmail({ email: user.email, name: user.name, otp: user.otp, purpose: "register" });

    return res.status(200).json({
      message: "OTP sent to your email. Verify to finish registration.",
      email: user.email,
      purpose: "register",
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error during registration." });
  }
};

export const verifyRegisterOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = `${req.body?.otp || ""}`.trim();
    const user = await User.findOne({ email });

    if (!ensureValidOtp(user, "register", otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.isVerified = true;
    clearOtpState(user);
    await user.save();

    return res.status(200).json({
      message: "Registration verified successfully.",
      token: getToken(user),
      user: getUserResponse(user),
    });
  } catch (error) {
    console.error("Verify Register OTP Error:", error);
    return res.status(500).json({ message: "Server error during verification." });
  }
};

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password || "";

    const emailError = getEmailValidationMessage(email);
    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    if (user.isDisabled) {
      return res.status(403).json({ message: "Your account has been disabled." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    setOtpState(user, "login");
    await user.save();

    await sendOtpEmail({ email: user.email, name: user.name, otp: user.otp, purpose: "login" });

    return res.status(200).json({
      message: "Login OTP sent to your email.",
      email: user.email,
      purpose: "login",
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error during login." });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = `${req.body?.otp || ""}`.trim();
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!ensureValidOtp(user, "login", otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    clearOtpState(user);
    await user.save();

    return res.status(200).json({
      message: "Login successful.",
      token: getToken(user),
      user: getUserResponse(user),
    });
  } catch (error) {
    console.error("Verify Login OTP Error:", error);
    return res.status(500).json({ message: "Server error during OTP verification." });
  }
};

export const requestForgotPasswordOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const emailError = getEmailValidationMessage(email);

    if (emailError) {
      return res.status(400).json({ message: emailError });
    }

    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      return res.status(404).json({ message: "Verified account not found for this email." });
    }

    setOtpState(user, "forgot_password");
    await user.save();

    await sendOtpEmail({ email: user.email, name: user.name, otp: user.otp, purpose: "forgot_password" });

    return res.status(200).json({
      message: "Password reset OTP sent to your email.",
      email: user.email,
      purpose: "forgot_password",
    });
  } catch (error) {
    console.error("Forgot Password Request Error:", error);
    return res.status(500).json({ message: "Server error while sending reset OTP." });
  }
};

export const resetPasswordWithOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = `${req.body?.otp || ""}`.trim();
    const password = req.body?.password || "";

    const emailError = getEmailValidationMessage(email);
    const passwordError = getPasswordValidationMessage(password);
    if (emailError || passwordError) {
      return res.status(400).json({ message: emailError || passwordError });
    }

    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      return res.status(404).json({ message: "Verified account not found for this email." });
    }

    if (!ensureValidOtp(user, "forgot_password", otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.password = await bcrypt.hash(password, 10);
    clearOtpState(user);
    await user.save();

    return res.status(200).json({ message: "Password reset successful. You can sign in now." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Server error while resetting password." });
  }
};

export const requestChangePasswordOtp = async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your account first." });
    }

    setOtpState(user, "change_password");
    await user.save();

    await sendOtpEmail({ email: user.email, name: user.name, otp: user.otp, purpose: "change_password" });

    return res.status(200).json({
      message: "Change password OTP sent to your email.",
      email: user.email,
      purpose: "change_password",
    });
  } catch (error) {
    console.error("Change Password Request Error:", error);
    return res.status(500).json({ message: "Server error while sending change password OTP." });
  }
};

export const verifyChangePasswordOtp = async (req, res) => {
  try {
    const userId = getUserId(req);
    const otp = `${req.body?.otp || ""}`.trim();
    const password = req.body?.password || "";
    const passwordError = getPasswordValidationMessage(password);

    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!ensureValidOtp(user, "change_password", otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.password = await bcrypt.hash(password, 10);
    clearOtpState(user);
    await user.save();

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Verify Change Password OTP Error:", error);
    return res.status(500).json({ message: "Server error while changing password." });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const purpose = req.body?.purpose;

    if (!["register", "login", "forgot_password", "change_password"].includes(purpose)) {
      return res.status(400).json({ message: "Invalid OTP purpose." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (purpose === "register" && user.isVerified) {
      return res.status(400).json({ message: "This account is already verified." });
    }

    if (["login", "forgot_password", "change_password"].includes(purpose) && !user.isVerified) {
      return res.status(403).json({ message: "Please verify your account first." });
    }

    setOtpState(user, purpose);
    await user.save();

    await sendOtpEmail({ email: user.email, name: user.name, otp: user.otp, purpose });

    return res.status(200).json({
      message: "A fresh OTP has been sent to your email.",
      email: user.email,
      purpose,
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res.status(500).json({ message: "Server error while resending OTP." });
  }
};
