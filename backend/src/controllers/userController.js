const prisma = require('../models/prismaClient');
const bcrypt = require('bcrypt');

exports.getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Ensure standard users can only access their own profile
    if (req.user.role !== 'ADMIN' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, password, avatarUrl } = req.body;
    
    if (req.user.role !== 'ADMIN' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: { id: true, email: true, name: true, avatarUrl: true, role: true }
    });

    res.json({ success: true, updatedUser });
  } catch (error) {
    next(error);
  }
};
