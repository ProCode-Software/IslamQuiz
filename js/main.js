const userName = localStorage.getItem("name");
const onboardingFrame = document.querySelector("main .onboarding");
const quizFrame = document.querySelector("main .main-content");

let score = 0
let answerStreak = 0
let currentQuestion = 0
let totalQuestions = questions.length

if (userName) {
    onboardingFrame.style.display = "none";
    quizFrame.style.display = "flex";
    startQuiz();
} else {
    onboardingFrame.style.display = "flex";
    quizFrame.style.display = "none";

    const input = onboardingFrame.querySelector("#onboardingNameInp");
    const submitBtn = onboardingFrame.querySelector(".getStartedBtn");

    submitBtn.addEventListener("click", () => {
        localStorage.setItem("name", input.value == "" ? "Player" : input.value);
        location.reload();
    });
}

function startQuiz() {
    const questionNumberText = document.querySelector("header .questionNumberLabel");
    const scoreText = document.querySelector("header .scoreText");

    scoreText.textContent = score;
    questionNumberText.textContent = `Question ${currentQuestion}/${totalQuestions}`

    showQuestion(0)
}
function showQuestion(questionNumber) {
    currentQuestion = questionNumber
    const questionTypeText = document.querySelector('question-header .questionType')
    const questionLabel = document.querySelector('.question-header .questionLabel')
    const answersFrame = document.querySelector('.main-content .answersArea')
    const submitBtn = document.querySelector('.main-content .submitArea .submitBtn')
    const questionNumberText = document.querySelector("header .questionNumberLabel");

    const question = questions[questionNumber]
    questionLabel.textContent = question.question
    questionNumberText.textContent = `Question ${currentQuestion + 1}/${totalQuestions}`

    let playerAnswer = undefined;

    answersFrame.innerHTML = ''
    switch (question.type) {
        case 'multipleChoice':
            let letters = 'ABCDEF'.split('')
            for (let i = 0; i < question.answers.length; i++) {
                const answer = question.answers[i]
                const answerEl = `<div class="answer" data-answer="${i}">
                        <div class="left">
                            <div class="keyboardShortcut" data-key="${letters[i].toLowerCase()}">${letters[i].toUpperCase()}</div>
                            <div class="answer-text">${answer}</div>
                        </div>
                        <div class="right"></div>
                    </div>`
                answersFrame.innerHTML = answersFrame.innerHTML + answerEl
            };
            for (let element of answersFrame.children) {
                element.addEventListener('click', () => {
                    const target = element
                    if (answersFrame.querySelector(`.answer.selected`)) {
                        answersFrame.querySelector(`.answer.selected`).classList.remove('selected')
                    }
                    target.classList.add('selected')
                    playerAnswer = parseInt(target.getAttribute('data-answer'))
                    console.log(playerAnswer);
                })
            }

            break;

        default:
            throw console.error('Invalid question type');
            break;
    }

    submitBtn.addEventListener('click', () => checkAnswer(currentQuestion, playerAnswer))
}
function checkAnswer(questionNumber, answer) {
    const question = questions[questionNumber]
    const scoreText = document.querySelector("header .scoreText");
    const submitBtn = document.querySelector('.main-content .submitArea .submitBtn')

    if (question.correct == answer) {
        console.log('correct');
        score += question.points
        scoreText.innerHTML = score
    } else {
        console.log('incorrect');
    }

    if (currentQuestion == questions.length - 1) {
        submitBtn.innerHTML = 'Finish'
    } else {
        submitBtn.innerHTML = 'Continue'
        submitBtn.addEventListener('click', () => {
            showQuestion(currentQuestion + 1)
        })
    }
}
