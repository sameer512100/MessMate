const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Middleware to authenticate user and optionally check for admin
function authenticate(requireAdmin = false) {
  return function (req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const user = jwt.verify(token, JWT_SECRET);
      req.user = user;
      if (requireAdmin && user.role !== 'admin') {
        return res.status(403).json({ message: 'Admins only' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

module.exports = authenticate;