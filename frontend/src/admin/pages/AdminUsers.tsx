import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { apiUrl } from "../../lib/api";

const formatDate = (value?: string) => {
  if (!value) return "Never";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [roleActionId, setRoleActionId] = useState<string | null>(null);
  const [disableActionId, setDisableActionId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(apiUrl("/api/admin/users"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Failed to fetch users.");
        return;
      }

      setUsers(data.users || []);
      setCurrentRole(data.currentRole || "");
    } catch (fetchError) {
      console.error(fetchError);
      setError("Something went wrong while fetching users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePromote = async (userId: string) => {
    try {
      setPromotingId(userId);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(
        apiUrl(`/api/admin/users/${userId}/make-admin`),
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Failed to update role.");
        return;
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId ? { ...user, role: "admin" } : user
        )
      );
    } catch (promoteError) {
      console.error(promoteError);
      setError("Something went wrong while updating role.");
    } finally {
      setPromotingId(null);
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    try {
      setRoleActionId(userId);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(
        apiUrl(`/api/admin/users/${userId}/remove-admin`),
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Failed to remove admin.");
        return;
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId ? { ...user, role: "student" } : user
        )
      );
    } catch (actionError) {
      console.error(actionError);
      setError("Something went wrong while removing admin.");
    } finally {
      setRoleActionId(null);
    }
  };

  const handleToggleDisable = async (userId: string) => {
    try {
      setDisableActionId(userId);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(
        apiUrl(`/api/admin/users/${userId}/toggle-disable`),
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Failed to update account state.");
        return;
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId
            ? { ...user, isDisabled: !user.isDisabled }
            : user
        )
      );
    } catch (actionError) {
      console.error(actionError);
      setError("Something went wrong while updating account state.");
    } finally {
      setDisableActionId(null);
    }
  };

  const stats = useMemo(
    () => ({
      total: users.length,
      students: users.filter((user) => user.role === "student").length,
      admins: users.filter((user) => user.role === "admin").length,
      disabled: users.filter((user) => user.isDisabled).length,
      verified: users.filter((user) => user.isVerified).length,
    }),
    [users]
  );

  return (
    <section className="min-h-screen w-full bg-[#020617] text-slate-200 p-6 md:p-12 font-sans relative z-20 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      <div className="absolute top-0 left-1/3 w-[550px] h-[360px] bg-cyan-900/10 rounded-full blur-[140px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-slate-800/60 pb-6 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              User Command
            </h1>
            <p className="text-slate-400 mt-2 font-mono text-xs uppercase tracking-widest">
              {currentRole === "owner"
                ? "Owner View // Full user visibility with role control"
                : "Admin View // Students only"}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = "/admin"}
              className="px-5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-800"
            >
              Back To Dashboard
            </button>
            <button
              onClick={fetchUsers}
              className="px-5 py-2 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 rounded-lg text-sm font-bold hover:bg-cyan-500/20"
            >
              Refresh List
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-emerald-300/70">Visible Users</div>
            <div className="mt-3 text-4xl font-black text-emerald-300">{stats.total}</div>
          </div>
          <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">Students</div>
            <div className="mt-3 text-4xl font-black text-cyan-300">{stats.students}</div>
          </div>
          <div className="rounded-3xl border border-purple-500/20 bg-purple-500/10 p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-purple-300/70">Admins In View</div>
            <div className="mt-3 text-4xl font-black text-purple-300">{stats.admins}</div>
          </div>
          <div className="rounded-3xl border border-slate-700 bg-slate-900/40 p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Disabled</div>
            <div className="mt-3 text-4xl font-black text-white">{stats.disabled}</div>
          </div>
          <div className="rounded-3xl border border-slate-700 bg-slate-900/40 p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Verified</div>
            <div className="mt-3 text-4xl font-black text-white">{stats.verified}</div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-rose-200">
            {error}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-slate-800 bg-slate-900/40 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-950/60">
                <tr className="text-left text-xs uppercase tracking-[0.22em] text-slate-500">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">XP</th>
                  <th className="px-6 py-4">Streak</th>
                  <th className="px-6 py-4">Longest</th>
                  <th className="px-6 py-4">Completed</th>
                  <th className="px-6 py-4">Started</th>
                  <th className="px-6 py-4">Verified</th>
                  <th className="px-6 py-4">Disabled</th>
                  <th className="px-6 py-4">Last Active</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={12} className="px-6 py-10 text-center text-slate-400">
                      Loading users...
                    </td>
                  </tr>
                )}

                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={12} className="px-6 py-10 text-center text-slate-500">
                      No users available in this view.
                    </td>
                  </tr>
                )}

                {!loading &&
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-t border-slate-800/70 text-sm text-slate-300"
                    >
                      <td className="px-6 py-4 font-semibold text-white">{user.name || "Unnamed User"}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                            user.role === "owner"
                              ? "bg-amber-500/15 text-amber-300"
                              : user.role === "admin"
                                ? "bg-cyan-500/15 text-cyan-300"
                                : "bg-emerald-500/15 text-emerald-300"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">{user.xp || 0}</td>
                      <td className="px-6 py-4">{user.streak || 0}</td>
                      <td className="px-6 py-4">{user.longestStreak || 0}</td>
                      <td className="px-6 py-4">{user.completedNodes?.length || 0}</td>
                      <td className="px-6 py-4">{user.clonedRoadmaps?.length || 0}</td>
                      <td className="px-6 py-4">{user.isVerified ? "Yes" : "No"}</td>
                      <td className="px-6 py-4">{user.isDisabled ? "Yes" : "No"}</td>
                      <td className="px-6 py-4">{user.lastActive || "Never"}</td>
                      <td className="px-6 py-4">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4">
                        {(currentRole === "owner" || currentRole === "admin") && user.role === "student" ? (
                          <div className="flex flex-col gap-2">
                            {currentRole === "owner" && (
                              <button
                                onClick={() => handlePromote(user._id)}
                                disabled={promotingId === user._id}
                                className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-60"
                              >
                                {promotingId === user._id ? "Promoting..." : "Make Admin"}
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleDisable(user._id)}
                              disabled={disableActionId === user._id}
                              className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 disabled:opacity-60"
                            >
                              {disableActionId === user._id
                                ? "Updating..."
                                : user.isDisabled
                                  ? "Enable Student"
                                  : "Disable Student"}
                            </button>
                          </div>
                        ) : currentRole === "owner" && user.role === "admin" ? (
                          <button
                            onClick={() => handleRemoveAdmin(user._id)}
                            disabled={roleActionId === user._id}
                            className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 disabled:opacity-60"
                          >
                            {roleActionId === user._id ? "Updating..." : "Remove Admin"}
                          </button>
                        ) : (
                          <span className="text-slate-600">No action</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
