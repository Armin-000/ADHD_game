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
   RENDER LOOP
========================================================= */

function animate() {
  requestAnimationFrame(animate)

  timer.update()

  const delta = timer.getDelta()

  if (!orbitPaused) {
    updateModel(delta)
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