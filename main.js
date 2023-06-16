import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { gsap } from "gsap";
import "./style.css";
//scene

const scene = new THREE.Scene();

//create a object

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
precision highp sampler3D;
uniform sampler3D texture3D;
varying vec2 vUv;

void main() {
  vec3 texCoords = vec3(vUv, 0.5);
  vec4 color = texture(texture3D, texCoords);
  gl_FragColor = color;
}
`;

const width = 32;
const height = 32;
const depth = 32;
const voxelData = new Uint8Array(width * height * depth * 4); // RGBA format

// Populate voxelData with sample values
for (let z = 0; z < depth; z++) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (z * width * height + y * width + x) * 4;
      voxelData[index] = x / width * 255; // R component
      voxelData[index + 1] = y / height * 255; // G component
      voxelData[index + 2] = z / depth * 255; // B component
      voxelData[index + 3] = 255; // A component (fully opaque)
    }
  }
}


const geometry = new THREE.SphereGeometry(3, 64, 64);
const texture = new THREE.DataTexture(voxelData, width, height, depth);
// const material = new THREE.ShaderMaterial({
//   vertexShader: vertexShader,
//   fragmentShader: fragmentShader,
//   uniforms: {
//     texture3D: { value: texture },
//   },
// });


const material = new THREE.MeshPhysicalMaterial({
  color: "#00ff83",
});
const mesh = new THREE.Mesh(geometry, material, texture);
scene.add(mesh);

//sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//light
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(1, 10, 10);
scene.add(light);
// const amblight = new THREE.AmbientLight();
// scene.add(amblight);

//camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height);
camera.position.z = 20;
scene.add(camera);

//renderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);
renderer.setPixelRatio(2);
//controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 6;

//resize
window.addEventListener("resize", () => {
  //update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  //update camera
  camera.updateProjectionMatrix();
  camera.aspect = sizes.width / sizes.height;
  renderer.setSize(sizes.width, sizes.height);
});

const loop = () => {
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(loop);
};

loop();

//gasp
const t1 = gsap.timeline({ defaults: { duration: 1 } });
t1.fromTo(mesh.scale, { z: 0, x: 0, y: 0 }, { z: 1, x: 1, y: 1 });
