const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorHandler');
const routeNotFoundHandler = require('./middlewares/routeNotFoundHandler');

const app = express();

// Add security-related HTTP headers to the response
app.use(helmet());

// Enable Cross-Origin Resource Sharing (CORS) to allow requests from other domains
app.use(cors());

// Parse cookies attached to the client request
app.use(cookieParser());

// Apply rate limiting to prevent DOS attacks from the same IP
const limiter = rateLimit({
  max: 100, // max 100 requests
  windowMs: 60 * 60 * 1000, // within 1 hour
  message: 'Too many requests from this IP, please try again in an hour'
});
app.use('/api', limiter); // applicable to all routes starting with /api

// Enable logging of HTTP requests in the console when in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Parse incoming JSON requests and populate req.body with the parsed data
app.use(express.json({ limit: '10kb' })); // limit the payload to 10kb

// Sanitize data against NoSQL query injection
app.use(mongoSanitize());

// Sanitize data against XSS attacks
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(
  hpp({
    // Allow duplicate query parameters for the following fields
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Serve static files from the "public" directory (e.g., images, CSS files, JavaScript files)
app.use(express.static(`${__dirname}/public`));

// API Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Error Handling Middlewares
app.all('*', routeNotFoundHandler); // Handle undefined routes
app.use(errorHandler); // Handle all errors

module.exports = app;
