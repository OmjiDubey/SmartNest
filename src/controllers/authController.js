const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const RefreshToken = require('../models/refreshToken.js');
const { signAccessToken, generateRefreshToken, hashRefreshToken } = require('../utils/tokenUtils.js');

const REFRESH_DAYS = parseInt(process.env.JWT_REFRESH_EXPIRY_DAYS, 10);

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const user = await User.findOne({ username });
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'invalid credentials' });
  }

  const accessToken = signAccessToken(user);
  const { raw, hash } = generateRefreshToken();

  await RefreshToken.create({
    userId: user._id,
    tokenHash: hash,
    expiresAt: new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000),
  });

  res.json({ accessToken, refreshToken: raw });
}

async function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'refreshToken is required' });
  }

  const hash = hashRefreshToken(refreshToken);
  const stored = await RefreshToken.findOne({ tokenHash: hash });

  if (!stored || stored.expiresAt < new Date()) {
    return res.status(401).json({ error: 'invalid or expired refresh token' });
  }

  const user = await User.findById(stored.userId);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'invalid credentials' });
  }

  const accessToken = signAccessToken(user);
  res.json({ accessToken });
}

async function logout(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'refreshToken is required' });
  }

  const hash = hashRefreshToken(refreshToken);
  await RefreshToken.deleteOne({ tokenHash: hash });
  res.status(204).send();
}

module.exports = { login, refresh, logout };