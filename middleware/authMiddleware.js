const jwt = require('jsonwebtoken');
const User = require('../models/User');

/* ---------------------- Helper: Extract token ---------------------- */
const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  return authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;
};

/* ---------------------- Helper: Get user from token ---------------------- */
const getUserFromToken = async (req) => {
  const token = getTokenFromHeader(req);
  if (!token) throw new Error('No token provided');

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');
  if (!user) throw new Error('User not found');

  return user;
};

/* ---------------------- ✅ Any Authenticated User ---------------------- */
exports.protect = async (req, res, next) => {
  try {
    const user = await getUserFromToken(req);
    req.user = user;
    next(); // Allows both admins and customers
  } catch (err) {
    console.error('❌ protect middleware error:', err.message);
    return res.status(401).json({ error: 'Unauthorized access. Token invalid or missing.' });
  }
};

/* ---------------------- ✅ Admin-Only Access ---------------------- */
exports.authenticateAdmin = async (req, res, next) => {
  try {
    const user = await getUserFromToken(req);

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('❌ authenticateAdmin error:', err.message);
    return res.status(401).json({ error: 'Unauthorized access' });
  }
};

/* ---------------------- ✅ Customer-Only Access ---------------------- */
exports.authenticateCustomer = async (req, res, next) => {
  try {
    const user = await getUserFromToken(req);

    if (user.role !== 'customer') {
      return res.status(403).json({ error: 'Access denied. Customers only.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('❌ authenticateCustomer error:', err.message);
    return res.status(401).json({ error: 'Unauthorized access' });
  }
};
