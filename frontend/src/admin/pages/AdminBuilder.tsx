import { motion } from "framer-motion";

import { useAdminState } from "./hooks/useAdminState";
import { useAdminAPI } from "./hooks/useAdminAPI";

import Toast from "../../components/admin/Toast";
import DeleteModal from "../../components/admin/DeleteModal";
import Sidebar from "../../components/admin/Sidebar";
import CreateRoadmap from "../../components/admin/CreateRoadmap";
import CreateNode from "../../components/admin/CreateNode";
import Standby from "../../components/admin/Standby";

export default function AdminBuilder() {

  const state = useAdminState();

  const api = useAdminAPI({
    ...state
  });

  return (
    <section className="min-h-screen w-full bg-[#020617] text-slate-200 p-6 md:p-10 font-sans relative z-20 border-t border-slate-800/60 overflow-hidden">

      {/* Toast */}
      <Toast toast={state.toast} />

      {/* Delete Modal */}
      <DeleteModal
        deleteModal={state.deleteModal}
        setDeleteModal={state.setDeleteModal}
        handleDeleteConfirm={api.handleDeleteConfirm}
      />

      {/* Background Glow */}
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-cyan-900/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-900/5 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <header className="flex justify-between items-center border-b border-slate-800 pb-6 mb-8">
          <h1 className="text-3xl font-black text-white">
            Zenith Admin Builder
          </h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <Sidebar
            {...state}
          />

          {/* Right Pane */}
          <motion.div
            layout
            className="w-full lg:w-2/3 bg-slate-900/50 border border-slate-700 rounded-3xl p-8"
          >

            {state.rightPaneMode === "standby" && (
              <Standby />
            )}

            {state.rightPaneMode === "create-roadmap" && (
              <CreateRoadmap
                handleDeployRoadmap={api.handleDeployRoadmap}
                setRightPaneMode={state.setRightPaneMode}
              />
            )}

            {(state.rightPaneMode === "create-node" ||
              state.rightPaneMode === "edit-node") && (
              <CreateNode
                {...state}
                handleCommitNode={api.handleCommitNode}
              />
            )}

          </motion.div>

        </div>

      </div>

    </section>
  );
}
