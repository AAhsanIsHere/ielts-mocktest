document.addEventListener("DOMContentLoaded", () => {
  const testList = document.getElementById("testList");

  // Static test data (manually added)
  const tests = [
    { testNumber: 1, title: "IELTS Mock Test 1" },
    { testNumber: 2, title: "IELTS Mock Test 2" },
    { testNumber: 3, title: "IELTS Mock Test 3" },
    { testNumber: 4, title: "IELTS Mock Test 4" }
  ];

  if (tests.length === 0) {
    testList.innerHTML = "<li>No tests available at the moment.</li>";
    return;
  }

  // Render the test list dynamically
  tests.forEach(test => {
    const li = document.createElement("li");
    li.classList.add("test-item");

    // Add link for each test
    li.innerHTML = `<a href="/take-test.html?test=${test.testNumber}">${test.title}</a>`;
    
    // Append to the list
    testList.appendChild(li);
  });
});
