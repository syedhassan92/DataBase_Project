const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: { message: 'No authentication token provided', status: 401 } });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: { message: 'Invalid or expired token', status: 401 } });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'Admin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: { message: 'Access denied. Admin only.', status: 403 } });
    }
    next();
  });
};

module.exports = { auth, adminAuth };
