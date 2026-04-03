import Node from "../models/Node.js";
import Roadmap from "../models/Roadmap.js";

// --- 1. GET ALL NODES FOR A ROADMAP ---
export const getNodes = async (req, res) => {
  try {
    // Note: Assuming your route is /api/nodes/:roadmapId
    const { roadmapId } = req.params;
    
    // Find all nodes that belong to this roadmap
    const nodes = await Node.find({ roadmap: roadmapId });
    
    res.status(200).json(nodes);
  } catch (error) {
    console.error("Error fetching nodes:", error);
    res.status(500).json({ message: "Server error while fetching nodes." });
  }
};

// --- 2. CREATE A NEW NODE ---
export const createNode = async (req, res) => {
  try {
    const { title, description, xpValue, roadmap, order } = req.body;

    // Create and save the new Node
    const newNode = new Node({
      title,
      description,
      xpValue,
      roadmap,
      order
    });
    
    const savedNode = await newNode.save();

    // Push the new Node's _id into the Roadmap's nodes array
    if (roadmap) {
      await Roadmap.findByIdAndUpdate(
        roadmap, 
        { $push: { nodes: savedNode._id } },
        { new: true }
      );
    }

    res.status(201).json(savedNode);
  } catch (error) {
    console.error("Error creating node:", error);
    res.status(500).json({ message: "Server error while creating node." });
  }
};

// --- 3. UPDATE AN EXISTING NODE ---
export const updateNode = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the node by ID and update it
    const updatedNode = await Node.findByIdAndUpdate(
      id,
      req.body,
      { new: true } // Returns the updated document
    );

    if (!updatedNode) {
      return res.status(404).json({ message: "Node not found" });
    }

    res.status(200).json(updatedNode);
  } catch (error) {
    console.error("Error updating node:", error);
    res.status(500).json({ message: "Server error while updating node." });
  }
};

// --- 4. DELETE A NODE ---
export const deleteNode = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the node first to get its parent roadmap ID
    const nodeToDelete = await Node.findById(id);
    
    if (!nodeToDelete) {
      return res.status(404).json({ message: "Node not found" });
    }

    // Pull the node's _id out of the parent Roadmap's nodes array
    if (nodeToDelete.roadmap) {
      await Roadmap.findByIdAndUpdate(
        nodeToDelete.roadmap,
        { $pull: { nodes: id } }
      );
    }

    // Delete the actual node document
    await Node.findByIdAndDelete(id);

    res.status(200).json({ message: "Node permanently purged." });
  } catch (error) {
    console.error("Error deleting node:", error);
    res.status(500).json({ message: "Server error while deleting node." });
  }
};