const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

// SETTING UP PUG
app.set('view engine', 'pug');
// SETTING UP THE VIEWS FOLDER FOR MVC
app.set('views', path.join(__dirname, 'views'));

//GLOBAL MIDDLEWARES

//SERVING STATIC FILES
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Helmet - Set security http headers
// app.use(helmet());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
      },
    },
  })
);

// Morgan - Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting Middleware
// 100 Requests per hour
const limiter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//Body Parser (Limit amount of data passed into body)
app.use(express.json({ limit: '10kb' }));

// Parse form data
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  })
);

// Parse cookies
app.use(cookieParser());

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//CUSTOM MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

//ROUTES
//MOUNTING THE ROUTER
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// UNSPECIFIED ROUTES
app.all('*', (req, res, next) => {
  //REMEMBER LEGACY CODE
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = 'fail';

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

//EXPORT APP
module.exports = app;
