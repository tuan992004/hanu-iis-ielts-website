const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/:id', authenticateToken, userController.getUserProfile);
router.put('/:id', authenticateToken, userController.updateUserProfile);

module.exports = router;
