const params = new URLSearchParams(window.location.search)
const fromWarp = params.get('from') === 'warp'

if (fromWarp) {
  document.body.classList.add('level-entering')
}

const RESULTS_KEY = 'childResults'
let levelStartTime = Date.now()

const rounds = [
  {
    letter: 'P',
    sound: 'pe',
    correct: 'Pas',
    answers: [
      { word: 'Pas', emoji: '🐶' },
      { word: 'Avion', emoji: '✈️' },
      { word: 'Sunce', emoji: '☀️' }
    ]
  },
  {
    letter: 'M',
    sound: 'em',
    correct: 'Mačka',
    answers: [
      { word: 'Riba', emoji: '🐟' },
      { word: 'Mačka', emoji: '🐱' },
      { word: 'Kuća', emoji: '🏠' }
    ]
  },
  {
    letter: 'S',
    sound: 'es',
    correct: 'Sunce',
    answers: [
      { word: 'Lopta', emoji: '⚽' },
      { word: 'Auto', emoji: '🚗' },
      { word: 'Sunce', emoji: '☀️' }
    ]
  },
  {
    letter: 'R',
    sound: 'er',
    correct: 'Riba',
    answers: [
      { word: 'Riba', emoji: '🐟' },
      { word: 'Medo', emoji: '🧸' },
      { word: 'Avion', emoji: '✈️' }
    ]
  },
  {
    letter: 'L',
    sound: 'el',
    correct: 'Lopta',
    answers: [
      { word: 'Kuća', emoji: '🏠' },
      { word: 'Lopta', emoji: '⚽' },
      { word: 'Pas', emoji: '🐶' }
    ]
  },
  {
    letter: 'K',
    sound: 'ka',
    correct: 'Kapa',
    answers: [
      { word: 'Kapa', emoji: '🧢' },
      { word: 'Mačka', emoji: '🐱' },
      { word: 'Riba', emoji: '🐟' }
    ]
  },
  {
    letter: 'B',
    sound: 'be',
    correct: 'Balon',
    answers: [
      { word: 'Auto', emoji: '🚗' },
      { word: 'Balon', emoji: '🎈' },
      { word: 'Lopta', emoji: '⚽' }
    ]
  },
  {
    letter: 'Z',
    sound: 'ze',
    correct: 'Zvono',
    answers: [
      { word: 'Sunce', emoji: '☀️' },
      { word: 'Kuća', emoji: '🏠' },
      { word: 'Zvono', emoji: '🔔' }
    ]
  }
]

let currentRound = 0
let answered = false
let correctAnswers = 0
let wrongAnswers = 0
let roundHadMistake = false
let resultSaved = false
let speakTimer = null

const letterBox = document.getElementById('letterBox')
const answersBox = document.getElementById('answers')
const message = document.getElementById('message')
const nextBtn = document.getElementById('nextBtn')
const progressText = document.getElementById('progressText')
const finishBox = document.getElementById('finishBox')
const scoreText = document.getElementById('scoreText')

renderRound()

function renderRound() {
  answered = false
  roundHadMistake = false

  if (speakTimer) {
    clearTimeout(speakTimer)
    speakTimer = null
  }

  if ('speechSynthesis' in window) {
    speechSynthesis.cancel()
  }

  const round = rounds[currentRound]

  document.body.classList.remove('finished')

  letterBox.textContent = round.letter
  progressText.textContent = `Runda ${currentRound + 1} / ${rounds.length}`

  message.textContent = ''
  message.className = 'message'

  nextBtn.classList.remove('show')
  finishBox.classList.remove('show')

  answersBox.innerHTML = ''

  round.answers.forEach((item) => {
    const btn = document.createElement('button')

    btn.className = 'answer-card'
    btn.type = 'button'

    btn.innerHTML = `
      <span>
        <span class="emoji">${item.emoji}</span>
        <span class="word">${item.word}</span>
      </span>
    `

    btn.addEventListener('click', () => {
      checkAnswer(item.word, btn)
    })

    answersBox.appendChild(btn)
  })
}

function checkAnswer(word, selectedButton) {
  if (answered) return

  const round = rounds[currentRound]

  if (word === round.correct) {
    answered = true
    correctAnswers++

    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
    }

    selectedButton.classList.add('correct')

    message.textContent = `Bravo! ${round.letter} kao ${round.correct}.`
    message.className = 'message good'

    document.querySelectorAll('.answer-card').forEach((btn) => {
      btn.disabled = true
    })

    if (currentRound === rounds.length - 1) {
      showFinish()
    } else {
      nextBtn.classList.add('show')
    }
  } else {
    if (!roundHadMistake) {
      wrongAnswers++
      roundHadMistake = true
    }

    message.textContent = `Pokušaj još jednom. Slušaj glas: ${round.letter}.`
    message.className = 'message try'

    speakLetter(currentRound)
  }
}

