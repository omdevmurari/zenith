const Roadmap = require("../models/Roadmap");

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