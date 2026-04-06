import express from "express";
import User from "../models/User.js";
import Roadmap from "../models/Roadmap.js";
import UserRoadmap from "../models/UserRoadmap.js";
import Activity from "../models/Activity.js";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

const router = express.Router();

// Get admin dashboard stats
router.get("/stats", protect, admin, async (req, res) => {
    try {
        // Total Operatives (users)
        const totalUsers = await User.countDocuments({ role: "student" });

        // Active Trajectories (active roadmaps that are published)
        const activeRoadmaps = await Roadmap.countDocuments({ isActive: true, published: true });

        // System Health - for now, just return a static value or check DB connection
        const systemHealth = "99.9%"; // Could be dynamic based on some checks

        // Server info - static for now
        const serverInfo = "Botad_01";

        // Recent Activity - get recent activities from Activity model
        const recentActivities = await Activity.find()
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(10)
            .select('user date xpEarned nodesCompleted createdAt');

        // Transform activities to match the dashboard format
        const formattedActivities = recentActivities.map(activity => ({
            id: activity._id,
            action: activity.user ? `${activity.user.name} earned XP` : "System activity",
            target: `${activity.xpEarned} XP, ${activity.nodesCompleted} nodes completed`,
            time: formatTimeAgo(activity.createdAt)
        }));

        // Add some mock admin activities for now
        const adminActivities = [
            {
                id: 'admin-1',
                action: "Admin updated node",
                target: "Frontend Architecture",
                time: "1 hour ago"
            },
            {
                id: 'admin-2',
                action: "New operative registered",
                target: `ID: ${totalUsers}`,
                time: "3 hours ago"
            },
            {
                id: 'admin-3',
                action: "System backup completed",
                target: "Sector 7G",
                time: "5 hours ago"
            }
        ];

        // Combine and sort by time (simplified)
        const allActivities = [...formattedActivities.slice(0, 2), ...adminActivities];

        res.json({
            stats: {
                totalOperatives: totalUsers,
                activeTrajectories: activeRoadmaps,
                systemHealth,
                serverInfo
            },
            recentActivity: allActivities
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Helper function to format time ago
function formatTimeAgo(date) {
    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
        return `${diffInMinutes} mins ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
    } else {
        return `${diffInDays} days ago`;
    }
}

export default router;