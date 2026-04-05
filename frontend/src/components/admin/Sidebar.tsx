import { motion, AnimatePresence, Reorder } from "framer-motion";

export default function Sidebar({
  roadmaps,
  selectedRoadmapId,
  searchQuery,
  setSearchQuery,
  clickCreateRoadmap,
  clickRoadmap,
  clickCreateNode,
  filteredNodes,
  activeNodeId,
  clickNode,
  setNodes
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
        <div className="space-y-2 max-h-[250px] overflow-y-auto">
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
                ${
                  isSelected
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

      {/* Nodes */}
      <AnimatePresence>
        {selectedRoadmapId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <h3 className="text-xs text-slate-400 uppercase mb-2">
              Nodes
            </h3>

            {/* Create Node */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clickCreateNode}
              className="w-full py-3 mb-3 border border-dashed border-emerald-500 text-emerald-400 rounded-xl"
            >
              + Create Node
            </motion.button>

            {/* Node List */}
            <Reorder.Group
              axis="y"
              values={filteredNodes}
              onReorder={setNodes}
              className="space-y-2"
            >
              {filteredNodes.map((node: any) => {
                const isActive =
                  activeNodeId === node._id;

                return (
                  <Reorder.Item
                    key={node._id}
                    value={node}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        clickNode(node._id)
                      }
                      className={`p-4 rounded-xl border cursor-pointer
                      ${
                        isActive
                          ? "border-cyan-400 bg-slate-800"
                          : "border-slate-800 bg-slate-900"
                      }`}
                    >
                      <h4 className="text-sm font-semibold">
                        {node.title}
                      </h4>
                    </motion.div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>

            {filteredNodes.length === 0 && (
              <p className="text-slate-500 text-sm mt-3 text-center">
                No nodes yet
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}