import './style.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'


/* =========================================================
   STATE
========================================================= */

let earth = null
let mixer = null
let orbitPaused = false
let isTraveling = false


/* =========================================================
   TIMER
========================================================= */

const timer = new THREE.Timer()
timer.connect(document)


/* =========================================================
   SCENE
========================================================= */

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x07111f)


/* =========================================================
   CAMERA
========================================================= */

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
)

camera.position.set(0, 1.5, 4)


/* =========================================================
   RENDERER
========================================================= */

const renderer = new THREE.WebGLRenderer({
  antialias: true
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

document.body.prepend(renderer.domElement)

renderer.domElement.style.position = 'fixed'
renderer.domElement.style.inset = '0'
renderer.domElement.style.zIndex = '1'


/* =========================================================
   CONTROLS
========================================================= */

const controls = new OrbitControls(camera, renderer.domElement)

controls.enableDamping = true
controls.enablePan = false


/* =========================================================
   LIGHTS
========================================================= */

const ambientLight = new THREE.AmbientLight(0xffffff, 1.8)
scene.add(ambientLight)

const dirLight = new THREE.DirectionalLight(0xffffff, 3)
dirLight.position.set(3, 4, 5)
scene.add(dirLight)


/* =========================================================
   TRAVEL OVERLAY
========================================================= */

const travelOverlay = document.createElement('div')
travelOverlay.className = 'travel-overlay'
document.body.appendChild(travelOverlay)


/* =========================================================
   MODEL LOADER
========================================================= */

const loader = new GLTFLoader()

loader.load(
  '/earth-cartoon/source/earth-cartoon.glb',

  (gltf) => {
    earth = gltf.scene

    earth.scale.set(1.4, 1.4, 1.4)
    scene.add(earth)

    setupAnimations(gltf)
    checkReturnWarp()
  }
)


/* =========================================================
   ANIMATIONS
========================================================= */

function setupAnimations(gltf) {
  if (!gltf.animations || gltf.animations.length === 0) {
    return
  }

  mixer = new THREE.AnimationMixer(earth)

  gltf.animations.forEach((clip) => {
    mixer.clipAction(clip).play()
  })
}


/* =========================================================
   PAUSE EVENT
========================================================= */

window.addEventListener('pause-orbit', (e) => {
  orbitPaused = e.detail.paused
  controls.enabled = !orbitPaused
})


/* =========================================================
   ENTER LEVEL - FORWARD WARP
========================================================= */

window.addEventListener('start-level-travel', (e) => {
  if (isTraveling) return

  isTraveling = true

  const targetUrl = e.detail.url

  document.body.classList.add('traveling')
  travelOverlay.classList.add('show')

  controls.enabled = false
  orbitPaused = true

  startCameraTravel(targetUrl)
})

function startCameraTravel(targetUrl) {
  const startPosition = camera.position.clone()
  const endPosition = new THREE.Vector3(0, 0.35, 60)

  const startRotationY = earth ? earth.rotation.y : 0

  const duration = 2500
  const startTime = performance.now()

  function travelFrame(now) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeInOutCubic(progress)

    camera.position.lerpVectors(startPosition, endPosition, eased)
    camera.lookAt(0, 0, 0)

    if (earth) {
      earth.rotation.y = startRotationY + eased * Math.PI * 3
      earth.scale.setScalar(1.4 + eased * 1.25)

      if (progress > 0.7) {
        const fade = Math.max(0, 1 - (progress - 0.7) / 0.3)

        earth.traverse((node) => {
          if (node.material) {
            setMaterialOpacity(node.material, fade)
          }
        })
      }
    }

    renderer.render(scene, camera)

    if (progress < 1) {
      requestAnimationFrame(travelFrame)
    } else {
      travelOverlay.classList.add('final')

      setTimeout(() => {
        window.location.href = targetUrl
      }, 240)
    }
  }

  requestAnimationFrame(travelFrame)
}


/* =========================================================
   RETURN WARP FROM LEVEL PAGE
========================================================= */

function checkReturnWarp() {
  const params = new URLSearchParams(window.location.search)
  const isReturnWarp = params.get('returnWarp') === '1'

  if (!isReturnWarp || !earth) return

  isTraveling = true

  document.body.classList.add('traveling')
  document.body.classList.add('return-warping')
  travelOverlay.classList.add('show')

  controls.enabled = false
  orbitPaused = true

  camera.position.set(0, 0.35, 60)
  camera.lookAt(0, 0, 0)

  earth.scale.setScalar(2.65)

  earth.traverse((node) => {
    if (node.material) {
      setMaterialOpacity(node.material, 0)
    }
  })

  startPlanetReturnIntro()
}

function startPlanetReturnIntro() {
  const startPosition = camera.position.clone()
  const endPosition = new THREE.Vector3(0, 1.5, 4)

  const startScale = 2.65
  const endScale = 1.4

  const duration = 1800
  const startTime = performance.now()

  function introFrame(now) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeInOutCubic(progress)

    camera.position.lerpVectors(startPosition, endPosition, eased)
    camera.lookAt(0, 0, 0)

    if (earth) {
      earth.rotation.y += 0.018
      earth.scale.setScalar(startScale + (endScale - startScale) * eased)

      earth.traverse((node) => {
        if (node.material) {
          setMaterialOpacity(node.material, eased)
        }
      })
    }

    renderer.render(scene, camera)

    if (progress < 1) {
      requestAnimationFrame(introFrame)
    } else {
      travelOverlay.classList.remove('show')
      travelOverlay.classList.remove('final')

      document.body.classList.remove('traveling')
      document.body.classList.remove('return-warping')
      document.documentElement.classList.remove('return-warping-preload')

      controls.enabled = true
      orbitPaused = false
      isTraveling = false

      window.history.replaceState({}, document.title, 'index.html')
    }
  }

  requestAnimationFrame(introFrame)
}


/* =========================================================
   MATERIAL HELPERS
========================================================= */

function setMaterialOpacity(material, opacity) {
  if (Array.isArray(material)) {
    material.forEach((mat) => {
      mat.transparent = true
      mat.opacity = opacity
    })
  } else {
    material.transparent = true
    material.opacity = opacity
  }
}


/* =========================================================
   RENDER LOOP
========================================================= */

function animate() {
  requestAnimationFrame(animate)

  if (isTraveling) return

  timer.update()

  const delta = timer.getDelta()

  if (!orbitPaused) {
    updateModel(delta)
  }

  if (controls.enabled) {
    controls.update()
  }

  renderer.render(scene, camera)
}

function updateModel(delta) {
  if (mixer) {
    mixer.update(delta)
  }

  if (earth) {
    earth.rotation.y += 0.002
  }
}

animate()


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/* =========================================================
   EASING
========================================================= */

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}