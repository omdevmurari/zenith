import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- MOCK CRUD DATA ---
const initialMilestones = [
  { id: 1, title: "Frontend Architecture", desc: "React, Tailwind, and Framer Motion.", status: "published", xp: 500 },
  { id: 2, title: "Backend Systems", desc: "Node.js and Express routing setup.", status: "published", xp: 750 },
  { id: 3, title: "Database Schema", desc: "MySQL integration and indexing.", status: "draft", xp: 1000 },
];

export default function AdminBuilder() {
  const [milestones, _setMilestones] = useState(initialMilestones);
  const [activeId, setActiveId] = useState<number | null>(1);
  const [isEditing, setIsEditing] = useState(false);
  
  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("draft");

  // Get the currently selected milestone
  const activeNode = milestones.find(m => m.id === activeId) || null;

  // Sync the dropdown status when a new node is selected from the list
  useEffect(() => {
    if (activeNode) {
      setCurrentStatus(activeNode.status);
    } else {
      setCurrentStatus("draft");
    }
  }, [activeNode]);

  return (
    <section className="min-h-screen w-full bg-[#020617] text-slate-200 p-6 md:p-10 font-sans relative z-20 border-t border-slate-800/60 overflow-hidden">
      
      {/* Subtle Admin Background Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 h-full flex flex-col">
        
        {/* --- ADMIN HEADER --- */}
        <header className="flex justify-between items-end border-b border-slate-800/60 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
              <span className="w-3 h-3 bg-cyan-400 rounded-sm animate-pulse" />
              Roadmap Builder
            </h1>
            <p className="text-slate-400 mt-2 font-mono text-xs uppercase tracking-widest">Admin Console // AWT Project Track</p>
          </div>
          <button className="px-6 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors cursor-none text-slate-300">
            Exit to Dashboard
          </button>
        </header>

        {/* --- SPLIT PANE EDITOR --- */}
        {/* CHANGED: Removed fixed height, added items-start so panes act independently */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT PANE: READ (List view) */}
          {/* CHANGED: Gave it a fixed height and overflow so it scrolls neatly like a sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-1/3 flex flex-col gap-4 h-[600px] sticky top-8"
          >
            <button 
              onClick={() => { setActiveId(null); setIsEditing(true); setIsDropdownOpen(false); }}
              className="w-full py-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 font-bold rounded-xl border-dashed transition-all hover:border-solid cursor-none shrink-0"
            >
              + Create New Node
            </button>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-10">
              {milestones.map((node) => (
                <div 
                  key={node.id} 
                  onClick={() => { setActiveId(node.id); setIsEditing(false); setIsDropdownOpen(false); }}
                  className={`p-5 rounded-xl border transition-all cursor-none
                    ${activeId === node.id ? 'bg-slate-800/80 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'bg-slate-900/30 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded
                      ${node.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}
                    `}>
                      {node.status}
                    </span>
                    <span className="text-slate-600 font-mono text-xs">ID: {node.id}</span>
                  </div>
                  <h3 className={`font-bold ${activeId === node.id ? 'text-white' : 'text-slate-300'}`}>{node.title}</h3>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT PANE: CREATE / UPDATE / DELETE (Form View) */}
          {/* CHANGED: h-fit ensures the glass background perfectly wraps the form, no bleeding */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-2/3 bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 md:p-10 backdrop-blur-md flex flex-col relative h-fit"
          >
            <AnimatePresence mode="wait">
              {activeId === null && !isEditing ? (
                /* Empty State */
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="m-auto text-center space-y-4 py-20">
                  <div className="w-16 h-16 border-2 border-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-slate-600 text-2xl font-light">+</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-400">No Node Selected</h3>
                  <p className="text-slate-500 text-sm">Select a milestone from the list to edit, or create a new one.</p>
                </motion.div>
              ) : (
                /* The Editor Form */
                <motion.div key="editor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 flex flex-col">
                  
                  {/* Form Header */}
                  <div className="flex justify-between items-center mb-10 shrink-0">
                    <h2 className="text-xl font-bold text-white">
                      {activeId === null ? "Deploy New Node" : "Edit Trajectory Node"}
                    </h2>
                    {activeId !== null && (
                      <button className="text-xs font-bold text-rose-500 hover:text-rose-400 bg-rose-500/10 px-4 py-2 rounded-lg transition-colors cursor-none border border-rose-500/20">
                        Delete Node
                      </button>
                    )}
                  </div>

                  {/* Form Inputs */}
                  <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2 cursor-none">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Node Title</label>
                      <input 
                        type="text" 
                        defaultValue={activeNode?.title || ""}
                        placeholder="e.g., Advanced JavaScript Algorithms"
                        className="w-full bg-transparent border-b-2 border-slate-700 py-3 text-white placeholder:text-slate-700 focus:outline-none focus:border-cyan-400 transition-colors cursor-none text-2xl font-black"
                      />
                    </div>

                    <div className="space-y-2 cursor-none">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Description & Requirements</label>
                      <textarea 
                        defaultValue={activeNode?.desc || ""}
                        placeholder="Detail the specific tasks required to clear this node..."
                        rows={4}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-5 text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-cyan-400 transition-colors cursor-none resize-none mt-2 leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                      <div className="space-y-2 cursor-none">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">XP Value</label>
                        <input 
                          type="number" 
                          defaultValue={activeNode?.xp || 500}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-400 transition-colors cursor-none font-mono"
                        />
                      </div>
                      
                      {/* --- CUSTOM DROPDOWN COMPONENT --- */}
                      {/* CHANGED: Increased z-index to 50 so it sits above the buttons below */}
                      <div className="space-y-2 cursor-none relative z-50">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Status</label>
                        
                        {/* Custom Select Box */}
                        <div 
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className={`w-full bg-slate-950/50 border rounded-xl px-5 py-4 text-white transition-colors cursor-none flex justify-between items-center select-none ${isDropdownOpen ? 'border-cyan-400' : 'border-slate-800 hover:border-slate-700'}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${currentStatus === 'published' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            {currentStatus === "published" ? "Published (Live)" : "Draft (Hidden)"}
                          </span>
                          <motion.svg animate={{ rotate: isDropdownOpen ? 180 : 0 }} className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </motion.svg>
                        </div>

                        {/* Animated Dropdown Menu */}
                        <AnimatePresence>
                          {isDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.15 }}
                              // CHANGED: Positioned exactly below the box and bumped z-index to 100
                              className="absolute top-[calc(100%+8px)] left-0 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] overflow-hidden z-[100] cursor-none"
                            >
                              <div 
                                onClick={() => { setCurrentStatus("draft"); setIsDropdownOpen(false); }}
                                className="px-5 py-4 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-none border-b border-slate-700/50 flex items-center gap-3"
                              >
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                Draft (Hidden)
                              </div>
                              <div 
                                onClick={() => { setCurrentStatus("published"); setIsDropdownOpen(false); }}
                                className="px-5 py-4 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-none flex items-center gap-3"
                              >
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                Published (Live)
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      {/* --- END CUSTOM DROPDOWN --- */}

                    </div>
                  </form>

                  {/* Submit Area */}
                  {/* CHANGED: z-0 prevents it from covering the dropdown menu above it */}
                  <div className="pt-8 border-t border-slate-800 mt-8 flex justify-end gap-4 relative z-0 shrink-0">
                     <button onClick={() => { setActiveId(null); setIsEditing(false); setIsDropdownOpen(false); }} className="px-6 py-3 text-slate-400 font-bold hover:text-white transition-colors cursor-none">
                       Cancel
                     </button>
                     <button className="px-8 py-3 bg-cyan-400 text-slate-950 font-black rounded-xl hover:scale-105 transition-transform cursor-none shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                       {activeId === null ? "Commit New Node" : "Save Changes"}
                     </button>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </div>
    </section>
  );
}