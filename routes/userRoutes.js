const express = require('express');
const userContoller = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

//SPECIAL ROUTES || ENDPOINTS
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// FORGOT PASSWORD AND RESET PASSWORD ROUTES
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect remaining routes REMEMBER
router.use(authController.protect);

// UPDATE PASSWORD FOR CURRENTLY LOGGED IN USERS
router.patch('/updateMyPassword', authController.updatePassword);

// /me Endpoint
router.get('/me', userContoller.getMe, userContoller.getUser);

// UPDATE USER DATA FOR CURRENTLY LOGGED IN USERS
router.patch(
  '/updateMe',
  userContoller.uploadUserPhoto,
  userContoller.resizeUserPhoto,
  userContoller.updateMe
);

// DELETE USER ACCOUNT FOR CURRENTLY LOGGED IN USERS
router.delete('/deleteMe', userContoller.deleteMe);

// Restrict Routes to admin only
router.use(authController.restrictTo('admin'));

// REGULAR CRUD ROUTES
router.route('/').get(userContoller.getAllUsers).post(userContoller.createUser);
router
  .route('/:id')
  .get(userContoller.getUser)
  .patch(userContoller.updateUser)
  .delete(userContoller.deleteUser);

module.exports = router;
