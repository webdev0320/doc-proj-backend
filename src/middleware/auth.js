const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user actually exists in DB
    const { prisma } = require('../lib/prisma');
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.status === 'DISABLED') {
      return res.status(401).json({ success: false, message: 'Your account is disabled or no longer exists.' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ 
      success: false, 
      message: `Access denied: Admin only. Your current role is: ${req.user?.role || 'None'}` 
    });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
