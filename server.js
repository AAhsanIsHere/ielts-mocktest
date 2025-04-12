// server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/User');
const Test = require('./models/test-list');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ✅ Middleware setup
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
    secure: false,
  },
}));

// ✅ Routes

// Home/Login Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Login Page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Handle Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user) {
      req.session.user = user;
      res.redirect('/test-list');
    } else {
      res.send('<p>Invalid credentials. <a href="/">Try again</a></p>');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Protected route: test list
app.get('/test-list', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'views', 'test-list.html'));
});

// ✅ API: Get all test numbers
app.get('/api/tests', async (req, res) => {
  try {
    const tests = await Test.find({}, 'testNumber').sort({ testNumber: 1 });
    res.json(tests);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ✅ API: Fetch specific test by testNumber
app.get('/test-list/:testNumber', async (req, res) => {
  const testNumber = parseInt(req.params.testNumber);

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

// ✅ Serve take-test.html page for dynamic test loading
app.get('/take-test.html', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'take-test.html'));
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
