const Node = require("../models/Node");
const Roadmap = require("../models/Roadmap");

exports.createNode = async (req, res) => {
  try {
    const { title, description, xpValue, roadmapId, order } = req.body;

    const node = await Node.create({
      title,
      description,
      xpValue,
      roadmap: roadmapId,
      order,
    });

    await Roadmap.findByIdAndUpdate(roadmapId, {
      $push: { nodes: node._id },
    });

    res.status(201).json(node);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getNodes = async (req, res) => {
  try {
    const nodes = await Node.find({ roadmap: req.params.roadmapId });

    res.json(nodes);
  } catch (error) {
    res.status(500).json(error);
  }
};