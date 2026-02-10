import { toSolids, type PackageConfig } from '@/lib/packages';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createScene(container: HTMLDivElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202020);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.left = -5;
  directionalLight.shadow.camera.right = 5;
  directionalLight.shadow.camera.top = 5;
  directionalLight.shadow.camera.bottom = -5;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
  scene.add(directionalLight);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(6, 4, 6);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  // controls.listenToKeyEvents(window);

  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  controls.screenSpacePanning = false;

  controls.minDistance = 1;
  controls.maxDistance = 50;

  function render() {
    renderer.render(scene, camera);
  }

  function animate() {
    controls.update();
    render();
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function destroy() {
    window.removeEventListener('resize', onWindowResize);
    controls.dispose();
    renderer.dispose();
  }

  window.addEventListener('resize', onWindowResize);

  const helpers = new THREE.Group();
  scene.add(helpers);

  const axesHelper = new THREE.AxesHelper(5);
  axesHelper.setColors(new THREE.Color(0xde3a46), new THREE.Color(0x007ef3), new THREE.Color(0x00a25c));
  axesHelper.renderOrder = 999; // Ensure axes are rendered on top
  helpers.add(axesHelper);

  const gridHelper = new THREE.GridHelper(100, 100, 0x888888, 0x444444);
  gridHelper.renderOrder = 1;
  helpers.add(gridHelper);

  const models: THREE.Object3D[] = [];

  return {
    scene,
    camera,
    renderer,
    controls,
    models,
    destroy,
    updateModel: (config: PackageConfig) => updateModel(scene, models, config),
  };
}

const MATERIALS = {
  body: new THREE.MeshStandardMaterial({ color: 0x262525 }),
  pad: new THREE.MeshStandardMaterial({ color: 0xd2d1c7 }),
};

function updateModel(scene: THREE.Scene, models: THREE.Object3D[], config: PackageConfig) {
  // Clear existing models
  models.forEach((model) => scene.remove(model));
  models.length = 0;

  const solids = toSolids(config);

  const model = new THREE.Group();

  solids.forEach((solid) => {
    // solid coordinates are Z-up
    const geometry = new THREE.BoxGeometry(solid.size[0], solid.size[2], solid.size[1]);
    const material = MATERIALS[solid.type];
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(solid.position[0], solid.position[2], solid.position[1]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    model.add(mesh);
  });

  scene.add(model);
  models.push(model);
}
