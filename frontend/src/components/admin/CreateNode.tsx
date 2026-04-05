import { motion } from "framer-motion";

export default function CreateNode({
  rightPaneMode,
  selectedRoadmap,
  activeNode,
  setRightPaneMode,
  setDeleteModal,
  handleCommitNode
}: any) {
  const isEditing = rightPaneMode === "edit-node";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b border-slate-700 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white">
            {isEditing
              ? "Edit Node"
              : "Create Node"}
          </h2>

          <p className="text-slate-400 text-sm mt-2">
            {selectedRoadmap?.title}
          </p>
        </div>

        {/* Delete Button */}
        {isEditing && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              setDeleteModal({
                type: "node",
                id: activeNode._id
              })
            }
            className="px-4 py-2 bg-rose-500/20 text-rose-400 rounded-lg"
          >
            Delete
          </motion.button>
        )}
      </div>

      {/* Form */}
      <form
        onSubmit={handleCommitNode}
        className="space-y-6"
      >
        {/* Title */}
        <div>
          <label className="text-xs text-slate-400 uppercase">
            Node Title
          </label>

          <input
            name="title"
            required
            defaultValue={activeNode?.title || ""}
            type="text"
            placeholder="Learn HTML"
            className="w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-emerald-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-slate-400 uppercase">
            Description
          </label>

          <textarea
            name="description"
            defaultValue={
              activeNode?.description || ""
            }
            rows={4}
            placeholder="Explain learning tasks"
            className="w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-emerald-400"
          />
        </div>

        {/* XP */}
        <div>
          <label className="text-xs text-slate-400 uppercase">
            XP Value
          </label>

          <input
            name="xpValue"
            required
            defaultValue={
              activeNode?.xpValue || 50
            }
            type="number"
            className="w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-emerald-400 focus:outline-none focus:border-emerald-400"
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
            className="px-8 py-3 bg-emerald-400 text-black font-bold rounded-xl"
          >
            {isEditing
              ? "Update Node"
              : "Create Node"}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}