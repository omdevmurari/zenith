import User from "../models/User.js";
import Node from "../models/Node.js";
import Activity from "../models/Activity.js";
import Roadmap from "../models/Roadmap.js";

export const getDashboardStats = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

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

    const node = await Node.findById(req.params.nodeId);

    const user = await User.findById(req.user._id);

    if (user.completedNodes.includes(node._id)) {
      return res.json({ message: "Already completed" });
    }

    user.completedNodes.push(node._id);

    user.xp += node.xpValue;

    await user.save();

    const today = new Date().toISOString().split("T")[0];

    if (user.lastActive !== today) {

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (user.lastActive === yesterdayStr) {
      user.streak += 1;
    } else {
      user.streak = 1;
    }

    if (user.streak > user.longestStreak) {
      user.longestStreak = user.streak;
    }

    user.lastActive = today;
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

    res.json({
      message: "Node completed",
      xp: user.xp
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

export const getProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("completedNodes");

    res.json({
      xp: user.xp,
      completedNodes: user.completedNodes,
      totalCompleted: user.completedNodes.length
    });

  } catch (error) {
    res.status(500).json(error);
  }
};