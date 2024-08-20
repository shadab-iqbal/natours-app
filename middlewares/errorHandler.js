/* eslint-disable no-console */
const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;

  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = err => {
  return new AppError('Invalid token. Please log in again!', 401);
};

const handleJWTExpiredError = err => {
  return new AppError('Your token has expired! Please log in again.', 401);
};

const handleLargePayloadError = err => {
  return new AppError(
    'The request payload is too large. Please limit the size of the payload!',
    413
  );
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.message = err.message || 'Something went wrong';

  // sending as much error details as possible in development mode
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  }

  if (process.env.NODE_ENV === 'production') {
    // for the below 3 types of errors, we will modify the error object
    // to have a more user-friendly error message and status code

    // when the id is invalid, or the data type of a field is invalid
    if (err.name === 'CastError') {
      err = handleCastErrorDB(err);
    }

    // when the value of a unique field is duplicate
    else if (err.code === 11000) {
      err = handleDuplicateFieldsDB(err);
    }

    // when the data doesn't pass the validation of the schema
    else if (err.name === 'ValidationError') {
      err = handleValidationErrorDB(err);
    }

    // when the JWT token is invalid
    else if (err.name === 'JsonWebTokenError') {
      err = handleJWTError(err);
    }

    // when the JWT token has expired
    else if (err.name === 'TokenExpiredError') {
      err = handleJWTExpiredError(err);
    }

    // when the payload is too large
    else if (err.name === 'PayloadTooLargeError') {
      err = handleLargePayloadError(err);
    }

    // if the error is an instance of the AppError class
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }

    // else, when the error is a programming error
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};
