const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Card = require('./models/Card');
require('dotenv').config({ path: 'mo.env' });

const app = express();
app.set('view engine', 'ejs');

mongoose.connect('mongodb://127.0.0.1:27017/epicearnings', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });

      if (!user) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Define the ensureAuthenticated middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); // User is authenticated, continue to the next middleware or route handler
  }
  // Redirect to the login page if the user is not authenticated
  res.redirect('/');
}

app.get('/', (req, res) => {
  res.render('login_register', { isLogin: true });
});

app.post('/register', async (req, res) => {
  // Registration logic
  // ...

  res.render('success');
});

// Login route and logic
app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/',
}));

// Protected route - Dashboard
app.get('/dashboard', async (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user;
    const card = await Card.findOne({ user: user._id });
    res.render('dashboard', { user, card });
  } else {
    res.redirect('/');
  }
});

// Add Card route
app.get('/add-card', ensureAuthenticated, (req, res) => {
  res.render('add-card', { user: req.user });
});

// Save Card route
app.post('/save-card', async (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user;
    // Save card logic here
    // ...

    res.redirect('/dashboard');
  } else {
    res.redirect('/');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Other routes and app.listen code can go here

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
