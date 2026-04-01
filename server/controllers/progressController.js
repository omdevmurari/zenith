const User = require("../models/User");
const Node = require("../models/Node");

exports.completeNode = async (req, res) => {
  try {
    const node = await Node.findById(req.params.nodeId);

    const user = await User.findById(req.user._id);

    if (user.completedNodes.includes(node._id)) {
      return res.json({ message: "Already completed" });
    }

    user.completedNodes.push(node._id);

    user.xp += node.xpValue;

    await user.save();

    res.json({
      message: "Node completed",
      xp: user.xp
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getProgress = async (req, res) => {
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