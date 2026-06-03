const ruleTabs = document.querySelectorAll(".rule-tab");
const ruleCards = document.querySelectorAll(".rule-card");

const filterRuleCards = (filter) => {
  ruleCards.forEach((card) => {
    const shouldShow = card.dataset.category === filter;
    card.style.display = shouldShow ? "flex" : "none";
  });
};

ruleTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const filter = tab.dataset.filter;

    ruleTabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");

    filterRuleCards(filter);
  });
});

const activeTab = document.querySelector(".rule-tab.active");

if (activeTab) {
  filterRuleCards(activeTab.dataset.filter);
}

const quizData = [
  {
    id: 1,
    category: "ACCOUNT",
    question: "모든 사이트에서 같은 비밀번호를 사용해도 안전하다.",
    answer: false,
    explanation:
      "같은 비밀번호를 여러 사이트에서 사용하면 한 사이트가 해킹되었을 때 다른 계정까지 위험해질 수 있습니다. 서비스마다 다른 비밀번호를 사용하고, 비밀번호 관리자를 활용하면 더 안전하게 관리할 수 있습니다.",
  },
  {
    id: 2,
    category: "ACCOUNT",
    question:
      "2단계 인증을 설정하면 비밀번호가 유출되어도 계정 보호에 도움이 된다.",
    answer: true,
    explanation:
      "2단계 인증은 비밀번호 외에 추가 확인 절차를 요구하므로 계정 탈취 위험을 줄여줍니다. 이메일, 금융, 클라우드처럼 중요한 계정에는 반드시 설정하는 것이 좋습니다.",
  },
  {
    id: 3,
    category: "PHISHING",
    question: "출처가 불분명한 첨부파일은 열기 전에 먼저 확인해야 한다.",
    answer: true,
    explanation:
      "출처가 불분명한 첨부파일에는 악성코드나 피싱 링크가 포함될 수 있습니다. 보낸 사람과 파일 목적을 확인하고, 의심스러우면 실행하지 않는 습관이 중요합니다.",
  },
  {
    id: 4,
    category: "DEVICE",
    question:
      "공용 와이파이에서는 민감한 결제나 개인정보 입력을 피하는 것이 좋다.",
    answer: true,
    explanation:
      "공용 네트워크는 누가 관리하는지 알기 어렵고 통신 내용이 노출될 위험이 있습니다. 금융 거래나 개인정보 입력이 필요하다면 모바일 데이터나 신뢰할 수 있는 네트워크를 사용하는 것이 안전합니다.",
  },
  {
    id: 5,
    category: "DATA",
    question: "브라우저에 보안 경고가 떠도 급하면 무시하고 접속해도 괜찮다.",
    answer: false,
    explanation:
      "브라우저 보안 경고는 인증서 문제, 위조 사이트, 암호화 오류처럼 실제 위험을 알려주는 신호일 수 있습니다. 경고가 표시되면 접속을 멈추고 주소와 사이트 신뢰성을 다시 확인해야 합니다.",
  },
  {
    id: 6,
    category: "ACCOUNT",
    question: "비밀번호는 이름이나 생일처럼 기억하기 쉬운 정보로 만드는 것이 좋다.",
    answer: false,
    explanation:
      "이름, 생일, 전화번호처럼 쉽게 추측 가능한 정보는 공격자가 먼저 시도하는 조합입니다. 길고 예측하기 어려운 비밀번호를 사용하고, 가능하면 문장형 비밀번호나 관리자를 활용하는 것이 좋습니다.",
  },
  {
    id: 7,
    category: "DEVICE",
    question: "운영체제와 앱 보안 업데이트는 미루지 않는 것이 좋다.",
    answer: true,
    explanation:
      "보안 업데이트는 이미 알려진 취약점을 막기 위해 제공됩니다. 업데이트를 오래 미루면 공격자가 공개된 취약점을 이용할 가능성이 커지므로 가능한 빨리 적용해야 합니다.",
  },
  {
    id: 8,
    category: "PHISHING",
    question: "급한 결제나 경품 당첨을 알리는 링크는 먼저 주소를 확인해야 한다.",
    answer: true,
    explanation:
      "피싱 메시지는 사용자가 서두르게 만들어 링크를 누르게 하는 경우가 많습니다. 링크를 바로 누르기보다 공식 사이트 주소를 직접 입력하거나 발신자를 확인하는 습관이 필요합니다.",
  },
  {
    id: 9,
    category: "DATA",
    question: "중요한 파일은 한 곳에만 저장해도 충분하다.",
    answer: false,
    explanation:
      "파일을 한 곳에만 저장하면 기기 고장, 분실, 랜섬웨어 피해가 발생했을 때 복구하기 어렵습니다. 중요한 자료는 클라우드와 외장 저장장치 등 여러 위치에 백업하는 것이 안전합니다.",
  },
  {
    id: 10,
    category: "DATA",
    question: "개인정보가 담긴 오래된 파일은 필요 없으면 삭제하는 것이 좋다.",
    answer: true,
    explanation:
      "불필요한 개인정보 파일을 계속 보관하면 유출될 수 있는 정보의 양이 늘어납니다. 사용이 끝난 민감한 파일은 삭제하고, 계정이나 기기에 남은 정보도 정기적으로 점검하는 것이 좋습니다.",
  },
];

