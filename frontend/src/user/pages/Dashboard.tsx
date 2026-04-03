import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

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

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<"overview" | "focus">("overview");

  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);

  useEffect(() => {

const fetchData = async () => {

const token = localStorage.getItem("token");

if (!token) return;

try {

const statsRes = await fetch(
"http://localhost:5000/api/progress/stats",
{
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
"http://localhost:5000/api/activity",
{
headers: {
Authorization: `Bearer ${token}`
}
}
);

if (activityRes.ok) {
const activityData = await activityRes.json();
setActivity(activityData || []);
}


// ✅ Fetch user roadmaps
const roadmapRes = await fetch(
"http://localhost:5000/api/user-roadmaps/my",
{
headers: {
Authorization: `Bearer ${token}`
}
}
);

if (roadmapRes.ok) {

const roadmapData = await roadmapRes.json();

setRoadmaps(Array.isArray(roadmapData) ? roadmapData : []);


// ✅ Fetch nodes of FIRST roadmap correctly
if (roadmapData?.length > 0) {

const firstRoadmapId =
roadmapData[0]?.roadmapId?._id;

const nodeRes = await fetch(
`http://localhost:5000/api/nodes/${firstRoadmapId}`,
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

fetchData();

}, []);

  const generateHeatmap = () => {
  const days = [];

  for (let i = 0; i < 119; i++) {
    const day = activity[i];

    let colorClass = "bg-slate-800/50";

    if (day?.nodesCompleted > 3)
      colorClass = "bg-emerald-400 shadow-[0_0_8px_#34d399]";
    else if (day?.nodesCompleted > 1)
      colorClass = "bg-emerald-600";
    else if (day?.nodesCompleted > 0)
      colorClass = "bg-emerald-800";

    days.push(
      <div
        key={i}
        className={`w-3 h-3 md:w-4 md:h-4 rounded-sm ${colorClass} transition-all hover:scale-125 hover:ring-2 ring-white cursor-none`}
      />
    );
  }

  return days;
};

  return (
    <section className="min-h-screen w-full bg-[#020617] text-slate-200 p-6 md:p-12 font-sans relative z-20 border-t border-slate-800/60 overflow-hidden">
      
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
                      <div className="flex justify-between items-center border-l-2 border-emerald-500 pl-4 py-2 bg-slate-800/20 rounded-r-lg hover:bg-slate-800/40 transition-colors cursor-none">
                        <span className="text-slate-300">Completed: Dynamic Exam Seating Logic</span>
                        <span className="text-slate-500 text-xs">2 hrs ago</span>
                      </div>
                      <div className="flex justify-between items-center border-l-2 border-cyan-500 pl-4 py-2 bg-slate-800/20 rounded-r-lg hover:bg-slate-800/40 transition-colors cursor-none">
                        <span className="text-slate-300">Solved: LeetCode #200 (Islands)</span>
                        <span className="text-slate-500 text-xs">5 hrs ago</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Sidebar Roadmaps */}
                <motion.div variants={cardVars} className="bg-slate-900/40 border border-slate-800/80 rounded-[2rem] p-8 backdrop-blur-sm h-fit shadow-xl">
                  <h2 className="text-lg font-bold text-white mb-8">Active Roadmaps</h2>
                  <div className="space-y-8">
                    {roadmaps.length === 0 && (
                      <p className="text-slate-500 text-sm">
                        No active roadmaps yet
                      </p>
                    )}

                    {roadmaps.map((item: any, i) => (

                      <div key={item._id || i} className="group cursor-none">

                        <div className="flex justify-between text-sm mb-3">

                          <span className="text-slate-300 font-bold group-hover:text-white transition-colors">
                            {item?.roadmapId?.title ?? "Untitled Roadmap"}
                          </span>

                          <span className="text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded text-xs">
                            {Math.min(item?.progress || 0, 100)}%
                          </span>

                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{
                              width: `${Math.min(item?.progress || 0, 100)}%`
                            }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-emerald-400 shadow-[0_0_10px_#34d399]"
                          />

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
                      {roadmaps?.[0]?.roadmapId?.title || "Execute Your Roadmap"}
                    </h2>
                    <p className="text-lg text-slate-400 font-light max-w-sm leading-relaxed">
                       Your AWT project database schema is pending. Secure the MySQL connection today.
                    </p>
                    <button className="mt-8 px-8 py-4 bg-white text-black font-black rounded-full hover:scale-105 transition-transform cursor-none shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                      Start Focus Session
                    </button>
                  </motion.div>

                  <motion.div variants={cardVars} className="border-l border-slate-800/80 pl-8 md:pl-16 space-y-12 cursor-none">
                    <div>
                      <span className="text-6xl font-light text-white">{nodes?.length || 0}</span>
                      <span className="text-slate-500 ml-4 uppercase tracking-[0.2em] text-xs font-bold">Milestones Left</span>
                    </div>
                    <div>
                      <span className="text-6xl font-light text-white">{roadmaps?.length || 0}</span>
                      <span className="text-slate-500 ml-4 uppercase tracking-[0.2em] text-xs font-bold">Active Roadmaps</span>
                      <div className="mt-8 space-y-4 text-sm font-medium">
                         <div className="flex justify-between border-b border-slate-800/60 pb-3"><span className="text-slate-300">AWT Project</span> <span className="text-emerald-400">In Progress</span></div>
                         <div className="flex justify-between border-b border-slate-800/60 pb-3"><span className="text-slate-300">LeetCode Streak</span> <span className="text-emerald-400">Maintained</span></div>
                         <div className="flex justify-between pb-3"><span className="text-slate-300">Gym Routine</span> <span className="text-slate-600">Pending</span></div>
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