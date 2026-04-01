const Activity = require("../models/Activity");

exports.getActivity = async (req, res) => {
  try {

    const activity = await Activity.find({
      user: req.user._id
    });

    res.json(activity);

  } catch (error) {
    res.status(500).json(error);
  }
};