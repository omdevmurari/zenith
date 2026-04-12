import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ZenithMap from "../../components/admin/ZenithMap";
import { motion } from "framer-motion";
import { apiUrl } from "../../lib/api";

export default function RoadmapView() {

    const { id } = useParams();

    const [nodes, setNodes] = useState<any[]>([]);
    const [started, setStarted] = useState(false);
    const [completed, setCompleted] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    useEffect(() => {

        const fetchData = async () => {

            const token = localStorage.getItem("token");

            try {

                // Fetch Nodes
                const nodeRes = await fetch(
                    apiUrl(`/api/nodes/${id}`),
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const nodeData = await nodeRes.json();
                const orderedNodes = (Array.isArray(nodeData) ? nodeData : [])
                    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

                setNodes(orderedNodes);
                setSelectedNodeId(orderedNodes[0]?._id || null);
                const currentRoadmapNodeIds = new Set(
                    orderedNodes.map((node: any) =>
                        node._id?.toString()
                    )
                );


                // Check Started
                const roadmapRes = await fetch(
                    apiUrl("/api/user-roadmaps/my"),
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const roadmapData = await roadmapRes.json();

                const alreadyStarted = roadmapData?.some((r: any) => {

                    const roadmapId =
                        typeof r.roadmapId === "object"
                            ? r.roadmapId._id
                            : r.roadmapId;

                    return roadmapId?.toString() === id?.toString();

                });

                setStarted(alreadyStarted || false);


                // Fetch Progress
                const progressRes = await fetch(
                    apiUrl("/api/progress"),
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (progressRes.ok) {
                    const progressData = await progressRes.json();

                    // progressData has completedNodes array containing node IDs
                    const completedNodeIds = progressData.completedNodes
                        ? progressData.completedNodes.map((node: any) =>
                            typeof node === "string" ? node : node._id
                        )
                        : [];

                    setCompleted(
                        completedNodeIds.filter((nodeId: string) =>
                            currentRoadmapNodeIds.has(nodeId?.toString())
                        )
                    );
                }

            } catch (error) {
                console.error(error);
            }

            setLoading(false);

        };

        fetchData();

    }, [id]);

    const nextUnlockedNodeId = useMemo(
        () => (
            started
                ? nodes.find((node: any) => !completed.includes(node._id))?._id || null
                : null
        ),
        [completed, nodes, started]
    );

    const roadmapNodes = useMemo(
        () => nodes.map((node: any) => ({
            ...node,
            status: completed.includes(node._id)
                ? "completed"
                : started && node._id === nextUnlockedNodeId
                    ? "in_progress"
                    : "locked"
        })),
        [completed, nextUnlockedNodeId, nodes, started]
    );

    const selectedNode =
        roadmapNodes.find((node: any) => node._id === selectedNodeId) ||
        roadmapNodes[0] ||
        null;


    // Start roadmap
    const startRoadmap = async () => {

        try {

            const token = localStorage.getItem("token");

            await fetch(
                apiUrl("/api/user-roadmaps/start"),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        roadmapId: id
                    })
                }
            );

            setStarted(true);

        } catch (error) {
            console.error(error);
        }

    };


    // Complete Node
    const completeNode = async (nodeId: string) => {

        if (!started) return;

        if (completed.includes(nodeId)) return;

        if (nodeId !== nextUnlockedNodeId) return;

        const token = localStorage.getItem("token");

        try {
            const res = await fetch(
                apiUrl(`/api/progress/complete/${nodeId}`),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (res.ok) {
                setCompleted(prev => [...prev, nodeId]);
            } else {
                const errorData = await res.json().catch(() => null);
                console.error("Failed to complete node:", errorData?.message || res.statusText);
            }

        } catch (error) {
            console.error("Error completing node:", error);
        }

    };


    const progress =
        Math.min(
            100,
            Math.round((completed.length / (nodes.length || 1)) * 100)
        );


    if (loading) {
        return (
            <div className="p-8 text-slate-400">
                Loading roadmap...
            </div>
        );
    }


    return (

        <div className="p-8 max-w-6xl mx-auto">

            {/* Header */}

            <div className="flex justify-between items-center mb-8">

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.history.back()}
                    className="px-6 py-2 bg-cyan-500/10 border border-cyan-500/30 
text-cyan-400 rounded-xl font-semibold"
                >
                    ← Go Back
                </motion.button>

                {!started && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startRoadmap}
                        className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/30 
text-emerald-400 rounded-xl font-semibold"
                    >
                        Start Roadmap
                    </motion.button>
                )}

            </div>


            {/* Title */}

            <h1 className="text-3xl font-bold text-white mb-2">
                Roadmap Journey
            </h1>

            <p className="text-slate-400 mb-8">
                Navigate the constellation one unlocked star at a time.
            </p>


            {/* Progress Bar */}

            <div className="mb-8">

                <div className="flex justify-between text-sm mb-2 text-slate-400">
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-400 transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>

            </div>


            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">

            <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/35 p-4 md:p-5">

                <ZenithMap
                    nodes={roadmapNodes}
                    onNodeClick={(node: any) => {
                        setSelectedNodeId(node._id);

                        if (node.status !== "locked") {
                            completeNode(node._id);
                        }
                    }}
                    heightClass="h-[320px] md:h-[380px]"
                />

            </div>


            <div className="space-y-5">
                <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/35 p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-400">
                        Snapshot
                    </p>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                            className="h-full bg-emerald-400 transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                            <div className="text-xs uppercase tracking-[0.24em] text-emerald-300/70">
                                Completed
                            </div>
                            <div className="mt-1 text-2xl font-black text-emerald-300">
                                {completed.length}
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3">
                            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                                Pending
                            </div>
                            <div className="mt-1 text-2xl font-black text-slate-200">
                                {Math.max(nodes.length - completed.length, 0)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/35 p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-400">
                        Node Ledger
                    </p>

                    <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">

                {roadmapNodes.map((node: any) => {

                    const isCompleted = node.status === "completed";
                    const isLocked = node.status === "locked";
                    const isActive = node.status === "in_progress";

                    return (

                        <motion.div
                            key={node._id}
                            whileHover={{ scale: !isLocked ? 1.01 : 1 }}
                            onClick={() => {
                                setSelectedNodeId(node._id);
                                completeNode(node._id);
                            }}
                            className={`p-4 rounded-xl border cursor-pointer transition-all

${isCompleted
                                    ? "bg-emerald-900/20 border-emerald-500/30"
                                    : isActive
                                        ? "bg-cyan-950/30 border-cyan-500/40 hover:border-cyan-400"
                                    : isLocked
                                        ? "bg-slate-900/40 border-slate-800 opacity-60 cursor-not-allowed"
                                        : "bg-slate-900/40 border-slate-800"
                                }
`}
                        >

                            <div className="flex justify-between items-center">

                                <div>

                                    <h3 className="text-white font-semibold">
                                        {node.title}
                                    </h3>

                                    <p className="text-sm text-slate-400">
                                        {node.description}
                                    </p>

                                </div>

                                <div className="flex items-center gap-3">

                                    <div className="text-xs px-2 py-1 bg-emerald-500/20 
text-emerald-400 rounded-md">
                                        {node.xpValue} XP
                                    </div>

                                    {isActive && (
                                        <div className="text-cyan-300 text-sm font-bold">
                                            Unlocked
                                        </div>
                                    )}

                                    {isLocked && (
                                        <div className="text-slate-500 text-sm font-bold">
                                            Locked
                                        </div>
                                    )}

                                    {isCompleted && (
                                        <div className="text-emerald-400 text-sm font-bold">
                                            ✓ Completed
                                        </div>
                                    )}

                                </div>

                            </div>

                        </motion.div>

                    );

                })}

                    </div>
                </div>

                {selectedNode && (
                    <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/35 p-6">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-400">
                            Selected Node
                        </p>

                        <h3 className="mt-3 text-2xl font-black text-white">
                            {selectedNode.title}
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-slate-400">
                            {selectedNode.description || "No description added yet."}
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
            </div>
            </div>

        </div>

    );

}
