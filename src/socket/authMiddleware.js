// socket/authMiddleware.js
// Verifies the JWT access token on socket connection, same token type
// used by middleware/authMiddleware.js for REST routes.
//
// ASSUMPTION: utils/tokenUtils.js exports `verifyAccessToken(token)` which
// returns the decoded payload (e.g. { userId, username }) or throws on
// invalid/expired tokens. Rename here if your actual export differs.

const { verifyAccessToken } = require('../utils/tokenUtils');

function socketAuthMiddleware(socket, next) {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.replace('Bearer ', '');

  if (!token) {
    return next(new Error('AUTH_REQUIRED'));
  }

  try {
    const payload = verifyAccessToken(token);
    socket.user = payload;
    next();
  } catch (err) {
    next(new Error('AUTH_INVALID'));
  }
}

module.exports = socketAuthMiddleware;