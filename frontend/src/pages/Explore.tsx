import { useState } from "react";
import { motion } from "framer-motion";

// --- MOCK DATA FOR THE GRID ---
// Using realistic computer engineering / student goals
const communityRoadmaps = [
  { id: 1, title: "Algorithm Mastery", category: "Computer Science", author: "Zenith Official", xp: 5000, color: "from-cyan-500 to-blue-600", desc: "A 365-day trajectory to maintain a 'whole green' LeetCode and GitHub graph. Covers dynamic programming, graphs, and daily commits." },
  { id: 2, title: "Physical Conditioning", category: "Health & Fitness", author: "Coach_O", xp: 3200, color: "from-rose-500 to-orange-600", desc: "Structured fat-loss and gym routine. Tracks daily caloric deficit, progressive overload, and recovery metrics." },
  { id: 3, title: "Network Fundamentals", category: "Certification", author: "SysAdmin_Pro", xp: 4500, color: "from-emerald-400 to-teal-600", desc: "CCNAv7 Introduction to Networks preparation. Includes Packet Tracer assessments and subnetting mastery." },
  { id: 4, title: "Acoustic Guitar Basics", category: "Creative", author: "Strings101", xp: 1500, color: "from-amber-400 to-yellow-600", desc: "From holding the pick to your first full song. Tracks daily chord transitions, tab reading, and finger callouses." },
  { id: 5, title: "Indie Game Dev (Story-based)", category: "Development", author: "PixelForge", xp: 6000, color: "from-purple-500 to-indigo-600", desc: "Build a narrative-driven indie game inspired by titles like 'Until Then'. Covers sprite animation, dialogue trees, and basic physics." },
  { id: 6, title: "Modern Literature Dive", category: "Education", author: "Zenith Official", xp: 2000, color: "from-slate-400 to-slate-600", desc: "An exploration of existential literature, heavily featuring the complete works of Franz Kafka. Track reading milestones and thematic analysis." },
];

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { stiffness: 300, damping: 24 } }
};

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoadmaps = communityRoadmaps.filter(rm => 
    rm.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    rm.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="min-h-screen w-full bg-[#020617] text-slate-200 p-6 md:p-12 font-sans relative z-20 overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header & Search */}
        <header className="mb-12">
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Community Nexus
          </motion.h1>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-slate-400 text-lg max-w-2xl mb-8">
            Discover, clone, and deploy established skill trajectories directly to your personal dashboard.
          </motion.p>

          {/* Search Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative max-w-xl cursor-none">
            <input 
              type="text" 
              placeholder="Search 'Algorithms', 'Fitness', 'Guitar'..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl py-4 pl-6 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 backdrop-blur-md transition-all cursor-none"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </motion.div>
        </header>

        {/* Roadmap Grid */}
        <motion.div 
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredRoadmaps.map((roadmap) => (
            <motion.div 
              key={roadmap.id}
              variants={itemVars}
              className="group relative bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 backdrop-blur-sm hover:bg-slate-800/40 transition-all duration-300 flex flex-col h-full cursor-none overflow-hidden"
            >
              {/* Top Accent Gradient Line */}
              <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${roadmap.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
              
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-950/50 px-3 py-1 rounded-full border border-slate-800/60">
                  {roadmap.category}
                </span>
                <span className="text-cyan-400 font-mono text-sm font-bold flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  {roadmap.xp} XP
                </span>
              </div>

              <h2 className="text-2xl font-black text-white mb-3 group-hover:text-cyan-300 transition-colors">
                {roadmap.title}
              </h2>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                {roadmap.desc}
              </p>

              <div className="flex justify-between items-center pt-6 border-t border-slate-800/60 mt-auto">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                    {roadmap.author.charAt(0)}
                  </div>
                  <span className="text-xs text-slate-500">{roadmap.author}</span>
                </div>
                
                <button className="text-sm font-bold text-white bg-white/5 hover:bg-cyan-500 hover:text-slate-950 px-4 py-2 rounded-lg transition-all cursor-none border border-white/10 hover:border-cyan-500 hover:scale-105 shadow-[0_0_15px_rgba(34,211,238,0)] hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                  Clone Trajectory
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredRoadmaps.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <p className="text-xl font-bold">No trajectories found.</p>
            <p className="text-sm">Try adjusting your search parameters.</p>
          </div>
        )}

      </div>
    </section>
  );
}