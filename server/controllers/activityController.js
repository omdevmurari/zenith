import Activity from "../models/Activity.js";

export const getActivity = async (req, res) => {

  try {

    const activity = await Activity.find({
      user: req.user._id
    });

    res.json(activity);

  } catch (error) {

    res.status(500).json(error);

  }

};