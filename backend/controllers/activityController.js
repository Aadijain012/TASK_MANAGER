const Activity = require('../models/Activity');

const getActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({})
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(activities);
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivities };
