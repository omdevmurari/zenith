const Roadmap = require("../models/Roadmap");
const User = require("../models/User");

exports.createRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      difficulty: req.body.difficulty,
      author: req.user._id,
    });

    res.status(201).json(roadmap);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find();

    res.json(roadmaps);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.cloneRoadmap = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    const roadmapId = req.params.roadmapId;

    if (user.clonedRoadmaps.includes(roadmapId)) {
      return res.json({ message: "Already started" });
    }

    user.clonedRoadmaps.push(roadmapId);

    await user.save();

    res.json({
      message: "Roadmap started",
      roadmapId
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getUserRoadmaps = async (req, res) => {
  try {

    const user = await User.findById(req.user._id)
      .populate("clonedRoadmaps");

    res.json(user.clonedRoadmaps);

  } catch (error) {
    res.status(500).json(error);
  }
};