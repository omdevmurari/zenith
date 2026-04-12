import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import PasswordField from "../../components/PasswordField";
import { apiUrl } from "../../lib/api";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$/;

const formatRelativeDate = (value?: string) => {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));

  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getPasswordValidationMessage = (value: string) => {
  if (!value) return "Password is required.";
  if (!PASSWORD_REGEX.test(value)) {
    return "Password must be 8+ chars with uppercase, lowercase, number, and symbol.";
  }

  return "";
};

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [passwordOtpStage, setPasswordOtpStage] = useState<"idle" | "otp_sent">("idle");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/auth";
      return;
    }

    const fetchProfileData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [meRes, statsRes, roadmapRes] = await Promise.all([
          fetch(apiUrl("/api/auth/me"), { headers, cache: "no-store" }),
          fetch(apiUrl("/api/progress/stats"), { headers, cache: "no-store" }),
          fetch(apiUrl("/api/user-roadmaps/my"), { headers, cache: "no-store" }),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setProfile(meData.user || null);
          if (meData.user) {
            localStorage.setItem("user", JSON.stringify(meData.user));
          }
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (roadmapRes.ok) {
          const roadmapData = await roadmapRes.json();
          const sortedRoadmaps = (Array.isArray(roadmapData) ? roadmapData : []).sort(
            (firstRoadmap: any, secondRoadmap: any) =>
              new Date(secondRoadmap.startedAt || secondRoadmap.updatedAt || 0).getTime() -
              new Date(firstRoadmap.startedAt || firstRoadmap.updatedAt || 0).getTime()
          );

          setRoadmaps(sortedRoadmaps);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const completedRoadmaps = useMemo(
    () => roadmaps.filter((roadmap: any) => (roadmap?.progress || 0) >= 100),
    [roadmaps]
  );

  const pendingRoadmaps = useMemo(
    () => roadmaps.filter((roadmap: any) => (roadmap?.progress || 0) < 100),
    [roadmaps]
  );

  const latestRoadmaps = useMemo(() => roadmaps.slice(0, 4), [roadmaps]);

  const handleRequestPasswordOtp = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      const res = await fetch(apiUrl("/api/auth/change-password/request-otp"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data?.message || "Unable to send OTP.");
        return;
      }

      setPasswordOtpStage("otp_sent");
      setPasswordSuccess(data?.message || "OTP sent to your email.");
    } catch (error) {
      console.error(error);
      setPasswordError("Something went wrong while sending OTP.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleVerifyPasswordChange = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return;

    setPasswordError("");
    setPasswordSuccess("");

    if (!/^\d{6}$/.test(otp.trim())) {
      setPasswordError("OTP must be exactly 6 digits.");
      return;
    }

    const passwordValidationMessage = getPasswordValidationMessage(newPassword);
    if (passwordValidationMessage) {
      setPasswordError(passwordValidationMessage);
      return;
    }

    if (!confirmPassword) {
      setPasswordError("Confirm password is required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch(apiUrl("/api/auth/change-password/verify"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: otp.trim(),
          password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data?.message || "Unable to change password.");
        return;
      }

      setPasswordSuccess(data?.message || "Password changed successfully.");
      setPasswordOtpStage("idle");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      setPasswordError("Something went wrong while changing password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-[#020617] px-6 py-12 text-slate-200">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-800 bg-slate-900/40 p-10 text-center text-slate-400">
          Loading profile data...
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#020617] px-6 py-10 text-slate-200 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => window.history.back()}
            className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 font-semibold text-cyan-400"
          >
            Back
          </motion.button>
        </div>

        <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/40 p-8 shadow-xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
              Zenith Profile
            </p>
            <h1 className="mt-3 text-4xl font-black text-white">
              {profile?.name || "Explorer"}
            </h1>
            <p className="mt-2 text-slate-400">{profile?.email || "No email available"}</p>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.24em] text-emerald-200/70">XP</div>
                <div className="mt-2 text-3xl font-black text-emerald-300">{stats?.totalXP ?? profile?.xp ?? 0}</div>
              </div>
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Streak</div>
                <div className="mt-2 text-3xl font-black text-cyan-300">{stats?.streak ?? profile?.streak ?? 0}</div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Finished</div>
                <div className="mt-2 text-3xl font-black text-white">{completedRoadmaps.length}</div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Pending</div>
                <div className="mt-2 text-3xl font-black text-white">{pendingRoadmaps.length}</div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/40 p-6 shadow-xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-400">
              Account Snapshot
            </p>
            <div className="mt-5 space-y-4 text-sm">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Joined</div>
                <div className="mt-2 font-semibold text-white">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Unknown"}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Longest Streak</div>
                <div className="mt-2 font-semibold text-white">{stats?.longestStreak ?? profile?.longestStreak ?? 0} days</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Completed Nodes</div>
                <div className="mt-2 font-semibold text-white">{stats?.completedNodes ?? profile?.completedNodes?.length ?? 0}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/40 p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-400">
                    Active Tracks
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white">Latest Roadmaps</h2>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {latestRoadmaps.length === 0 && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-6 text-slate-400">
                    No roadmap journey started yet.
                  </div>
                )}

                {latestRoadmaps.map((roadmap: any) => (
                  <div
                    key={roadmap?._id || roadmap?.roadmapId?._id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-bold text-white">
                          {roadmap?.roadmapId?.title || "Untitled Roadmap"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Started {formatRelativeDate(roadmap?.startedAt)}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] ${
                          (roadmap?.progress || 0) >= 100
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-cyan-500/15 text-cyan-300"
                        }`}
                      >
                        {(roadmap?.progress || 0) >= 100 ? "Completed" : "In Progress"}
                      </span>
                    </div>

                    <div className="mt-4 h-2 rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${Math.min(roadmap?.progress || 0, 100)}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-slate-400">{Math.min(roadmap?.progress || 0, 100)}% completed</span>
                      <button
                        onClick={() => window.location.href = `/roadmap/${roadmap?.roadmapId?._id}`}
                        className="font-semibold text-emerald-400 hover:text-emerald-300"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/40 p-6 shadow-xl">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-400">
                  Finished Roadmaps
                </p>
                <div className="mt-5 space-y-3">
                  {completedRoadmaps.length === 0 && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4 text-sm text-slate-400">
                      No finished roadmaps yet.
                    </div>
                  )}
                  {completedRoadmaps.map((roadmap: any) => (
                    <div
                      key={roadmap?._id || roadmap?.roadmapId?._id}
                      className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4"
                    >
                      <div className="font-semibold text-white">{roadmap?.roadmapId?.title || "Untitled Roadmap"}</div>
                      <div className="mt-1 text-sm text-emerald-200/80">100% completed</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/40 p-6 shadow-xl">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-400">
                  Pending Roadmaps
                </p>
                <div className="mt-5 space-y-3">
                  {pendingRoadmaps.length === 0 && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4 text-sm text-slate-400">
                      No pending roadmaps right now.
                    </div>
                  )}
                  {pendingRoadmaps.map((roadmap: any) => (
                    <div
                      key={roadmap?._id || roadmap?.roadmapId?._id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4"
                    >
                      <div className="font-semibold text-white">{roadmap?.roadmapId?.title || "Untitled Roadmap"}</div>
                      <div className="mt-1 text-sm text-slate-400">
                        {Math.min(roadmap?.progress || 0, 100)}% completed
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/40 p-6 shadow-xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-rose-300">
              Security
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">Change Password</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Request an OTP on your verified email, then confirm the new password here.
            </p>

            {passwordError && (
              <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {passwordSuccess}
              </div>
            )}

            <button
              onClick={handleRequestPasswordOtp}
              disabled={passwordLoading}
              className="mt-6 w-full rounded-xl bg-white px-5 py-3 text-lg font-black text-slate-950 transition hover:bg-slate-200 disabled:opacity-60"
            >
              {passwordLoading && passwordOtpStage === "idle" ? "Sending OTP..." : "Send Change Password OTP"}
            </button>

            {passwordOtpStage === "otp_sent" && (
              <form className="mt-6 space-y-4" onSubmit={handleVerifyPasswordChange}>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
                    OTP
                  </label>
                  <input
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-4 text-center tracking-[0.35em] text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
                    New Password
                  </label>
                  <PasswordField
                    value={newPassword}
                    onChange={setNewPassword}
                    inputClassName="border-slate-800 bg-slate-950/70"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
                    Confirm Password
                  </label>
                  <PasswordField
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    inputClassName="border-slate-800 bg-slate-950/70"
                  />
                </div>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full rounded-xl bg-emerald-500 px-5 py-3 text-lg font-black text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
                >
                  {passwordLoading ? "Changing Password..." : "Verify OTP And Change Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
