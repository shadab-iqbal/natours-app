const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const errorHandler = require('./middlewares/errorHandler');
const routeNotFoundHandler = require('./middlewares/routeNotFoundHandler');

const app = express();

// RATE LIMITER
const limiter = rateLimit({
  max: 3, // max 100 requests
  windowMs: 60 * 60 * 1000, // within 1 hour
  message: 'Too many requests from this IP, please try again in an hour'
});

app.use('/api', limiter); // applicable to all routes starting with /api

// MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors());
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Error handling middleware (will match all routes)
app.all('*', routeNotFoundHandler);

app.use(errorHandler);

module.exports = app;
