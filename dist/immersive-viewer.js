import * as THREE from './vendor/three.module.js';

// Real photographic spheres and a separately labelled procedural landscape.
export class NepalViewer {
 constructor(host, onFrame) {
  this.host=host;this.onFrame=onFrame;this.mode='gosaikunda';this.yaw=0;this.pitch=0;this.fov=72;this.angle=0.65;this.elevation=45;this.distance=112;this.auto=!matchMedia('(prefers-reduced-motion: reduce)').matches;this.visible=true;this.dragging=false;this.request=0;this.time=0;this.loadId=0;this.textureCache=new Map();
  this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power',alpha:false});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));this.renderer.outputColorSpace=THREE.SRGBColorSpace;
  this.renderer.setClearColor(0x122c32);host.appendChild(this.renderer.domElement);this.camera=new THREE.PerspectiveCamera(72,1,.1,1500);
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);
  this.intersectionObserver=new IntersectionObserver(es=>{this.visible=es[0].isIntersecting;if(this.visible)this.start();else this.stop();},{threshold:.05});this.intersectionObserver.observe(host);
  this.visibilityHandler=()=>{if(document.hidden)this.stop();else if(this.visible)this.start();};document.addEventListener('visibilitychange',this.visibilityHandler);
  const canvas=this.renderer.domElement;canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.stop();host.dispatchEvent(new CustomEvent('viewer-error',{bubbles:true,detail:'The 3D view was interrupted. Reload the page to reopen it.'}));});
  this.pointers=new Map();
  canvas.addEventListener('pointerdown',e=>{this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});this.dragging=true;this.last={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);host.focus({preventScroll:true});this.pauseAuto();});
  canvas.addEventListener('pointermove',e=>{if(!this.pointers.has(e.pointerId))return;const prev=this.pointers.get(e.pointerId);this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(this.pointers.size===2){const pts=[...this.pointers.values()];const gap=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);if(this.pinch)this.zoom((this.pinch-gap)*.08);this.pinch=gap;return;}const dx=e.clientX-prev.x,dy=e.clientY-prev.y;if(this.mode==='flight'){this.angle-=dx*.005;this.elevation=THREE.MathUtils.clamp(this.elevation+dy*.13,20,115);}else{this.yaw-=dx*.13;this.pitch=THREE.MathUtils.clamp(this.pitch+dy*.12,-70,70);}});
  const release=e=>{this.pointers.delete(e.pointerId);this.dragging=this.pointers.size>0;this.pinch=null;};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
  canvas.addEventListener('wheel',e=>{if(document.activeElement!==host&&!document.fullscreenElement)return;e.preventDefault();this.pauseAuto();this.zoom(e.deltaY*.03);},{passive:false});
  this.keyHandler=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(e.key))return;e.preventDefault();this.pauseAuto();if(e.key==='Home')this.reset();else if(['+','=','-'].includes(e.key))this.zoom(e.key==='-'?5:-5);else if(this.mode==='flight'){if(e.key==='ArrowLeft')this.angle+=.08;if(e.key==='ArrowRight')this.angle-=.08;if(e.key==='ArrowUp')this.elevation=Math.min(115,this.elevation+4);if(e.key==='ArrowDown')this.elevation=Math.max(20,this.elevation-4);}else{if(e.key==='ArrowLeft')this.yaw-=5;if(e.key==='ArrowRight')this.yaw+=5;if(e.key==='ArrowUp')this.pitch=Math.min(70,this.pitch+4);if(e.key==='ArrowDown')this.pitch=Math.max(-70,this.pitch-4);}};host.addEventListener('keydown',this.keyHandler);
 }
 pauseAuto(){this.auto=false;this.host.dispatchEvent(new CustomEvent('viewer-rotation-change',{bubbles:true,detail:false}));}
 resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
 zoom(delta){if(this.mode==='flight')this.distance=THREE.MathUtils.clamp(this.distance+delta,65,180);else this.fov=THREE.MathUtils.clamp(this.fov+delta,35,100);this.camera.fov=this.fov;this.camera.updateProjectionMatrix();}
 reset(){this.yaw=this.mode==='temple'?40:15;this.pitch=0;this.fov=72;this.angle=.65;this.elevation=45;this.distance=112;this.camera.fov=72;this.camera.updateProjectionMatrix();}
 disposeScene(){if(!this.scene)return;this.scene.traverse(o=>{o.geometry?.dispose();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});}
 async load(mode){const id=++this.loadId;this.stop();this.mode=mode;this.reset();
  if(mode==='flight'){this.disposeScene();this.scene=this.makeMountains();}
  else{const path=mode==='temple'?'assets/immersive/ram-mandir-360.jpg':'assets/immersive/gosaikunda-360.jpg';let texture=this.textureCache.get(path);if(!texture){texture=await new THREE.TextureLoader().loadAsync(path);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());this.textureCache.set(path,texture);}if(id!==this.loadId)return;this.disposeScene();this.scene=new THREE.Scene();const geometry=new THREE.SphereGeometry(400,64,40);geometry.scale(-1,1,1);this.scene.add(new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({map:texture})));}
  if(id!==this.loadId)return;this.resize();this.draw(0);this.start();
 }
 makeMountains(){
  const scene=new THREE.Scene();scene.background=new THREE.Color('#91a8ad');scene.fog=new THREE.FogExp2('#a9b7b4',.0034);
  scene.add(new THREE.HemisphereLight('#bfdce9','#2e3c32',2.1));const sun=new THREE.DirectionalLight('#ffcf96',3.3);sun.position.set(-90,110,-70);scene.add(sun);
  const ground=new THREE.PlaneGeometry(360,360,210,210);ground.rotateX(-Math.PI/2);const pos=ground.attributes.position;const colors=[];const green=new THREE.Color('#304d3f'),rock=new THREE.Color('#747b78'),snow=new THREE.Color('#eef0e4');
  const height=(x,z)=>{const n=(Math.sin(x*.11+Math.sin(z*.07)*2)*Math.cos(z*.09)+Math.sin(x*.31+z*.25)*.25+Math.cos(x*.65-z*.5)*.12);const peaks=[[-66,-55,60,32],[3,-85,88,33],[73,-66,74,31],[-100,25,46,29],[98,13,55,35],[10,66,27,50]];let h=4;for(const [px,pz,amp,spread] of peaks){const d=Math.hypot(x-px,z-pz);h+=amp*Math.exp(-(d*d)/(spread*spread));}h+=n*(3+h*.09);const valley=Math.exp(-Math.pow((x-12*Math.sin(z*.035))/12,2));return Math.max(.3,h*(1-valley*.72));};
  this.terrainHeight=height;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),h=height(x,z);pos.setY(i,h);const c=green.clone();if(h>23)c.lerp(rock,Math.min(1,(h-23)/20));if(h>43+Math.sin(x*.5)*4)c.lerp(snow,Math.min(1,(h-43)/11));c.multiplyScalar(.88+.1*Math.sin(x*.64+z*.73));colors.push(c.r,c.g,c.b);}
  ground.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));ground.computeVertexNormals();scene.add(new THREE.Mesh(ground,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0,flatShading:true})));
  const water=new THREE.Mesh(new THREE.PlaneGeometry(11,180),new THREE.MeshStandardMaterial({color:'#689c9a',roughness:.25,metalness:.35,transparent:true,opacity:.9}));water.rotation.x=-Math.PI/2;water.position.set(0,2,30);scene.add(water);
  const treeGeo=new THREE.ConeGeometry(1,5,6);const treeMat=new THREE.MeshStandardMaterial({color:'#173a31',roughness:1});const trees=new THREE.InstancedMesh(treeGeo,treeMat,650);const dummy=new THREE.Object3D();let count=0;let seed=9521;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};for(let i=0;i<1400&&count<650;i++){const x=(rand()-.5)*250,z=(rand()-.5)*250,h=height(x,z);if(h>30||h<4||Math.abs(x)<9)continue;const scale=.65+rand()*.7;dummy.position.set(x,h+2*scale,z);dummy.scale.setScalar(scale);dummy.rotation.y=rand()*6;dummy.updateMatrix();trees.setMatrixAt(count++,dummy.matrix);}trees.count=count;scene.add(trees);
  // A quiet moving cloud layer, built from translucent geometry.
  const cloudMat=new THREE.MeshBasicMaterial({color:'#f2e8da',transparent:true,opacity:.09,depthWrite:false});const clouds=new THREE.Group();for(let i=0;i<16;i++){const cloud=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),cloudMat);cloud.position.set((rand()-.5)*260,28+rand()*16,(rand()-.5)*170);cloud.scale.set(20+rand()*18,1.5+rand()*2,7+rand()*9);clouds.add(cloud);}scene.add(clouds);this.clouds=clouds;
  // A warm sky disc reads as early light, not a real celestial position.
  const disc=new THREE.Mesh(new THREE.SphereGeometry(9,24,16),new THREE.MeshBasicMaterial({color:'#ffdb9e',fog:false}));disc.position.set(-175,105,-245);scene.add(disc);return scene;
 }
 draw(delta){if(!this.scene)return;if(this.mode==='flight'){if(this.auto&&!this.dragging)this.angle+=delta*.045;this.camera.position.set(Math.sin(this.angle)*this.distance,this.elevation+Math.sin(this.time*.12)*1.2,Math.cos(this.angle)*this.distance);this.camera.lookAt(0,25,-25);if(this.clouds)this.clouds.position.x=Math.sin(this.time*.03)*5;}else{if(this.auto&&!this.dragging)this.yaw+=delta*2.2;const phi=THREE.MathUtils.degToRad(90-this.pitch),theta=THREE.MathUtils.degToRad(this.yaw);this.camera.position.set(0,0,0);this.camera.lookAt(Math.sin(phi)*Math.cos(theta),Math.cos(phi),Math.sin(phi)*Math.sin(theta));}this.renderer.render(this.scene,this.camera);this.onFrame?.(this.mode==='flight'?this.angle*180/Math.PI:this.yaw);}
 start(){if(this.request||!this.scene||!this.visible||document.hidden)return;let last=performance.now();const frame=now=>{const delta=Math.min((now-last)/1000,.05);last=now;this.time+=delta;this.draw(delta);this.request=requestAnimationFrame(frame);};this.request=requestAnimationFrame(frame);}
 stop(){cancelAnimationFrame(this.request);this.request=0;}
 destroy(){this.stop();this.disposeScene();this.textureCache.forEach(t=>t.dispose());this.renderer.dispose();this.resizeObserver.disconnect();this.intersectionObserver.disconnect();document.removeEventListener('visibilitychange',this.visibilityHandler);this.host.removeEventListener('keydown',this.keyHandler);this.renderer.domElement.remove();}
}
