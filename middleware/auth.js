const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Authorization token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded token to request
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message); // Log for monitoring
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token has expired, please log in again' });
    }
    return res.status(401).json({ msg: 'Token is not valid', error: err.message });
  }
};

module.exports = exports;