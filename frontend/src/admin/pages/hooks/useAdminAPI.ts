import { useEffect, useState } from "react";

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
                    "http://localhost:5000/api/admin-roadmaps",
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
                    `http://localhost:5000/api/nodes/${selectedRoadmapId}`,
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
                    "http://localhost:5000/api/admin/stats",
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
            totalXp: Number(formData.get("totalXp")),
            description: formData.get("description"),
            isPublished: formData.get("isPublished") === "on"
        };

        try {
            const res = await fetch(
                "http://localhost:5000/api/admin-roadmaps",
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
                `http://localhost:5000/api/admin-roadmaps/${id}/toggle`,
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
            ? `http://localhost:5000/api/nodes/${activeNodeId}`
            : `http://localhost:5000/api/nodes`;

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
                `http://localhost:5000/api/nodes/${deleteModal.id}`,
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

    const updateNodePositions = async (nodes:any[]) => {

  try {

    await fetch(
      "http://localhost:5000/api/nodes/positions",
      {
        method:"PATCH",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(nodes)
      }
    );

  } catch(err) {

    console.log(err);

  }

};

    return {
        handleDeployRoadmap,
        handleCommitNode,
        handleDeleteConfirm,
        toggleRoadmapStatus,
        dashboardStats,
        recentActivity,
        updateNodePositions
    };
}