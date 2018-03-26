const express = require('express');
const  path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const paypal = require('paypal-rest-sdk')



const userRoutes = require('./routes/user.routes');
const sessionRoutes = require('./routes/session.routes');
const campaignRoutes = require('./routes/campaign.routes');
const donationRoutes = require('./routes/donation.routes');

const app = express();

// config
require('dotenv').config();
require('./configs/db.config');
require('./configs/paypal.config');
require('./configs/passport.config').setup(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.COOKIE_SECRET || 'Super Secret',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 1000
  },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60
  })
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/users', userRoutes );
app.use('/sessions', sessionRoutes );
app.use('/campaigns', campaignRoutes );
app.use('/', donationRoutes );

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'Aa7GX-HChZfUEUjgFYIJqTS64BQHABs_gUlW3bqLnPut9kT9Tk_naKAaccYazKn-Pyb-a-7biWsLJ4tb',
  'client_secret': 'EEXpsbrP5AVCqxmqK4mLuhHs2o7bKsSjwGydmohV4z04iT-psvRN5P6q_4cDKj7VhUW1uU0FqkzGjtej'
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
