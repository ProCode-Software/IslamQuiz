const userName = localStorage.getItem("name");
const onboardingFrame = document.querySelector("main .onboarding");
const quizFrame = document.querySelector("main .main-content");
const completionFrame = document.querySelector("main .completion");
const fillInBlanksQuestion = 'Fill in the blanks with the correct words from the bank.'

let score = 0
let currentQuestion = 0
let totalQuestions = questions.length
let incorrectQuestions = 0
let percent;
let playerAnswers = []


completionFrame.style.display = "none";
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
    questionNumberText.textContent = `${currentQuestion}/${totalQuestions}`

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
    questionLabel.textContent = (question.type == 'fillInBlanks' ? fillInBlanksQuestion : question.question)
    questionNumberText.textContent = `${currentQuestion + 1}/${totalQuestions}`

    let playerAnswer = undefined;
    submitBtn.classList.add('disabled')

    document.querySelector('.main-content .submitArea .continueBtn').style.display = 'none'
    submitBtn.style.display = 'flex'

    if (answersFrame.classList.contains('readonly')) {
        answersFrame.classList.remove('readonly')
    }

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
                        element.textContent = element.textContent.toLowerCase()
                        checkForBlanks()
                        checkForUses()
                    }
                    element.onblur = () => {
                        checkForUses()
                        if (!element.textContent == '') {
                            if (!upperCaseArray.includes(element.textContent.toUpperCase())) {
                                const err = showError('Please use only words from the bank.')

                                answersFrame.append(err)
                                element.textContent = ''
                                activeBlank = i

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
                        const answer = []

                        paragraph.querySelectorAll('.blank').forEach(bx => {
                            answer.push(bx.textContent)
                        })
                        playerAnswer = answer

                    } else {
                        submitBtn.classList.add('disabled')
                    }
                })
            }
            function checkForUses() {
                let sortedAnswers = question.answers.sort()

                bankGroup.querySelectorAll('.bankItem').forEach(s => {
                    if (s.classList.contains('used')) {
                        s.classList.remove('used')
                    }
                })


                paragraph.querySelectorAll('.blank').forEach(el => {
                    if (sortedAnswers.includes(el.textContent)) {
                        bankGroup.querySelectorAll('.bankItem')[sortedAnswers.indexOf(el.textContent)].classList.add('used')
                    }
                })
            }

            break;
        default:
            throw console.error('Invalid question type');
            break;
    }

    if (question.type !== 'fillInBlanks') {
        if (answersFrame.classList.contains('fillInBlanks')) answersFrame.classList.remove('fillInBlanks')
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
    playerAnswers.push(answer + ' cq = ' + currentQuestion)
    console.log(playerAnswers);

    continueBtn.style.display = 'flex'
    submitBtn.style.display = 'none'
    answersFrame.classList.add('readonly')

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
    console.log(playerAnswerEl);

    if (question.type !== 'fillInBlanks') {
        if (question.correct == answer) {
            console.log('correct');
            playerAnswerEl.classList.add('correct')
            playerAnswerEl.querySelector('.right').innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.5 6.62L9.73566 18.3843L3 11.6487" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
</svg>
`
            score += question.points
            scoreText.innerHTML = score

        } else {
            playerAnswerEl.classList.add('incorrect')
            incorrectQuestions++
            playerAnswerEl.querySelector('.right').innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.29285 18.2929L3.58574 19L4.99995 20.4142L5.70706 19.7071L4.29285 18.2929ZM19.7072 5.70711L20.4143 5.00001L19.0001 3.58579L18.2929 4.29289L19.7072 5.70711ZM5.70706 4.29289L4.99995 3.58579L3.58574 5L4.29285 5.70711L5.70706 4.29289ZM18.2929 19.7071L19.0001 20.4142L20.4143 19L19.7072 18.2929L18.2929 19.7071ZM5.70706 19.7071L12.7071 12.7071L11.2928 11.2929L4.29285 18.2929L5.70706 19.7071ZM12.7071 12.7071L19.7072 5.70711L18.2929 4.29289L11.2929 11.2929L12.7071 12.7071ZM4.29285 5.70711L11.2928 12.7071L12.7071 11.2929L5.70706 4.29289L4.29285 5.70711ZM11.2929 12.7071L18.2929 19.7071L19.7072 18.2929L12.7071 11.2929L11.2929 12.7071Z" fill="currentColor"/>
</svg>
`
            console.log('incorrect');
        }
    } else {
        const allBlankAnswers = answer
        let correctBlanks = 0
        let allCorrect;
        const blankEls = answersFrame.querySelectorAll('.blank')

        for (let i = 0; i < allBlankAnswers.length; i++) {
            const blank = allBlankAnswers[i]
            if (blank == question.correct[i]) {
                blankEls[i].classList.add('correct')
                correctBlanks++
                if (allCorrect !== 'false') {
                    allCorrect = true
                // }
            } else {
                blankEls[i].classList.add('incorrect')
                /* const clone = blankEls[i].cloneNode()
                allCorrect = false
                clone.textContent = question.correct[i]
                clone.classList.replace('incorrect', 'correct')
                blankEls[i].parentNode.insertBefore(clone, blankEls[i].nextSibling) */
            }
        }

        if (correctBlanks > 0) {
            score += Math.round((question.points / question.correct.length) * correctBlanks)
        }
        if (!allCorrect) {
            incorrectQuestions++
        }
        scoreText.innerHTML = score
    }
    continueBtn.style.display = 'flex'
    if (currentQuestion == questions.length - 1) {
        continueBtn.innerHTML = 'Finish'
        continueBtn.onclick = () => {
            completeTest()
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

function completeTest() {
    quizFrame.style.display = 'none'
    onboardingFrame.style.display = 'none'
    completionFrame.style.display = 'flex'

    function get(element) {
        return completionFrame.querySelector(element)
    }
    // p = (total - incorrect) / total * 100
    percent = Math.round((totalQuestions - incorrectQuestions) / totalQuestions * 100)

    get('.top .quizScore').textContent = `${percent}%`

    get('.stats .stat#stat-correct .statValue').textContent = `${totalQuestions - incorrectQuestions}/${totalQuestions}`

    get('.stats .stat#stat-score .statValue').textContent = score

    get('.questionReview').innerHTML = ''

    let letters = 'ABCDEF'.split('')


    for (let i = 0; i < questions.length; i++) {
        const mainElement = document.createElement('div')
        const question = questions[i]
        mainElement.classList.add('sectionItem', 'questionReviewItem')

        if (question.type !== 'fillInBlanks') {
            let typeText;
            switch (question.type) {
                case 'multipleChoice':
                    typeText = 'Multiple choice'
                    break;
                case 'trueFalse':
                    typeText = 'True or false'
                    break;

                default:
                    console.error('Invalid question type');
                    break;
            }
            mainElement.innerHTML = `<div class="qlHeader">
                                    <div class="number">${i + 1}</div>
                                    <div class="qlLabel">
                                        <div class="qlType">${typeText}</div>
                                        <div class="qlQuestion">${question.question}</div>
                                    </div>
                                </div>
                                <div class="qlBody qlOptions"></div>`

            let answers = question.type == 'trueFalse' ? ['True', 'False'] : question.answers
            for (let j = 0; j < answers.length; j++) {
                const option = answers[j]
                const optionEl = document.createElement('div')
                optionEl.className = 'qlOption'
                optionEl.innerHTML = `
                                        <div class="qlOptionLeft">
                                            <div class="letter keyboardShortcut" data-key="${letters
                    [j].toLowerCase()}">${letters
                    [j].toUpperCase()}</div>
                                            <div class="qlOptionText">${option}</div>
                                        </div>
                                        <div class="qlOptionRight">
                                        </div>`
                mainElement.querySelector('.qlOptions').append(optionEl)
                if (question.correct == j) {
                    optionEl.classList.add('ql-correct')
                }
            }
        } else {
            mainElement.innerHTML = `<div class="qlHeader">
                                    <div class="number">${i + 1}</div>
                                    <div class="qlLabel">
                                        <div class="qlType">Fill in the blanks</div>
                                        <div class="qlQuestion">${fillInBlanksQuestion}</div>
                                    </div>
                                </div>
                                <div class="qlBody qlOptions"></div>`

            mainElement.querySelector('.qlOptions').innerHTML = `<p class="reviewFBSentence">${question.sentence.replaceAll('%%', '<span class="reviewBlank">sampling</span>')}</p>`

            const paragraph = mainElement.querySelector('.reviewFBSentence')
            for (let i = 0; i < paragraph.querySelectorAll('.reviewBlank').length; i++) {
                const blank = paragraph.querySelectorAll('.reviewBlank')[i]
                blank.innerHTML = question.correct[i]
            }
        }


        get('.questionReview').append(mainElement)
    }
}
// completeTest()