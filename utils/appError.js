class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode.toString().startsWith('4') ? 'fail' : 'error';

    // Operational errors are errors that are not programming errors
    // This property will help us to know the error type at the time of debugging
    this.isOperational = true;

    // This will remove the constructor from the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
