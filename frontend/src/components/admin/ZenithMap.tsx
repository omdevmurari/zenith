import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function ZenithMap({
  nodes
}: any) {

  const containerRef = useRef<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    if (!nodes) return;

    const generated = nodes.map((node: any, index: number) => ({
      ...node,
      x: node.position?.x ?? 150 + index * 180,
      y: node.position?.y ?? 100 + (index % 3) * 120
    }));

    setPositions(generated);
  }, [nodes]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { dot: 'bg-emerald-400', glow: '#10b981', label: 'text-emerald-300' };
      case 'in progress':
      case 'in_progress':
        return { dot: 'bg-cyan-400', glow: '#06b6d4', label: 'text-cyan-300' };
      case 'locked':
        return { dot: 'bg-slate-400', glow: '#64748b', label: 'text-slate-300' };
      default:
        return { dot: 'bg-purple-400', glow: '#a855f7', label: 'text-purple-300' };
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[500px] overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
    >

      {/* Subtle Grid Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Connection Lines */}
      <svg className="absolute w-full h-full pointer-events-none z-0">
        <defs>
          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {positions.map((node: any, i: number) => {
          if (i === 0) return null;

          const prev = positions[i - 1];
          const isPathHovered = hoveredNode === node._id || hoveredNode === prev._id;

          return (
            <motion.line
              key={i}
              x1={prev?.x}
              y1={prev?.y}
              x2={node.x}
              y2={node.y}
              stroke={isPathHovered ? '#06b6d4' : '#334155'}
              strokeWidth={isPathHovered ? 2 : 1.5}
              filter="url(#lineGlow)"
              animate={{
                stroke: isPathHovered ? '#06b6d4' : '#334155',
                strokeWidth: isPathHovered ? 2 : 1.5
              }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {positions.map((node: any) => {
        const colors = getStatusColor(node.status);

        return (
          <motion.div
            key={node._id}
            onMouseEnter={() => setHoveredNode(node._id)}
            onMouseLeave={() => setHoveredNode(null)}
            className="absolute z-10 flex flex-col items-center"
            style={{
              left: node.x,
              top: node.y,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            {/* Node Dot */}
            <motion.div
              animate={{
                scale: hoveredNode === node._id ? 1.8 : 1,
                boxShadow: hoveredNode === node._id
                  ? `0 0 40px ${colors.glow}80, 0 0 25px ${colors.glow}40`
                  : `0 0 20px ${colors.glow}40, 0 0 10px ${colors.glow}20`
              }}
              transition={{ duration: 0.3 }}
              className={`w-3 h-3 rounded-full ${colors.dot} shadow-lg`}
            />

            {/* Node Label */}
            <AnimatePresence>
              {hoveredNode === node._id && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: -30 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute whitespace-nowrap text-xs font-bold ${colors.label} bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700`}
                >
                  {node.title}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

    </div>
  );
}