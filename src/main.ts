import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { AnaglyphEffect } from "three/examples/jsm/effects/AnaglyphEffect"
import GUI from "lil-gui"
import "./style.scss"

const CUBES_NUMBER = 24
const CUBE_SIZE = 2
const RADIUS = CUBE_SIZE * 8

const gui = new GUI()
gui.add(document, "title")

const scene = new THREE.Scene()
scene.background = new THREE.Color("#111111")

const options = {
  background: "#111111",
  color: "#c486ff",
  wireframe: 0,
  count: CUBES_NUMBER,
  number: CUBES_NUMBER,
}

gui
  .addColor(options, "background")
  .onChange((e: any) => (scene.background = new THREE.Color(e)))
gui.add(options, "number")

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.z = RADIUS * 2

const anbientLight = new THREE.AmbientLight(0x209f6f, 0.1)
const dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
dirLight.position.set(0, 0, 10).normalize()

dirLight.lookAt(0, 0)
// dirLight.color.setHSL(0.8, 0.7, 0.5)
scene.add(dirLight, anbientLight)

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector<HTMLCanvasElement>(".webgl-canvas")!,
  alpha: true,
  antialias: true,
})
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// TODO: Post processing effects
const effect = new AnaglyphEffect(renderer)
effect.setSize(window.innerWidth, window.innerHeight)

const controls = new OrbitControls(camera, renderer.domElement)

// controls.enableZoom = false
// const objects = gui.addFolder(`3D Objects`)
// objects.hide()

const cubes = new THREE.Group()

// const color = new THREE.Color(0xffffff)
// color.setHex(Math.random() * 0xffffff)

const material = new THREE.MeshPhongMaterial({
  color: options.color,
  // specular: 0xff3600,
  shininess: 20,
  reflectivity: 10,
  flatShading: true,
  // wireframe: true,
})
const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)

for (let i = 1; i <= CUBES_NUMBER; i++) {
  const currAngle = i * (Math.PI / (CUBES_NUMBER / 2))
  const cube = new THREE.Mesh(geometry, material)
  cube.rotation.x = Math.random()
  cube.position.set(
    RADIUS * Math.cos(currAngle),
    RADIUS * Math.sin(currAngle),
    0
  )
  cubes.add(cube)
}

scene.add(cubes)

window.addEventListener("resize", onWindowResize, false)

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  render()
}

function animate() {
  requestAnimationFrame(animate)

  for (const cube of cubes.children) {
    cube.rotation.x += 0.006
    cube.rotation.y += 0.006
  }

  const scroll = window.pageYOffset
  const height =
    document.querySelector<HTMLDivElement>("#app")!.getBoundingClientRect()
      .height - window.innerHeight

  const ratioScroll = scroll / height

  cubes.rotateOnAxis(new THREE.Vector3(0, 0, 1), ratioScroll * 0.05)

  camera.position.z = RADIUS * 2 * (1 + ratioScroll)

  controls.update()

  render()
}

function render() {
  renderer.render(scene, camera)
}
animate()
