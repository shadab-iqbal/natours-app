const User = require('./../models/userModel');

const AppError = require('./../utils/appError');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (err) {
    return next(err);
  }
};

exports.updateAuthenticatedUser = async (req, res, next) => {
  // Check if the user is trying to update any field other than name and email

  const hasInvalidField = Object.keys(req.body).some(
    value => !['name', 'email'].includes(value)
  );

  if (hasInvalidField) {
    return next(
      new AppError('You are only allowed to update name and email!', 400)
    );
  }

  // now update the user info
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (err) {
    return next(err);
  }
};

exports.deleteAuthenticatedUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    return next(err);
  }
};

exports.getUser = (req, res, next) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

exports.createUser = (req, res, next) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

exports.updateUser = (req, res, next) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

exports.deleteUser = (req, res, next) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
