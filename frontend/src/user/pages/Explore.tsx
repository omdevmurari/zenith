import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { stiffness: 300, damping: 24 } }
};

export default function Explore({
  isLoggedIn,
  limit
}: {
  isLoggedIn: boolean;
  limit?: number;
}) {

  const [searchQuery, setSearchQuery] = useState("");
  const [communityRoadmaps, setCommunityRoadmaps] = useState<any[]>([]);

  // Fetch Roadmaps
  useEffect(() => {

    const fetchRoadmaps = async () => {
      try {

        const res = await fetch(
          "http://localhost:5000/api/roadmaps"
        );

        const data = await res.json();

        setCommunityRoadmaps(data);

      } catch (error) {
        console.error(error);
      }
    };

    fetchRoadmaps();

  }, []);


  const filteredRoadmaps = (communityRoadmaps || [])
    .filter((rm: any) =>
      rm.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rm.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, limit || communityRoadmaps.length);


  const handleStart = async (roadmap: { _id: any; }) => {

    if (!isLoggedIn) {
      alert("Login to save your progress");
      return;
    }

    try {

      const token = localStorage.getItem("token");

      await fetch(
        "http://localhost:5000/api/user-roadmaps/start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ roadmapId: roadmap._id })
        }
      );

      alert("Course Started!");

      window.location.href = "/dashboard";

    } catch (error) {
      console.error(error);
    }
  };


  return (
    <section className="min-h-screen w-full bg-[#020617] text-slate-200 p-6 md:p-12 font-sans relative z-20 overflow-hidden">

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-900/10 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <header className="mb-12">

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4"
          >
            Community Nexus
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-2xl mb-8"
          >
            Discover, clone, and deploy established skill trajectories.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative max-w-xl"
          >
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700 rounded-2xl py-4 pl-6 pr-12 text-white"
            />
          </motion.div>

        </header>


        {/* Grid */}
        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >

          {filteredRoadmaps?.map((roadmap: any, index: number) => {

            const locked = !isLoggedIn && index > 1;
            const disabled = roadmap.isActive === false;

            return (
              <motion.div
                key={roadmap._id}
                variants={itemVars}
                className={`group relative bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 backdrop-blur-sm transition-all duration-300 flex flex-col h-full overflow-hidden
                ${locked || disabled ? "opacity-60" : "hover:bg-slate-800/40"}`}
              >

                {locked && (
                  <div className="absolute inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-20">
                    <p className="text-white font-bold">
                      Login to Unlock
                    </p>
                  </div>
                )}

                {disabled && (
                  <div className="absolute inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-20">
                    <div className="text-center">
                      <p className="text-white font-bold text-lg">
                        Sorry
                      </p>
                      <p className="text-slate-300 text-sm">
                        Not available (for now)
                      </p>
                    </div>
                  </div>
                )}

                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600" />

                <div className="flex justify-between mb-6">
                  <span className="text-xs text-slate-400">
                    {roadmap.category || "Development"}
                  </span>

                  <span className="text-cyan-400 font-mono text-sm">
                    {roadmap.totalXp || 0} XP
                  </span>
                </div>

                <h2 className="text-2xl font-black text-white mb-3">
                  {roadmap.title}
                </h2>

                <p className="text-slate-400 text-sm mb-8 flex-1">
                  {roadmap.description}
                </p>

                <div className="flex justify-between items-center mt-auto">

                  <span className="text-xs text-slate-500">
                    {roadmap.level || "Beginner"}
                  </span>

                  <button
                    onClick={() => handleStart(roadmap)}
                    disabled={locked || disabled}
                    className="text-sm font-bold text-white bg-white/5 hover:bg-cyan-500 hover:text-black px-4 py-2 rounded-lg transition-all"
                  >
                    Start Course
                  </button>

                </div>

              </motion.div>
            );

          })}

        </motion.div>

      </div>

      {limit && (
  <div className="mt-10 text-center">
    <button
      onClick={() => window.location.href = "/explore"}
      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl"
    >
      View All Roadmaps
    </button>
  </div>
)}

    </section>
  );
}