import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
// import { AnaglyphEffect } from "three/examples/jsm/effects/AnaglyphEffect"
import GUI from "lil-gui"
import "./style.scss"
import portalImage from "./portal.png"
// @ts-ignore
import vertexShader from "./shaders/vertex.glsl"
// @ts-ignore
import fragmentShader from "./shaders/fragment.glsl"

const CUBES_NUMBER = 7
const CUBE_SIZE = 1
const RADIUS = CUBE_SIZE * 5

const gui = new GUI()
gui.add(document, "title")
gui.hide()

const portalTexture = new THREE.TextureLoader().load(portalImage)

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
// const effect = new AnaglyphEffect(renderer)
// effect.setSize(window.innerWidth, window.innerHeight)

const controls = new OrbitControls(camera, renderer.domElement)

// controls.enableZoom = false
// const objects = gui.addFolder(`3D Objects`)

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
const geometry = new THREE.SphereGeometry(
  CUBE_SIZE,
  CUBE_SIZE * 8,
  CUBE_SIZE * 8
)

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
const materialShaders = new THREE.RawShaderMaterial({
  vertexShader,
  fragmentShader,
  transparent: true,
  uniforms: {
    uFrequency: { value: new THREE.Vector2(10, 5) },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("orange") },
    uTexture: { value: portalTexture },
  },
})
const ringGeometry = new THREE.RingGeometry(RADIUS, RADIUS, 40, 40)
const ring = new THREE.Mesh(ringGeometry, materialShaders)

scene.add(ring)

window.addEventListener("resize", onWindowResize, false)
window.addEventListener(
  "scroll",
  () => {
    const scroll = window.pageYOffset
    const height =
      document.querySelector<HTMLDivElement>("#app")!.getBoundingClientRect()
        .height - window.innerHeight
    const ratioScroll = scroll / height
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(
        RADIUS * Math.abs(ratioScroll - 1),
        RADIUS,
        40,
        40
      ),
      materialShaders
    )
    ring.add(mesh)
    for (let i = ring.children.length - 1; i >= 0; i--) {
      if (ring.children[i].uuid !== mesh.uuid) ring.remove(ring.children[i])
    }
  },
  false
)

export const onResize = () => {
  document.body.style.setProperty(
    "--vh",
    `${document.documentElement.clientHeight / 100}px`
  )
}
onResize()
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  render()
  onResize()
}

const clock = new THREE.Clock()
function animate() {
  requestAnimationFrame(animate)
  const elapsedTime = clock.getElapsedTime()
  materialShaders.uniforms.uTime.value = elapsedTime * 3

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

  // ring.mesh.geometry.parameters.innerRadius = RADIUS * Math.abs(ratioScroll - 1)

  // const currAngle = ratioScroll * (Math.PI / (CUBES_NUMBER / 2))
  // console.log(
  //   RADIUS * (1 + ratioScroll) * Math.cos(currAngle),
  //   RADIUS * (1 + ratioScroll) * Math.sin(currAngle)
  // )

  camera.position.z = RADIUS * 2 * (1 + ratioScroll)
  // camera.position.y = RADIUS * (1 + ratioScroll) * Math.cos(currAngle)
  // camera.position.x = 1 - RADIUS * 2 * (1 + ratioScroll) * Math.sin(currAngle)
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  controls.update()

  render()
}

function render() {
  renderer.render(scene, camera)
}
animate()
