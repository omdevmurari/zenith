import { motion } from "framer-motion";

export default function Standby() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="m-auto text-center space-y-6 py-24"
    >
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut"
        }}
        className="w-24 h-24 border-2 border-slate-700 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-slate-500"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      </motion.div>

      <div>
        <h3 className="text-2xl font-bold text-white">
          System Standby
        </h3>

        <p className="text-slate-400 text-sm mt-2">
          Select a roadmap or create a new one
        </p>
      </div>
    </motion.div>
  );
}