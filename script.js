let questions = [];
let currentQuestion = 0;
let userAnswers = []; // Array to store state: { selectedIndex: -1, isSubmitted: false, isMarkedReview: false }

async function startQuiz(filename, title) {
  // Update Title
  if (title) {
    document.getElementById("main-title").textContent = title;
  }

  // Hide start screen
  document.getElementById("start-screen").style.display = "none";

  // Show main container and footer
  document.querySelector(".main-container").style.display = "block";
  document.querySelector("footer").style.display = "flex";

  // Reset current question index
  currentQuestion = 0;

  // Load questions
  await loadQuestions(filename);
}

async function loadQuestions(filename) {
  try {
    const response = await fetch(filename);
    questions = await response.json();
    // Initialize userAnswers
    userAnswers = new Array(questions.length)
      .fill(null)
      .map(() => ({
        selectedIndex: -1,
        isSubmitted: false,
        isMarkedReview: false,
      }));

    document.getElementById("total-questions").textContent = questions.length;

    // Checkbox Event Listener
    document.getElementById("review-later").onchange = (e) => {
      userAnswers[currentQuestion].isMarkedReview = e.target.checked;
    };

    showQuestion();
  } catch (error) {
    console.error("問題の読み込みエラー:", error);
    alert("問題の読み込みに失敗しました。");
    returnToTitle();
  }
}

function showQuestion() {
  const container = document.querySelector(".main-container");
  const footer = document.querySelector("footer");

  if (currentQuestion >= questions.length) {
    showSummary();
    return;
  }

  // Restore main container if coming back from summary
  if (container.classList.contains("summary-mode")) {
    container.classList.remove("summary-mode");
    footer.style.display = "flex";

    container.innerHTML = `
      <div class="question-section">
        <h2 id="question"></h2>
        <pre id="code-sample" style="display: none;"></pre>
        <div id="execution-section" style="display: none;">
          <p class="execution-label">【期待する結果】</p>
          <div id="execution-result" class="execution-result-box"></div>
        </div>
      </div>
      <div id="options" class="options-list"></div>
      <div id="result" style="display: none;"></div>
      <div id="explanation" style="display: none;"></div>
    `;
  }

  const q = questions[currentQuestion];
  const currentState = userAnswers[currentQuestion];

  // Update Progress
  document.getElementById("current-question-num").textContent =
    currentQuestion + 1;
  document.getElementById("review-later").checked = currentState.isMarkedReview;

  // Question Text
  document.getElementById("question").textContent =
    `問題${currentQuestion + 1}: ${q.question}`;

  // Code Sample
  const codeSample = document.getElementById("code-sample");
  if (q.codeSample) {
    codeSample.textContent = q.codeSample;
    codeSample.style.display = "block";
  } else {
    codeSample.style.display = "none";
  }

  // Execution Result
  const executionSection = document.getElementById("execution-section");
  const executionResultDiv = document.getElementById("execution-result");

  if (q.executionResult) {
    executionResultDiv.textContent = q.executionResult;
    executionSection.style.display = "block";
  } else {
    executionSection.style.display = "none";
  }

  // Options
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  q.options.forEach((opt, index) => {
    const btn = document.createElement("div");
    btn.classList.add("option");
    btn.textContent = opt;

    // Restore selection state
    if (currentState.selectedIndex === index) {
      btn.classList.add("selected");
    }

    // Apply result styles if submitted
    if (currentState.isSubmitted) {
      if (index === q.correctIndex) btn.classList.add("correct");
      if (index === currentState.selectedIndex && index !== q.correctIndex)
        btn.classList.add("incorrect");
      btn.style.cursor = "default";
    } else {
      btn.onclick = () => selectOption(index);
    }

    optionsDiv.appendChild(btn);
  });

  // UI State
  const summaryBtn = document.getElementById("summary-btn");
  const nextBtn = document.getElementById("next");
  const prevBtn = document.getElementById("prev");
  const resultDiv = document.getElementById("result");
  const expDiv = document.getElementById("explanation");

  // Prev Button visibility
  prevBtn.style.visibility = currentQuestion > 0 ? "visible" : "hidden";

  // Summary Button always visible
  summaryBtn.style.display = "block";

  // Next Button always visible
  nextBtn.style.display = "block";
  if (currentQuestion === questions.length - 1) {
    nextBtn.textContent = "終了・一覧へ";
  } else {
    nextBtn.textContent = "次へ";
  }

  if (currentState.isSubmitted) {
    // Show Results
    resultDiv.textContent =
      currentState.selectedIndex === q.correctIndex ? "正解！" : "不正解";
    resultDiv.style.display = "block";
    expDiv.textContent = q.explanation;
    expDiv.style.display = "block";
  } else {
    // Hide results
    resultDiv.style.display = "none";
    expDiv.style.display = "none";
  }
}

