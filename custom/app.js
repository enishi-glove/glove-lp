import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.167.1/examples/jsm/controls/OrbitControls.js';

const state = {
  model: '内野手用', body: '#c98b43', bodyName: 'キャメル',
  lace: '#5b2f19', laceName: 'ブラウン', stitch: '#d7a61c', stitchName: 'ゴールド',
  embroidery: 'R. Takumi', embroideryColor: '#5b2f19', font: 'cursive'
};

const viewer = document.getElementById('viewer');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, viewer.clientWidth / viewer.clientHeight, 0.1, 100);
camera.position.set(0, 1.2, 7.2);

const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(viewer.clientWidth, viewer.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
viewer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 4.2;
controls.maxDistance = 11;
controls.target.set(0, .2, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0x8f7356, 2.4));
const key = new THREE.DirectionalLight(0xffffff, 3.2); key.position.set(3,5,5); key.castShadow = true; scene.add(key);
const rim = new THREE.DirectionalLight(0xffdfb8, 1.3); rim.position.set(-4,2,-3); scene.add(rim);

const floor = new THREE.Mesh(new THREE.CircleGeometry(3.4, 64), new THREE.ShadowMaterial({ color:0x000000, opacity:.12 }));
floor.rotation.x = -Math.PI/2; floor.position.y = -1.75; floor.receiveShadow = true; scene.add(floor);

const glove = new THREE.Group(); glove.rotation.set(-0.12, 0.48, -0.08); scene.add(glove);
const bodyMat = new THREE.MeshStandardMaterial({ color:state.body, roughness:.72, metalness:.02 });
const laceMat = new THREE.MeshStandardMaterial({ color:state.lace, roughness:.8 });
const stitchMat = new THREE.MeshStandardMaterial({ color:state.stitch, roughness:.6 });

function roundedBox(w,h,d,r=0.18){
  const shape = new THREE.Shape(); const x=-w/2,y=-h/2;
  shape.moveTo(x+r,y); shape.lineTo(x+w-r,y); shape.quadraticCurveTo(x+w,y,x+w,y+r);
  shape.lineTo(x+w,y+h-r); shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  shape.lineTo(x+r,y+h); shape.quadraticCurveTo(x,y+h,x,y+h-r);
  shape.lineTo(x,y+r); shape.quadraticCurveTo(x,y,x+r,y);
  const g=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r*.38,bevelThickness:r*.38});
  g.center(); return g;
}
function meshBox(w,h,d,mat,pos,rot=[0,0,0],r=.18){ const m=new THREE.Mesh(roundedBox(w,h,d,r),mat);m.position.set(...pos);m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;glove.add(m);return m; }

const palm = meshBox(3.5,2.8,.72,bodyMat,[0,-.1,0],[0,0,.05],.42);
meshBox(1.18,2.45,.65,bodyMat,[-1.45,1.65,.04],[0,0,.16],.32);
meshBox(.98,2.82,.62,bodyMat,[-.45,2.05,.02],[0,0,.06],.30);
meshBox(.92,2.72,.6,bodyMat,[.48,2.02,.02],[0,0,-.04],.28);
meshBox(.84,2.35,.58,bodyMat,[1.28,1.75,.04],[0,0,-.13],.26);
meshBox(1.02,1.78,.65,bodyMat,[1.74,.1,.06],[0,0,-.62],.30);
meshBox(2.25,.8,.7,bodyMat,[-.65,-1.68,.04],[0,0,.06],.22);

// Web bridge
const bridge1=meshBox(.42,2.1,.42,bodyMat,[1.2,.75,.06],[0,0,-.08],.16);
const bridge2=meshBox(.42,2.0,.42,bodyMat,[.48,.9,.08],[0,0,.08],.16);
for(let i=0;i<4;i++) meshBox(.9,.18,.24,laceMat,[.85,.25+i*.47,.5],[0,0,0],.08);

// Lace strips around edges
function laceStrip(points){ const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))); const geo=new THREE.TubeGeometry(curve,64,.055,8,false); const m=new THREE.Mesh(geo,laceMat);m.castShadow=true;glove.add(m);return m; }
laceStrip([[-1.65,-1.2,.45],[-1.8,.2,.48],[-1.6,1.45,.48],[-1.1,2.65,.4]]);
laceStrip([[1.55,-.95,.44],[1.85,-.05,.44],[1.45,1.4,.44],[1.2,2.65,.36]]);
laceStrip([[-.9,-1.62,.45],[0,-1.8,.48],[.95,-1.65,.45]]);

// decorative stitch lines
for(let i=0;i<5;i++){
  const y=-.7+i*.42; const geo=new THREE.CylinderGeometry(.018,.018,2.4,8); geo.rotateZ(Math.PI/2); const s=new THREE.Mesh(geo,stitchMat); s.position.set(-.2,y,.42); glove.add(s);
}

