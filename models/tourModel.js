/* eslint-disable no-console */
const mongoose = require('mongoose');
const slugify = require('slugify');
const { isAscii } = require('validator');

const locationSchema = new mongoose.Schema({
  // GeoJSON data
  type: {
    type: String,
    default: 'Point',
    enum: {
      values: ['Point'],
      message: 'Location type must be Point'
    }
  },
  coordinates: {
    type: [Number],
    required: [true, 'A location must have coordinates']
  },
  address: {
    type: String
  },
  description: {
    type: String
  }
});

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      validate: {
        validator: isAscii,
        message: 'Tour name must only contain ASCII characters'
      }
    },
    slug: { type: String },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
      min: [1, 'Max group size must be 1 or more']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'Difficulty must be: easy, medium, hard'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be 0 or more'],
      max: [5, 'Rating must be 5 or less'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a description'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: {
      type: [String],
      default: []
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
      immutable: true
    },
    startDates: {
      type: [Date],
      default: []
    },
    secretTour: {
      type: Boolean,
      default: false,
      select: false
    },
    startLocation: {
      type: locationSchema,
      required: [true, 'A tour must have a start location']
    },
    locations: {
      type: [locationSchema],
      default: []
    },
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });

// 2dsphere indexing is only for geospatial queries
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function() {
  const val = this.duration / 7;
  return Math.round(val * 10) / 10;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'reviewFor'
});

// DOCUMENT MIDDLEWARE: runs BEFORE .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

// DOCUMENT MIDDLEWARE: runs AFTER .save() and .create()
tourSchema.post('save', function(doc, next) {
  console.log('New Tour Added');

  next();
});

// QUERY MIDDLEWARE: runs for all find queries
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  this.populate({
    path: 'guides', // Populate the guides field
    select: '-passwordChangedAt -__v' // Exclude the passwordChangedAt and __v fields
  });

  this.start = Date.now();

  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`\nQuery took ${Date.now() - this.start} milliseconds!\n`);

  next();
});

tourSchema.pre('aggregate', function(next) {
  // Check if the first stage in the pipeline is $geoNear
  if (this.pipeline().length > 0 && this.pipeline()[0].$geoNear) {
    return next(); // If it's a $geoNear stage, do not apply the $match stage
  }

  // If it's not a $geoNear stage, add the $match stage
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } }
  });

  this.startTime = new Date();

  next();
});

tourSchema.post('aggregate', function(_, next) {
  console.log(
    `Data analysis took ${Date.now() - this.startTime} milliseconds!`
  );

  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
