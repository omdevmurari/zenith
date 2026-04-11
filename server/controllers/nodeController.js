import Node from "../models/Node.js";
import Roadmap from "../models/Roadmap.js";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const createSeed = (input) => {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) - hash) + input.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash) || 1;
};

const createRandom = (seedValue) => {
  let seed = seedValue;

  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
};

const generateConstellationLayout = (nodes, roadmapId = "roadmap") => {
  const orderedNodes = [...nodes].sort(
    (firstNode, secondNode) => (firstNode.order || 0) - (secondNode.order || 0)
  );

  if (orderedNodes.length === 0) {
    return [];
  }

  if (orderedNodes.length === 1) {
    return orderedNodes.map((node) => ({
      ...node,
      position: {
        x: 480,
        y: 240
      }
    }));
  }

  const random = createRandom(createSeed(`${roadmapId}-${orderedNodes.length}`));
  const laneHeights = [110, 175, 255, 335];
  const marginX = 100;
  const width = 860;
  const step = width / Math.max(orderedNodes.length - 1, 1);

  return orderedNodes.map((node, index) => {
    const laneIndex =
      (index + Math.floor(random() * laneHeights.length)) % laneHeights.length;
    const baseX = marginX + (step * index);
    const xJitter = (random() - 0.5) * Math.min(70, step * 0.28);
    const yJitter = (random() - 0.5) * 36;

    return {
      ...node,
      position: {
        x: clamp(Math.round(baseX + xJitter), 70, 930),
        y: clamp(Math.round(laneHeights[laneIndex] + yJitter), 70, 430)
      }
    };
  });
};

const syncRoadmapLayout = async (roadmapId) => {
  if (!roadmapId) {
    return [];
  }

  const roadmapNodes = await Node.find({ roadmap: roadmapId }).sort({ order: 1 });
  const positionedNodes = generateConstellationLayout(roadmapNodes, roadmapId.toString());

  await Promise.all(
    positionedNodes.map((node) =>
      Node.findByIdAndUpdate(node._id, {
        order: node.order,
        position: node.position
      })
    )
  );

  return Node.find({ roadmap: roadmapId }).sort({ order: 1 });
};

// --- 1. GET ALL NODES FOR A ROADMAP ---
export const getNodes = async (req, res) => {
  try {
    // Note: Assuming your route is /api/nodes/:roadmapId
    const { roadmapId } = req.params;

    // Find all nodes that belong to this roadmap
    const nodes = await Node.find({ roadmap: roadmapId }).sort({ order: 1 });

    res.status(200).json(nodes);
  } catch (error) {
    console.error("Error fetching nodes:", error);
    res.status(500).json({ message: "Server error while fetching nodes." });
  }
};

// --- 2. CREATE A NEW NODE ---
export const createNode = async (req, res) => {
  try {
    const { title, description, xpValue, roadmap } = req.body;

    const existingCount = roadmap
      ? await Node.countDocuments({ roadmap })
      : 0;

    // Create and save the new Node
    const newNode = new Node({
      title,
      description,
      xpValue,
      roadmap,
      order: existingCount
    });

    const savedNode = await newNode.save();

    // Push the new Node's _id into the Roadmap's nodes array
    if (roadmap) {
      await Roadmap.findByIdAndUpdate(
        roadmap,
        { $push: { nodes: savedNode._id } },
        { returnDocument: 'after' }
      );
    }

    const [positionedNode] = await syncRoadmapLayout(roadmap);

    const createdNode = await Node.findById(savedNode._id);

    res.status(201).json(createdNode || positionedNode || savedNode);
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
      { returnDocument: 'after' } // Returns the updated document
    );

    if (!updatedNode) {
      return res.status(404).json({ message: "Node not found" });
    }

    const refreshedNodes = await syncRoadmapLayout(updatedNode.roadmap);
    const refreshedNode = refreshedNodes.find(
      (node) => node._id.toString() === updatedNode._id.toString()
    );

    res.status(200).json(refreshedNode || updatedNode);
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

    const remainingNodes = await Node.find({
      roadmap: nodeToDelete.roadmap
    }).sort({ order: 1 });

    await Promise.all(
      remainingNodes.map((node, index) =>
        Node.findByIdAndUpdate(node._id, { order: index })
      )
    );

    await syncRoadmapLayout(nodeToDelete.roadmap);

    res.status(200).json({ message: "Node permanently purged." });
  } catch (error) {
    console.error("Error deleting node:", error);
    res.status(500).json({ message: "Server error while deleting node." });
  }
};

// --- 5. REORDER NODES ---
export const reorderNodes = async (req, res) => {
  try {
    const { nodes } = req.body; // Array of nodes with their new order

    if (!Array.isArray(nodes) || nodes.length === 0) {
      return res.status(400).json({ message: "Invalid nodes array" });
    }

    // Update each node's order based on position in array
    const updatePromises = nodes.map((node, index) =>
      Node.findByIdAndUpdate(
        node._id,
        { order: index },
        { returnDocument: 'after' }
      )
    );

    const updatedNodes = await Promise.all(updatePromises);
    const roadmapId = updatedNodes[0]?.roadmap;
    const layoutNodes = await syncRoadmapLayout(roadmapId);

    res.status(200).json(layoutNodes);
  } catch (error) {
    console.error("Error reordering nodes:", error);
    res.status(500).json({ message: "Server error while reordering nodes." });
  }
};
