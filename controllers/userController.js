const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const controllerFactory = require('../utils/controllerFactory');

exports.getAuthenticatedUser = (req, res, next) => {
  req.params.id = req.user.id;
  return next();
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

exports.deactivateAuthenticatedUser = async (req, res, next) => {
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

exports.createUser = (req, res, next) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use Signup instead!'
  });
};

// the following functions are for admin only
exports.getUser = controllerFactory.getOne(User);
exports.getAllUsers = controllerFactory.getAll(User);
exports.updateUser = controllerFactory.updateOne(User);
exports.deleteUser = controllerFactory.deleteOne(User);
