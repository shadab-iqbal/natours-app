/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

mongoose
  .connect(process.env.DATABASE_CONNECTION_STRING)
  .then(() => console.log('DB connection successful!'));

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  const time = Date.now();
  console.log('Importing data...');

  try {
    await Tour.create(tours);
    // await User.create(users);
    // await Review.create(reviews);

    console.log(`Data successfully loaded in ${Date.now() - time} ms`);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  const time = Date.now();
  Promise.all([Tour.deleteMany(), User.deleteMany(), Review.deleteMany()])
    .then(() => {
      console.log(`All data successfully cleared in ${Date.now() - time} ms`);
    })
    .catch(err => {
      console.error('Error clearing collections:', err);
    })
    .finally(() => {
      process.exit();
    });
};

const bulkReviews = [
  {
    review: 'Loved the trip!!!',
    rating: 1,
    reviewFor: '66d184a488ee64435c98c92b',
    reviewBy: '5c8a1ec62f8fb814b56fa183'
  },
  {
    review: 'Loved the trip!!!',
    rating: 2,
    reviewFor: '66d184a488ee64435c98c92b',
    reviewBy: '5c8a1ec62f8fb814b56fa183'
  },
  {
    review: 'Loved the trip!!!',
    rating: 3,
    reviewFor: '66d184a488ee64435c98c92b',
    reviewBy: '5c8a1ec62f8fb814b56fa183'
  },
  {
    review: 'Loved the trip!!!',
    rating: 4,
    reviewFor: '66d184a488ee64435c98c92b',
    reviewBy: '5c8a1ec62f8fb814b56fa183'
  },
  {
    review: 'Loved the trip!!!',
    rating: 5,
    reviewFor: '66d184a488ee64435c98c92b',
    reviewBy: '5c8a1ec62f8fb814b56fa183'
  }
];

const createReviewsInBulk = async () => {
  await Review.deleteMany(); // clear the db first
  const time = Date.now();

  try {
    // bulkReviews contains 5 reviews, so we are creating 5 reviews parallely
    // we are doing this 10 times, so creating 50 reviews in total
    for (let i = 0; i < 10; i++) {
      await Review.create(bulkReviews);
    }

    // await Review.create(bulkReviews);

    console.log(
      `All 50 reviews successfully created in ${Date.now() - time} ms`
    );
  } catch (err) {
    console.error('Error creating reviews:', err);
  } finally {
    // process.exit();
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else if (process.argv[2] === '--createReviews') {
  createReviewsInBulk();
}
