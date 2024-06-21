const jwt = require('jsonwebtoken');

const extractBearer = (authorization) => {
  if (typeof authorization !== 'string') {
    return false;
  }

  const matches = authorization.match(/(bearer)\s+(\S+)/i);

  return matches && matches[2];
};

const checkAuth = (req, res, next) => {
  const token = req.headers.authorization && extractBearer(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ message: 'Bad token' });
  }

  verifyToken(token)
    .then((decodedToken) => {
      req.auth = {
        userId: decodedToken.userId,
      };
      next();
    })
    .catch((error) => {
      return res.status(401).json({ message: 'Bad token' });
    });
};

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (error, decodedToken) => {
      if (error) {
        reject(error);
      } else {
        resolve(decodedToken);
      }
    });
  });
};
module.exports = checkAuth;
