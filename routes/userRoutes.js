const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

// routes for user
router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forget-password', authController.forgetPassword);
router.post('/reset-password/:token', authController.resetPassword);

// User needs to be authenticated to access the following routes
router.use(authController.isAuthenticated);

router.patch('/update-password', authController.updatePassword);

router.get(
  '/my-profile',
  userController.getAuthenticatedUser,
  userController.getUser
);

router.patch('/update-profile', userController.updateAuthenticatedUser);

router.delete(
  '/deactivate-account',
  userController.deactivateAuthenticatedUser
);

// User needs to be admin to access the following routes
router.use(authController.isAuthorized(['admin']));

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
