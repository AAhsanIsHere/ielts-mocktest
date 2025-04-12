document.addEventListener("DOMContentLoaded", async () => {
  const testList = document.getElementById("testList");

  try {
    const res = await fetch("/api/tests");
    const tests = await res.json();

    tests.forEach(test => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="/take-test.html?test=${test.testNumber}">Test ${test.testNumber}</a>`;
      testList.appendChild(li);
    });
  } catch (error) {
    console.error("Failed to load tests", error);
    testList.innerHTML = "<li>Failed to load test list.</li>";
  }
});
