/* eslint-disable no-console */
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const controllerFactory = require('../utils/controllerFactory');
const AppError = require('../utils/appError');

// Create a booking after a successful checkout
exports.createBookingAfterPayment = async session => {
  try {
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.amount_total / 100;

    await Tour.findByIdAndUpdate(tour, {
      $inc: { 'startDates.0.participants': 1 }
    });

    await Booking.create({ tour, user, price });
  } catch (error) {
    console.log('FAILED TO CREATE BOOKING', error);
  }
};

// Get all bookings made by the currently authenticated user
exports.getMyTours = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id });
    const tourIds = bookings.map(booking => booking.tour);
    // Get all tours that the user has booked
    const tours = await Tour.find({ _id: { $in: tourIds } });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (error) {
    return next(error);
  }
};

// Check if the selected start date has empty slots
exports.checkAvailability = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.tourId);

    if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
    }

    const bookedDate = tour.startDates.find(
      item => item.date.toISOString().split('T')[0] === req.params.startDate
    );

    if (!bookedDate || bookedDate.participants === tour.maxGroupSize) {
      return next(new AppError('No available slots for that date', 409));
    }

    return next();

    // return res.status(200).json({
    //   data: bookedDate
    // });
  } catch (error) {
    return next(error);
  }
};

exports.getAllBookings = controllerFactory.getAll(Booking);
exports.getBooking = controllerFactory.getOne(Booking);
exports.createBooking = controllerFactory.createOne(Booking);
exports.updateBooking = controllerFactory.updateOne(Booking);
exports.deleteBooking = controllerFactory.deleteOne(Booking);
