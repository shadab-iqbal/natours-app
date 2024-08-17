/* eslint-disable import/no-extraneous-dependencies */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/sendEmail');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role
    });

    const token = signToken(newUser.id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });
  } catch (err) {
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    // check if email exists => check if password exists => check if password is correct
    if (
      !user ||
      !password ||
      !(await user.isPasswordCorrect(password, user.password))
    ) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken(user.id);

    res.status(201).json({
      status: 'success',
      token
    });
  } catch (err) {
    return next(err);
  }
};

exports.isAuthenticated = async (req, res, next) => {
  try {
    let token;

    // check if there is any authorization property in the headers
    // and if it starts with 'Bearer'
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // check if the token can be found in the headers
    if (!token) {
      return next(
        new AppError('You are not logged in. Please log in again!', 401)
      );
    }

    // check if the token is valid
    const decryptedToken = jwt.verify(token, process.env.JWT_SECRET);

    // check if the user still exists
    const user = await User.findById(decryptedToken.id);
    if (!user) {
      return next(
        new AppError('The user with this token no longer exists', 401)
      );
    }

    // check if the user changed the password after the token was issued
    if (user.isPassChangedSinceJWT(decryptedToken.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again', 401)
      );
    }

    req.user = user;

    return next();
  } catch (err) {
    return next(err);
  }
};

exports.isAuthorized = authorizedRoles => {
  console.log(authorizedRoles);

  return (req, res, next) => {
    if (!authorizedRoles.includes(req.user.role)) {
      return next(
        new AppError('You are unauthorized to perform this action', 403)
      );
    }

    return next();
  };
};

exports.forgetPassword = async (req, res, next) => {
  try {
    // check if the user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // create a password reset token and return the unhashed token
    const resetToken = user.createPasswordResetToken();

    // save the password reset token and expiration time for that user
    await user.save();

    // create the reset URL
    const resetURL = `${process.env.BACKEND_BASE_URL}/api/v1/users/reset-password/${resetToken}`;

    // create the message to be sent to the user
    const message = `Submit a PATCH req to ${resetURL} with the new password and passwordConfirm`;

    // send the email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Your password reset token (valid for 10 minutes)',
        text: message
      });

      // send a success response
      res.status(201).json({
        status: 'success',
        message: `Token sent to email successfully`
      });
    } catch (err) {
      // if an error occurs, reset the password reset token and expiration time
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save();

      console.log({ err });

      return next(
        new AppError(
          'There was an error sending the email. Try again later!',
          502
        )
      );
    }
  } catch (err) {
    return next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;

  // hashing the token before comparing it
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // check if the token belongs to a user and it's not expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // update the password and passwordConfirm fields
  user.password = password;
  user.passwordConfirm = passwordConfirm;

  // reset the passwordResetToken and passwordResetExpires fields
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // update password change time and save the user
  user.passwordChangedAt = Date.now();
  await user.save();

  // log the user in and send the JWT
  const newToken = signToken(user.id);

  res.status(201).json({
    status: 'success',
    token: newToken
  });
};
