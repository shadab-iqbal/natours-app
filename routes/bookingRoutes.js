const express = require('express');

const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
const stripeHandler = require('../middlewares/stripeHandler');

const router = express.Router();

router.use(authController.isAuthenticated);

router.get('/checkout-session/:tourId', stripeHandler.getCheckoutSession);

router.get('/my-booked-tours', bookingController.getMyTours);

router.use(authController.isAuthorized(['admin', 'lead-guide']));

// router
//   .route('/')
//   .get(bookingController.getAllBookings)
//   .post(bookingController.createBooking);

module.exports = router;
