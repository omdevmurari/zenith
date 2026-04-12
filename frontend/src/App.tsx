// src/App.tsx
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { apiUrl } from "./lib/api";

// Import your pages
import Landing from "./user/pages/Landing";
import Auth from "./user/pages/Auth";
import Dashboard from "./user/pages/Dashboard";
import AdminBuilder from "./admin/pages/AdminBuilder";
import Explore from "./user/pages/Explore";
import Roadmap from "./user/pages/Roadmap";
import AdminDashboard from "./admin/pages/AdminDashboard";
import CustomCursor from "./components/CustomCursor";
import RoadmapView from "./user/pages/RoadmapView";

// âœ… Added New Imports
import Focus from "./user/pages/Focus";
import Profile from "./user/pages/Profile";
import AdminRoadmaps from "./admin/pages/AdminRoadmaps";
import AdminUsers from "./admin/pages/AdminUsers";

// Import your custom cursor (assuming you have it in a components folder)
// import CustomCursor from "./components/CustomCursor"; 

export default function App() {
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const handleDisabledAccount = () => {
      if (cancelled) return;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      alert("You've been disabled.");
      window.location.href = "/";
    };

    const checkSession = async () => {
      try {
        const res = await fetch(apiUrl("/api/auth/me"), {
          headers: {
            Authorization: `Bearer ${token}`
          },
          cache: "no-store"
        });

        if (res.status !== 403) {
          return;
        }

        const data = await res.json();

        if (data?.message === "Account disabled") {
          handleDisabledAccount();
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token]);

  return (
    <Router>
      {/* The CustomCursor sits outside the Routes so it 
        remains active across every single page.
      */}

      <CustomCursor />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/roadmap" element={<Roadmap />} />

        {/* Private / Student Routes */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/builder" element={<AdminBuilder />} />
        <Route path="/admin/users" element={<AdminUsers />} />

        {/* âœ… Added Admin Roadmaps */}
        <Route path="/admin/roadmaps" element={<AdminRoadmaps />} />

        {/* Catch-all: Redirect unknown URLs back home */}
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="/explore" element={<Explore isLoggedIn={isLoggedIn} />} />

        {/* âœ… Added User Pages */}
        <Route path="/focus/:id" element={<Focus />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/roadmap/:id" element={<RoadmapView />} />

      </Routes>
    </Router>
  );
}



