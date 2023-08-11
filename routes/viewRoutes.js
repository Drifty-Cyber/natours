const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// This places this middleware before all routes
// router.use(authController.isLoggedIn);

router.get(
  '/',
  // bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);

// Get Tour
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

// LOGIN ROUTE
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);

// USER PROFILE
router.get('/me', authController.protect, viewController.getAccount);

// VIEW BOOKINGS
router.get('/my-tours', authController.protect, viewController.getMyTours);

// TRADITIONAL FORM "POST" SUBMISSION TO UPDATE USER DATA
router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);

module.exports = router;
