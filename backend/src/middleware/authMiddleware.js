const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (
      !authorizationHeader ||
      !authorizationHeader.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    const token = authorizationHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
};

const optionalAuth = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (
      authorizationHeader &&
      authorizationHeader.startsWith('Bearer ')
    ) {
      const token = authorizationHeader.split(' ')[1];
      if (token && token !== 'null' && token !== 'undefined') {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET
        );
        req.userId = decoded.userId;
      }
    }
  } catch (error) {
    // Optional auth silently continues
  }
  next();
};

module.exports = protect;
module.exports.protect = protect;
module.exports.optionalAuth = optionalAuth;