import { motion, AnimatePresence } from "framer-motion";

export default function Toast({ toast }: any) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className={`fixed bottom-10 right-10 z-[300] px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] font-bold flex items-center gap-3 backdrop-blur-md border ${
            toast.type === "success"
              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
              : "bg-rose-500/20 border-rose-500/50 text-rose-400"
          }`}
        >
          {toast.type === "success" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )}

          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}