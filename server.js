const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/User');
const Test = require('./models/Test');  // Import the Test model
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'ieltsSecret',
    resave: false,
    saveUninitialized: true
}));

// Routes

// Login page route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Login authentication route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    if (user) {
        req.session.user = user;
        res.redirect('/tests');
    } else {
        res.send(`<p>Invalid credentials. <a href="/">Try again</a></p>`);
    }
});

// Route to get user info (for use in tests.html)
app.get('/user-info', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  // Send the user data (name, email, etc.)
  res.json({
    name: req.session.user.name // Adjust this based on your User model
  });
});

// Tests page route (Only accessible after login)
app.get('/tests', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'views', 'tests.html'));
});

// Route to serve test page with test data
app.get('/test/:testNumber', async (req, res) => {
    const testNumber = req.params.testNumber;

    try {
        const test = await Test.findOne({ testNumber: testNumber });
        
        if (!test) {
            return res.status(404).send('Test not found');
        }

        res.json(test);  // Send test data in JSON format
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
