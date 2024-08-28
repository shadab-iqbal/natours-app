const Review = require('../models/reviewModel');

exports.getAllReviews = async (req, res, next) => {
  const filter = req.params.tourId ? { tourId: req.params.tourId } : {};

  try {
    const reviews = await Review.find(filter);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews
      }
    });
  } catch (err) {
    return next(err);
  }
};

exports.createReview = async (req, res, next) => {
  req.body.reviewFor = req.body.reviewFor || req.params.tourId;
  req.body.reviewBy = req.body.reviewBy || req.user.id;

  try {
    const newReview = await Review.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview
      }
    });
  } catch (err) {
    return next(err);
  }
};