const quizQuestionNumber = document.getElementById("quiz-question-number");
const quizCard = document.querySelector(".quiz-card");
const quizStatusRow = document.getElementById("quiz-status-row");
const quizProgress = document.getElementById("quiz-progress");
const quizProgressTrack = document.getElementById("quiz-progress-track");
const quizProgressFill = document.getElementById("quiz-progress-fill");
const quizStart = document.getElementById("quiz-start");
const quizStartBtn = document.getElementById("quiz-start-btn");
const quizCategory = document.getElementById("quiz-category");
const quizQuestionWrap = document.getElementById("quiz-question-wrap");
const quizQuestionPanel = document.getElementById("quiz-question-panel");
const quizQuestion = document.getElementById("quiz-question");
const quizChoiceGuide = document.getElementById("quiz-choice-guide");
const quizButtonsWrap = document.getElementById("quiz-buttons");
const quizButtons = document.querySelectorAll(".quiz-btn");
const quizFeedback = document.getElementById("quiz-feedback");
const quizFeedbackTitle = document.getElementById("quiz-feedback-title");
const quizExplanation = document.getElementById("quiz-explanation");
const quizNextBtn = document.getElementById("quiz-next-btn");
const quizResult = document.getElementById("quiz-result");
const quizScore = document.getElementById("quiz-score");
const quizLevel = document.getElementById("quiz-level");
const quizRiskFill = document.getElementById("quiz-risk-fill");
const quizRiskText = document.getElementById("quiz-risk-text");
const quizRetryBtn = document.getElementById("quiz-retry-btn");
const quizOtherBtn = document.getElementById("quiz-other-btn");

let activeQuizData = [];
let currentQuizIndex = 0;
let quizScoreCount = 0;
let selectedCurrentQuestion = false;

const shuffleQuestions = (questions) => {
  const shuffled = [...questions];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
};

const pickQuestionSet = (excludeCurrentSet = false) => {
  const currentIds = new Set(activeQuizData.map((question) => question.id));
  const pool = excludeCurrentSet
    ? quizData.filter((question) => !currentIds.has(question.id))
    : quizData;
  const source = pool.length >= 5 ? pool : quizData;

  return shuffleQuestions(source).slice(0, 5);
};

const getSecurityLevel = (score) => {
  if (score >= 4) return "보안 수준 안전";
  if (score >= 2) return "보안 수준 주의";
  return "보안 수준 위험";
};

const getRiskGauge = (score) => {
  if (score <= 1) {
    return {
      className: "danger",
      text: "위험 단계: 기본 보안 습관을 다시 점검해야 합니다.",
      width: "33.33%",
    };
  }

  if (score <= 3) {
    return {
      className: "warning",
      text: "주의 단계: 중요한 수칙은 알고 있지만 더 보완이 필요합니다.",
      width: "66.66%",
    };
  }

  return {
    className: "safe",
    text: "안전 단계: 보안 수칙을 잘 이해하고 있습니다.",
    width: "100%",
  };
};

const resetQuizButtons = () => {
  quizButtons.forEach((button) => {
    button.disabled = false;
    button.classList.remove("selected", "correct", "incorrect");
  });
};

