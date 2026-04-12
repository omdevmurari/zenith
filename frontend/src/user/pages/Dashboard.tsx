import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { apiUrl } from "../../lib/api";

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const aggregateActivityByDate = (items: any[]) => {
  const byDate = new Map<string, { date: string; nodesCompleted: number; xpEarned: number; createdAt?: string }>();

  for (const item of items) {
    if (!item?.date) continue;

    const existing = byDate.get(item.date);

    if (existing) {
      existing.nodesCompleted += item.nodesCompleted || 0;
      existing.xpEarned += item.xpEarned || 0;
      existing.createdAt = item.createdAt || existing.createdAt;
      continue;
    }

    byDate.set(item.date, {
      date: item.date,
      nodesCompleted: item.nodesCompleted || 0,
      xpEarned: item.xpEarned || 0,
      createdAt: item.createdAt
    });
  }

  return byDate;
};

const getMondayBasedDayIndex = (date: Date) => {
  return (date.getDay() + 6) % 7;
};

const formatRelativeTime = (value?: string) => {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

// --- ANIMATION VARIANTS ---
// This handles the stagger effect (delaying each child element slightly)
const containerVars: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } }
};

// This handles the actual pop-in movement of the cards
const cardVars: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

export default function Dashboard({ showBack = true }: any) {
  const [viewMode, setViewMode] = useState<"overview" | "focus">("overview");

  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [completedNodeIds, setCompletedNodeIds] = useState<string[]>([]);

  const sortRoadmapsByRecent = (items: any[]) =>
    [...items].sort(
      (a: any, b: any) =>
        new Date(
          b?.startedAt ||
          b?.updatedAt ||
          b?.createdAt ||
          b?.roadmapId?.updatedAt ||
          0
        ).getTime() -
        new Date(
          a?.startedAt ||
          a?.updatedAt ||
          a?.createdAt ||
          a?.roadmapId?.updatedAt ||
          0
        ).getTime()
    );

  const fetchData = async () => {

    const token = localStorage.getItem("token");

    if (!token) return;

    try {

      const statsRes = await fetch(
        apiUrl("/api/progress/stats"),
        {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }


      const activityRes = await fetch(
        apiUrl("/api/activity"),
        {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setActivity(activityData || []);
      }

      const progressRes = await fetch(
        apiUrl("/api/progress"),
        {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (progressRes.ok) {
        const progressData = await progressRes.json();
        const completedIds = Array.isArray(progressData?.completedNodes)
          ? progressData.completedNodes.map((node: any) =>
            typeof node === "string" ? node : node?._id
          ).filter(Boolean)
          : [];

        setCompletedNodeIds(completedIds);
      }


      // ✅ Fetch user roadmaps
      const roadmapRes = await fetch(
        apiUrl("/api/user-roadmaps/my"),
        {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (roadmapRes.ok) {

        const roadmapData = await roadmapRes.json();
        const sortedRoadmaps = sortRoadmapsByRecent(
          Array.isArray(roadmapData) ? roadmapData : []
        );

        setRoadmaps(sortedRoadmaps);


        // ✅ Fetch nodes of FIRST roadmap correctly
        if (sortedRoadmaps.length > 0) {

          const firstRoadmapId =
            sortedRoadmaps[0]?.roadmapId?._id;

          const nodeRes = await fetch(
            apiUrl(`/api/nodes/${firstRoadmapId}`),
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (nodeRes.ok) {
            const nodeData = await nodeRes.json();
            setNodes(nodeData || []);
          }

        }

      }

    } catch (error) {
      console.error(error);
    }

  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 1500);

    // Refetch when page becomes visible (user returns from another tab/page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };

  }, []);

  const generateHeatmap = () => {
    const activityByDate = aggregateActivityByDate(activity);
    const days = [];
    const today = new Date();
    const startDate = new Date(today.getFullYear(), 0, 1);
    const alignedStartDate = new Date(startDate);
    alignedStartDate.setDate(
      startDate.getDate() - getMondayBasedDayIndex(startDate)
    );
    const totalDays =
      Math.floor(
        (
          new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          ).getTime() - startDate.getTime()
        ) / (1000 * 60 * 60 * 24)
      ) + 1;

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateKey = formatDateKey(currentDate);
      const day = activityByDate.get(dateKey);

      let colorClass = "bg-slate-800/50";

      if (day?.nodesCompleted > 3)
        colorClass = "bg-emerald-400 shadow-[0_0_8px_#34d399]";
      else if (day?.nodesCompleted > 1)
        colorClass = "bg-emerald-600";
      else if (day?.nodesCompleted > 0)
        colorClass = "bg-emerald-800";

      days.push(
        <div
          key={dateKey}
          title={`${dateKey}: ${day?.nodesCompleted || 0} nodes completed`}
          className={`w-3 h-3 md:w-4 md:h-4 rounded-sm ${colorClass} transition-all hover:scale-125 hover:ring-2 ring-white cursor-none`}
        />
      );
    }

    const leadingEmptyDays = [];

    for (let i = 0; i < getMondayBasedDayIndex(startDate); i++) {
      const fillerDate = new Date(alignedStartDate);
      fillerDate.setDate(alignedStartDate.getDate() + i);

      leadingEmptyDays.push(
        <div
          key={`empty-${formatDateKey(fillerDate)}`}
          className="w-3 h-3 md:w-4 md:h-4 rounded-sm opacity-0"
          aria-hidden="true"
        />
      );
    }

    return [...leadingEmptyDays, ...days];
  };

  const latestLogs = [...activity]
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt || b.date).getTime() -
        new Date(a.createdAt || a.date).getTime()
    )
    .slice(0, 5);

  const latestStartedRoadmap = roadmaps[0] || null;
  const orderedNodes = [...nodes].sort(
    (a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0)
  );
  const completedNodesInLatestRoadmap = orderedNodes.filter((node: any) =>
    completedNodeIds.includes(node?._id)
  );
  const remainingNodesCount = Math.max(
    orderedNodes.length - completedNodesInLatestRoadmap.length,
    0
  );
  const nextFocusNode =
    orderedNodes.find((node: any) => !completedNodeIds.includes(node?._id)) ||
    null;
  const latestThreeRoadmaps = roadmaps.slice(0, 3);
  const getRoadmapStatus = (progress: number) => {
    if (progress >= 100) return { label: "Completed", tone: "text-emerald-400" };
    if (progress > 0) return { label: "In Progress", tone: "text-cyan-400" };
    return { label: "Not Started", tone: "text-slate-500" };
  };

  return (
    <section className="min-h-screen w-full bg-[#020617] text-slate-200 p-6 md:p-12 font-sans relative z-20 border-t border-slate-800/60 overflow-hidden">

      <div className="mb-6">

        {showBack && (
          <div className="mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-cyan-500/10 border border-cyan-500/30 
text-cyan-400 rounded-xl font-semibold"
            >
              ← Go Back
            </motion.button>
          </div>
        )}

      </div>

      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[150px] pointer-events-none transition-colors duration-1000 ${viewMode === 'focus' ? 'bg-emerald-900/10' : 'bg-cyan-900/5'}`} />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* HEADER: Now animates when scrolled into view */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 border-b border-slate-800/60 pb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Welcome back.</h1>
            <p className="text-slate-400 mt-2 font-mono text-sm">System Status: Optimal • 4 Active Trackers</p>
          </div>

          <div className="flex bg-slate-900/80 p-1.5 rounded-full border border-slate-700/50 backdrop-blur-md relative cursor-none">
            <button
              onClick={() => setViewMode("overview")}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors cursor-none ${viewMode === "overview" ? "text-slate-950" : "text-slate-400 hover:text-white"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode("focus")}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors cursor-none ${viewMode === "focus" ? "text-slate-950" : "text-slate-400 hover:text-white"}`}
            >
              Focus Mode
            </button>
            <motion.div
              className="absolute top-1.5 bottom-1.5 w-[110px] bg-emerald-400 rounded-full z-0 shadow-[0_0_15px_rgba(52,211,153,0.4)]"
              animate={{ left: viewMode === "overview" ? "6px" : "110px", width: viewMode === "overview" ? "105px" : "120px" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>
        </motion.header>

        {/* Continue Learning Hero */}
        {latestStartedRoadmap && (

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 bg-slate-900/40 border border-slate-800/80 rounded-[2rem] p-8 backdrop-blur-sm shadow-xl"

          >

            <div className="flex justify-between items-center">

              <div>

                <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold">
                  Continue Learning
                </p>

                <h2 className="text-2xl font-bold text-white mt-2">
                  {latestStartedRoadmap?.roadmapId?.title || "Your Journey"}
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  {Math.min(latestStartedRoadmap?.progress || 0, 100)}% Completed
                </p>

              </div>

              <button
                onClick={() =>
                  window.location.href =
                  `/roadmap/${latestStartedRoadmap?.roadmapId?._id}`
                }
                className="px-6 py-3 bg-emerald-500 text-black rounded-xl font-semibold hover:scale-105 transition"

              >

                Continue → </button>

            </div>

            <div className="w-full h-2 bg-slate-800 rounded-full mt-6">

              <motion.div
                initial={{ width: 0 }}
                whileInView={{
                  width: `${Math.min(latestStartedRoadmap?.progress || 0, 100)}%`
                }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="h-full bg-emerald-400"
              />

            </div>

          </motion.div>

        )}


        <div className="relative min-h-[600px]">
          <AnimatePresence mode="wait">

            {/* OVERVIEW MODE */}
            {viewMode === "overview" && (
              <motion.div
                key="overview"
                variants={containerVars}
                initial="hidden"
                whileInView="show" // <--- Triggered by scrolling
                exit="exit"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                <div className="lg:col-span-2 space-y-8">
                  {/* Heatmap Card */}
                  <motion.div variants={cardVars} className="bg-slate-900/40 border border-slate-800/80 rounded-[2rem] p-8 backdrop-blur-sm shadow-xl overflow-x-auto">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-lg font-bold text-white flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                        Consistency Heatmap
                      </h2>
                      <div className="text-right">
                        <span className="text-2xl font-black text-emerald-400 tracking-tighter">{stats?.streak || 0}</span>
                        <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Current Streak</span>
                      </div>
                    </div>

                    <div className="flex gap-3 pb-2 w-max">
                      <div className="grid grid-rows-7 gap-1.5 md:gap-2 text-[10px] text-slate-500 font-mono pr-2 uppercase tracking-widest text-right">
                        <div className="h-3 md:h-4 flex items-center justify-end">MON</div>
                        <div className="h-3 md:h-4 flex items-center justify-end">TUE</div>
                        <div className="h-3 md:h-4 flex items-center justify-end">WED</div>
                        <div className="h-3 md:h-4 flex items-center justify-end">THU</div>
                        <div className="h-3 md:h-4 flex items-center justify-end">FRI</div>
                        <div className="h-3 md:h-4 flex items-center justify-end">SAT</div>
                        <div className="h-3 md:h-4 flex items-center justify-end">SUN</div>
                      </div>
                      <div className="grid grid-rows-7 grid-flow-col gap-1.5 md:gap-2">
                        {generateHeatmap()}
                      </div>
                    </div>
                  </motion.div>

                  {/* Logs Card */}
                  <motion.div variants={cardVars} className="bg-slate-900/40 border border-slate-800/80 rounded-[2rem] p-8 backdrop-blur-sm shadow-xl">
                    <h2 className="text-lg font-bold text-white mb-6">Latest Logs</h2>
                    <div className="space-y-4 font-mono text-sm">
                      {latestLogs.length === 0 && (
                        <div className="border border-slate-800/80 rounded-xl px-4 py-3 text-slate-500">
                          No activity yet. Complete a node to start your log.
                        </div>
                      )}

                      {latestLogs.map((log: any) => {
                        const isHighActivity = (log.nodesCompleted || 0) > 1;
                        const borderClass = isHighActivity
                          ? "border-emerald-500"
                          : "border-cyan-500";

                        return (
                          <div
                            key={log._id}
                            className={`flex justify-between items-center border-l-2 ${borderClass} pl-4 py-2 bg-slate-800/20 rounded-r-lg hover:bg-slate-800/40 transition-colors cursor-none`}
                          >
                            <span className="text-slate-300">
                              Completed {log.nodesCompleted || 0} node{log.nodesCompleted === 1 ? "" : "s"} and earned {log.xpEarned || 0} XP
                            </span>
                            <span className="text-slate-500 text-xs">
                              {formatRelativeTime(log.createdAt || log.date)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>

                {/* Sidebar Roadmaps */}
                <motion.div variants={cardVars} className="bg-slate-900/40 border border-slate-800/80 rounded-[2rem] p-8 backdrop-blur-sm h-fit shadow-xl">
                  <h2 className="text-lg font-bold text-white mb-8">Active Roadmaps</h2>
                  <div className="space-y-6">

                    {roadmaps.length === 0 && (
                      <p className="text-slate-500 text-sm">
                        No active roadmaps yet
                      </p>
                    )}

                    {roadmaps.map((item: any, i) => (

                      <div
                        key={item._id || i}
                        className="group p-4 rounded-xl bg-slate-800/30 border border-slate-800 hover:border-emerald-500/30 transition-all"
                      >

                        <div className="flex justify-between items-center mb-3">

                          <div>
                            <span className="text-slate-200 font-semibold block">
                              {item?.roadmapId?.title ?? "Untitled Roadmap"}
                            </span>

                            <span className="text-xs text-slate-500">
                              Continue your journey
                            </span>

                          </div>

                          <button
                            onClick={() => window.location.href = `/roadmap/${item?.roadmapId?._id}`}
                            className="text-xs px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition"
                          >
                            Continue →
                          </button>

                        </div>

                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">

                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{
                              width: `${Math.min(item?.progress || 0, 100)}%`
                            }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="h-full bg-emerald-400"
                          />

                        </div>

                        <div className="text-xs text-slate-500 mt-2">
                          {Math.min(item?.progress || 0, 100)}% completed
                        </div>

                      </div>

                    ))}

                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* FOCUS MODE */}
            {viewMode === "focus" && (
              <motion.div
                key="focus"
                variants={containerVars}
                initial="hidden"
                animate="show" // Note: Since this mounts via toggle, 'animate' is fine here
                exit="exit"
                className="w-full bg-slate-900/30 border border-slate-800/80 rounded-[3rem] p-12 md:p-20 shadow-2xl backdrop-blur-sm flex flex-col justify-center min-h-[500px]"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                  <motion.div variants={cardVars} className="space-y-6 cursor-none">
                    <p className="text-emerald-500 font-bold uppercase tracking-[0.3em] text-sm flex items-center gap-3">
                      <span className="w-8 h-[1px] bg-emerald-500 block" /> Today's Directive
                    </p>
                    <h2 className="text-6xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter">
                      {latestStartedRoadmap?.roadmapId?.title || "Execute Your Roadmap"}
                    </h2>
                    <p className="text-lg text-slate-400 font-light max-w-sm leading-relaxed">
                      {nextFocusNode
                        ? `Next up: ${nextFocusNode.title}. ${remainingNodesCount} milestone${remainingNodesCount === 1 ? "" : "s"} still remain in this roadmap.`
                        : latestStartedRoadmap
                          ? "This roadmap is completed. You can revisit it or jump into another active roadmap."
                          : "Start a roadmap to unlock a focused next step here."}
                    </p>
                    <button
                      onClick={() => {
                        if (latestStartedRoadmap?.roadmapId?._id) {
                          window.location.href = `/roadmap/${latestStartedRoadmap.roadmapId._id}`;
                        }
                      }}
                      className="mt-8 px-8 py-4 bg-white text-black font-black rounded-full hover:scale-105 transition-transform cursor-none shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                      Start Focus Session
                    </button>
                  </motion.div>

                  <motion.div variants={cardVars} className="border-l border-slate-800/80 pl-8 md:pl-16 space-y-12 cursor-none">
                    <div>
                      <span className="text-6xl font-light text-white">{remainingNodesCount}</span>
                      <span className="text-slate-500 ml-4 uppercase tracking-[0.2em] text-xs font-bold">Milestones Left</span>
                    </div>
                    <div>
                      <span className="text-6xl font-light text-white">{roadmaps?.length || 0}</span>
                      <span className="text-slate-500 ml-4 uppercase tracking-[0.2em] text-xs font-bold">Active Roadmaps</span>
                      <div className="mt-8 space-y-4 text-sm font-medium">
                        {latestThreeRoadmaps.length === 0 && (
                          <div className="flex justify-between pb-3">
                            <span className="text-slate-500">No active roadmaps yet</span>
                            <span className="text-slate-600">Pending</span>
                          </div>
                        )}

                        {latestThreeRoadmaps.map((item: any) => {
                          const status = getRoadmapStatus(
                            Math.min(item?.progress || 0, 100)
                          );

                          return (
                            <div
                              key={item?._id || item?.roadmapId?._id}
                              className="flex justify-between border-b border-slate-800/60 pb-3 last:border-b-0"
                            >
                              <span className="text-slate-300">
                                {item?.roadmapId?.title || "Untitled Roadmap"}
                              </span>
                              <span className={status.tone}>{status.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
