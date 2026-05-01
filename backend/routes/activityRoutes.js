const express = require('express');
const { getActivities } = require('../controllers/activityController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, admin, getActivities);

module.exports = router;
