const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// User needs to be authenticated to access the following routes
router.use(authController.isAuthenticated);

router
  .route('/')
  .get(reviewController.setFilterOptions, reviewController.getAllReviews)
  .post(
    authController.isAuthorized(['user']),
    reviewController.setTourUserIds,
    reviewController.canReview,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authController.isAuthorized(['user']), reviewController.updateReview)
  .delete(
    authController.isAuthorized(['user', 'admin']),
    reviewController.deleteReview
  );

module.exports = router;
