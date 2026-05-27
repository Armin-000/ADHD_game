document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('visible')
  loadRound()
})

const RESULTS_KEY = 'childResults'
let levelStartTime = Date.now()

const questions = [
  {
    first: 'MA',
    correct: 'ČKA',
    options: ['ČKA', 'LO', 'RI'],
    icon: '🐱',
    word: 'MAČKA'
  },
  {
    first: 'KU',
    correct: 'ĆA',
    options: ['MA', 'ĆA', 'TA'],
    icon: '🏠',
    word: 'KUĆA'
  },
  {
    first: 'RI',
    correct: 'BA',
    options: ['TA', 'BA', 'CA'],
    icon: '🐟',
    word: 'RIBA'
  },
  {
    first: 'LO',
    correct: 'PTA',
    options: ['PTA', 'VAC', 'NJE'],
    icon: '⚽',
    word: 'LOPTA'
  },
  {
    first: 'JA',
    correct: 'BUKA',
    options: ['BUKA', 'JA', 'CO'],
    icon: '🍎',
    word: 'JABUKA'
  },
  {
    first: 'BA',
    correct: 'LON',
    options: ['LON', 'NAN', 'TOR'],
    icon: '🎈',
    word: 'BALON'
  },
  {
    first: 'AU',
    correct: 'TO',
    options: ['KO', 'TA', 'TO'],
    icon: '🚗',
    word: 'AUTO'
  },
  {
    first: 'SLI',
    correct: 'KOVNICA',
    options: ['KOVNICA', 'KARICA', 'LOVNICA'],
    icon: '📘',
    word: 'SLIKOVNICA'
  }
]

let currentRound = 0
let correctAnswers = 0
let wrongAnswers = 0
let roundHadMistake = false
let resultSaved = false
let levelFinished = false
let answerLocked = false

const progressText = document.getElementById('progressText')
const firstPart = document.getElementById('firstPart')
const secondPart = document.getElementById('secondPart')
const targetImage = document.getElementById('targetImage')
const message = document.getElementById('message')
const nextBtn = document.getElementById('nextBtn')
const optionsDiv = document.getElementById('options')
const finishBox = document.getElementById('finishBox')
const scoreText = document.getElementById('scoreText')
const finishReturnBtn = document.getElementById('finishReturnBtn')

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5)
}

function loadRound() {
  levelFinished = false
  answerLocked = false
  roundHadMistake = false

  const q = questions[currentRound]

  document.body.classList.remove('finished')

  progressText.textContent = `Runda ${currentRound + 1} / ${questions.length}`

  firstPart.textContent = q.first

  secondPart.textContent = '?'
  secondPart.classList.add('empty')

  targetImage.textContent = q.icon
  targetImage.setAttribute('aria-label', q.word)

  message.textContent = ''
  message.className = 'message'

  nextBtn.classList.remove('show')
  finishBox.classList.remove('show')

  if (finishReturnBtn) {
  finishReturnBtn.disabled = true
  finishReturnBtn.classList.remove('show')
}

  optionsDiv.innerHTML = ''

  shuffleArray(q.options).forEach((option) => {
    const btn = document.createElement('button')

    btn.type = 'button'
    btn.className = 'option-card'
    btn.textContent = option

    btn.addEventListener('click', () => {
      checkAnswer(option, btn)
    })

    optionsDiv.appendChild(btn)
  })

  blurActiveElement()
}

function checkAnswer(selected, btn) {
  if (answerLocked) return

  const q = questions[currentRound]

  if (selected === q.correct) {
    answerLocked = true
    correctAnswers++

    secondPart.textContent = selected
    secondPart.classList.remove('empty')

    btn.classList.add('correct')

    message.textContent = `Izvrsno! Riječ je ${q.word}. 🎉`
    message.className = 'message good'

    document.querySelectorAll('.option-card').forEach((button) => {
      button.disabled = true
    })

    speakWord(q.word)

    nextBtn.classList.add('show')
    blurActiveElement()

    return
  }

  if (!roundHadMistake) {
    wrongAnswers++
    roundHadMistake = true
  }

  btn.classList.add('wrong')

  message.textContent = 'Pokušaj ponovno! 🧐'
  message.className = 'message try'

  setTimeout(() => {
    btn.classList.remove('wrong')
  }, 500)
}

function speakWord(word) {
  if (!('speechSynthesis' in window)) return

  speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(word)

  utterance.lang = 'hr-HR'
  utterance.rate = 0.85
  utterance.pitch = 1

  speechSynthesis.speak(utterance)
}

function nextRound() {
  if (!nextBtn.classList.contains('show')) return
  if (levelFinished) return

  currentRound++

  if (currentRound < questions.length) {
    loadRound()
    return
  }

  showFinish()
}

function showFinish() {
  levelFinished = true
  answerLocked = true

  document.body.classList.add('finished')

  nextBtn.classList.remove('show')

  message.textContent = ''
  message.className = 'message'

  progressText.textContent = 'Level 2 završen'

  const finalScore = Math.max(0, questions.length - wrongAnswers)

  saveLevelResult(2, finalScore, questions.length)

  if (scoreText) {
    scoreText.textContent =
      `Osvojio/la si ${finalScore} / ${questions.length} bodova ⭐`
  }

  finishBox.classList.add('show')

  if (finishReturnBtn) {
  finishReturnBtn.disabled = false
  finishReturnBtn.classList.add('show')
}

  blurActiveElement()
  playVictoryEffects()
}

function finishLevel() {
  if (!levelFinished) return
  if (!finishBox.classList.contains('show')) return

  speechSynthesis.cancel()

  const key = 'unlockedLevels'
  const saved = localStorage.getItem(key)

  let unlockedLevels = [1, 2]

  try {
    const parsed = JSON.parse(saved)

    if (Array.isArray(parsed)) {
      unlockedLevels = parsed
    }
  } catch (error) {
    unlockedLevels = [1, 2]
  }

  if (!unlockedLevels.includes(3)) {
    unlockedLevels.push(3)
  }

  unlockedLevels = [...new Set(unlockedLevels)].sort((a, b) => a - b)

  localStorage.setItem(key, JSON.stringify(unlockedLevels))
  localStorage.setItem('level2Completed', 'true')

  window.location.href = 'index.html?returnWarp=1'
}

function goBack() {
  speechSynthesis.cancel()
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

function blurActiveElement() {
  setTimeout(() => {
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur()
    }
  }, 0)
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