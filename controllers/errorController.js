const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  // console.log(err);
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationerrorDB = (err) => {
  const errors = Object.values(err.errors).map((errObj) => errObj.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please login again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // B) RENDERED WEBSITE
  console.error('Error 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // A) Operational errors: send message to client
  if (req.originalUrl.startsWith('/api')) {
    // API
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming error: Do not send message || do not leak details to the client
    //1) Log error to console
    console.error('Error 💥', err);

    //2) Send generic message to client
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  // B) RENDERED WEBSITE
  // A) Operational errors: send message to client
  if (err.isOperational) {
    // console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
  //Programming error: Do not send message || do not leak details to the client
  //1) Log error to console
  console.error('Error 💥', err);
  //2) Send generic message to client
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later!',
  });
};

module.exports = (err, req, res, next) => {
  //   console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // console.log(err);
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationerrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
