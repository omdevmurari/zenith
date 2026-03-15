import { motion } from "framer-motion";

// Fully mapped out constellation coordinates (X, Y percentages)
const nodes = [
  { id: 1, x: 20, y: 20, title: "Internet Fundamentals", desc: "DNS, Hosting, and TCP/IP.", status: "completed" },
  { id: 2, x: 50, y: 15, title: "Frontend Core", desc: "HTML5, CSS3, ES6+ JavaScript.", status: "completed" },
  { id: 3, x: 80, y: 30, title: "React & UI", desc: "Hooks, State, and Framer Motion.", status: "in-progress" },
  { id: 4, x: 35, y: 55, title: "Backend & APIs", desc: "Node.js, Express routing.", status: "locked" },
  { id: 5, x: 65, y: 65, title: "Database Architecture", desc: "MongoDB and Relational Data.", status: "locked" },
  { id: 6, x: 50, y: 85, title: "Full-Stack Deployment", desc: "Vercel, AWS, and CI/CD pipelines.", status: "locked" },
];

// Define which nodes connect to which (to draw the constellation lines)
const connections = [
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 2, to: 4 },
  { from: 4, to: 5 },
  { from: 3, to: 5 },
  { from: 5, to: 6 },
];

export default function Roadmap() {
  return (
    <section className="relative w-full h-[800px] bg-[#020617] overflow-hidden flex items-center justify-center border-t border-slate-800/50 mt-20 shadow-[inset_0_100px_100px_rgba(2,6,23,1)]">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="absolute top-12 left-12 z-20">
        <h2 className="text-sm font-bold text-emerald-500 tracking-[0.3em] uppercase mb-2">Sector 7G</h2>
        <h3 className="text-4xl font-light text-slate-200 tracking-widest uppercase">Zenith Mapping</h3>
      </div>

      {/* The Constellation Canvas */}
      <div className="relative w-full max-w-6xl h-full mx-auto">
        
        {/* Draw the SVG Connecting Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {connections.map((conn, i) => {
            const startNode = nodes.find(n => n.id === conn.from)!;
            const endNode = nodes.find(n => n.id === conn.to)!;
            const isCompleted = startNode.status === "completed" && endNode.status === "completed";
            
            return (
              <motion.line 
                key={i}
                x1={`${startNode.x}%`} y1={`${startNode.y}%`} 
                x2={`${endNode.x}%`} y2={`${endNode.y}%`} 
                stroke={isCompleted ? "#34d399" : "#334155"} 
                strokeWidth={isCompleted ? "2" : "1"} 
                strokeDasharray={isCompleted ? "none" : "4,4"}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: i * 0.2 }}
              />
            );
          })}
        </svg>

        {/* Render the Stars (Nodes) */}
        {nodes.map((node, i) => {
          const isCompleted = node.status === "completed";
          const isInProgress = node.status === "in-progress";

          return (
            <motion.div 
              key={node.id}
              className="absolute group cursor-none z-10"
              style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 + 0.5, type: "spring" }}
            >
              {/* The Star */}
              <div className="relative flex items-center justify-center w-12 h-12 -ml-6 -mt-6">
                <div className={`w-4 h-4 rounded-full transition-all duration-300 group-hover:scale-150
                  ${isCompleted ? 'bg-emerald-400 shadow-[0_0_20px_#34d399]' : ''}
                  ${isInProgress ? 'bg-cyan-400 shadow-[0_0_30px_#22d3ee] animate-pulse' : ''}
                  ${node.status === 'locked' ? 'bg-slate-700 border-2 border-slate-600' : ''}
                `} />
              </div>

              {/* The Hover Tooltip (Glassmorphism) */}
              <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-64 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none
                bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl shadow-2xl
              `}>
                <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 block
                  ${isCompleted ? 'text-emerald-400' : isInProgress ? 'text-cyan-400' : 'text-slate-500'}
                `}>
                  {node.status.replace('-', ' ')}
                </span>
                <h4 className="text-white font-bold text-lg leading-tight mb-2">{node.title}</h4>
                <p className="text-slate-400 text-sm">{node.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}