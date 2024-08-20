const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

// routes for user
router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forget-password', authController.forgetPassword);
router.post('/reset-password/:token', authController.resetPassword);

router.patch(
  '/update-password',
  authController.isAuthenticated,
  authController.updatePassword
);

router.patch(
  '/update-profile',
  authController.isAuthenticated,
  userController.updateAuthenticatedUser
);

router.delete(
  '/deactivate-account',
  authController.isAuthenticated,
  userController.deleteAuthenticatedUser
);

// routes for admin
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
