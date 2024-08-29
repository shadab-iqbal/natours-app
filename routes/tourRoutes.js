const express = require('express');

const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// Route for /:tourId/reviews
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.isAuthenticated,
    authController.isAuthorized(['admin', 'lead-guide']),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.isAuthenticated,
    authController.isAuthorized(['admin', 'lead-guide']),
    tourController.updateTour
  )
  .delete(
    authController.isAuthenticated,
    authController.isAuthorized(['admin', 'lead-guide']),
    tourController.deleteTour
  );

// Route for '/top-5-cheap'
router.get(
  '/stats/top-5-cheap',
  tourController.aliasTopTours,
  tourController.getAllTours
);

// Route for '/tour-stats'
router.get('/stats/tour-stats', tourController.getTourStats);

// Route for '/monthly-plan/:year'
router.get(
  '/stats/monthly-plan/:year',
  authController.isAuthenticated,
  authController.isAuthorized(['admin', 'lead-guide', 'guide']),
  tourController.getMonthlyPlan
);

module.exports = router;
