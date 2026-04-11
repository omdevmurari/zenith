import User from "../models/User.js";
import Node from "../models/Node.js";
import Activity from "../models/Activity.js";
import UserRoadmap from "../models/UserRoadmap.js";
import Progress from "../models/Progress.js";

const getUserId = (req) => req.user?.id || req.user?._id;
const APP_TIMEZONE = "Asia/Kolkata";

const getDateKey = (date = new Date()) =>
    new Intl.DateTimeFormat("en-CA", {
        timeZone: APP_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(date);

const getNextUnlockedNodeId = (roadmapNodes, completedNodeIds) => {
    for (const roadmapNode of roadmapNodes) {
        const isCompleted = completedNodeIds.includes(roadmapNode._id.toString());

        if (!isCompleted) {
            return roadmapNode._id.toString();
        }
    }

    return null;
};

export const getDashboardStats = async (req, res) => {
    try {

        const userId = getUserId(req);
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            totalXP: user.xp,
            streak: user.streak,
            longestStreak: user.longestStreak,
            completedNodes: user.completedNodes.length,
            startedRoadmaps: user.clonedRoadmaps.length
        });

    } catch (error) {
        res.status(500).json(error);
    }
};

export const completeNode = async (req, res) => {
    try {

        const userId = getUserId(req);
        const nodeId = req.params.nodeId || req.body.nodeId;

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        if (!nodeId) {
            return res.status(400).json({ message: "nodeId is required" });
        }

        const node = await Node.findById(nodeId);

        if (!node) {
            return res.status(404).json({ message: "Node not found" });
        }

        const userRoadmap = node.roadmap
            ? await UserRoadmap.findOne({
                userId,
                roadmapId: node.roadmap
            })
            : null;

        if (node.roadmap && !userRoadmap) {
            return res.status(400).json({
                message: "Start this roadmap before completing nodes"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const alreadyCompleted = user.completedNodes.some(
            (completedNodeId) => completedNodeId.toString() === node._id.toString()
        );

        if (alreadyCompleted) {
            return res.json({ message: "Already completed" });
        }

        const roadmapNodes = node.roadmap
            ? await Node.find({ roadmap: node.roadmap }).sort({ order: 1 })
            : [node];

        const completedNodeIds = user.completedNodes.map(
            (completedNodeId) => completedNodeId.toString()
        );

        const nextUnlockedNodeId = getNextUnlockedNodeId(
            roadmapNodes,
            completedNodeIds
        );

        if (
            nextUnlockedNodeId &&
            nextUnlockedNodeId !== node._id.toString()
        ) {
            return res.status(403).json({
                message: "This node is still locked"
            });
        }

        user.completedNodes.push(node._id);

        user.xp += node.xpValue;

        await user.save();

        const today = getDateKey();

        if (user.lastActive !== today) {

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = getDateKey(yesterday);

            if (user.lastActive === yesterdayStr) {
                user.streak += 1;
            } else {
                user.streak = 1;
            }

            if (user.streak > user.longestStreak) {
                user.longestStreak = user.streak;
            }

            user.lastActive = today;
            await user.save();
        }

        let activity = await Activity.findOne({
            user: user._id,
            date: today
        });

        if (activity) {
            activity.xpEarned += node.xpValue;
            activity.nodesCompleted += 1;
        } else {
            activity = await Activity.create({
                user: user._id,
                date: today,
                xpEarned: node.xpValue,
                nodesCompleted: 1
            });
        }

        await activity.save();

        if (node.roadmap) {
            await Progress.findOneAndUpdate(
                {
                    user: userId,
                    roadmap: node.roadmap,
                    node: node._id
                },
                {
                    $set: {
                        completed: true
                    }
                },
                {
                    upsert: true,
                    new: true
                }
            );
        }

        let roadmapProgress = null;

        if (node.roadmap) {
            const totalNodes = await Node.countDocuments({
                roadmap: node.roadmap
            });

            const completedInRoadmap = await Node.countDocuments({
                _id: { $in: user.completedNodes },
                roadmap: node.roadmap
            });

            roadmapProgress = totalNodes > 0
                ? Math.round((completedInRoadmap / totalNodes) * 100)
                : 0;

            await UserRoadmap.findOneAndUpdate(
                {
                    userId,
                    roadmapId: node.roadmap
                },
                {
                    $set: { progress: roadmapProgress }
                }
            );
        }

        res.json({
            message: "Node completed",
            xp: user.xp,
            completedNodes: user.completedNodes,
            progress: roadmapProgress,
            nextUnlockedNodeId: getNextUnlockedNodeId(
                roadmapNodes,
                [...completedNodeIds, node._id.toString()]
            )
        });

    } catch (error) {
        res.status(500).json(error);
    }
};


export const getProgress = async (req, res) => {
    try {
        const userId = getUserId(req);
        const user = await User.findById(userId)
            .populate("completedNodes");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            xp: user.xp,
            completedNodes: user.completedNodes,
            totalCompleted: user.completedNodes.length
        });

    } catch (error) {
        res.status(500).json(error);
    }
};
