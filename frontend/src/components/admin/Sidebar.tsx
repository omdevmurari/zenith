import { motion } from "framer-motion";

export default function Sidebar({
    roadmaps,
    selectedRoadmapId,
    searchQuery,
    setSearchQuery,
    clickCreateRoadmap,
    clickRoadmap
}: any) {
    return (
        <div className="w-full lg:w-1/3 flex flex-col gap-6 sticky top-8">

            {/* Search */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search nodes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400"
                />
            </div>

            {/* Roadmaps */}
            <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-800">

                <div className="flex justify-between mb-4">
                    <h3 className="text-xs text-slate-400 uppercase">
                        Roadmaps
                    </h3>
                    <span className="text-xs text-cyan-400">
                        {roadmaps.length}
                    </span>
                </div>

                {/* Create Roadmap */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clickCreateRoadmap}
                    className="w-full py-3 mb-3 border border-dashed border-cyan-500 text-cyan-400 rounded-xl"
                >
                    + Create Roadmap
                </motion.button>

                {/* Roadmap List */}
                <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                    {roadmaps.map((roadmap: any) => {
                        const isSelected =
                            selectedRoadmapId === roadmap._id;

                        return (
                            <motion.div
                                key={roadmap._id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => clickRoadmap(roadmap._id)}
                                className={`p-4 rounded-xl border cursor-pointer
                ${isSelected
                                        ? "border-cyan-400 bg-slate-800"
                                        : "border-slate-800 bg-slate-900"
                                    }`}
                            >
                                <div className="font-semibold text-sm">
                                    {roadmap.title}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}