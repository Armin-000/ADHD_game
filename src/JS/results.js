const RESULTS_KEY = 'childResults'

const resultsList = document.getElementById('resultsList')
const totalScoreEl = document.getElementById('totalScore')
const totalTimeEl = document.getElementById('totalTime')
const accuracyEl = document.getElementById('accuracy')

renderResults()

function getResults() {
  const saved = localStorage.getItem(RESULTS_KEY)

  if (!saved) return []

  try {
    const parsed = JSON.parse(saved)

    if (Array.isArray(parsed)) {
      return parsed
    }
  } catch (error) {
    console.warn('Greška kod čitanja rezultata:', error)
  }

  return []
}

function renderResults() {
  const results = getResults()

  renderSummary(results)
  renderResultList(results)
}

function renderSummary(results) {
  const totalScore = results.reduce((sum, item) => sum + Number(item.score || 0), 0)
  const totalMaxScore = results.reduce((sum, item) => sum + Number(item.maxScore || 0), 0)
  const totalDuration = results.reduce((sum, item) => sum + Number(item.duration || 0), 0)

  const accuracy =
    totalMaxScore > 0
      ? Math.round((totalScore / totalMaxScore) * 100)
      : 0

  totalScoreEl.textContent = `${totalScore} / ${totalMaxScore}`
  totalTimeEl.textContent = formatDuration(totalDuration)
  accuracyEl.textContent = `${accuracy}%`
}

function renderResultList(results) {
  if (!resultsList) return

  if (results.length === 0) {
    resultsList.innerHTML = `
      <div class="empty-results">
        Još nema spremljenih rezultata.
      </div>
    `
    return
  }

  const sortedResults = [...results].reverse()

  resultsList.innerHTML = sortedResults
    .map((result) => {
      const level = Number(result.level || 0)
      const score = Number(result.score || 0)
      const maxScore = Number(result.maxScore || 0)
      const duration = Number(result.duration || 0)
      const difficulty = result.difficulty || 'standard'
      const date = result.date || 'Nepoznato vrijeme'

      return `
        <article class="result-item">
          <div class="result-level-icon">
            ${getLevelIcon(level)}
          </div>

          <div class="result-content">
            <h3>${getLevelTitle(level)}</h3>

            <div class="result-meta">
              <span class="result-pill">⏱️ ${formatDuration(duration)}</span>
              <span class="result-pill">📅 ${date}</span>
              <span class="result-pill">🎮 ${formatDifficulty(difficulty)}</span>
            </div>
          </div>

          <div class="result-score">
            <strong>${score} / ${maxScore}</strong>
            <span>${getScoreLabel(score, maxScore)}</span>
          </div>
        </article>
      `
    })
    .join('')
}

function getLevelTitle(level) {
  if (level === 1) return 'Level 1 — Slova i glasovi'
  if (level === 2) return 'Level 2 — Slogovi i riječi'
  if (level === 3) return 'Level 3 — Memorija'

  return `Level ${level}`
}

function getLevelIcon(level) {
  if (level === 1) return '🔤'
  if (level === 2) return '🧩'
  if (level === 3) return '🪐'

  return '🎮'
}

function getScoreLabel(score, maxScore) {
  if (maxScore <= 0) return 'Nema bodova'

  const percentage = (score / maxScore) * 100

  if (percentage >= 90) return 'Odlično'
  if (percentage >= 70) return 'Vrlo dobro'
  if (percentage >= 50) return 'Dobro'
  return 'Treba još vježbe'
}

function formatDifficulty(difficulty) {
  if (difficulty === 'easy') return 'Lagano'
  if (difficulty === 'normal') return 'Normalno'
  if (difficulty === 'hard') return 'Teško'

  return 'Standard'
}

function formatDuration(seconds) {
  const totalSeconds = Number(seconds || 0)

  if (totalSeconds <= 0) return '0s'

  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60

  if (minutes === 0) {
    return `${remainingSeconds}s`
  }

  return `${minutes}min ${remainingSeconds}s`
}

function goBack() {
  window.location.href = 'index.html'
}

function clearResults() {
  if (!confirm('Želiš li obrisati sve spremljene rezultate?')) return

  localStorage.removeItem(RESULTS_KEY)
  renderResults()
}

function exportResultsPDF() {
  window.print()
}