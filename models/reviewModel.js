const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please write a review for the reviewFor!'],
      trim: true
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating to the reviewFor!'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5']
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    reviewFor: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'A review must be for an existing reviewFor!'],
      ref: 'Tour'
    },
    reviewBy: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'A review must be provided by a valid user!'],
      ref: 'User'
    }
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

reviewSchema.pre(/^find/, function(next) {
  this.populate([
    {
      path: 'reviewBy',
      select: 'name photo'
    }
  ]);

  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { reviewFor: tourId }
    },
    {
      $group: {
        _id: '$reviewFor',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  // console.log({ stats });

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  }
  // "else" will be activated when there was only one review
  // and the reviwer deleted that last review
  else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 0
    });
  }
};

reviewSchema.post('save', function(doc, next) {
  doc.constructor.calcAverageRatings(this.reviewFor);
  return next();
});

reviewSchema.post(/^findOneAnd/, function(doc, next) {
  doc.constructor.calcAverageRatings(doc.reviewFor);
  return next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
