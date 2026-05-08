document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('visible')
  updateDifficultyUI()
  setupDifficultyCloseEvents()
  startGame()
})

const basePairs = [
  { id: 'rocket', symbol: '🚀' },
  { id: 'star', symbol: '⭐' },
  { id: 'moon', symbol: '🌙' }
]

const difficultyTimes = {
  easy: {
    intro: 6000,
    preview: 6000
  },
  normal: {
    intro: 3500,
    preview: 4000
  },
  hard: {
    intro: 1800,
    preview: 2500
  }
}

let difficulty = localStorage.getItem('level3Difficulty') || 'easy'

let cards = []
let flippedCards = []
let matchedPairs = 0
let lockBoard = false
let hintUsed = false

let introTimer = null
let previewStartTimer = null
let previewEndTimer = null

const board = document.getElementById('memoryBoard')
const message = document.getElementById('message')
const progressText = document.getElementById('progressText')
const finishBox = document.getElementById('finishBox')
const helpBtn = document.getElementById('helpBtn')
const backBtn = document.querySelector('.back-btn')

function startGame() {
  clearLevelTimers()

  matchedPairs = 0
  flippedCards = []
  lockBoard = true
  hintUsed = false

  document.body.classList.remove('finished')
  document.body.classList.add('memory-intro')

  finishBox.classList.remove('show')
  board.innerHTML = ''

  helpBtn.disabled = true
  helpBtn.style.display = 'none'

  progressText.style.display = 'none'
  progressText.textContent = `Parovi 0 / ${basePairs.length}`

  if (backBtn) {
    backBtn.style.display = 'none'
  }

  message.textContent = 'Jesi spreman/spremna? 🌟'
  message.className = 'message good'

  introTimer = setTimeout(() => {
    showReadyIntro()
  }, difficultyTimes[difficulty].intro)
}

function showReadyIntro() {
  message.textContent = 'Dobro pogledaj parove 👀'
  message.className = 'message good'

  cards = shuffleArray([...basePairs, ...basePairs]).map((card, index) => ({
    ...card,
    uniqueId: `${card.id}-${index}`,
    matched: false
  }))

  renderCards()

  previewStartTimer = setTimeout(() => {
    previewCards()
  }, 700)
}

function renderCards() {
  board.innerHTML = ''

  cards.forEach((card) => {
    const button = document.createElement('button')

    button.type = 'button'
    button.className = 'memory-card'
    button.setAttribute('aria-label', 'Skriveni planet')
    button.dataset.id = card.id
    button.dataset.uniqueId = card.uniqueId

    button.innerHTML = `
      <span class="memory-card-inner">
        <span class="memory-face memory-front"></span>
        <span class="memory-face memory-back">
          <span class="memory-symbol">${card.symbol}</span>
        </span>
      </span>
    `

    button.addEventListener('click', () => {
      flipCard(button, card)
    })

    board.appendChild(button)
  })
}

function previewCards() {
  const allButtons = document.querySelectorAll('.memory-card')

  allButtons.forEach((button) => {
    button.classList.add('flipped')
  })

  previewEndTimer = setTimeout(() => {
    allButtons.forEach((button) => {
      button.classList.remove('flipped')
    })

    lockBoard = false
    document.body.classList.remove('memory-intro')

    helpBtn.disabled = false
    helpBtn.style.display = 'inline-flex'

    progressText.style.display = 'block'

    if (backBtn) {
      backBtn.style.display = 'inline-flex'
    }

    message.textContent = 'Klikni na karticu i pronađi par!'
    message.className = 'message'
  }, difficultyTimes[difficulty].preview)
}

function flipCard(button, card) {
  if (lockBoard) return
  if (card.matched) return
  if (flippedCards.some((item) => item.card.uniqueId === card.uniqueId)) return
  if (flippedCards.length >= 2) return

  button.classList.add('flipped')
  playSoftPop()

  flippedCards.push({ button, card })

  if (flippedCards.length === 2) {
    checkMatch()
  }
}

function checkMatch() {
  const [first, second] = flippedCards

  if (first.card.id === second.card.id) {
    first.card.matched = true
    second.card.matched = true

    first.button.classList.add('matched')
    second.button.classList.add('matched')

    matchedPairs++

    progressText.textContent = `Parovi ${matchedPairs} / ${basePairs.length}`

    message.textContent = 'Bravo! Našao/la si par! 🌟'
    message.className = 'message good'

    playCorrectSound()

    flippedCards = []

    if (matchedPairs === basePairs.length) {
      setTimeout(() => {
        showFinish()
      }, 650)
    }

    return
  }

  lockBoard = true

  first.button.classList.add('wrong')
  second.button.classList.add('wrong')

  message.textContent = 'Nije isto. Pokušaj opet 👀'
  message.className = 'message try'

  playTrySound()

  setTimeout(() => {
    first.button.classList.remove('flipped', 'wrong')
    second.button.classList.remove('flipped', 'wrong')

    flippedCards = []
    lockBoard = false
  }, 900)
}

