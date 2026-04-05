import { useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";

type RightPaneMode = 'standby' | 'create-roadmap' | 'create-node' | 'edit-node';

export default function AdminBuilder() {
  // Global DB States
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  
  // Explicit Selection & UI States
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [rightPaneMode, setRightPaneMode] = useState<RightPaneMode>('standby');
  
  // Search & Modals
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ type: 'node', id: string } | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Derived States
  const selectedRoadmap = roadmaps.find(r => r._id === selectedRoadmapId) || null;
  const activeNode = nodes.find(n => n._id === activeNodeId) || null;
  const filteredNodes = nodes.filter(n => n.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  // --- HELPER: SHOW TOAST ---
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- HELPER: GET AUTH HEADERS ---
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { "Authorization": `Bearer ${token}` };
  };

  // --- API: FETCH ROADMAPS ON MOUNT ---
  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin-roadmaps", {
          headers: getAuthHeader()
        });
        if (res.ok) {
          const data = await res.json();
          setRoadmaps(data);
        }
      } catch (error) {
        showToast("Database connection failed.", "error");
      }
    };
    fetchRoadmaps();
  }, []);

  // --- API: FETCH NODES WHEN ROADMAP IS SELECTED ---
  useEffect(() => {
    if (!selectedRoadmapId) {
      setNodes([]);
      return;
    }
    const fetchNodes = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/nodes/${selectedRoadmapId}`, {
          headers: getAuthHeader()
        });
        if (res.ok) {
          const data = await res.json();
          // Sort nodes by Mongoose 'order' field
          setNodes(data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
        }
      } catch (error) {
        showToast("Failed to fetch nodes.", "error");
      }
    };
    fetchNodes();
  }, [selectedRoadmapId]);

  // --- UI ACTIONS ---
  const clickCreateRoadmap = () => {
    setSelectedRoadmapId(null);
    setActiveNodeId(null);
    setRightPaneMode('create-roadmap');
  };

  const clickRoadmap = (id: string) => {
    setSelectedRoadmapId(id);
    setActiveNodeId(null);
    setRightPaneMode('standby');
  };

  const clickCreateNode = () => {
    setActiveNodeId(null);
    setRightPaneMode('create-node');
  };

  const clickNode = (id: string) => {
    setActiveNodeId(id);
    setRightPaneMode('edit-node');
  };

  // --- API: DEPLOY ROADMAP ---
  const handleDeployRoadmap = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRoadmap = {
      title: formData.get("title"),
      category: formData.get("category"),
      totalXp: Number(formData.get("totalXp")),
      description: formData.get("description")
    };

    try {
      const res = await fetch("http://localhost:5000/api/admin-roadmaps", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(newRoadmap)
      });
      
      if (res.ok) {
        const savedRoadmap = await res.json();
        setRoadmaps([...roadmaps, savedRoadmap]);
        setSelectedRoadmapId(savedRoadmap._id);
        setRightPaneMode('create-node'); // Auto prompt to create the first node
        showToast("Trajectory deployed successfully!");
      } else {
        showToast("Failed to deploy trajectory.", "error");
      }
    } catch (error) {
      showToast("Server error. Check connection.", "error");
    }
  };

  // --- API: COMMIT NODE ---
  const handleCommitNode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Perfectly matching Mongoose Schema
    const payload = {
      title: formData.get("title"),
      description: formData.get("description"),
      xpValue: Number(formData.get("xpValue")),
      roadmap: selectedRoadmapId,
      order: activeNode ? activeNode.order : nodes.length 
    };

    try {
      const isEditing = rightPaneMode === 'edit-node';
      const url = isEditing ? `http://localhost:5000/api/nodes/${activeNodeId}` : `http://localhost:5000/api/nodes`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedNode = await res.json();
        if (isEditing) {
          setNodes(nodes.map(n => n._id === activeNodeId ? savedNode : n));
        } else {
          setNodes([...nodes, savedNode]);
        }
        setActiveNodeId(null);
        setRightPaneMode('standby');
        showToast(isEditing ? "Node updated successfully!" : "Node deployed successfully!");
      } else {
        showToast("Failed to save node.", "error");
      }
    } catch (error) {
      showToast("Server error. Check connection.", "error");
    }
  };

  // --- API: CONFIRM DELETION ---
  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;

    try {
      if (deleteModal.type === 'node') {
        const res = await fetch(`http://localhost:5000/api/nodes/${deleteModal.id}`, { 
          method: "DELETE",
          headers: getAuthHeader()
        });
        if (res.ok) {
          setNodes(nodes.filter(n => n._id !== deleteModal.id));
          setActiveNodeId(null);
          setRightPaneMode('standby');
          showToast("Node permanently purged.");
        }
      }
    } catch (error) {
      showToast("Server error during deletion.", "error");
    }
    setDeleteModal(null);
  };

  return (
    <section className="min-h-screen w-full bg-[#020617] text-slate-200 p-6 md:p-10 font-sans relative z-20 border-t border-slate-800/60 overflow-hidden">
      
      {/* --- TOAST NOTIFICATION SYSTEM --- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-10 right-10 z-[300] px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] font-bold flex items-center gap-3 backdrop-blur-md border ${
              toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/20 border-rose-500/50 text-rose-400'
            }`}
          >
            {toast.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 cursor-none">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4a2 2 0 0 1 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </div>
              <h3 className="text-xl font-black text-white mb-2">Confirm Deletion</h3>
              <p className="text-slate-400 text-sm mb-8">This action is irreversible. The node will be permanently purged.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteModal(null)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors cursor-none">Cancel</button>
                <button onClick={handleDeleteConfirm} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors cursor-none shadow-[0_0_15px_rgba(244,63,94,0.4)]">Purge</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-900/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 h-full flex flex-col">
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800/60 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              Roadmap Builder
            </h1>
            <p className="text-slate-400 mt-2 font-mono text-xs uppercase tracking-widest">Admin Console // MongoDB Data Editor</p>
          </div>
        </header>

        {/* --- SPLIT PANE EDITOR --- */}
        <div className="flex flex-col lg:flex-row gap-8 items-start relative">

          {/* LEFT PANE */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6 sticky top-8">
            
            {/* Search Bar */}
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                placeholder="Search nodes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-400 transition-colors cursor-none"
              />
            </div>

            {/* Context Selector */}
            <div className="bg-slate-900/30 p-5 rounded-[1.5rem] border border-slate-800/80 backdrop-blur-sm relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Select Context</h3>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-900/30 px-2 py-0.5 rounded border border-cyan-500/20">{roadmaps.length} Total</span>
              </div>
              
              {/* New Explicit Create Roadmap Button */}
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={clickCreateRoadmap}
                className="w-full py-3 mb-3 font-bold rounded-xl text-sm transition-all cursor-none border border-dashed border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-solid flex items-center justify-center gap-2"
              >
                + Initialize Trajectory
              </motion.button>

              <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                {roadmaps.map((roadmap) => {
                  const isSelected = selectedRoadmapId === roadmap._id;
                  
                  return (
                    <motion.div
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      key={roadmap._id}
                      onClick={() => clickRoadmap(roadmap._id)}
                      className={`relative p-4 rounded-xl border transition-all cursor-none overflow-hidden
                      ${isSelected ? "border-cyan-400/50 bg-gradient-to-r from-cyan-950/40 to-slate-900 text-white shadow-[0_0_20px_rgba(34,211,238,0.1)]" : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-800/80 text-slate-400"}`}
                    >
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />}
                      <div className="font-bold text-sm ml-1 truncate">{roadmap.title}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Drag and Drop Node List */}
            <AnimatePresence>
              {selectedRoadmapId && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex-1 overflow-hidden">
                  <h3 className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-bold px-2">Draggable Nodes</h3>
                  
                  {/* New Explicit Create Node Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={clickCreateNode}
                    className="w-full py-3 mb-3 font-bold rounded-xl text-sm transition-all cursor-none border border-dashed border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-solid flex items-center justify-center gap-2"
                  >
                    + Deploy New Node
                  </motion.button>

                  <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar pb-4 pt-1">
                    <Reorder.Group axis="y" values={filteredNodes} onReorder={setNodes} className="space-y-3">
                      {filteredNodes.map((node) => {
                        const isActive = activeNodeId === node._id;
                        return (
                          <Reorder.Item key={node._id} value={node} className="cursor-none touch-none">
                            <motion.div
                              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                              onClick={() => clickNode(node._id)}
                              className={`p-4 rounded-[1.5rem] border transition-all relative overflow-hidden flex gap-3
                                ${isActive ? 'bg-slate-800 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.15)]' : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60'}
                              `}
                            >
                              <div className="flex items-center text-slate-600 hover:text-cyan-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2 relative z-10">
                                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">NODE</span>
                                  <span className="text-slate-600 font-mono text-[9px]">ID:{node._id?.slice(-4)}</span>
                                </div>
                                <h3 className={`font-bold text-sm relative z-10 ${isActive ? 'text-white' : 'text-slate-300'}`}>{node.title}</h3>
                              </div>
                            </motion.div>
                          </Reorder.Item>
                        );
                      })}
                    </Reorder.Group>
                    {filteredNodes.length === 0 && <p className="text-center text-slate-500 text-sm py-4">No nodes exist yet.</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT PANE: EXPLICIT MODE RENDERING */}
          <motion.div layout className="w-full lg:w-2/3 bg-slate-900/50 border border-slate-700/50 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl flex flex-col relative h-fit shadow-2xl">
            <AnimatePresence mode="wait">
              
              {/* 1. STANDBY STATE */}
              {rightPaneMode === 'standby' && (
                <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="m-auto text-center space-y-6 py-24">
                  <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="w-24 h-24 border-2 border-slate-700 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">System Standby</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">Select a Roadmap or Node from the sidebar, or use the creation buttons to initialize new data.</p>
                  </div>
                </motion.div>
              )}
              
              {/* 2. CREATE ROADMAP FORM */}
              {rightPaneMode === 'create-roadmap' && (
                <motion.div key="create-roadmap" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-10 border-b border-slate-700/50 pb-8 relative">
                    <div className="absolute -left-12 top-0 w-2 h-16 bg-cyan-400 rounded-r-lg shadow-[0_0_15px_#22d3ee]" />
                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tight">Initialize Trajectory</h2>
                      <p className="text-slate-400 text-sm mt-2">Define goals and metadata for a new skill track.</p>
                    </div>
                  </div>
                  <form className="space-y-6" onSubmit={handleDeployRoadmap}>
                    <div className="space-y-2 cursor-none">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Trajectory Title</label>
                      <input name="title" required type="text" placeholder="e.g., Full Stack Developer" className="w-full bg-slate-950/30 border border-slate-800 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-cyan-400 focus:bg-slate-900/80 transition-all cursor-none text-xl font-bold" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 cursor-none">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Category</label>
                        <input name="category" required type="text" placeholder="Computer Science" className="w-full bg-slate-950/30 border border-slate-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-400 focus:bg-slate-900/80 transition-all cursor-none" />
                      </div>
                      <div className="space-y-2 cursor-none">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Target XP</label>
                        <input name="totalXp" required type="number" defaultValue={5000} className="w-full bg-slate-950/30 border border-slate-800 rounded-xl px-5 py-4 text-cyan-400 font-mono focus:outline-none focus:border-cyan-400 focus:bg-slate-900/80 transition-all cursor-none font-bold" />
                      </div>
                    </div>
                    <div className="space-y-2 cursor-none">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Description</label>
                      <textarea name="description" required rows={4} placeholder="Provide an overview..." className="w-full bg-slate-950/30 border border-slate-800 rounded-xl p-5 text-slate-300 focus:outline-none focus:border-cyan-400 focus:bg-slate-900/80 transition-all cursor-none resize-none leading-relaxed" />
                    </div>
                    <div className="pt-10 mt-auto flex justify-end gap-4 shrink-0">
                      <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setRightPaneMode('standby')} className="px-6 py-3 text-slate-400 font-bold hover:text-white transition-colors cursor-none">Cancel</motion.button>
                      <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-3 bg-cyan-400 text-slate-950 font-black rounded-xl cursor-none shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]">Deploy Roadmap</motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* 3. CREATE / EDIT NODE FORM */}
              {(rightPaneMode === 'create-node' || rightPaneMode === 'edit-node') && (
                <motion.div key="node" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-10 shrink-0 border-b border-slate-700/50 pb-8 relative">
                    <div className="absolute -left-12 top-0 w-2 h-16 bg-emerald-400 rounded-r-lg shadow-[0_0_15px_#34d399]" />
                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tight">{rightPaneMode === 'create-node' ? "Deploy New Node" : "Edit Trajectory Node"}</h2>
                      <p className="text-slate-400 text-sm mt-2">Configuring milestone for <span className="text-emerald-400 font-medium">{selectedRoadmap?.title}</span></p>
                    </div>
                    {rightPaneMode === 'edit-node' && activeNode && (
                      <motion.button type="button" onClick={() => setDeleteModal({ type: 'node', id: activeNode._id })} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-xs font-bold text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-500 px-4 py-2.5 rounded-lg transition-all cursor-none border border-rose-500/20 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Purge
                      </motion.button>
                    )}
                  </div>

                  <form key={activeNodeId || 'new-node'} className="space-y-8" onSubmit={handleCommitNode}>
                    <div className="space-y-2 cursor-none">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Node Title</label>
                      <input name="title" required type="text" defaultValue={activeNode?.title || ""} placeholder="e.g., Advanced JavaScript Algorithms" className="w-full bg-slate-950/30 border border-slate-800 rounded-2xl px-6 py-5 text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-400 focus:bg-slate-900/80 transition-all cursor-none text-2xl font-bold" />
                    </div>
                    <div className="space-y-2 cursor-none">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Description</label>
                      <textarea name="description" defaultValue={activeNode?.description || ""} placeholder="Detail the specific tasks required..." rows={4} className="w-full bg-slate-950/30 border border-slate-800 rounded-2xl p-6 text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-emerald-400 focus:bg-slate-900/80 transition-all cursor-none resize-none leading-relaxed" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                      <div className="space-y-2 cursor-none">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">XP Value</label>
                        <input name="xpValue" required type="number" defaultValue={activeNode?.xpValue || 50} className="w-full bg-slate-950/30 border border-slate-800 rounded-xl px-5 py-4 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-400 focus:bg-slate-900/80 transition-all cursor-none" />
                      </div>
                    </div>
                    
                    <div className="pt-10 mt-10 flex justify-end gap-4 relative z-0 shrink-0">
                      <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setRightPaneMode('standby')} className="px-6 py-3 text-slate-400 font-bold hover:text-white transition-colors cursor-none">Cancel</motion.button>
                      <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-3 bg-emerald-400 text-slate-950 font-black rounded-xl cursor-none shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)]">Commit Changes</motion.button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </div>
    </section>
  );
}