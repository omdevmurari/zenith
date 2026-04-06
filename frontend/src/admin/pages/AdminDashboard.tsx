import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import CustomCursor from "../../components/CustomCursor";

const containerVars: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVars: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AdminDashboard() {

  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5000/api/admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await res.json();

        setDashboardStats(data.stats);
        setRecentActivity(data.activity);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }

    };

    fetchDashboard();

  }, []);

  const systemStats = [
    {
      label: "Total Operatives",
      value: loading ? "..." : dashboardStats?.users || 0,
      trend: "Registered users",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      label: "Active Trajectories",
      value: loading ? "..." : dashboardStats?.roadmaps || 0,
      trend: "Learning paths",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20"
    },
    {
      label: "Total Nodes",
      value: loading ? "..." : dashboardStats?.nodes || 0,
      trend: "Learning modules",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    },
  ];

  return (
    <section className="min-h-screen w-full bg-[#020617] text-slate-200 p-6 md:p-12 font-sans relative z-20 overflow-hidden">

      {/* <CustomCursor /> */}

      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-purple-900/10 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-slate-800/60 pb-6 gap-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-4"
            >
              <span className="w-3 h-3 bg-rose-500 rounded-sm animate-pulse" />
              Root Command
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 mt-2 font-mono text-xs uppercase tracking-widest"
            >
              System Overview // Administrator Access Level
            </motion.p>

          </div>

          <div className="flex gap-4">

            <button
              onClick={() => {

                const token = localStorage.getItem("token");

                window.open(
                  "http://localhost:5000/api/admin/export?token=" + token
                );

              }}
              className="px-6 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-800"
            >
              Export Logs
            </button>

            <button
              onClick={() => window.location.href = "/admin/builder"}
              className="px-6 py-2 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 rounded-lg text-sm font-bold hover:bg-cyan-500/20"
            >
              Deploy Roadmap
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              className="px-4 py-2 bg-slate-800 rounded-lg"
            >
              Logout
            </button>

          </div>

        </header>

        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >

          {/* Stats */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">

            {systemStats.map((stat, i) => (

              <motion.div
                key={i}
                variants={itemVars}
                className={`p-8 rounded-3xl border ${stat.border} ${stat.bg}`}
              >
                <h3 className="text-slate-400 text-sm uppercase mb-4">
                  {stat.label}
                </h3>

                <div className={`text-5xl font-black ${stat.color}`}>
                  {stat.value}
                </div>

                <div className="text-slate-500 text-xs mt-2">
                  {stat.trend}
                </div>

              </motion.div>

            ))}

          </div>

          {/* Recent Roadmaps */}
          <motion.div
            variants={itemVars}
            className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-8"
          >
            <div className="flex justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                Recent Roadmaps
              </h2>

              <button
                onClick={() => window.location.href = "/admin/builder"}
                className="text-xs text-cyan-400"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">

              {recentActivity
                .filter((a: any) => a.action === "Roadmap created")
                .slice(0, 5)
                .map((log: any, i: number) => (

                  <div
                    key={i}
                    className="p-4 bg-slate-800/40 rounded-xl"
                  >
                    <p className="text-white">
                      {log.target}
                    </p>

                    <p className="text-xs text-slate-400">
                      Recently created
                    </p>

                  </div>

                ))}

            </div>
          </motion.div>

          {/* System Intelligence */}
          <motion.div
            variants={itemVars}
            className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8"
          >

            <h2 className="text-lg font-bold text-white mb-6">
              System Intelligence
            </h2>

            <div className="space-y-5">

              {/* Most Active */}
              <div className="p-4 bg-slate-800/40 rounded-xl">
                <p className="text-xs text-slate-400">
                  Most Active Roadmap
                </p>

                <p className="text-white font-semibold">
                  {dashboardStats?.topRoadmap || "No data"}
                </p>
              </div>

              {/* Disabled */}
              <div className="p-4 bg-slate-800/40 rounded-xl">
                <p className="text-xs text-slate-400">
                  Disabled Roadmaps
                </p>

                <p className="text-rose-400 font-semibold">
                  {dashboardStats?.disabledRoadmaps || 0}
                </p>
              </div>

              {/* Empty Roadmaps */}
              <div className="p-4 bg-slate-800/40 rounded-xl">
                <p className="text-xs text-slate-400">
                  Roadmaps Without Nodes
                </p>

                <p className="text-amber-400 font-semibold">
                  {dashboardStats?.emptyRoadmaps || 0}
                </p>
              </div>

              {/* System Status */}
              <div className="p-4 bg-slate-800/40 rounded-xl">
                <p className="text-xs text-slate-400">
                  Platform Status
                </p>

                <p className="text-emerald-400 font-semibold">
                  Operational
                </p>
              </div>

            </div>

          </motion.div>

        </motion.div>

      </div>

    </section>
  );
}