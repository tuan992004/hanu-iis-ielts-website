const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../models/prismaClient');

exports.register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'TEACHER' ? 'TEACHER' : 'STUDENT'; // Don't allow ADMIN registration here

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: userRole,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ success: true, token, user: { id: user.id, email, name, role: userRole } });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ success: true, token, user: { id: user.id, email, name: user.name, role: user.role } });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  // Since we use stateless JWTs, the client handles logout by destroying the token
  // A robust implementation would use a blocklist or HTTP-only cookies
  res.json({ success: true, message: 'Logged out successfully. Please clear your token.' });
};

exports.recoverPassword = async (req, res, next) => {
  // Mock endpoint according to US-2.7
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  res.json({ success: true, message: 'If that email exists, a recovery link has been sent.' });
};
