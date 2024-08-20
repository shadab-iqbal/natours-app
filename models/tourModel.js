/* eslint-disable no-console */
const mongoose = require('mongoose');
const slugify = require('slugify');
const { isAscii } = require('validator');

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
      default: 5,
      min: [1, 'Rating must be 1 or more'],
      max: [5, 'Rating must be 5 or less']
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
    }
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
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
  this.start = Date.now();

  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`\nQuery took ${Date.now() - this.start} milliseconds!\n`);

  next();
});

tourSchema.pre('aggregate', function(next) {
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
