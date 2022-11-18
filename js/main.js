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
}
function showQuestion(questionNumber) {
    currentQuestion = questionNumber
    console.log(currentQuestion);
    if (currentQuestion <= questions.length - 1) {
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
                        playerAnswer = Number(target.getAttribute('data-answer'))
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
    } else {
        completeTest()
    }
}
function checkAnswer(answer) {
    const question = questions[currentQuestion]
    console.log(question);
    console.log('answer = ' + answer);
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

                } else {
                    blankEls[i].classList.add('incorrect')
                    /* const clone = blankEls[i].cloneNode()
                    allCorrect = false
                    clone.textContent = question.correct[i]
                    clone.classList.replace('incorrect', 'correct')
                    blankEls[i].parentNode.insertBefore(clone, blankEls[i].nextSibling) */
                }
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
            localStorage.setItem('currentQuestion', currentQuestion + 1)
            location.reload()
        }
    } else {
        continueBtn.onclick = () => {
            continueBtn.style.display = 'none'
            localStorage.setItem('currentQuestion', currentQuestion + 1)
            location.reload()

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



            const optionEl = document.createElement('div')
            optionEl.className = 'qlOption'
            optionEl.innerHTML = `
                                        <div class="qlOptionLeft">
                                            <div class="letter keyboardShortcut" data-key="${letters[question.type == 'trueFalse' ? (question.correct == true ? 0 : 1) : question.correct]}">${letters
                [question.type == 'trueFalse' ? (question.correct == true ? 0 : 1) : question.correct].toUpperCase()}</div>
                                            <div class="qlOptionText">${question.type == 'trueFalse' ? (question.correct == false ? 'True' : 'False') : (question.answers[question.correct])}</div>
                                        </div>
                                        <div class="qlOptionRight">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.5 6.62L9.73566 18.3843L3 11.6487" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>
</svg>
                                        </div>`
            mainElement.querySelector('.qlOptions').append(optionEl)

            optionEl.classList.add('ql-correct')


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

if (localStorage.getItem('currentQuestion')) {
    showQuestion(Number(localStorage.getItem('currentQuestion')))
} else {
    localStorage.setItem('currentQuestion', 0)
    location.reload()
}
function shareQuizScore(e) {
    const caller = e.target

    if (caller) {
        const message = `I scored ${percent}% on the Allah vs. God quiz!\nPlay now: https://procode-software.github.io/IslamQuiz`
        const originalText = caller.textContent

        navigator.clipboard.writeText(message)

        caller.textContent = 'Copied to clipboard'
        setTimeout(() => {
            caller.textContent = originalText
        }, 3000);
    }
}
function creteToolbarItem(name, id, icon) {
    const toolbar = document.querySelector('header .toolbar')

    const toolbarItem = document.createElement('button')
    toolbarItem.title = name
    toolbarItem.id = id
    toolbarItem.className = 'toolbarItem'
    toolbarItem.innerHTML = icon
    toolbar.append(toolbarItem)
}
/* creteToolbarItem('Settings', 'settings', `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 8.125C9.8599 8.125 8.12501 9.8599 8.12501 12C8.12501 14.1401 9.8599 15.875 12 15.875C14.1401 15.875 15.875 14.1401 15.875 12C15.875 9.8599 14.1401 8.125 12 8.125Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2.125C11.2475 2.125 10.5137 2.20932 9.80782 2.36938C9.46743 2.44657 9.20547 2.71867 9.14126 3.06174L8.81921 4.78236C8.69229 5.46048 7.9905 5.86566 7.33976 5.63652L5.69061 5.05581C5.36177 4.94001 4.99556 5.03048 4.75847 5.2861C3.76486 6.35733 3.00537 7.65042 2.56289 9.08388C2.46005 9.41702 2.56481 9.77941 2.82952 10.0063L4.15897 11.1458C4.68278 11.5948 4.68278 12.4052 4.15897 12.8542L2.82952 13.9937C2.56481 14.2206 2.46005 14.583 2.56289 14.9161C3.00537 16.3496 3.76486 17.6427 4.75847 18.7139C4.99556 18.9695 5.36177 19.06 5.69062 18.9442L7.33976 18.3635C7.99049 18.1343 8.69229 18.5395 8.81921 19.2176L9.14126 20.9383C9.20547 21.2813 9.46743 21.5534 9.80783 21.6306C10.5137 21.7907 11.2475 21.875 12 21.875C12.7525 21.875 13.4863 21.7907 14.1922 21.6306C14.5326 21.5534 14.7945 21.2813 14.8587 20.9383L15.1808 19.2176C15.3077 18.5395 16.0095 18.1343 16.6603 18.3634L18.3094 18.9442C18.6383 19.06 19.0045 18.9695 19.2416 18.7139C20.2352 17.6426 20.9946 16.3496 21.4371 14.9161C21.54 14.583 21.4352 14.2206 21.1705 13.9937L19.841 12.8542C19.3172 12.4052 19.3172 11.5948 19.841 11.1458L21.1705 10.0063C21.4352 9.77941 21.54 9.41702 21.4371 9.08388C20.9946 7.65043 20.2352 6.35735 19.2416 5.28613C19.0045 5.03052 18.6383 4.94004 18.3094 5.05584L16.6603 5.63656C16.0095 5.86571 15.3077 5.46053 15.1808 4.7824L14.8587 3.06174C14.7945 2.71866 14.5326 2.44656 14.1922 2.36938C13.4863 2.20932 12.7525 2.125 12 2.125ZM10.5393 5.10431L10.7516 3.97019C11.1582 3.90755 11.575 3.875 12 3.875C12.425 3.875 12.8418 3.90755 13.2484 3.97019L13.4607 5.10435C13.785 6.83734 15.5785 7.87281 17.2415 7.28722L18.3289 6.90431C18.8503 7.55101 19.2743 8.27882 19.5791 9.06544L18.7022 9.81714C17.3635 10.9645 17.3635 13.0355 18.7022 14.1829L19.5791 14.9346C19.2743 15.7212 18.8503 16.449 18.3289 17.0957L17.2415 16.7128C15.5785 16.1272 13.785 17.1627 13.4607 18.8956L13.2484 20.0298C12.8418 20.0924 12.425 20.125 12 20.125C11.575 20.125 11.1582 20.0924 10.7516 20.0298L10.5393 18.8957C10.215 17.1627 8.42151 16.1272 6.75851 16.7128L5.67116 17.0957C5.14972 16.449 4.72568 15.7212 4.42087 14.9346L5.29785 14.1829C6.63648 13.0355 6.63648 10.9645 5.29785 9.81714L4.42087 9.06544C4.72568 8.2788 5.14972 7.55099 5.67116 6.90428L6.75851 7.28717C8.42151 7.87276 10.215 6.8373 10.5393 5.10431Z" fill="black"/>
</svg>
`)
creteToolbarItem('How to play', 'help', `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.76221 9.48781C9.76221 9.11981 9.85296 8.75747 10.0264 8.43291C10.1999 8.10836 10.4508 7.83159 10.7568 7.62714C11.0627 7.42268 11.4145 7.29685 11.7806 7.26078C12.1469 7.2247 12.5164 7.27951 12.8564 7.42035C13.1964 7.56117 13.4964 7.78368 13.7299 8.06816C13.9634 8.35263 14.1231 8.6903 14.1949 9.05124C14.2666 9.41218 14.2483 9.78529 14.1415 10.1374C14.0644 10.3913 13.9431 10.6287 13.7839 10.8389C13.7821 10.8413 13.7812 10.8425 13.713 10.9167C13.6784 10.9543 13.558 11.0694 13.5189 11.1023C13.4418 11.1671 13.4044 11.1929 13.3297 11.2445L12.5186 11.8038C12.1115 12.0845 11.8684 12.5475 11.8684 13.042" stroke="black" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="round"/>
<path d="M11.9288 16.75C12.4586 16.75 12.8881 16.3205 12.8881 15.7907C12.8881 15.2608 12.4586 14.8313 11.9288 14.8313C11.399 14.8313 10.9695 15.2608 10.9695 15.7907C10.9695 16.3205 11.399 16.75 11.9288 16.75Z" fill="black"/>
<path d="M12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25Z" stroke="black" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`) */

function showSettings(item) { }
/**
 * Creates a context menu item and appends it to the `menu`.
 * @param {string} name Display name
 * @param {string} id Element ID
 * @param {string} icon SVG icon
 * @param {Element} menu Context menu element to append the item into
 */
function creatContextItem(name, id, icon, menu) {

}