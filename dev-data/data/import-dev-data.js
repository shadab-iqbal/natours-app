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

  Promise.all([Tour.create(tours), User.create(users), Review.create(reviews)])
    .then(() => {
      console.log(`Data successfully loaded in ${Date.now() - time} ms`);
    })
    .catch(err => {
      console.error('Error clearing collections:', err);
    })
    .finally(() => {
      process.exit();
    });
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

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