function showHint() {
  if (hintUsed || lockBoard) return

  const unmatchedCards = cards.filter((card) => !card.matched)
  const pairId = unmatchedCards[0]?.id

  if (!pairId) return

  const hintButtons = [...document.querySelectorAll('.memory-card')]
    .filter((button) => button.dataset.id === pairId)
    .filter((button) => !button.classList.contains('matched'))
    .slice(0, 2)

  hintButtons.forEach((button) => {
    button.classList.add('flipped', 'hint')
  })

  setTimeout(() => {
    hintButtons.forEach((button) => {
      button.classList.remove('flipped', 'hint')
    })
  }, 1300)

  hintUsed = true
  helpBtn.disabled = true
  helpBtn.style.display = 'none'

  message.textContent = 'Pogledaj ova dva ✨'
  message.className = 'message good'
}

function showFinish() {
  lockBoard = true
  document.body.classList.remove('memory-intro')

  helpBtn.style.display = 'none'
  progressText.style.display = 'none'

  if (backBtn) {
    backBtn.style.display = 'none'
  }

  document.body.classList.add('finished')
  progressText.textContent = 'Level 3 završen'
  finishBox.classList.add('show')

  localStorage.setItem('level3Completed', 'true')

  playVictoryEffects()
}

function finishLevel() {
  clearLevelTimers()
  window.location.href = 'index.html?returnWarp=1'
}

function goBack() {
  clearLevelTimers()
  window.location.href = 'index.html?returnWarp=1'
}

function toggleDifficultyMenu() {
  const menu = document.getElementById('difficultyMenu')
  if (!menu) return

  menu.classList.toggle('open')
}

function setDifficulty(level) {
  if (!difficultyTimes[level]) return

  difficulty = level
  localStorage.setItem('level3Difficulty', level)

  updateDifficultyUI()

  const menu = document.getElementById('difficultyMenu')
  if (menu) {
    menu.classList.remove('open')
  }

  startGame()
}

function updateDifficultyUI() {
  document.querySelectorAll('[data-difficulty]').forEach((button) => {
    const isActive = button.dataset.difficulty === difficulty
    button.classList.toggle('active', isActive)
  })
}

function setupDifficultyCloseEvents() {
  document.addEventListener('click', (event) => {
    const menu = document.getElementById('difficultyMenu')

    if (!menu) return
    if (!menu.classList.contains('open')) return
    if (menu.contains(event.target)) return

    menu.classList.remove('open')
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return

    const menu = document.getElementById('difficultyMenu')
    if (menu) {
      menu.classList.remove('open')
    }
  })
}

function clearLevelTimers() {
  if (introTimer) {
    clearTimeout(introTimer)
    introTimer = null
  }

  if (previewStartTimer) {
    clearTimeout(previewStartTimer)
    previewStartTimer = null
  }

  if (previewEndTimer) {
    clearTimeout(previewEndTimer)
    previewEndTimer = null
  }
}

function shuffleArray(array) {
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]

    shuffled[i] = shuffled[randomIndex]
    shuffled[randomIndex] = temp
  }

  return shuffled
}

function playCorrectSound() {
  playTone([660, 880], 0.14, 0.12)
}

function playTrySound() {
  playTone([260], 0.1, 0.08)
}

function playSoftPop() {
  playTone([420], 0.05, 0.04)
}

function playVictoryEffects() {
  playVictorySound()
  createConfetti()
}

function playVictorySound() {
  playTone([523.25, 659.25, 783.99], 0.18, 0.13)
}

function playTone(notes, volume = 0.12, spacing = 0.1) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()

      oscillator.connect(gain)
      gain.connect(audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine'

      const startTime = audioContext.currentTime + index * spacing

      gain.gain.setValueAtTime(0.0001, startTime)
      gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.18)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.2)
    })
  } catch (error) {
    console.warn('Sound effect nije pokrenut:', error)
  }
}

function createConfetti() {
  const colors = ['#ffffff', '#19d9ff', '#19d978', '#ffed4a', '#ff7ad9']

  for (let i = 0; i < 34; i++) {
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