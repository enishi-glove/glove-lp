import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

};
camera.position.set(0, 1.2, 7.2);
const canvas = document.querySelector('#gloveCanvas');
const viewer = document.querySelector('.viewer');
const loading = document.querySelector('#loading');
const errorBox = document.querySelector('#error');

const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf3eee6);

const camera = new THREE.PerspectiveCamera(35, 1, .01, 100);
camera.position.set(0, .35, 3.4);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = .06;
controls.enablePan = false;
controls.minDistance = 1.3;
controls.maxDistance = 6;

scene.add(new THREE.HemisphereLight(0xffffff, 0x6d5a48, 2.1));
const key = new THREE.DirectionalLight(0xffffff, 3.2);
key.position.set(3,4,5); key.castShadow = true; scene.add(key);
const fill = new THREE.DirectionalLight(0xffe4c4, 1.2);
fill.position.set(-4,1,2); scene.add(fill);

let glove, meshes = [];
const colors = {
  body: document.querySelector('#bodyColor'),
  lace: document.querySelector('#laceColor'),
  stitch: document.querySelector('#stitchColor')
};

function classify(name=''){
  const n=name.toLowerCase();
  if(/lace|lacing|cord|himo|紐/.test(n)) return 'lace';
  if(/stitch|thread|seam|縫|糸/.test(n)) return 'stitch';
  return 'body';
}
function applyColors(){
  meshes.forEach(m=>{
    const kind=classify(`${m.name} ${m.material?.name||''}`);
    if(m.material){
      m.material = m.material.clone();
      m.material.color.set(colors[kind].value);
      m.material.needsUpdate=true;
    }
  });
}
Object.values(colors).forEach(el=>el.addEventListener('input', applyColors));

const embroidery = document.querySelector('#embroidery');
const embroideryOut = document.querySelector('#embroideryOut');
embroidery.addEventListener('input', ()=> embroideryOut.textContent = embroidery.value || '—');

const loader = new GLTFLoader();
loader.load('./glove.glb', (gltf)=>{
  glove = gltf.scene;
  meshes=[];
  glove.traverse(o=>{
    if(o.isMesh){
      o.castShadow=true; o.receiveShadow=true;
      meshes.push(o);
    }
  });

  // Auto-center and scale any glove model.
  const box = new THREE.Box3().setFromObject(glove);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  glove.position.sub(center);
  const maxDim = Math.max(size.x,size.y,size.z);
  glove.scale.setScalar(2.25/maxDim);
  scene.add(glove);

  applyColors();
  loading.hidden=true;
  errorBox.hidden=true;
}, undefined, (err)=>{
  console.error('GLB load error:', err);
  loading.hidden=true;
  errorBox.hidden=false;
});

function resize(){
  const w=viewer.clientWidth, h=viewer.clientHeight;
  renderer.setSize(w,h,false);
  camera.aspect=w/h; camera.updateProjectionMatrix();
}
window.addEventListener('resize',resize); resize();

renderer.setAnimationLoop(()=>{
  controls.update();
  renderer.render(scene,camera);
});