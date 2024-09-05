const jwt = require('jsonwebtoken');

exports.signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.createCookie = (res, payload, customExpiresInMs) => {
  const expiresIn =
    customExpiresInMs ??
    process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000; // Default expiration

  const cookieOptions = {
    expires: new Date(Date.now() + expiresIn),
    httpOnly: true, // cookie cannot be accessed or modified by the browser
    sameSite: 'strict', // cookie can only be sent in a first-party context
    secure: process.env.NODE_ENV === 'production' // cookie can only be sent over HTTPS
  };

  res.cookie('jwt', payload, cookieOptions);
};
