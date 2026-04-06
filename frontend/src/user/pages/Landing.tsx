import { useRef } from "react";
import Auth from "./Auth";
import { motion, type Variants } from "framer-motion";
import Roadmap from "./Roadmap";
import Dashboard from "./Dashboard";
import Explore from "./Explore";

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

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.reload();
};

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const exploreRef = useRef<HTMLDivElement>(null);
  const authRef = useRef<HTMLDivElement>(null);

  const scrollToExplore = () => {
    exploreRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToAuth = () => {
    authRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    /* Main wrapper covering the entire app */
    <div className="bg-roadmap-grid relative flex flex-col items-center overflow-clip w-full">

      {/* HERO */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center">

        {/* Logout Button */}
{isLoggedIn && (
  <button
    onClick={handleLogout}
    className="
    absolute top-6 right-8 z-50
    px-5 py-2
    bg-slate-900
    border border-slate-700
    hover:border-red-400
    hover:text-red-400
    rounded-xl
    transition-all
    text-sm
    font-semibold
    "
  >
    Logout
  </button>
)}

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

            {/* Guest Mode */}
            {!isLoggedIn && (
              <button
                onClick={scrollToExplore}
                className="px-8 py-4 bg-emerald-500 rounded-xl font-bold"
              >
                Try Guest Mode
              </button>
            )}

            {/* Login CTA */}
            {!isLoggedIn && (
              <button
                onClick={scrollToAuth}
                className="px-8 py-4 bg-slate-800 rounded-xl"
              >
                Login / Register
              </button>
            )}

            {/* Continue (Logged In) */}
            {isLoggedIn && (
              <button
                onClick={scrollToExplore}
                className="px-8 py-4 bg-emerald-500 rounded-xl"
              >
                Continue Journey
              </button>
            )}

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
      
      {/* CATALOGUE */}
      <div ref={exploreRef}>
        <Explore isLoggedIn={isLoggedIn} limit={6} />
      </div>

      {/* Logged In Only */}
      {isLoggedIn && (
        <>
          <Roadmap />
          <Dashboard />
        </>
      )}

      {/* Auth */}
      {!isLoggedIn && (
          <Auth />
      )}

    </div>
  );
}

export default App;