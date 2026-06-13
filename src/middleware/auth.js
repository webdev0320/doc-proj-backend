const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.log('Auth failed: No token found. Headers:', req.headers);
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user actually exists in DB
    const { prisma } = require('../lib/prisma');
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.status === 'DISABLED') {
      console.log('Auth failed: User not found or disabled:', decoded.id);
      return res.status(401).json({ success: false, message: 'Your account is disabled or no longer exists.' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.log('Auth failed: Token verification error:', err.message);
    // If it's a JWT error, it's a 401. If it's a DB error, it's a 503.
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    // Return 503 for database connection issues
    return res.status(503).json({ success: false, message: 'Database temporarily unavailable. Please try again.' });
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