// Embroidery via canvas texture
const canvas=document.createElement('canvas'); canvas.width=1024; canvas.height=256; const ctx=canvas.getContext('2d');
const texture=new THREE.CanvasTexture(canvas); texture.colorSpace=THREE.SRGBColorSpace;
const labelMat=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false});
const label=new THREE.Mesh(new THREE.PlaneGeometry(2.7,.68),labelMat); label.position.set(.15,-.45,.395); label.rotation.z=.08; glove.add(label);
function drawEmbroidery(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle=state.embroideryColor; ctx.textAlign='center'; ctx.textBaseline='middle';
  const family = state.font==='cursive' ? 'cursive' : state.font==='serif' ? 'Georgia' : 'Arial';
  ctx.font=`700 132px ${family}`; ctx.fillText(state.embroidery || ' ',512,132,920); texture.needsUpdate=true;
  const prev=document.getElementById('embroideryPreview'); prev.textContent=state.embroidery || ' '; prev.style.color=state.embroideryColor; prev.style.fontFamily=family;
}
drawEmbroidery();

let spinning=false;
function animate(){ requestAnimationFrame(animate); if(spinning) glove.rotation.y += .006; controls.update(); renderer.render(scene,camera); }
animate();

function resize(){ const w=viewer.clientWidth,h=viewer.clientHeight; renderer.setSize(w,h); camera.aspect=w/h; camera.updateProjectionMatrix(); }
window.addEventListener('resize',resize);

document.querySelectorAll('.model-card').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.model-card').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); state.model=btn.dataset.model; document.getElementById('sumModel').textContent=state.model;
  const scale = state.model==='外野手用'?1.08:state.model==='投手用'?1.03:1; glove.scale.setScalar(scale);
}));

document.querySelectorAll('.swatches').forEach(group=>group.addEventListener('click',e=>{
  const sw=e.target.closest('.swatch'); if(!sw)return; group.querySelectorAll('.swatch').forEach(x=>x.classList.remove('active')); sw.classList.add('active');
  const target=group.dataset.target, color=sw.dataset.color, name=sw.dataset.name;
  if(target==='body'){state.body=color;state.bodyName=name;bodyMat.color.set(color);document.getElementById('bodyColorName').textContent=name;document.getElementById('sumBody').textContent=name;document.getElementById('sumBodyDot').style.background=color;}
  if(target==='lace'){state.lace=color;state.laceName=name;laceMat.color.set(color);document.getElementById('laceColorName').textContent=name;document.getElementById('sumLace').textContent=name;document.getElementById('sumLaceDot').style.background=color;}
  if(target==='stitch'){state.stitch=color;state.stitchName=name;stitchMat.color.set(color);document.getElementById('stitchColorName').textContent=name;document.getElementById('sumStitch').textContent=name;document.getElementById('sumStitchDot').style.background=color;}
}));

document.getElementById('embroideryInput').addEventListener('input',e=>{state.embroidery=e.target.value;document.getElementById('sumEmbroidery').textContent=state.embroidery||'なし';drawEmbroidery();});
document.getElementById('embroideryColor').addEventListener('input',e=>{state.embroideryColor=e.target.value;drawEmbroidery();});
document.getElementById('fontSelect').addEventListener('change',e=>{state.font=e.target.value;drawEmbroidery();});
document.getElementById('spinBtn').addEventListener('click',e=>{spinning=!spinning;e.currentTarget.classList.toggle('active',spinning)});
document.getElementById('zoomIn').addEventListener('click',()=>{camera.position.multiplyScalar(.9)});
document.getElementById('zoomOut').addEventListener('click',()=>{camera.position.multiplyScalar(1.1)});
document.getElementById('resetView').addEventListener('click',()=>{camera.position.set(0,1.2,7.2);controls.target.set(0,.2,0);glove.rotation.set(-.12,.48,-.08);controls.update()});

document.getElementById('resetBtn').addEventListener('click',()=>location.reload());
document.getElementById('saveBtn').addEventListener('click',()=>{localStorage.setItem('enishiCustom',JSON.stringify(state));alert('この端末にデザインを保存しました。');});
document.getElementById('shareBtn').addEventListener('click',async()=>{const txt=`ENISHI Custom Glove｜${state.model} / ${state.bodyName} / 刺繍:${state.embroidery}`; if(navigator.share){await navigator.share({title:'ENISHI Custom Glove',text:txt,url:location.href});}else{await navigator.clipboard.writeText(`${txt}\n${location.href}`);alert('共有用テキストをコピーしました。');}});
document.getElementById('orderBtn').addEventListener('click',()=>{const qs=new URLSearchParams({model:state.model,body:state.bodyName,lace:state.laceName,stitch:state.stitchName,embroidery:state.embroidery}).toString();location.href=`../#contact?${qs}`;});

// Initialize summary dots
['Body','Lace','Stitch'].forEach(k=>document.getElementById(`sum${k}Dot`).style.background=state[k.toLowerCase()]);
