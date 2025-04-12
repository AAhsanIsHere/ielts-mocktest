const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/User');
const Test = require('./models/test'); // renamed from Test.js to test.js
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Sessions
app.use(session({
  secret: 'ieltsSecret', // Replace with a strong secret
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: false // set true only if using HTTPS
  }
}));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password });
  if (user) {
    req.session.user = user;
    res.redirect('/test-list'); // changed from /tests-list to /test-list
  } else {
    res.send(`<p>Invalid credentials. <a href="/">Try again</a></p>`);
  }
});

app.get('/user-info', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  res.json({
    name: req.session.user.name
  });
});

app.get('/test-list', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'views', 'test-list.html')); // adjusted to match renamed file
});

app.get('/test/:testNumber', async (req, res) => {
  const testNumber = req.params.testNumber;

  try {
    const test = await Test.findOne({ testNumber });
    if (!test) {
      return res.status(404).send('Test not found');
    }

    res.json(test);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
