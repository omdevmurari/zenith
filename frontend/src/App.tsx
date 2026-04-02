// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import your pages
import Landing from "./user/pages/Landing";
import Auth from "./user/pages/Auth";
import Dashboard from "./user/pages/Dashboard";
import AdminBuilder from "./admin/pages/AdminBuilder";
import Explore from "./user/pages/Explore";
import Roadmap from "./user/pages/Roadmap";
import AdminDashboard from "./admin/pages/AdminDashboard";
import CustomCursor from "./components/CustomCursor";

// ✅ Added New Imports
import Focus from "./user/pages/Focus";
import Profile from "./user/pages/Profile";
import AdminRoadmaps from "./admin/pages/AdminRoadmaps";

// Import your custom cursor (assuming you have it in a components folder)
// import CustomCursor from "./components/CustomCursor"; 

export default function App() {
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

        {/* ✅ Added Admin Roadmaps */}
        <Route path="/admin/roadmaps" element={<AdminRoadmaps />} />

        {/* Catch-all: Redirect unknown URLs back home */}
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="/explore" element={<Explore isLoggedIn={false} />} />

        {/* ✅ Added User Pages */}
        <Route path="/focus/:id" element={<Focus />} />
        <Route path="/profile" element={<Profile />} />

      </Routes>
    </Router>
  );
}