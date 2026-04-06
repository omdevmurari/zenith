import { motion } from "framer-motion";

export default function RoadmapDetails({
    selectedRoadmap,
    nodes,
    clickCreateNode,
    clickNode,
    toggleRoadmapStatus
}: any) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >

            {/* Header */}
            <div className="flex justify-between items-start">

                <div>
                    <h2 className="text-3xl font-black text-white">
                        {selectedRoadmap.title}
                    </h2>

                    <p className="text-slate-400 mt-2">
                        {selectedRoadmap.description}
                    </p>
                </div>
                <button
                    onClick={() =>
                        toggleRoadmapStatus(selectedRoadmap._id)
                    }
                    className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-xl"
                >
                    {selectedRoadmap.isActive
                        ? "Disable"
                        : "Enable"}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">

                <div className="p-4 bg-slate-900 rounded-xl">
                    <div className="text-xs text-slate-400">
                        Nodes
                    </div>
                    <div className="text-xl font-bold text-white">
                        {nodes.length}
                    </div>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl">
                    <div className="text-xs text-slate-400">
                        Total XP
                    </div>
                    <div className="text-xl font-bold text-emerald-400">
                        {selectedRoadmap.totalXp}
                    </div>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl">
                    <div className="text-xs text-slate-400">
                        Registered
                    </div>
                    <div className="text-xl font-bold text-cyan-400">
                        {selectedRoadmap.enrolledCount || 0}
                    </div>
                </div>

            </div>

            {/* Create Node */}
            <button
                onClick={clickCreateNode}
                className="w-full py-4 border border-dashed border-emerald-500 text-emerald-400 rounded-2xl"
            >
                + Create Node
            </button>

            {/* Nodes List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">

                {nodes.map((node: any) => (
                    <div
                        key={node._id}
                        onClick={() => clickNode(node._id)}
                        className="p-4 bg-slate-900 rounded-xl hover:border-cyan-400 border border-slate-800 cursor-pointer"
                    >
                        <div className="flex justify-between">

                            <div>
                                <h4 className="text-white font-semibold">
                                    {node.title}
                                </h4>

                                <p className="text-xs text-slate-400">
                                    {node.description}
                                </p>
                            </div>

                            <div className="text-emerald-400 font-bold">
                                {node.xpValue} XP
                            </div>

                        </div>
                    </div>
                ))}

            </div>

        </motion.div>
    );
}