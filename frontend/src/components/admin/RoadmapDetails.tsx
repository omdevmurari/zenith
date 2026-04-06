import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RoadmapDetails({
    selectedRoadmap,
    nodes,
    clickCreateNode,
    clickNode,
    toggleRoadmapStatus,
    reorderNodes
}: any) {

    const [localNodes, setLocalNodes] = useState(nodes);
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [swapMode, setSwapMode] = useState(false);
    const [swappingNodes, setSwappingNodes] = useState<string[]>([]);

    useEffect(() => {
        setLocalNodes(nodes);
    }, [nodes]);


    const swapNodes = (targetNode: any) => {

        if (!selectedNode) return;

        if (selectedNode._id === targetNode._id) {
            setSelectedNode(null);
            setSwapMode(false);
            return;
        }

        // Start floating animation
        setSwappingNodes([selectedNode._id, targetNode._id]);

        const newNodes = [...localNodes];

        const indexA = newNodes.findIndex(
            n => n._id === selectedNode._id
        );

        const indexB = newNodes.findIndex(
            n => n._id === targetNode._id
        );

        // swap
        const temp = newNodes[indexA];
        newNodes[indexA] = newNodes[indexB];
        newNodes[indexB] = temp;

        // Wait for animation, then update
        setTimeout(() => {
            setLocalNodes(newNodes);

            // IMPORTANT: update parent
            if (reorderNodes) {
                reorderNodes(newNodes);
            }

            setSelectedNode(null);
            setSwapMode(false);
            setSwappingNodes([]);
        }, 500);
    };


    return (

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-6 w-full"
        >

            {/* Header */}

            <div className="flex justify-between items-start gap-4">

                <div className="flex-1 min-w-0">

                    <h2 className="text-3xl font-black text-white truncate">
                        {selectedRoadmap.title}
                    </h2>

                    <p className="text-slate-400 text-sm mt-2 line-clamp-2">
                        {selectedRoadmap.description}
                    </p>

                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                        toggleRoadmapStatus(selectedRoadmap._id)
                    }
                    className="px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 rounded-xl text-sm font-bold shrink-0 transition-colors"
                >
                    {selectedRoadmap.isActive
                        ? "Disable Track"
                        : "Enable Track"
                    }
                </motion.button>

            </div>


            {/* Create Node */}

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clickCreateNode}
                className="w-full py-4 border border-dashed border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Deploy New Node
            </motion.button>



            {/* Nodes */}

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trajectory Layout</h3>
                    {swapMode && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => { setSwapMode(false); setSelectedNode(null); }}
                            className="text-xs text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest bg-rose-500/10 px-2 py-1 rounded-md transition-colors"
                        >
                            Cancel
                        </motion.button>
                    )}
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">

                    {localNodes.map((node: any) => {

                        const isSelected =
                            selectedNode?._id === node._id;

                        return (

                            <motion.div

                                key={node._id}

                                layout

                                initial={{ opacity: 0, y: 10 }}
                                animate={{
                                    opacity: 1,
                                    y: swappingNodes.includes(node._id) ? [0, -15, 0] : 0,
                                    scale: swappingNodes.includes(node._id) ? [1, 1.08, 1] : 1,
                                    rotate: swappingNodes.includes(node._id) ? [0, 8, -8, 0] : 0
                                }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                    scale: { duration: 0.5 },
                                    rotate: { duration: 0.5 }
                                }}

                                onClick={() => {

                                    if (swapMode) {
                                        swapNodes(node);
                                    } else {
                                        clickNode(node._id);
                                    }

                                }}

                                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all
                                ${swappingNodes.includes(node._id)
                                        ? "border-cyan-400 bg-cyan-900/50 shadow-[0_0_30px_rgba(34,211,238,0.4)]"
                                        : isSelected
                                            ? "border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/20"
                                            : swapMode
                                                ? "border-slate-700 bg-slate-900/30 hover:border-emerald-500/50 hover:bg-emerald-950/20"
                                                : "border-slate-700 bg-slate-900/40 hover:border-cyan-500/40 hover:bg-slate-800/50"
                                    }
                                `}
                            >

                                {/* Drag Handle */}

                                <motion.div
                                    animate={{
                                        scale: swappingNodes.includes(node._id) ? [1, 1.4, 1] : isSelected ? 1.2 : 1,
                                        color: swappingNodes.includes(node._id)
                                            ? ["#06b6d4", "#22d3ee", "#06b6d4"]
                                            : isSelected ? "#06b6d4" : "#64748b",
                                        rotate: swappingNodes.includes(node._id) ? [0, 360] : 0
                                    }}
                                    transition={{
                                        scale: { duration: 0.5 },
                                        color: { duration: 0.5 },
                                        rotate: { duration: 0.5 }
                                    }}
                                    className="shrink-0"
                                >

                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >

                                        <circle cx="5" cy="6" r="1.5" />
                                        <circle cx="5" cy="12" r="1.5" />
                                        <circle cx="5" cy="18" r="1.5" />

                                        <circle cx="12" cy="6" r="1.5" />
                                        <circle cx="12" cy="12" r="1.5" />
                                        <circle cx="12" cy="18" r="1.5" />

                                    </svg>

                                </motion.div>


                                {/* Content */}

                                <div className="flex justify-between w-full gap-2 items-center">

                                    <div className="flex-1 min-w-0">

                                        <h4 className={`text-sm font-bold truncate transition-colors ${isSelected ? "text-cyan-300" : "text-white"}`}>
                                            {node.title}
                                        </h4>

                                        <p className="text-xs text-slate-500 truncate mt-0.5">
                                            {node.description}
                                        </p>

                                    </div>


                                    <div className="flex items-center gap-2 shrink-0">

                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            className="px-2 py-0.5 text-xs font-bold bg-emerald-500/15 text-emerald-400 rounded-md border border-emerald-500/30"
                                        >
                                            {node.xpValue} XP
                                        </motion.div>


                                        {!swapMode && (

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={(e) => {

                                                    e.stopPropagation();

                                                    setSelectedNode(node);
                                                    setSwapMode(true);

                                                }}

                                                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg border border-cyan-500/20 transition-colors"

                                            >
                                                Move
                                            </motion.button>

                                        )}

                                        {isSelected && (

                                            <motion.span
                                                animate={{ opacity: [1, 0.6, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="text-xs font-bold text-cyan-400 uppercase tracking-widest"
                                            >
                                                Selected
                                            </motion.span>

                                        )}

                                    </div>

                                </div>

                            </motion.div>

                        );

                    })}

                    {localNodes.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 opacity-50"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            <p className="text-sm">No nodes deployed yet</p>
                            <p className="text-xs text-slate-600">Create one to get started</p>
                        </div>
                    )}

                </div>
            </div>


            {/* Floating Swap UI */}

            <AnimatePresence>

                {swapMode && (

                    <motion.div

                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 40 }}

                        className="fixed bottom-10 right-10 bg-slate-900 border border-cyan-500/40 p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 backdrop-blur-sm"

                    >
                        <div className="flex items-center gap-3">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-2 h-2 rounded-full bg-cyan-400"
                            />
                            <div>
                                <div className="text-sm font-bold text-white">
                                    Position Swap Active
                                </div>

                                <div className="text-xs text-slate-400">
                                    Click another node to trade places
                                </div>
                            </div>
                        </div>

                    </motion.div>

                )}

            </AnimatePresence>

        </motion.div>

    );

}