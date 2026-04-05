const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// All admin routes require authentication and ADMIN role
router.use(authenticateToken, requireRole(['ADMIN']));

router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
