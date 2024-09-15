const jwt = require('jsonwebtoken');

exports.signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.createCookie = (req, res, payload, customExpiresInMs) => {
  const expiresIn =
    customExpiresInMs ??
    process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000; // Default expiration

  const cookieOptions = {
    expires: new Date(Date.now() + expiresIn),
    httpOnly: true, // cookie cannot be accessed or modified by the browser
    sameSite: 'strict', // cookie can only be sent in a first-party context
    // cookie can only be sent over HTTPS
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    // secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('jwt', payload, cookieOptions);
};
