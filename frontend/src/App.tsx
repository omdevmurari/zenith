// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import your pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminBuilder from "./pages/adminBuilder";
import Explore from "./pages/Explore";
import Roadmap from "./Roadmap";
import CustomCursor from "./components/CustomCursor";
import AdminDashboard from "./pages/AdminDashboard";

// Import your custom cursor (assuming you have it in a components folder)
// import CustomCursor from "./components/CustomCursor"; 

export default function App() {
  return (
    <Router>
      {/* The CustomCursor sits outside the Routes so it 
        remains active across every single page.
      */}
      {/* { <CustomCursor />} */}

      {/* <CustomCursor /> */}

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

        {/* Catch-all: Redirect unknown URLs back home */}
        <Route path="*" element={<Navigate to="/" replace />} />


        <Route path="/explore" element={<Explore />} />
      </Routes>
    </Router>
  );
}