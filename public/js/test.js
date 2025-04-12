const urlParams = new URLSearchParams(window.location.search);
const testNumber = parseInt(urlParams.get("test")) || 1;


let currentPassage = 0;
let userAnswers = {};
let isSubmitted = false;
let timerInterval;
let totalSeconds = 60 * 60; // 1 hour
let testData = {};

// Initialize the test when the page loads
window.addEventListener("DOMContentLoaded", () => {
  loadTestData();
  timerInterval = setInterval(updateTimer, 1000);
});

// Timer update function
function updateTimer() {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  document.getElementById("timer").textContent = `Time left: ${minutes}:${seconds}`;

  if (totalSeconds <= 0) {
    clearInterval(timerInterval);
    alert("Time's up!");
    submitAnswers();
  } else {
    totalSeconds--;
  }
}

// Load test data from backend
async function loadTestData() {
  try {
    const response = await fetch(`/test-list/${testNumber}`);
    testData = await response.json();

    if (!testData || !testData.passages || testData.passages.length === 0) {
      alert('Test not found!');
      return;
    }

    loadPassage(currentPassage);
  } catch (error) {
    console.error('Error loading test data:', error);
    alert('Failed to load test data.');
  }
}

// Load a single passage and its questions
function loadPassage(index) {
  const passage = testData.passages[index];
  const passagePane = document.getElementById('passage-pane');
  const questionList = document.getElementById('question-list');
  const resultsDiv = document.getElementById('results');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');

  // Set passage content
  passagePane.innerHTML = `<h2>${passage.title}</h2><p>${passage.text}</p>`;
  questionList.innerHTML = "";

  // Render questions
  passage.questions.forEach(q => {
    const li = document.createElement("li");
    li.innerHTML = `
      <label>${q.text}</label><br>
      <input type="text" id="${q.id}" value="${userAnswers[q.id] || ""}" ${isSubmitted ? "disabled" : ""}>
    `;
    questionList.appendChild(li);
  });

  // Add input listeners (if not submitted)
  if (!isSubmitted) {
    passage.questions.forEach(q => {
      const input = document.getElementById(q.id);
      input.addEventListener("input", () => {
        userAnswers[q.id] = input.value;
      });
    });
  }

  // Navigation and submit button logic
  prevBtn.style.display = index === 0 ? "none" : "inline-block";
  nextBtn.style.display = index === testData.passages.length - 1 ? "none" : "inline-block";
  submitBtn.style.display = (!isSubmitted && index === testData.passages.length - 1) ? "inline-block" : "none";

  // Show results if submitted
  resultsDiv.innerHTML = (isSubmitted && index === testData.passages.length - 1)
    ? document.getElementById("results").innerHTML
    : "";
}

// Navigate to next/previous passage
function changePassage(direction) {
  const newIndex = currentPassage + direction;
  if (newIndex >= 0 && newIndex < testData.passages.length) {
    currentPassage = newIndex;
    loadPassage(currentPassage);
  }
}

// Submit answers and calculate score
function submitAnswers() {
  isSubmitted = true;
  clearInterval(timerInterval);

  let score = 0;
  let total = 0;
  let resultText = "";

  testData.passages.forEach(passage => {
    passage.questions.forEach(q => {
      const answer = (userAnswers[q.id] || "").trim().toUpperCase();
      if (answer === q.answer) {
        score++;
      } else {
        resultText += `${q.text} — Correct: "${q.answer}"<br>`;
      }
      total++;
    });
  });

  const finalResult = `Your score: ${score}/${total}<br><br>${resultText}`;
  document.getElementById("results").innerHTML = finalResult;

  // Reload the passage to disable inputs
  loadPassage(currentPassage);
}
