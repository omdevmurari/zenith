import { useEffect, useState } from "react";
import { apiUrl } from "../../../lib/api";

interface DashboardStats {
    totalOperatives: number;
    activeTrajectories: number;
    systemHealth: string;
    serverInfo: string;
}

interface ActivityLog {
    id: string;
    action: string;
    target: string;
    time: string;
}

export function useAdminAPI(state: any) {
    const {
        roadmaps,
        setRoadmaps,
        nodes,
        setNodes,
        selectedRoadmapId,
        setSelectedRoadmapId,
        activeNodeId,
        rightPaneMode,
        setActiveNodeId,
        setRightPaneMode,
        deleteModal,
        setDeleteModal,
        showToast
    } = state;

    // Dashboard stats state
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);

    // Auth Header
    const getAuthHeader = () => {
        const token = localStorage.getItem("token");
        return {
            Authorization: `Bearer ${token}`
        };
    };

    // Fetch Roadmaps
    useEffect(() => {
        const fetchRoadmaps = async () => {
            try {
                const res = await fetch(
                    apiUrl("/api/admin-roadmaps"),
                    {
                        headers: getAuthHeader()
                    }
                );

                if (res.ok) {
                    const data = await res.json();
                    setRoadmaps(data);
                }
            } catch (error) {
                showToast("Failed to fetch roadmaps", "error");
            }
        };

        fetchRoadmaps();
    }, []);

    // Fetch Nodes
    useEffect(() => {
        if (!selectedRoadmapId) return;

        const fetchNodes = async () => {
            try {
                const res = await fetch(
                    apiUrl(`/api/nodes/${selectedRoadmapId}`),
                    {
                        headers: getAuthHeader()
                    }
                );

                if (res.ok) {
                    const data = await res.json();

                    setNodes(
                        data.sort(
                            (a: any, b: any) =>
                                (a.order || 0) - (b.order || 0)
                        )
                    );
                }
            } catch (error) {
                showToast("Failed to fetch nodes", "error");
            }
        };

        fetchNodes();
    }, [selectedRoadmapId]);

    // Fetch Dashboard Stats
    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const res = await fetch(
                    apiUrl("/api/admin/stats"),
                    {
                        headers: getAuthHeader()
                    }
                );

                if (res.ok) {
                    const data = await res.json();
                    setDashboardStats(data.stats);
                    setRecentActivity(data.recentActivity);
                }
            } catch (error) {
                showToast("Failed to fetch dashboard stats", "error");
            }
        };

        fetchDashboardStats();
    }, []);

    // Create Roadmap
    const handleDeployRoadmap = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const payload = {
            title: formData.get("title"),
            category: formData.get("category"),
            difficulty: formData.get("difficulty"),
            totalXp: Number(formData.get("totalXp")),
            description: formData.get("description"),
            published: formData.get("published") === "on"
        };

        try {
            const res = await fetch(
                apiUrl("/api/admin-roadmaps"),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeader()
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (res.ok) {
                const saved = await res.json();

                setRoadmaps([...roadmaps, saved]);
                setSelectedRoadmapId(saved._id);
                setNodes([]);
                setRightPaneMode("create-node");
                showToast("Roadmap created");
            }
        } catch {
            showToast("Error creating roadmap", "error");
        }
    };

    const toggleRoadmapStatus = async (id: string) => {

        try {

            const res = await fetch(
                apiUrl(`/api/admin-roadmaps/${id}/toggle`),
                {
                    method: "PATCH",
                    headers: {
                        ...getAuthHeader()
                    }
                }
            );

            if (res.ok) {
                const updated = await res.json();

                setRoadmaps(
                    roadmaps.map((r: { _id: string; }) =>
                        r._id === id ? updated : r
                    )
                );

                showToast("Roadmap updated");
            }

        } catch {
            showToast("Failed", "error");
        }

    };

    // Create / Update Node
    const handleCommitNode = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const payload = {
            title: formData.get("title"),
            description: formData.get("description"),
            xpValue: Number(formData.get("xpValue")),
            roadmap: selectedRoadmapId,
            order: nodes.length
        };

        const isEditing = rightPaneMode === "edit-node";

        const url = isEditing
            ? apiUrl(`/api/nodes/${activeNodeId}`)
            : apiUrl("/api/nodes");

        const method = isEditing ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader()
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const saved = await res.json();

                if (isEditing) {
                    setNodes(
                        nodes.map((n: any) =>
                            n._id === activeNodeId ? saved : n
                        )
                    );
                } else {
                    setNodes([...nodes, saved]);
                }

                setRightPaneMode("standby");
                setActiveNodeId(null);

                showToast("Node saved");
            }
        } catch {
            showToast("Error saving node", "error");
        }
    };

    // Delete Node
    const handleDeleteConfirm = async () => {
        if (!deleteModal) return;

        try {
            const res = await fetch(
                apiUrl(`/api/nodes/${deleteModal.id}`),
                {
                    method: "DELETE",
                    headers: getAuthHeader()
                }
            );

            if (res.ok) {
                setNodes(
                    nodes.filter(
                        (n: any) => n._id !== deleteModal.id
                    )
                );

                showToast("Node deleted");
            }
        } catch {
            showToast("Delete failed", "error");
        }

        setDeleteModal(null);
    };

    const updateNodePositions = async (nodes: any[]) => {

        try {

            await fetch(
                apiUrl("/api/nodes/positions"),
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(nodes)
                }
            );

        } catch (err) {

            console.log(err);

        }

    };

    const reorderNodes = async (orderedNodes: any[]) => {
        try {
            const res = await fetch(
                apiUrl("/api/nodes/reorder/batch"),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeader()
                    },
                    body: JSON.stringify({ nodes: orderedNodes })
                }
            );

            if (res.ok) {
                const data = await res.json();
                setNodes(data);
                showToast("Nodes reordered successfully", "success");
            } else {
                showToast("Failed to reorder nodes", "error");
            }
        } catch (err) {
            console.error("Error reordering nodes:", err);
            showToast("Error reordering nodes", "error");
        }
    };

    return {
        handleDeployRoadmap,
        handleCommitNode,
        handleDeleteConfirm,
        toggleRoadmapStatus,
        dashboardStats,
        recentActivity,
        updateNodePositions,
        reorderNodes
    };
}
