import Auth from "./Auth";
import { motion, type Variants } from "framer-motion";
import CustomCursor from "./components/CustomCursor";
import Roadmap from "./Roadmap";
import Dashboard from "./Dashboard";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function App() {
  return (
    <>
      <CustomCursor />
      
      {/* Main wrapper covering the entire app */}
      <div className="bg-roadmap-grid relative flex flex-col items-center overflow-clip w-full">
        
        {/* --- 1. HERO SECTION (Forced to 100% Viewport Height) --- */}
        <section className="relative w-full h-screen flex flex-col items-center justify-center">
          
          {/* Background glow centered perfectly in the screen */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" 
          />

          <motion.main 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-4xl text-center space-y-10 relative z-10 w-full px-8 -mt-10" // -mt-10 shifts it slightly up for perfect optical centering
          >
            <motion.div variants={itemVariants} className="space-y-4">
              <p className="text-emerald-400 font-mono tracking-widest uppercase text-sm font-semibold">
                System Online • Milestones Ready
              </p>
              <h1 className="text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 via-cyan-300 to-blue-500 pb-2">
                Chart Your Zenith
              </h1>
            </motion.div>
            
            <motion.p variants={itemVariants} className="text-xl text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
              The ultimate visual roadmap for your skills. Lock in your targets, track your daily progress, and watch your knowledge graph turn green.
            </motion.p>
            
            <motion.div variants={itemVariants} className="pt-8 flex justify-center gap-6">
              <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all rounded-xl font-bold text-lg cursor-none shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:-translate-y-1 relative z-20">
                Initialize Tracker
              </button>
              <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-500 transition-all rounded-xl font-semibold text-lg cursor-none relative z-20">
                View Public Roadmaps
              </button>
            </motion.div>
          </motion.main>

          {/* SCROLL DOWN HINT ANIMATION */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-none"
          >
            <span className="text-emerald-500/70 font-mono text-[10px] tracking-[0.2em] uppercase font-bold">
              Scroll to explore
            </span>
            <div className="w-6 h-10 border-2 border-slate-700 rounded-full flex justify-center p-1 relative">
              <motion.div 
                animate={{ y: [0, 14, 0], opacity: [1, 0, 1] }} 
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="w-1.5 h-1.5 bg-emerald-400 rounded-full" 
              />
            </div>
          </motion.div>

        </section>

        {/* --- 2. ROADMAP SECTION --- */}
        <Roadmap />

        {/* --- 3. DASHBOARD SECTION --- */}
        <Dashboard />

        {/* --- 4. AUTH SECTION --- */}
        <Auth />

      </div>
    </>
  );
}

export default App;