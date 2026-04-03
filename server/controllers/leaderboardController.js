import User from "../models/User.js";

export const getLeaderboard = async (req, res) => {
  try {

    const users = await User.find()
      .select("name xp streak longestStreak")
      .sort({ xp: -1 })
      .limit(10);

    res.json(users);

  } catch (error) {
    res.status(500).json(error);
  }
};