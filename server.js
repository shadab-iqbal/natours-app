/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// Globally handling sync and async errors which are outside of express

const handleFatalError = err => {
  console.error(`\n${err.name}, ${err.message}\n`);
  console.error(`❌ Server shutting down...\n`);
  process.exit(1);
};

process.on('uncaughtException', handleFatalError); // sync errors
process.on('unhandledRejection', handleFatalError); // async errors

const app = require('./app');

async function startApp() {
  try {
    // Connecting to MongoDB Atlas
    console.log('------------');
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.DATABASE_CONNECTION_STRING);
    console.log('DB connection successful!');

    // Starting the Express app
    const port = process.env.PORT || 5001;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log('------------');
    });
  } catch (err) {
    handleFatalError(err);
  }
}

startApp();
