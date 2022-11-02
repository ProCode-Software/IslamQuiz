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

    showQuestion(0) // mark1
}
function showQuestion(questionNumber) {
    currentQuestion = questionNumber
    console.log(currentQuestion);
    const questionTypeText = document.querySelector('.question-header .questionType')
    const questionLabel = document.querySelector('.question-header .questionLabel')
    const answersFrame = document.querySelector('.main-content .answersArea')
    const submitBtn = document.querySelector('.main-content .submitArea .submitBtn')
    const questionNumberText = document.querySelector("header .questionNumberLabel");

    const question = questions[questionNumber]
    questionLabel.textContent = (question.type == 'fillInBlanks' ? 'Fill in the blanks with the correct words from the bank.' : question.question)
    questionNumberText.textContent = `Question ${currentQuestion + 1}/${totalQuestions}`

    let playerAnswer = undefined;
    submitBtn.classList.add('disabled')

    document.querySelector('.main-content .submitArea .continueBtn').style.display = 'none'
    submitBtn.style.display = 'flex'

    answersFrame.innerHTML = ''
    let letters = 'ABCDEF'.split('')

    let typeText, typeClass

    switch (question.type) {
        case 'multipleChoice':
            typeClass = 'multipleChoice'
            typeText = 'Multiple choice'
            break;
        case 'trueFalse':
            typeClass = 'trueFalse'
            typeText = 'True or false'
            break;
        case 'fillInBlanks':
            typeClass = 'fillInTheBlanks'
            typeText = 'Fill in the blanks'
            break;

        default:
            console.error('Invalid question type');
            break;
    }

    questionTypeText.classList.add(typeClass)
    questionTypeText.textContent = typeText

    switch (question.type) {
        case 'multipleChoice':
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
                    submitBtn.classList.remove('disabled')
                    console.log(playerAnswer);
                })
            }

            break;
        case 'trueFalse':
            for (let i = 0; i < 2; i++) {
                const answerEl = `<div class="answer" data-answer="${i}">
                        <div class="left">
                            <div class="keyboardShortcut" data-key="${letters[i].toLowerCase()}">${letters[i].toUpperCase()}</div>
                            <div class="answer-text">${i == 0 ? 'True' : 'False'}</div>
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
                    playerAnswer = (target.getAttribute('data-answer') == '0' ? true : false)
                    submitBtn.classList.remove('disabled')
                    console.log(playerAnswer);
                })
            }

            break;
        case 'fillInBlanks':

            let activeBlank = 0
            const bankEl = document.createElement('div')
            bankEl.className = 'wordBank'
            const bankLabel = document.createElement('div')
            bankLabel.className = 'bankTitle'
            const bankGroup = document.createElement('div')
            bankGroup.className = 'bankGroup'

            bankLabel.append(document.createTextNode('Word Bank'))

            bankEl.append(bankLabel, bankGroup)

            const upperCaseArray = []
            question.answers.forEach(q => upperCaseArray.push(q.toUpperCase()))

            const paragraph = document.createElement('p')
            paragraph.innerHTML = question.sentence.replaceAll('%%', `<div contenteditable class="blank" spellcheck="off"></div>`)
            paragraph.className = 'blanksParagraph'


            for (let i = 0; i < paragraph.querySelectorAll('.blank').length; i++) {
                const element = paragraph.querySelectorAll('.blank')[i]
                element.id = `blank${letters[i].toUpperCase()}`
                element.addEventListener('focus', () => {
                    activeBlank = letters.indexOf(element.id.replace('blank', ''))

                    element.onkeyup = () => {
                        checkForBlanks()
                        checkForUses()
                    }
                    element.onblur = () => {
                        checkForUses()
                        if (!element.textContent == '') {
                            if (!upperCaseArray.includes(element.textContent.toUpperCase())) {
                                const err = showError('Please use only words from the bank.')

                                answersFrame.append(err)

                                setTimeout(() => {
                                    err.remove()
                                }, 3000);
                            }
                        }
                    }
                })
            }

            for (let i = 0; i < question.answers.length; i++) {
                const answersSorted = question.answers.sort()
                const answerText = answersSorted[i]
                const answerEl = document.createElement('div')
                answerEl.className = 'bankItem'
                answerEl.append(document.createTextNode(answerText))

                bankGroup.append(answerEl)

                answerEl.addEventListener('click', () => {
                    paragraph.querySelectorAll('.blank')[activeBlank].textContent = answerEl.textContent

                    checkForUses()

                    checkForBlanks()

                    if (activeBlank !== (paragraph.querySelectorAll('.blank').length - 1)) activeBlank++
                })
            }

            answersFrame.append(bankEl, paragraph)

            answersFrame.classList.add('fillInBlanks')

            function checkForBlanks() {
                let allBlanksFilled = undefined

                paragraph.querySelectorAll('.blank').forEach(el => {
                    allBlanksFilled = (el.textContent == '' ? false : true)

                    if (allBlanksFilled == true) {
                        submitBtn.classList.remove('disabled')
                    } else {
                        submitBtn.classList.add('disabled')
                    }
                })
            }
            function checkForUses() {
                let sortedAnswers = question.answers.sort()

                for (let i = 0; i < sortedAnswers.length; i++) {
                    let item = sortedAnswers[i]

                    paragraph.querySelectorAll('.blank').forEach(el => {
                        if (el.textContent == item) {
                            bankGroup.querySelectorAll('.bankItem')[i].classList.add('used')
                        } else {
                            if (bankGroup.querySelectorAll('.bankItem')[i].classList.contains('used')) {
                                bankGroup.querySelectorAll('.bankItem')[i].classList.remove('used')
                            }
                        }
                    })
                }
            }

            break;
        default:
            throw console.error('Invalid question type');
            break;
    }

    submitBtn.addEventListener('click', () => checkAnswer(playerAnswer))
}
function checkAnswer(answer) {
    const question = questions[currentQuestion]
    console.log(question);
    console.log('cq = ' + currentQuestion);
    const scoreText = document.querySelector("header .scoreText");
    const submitBtn = document.querySelector('.main-content .submitArea .submitBtn')
    const continueBtn = document.querySelector('.main-content .submitArea .continueBtn')
    const answersFrame = document.querySelector('.main-content .answersArea')

    let playerAnswerEl;

    continueBtn.style.display = 'flex'
    submitBtn.style.display = 'none'

    switch (question.type) {
        case 'multipleChoice':
            playerAnswerEl = answersFrame.querySelectorAll('.answer')[answer]
            break;
        case 'trueFalse':
            playerAnswerEl = answersFrame.querySelectorAll('.answer')[answer == true ? 0 : 1]
            break;
        case 'fillInBlanks':
            break;
        default:
            playerAnswerEl = answersFrame.querySelectorAll('.answer')[answer]
            break;
    }

    if (question.correct == answer) {
        console.log('correct');
        playerAnswerEl.classList.add('correct')
        playerAnswerEl.querySelector('.right').innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.5 6.62L9.73566 18.3843L3 11.6487" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>
</svg>
`
        score += question.points

        scoreText.innerHTML = score
    } else {
        playerAnswerEl.classList.add('incorrect')
        playerAnswerEl.querySelector('.right').innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.38128 17.3812L4.76256 17.9999L6 19.2374L6.61872 18.6186L5.38128 17.3812ZM18.6187 6.61872L19.2374 6.00001L18 4.76256L17.3813 5.38128L18.6187 6.61872ZM6.61872 5.38128L6 4.76256L4.76256 6L5.38128 6.61872L6.61872 5.38128ZM17.3813 18.6186L18 19.2374L19.2374 17.9999L18.6187 17.3812L17.3813 18.6186ZM6.61872 18.6186L12.6187 12.6187L11.3812 11.3812L5.38128 17.3812L6.61872 18.6186ZM12.6187 12.6187L18.6187 6.61872L17.3813 5.38128L11.3812 11.3812L12.6187 12.6187ZM5.38128 6.61872L11.3812 12.6187L12.6187 11.3812L6.61872 5.38128L5.38128 6.61872ZM11.3812 12.6187L17.3813 18.6186L18.6187 17.3812L12.6187 11.3812L11.3812 12.6187Z" fill="currentColor"/>
</svg>
`
        console.log('incorrect');
    }
    continueBtn.style.display = 'flex'
    if (currentQuestion == questions.length - 1) {
        continueBtn.innerHTML = 'Finish'
        continueBtn.onclick = () => {
            console.log('done!!!');
        }
    } else {
        continueBtn.onclick = () => {
            continueBtn.style.display = 'none'
            showQuestion(currentQuestion + 1)
        }
    }
}

function showError(msg) {
    const errorMsg = document.createElement('div')
    errorMsg.className = 'errorMessage'
    errorMsg.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.875C6.40812 1.875 1.875 6.40812 1.875 12C1.875 17.5919 6.40812 22.125 12 22.125C17.5919 22.125 22.125 17.5919 22.125 12C22.125 6.40812 17.5919 1.875 12 1.875ZM12.875 7.11H11.125V13.4332H12.875V7.11ZM10.9157 15.8057C10.9157 15.2068 11.4011 14.7213 12 14.7213C12.5989 14.7213 13.0843 15.2068 13.0843 15.8057C13.0843 16.4045 12.5989 16.89 12 16.89C11.4011 16.89 10.9157 16.4045 10.9157 15.8057Z" fill="currentColor"/>
</svg><span class="text">${msg}</span>
`
    return errorMsg
}