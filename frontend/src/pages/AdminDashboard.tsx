import { motion, type Variants } from "framer-motion";

// --- MOCK DATA ---
const systemStats = [
  { label: "Total Operatives", value: "1,428", trend: "+12% this week", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { label: "Active Trajectories", value: "84", trend: "4 new today", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  { label: "System Health", value: "99.9%", trend: "Server: Botad_01", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
];

const recentActivity = [
  { id: 1, action: "User 'Om_Dev' cloned trajectory", target: "Algorithm Mastery", time: "2 mins ago" },
  { id: 2, action: "Admin updated node", target: "Frontend Architecture", time: "1 hour ago" },
  { id: 3, action: "New operative registered", target: "ID: 1429", time: "3 hours ago" },
  { id: 4, action: "System backup completed", target: "Sector 7G", time: "5 hours ago" },
];

const containerVars: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVars: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AdminDashboard() {
  return (
    <section className="min-h-screen w-full bg-[#020617] text-slate-200 p-6 md:p-12 font-sans relative z-20 overflow-hidden">
      
      {/* Admin Warning Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-slate-800/60 pb-6 gap-6">
          <div>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-4">
              <span className="w-3 h-3 bg-rose-500 rounded-sm animate-pulse shadow-[0_0_10px_#f43f5e]" />
              Root Command
            </motion.h1>
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-slate-400 mt-2 font-mono text-xs uppercase tracking-widest">
              System Overview // Administrator Access Level
            </motion.p>
          </div>
          <div className="flex gap-4 cursor-none">
            <button className="px-6 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors cursor-none">
              Export Logs
            </button>
            <button className="px-6 py-2 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 rounded-lg text-sm font-bold hover:bg-cyan-500/20 transition-colors cursor-none">
              Deploy Roadmap
            </button>
          </div>
        </header>

        <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* STATS ROW (Top) */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {systemStats.map((stat, i) => (
              <motion.div key={i} variants={itemVars} className={`p-8 rounded-3xl border ${stat.border} ${stat.bg} backdrop-blur-md cursor-none transition-transform hover:-translate-y-1`}>
                <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">{stat.label}</h3>
                <div className={`text-5xl font-black ${stat.color} mb-2 tracking-tighter`}>{stat.value}</div>
                <div className="text-slate-500 font-mono text-xs">{stat.trend}</div>
              </motion.div>
            ))}
          </div>

          {/* SERVER LOAD GRAPH (Middle Left) */}
          <motion.div variants={itemVars} className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 backdrop-blur-md cursor-none">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-bold text-white">Network Traffic & Load</h2>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Live</span>
            </div>
            
            {/* CSS-based Bar Chart Simulation */}
            <div className="h-64 flex items-end justify-between gap-2 md:gap-4 border-b border-slate-800 pb-4">
              {Array.from({ length: 14 }).map((_, i) => {
                const height = 20 + Math.random() * 80; // Random height between 20% and 100%
                return (
                  <div key={i} className="w-full relative group">
                    <motion.div 
                      initial={{ height: 0 }} 
                      animate={{ height: `${height}%` }} 
                      transition={{ duration: 1, delay: i * 0.05 }}
                      className="w-full bg-cyan-900/50 rounded-t-sm group-hover:bg-cyan-400 transition-colors relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {Math.floor(height * 10)} reqs
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-slate-500 text-[10px] font-mono mt-4 uppercase tracking-widest">
              <span>- 14 Hours</span>
              <span>Current Server Time</span>
            </div>
          </motion.div>

          {/* RECENT ACTIVITY LOG (Middle Right) */}
          <motion.div variants={itemVars} className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 backdrop-blur-md cursor-none">
            <h2 className="text-lg font-bold text-white mb-8">Activity Stream</h2>
            <div className="space-y-6">
              {recentActivity.map((log) => (
                <div key={log.id} className="relative pl-6 border-l border-slate-800">
                  <div className="absolute w-2 h-2 bg-slate-600 rounded-full -left-[4.5px] top-1.5 ring-4 ring-[#020617]" />
                  <p className="text-sm text-slate-300 font-medium mb-1">{log.action}</p>
                  <p className="text-xs text-cyan-400 font-mono mb-2">{log.target}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{log.time}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-4 border border-slate-800 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-colors">
              View All Logs
            </button>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}