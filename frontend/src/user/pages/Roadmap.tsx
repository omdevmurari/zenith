import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ZenithMap from "../../components/admin/ZenithMap";
import { apiUrl } from "../../lib/api";

interface RoadmapProps {
  isLoggedIn?: boolean;
}

export default function Roadmap({ isLoggedIn }: RoadmapProps) {
  const [loading, setLoading] = useState(true);
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [completedNodeIds, setCompletedNodeIds] = useState<string[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!isLoggedIn || !token) {
      setLoading(false);
      setActiveRoadmap(null);
      setNodes([]);
      setCompletedNodeIds([]);
      return;
    }

    const fetchSnapshot = async () => {
      try {
        const roadmapRes = await fetch(
          apiUrl("/api/user-roadmaps/my"),
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!roadmapRes.ok) {
          setLoading(false);
          return;
        }

        const roadmapData = await roadmapRes.json();
        const sortedRoadmaps = (Array.isArray(roadmapData) ? roadmapData : [])
          .sort(
            (firstRoadmap: any, secondRoadmap: any) =>
              new Date(secondRoadmap.startedAt || secondRoadmap.updatedAt || 0).getTime() -
              new Date(firstRoadmap.startedAt || firstRoadmap.updatedAt || 0).getTime()
          );

        const latestRoadmap = sortedRoadmaps[0];

        if (!latestRoadmap?.roadmapId?._id) {
          setLoading(false);
          return;
        }

        setActiveRoadmap(latestRoadmap);

        const [nodeRes, progressRes] = await Promise.all([
          fetch(
            apiUrl(`/api/nodes/${latestRoadmap.roadmapId._id}`),
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          ),
          fetch(
            apiUrl("/api/progress"),
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )
        ]);

        const nodeData = nodeRes.ok ? await nodeRes.json() : [];
        const orderedNodes = (Array.isArray(nodeData) ? nodeData : [])
          .sort((firstNode: any, secondNode: any) => (firstNode.order || 0) - (secondNode.order || 0));

        setNodes(orderedNodes);
        setSelectedNodeId(orderedNodes[0]?._id || null);

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          const roadmapNodeIds = new Set(
            orderedNodes.map((node: any) => node._id?.toString())
          );

          const completedIds = (progressData.completedNodes || [])
            .map((node: any) => typeof node === "string" ? node : node._id)
            .filter((nodeId: string) => roadmapNodeIds.has(nodeId?.toString()));

          setCompletedNodeIds(completedIds);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshot();
  }, [isLoggedIn]);

  const nextUnlockedNodeId = useMemo(
    () => nodes.find((node: any) => !completedNodeIds.includes(node._id))?._id || null,
    [completedNodeIds, nodes]
  );

  const roadmapNodes = useMemo(
    () => nodes.map((node: any) => ({
      ...node,
      status: completedNodeIds.includes(node._id)
        ? "completed"
        : node._id === nextUnlockedNodeId
          ? "in_progress"
          : "locked"
    })),
    [completedNodeIds, nextUnlockedNodeId, nodes]
  );

  const selectedNode =
    roadmapNodes.find((node: any) => node._id === selectedNodeId) ||
    roadmapNodes[0] ||
    null;

  const completedCount = roadmapNodes.filter((node: any) => node.status === "completed").length;
  const pendingCount = roadmapNodes.length - completedCount;

  return (
    <section className="relative w-full min-h-[820px] bg-[#020617] overflow-hidden border-t border-slate-800/50 mt-20 shadow-[inset_0_100px_100px_rgba(2,6,23,1)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.08),_transparent_30%)] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:px-12">
        <div className="mb-10">
          <h2 className="mb-2 text-sm font-bold text-emerald-500 tracking-[0.3em] uppercase">
            Sector 7G
          </h2>
          <h3 className="text-4xl font-light text-slate-200 tracking-widest uppercase">
            Zenith Mapping
          </h3>
          <p className="mt-4 max-w-2xl text-slate-400">
            Live constellation view of your latest active roadmap, with completed and pending milestones.
          </p>
        </div>

        {!isLoggedIn && (
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/40 p-10 text-center">
            <p className="text-lg font-semibold text-white">
              Login to unlock your live Zenith map
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Your latest roadmap constellation, completion state, and next pending node will appear here.
            </p>
          </div>
        )}

        {isLoggedIn && loading && (
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/40 p-10 text-center text-slate-400">
            Loading active roadmap snapshot...
          </div>
        )}

        {isLoggedIn && !loading && !activeRoadmap && (
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/40 p-10 text-center">
            <p className="text-lg font-semibold text-white">
              No active roadmap yet
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Start a roadmap from Explore and your live constellation will appear here.
            </p>
          </div>
        )}

        {isLoggedIn && !loading && activeRoadmap && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/35 p-4 md:p-5">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-400">
                    Last Active Roadmap
                  </p>
                  <h4 className="mt-2 text-2xl font-black text-white">
                    {activeRoadmap.roadmapId?.title || "Untitled Roadmap"}
                  </h4>
                  <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-400">
                    {activeRoadmap.roadmapId?.description || "No roadmap description available."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.24em] text-emerald-300/70">
                      Completed
                    </div>
                    <div className="mt-1 text-2xl font-black text-emerald-300">
                      {completedCount}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Pending
                    </div>
                    <div className="mt-1 text-2xl font-black text-slate-200">
                      {pendingCount}
                    </div>
                  </div>
                </div>
              </div>

              <ZenithMap
                nodes={roadmapNodes}
                onNodeClick={(node: any) => setSelectedNodeId(node._id)}
                heightClass="h-[280px] md:h-[320px]"
              />
            </div>

            <div className="space-y-5">
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/35 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-400">
                  Snapshot
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-emerald-400 transition-all"
                    style={{ width: `${Math.min(activeRoadmap.progress || 0, 100)}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  {Math.min(activeRoadmap.progress || 0, 100)}% completed
                </p>
              </div>

              {selectedNode && (
                <div className="rounded-[2rem] border border-slate-800 bg-slate-900/35 p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-400">
                    Selected Node
                  </p>
                  <h5 className="mt-3 text-2xl font-black text-white">
                    {selectedNode.title}
                  </h5>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {selectedNode.description || "No node description available."}
                  </p>

                  <div className="mt-5 grid gap-3">
                    <div className="rounded-xl bg-slate-950/70 p-4">
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Status
                      </div>
                      <div className="mt-1 font-bold text-white">
                        {selectedNode.status.replace("_", " ")}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-950/70 p-4">
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Reward
                      </div>
                      <div className="mt-1 font-bold text-emerald-300">
                        {selectedNode.xpValue || 0} XP
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/35 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-400">
                  Node Ledger
                </p>

                <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1">
                  {roadmapNodes.map((node: any) => (
                    <motion.button
                      key={node._id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedNodeId(node._id)}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-left"
                    >
                      <div>
                        <div className="font-semibold text-white">
                          {node.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          #{(node.order || 0) + 1}
                        </div>
                      </div>

                      <div
                        className={`text-xs font-bold uppercase tracking-[0.22em] ${node.status === "completed"
                          ? "text-emerald-300"
                          : node.status === "in_progress"
                            ? "text-cyan-300"
                            : "text-slate-500"
                          }`}
                      >
                        {node.status.replace("_", " ")}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
