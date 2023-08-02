const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//name, email, photo, password, passwordConfirm
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        //THIS ONLY WORKS ON CREATE & SAVE!!!
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// ENCRYPTING PASSWORDS
userSchema.pre('save', async function (next) {
  //GUARD CLAUSE TO ONLY RUN THIS FUNCTION IF PASSWORD IS MODIFIED
  if (!this.isModified('password')) return next();

  //HASH THE PASSWORD WITH COST OF 12
  this.password = await bcrypt.hash(this.password, 12);

  //REMOVE UNHASHED PASSWORDCONFIRM FROM DB BY SETTING TO UNDEFINED
  this.passwordConfirm = undefined;
  next();
});

// MIDDLEWARE TO SET 'passwordChangedAt' PROPERTY
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

// QUERY MIDDLEWARE TO HIDE INACTIVE ACCOUNTS
userSchema.pre(/^find/, function (next) {
  // "this" keyword points to the current query
  // Using $ne: false because other documents don't have "active" set to true explicitly
  this.find({ active: { $ne: false } });
  next();
});

// INSTANCE METHOD TO COMPARE PASSWORDS (PASSWORD IN DOCUMENT AND PASSWORD USER PROVIDES TO LOGIN)
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// INSTANCE METHOD TO CHECK IF USER HAS CHANGED PASSWORD AFTER JWT WAS ISSUED
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  //False means NOT Changed
  return false;
};

// INSTANCE TO CREATE PASSWORD RESET TOKEN
userSchema.methods.createPasswordResetToken = function () {
  // Generate resetToken String
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hashing the resetToken
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  // Setting time limit to resetToken usability
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

//MODEL
const User = mongoose.model('User', userSchema);

module.exports = User;