function showSummary() {
  const container = document.querySelector(".main-container");
  container.classList.add("summary-mode");

  let html = '<h2>問題一覧</h2><div class="summary-list">';

  questions.forEach((q, index) => {
    const state = userAnswers[index];
    const isReview = state.isMarkedReview ? "review-highlight" : "";

    let statusHTML = "";
    if (state.isMarkedReview) {
      statusHTML += '<span class="status-badge review">【見直し】</span> ';
    }

    if (!state.isSubmitted) {
      statusHTML += '<span class="status-badge unanswered">【未回答】</span>';
    } else if (state.selectedIndex === q.correctIndex) {
      statusHTML += '<span class="status-badge correct">【正解】</span>';
    } else {
      statusHTML += '<span class="status-badge incorrect">【不正解】</span>';
    }

    const shortText =
      q.question.length > 30 ? q.question.substring(0, 30) + "..." : q.question;

    html += `
      <div class="summary-item ${isReview}" onclick="jumpToQuestion(${index})">
        <span class="summary-num">問${index + 1}</span>
        <span class="summary-text">${shortText}</span>
        <span class="summary-status">${statusHTML}</span>
      </div>
    `;
  });

  html += "</div>";

  html += `
    <div style="text-align: center; margin-top: 20px;">
        <button class="nav-btn" onclick="returnToTitle()">タイトルに戻る</button>
    </div>
  `;

  container.innerHTML = html;

  document.querySelector("footer").style.display = "none"; // Hide nav buttons in summary
}

function returnToTitle() {
  document.getElementById("start-screen").style.display = "flex";
  document.querySelector(".main-container").style.display = "none";
  document.querySelector("footer").style.display = "none";
  document.getElementById("main-title").textContent = "Python知識確認テスト";
}

function jumpToQuestion(index) {
  currentQuestion = index;
  showQuestion();
}

function selectOption(index) {
  if (userAnswers[currentQuestion].isSubmitted) return;

  userAnswers[currentQuestion].selectedIndex = index;

  // Update UI Selection
  const options = document.querySelectorAll(".option");
  options.forEach((opt, i) => {
    opt.classList.remove("selected");
    if (i === index) opt.classList.add("selected");
  });
}

// Summary Button Click -> Show Summary
document.getElementById("summary-btn").onclick = () => {
  showSummary();
};

// Next Button Click -> Submit (if selected) OR Skip (if not selected) OR Next (if submitted)
document.getElementById("next").onclick = () => {
  const currentState = userAnswers[currentQuestion];

  // Case 1: Already submitted -> Move to next question
  if (currentState.isSubmitted) {
    if (currentQuestion < questions.length) {
      currentQuestion++;
      showQuestion(); // This handles showing summary if currentQuestion >= questions.length
    }
    return;
  }

  // Case 2: Not submitted
  if (currentState.selectedIndex !== -1) {
    // Option selected -> Submit (Show Result)
    currentState.isSubmitted = true;
    showQuestion(); // Re-render to show result
  } else {
    // No option selected -> Skip (Move to next)
    if (currentQuestion < questions.length) {
      currentQuestion++;
      showQuestion();
    }
  }
};

document.getElementById("prev").onclick = () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    showQuestion();
  }
};
// Start Quiz Button
document.getElementById('start-quiz-btn').onclick = () => {
  const select = document.getElementById('course-select');
  const filename = select.value;
  const title = select.options[select.selectedIndex].text;
  startQuiz(filename, title);
};
// Initialize
// loadQuestions(); // Removed: Started by startQuiz from HTML
