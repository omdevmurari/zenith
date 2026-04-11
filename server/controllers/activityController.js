import Activity from "../models/Activity.js";

export const getActivity = async (req, res) => {

  try {

    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated"
      });
    }

    const activity = await Activity.find({
      user: userId
    }).sort({ date: 1 });

    res.json(activity);

  } catch (error) {

    res.status(500).json(error);

  }

};
