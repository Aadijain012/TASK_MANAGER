const express = require('express');
const { getMe, getUsers } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, getMe);
router.get('/', protect, admin, getUsers);

module.exports = router;
