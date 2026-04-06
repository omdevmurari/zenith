import { motion } from "framer-motion";

export default function CreateRoadmap({
    handleDeployRoadmap,
    setRightPaneMode
}: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
        >
            <div className="mb-8 border-b border-slate-700 pb-6">
                <h2 className="text-3xl font-black text-white">
                    Create Roadmap
                </h2>

                <p className="text-slate-400 text-sm mt-2">
                    Define a new learning trajectory
                </p>
            </div>

            <form
                className="space-y-6"
                onSubmit={handleDeployRoadmap}
            >
                {/* Title */}
                <div className="space-y-2">
                    <label className="text-xs text-slate-400 uppercase">
                        Roadmap Title
                    </label>

                    <input
                        name="title"
                        required
                        type="text"
                        placeholder="Full Stack Developer"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-400"
                    />
                </div>

                {/* Category */}
                <div className="space-y-2">
                    <label className="text-xs text-slate-400 uppercase">
                        Category
                    </label>

                    <input
                        name="category"
                        required
                        type="text"
                        placeholder="Programming"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-400"
                    />
                </div>

                {/* XP */}
                <div className="space-y-2">
                    <label className="text-xs text-slate-400 uppercase">
                        Total XP
                    </label>
                    <input
                        name="totalXp"
                        required
                        type="number"
                        defaultValue={5000}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-400"
                    />
                </div>
                {/* Description */}
                <div className="space-y-2">
                    <label className="text-xs text-slate-400 uppercase">
                        Description
                    </label>
                    <textarea
                        name="description"
                        required
                        rows={4}
                        placeholder="Explain roadmap..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-400"
                    />
                </div>

                {/* Publish Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl">
                    <div>
                        <h4 className="text-white font-semibold">
                            Publish Roadmap
                        </h4>
                        <p className="text-xs text-slate-400">
                            Make visible to users
                        </p>
                    </div>
                    <input
                        type="checkbox"
                        name="isPublished"
                        className="w-5 h-5"
                    />
                </div>
                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-6">
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                            setRightPaneMode("standby")
                        }
                        className="px-6 py-3 text-slate-400"
                    >
                        Cancel
                    </motion.button>

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 bg-cyan-400 text-black font-bold rounded-xl"
                    >
                        Create Roadmap
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
}