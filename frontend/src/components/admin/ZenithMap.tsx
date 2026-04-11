import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

const LAYOUT_WIDTH = 1000;
const LAYOUT_HEIGHT = 500;
const FALLBACK_X_START = 150;
const FALLBACK_X_STEP = 180;
const FALLBACK_Y_START = 100;
const FALLBACK_Y_STEP = 120;
const SAFE_PADDING_X = 56;
const SAFE_PADDING_Y = 44;
const NODE_HITBOX = 24;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function ZenithMap({
  nodes,
  onNodeClick,
  heightClass = "h-[500px]"
}: any) {

  const containerRef = useRef<any>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({
    width: LAYOUT_WIDTH,
    height: LAYOUT_HEIGHT
  });

  useEffect(() => {
    const element = containerRef.current;

    if (!element) return;

    const syncSize = () => {
      setContainerSize({
        width: element.clientWidth || LAYOUT_WIDTH,
        height: element.clientHeight || LAYOUT_HEIGHT
      });
    };

    syncSize();

    const resizeObserver = new ResizeObserver(() => {
      syncSize();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const positions = useMemo(() => {
    const rawPositions = (nodes || []).map((node: any, index: number) => {
      const baseX = node.position?.x ?? FALLBACK_X_START + index * FALLBACK_X_STEP;
      const baseY = node.position?.y ?? FALLBACK_Y_START + (index % 3) * FALLBACK_Y_STEP;

      return {
        ...node,
        rawX: (baseX / LAYOUT_WIDTH) * containerSize.width,
        rawY: (baseY / LAYOUT_HEIGHT) * containerSize.height
      };
    });

    if (rawPositions.length === 0) {
      return [];
    }

    const minX = Math.min(...rawPositions.map((node: any) => node.rawX));
    const maxX = Math.max(...rawPositions.map((node: any) => node.rawX));
    const minY = Math.min(...rawPositions.map((node: any) => node.rawY));
    const maxY = Math.max(...rawPositions.map((node: any) => node.rawY));

    const safeMinX = SAFE_PADDING_X + NODE_HITBOX;
    const safeMaxX = containerSize.width - SAFE_PADDING_X - NODE_HITBOX;
    const safeMinY = SAFE_PADDING_Y + NODE_HITBOX;
    const safeMaxY = containerSize.height - SAFE_PADDING_Y - NODE_HITBOX;

    const sourceWidth = Math.max(maxX - minX, 1);
    const sourceHeight = Math.max(maxY - minY, 1);
    const targetWidth = Math.max(safeMaxX - safeMinX, 1);
    const targetHeight = Math.max(safeMaxY - safeMinY, 1);

    return rawPositions.map((node: any) => {
      const normalizedX = safeMinX + (((node.rawX - minX) / sourceWidth) * targetWidth);
      const normalizedY = safeMinY + (((node.rawY - minY) / sourceHeight) * targetHeight);

      return {
        ...node,
        x: clamp(normalizedX, safeMinX, safeMaxX),
        y: clamp(normalizedY, safeMinY, safeMaxY)
      };
    });
  }, [containerSize.height, containerSize.width, nodes]);

  const hoveredNodeIndex = hoveredNode
    ? positions.findIndex((node: any) => node._id === hoveredNode)
    : -1;

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
      className={`relative w-full ${heightClass} overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950`}
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
          const isPreviewPath = hoveredNodeIndex >= 0 && i <= hoveredNodeIndex;

          return (
            <motion.line
              key={i}
              x1={prev?.x}
              y1={prev?.y}
              x2={node.x}
              y2={node.y}
              stroke={isPreviewPath ? "#34d399" : isPathHovered ? '#06b6d4' : '#334155'}
              strokeWidth={isPreviewPath || isPathHovered ? 2.4 : 1.5}
              filter="url(#lineGlow)"
              animate={{
                stroke: isPreviewPath ? "#34d399" : isPathHovered ? '#06b6d4' : '#334155',
                strokeWidth: isPreviewPath || isPathHovered ? 2.4 : 1.5
              }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {positions.map((node: any, index: number) => {
        const isPreviewNode = hoveredNodeIndex >= 0 && index <= hoveredNodeIndex;
        const colors = isPreviewNode
          ? getStatusColor("completed")
          : getStatusColor(node.status);

        return (
          <motion.button
            key={node._id}
            type="button"
            onMouseEnter={() => setHoveredNode(node._id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => {
              if (onNodeClick) {
                onNodeClick(node);
              }
            }}
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
                scale: hoveredNode === node._id ? 1.8 : isPreviewNode ? 1.25 : 1,
                boxShadow: hoveredNode === node._id
                  ? `0 0 40px ${colors.glow}80, 0 0 25px ${colors.glow}40`
                  : isPreviewNode
                    ? `0 0 30px ${colors.glow}70, 0 0 18px ${colors.glow}35`
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
          </motion.button>
        );
      })}

      {/* Node Info Card - appears on hover */}
      <AnimatePresence>
        {hoveredNode && (
          (() => {
            const node = positions.find((n: { _id: string; }) => n._id === hoveredNode);

            if (!node) return null;

            const tooltipWidth = 288;
            const tooltipHeight = 180;
            const placeAbove = node.y > containerSize.height * 0.55;
            const left = clamp(
              node.x - (tooltipWidth / 2),
              16,
              Math.max(16, containerSize.width - tooltipWidth - 16)
            );
            const top = placeAbove
              ? Math.max(16, node.y - tooltipHeight - 28)
              : Math.min(
                containerSize.height - tooltipHeight - 16,
                node.y + 28
              );

            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: placeAbove ? 8 : -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: placeAbove ? 8 : -8 }}
                transition={{ duration: 0.22 }}
                className="absolute z-50 w-72 rounded-2xl border border-slate-700 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-sm"
                style={{
                  left,
                  top
                }}
              >
                {(() => {
                  const colors = getStatusColor(node.status);
                  const statusLabel = node.status?.toUpperCase().replace('_', ' ') || 'UNKNOWN';

                  return (
                <>
                  <div className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold mb-3 ${colors.dot} bg-opacity-20`}>
                    <span className={colors.label}>{statusLabel}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{node.title}</h3>
                  <p className="text-slate-400 text-sm mb-4">{node.description}</p>
                  <div className="flex items-center gap-6 pt-4 border-t border-slate-700">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">XP Value</div>
                      <div className="text-emerald-400 font-bold">{node.xpValue} XP</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Order</div>
                      <div className="text-cyan-400 font-bold">#{positions.indexOf(node) + 1}</div>
                    </div>
                  </div>
                </>
                  );
                })()}
              </motion.div>
            );
          })()
        )}
      </AnimatePresence>

    </div>
  );
}       
