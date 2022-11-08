const questions = [
    {
        question: 'Muslims believe in the Trinity',
        type: 'trueFalse',
        notes: 'The Qur\'an says that if you believe or mention the Trinity, you will undergo the suffering of hell.',
        points: 20,
        correct: false
    },
    {
        question: 'Muslims believe that Christians are _________ because they believe that their God is in 3 persons.',
        type: 'multipleChoice',
        answers: ['atheists', 'polytheists', 'monotheists', 'pantheists'],
        notes: 'Add 10 with 10 and get 20. It is that simple.',
        points: 20,
        correct: 1
    },
    {
        question: 'The world\'s smallest vioin, really needs a(n) ___________...',
        type: 'multipleChoice',
        answers: ['naughty s', 'player', 'armor stand', 'audience'],
        notes: 'I\'ll blow up into smithereens, and spew myself a symphony',
        points: 40,
        correct: 3
    },
    {
        type: 'fillInBlanks',
        correct: ['fighting', 'killing others', 'flee'],
        notes: 'Add 10 with 10 and get 20. It is that simple.',
        sentence: 'They were %% and %%, so they had to %%.',
        points: 100,
        answers: ['fighting', 'flee', 'arguing', 'drive away', 'killing others', 'stealing']
    }
]