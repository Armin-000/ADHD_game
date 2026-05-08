
# 🧠 AI CONTEXT — NeuroPlanet 3D Project

---

## 📌 PROJECT OVERVIEW

**NeuroPlanet 3D** is an interactive educational web application designed for children (especially ADHD-friendly).

The app combines:
- 🌍 3D planet (Three.js)
- 🎮 Level-based mini games
- ✨ Strong visual feedback & simple UX

### 🎯 Goals
- Learning through play
- High engagement (animations, sound, visuals)
- Simple and clear interaction
- ADHD-friendly pacing and structure

---

## ⚙️ TECH STACK

- HTML5
- CSS3 (custom, glassmorphism UI)
- Vanilla JavaScript
- Three.js (3D scene)
- GLTFLoader (3D models)
- LocalStorage (progress system)

---

## 📁 PROJECT STRUCTURE

```

/project
├── index.html                # Main 3D planet hub
├── level1.html              # Letters & sounds
├── level2.html              # Attention & reaction
├── level3.html              # Memory game
│
├── src/
│   ├── main.js              # Three.js scene logic
│   ├── style.css            # Global UI styles
│
│   ├── JS/
│   │   ├── level1.js
│   │   ├── level2.js
│   │   └── level3.js
│
│   ├── CSS/
│   │   ├── level1.css
│   │   ├── level2.css
│   │   └── level3.css

````

---

## 🌍 CORE SYSTEMS

### 🎮 LEVEL SYSTEM

| Level | Description |
|------|------------|
| Level 1 | Letters & sounds |
| Level 2 | Attention & reaction |
| Level 3 | Memory (planet matching) |

---

### 🔐 UNLOCK SYSTEM

Uses `localStorage`:

```js
unlockedLevels = [1]
````

After completing levels:

```js
[1, 2, 3]
```

Key:

```js
"unlockedLevels"
```

---

## 🧠 IMPORTANT LOGIC

### ✔️ NAVIGATION (CRITICAL)

❌ NEVER use:

```js
window.history.back()
```

✅ ALWAYS use:

```js
window.location.href = 'index.html'
```

---

### ✔️ PATH RULE

❌ WRONG:

```js
'/index.html'
```

✅ CORRECT:

```js
'index.html'
```

---

## 🌌 3D SYSTEM (main.js)

### Features:

* Three.js scene
* OrbitControls
* Planet rotation
* GLB model (earth-cartoon)
* AnimationMixer

### Events:

```js
"pause-orbit"
"start-level-travel"
```

---

## 🚀 TRAVEL SYSTEM

* Warp animation
* Overlay: `.travel-overlay`

Camera movement:

```js
(0, 1.5, 4) → (0, 0.35, 60)
```

Redirect:

```js
window.location.href = 'levelX.html'
```

---

## 🔄 RESET SYSTEM

Button:

```html
<button class="reset-btn">
```

Function:

```js
function resetLevels() {
  localStorage.removeItem("unlockedLevels");
  unlockedLevels = [1];
}
```

---

## 🎨 UI STYLE

* Glassmorphism
* Neon glow
* Soft gradients
* Rounded shapes
* Animated cards
* Responsive layout

Font:

* **Lexend**

---

## 🧩 LEVEL DETAILS

---

### 🟡 LEVEL 1 — Letters

* Displays letter (A, M, S…)
* Child selects correct word
* Speech synthesis:

```js
speechSynthesis
```

Unlock condition:

```js
correctAnswers === rounds.length
```

---

### 🔵 LEVEL 2 — Attention

* Reaction-based gameplay
* (Expandable system)

---

### 🟣 LEVEL 3 — MEMORY (IMPORTANT)

#### 🧠 Gameplay

* Flip cards
* Match pairs (planets/emojis)
* ADHD-friendly pacing

---

### 🎮 FLOW

1. Intro screen
2. Preview cards (shown for a few seconds)
3. Cards flip back
4. Player matches pairs
5. Finish screen

---

### ⚙️ DIFFICULTY SYSTEM

Controlled via dropdown ⚙️ (top-right)

| Mode   | Time   |
| ------ | ------ |
| Easy   | 6000ms |
| Normal | 4000ms |
| Hard   | 2500ms |

Stored in:

```js
localStorage.setItem("memoryDifficulty")
```

---

### 🎯 ADHD UX RULES

* Slow intro (important)
* Clear instructions
* Minimal text
* Immediate feedback
* No overwhelming UI

---

### 🔊 SOUND SYSTEM

Uses Web Audio API:

```js
AudioContext
```

Includes:

* correct sound
* wrong sound
* click sound
* victory sound

---

## ⚠️ RULES & CONSTRAINTS

1. ❗ Do NOT break relative paths
2. ❗ Do NOT use history.back()
3. ❗ Do NOT modify Three.js unless needed
4. ❗ Keep UI consistent across levels
5. ❗ Keep UX simple for children

---

## 🧠 AI DEVELOPMENT GUIDELINES

When continuing this project:

### ALWAYS:

* keep design consistent
* reuse existing patterns
* prioritize UX simplicity
* keep animations smooth
* respect ADHD pacing

---

### NEVER:

* overcomplicate UI
* add too much text
* break navigation logic
* change core systems randomly

---

## 💡 FUTURE IDEAS

* ⭐ reward system (stars/badges)
* 🔊 voice guidance
* 🎨 more planets / visuals
* 📱 mobile UX improvements
* 🧠 adaptive difficulty
* 👤 user profiles (backend)

---

## ✅ CURRENT STATUS

✔ Level 1 complete
✔ Level 2 working
✔ Level 3 memory system complete
✔ Difficulty system added
✔ 3D planet working
✔ Warp animation working
✔ Reset system working

---

## 🔥 FINAL NOTE FOR AI

This is a **UX-driven project**, not just technical.

👉 The MOST important thing:

* child-friendly experience
* clarity
* smooth animations
* emotional feedback (sounds + visuals)

---

END OF CONTEXT