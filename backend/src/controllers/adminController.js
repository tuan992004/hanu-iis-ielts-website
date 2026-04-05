const prisma = require('../models/prismaClient');

exports.getUsers = async (req, res, next) => {
  try {
    const { search, role, isActive } = req.query;
    
    const where = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) {
      where.role = role.toUpperCase();
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive },
      select: { id: true, email: true, isActive: true, role: true }
    });

    res.json({ success: true, updatedUser });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Optional: Check if user has associated enrollments/courses before deleting
    // In a real system, you might do a cascading delete or soft delete

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
