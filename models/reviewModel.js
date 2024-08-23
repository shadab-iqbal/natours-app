const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please write a review for the tour!'],
      trim: true
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating to the tour!'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5']
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    reviewFor: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'A review must be for an existing tour!'],
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
    // we are already populating tours with reviews, no need to populate reviews with tours again
    // thus we can avoid a chain of unnecessary populates
    // {
    //   path: 'reviewFor',
    //   select: 'name'
    // }
  ]);

  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
