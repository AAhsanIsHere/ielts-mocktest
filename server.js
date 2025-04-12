const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/User');
const Test = require('./models/test-list');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'ieltsSecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: false
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
    res.redirect('/test-list'); // ✅ You kept this route for listing available tests
  } else {
    res.send(`<p>Invalid credentials. <a href="/">Try again</a></p>`);
  }
});

app.get('/user-info', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  res.json({ name: req.session.user.name });
});

app.get('/test-list', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'views', 'test-list.html'));
});

// ✅ Route that fetches test data based on testNumber
app.get('/test/:testNumber', async (req, res) => {
  const testNumber = req.params.testNumber;

  try {
    const test = await Test.findOne({ testNumber });
    if (!test) {
      return res.status(404).send('Test not found');
    }

    res.json({
      testNumber: test.testNumber,
      passages: [
        {
          title: `Passage for Test ${test.testNumber}`,
          text: test.passage,
          questions: test.questions.map((q, i) => ({
            id: `q${i + 1}`,
            text: q.questionText,
            answer: q.answer.toUpperCase()
          }))
        }
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
