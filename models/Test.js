const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: String,
  answer: String
});

const testSchema = new mongoose.Schema({
  testNumber: Number,
  passage: String,
  questions: [questionSchema]
});

module.exports = mongoose.model('Test', testSchema);
