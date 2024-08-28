const express = require('express');

const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// Route for /:tourId/reviews
router.use('/:tourId/reviews', reviewRouter);

// Route for '/top-5-cheap'
router.get(
  '/top-5-cheap',
  tourController.aliasTopTours,
  tourController.getAllTours
);

// Route for '/tour-stats'
router.get('/tour-stats', tourController.getTourStats);

// Route for '/monthly-plan/:year'
router.get('/monthly-plan/:year', tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.isAuthenticated, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.isAuthenticated,
    authController.isAuthorized(['admin', 'lead-guide']),
    tourController.updateTour
  )
  .delete(tourController.deleteTour);

module.exports = router;
