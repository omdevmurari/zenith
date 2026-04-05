import { useState, useMemo } from "react";

export type RightPaneMode =
  | "standby"
  | "create-roadmap"
  | "create-node"
  | "edit-node";

export function useAdminState() {
  // Roadmaps + Nodes
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);

  // Selection
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  // UI Mode
  const [rightPaneMode, setRightPaneMode] =
    useState<RightPaneMode>("standby");

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState<any>(null);
  const [toast, setToast] = useState<any>(null);

  // Derived Values
  const selectedRoadmap = useMemo(
    () => roadmaps.find((r) => r._id === selectedRoadmapId) || null,
    [roadmaps, selectedRoadmapId]
  );

  const activeNode = useMemo(
    () => nodes.find((n) => n._id === activeNodeId) || null,
    [nodes, activeNodeId]
  );

  const filteredNodes = useMemo(
    () =>
      nodes.filter((n) =>
        n.title?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [nodes, searchQuery]
  );

  // Toast Helper
  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Click Actions

  const clickCreateRoadmap = () => {
    setSelectedRoadmapId(null);
    setActiveNodeId(null);
    setRightPaneMode("create-roadmap");
  };

  const clickRoadmap = (id: string) => {
    setSelectedRoadmapId(id);
    setActiveNodeId(null);
    setRightPaneMode("standby");
  };

  const clickCreateNode = () => {
    setActiveNodeId(null);
    setRightPaneMode("create-node");
  };

  const clickNode = (id: string) => {
    setActiveNodeId(id);
    setRightPaneMode("edit-node");
  };

  return {
    // Data
    roadmaps,
    setRoadmaps,
    nodes,
    setNodes,

    // Selection
    selectedRoadmapId,
    setSelectedRoadmapId,
    activeNodeId,
    setActiveNodeId,

    // UI
    rightPaneMode,
    setRightPaneMode,
    searchQuery,
    setSearchQuery,
    deleteModal,
    setDeleteModal,
    toast,
    setToast,

    // Derived
    selectedRoadmap,
    activeNode,
    filteredNodes,

    // Actions
    showToast,
    clickCreateRoadmap,
    clickRoadmap,
    clickCreateNode,
    clickNode
  };
}
