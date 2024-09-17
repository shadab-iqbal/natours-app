const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const controllerFactory = require('../utils/controllerFactory');
const AppError = require('./../utils/appError');

exports.getAllReviews = controllerFactory.getAll(Review);

exports.getReview = controllerFactory.getOne(Review);

exports.createReview = controllerFactory.createOne(Review);

exports.updateReview = controllerFactory.updateOne(Review);

exports.deleteReview = controllerFactory.deleteOne(Review);

// Middleware to set the filter options for the reviews
exports.setFilterOptions = (req, res, next) => {
  req.query.reviewFor = req.params.tourId || undefined;
  return next();
};

// Middleware to set the tour id and user id for the review
exports.setTourUserIds = (req, res, next) => {
  req.body.reviewFor = req.body.reviewFor || req.params.tourId;
  req.body.reviewBy = req.body.reviewBy || req.user.id;
  return next();
};

// Middleware to ensure only an user who has booked the tour can review it
exports.canReview = async (req, res, next) => {
  const booking = await Booking.findOne({
    tour: req.body.reviewFor,
    user: req.body.reviewBy
  });

  if (!booking) {
    return next(
      new AppError('You need to book this tour before you can review it.', 403)
    );
  }

  return next();
};