const updateQuizProgress = () => {
  const questionNumber = currentQuizIndex + 1;
  const progressPercent = (questionNumber / activeQuizData.length) * 100;

  quizQuestionNumber.textContent = `QUESTION ${String(questionNumber).padStart(2, "0")}`;
  quizProgress.textContent = `${questionNumber} / ${activeQuizData.length}`;
  quizProgressFill.style.width = `${progressPercent}%`;
};

const renderQuiz = () => {
  const currentQuiz = activeQuizData[currentQuizIndex];

  updateQuizProgress();
  quizCategory.textContent = currentQuiz.category;
  quizQuestion.textContent = currentQuiz.question;
  quizCard.classList.remove("result-mode");
  quizStart.hidden = true;
  quizStatusRow.hidden = false;
  quizProgressTrack.hidden = false;
  quizFeedback.hidden = true;
  quizResult.hidden = true;
  quizQuestionPanel.hidden = false;
  quizQuestionWrap.hidden = false;
  quizChoiceGuide.hidden = false;
  quizButtonsWrap.hidden = false;
  quizNextBtn.textContent =
    currentQuizIndex === activeQuizData.length - 1 ? "결과 보기" : "다음 문제";
  selectedCurrentQuestion = false;
  resetQuizButtons();
};

const showQuizFeedback = (selectedAnswer, selectedButton) => {
  if (selectedCurrentQuestion) return;

  const currentQuiz = activeQuizData[currentQuizIndex];
  const isCorrect = selectedAnswer === currentQuiz.answer;

  if (isCorrect) {
    quizScoreCount += 1;
  }

  selectedCurrentQuestion = true;
  selectedButton.classList.add("selected", isCorrect ? "correct" : "incorrect");
  quizFeedback.className = isCorrect
    ? "quiz-feedback correct"
    : "quiz-feedback incorrect";
  quizFeedbackTitle.textContent = isCorrect ? "정답입니다!" : "오답입니다!";
  quizFeedbackTitle.className = isCorrect
    ? "quiz-feedback-title correct"
    : "quiz-feedback-title incorrect";
  quizExplanation.textContent = currentQuiz.explanation;
  quizFeedback.hidden = false;

  quizButtons.forEach((button) => {
    button.disabled = true;
  });
};

const showQuizResult = () => {
  quizProgress.textContent = `${activeQuizData.length} / ${activeQuizData.length}`;
  quizProgressFill.style.width = "100%";
  quizQuestionNumber.textContent = "RESULT";
  quizCard.classList.add("result-mode");
  quizQuestionWrap.hidden = false;
  quizQuestionPanel.hidden = true;
  quizChoiceGuide.hidden = true;
  quizButtonsWrap.hidden = true;
  quizFeedback.hidden = true;
  quizResult.hidden = false;
  quizScore.textContent = `${activeQuizData.length}문제 중 ${quizScoreCount}문제 정답`;
  quizLevel.textContent = getSecurityLevel(quizScoreCount);

  const riskGauge = getRiskGauge(quizScoreCount);
  quizRiskFill.className = `quiz-risk-fill ${riskGauge.className}`;
  quizRiskFill.style.width = riskGauge.width;
  quizRiskText.textContent = riskGauge.text;
};

const startQuiz = (mode = "new") => {
  if (mode === "new") {
    activeQuizData = pickQuestionSet(false);
  }

  if (mode === "other") {
    activeQuizData = pickQuestionSet(true);
  }

  currentQuizIndex = 0;
  quizScoreCount = 0;
  renderQuiz();
};

const showQuizStart = () => {
  quizCard.classList.remove("result-mode");
  quizStatusRow.hidden = true;
  quizProgressTrack.hidden = true;
  quizStart.hidden = false;
  quizQuestionPanel.hidden = true;
  quizChoiceGuide.hidden = true;
  quizButtonsWrap.hidden = true;
  quizFeedback.hidden = true;
  quizResult.hidden = true;
};

quizButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showQuizFeedback(button.dataset.answer === "true", button);
  });
});

quizNextBtn.addEventListener("click", () => {
  if (currentQuizIndex === activeQuizData.length - 1) {
    showQuizResult();
    return;
  }

  currentQuizIndex += 1;
  renderQuiz();
});

quizRetryBtn.addEventListener("click", () => {
  startQuiz("same");
});

quizOtherBtn.addEventListener("click", () => {
  startQuiz("other");
});

quizStartBtn.addEventListener("click", () => {
  startQuiz("new");
});

if (quizQuestion) {
  showQuizStart();
}
