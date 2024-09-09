const express = require('express');

const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const fileUpload = require('./../middlewares/fileUpload');
const processUploadedFile = require('./../middlewares/processUploadedFile');

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
    fileUpload.fields([
      { name: 'imageCover', maxCount: 1 },
      { name: 'images', maxCount: 3 }
    ]),
    processUploadedFile.processTourImages,
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

// will give tours within a certain distance from a certain point
router.get(
  '/tours-nearby/distance-km/:distance/center/:latlng',
  tourController.getNearbyTours
);

// will give the distances of all tours from a certain point
router.get('/tours-distances-km/:latlng', tourController.getTourDistances);

module.exports = router;