function nextRound() {
  currentRound++
  renderRound()

  const roundIndexToSpeak = currentRound

  speakTimer = setTimeout(() => {
    speakLetter(roundIndexToSpeak)
  }, 350)
}

function speakLetter(roundIndex = currentRound) {
  if (roundIndex !== currentRound) return
  if (currentRound >= rounds.length) return
  if (!('speechSynthesis' in window)) return

  const round = rounds[currentRound]

  speechSynthesis.cancel()

  const text = `Slušaj glas: ${round.sound}. Pronađi riječ koja počinje tim glasom.`

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'hr-HR'
  utterance.rate = 0.78
  utterance.pitch = 1

  speechSynthesis.speak(utterance)
}

function showFinish() {
  if (speakTimer) {
    clearTimeout(speakTimer)
    speakTimer = null
  }

  if ('speechSynthesis' in window) {
    speechSynthesis.cancel()
  }

  document.body.classList.add('finished')
  progressText.textContent = 'Level 1 završen'

  const finalScore = Math.max(0, rounds.length - wrongAnswers)

  saveLevelResult(1, finalScore, rounds.length)

  if (scoreText) {
    scoreText.textContent =
      `Osvojio/la si ${finalScore} / ${rounds.length} bodova ⭐`
  }

  finishBox.classList.add('show')
  playVictoryEffects()
}

function finishLevel() {
  if (speakTimer) {
    clearTimeout(speakTimer)
    speakTimer = null
  }

  if ('speechSynthesis' in window) {
    speechSynthesis.cancel()
  }

  if (correctAnswers === rounds.length) {
    const key = 'unlockedLevels'
    const levels = JSON.parse(localStorage.getItem(key) || '[1]')

    if (!levels.includes(2)) {
      levels.push(2)
    }

    const sortedLevels = [...new Set(levels)].sort((a, b) => a - b)

    localStorage.setItem(key, JSON.stringify(sortedLevels))
    localStorage.setItem('level1Completed', 'true')
  }

  window.location.href = 'index.html?returnWarp=1'
}

function saveLevelResult(level, score, maxScore, difficulty = 'standard') {
  if (resultSaved) return

  const duration = Math.floor((Date.now() - levelStartTime) / 1000)

  const newResult = {
    level,
    score,
    maxScore,
    duration,
    difficulty,
    date: new Date().toLocaleString('hr-HR')
  }

  let results = []

  try {
    const saved = JSON.parse(localStorage.getItem(RESULTS_KEY) || '[]')
    results = Array.isArray(saved) ? saved : []
  } catch (error) {
    console.warn('Rezultati se nisu mogli pročitati:', error)
    results = []
  }

  results.push(newResult)
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results))

  resultSaved = true
}

function playVictoryEffects() {
  playVictorySound()
  createConfetti()
}

function playVictorySound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const notes = [523.25, 659.25, 783.99]

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()

      oscillator.connect(gain)
      gain.connect(audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine'

      const startTime = audioContext.currentTime + index * 0.13

      gain.gain.setValueAtTime(0.0001, startTime)
      gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.24)
    })
  } catch (error) {
    console.warn('Victory sound nije pokrenut:', error)
  }
}

function createConfetti() {
  const colors = ['#ffffff', '#19d9ff', '#19d978', '#ffed4a', '#ff7ad9']

  for (let i = 0; i < 32; i++) {
    const piece = document.createElement('span')

    piece.style.position = 'fixed'
    piece.style.left = `${Math.random() * 100}%`
    piece.style.top = '-20px'
    piece.style.width = '10px'
    piece.style.height = '14px'
    piece.style.borderRadius = '4px'
    piece.style.background = colors[Math.floor(Math.random() * colors.length)]
    piece.style.zIndex = '10000'
    piece.style.pointerEvents = 'none'
    piece.style.opacity = '0.95'
    piece.style.transform = `rotate(${Math.random() * 180}deg)`

    const duration = 1800 + Math.random() * 900

    piece.animate(
      [
        {
          transform: 'translateY(0) rotate(0deg)',
          opacity: 1
        },
        {
          transform: `translateY(${window.innerHeight + 80}px) rotate(${360 + Math.random() * 360}deg)`,
          opacity: 0
        }
      ],
      {
        duration,
        easing: 'cubic-bezier(.2,.7,.2,1)',
        fill: 'forwards'
      }
    )

    document.body.appendChild(piece)

    setTimeout(() => {
      piece.remove()
    }, duration)
  }
}