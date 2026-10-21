'use strict';
/* ====================== p1 : données, sauvegarde, monde ====================== */
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const rad=a=>a*Math.PI/180;
function angDiff(a,b){let d=(b-a)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const fmtEur=n=>new Intl.NumberFormat('fr-FR').format(Math.round(n))+' €';
const fmtKm=m=>(m/1000).toFixed(1).replace('.',',')+' km';

const PITCH=100, ROADW=16, NB=12, SIZE=1200;
const DISTRICTS={
  tours:{name:'Quartier des Tours',limit:40,ground:'#c9ccd0'},
  maisons:{name:'Les Pavillons',limit:30,ground:'#a9c791'},
  commerce:{name:'Centre Marchand',limit:40,ground:'#c4bdb2'},
  entrepots:{name:'Les Docks',limit:50,ground:'#a8a8a2'},
  parc:{name:'Parc des Lilas',limit:25,ground:'#8fc07c'}
};
function districtOfBlock(i,j){
  if(i>=4&&i<=7&&j>=4&&j<=7)return 'tours';
  const dx=i-5.5,dy=j-5.5;
  if(Math.abs(dx)>=Math.abs(dy))return dx<0?'maisons':'parc';
  return dy<0?'commerce':'entrepots';
}
function districtAt(x,z){return districtOfBlock(clamp(Math.floor(x/PITCH),0,NB-1),clamp(Math.floor(z/PITCH),0,NB-1))}

/* ---------- catalogue KUKIRIN (valeurs ajustées pour le jeu) ---------- */
const SCOOTERS=[
 {id:'g2',name:'KUKIRIN G2',tier:1,price:0,vmax:45,acc:2.6,brake:3.6,grip:5.5,range:14,color:'#ff6a1a',desc:'Ta première trottinette. Légère, simple, parfaite pour apprendre la ville.'},
 {id:'m4pro',name:'KUKIRIN M4 Pro',tier:2,price:650,vmax:50,acc:2.9,brake:3.9,grip:5.8,range:17,color:'#2b8cff',desc:'Plus nerveuse que la G2, avec une meilleure autonomie.'},
 {id:'g2pro',name:'KUKIRIN G2 Pro',tier:3,price:1400,vmax:55,acc:3.2,brake:4.4,grip:6.1,range:20,color:'#e8e8e8',desc:'Le bon compromis : puissante et confortable.'},
 {id:'g2max',name:'KUKIRIN G2 Max',tier:4,price:2400,vmax:60,acc:3.5,brake:4.8,grip:6.4,range:23,color:'#26c281',desc:'Grosse batterie et vraies relances.'},
 {id:'s1pro',name:'KUKIRIN S1 Pro',tier:5,price:3600,vmax:62,acc:3.8,brake:5.2,grip:6.7,range:23,color:'#9a5cff',desc:'Stable et rapide, elle aime les grandes avenues.'},
 {id:'g3',name:'KUKIRIN G3',tier:6,price:5200,vmax:65,acc:4.1,brake:5.6,grip:7.0,range:25,color:'#ffcf24',desc:'Châssis renforcé, grosses suspensions.'},
 {id:'g3pro',name:'KUKIRIN G3 Pro',tier:7,price:7500,vmax:70,acc:4.6,brake:6.0,grip:7.3,range:27,color:'#ff3d5a',desc:'Double moteur : elle décolle du feu rouge.'},
 {id:'g4',name:'KUKIRIN G4',tier:8,price:10500,vmax:80,acc:5.3,brake:6.6,grip:7.8,range:30,color:'#16d3d3',desc:'Une vraie machine de performance.'},
 {id:'g5',name:'KUKIRIN G5',tier:9,price:15000,vmax:90,acc:6.1,brake:7.2,grip:8.2,range:33,color:'#f2f2f2',desc:'Très rapide, à manier avec respect.'},
 {id:'g6',name:'KUKIRIN G6',tier:10,price:22000,vmax:120,acc:8.2,brake:8.0,grip:8.6,range:37,color:'#111418',desc:'Le sommet de la gamme. 120 km/h et une accélération redoutable.'}
];
const SC_BY_ID={};SCOOTERS.forEach(s=>SC_BY_ID[s.id]=s);
const UPS=[
 {k:'brake',name:'Freins',lv:['Disques hydrauliques','Étriers 4 pistons','Étriers radiaux + ABS'],cost:[150,360,720],fx:'+20 % de puissance de freinage par niveau'},
 {k:'tires',name:'Pneus',lv:['Tubeless route','Tubeless renforcé','Gomme grip 11 pouces'],cost:[120,300,620],fx:'+10 % d’adhérence par niveau'},
 {k:'battery',name:'Batterie',lv:['Pack +20 %','Pack +50 %','Pack double cellule'],cost:[200,450,900],fx:'+25 % d’autonomie par niveau'},
 {k:'screen',name:'Écran',lv:['Écran couleur TFT','Écran sport + radar','Écran pro + alerte patrouille'],cost:[260,620,1250],fx:'+3,5 % de vitesse et +5 % d’accélération par niveau. Niv. 2 : police sur la minicarte. Niv. 3 : alerte patrouille.'},
 {k:'motor',name:'Moteur',lv:['Contrôleur sport','Moteur renforcé','Double contrôleur'],cost:[300,720,1500],fx:'+5 % de vitesse et +12 % d’accélération par niveau'}
];
const PAINTS=['#ff6a1a','#2b8cff','#e8e8e8','#26c281','#9a5cff','#ffcf24','#ff3d5a','#16d3d3','#111418'];

/* ---------- sauvegarde ---------- */
const SAVE_KEY='kukicity.v1';
function defaultSave(){return{money:250,cur:'g2',owned:{g2:{up:{brake:0,tires:0,battery:0,screen:0,motor:0},color:'#ff6a1a',bat:1}},dayOffset:0,qDay:-9999,qWeek:-9999,daily:[],weekly:[],garage:0,km:0,deliv:0,busted:0,escapes:0}}
function loadSave(){try{const s=localStorage.getItem(SAVE_KEY);if(s){const o=JSON.parse(s);return Object.assign(defaultSave(),o)}}catch(e){}return defaultSave()}
function hasSave(){try{return !!localStorage.getItem(SAVE_KEY)}catch(e){return false}}
let SV=loadSave(),saveDirty=false;
function saveNow(){saveDirty=false;try{localStorage.setItem(SAVE_KEY,JSON.stringify(SV))}catch(e){}}
function markSave(){saveDirty=true}
function curOwned(){return SV.owned[SV.cur]}
const GAME_SPEED_SCALE=2.5,GAME_ACCEL_SCALE=2,SPEEDOMETER_SCALE=120/377,BRAKE_FORCE_SCALE=4;
function indicatedKmh(speed){return speed*3.6*SPEEDOMETER_SCALE}
function statsOf(id,up){
  const s=SC_BY_ID[id];
  return{
    vmax:s.vmax*GAME_SPEED_SCALE*(1+0.035*up.screen+0.05*up.motor)/3.6,
    acc:s.acc*GAME_ACCEL_SCALE*(1+0.05*up.screen+0.12*up.motor),
    brake:s.brake*BRAKE_FORCE_SCALE*(1+0.2*up.brake),
    grip:s.grip*(1+0.1*up.tires),
    range:s.range*(1+0.25*up.battery),
    radar:up.screen>=2, alert:up.screen>=3
  };
}
function curStats(){return statsOf(SV.cur,curOwned().up)}
function upCost(sc,k,lvl){const u=UPS.find(x=>x.k===k);return Math.round(u.cost[lvl]*(0.8+0.12*sc.tier)/5)*5}

/* ---------- moteur 3D ---------- */
const canvas=$('#gl');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
(function(){const c=document.createElement('canvas');c.width=4;c.height=256;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,0,256);
 gr.addColorStop(0,'#4f9ee0');gr.addColorStop(.55,'#a6d2f0');gr.addColorStop(1,'#dcebf3');g.fillStyle=gr;g.fillRect(0,0,4,256);scene.background=new THREE.CanvasTexture(c)})();
scene.fog=new THREE.Fog(0xd6e7f1,150,640);
const camera=new THREE.PerspectiveCamera(62,1,0.2,1100);
scene.add(new THREE.HemisphereLight(0xe3f0ff,0x8a8f7c,0.9));
const sun=new THREE.DirectionalLight(0xfff0d2,0.95);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
const sc_=sun.shadow.camera;sc_.left=-75;sc_.right=75;sc_.top=75;sc_.bottom=-75;sc_.near=20;sc_.far=420;sun.shadow.bias=-0.0006;
scene.add(sun);scene.add(sun.target);
const SUN_OFF=new THREE.Vector3(110,170,60);
function resize(){const w=window.innerWidth,h=window.innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
window.addEventListener('resize',resize);resize();
/* ===================== RK : kit de modélisation réaliste (PBR, reflets, formes lissées) ===================== */
const RK=(()=>{
const TAU=Math.PI*2,Y=new THREE.Vector3(0,1,0);
const K={ENV:null,srgb:false};
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function canvasTex(w,h,draw,o){
  o=o||{};const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;
  if(o.color&&K.srgb)t.encoding=THREE.sRGBEncoding;if(o.repeat)t.repeat.set(o.repeat[0],o.repeat[1]);return t;
}
/* ---------- environnement HDR procédural (reflets réalistes sur peinture, chrome, vitres) ---------- */
function setEnv(renderer,o){
  o=o||{};K.srgb=renderer.outputEncoding===THREE.sRGBEncoding;
  const r=rng(o.seed||7),W=512,H=256,hz=H*.5;
  const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  let gr=g.createLinearGradient(0,0,0,hz);gr.addColorStop(0,o.top||'#2d67b0');gr.addColorStop(.7,o.mid||'#9fc4e6');gr.addColorStop(1,o.hor||'#e8f0f5');
  g.fillStyle=gr;g.fillRect(0,0,W,hz);
  for(let i=0;i<55;i++){const x=r()*W,y=hz*(.2+r()*.7),rw=15+r()*60,rh=3+r()*9;g.fillStyle='rgba(255,255,255,'+(.06+r()*.2)+')';g.beginPath();g.ellipse(x,y,rw,rh,0,0,TAU);g.fill()}
  gr=g.createLinearGradient(0,hz,0,H);gr.addColorStop(0,o.gnd1||'#8a8b84');gr.addColorStop(.2,o.gnd2||'#5b5d57');gr.addColorStop(1,o.gnd3||'#262724');
  g.fillStyle=gr;g.fillRect(0,hz,W,H-hz);
  if(o.city){for(let x=0;x<W;){const bw=4+r()*18,bh=4+r()*o.city*44,l=46+r()*60|0;g.fillStyle='rgb('+l+','+(l+5)+','+(l+12)+')';g.fillRect(x,hz-bh,bw,bh+1);
    g.fillStyle='rgba(255,255,255,.16)';for(let wy=hz-bh+2;wy<hz-2;wy+=3)g.fillRect(x+1,wy,bw-2,1);x+=bw+r()*3}}
  if(o.hills){g.fillStyle=o.hillCol||'#56685a';g.beginPath();g.moveTo(0,hz+1);for(let x=0;x<=W;x+=4)g.lineTo(x,hz-(Math.sin(x*.025+1)*.5+.5)*o.hills*16-(Math.sin(x*.083)*.5+.5)*o.hills*6);g.lineTo(W,hz+1);g.fill()}
  const img=g.getImageData(0,0,W,H).data,data=new Float32Array(W*H*4);
  const su=o.sunU!=null?o.sunU:.3,sv=o.sunV!=null?o.sunV:.3,sx=su*W,sy=sv*hz,si=o.sunI!=null?o.sunI:14;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const k=(y*W+x)*4,kd=((H-1-y)*W+x)*4;let dx=Math.abs(x-sx);dx=Math.min(dx,W-dx);const d2=(dx*dx+(y-sy)*(y-sy));
    const sun=si*Math.exp(-d2/18)+si*.06*Math.exp(-d2/900);
    for(let ch=0;ch<3;ch++){let v=img[k+ch]/255;if(K.srgb)v=Math.pow(v,2.2);data[kd+ch]=v*(o.gain||1)+sun*(ch===2?.92:1)}
    data[kd+3]=1;
  }
  /* bandes lumineuses douces (comme un studio) pour dessiner de beaux reflets sur les carrosseries */
  for(const b of (o.strips||[[.62,.12,1.6],[.85,.2,1.1]]))for(let y=Math.floor(b[1]*H);y<Math.floor((b[1]+.06)*H);y++)for(let x=Math.floor(b[0]*W);x<Math.floor((b[0]+.08)*W);x++){const k=((H-1-y)*W+x)*4;for(let ch=0;ch<3;ch++)data[k+ch]+=b[2]}
  const t=new THREE.DataTexture(data,W,H,THREE.RGBAFormat,THREE.FloatType);t.needsUpdate=true;
  t.mapping=THREE.EquirectangularReflectionMapping;t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;t.flipY=false;
  try{const pm=new THREE.PMREMGenerator(renderer);K.ENV=pm.fromEquirectangular(t).texture;pm.dispose()}catch(e){K.ENV=null}
  return K.ENV;
}
/* ---------- matériaux ---------- */
function E(o){if(K.ENV&&o.envMap===undefined)o.envMap=K.ENV;return o}
const M={
  std:(c,r,m,o)=>new THREE.MeshStandardMaterial(E(Object.assign({color:c,roughness:r==null?.5:r,metalness:m||0},o||{}))),
  paint:(c,o)=>new THREE.MeshPhysicalMaterial(E(Object.assign({color:c,roughness:.3,metalness:.3,clearcoat:1,clearcoatRoughness:.03},o||{}))),
  chrome:o=>M.std(0xffffff,.06,1,o),
  alu:(c,o)=>M.std(c==null?0xc5cad0:c,.3,1,o),
  dark:(c,o)=>M.std(c==null?0x1f2124:c,.42,.65,o),
  plastic:(c,o)=>M.std(c==null?0x121315:c,.6,0,o),
  rubber:o=>M.std(0x1a1b1d,.92,0,o),
  glass:(c,o)=>new THREE.MeshPhysicalMaterial(E(Object.assign({color:c==null?0x0c141a:c,roughness:.02,metalness:.15,clearcoat:1,clearcoatRoughness:.02,transparent:true,opacity:.62,envMapIntensity:1.4},o||{}))),
  lens:o=>new THREE.MeshPhysicalMaterial(E(Object.assign({color:0xffffff,roughness:.02,metalness:0,clearcoat:1,transparent:true,opacity:.22,depthWrite:false},o||{}))),
  glow:(c,i,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,emissive:c,emissiveIntensity:i==null?1.3:i,roughness:.35,metalness:0},o||{}))
};
/* ---------- textures procédurales ---------- */
const TC={};
function treadTex(kind,v0,v1){
  const key=kind+v0+v1;if(TC[key])return TC[key];
  return TC[key]=canvasTex(1024,256,(g,w,h)=>{
    const y0=Math.round((1-v1)*h),y1=Math.round((1-v0)*h),bh=y1-y0,cy=(y0+y1)/2;
    g.fillStyle='#505154';g.fillRect(0,0,w,h);
    g.fillStyle='rgba(0,0,0,.25)';for(let y=0;y<h;y+=5)if(y<y0-6||y>y1+6)g.fillRect(0,y,w,1);
    g.fillStyle='#6a6b6e';g.fillRect(0,y0,w,bh);
    g.fillStyle='#08080a';g.strokeStyle='#08080a';
    if(kind==='road'){
      for(const f of[.3,.5,.7])g.fillRect(0,y0+bh*f-3,w,6);
      g.lineWidth=2;for(let x=0;x<w;x+=16){g.beginPath();g.moveTo(x,y0+2);g.lineTo(x+5,y0+bh*.27);g.moveTo(x+8,y0+bh*.34);g.lineTo(x+11,y0+bh*.46);g.moveTo(x+8,y0+bh*.54);g.lineTo(x+5,y0+bh*.66);g.moveTo(x,y0+bh*.74);g.lineTo(x+5,y1-2);g.stroke()}
    }else if(kind==='sport'){
      g.lineWidth=5;for(let x=0;x<w;x+=64){for(const s of[-1,1]){g.beginPath();g.moveTo(x+(s>0?0:32),cy+s*bh*.06);g.bezierCurveTo(x+(s>0?14:46),cy+s*bh*.2,x+(s>0?30:62),cy+s*bh*.3,x+(s>0?52:84),cy+s*bh*.42);g.stroke()}}
    }else if(kind==='knobby'){
      g.fillStyle='#08080a';g.fillRect(0,y0,w,bh);g.fillStyle='#6a6b6e';
      for(let x=0;x<w;x+=22)for(let j=0;j<4;j++){const off=(j%2)*11;g.fillRect(x+off,y0+bh*(.05+j*.24),14,bh*.17)}
    }else{
      g.lineWidth=4;g.beginPath();for(let x=0;x<=w;x+=12)g.lineTo(x,cy+((x/12)%2?-1:1)*bh*.08);g.stroke();
      g.lineWidth=3;for(let x=0;x<w;x+=24){g.beginPath();g.moveTo(x,y0+bh*.12);g.lineTo(x+8,y0+bh*.34);g.moveTo(x+12,y1-bh*.12);g.lineTo(x+20,y1-bh*.34);g.stroke()}
    }
  });
}
function noiseTex(base,amp,size,seed,o){
  const key='n'+base+amp+size+seed;if(TC[key])return TC[key];const r=rng(seed||1);
  return TC[key]=canvasTex(size,size,(g,w,h)=>{const d=g.createImageData(w,h);const b=parseInt(base.slice(1),16),br=b>>16&255,bg=b>>8&255,bb=b&255;
    for(let i=0;i<w*h;i++){const n=(r()-.5)*amp;d.data[i*4]=br+n;d.data[i*4+1]=bg+n;d.data[i*4+2]=bb+n;d.data[i*4+3]=255}g.putImageData(d,0,0)},o);
}
function carbonTex(){
  if(TC.carbon)return TC.carbon;
  return TC.carbon=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#16171a';g.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=8)for(let x=0;x<w;x+=8){const on=((x+y)/8)%2;const gr=on?g.createLinearGradient(x,y,x+8,y):g.createLinearGradient(x,y,x,y+8);
      gr.addColorStop(0,'#1c1d21');gr.addColorStop(.5,on?'#3a3c42':'#2d2f34');gr.addColorStop(1,'#16171a');g.fillStyle=gr;g.fillRect(x,y,8,8)}},{color:true,repeat:[6,6]});
}
function labelTex(draw,w,h){return canvasTex(w||512,h||128,draw,{color:true})}
/* ---------- géométries ---------- */
const cr=(p0,p1,p2,p3,t)=>.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t);
/* Loft : sections superelliptiques le long de Z (z croissant). {z,w,t,b,y,x,n,tw}
   w = demi-largeur, t/b = hauteur au-dessus/au-dessous du centre y, n = exposant (2 ellipse, 4+ carré arrondi), tw = largeur relative du dessus */
function loft(secs,o){
  o=o||{};const S=o.sides||32,sub=o.sub||4,keys=['z','w','t','b','y','x','n','tw'],full=[];
  const sec=secs.map(s=>({z:s.z,w:s.w,t:s.t,b:s.b==null?s.t:s.b,y:s.y||0,x:s.x||0,n:s.n||2,tw:s.tw==null?1:s.tw}));
  for(let j=0;j<sec.length-1;j++)for(let k=0;k<sub;k++){
    const f=k/sub,p0=sec[Math.max(0,j-1)],p1=sec[j],p2=sec[j+1],p3=sec[Math.min(sec.length-1,j+2)],s={};
    for(const q of keys)s[q]=q==='z'||o.linear?p1[q]+(p2[q]-p1[q])*f:cr(p0[q],p1[q],p2[q],p3[q],f);
    s.w=Math.max(s.w,1e-4);s.t=Math.max(s.t,1e-4);s.b=Math.max(s.b,1e-4);s.n=Math.max(s.n,.6);full.push(s);
  }
  full.push(sec[sec.length-1]);
  const pos=[],uv=[],idx=[],R=full.length;
  for(let j=0;j<R;j++){const s=full[j];
    for(let i=0;i<=S;i++){const a=-Math.PI/2+i/S*TAU,c=Math.cos(a),sn=Math.sin(a),e=2/s.n;
      const yy=Math.sign(sn)*Math.pow(Math.abs(sn),e),xx=Math.sign(c)*Math.pow(Math.abs(c),e)*s.w*(yy>0?1+(s.tw-1)*yy:1);
      pos.push(s.x+xx,s.y+(yy>0?s.t:s.b)*yy,s.z);uv.push(i/S,j/(R-1))}}
  for(let j=0;j<R-1;j++)for(let i=0;i<S;i++){const a=j*(S+1)+i,b=a+1,d=a+S+1,c=d+1;idx.push(a,b,d,b,c,d)}
  if(o.cap!==false){
    for(const end of[0,1]){const j=end?R-1:0,s=full[j],ci=pos.length/3;pos.push(s.x,s.y+(s.t-s.b)*.3,s.z);uv.push(.5,end);
      const b0=pos.length/3;for(let i=0;i<=S;i++){const a=(j*(S+1)+i)*3;pos.push(pos[a],pos[a+1],pos[a+2]);uv.push(i/S,end)}
      for(let i=0;i<S;i++){const a=b0+i;if(end)idx.push(ci,a,a+1);else idx.push(ci,a+1,a)}}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geo.setIndex(idx);geo.computeVertexNormals();geo.userData.S=S;geo.userData.R=R;
  const n=geo.attributes.normal;for(let j=0;j<R;j++){const a=j*(S+1),b=a+S;const x=n.getX(a)+n.getX(b),y=n.getY(a)+n.getY(b),z=n.getZ(a)+n.getZ(b),l=Math.hypot(x,y,z)||1;n.setXYZ(a,x/l,y/l,z/l);n.setXYZ(b,x/l,y/l,z/l)}
  return geo;
}
/* Boîte arrondie à normales lisses */
function rbox(w,h,d,r,s){
  s=s||3;r=Math.max(1e-4,Math.min(r==null?Math.min(w,h,d)*.15:r,w/2-1e-4,h/2-1e-4,d/2-1e-4));
  const n=2*s+1,g=new THREE.BoxGeometry(1,1,1,n,n,n),P=g.attributes.position,N=g.attributes.normal,half=[w/2,h/2,d/2],c=[0,0,0],inr=[0,0,0],dv=[0,0,0];
  for(let i=0;i<P.count;i++){
    c[0]=P.getX(i);c[1]=P.getY(i);c[2]=P.getZ(i);
    for(let a=0;a<3;a++){const k=Math.round((c[a]+.5)*n);const v=k<=s?-half[a]+r*(k/s):half[a]-r*((n-k)/s);inr[a]=Math.max(-(half[a]-r),Math.min(half[a]-r,v));dv[a]=v-inr[a]}
    const l=Math.hypot(dv[0],dv[1],dv[2]);
    if(l>1e-6){P.setXYZ(i,inr[0]+dv[0]/l*r,inr[1]+dv[1]/l*r,inr[2]+dv[2]/l*r);N.setXYZ(i,dv[0]/l,dv[1]/l,dv[2]/l)}
    else P.setXYZ(i,inr[0],inr[1],inr[2]);
  }
  return g;
}
const lathe=(pts,seg,ps,pl)=>new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(Math.max(p[0],1e-4),p[1])),seg||32,ps||0,pl||TAU);
function limbGeo(L,r1,r2,bulge,seg){
  const p=[];for(let k=0;k<=5;k++){const a=-Math.PI/2+k/5*Math.PI/2;p.push([r1*Math.cos(a),r1*Math.sin(a)])}
  if(bulge)p.push([(r1+r2)/2*bulge,L*.38]);
  for(let k=0;k<=5;k++){const a=k/5*Math.PI/2;p.push([r2*Math.cos(a),L+r2*Math.sin(a)])}
  return lathe(p,seg||14);
}
function tube(pts,r,o){o=o||{};const c=new THREE.CatmullRomCurve3(pts.map(p=>p.isVector3?p:new THREE.Vector3(p[0],p[1],p[2])),!!o.closed,'catmullrom',o.tension==null?.5:o.tension);
  return new THREE.TubeGeometry(c,o.seg||Math.max(8,pts.length*8),r,o.radial||10,!!o.closed)}
function extrude(shape,depth,o){o=o||{};const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:o.bevel!==0,bevelThickness:o.bevel||depth*.25,bevelSize:o.bevelSize==null?(o.bevel||depth*.25):o.bevelSize,bevelSegments:o.bs||2,curveSegments:o.cs||24,steps:1});
  g.translate(0,0,-depth/2);return g}
function polyShape(pts){const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);s.closePath();return s}
/* Pneu : profil tourné autour de l'axe X. Retourne la géométrie (UV : u autour, v le long du profil). */
function tireGeo(R,W,rimR,o){
  o=o||{};const h=R-rimR,round=o.round||0,p=[];
  const side=s=>[[rimR*.99,s*W*.38],[rimR+h*.12,s*W*.46],[rimR+h*.45,s*W*.5],[rimR+h*.78,s*W*.48],[R-h*.06*(1-round),s*W*(.42-round*.08)]];
  const lo=side(-1),hi=side(1).reverse(),tr=[];const n=7;
  for(let i=0;i<=n;i++){const t=-1+2*i/n,yy=t*W*(.36-round*.06);tr.push([R-h*(round*.45+.03)*t*t,yy])}
  p.push(...lo,...tr,...hi);
  const g=lathe(p.map(q=>[q[0],q[1]]),o.seg||48);g.rotateZ(-Math.PI/2);
  g.userData={v0:lo.length/(p.length-1),v1:(lo.length+tr.length-1)/(p.length-1)};
  return g;
}
function tireMat(kind,g){const key='m'+kind+g.userData.v0+g.userData.v1;if(TC[key])return TC[key];const t=treadTex(kind,g.userData.v0,g.userData.v1);return TC[key]=M.std(0x2a2b2e,.88,0,{map:t,bumpMap:t,bumpScale:.012})}
/* Jante alliage : voile à bâtons découpés + fût + moyeu. Axe X. */
function rimGeo(R,W,o){
  o=o||{};const n=o.spokes||5,sw=o.spokeW||R*.16,ri=R*(o.hub||.3),ro=R*(o.inner||.83),depth=o.depth||W*.22,split=o.split||0;
  const s=new THREE.Shape();s.absarc(0,0,R*.97,0,TAU,false);
  const win=(a0,a1)=>{const hw0=(sw*.5)/ro;let rI=ri,hw1=(sw*.62)/rI;if(a1-a0-2*hw1<.06){const q=(a1-a0)/2-.03;if(q<=0)return;rI=(sw*.62)/q;hw1=(sw*.62)/rI}
    if(rI>ro*.82||a1-a0-2*hw0<.04)return;const h=new THREE.Path(),A0o=a0+hw0,A1o=a1-hw0,A0i=a0+hw1,A1i=a1-hw1;h.absarc(0,0,ro,A0o,A1o,false);h.absarc(0,0,rI,A1i,A0i,true);h.closePath();s.holes.push(h)};
  for(let k=0;k<n;k++){const a0=k/n*TAU,a1=(k+1)/n*TAU;if(split){const m=(a0+a1)/2;win(a0,m-split/2);win(m-split/2,m+split/2);win(m+split/2,a1)}else win(a0,a1)}
  const face=extrude(s,depth,{bevel:depth*.3,bs:1,cs:o.cs||Math.max(10,n*3)});face.rotateY(Math.PI/2);face.translate(o.offset||0,0,0);
  const barrel=lathe([[R*1.0,W*.5],[R*.95,W*.47],[R*.92,W*.38],[R*.92,-W*.38],[R*.95,-W*.47],[R*1.0,-W*.5]],o.seg||32);barrel.rotateZ(-Math.PI/2);
  const hub=lathe([[0,-W*.35],[R*.13,-W*.35],[R*.17,-W*.32],[R*.15,depth*.6],[R*.11,depth*.88],[R*.0,depth*.9]],24);hub.rotateZ(-Math.PI/2);hub.translate(o.offset||0,0,0);
  return{face,barrel,hub};
}
/* Disque de frein percé */
function discGeo(R,ri,th,o){
  o=o||{};const s=new THREE.Shape();s.absarc(0,0,R,0,TAU,false);const h=new THREE.Path();h.absarc(0,0,ri,0,TAU,true);s.holes.push(h);
  const nh=o.holes==null?24:o.holes;for(let k=0;k<nh;k++){const a=k/nh*TAU,rr=ri+(R-ri)*(k%2?.38:.66),hp=new THREE.Path();hp.absarc(Math.cos(a)*rr,Math.sin(a)*rr,(R-ri)*.07,0,TAU,true);s.holes.push(hp)}
  const g=extrude(s,th,{bevel:th*.2,bs:1,cs:o.cs||(nh?12:32)});g.rotateY(Math.PI/2);return g;
}
/* Aile à profil NACA entre deux sections : {x,y,z(bord d'attaque),c(corde),t(épaisseur relative)} ; corde le long de +Z */
function wing(root,tip,o){
  o=o||{};const K2=o.chord||18,ST=o.span||6,pos=[],idx=[],uv=[],loop=[];
  for(let k=0;k<=K2;k++)loop.push((1-Math.cos(Math.PI*k/K2))/2);
  const th=x=>5*(.2969*Math.sqrt(x)-.126*x-.3516*x*x+.2843*x*x*x-.1036*x*x*x*x);
  const L=K2*2;
  for(let j=0;j<=ST;j++){const f=j/ST,X=root.x+(tip.x-root.x)*f,Yb=root.y+(tip.y-root.y)*f,Z=root.z+(tip.z-root.z)*f,C=root.c+(tip.c-root.c)*f,T=root.t+(tip.t-root.t)*f;
    for(let i=0;i<L;i++){let x,sgn;if(i<=K2){x=loop[K2-i];sgn=1}else{x=loop[i-K2];sgn=-1}
      const ht=th(x)*T*C*(sgn>0?(o.camber?1+o.camber:1):(o.camber?1-o.camber:1));pos.push(X,Yb+sgn*ht,Z+x*C);uv.push(i/L,f)}}
  for(let j=0;j<ST;j++)for(let i=0;i<L;i++){const a=j*L+i,b=j*L+(i+1)%L,d=a+L,c=b+L;idx.push(a,d,b,b,d,c)}
  for(const end of[0,1]){const j=end?ST:0,b0=pos.length/3;for(let i=0;i<L;i++){const q=(j*L+i)*3;pos.push(pos[q],pos[q+1],pos[q+2]);uv.push(0,0)}for(let i=1;i<L-1;i++){const a=b0,b=b0+i,c=b0+i+1;if(end)idx.push(a,c,b);else idx.push(a,b,c)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const nr=g.attributes.normal;if(nr.getY(Math.floor(K2/2))<0){const ix=g.index.array;for(let i=0;i<ix.length;i+=3){const t=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=t}g.computeVertexNormals()}
  return g;
}
/* Pièce découpée sur la surface d'un loft (vitres, phares, joncs) : lignes z dans [zA,zB], angles dans [a0,a1] (0 = côté +X, PI/2 = dessus) */
function loftPatch(geo,zA,zB,a0,a1,off){
  const S=geo.userData.S,R=geo.userData.R,P=geo.attributes.position,N=geo.attributes.normal,rows=[];
  for(let j=0;j<R;j++){const z=P.getZ(j*(S+1));if(z>=zA-1e-6&&z<=zB+1e-6)rows.push(j)}
  const toI=a=>Math.round((a+Math.PI/2)/TAU*S),i0=toI(a0),i1=toI(a1),pos=[],nor=[],uv=[],idx=[],C=i1-i0+1;
  if(rows.length<2||C<2)return null;
  for(let r=0;r<rows.length;r++)for(let c=0;c<C;c++){const i=((i0+c)%S+S)%S,k=rows[r]*(S+1)+i;
    pos.push(P.getX(k)+N.getX(k)*off,P.getY(k)+N.getY(k)*off,P.getZ(k)+N.getZ(k)*off);nor.push(N.getX(k),N.getY(k),N.getZ(k));uv.push(c/(C-1),r/(rows.length-1))}
  for(let r=0;r<rows.length-1;r++)for(let c=0;c<C-1;c++){const a=r*C+c,b=a+1,d=a+C,e=d+1;idx.push(a,b,d,b,e,d)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);return g;
}
/* ---------- placement ---------- */
function add(par,geo,mat,x,y,z,rx,ry,rz,o){
  const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);if(rx||ry||rz)m.rotation.set(rx||0,ry||0,rz||0);
  m.castShadow=!(o&&o.noShadow);m.receiveShadow=!!(o&&o.recv);if(par)par.add(m);return m;
}
const v3=(a)=>a.isVector3?a.clone():new THREE.Vector3(a[0],a[1],a[2]);
function between(par,geoFn,mat,a,b){a=v3(a);b=v3(b);const d=b.clone().sub(a),L=d.length();const m=add(par,geoFn(L),mat,a.x,a.y,a.z);m.quaternion.setFromUnitVectors(Y,d.normalize());return m}
function rod(par,a,b,r,mat,seg){return between(par,L=>new THREE.CylinderGeometry(r,r,L,seg||14).translate(0,L/2,0),mat,a,b)}
function bone(par,a,b,r1,r2,mat,bulge){
  a=v3(a);b=v3(b);const g=new THREE.Group();g.position.copy(a);par.add(g);const d=b.clone().sub(a),L=d.length();
  const m=add(g,limbGeo(L,r1,r2,bulge),mat);m.quaternion.setFromUnitVectors(Y,d.clone().normalize());g.userData.tip=d;g.userData.mesh=m;return g;
}
function ik2(S,T,a,b,pole){
  S=v3(S);T=v3(T);const d=T.clone().sub(S);let L=d.length();const dir=d.clone().normalize();L=Math.min(L,a+b-1e-3);
  const ca=(a*a+L*L-b*b)/(2*a*L),sa=Math.sqrt(Math.max(0,1-ca*ca));const p=v3(pole);p.addScaledVector(dir,-p.dot(dir)).normalize();
  return S.clone().addScaledVector(dir,a*ca).addScaledVector(p,a*sa);
}
/* ---------- fusion statique (une seule géométrie par matériau) ---------- */
function merge(group){
  group.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(group.matrixWorld).invert(),bk=new Map(),mx=new THREE.Matrix4(),nm=new THREE.Matrix3(),v=new THREE.Vector3();
  group.traverse(m=>{
    if(!m.isMesh)return;let g=m.geometry.index?m.geometry.toNonIndexed():m.geometry;
    mx.multiplyMatrices(inv,m.matrixWorld);nm.getNormalMatrix(mx);const P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv,flip=mx.determinant()<0;
    const key=m.material.uuid;let b=bk.get(key);if(!b){b={mat:m.material,p:[],n:[],u:[],cast:false,recv:false,ro:m.renderOrder};bk.set(key,b)}b.cast=b.cast||m.castShadow;b.recv=b.recv||m.receiveShadow;
    for(let i=0;i<P.count;i++){const j=flip?(i%3===1?i+1:i%3===2?i-1:i):i;
      v.fromBufferAttribute(P,j).applyMatrix4(mx);b.p.push(v.x,v.y,v.z);
      v.fromBufferAttribute(N,j).applyMatrix3(nm).normalize();b.n.push(v.x,v.y,v.z);
      if(U)b.u.push(U.getX(j),U.getY(j));else b.u.push(0,0)}
  });
  const out=new THREE.Group();
  for(const b of bk.values()){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(b.u,2));g.computeBoundingSphere();
    const m=new THREE.Mesh(g,b.mat);m.castShadow=b.cast;m.receiveShadow=b.recv;m.renderOrder=b.ro;out.add(m)}
  return out;
}
/* ---------- casque intégral ---------- */
function helmet(par,shell,visor,o){
  o=o||{};const r=o.r||.155,g=new THREE.Group();par.add(g);
  if(o.style==='urban'){add(g,new THREE.SphereGeometry(r,32,16,0,TAU,0,Math.PI*.56),shell,0,0,0).scale.set(.94,1,1.1);add(g,new THREE.SphereGeometry(r*.97,24,12,0,TAU,0,Math.PI*.56),M.plastic(0x1a1a1a,{side:THREE.BackSide}),0,0,0).scale.set(.94,1,1.1)}
  else add(g,new THREE.SphereGeometry(r,32,22),shell,0,0,0).scale.set(.94,1,1.1);
  if(o.style==='jet'){
    add(g,new THREE.SphereGeometry(r*1.035,28,14,Math.PI/2-1.25,2.5,1.05,.85),visor,0,.005,.0).scale.set(.94,1,1.1);
    add(g,lathe([[0,0],[r*.32,0],[r*.36,r*.18],[r*.3,r*.42],[0,r*.46]],18),M.plastic(0x2a2c2e),0,-r*.45,r*.78,1.9);
    add(g,tube([[r*.28,-r*.72,r*.7],[r*.55,-r*1.3,r*.55],[r*.75,-r*2.1,r*.15]],r*.07),M.plastic(0x3a3d35),0,0,0);
    add(g,rbox(r*.5,r*.18,r*.5,r*.08),shell,0,r*.92,-r*.1);
  }else if(o.style==='urban'){
    add(g,rbox(r*1.7,r*.12,r*.5,r*.05),shell,0,r*.15,r*1.0,.25);
    for(let i=-1;i<=1;i++)add(g,rbox(r*.1,r*.05,r*.45,r*.02),M.plastic(0x222222),i*r*.3,r*.93,-r*.05);
  }else{
    add(g,new THREE.SphereGeometry(r*1.02,28,12,Math.PI/2-1.1,2.2,1.15,.72),visor,0,0,0).scale.set(.94,1,1.1);
    const chin=add(g,new THREE.SphereGeometry(r*.98,24,10,Math.PI/2-.9,1.8,1.95,.75),shell,0,-r*.02,r*.05);chin.scale.set(.94,1,1.14);
    if(o.spoiler!==false)add(g,rbox(r*.9,r*.14,r*.5,r*.06),shell,0,r*.55,-r*.95,-.5);
    for(const s of[-1,1])add(g,new THREE.CylinderGeometry(r*.13,r*.13,r*.05,16),M.plastic(0x1a1a1a),s*r*.93,-r*.02,r*.12,0,0,Math.PI/2);
  }
  return g;
}
return Object.assign(K,{rng,canvasTex,setEnv,M,treadTex,noiseTex,carbonTex,labelTex,loft,loftPatch,rbox,lathe,limbGeo,tube,extrude,polyShape,tireGeo,tireMat,rimGeo,discGeo,wing,add,between,rod,bone,ik2,merge,helmet,TAU});
})();

RK.setEnv(renderer,{city:1,sunU:.3,sunV:.3});

/* ---------- mesher : fusion de formes dans une seule géométrie ---------- */
const _m4=new THREE.Matrix4(),_q=new THREE.Quaternion(),_v=new THREE.Vector3(),_s=new THREE.Vector3(),_e=new THREE.Euler(),_n3=new THREE.Matrix3(),_col=new THREE.Color();
const G={
  box:new THREE.BoxGeometry(1,1,1).toNonIndexed(),
  cyl:new THREE.CylinderGeometry(.5,.5,1,8).toNonIndexed(),
  cyl5:new THREE.CylinderGeometry(.5,.5,1,5).toNonIndexed(),
  cone6:new THREE.ConeGeometry(.5,1,6).toNonIndexed(),
  pyr:new THREE.ConeGeometry(.70711,1,4).rotateY(Math.PI/4).toNonIndexed(),
  plane:new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2).toNonIndexed()
};
class Mesher{
  constructor(){this.p=[];this.n=[];this.c=[];this.u=[]}
  add(geo,x,y,z,sx,sy,sz,ry,color,tx,ty,rx,rz){
    _e.set(rx||0,ry||0,rz||0);_q.setFromEuler(_e);_v.set(x,y,z);_s.set(sx,sy,sz);
    _m4.compose(_v,_q,_s);_n3.getNormalMatrix(_m4);
    const pa=geo.attributes.position,na=geo.attributes.normal,ua=geo.attributes.uv;
    _col.set(color);
    for(let i=0;i<pa.count;i++){
      _v.fromBufferAttribute(pa,i).applyMatrix4(_m4);this.p.push(_v.x,_v.y,_v.z);
      _v.fromBufferAttribute(na,i).applyMatrix3(_n3).normalize();this.n.push(_v.x,_v.y,_v.z);
      this.c.push(_col.r,_col.g,_col.b);
      if(tx){const f=(i/6)|0;let u=ua.getX(i),w=ua.getY(i);
        if(f<2){u*=sz/tx;w*=sy/ty}else if(f<4){u*=sx/tx;w*=sz/tx}else{u*=sx/tx;w*=sy/ty}
        this.u.push(u,w)}else this.u.push(0,0);
    }
  }
  geometry(){
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));
    g.setAttribute('normal',new THREE.Float32BufferAttribute(this.n,3));
    g.setAttribute('color',new THREE.Float32BufferAttribute(this.c,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(this.u,2));
    g.computeBoundingSphere();return g;
  }
  build(mat,cast,recv){
    if(!this.p.length)return null;
    const m=new THREE.Mesh(this.geometry(),mat);m.castShadow=cast!==false;m.receiveShadow=recv!==false;return m;
  }
}

/* ---------- matériaux & textures ---------- */
function makeWinTex(){
  const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
  g.fillStyle='#f3f5f7';g.fillRect(0,0,128,128);const rng=mulberry32(7);
  const cols=['#5b7a99','#4f6f8f','#6f8fae','#3f5c7a','#7d9bb8'];
  for(let y=0;y<2;y++)for(let x=0;x<2;x++){const wx=x*64+8,wy=y*64+10;g.fillStyle=cols[(rng()*cols.length)|0];g.fillRect(wx,wy,48,38);g.fillStyle='rgba(255,255,255,.28)';g.fillRect(wx,wy,48,7)}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;
}
const matWalls=new THREE.MeshLambertMaterial({vertexColors:true,map:makeWinTex()});
const matPlain=new THREE.MeshLambertMaterial({vertexColors:true});
const lampMat=[new THREE.MeshBasicMaterial({color:0x2cff8a}),new THREE.MeshBasicMaterial({color:0xff3030})];
const LCOL={g:0x2cff8a,y:0xffc400,r:0xff3030};

/* ---------- colliders (grille spatiale) ---------- */
const CELL=40,cgrid=new Map(),ckey=(a,b)=>(a+50)*1000+(b+50);
function addCollider(c){
  const ax=Math.floor(c.x0/CELL),bx=Math.floor(c.x1/CELL),az=Math.floor(c.z0/CELL),bz=Math.floor(c.z1/CELL);
  for(let a=ax;a<=bx;a++)for(let b=az;b<=bz;b++){const k=ckey(a,b);let l=cgrid.get(k);if(!l){l=[];cgrid.set(k,l)}l.push(c)}
}
function addBox(cx,cz,w,d){addCollider({x0:cx-w/2,z0:cz-d/2,x1:cx+w/2,z1:cz+d/2})}
function addCircle(cx,cz,r){addCollider({x0:cx-r,z0:cz-r,x1:cx+r,z1:cz+r,cx,cz,r})}
const _near=[];
function nearColliders(x,z){_near.length=0;const cx=Math.floor(x/CELL),cz=Math.floor(z/CELL);
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=cgrid.get(ckey(cx+a,cz+b));if(l)for(let i=0;i<l.length;i++)_near.push(l[i])}return _near}
function pointInBuilding(x,z){const l=cgrid.get(ckey(Math.floor(x/CELL),Math.floor(z/CELL)));if(!l)return false;
  for(let i=0;i<l.length;i++){const c=l[i];if(c.r===undefined&&x>c.x0&&x<c.x1&&z>c.z0&&z<c.z1)return true}return false}
function losClear(ax,az,bx,bz){const d=Math.hypot(bx-ax,bz-az),n=Math.ceil(d/4);
  for(let s=1;s<n;s++){const t=s/n;if(pointInBuilding(ax+(bx-ax)*t,az+(bz-az)*t))return false}return true}
const HIT={hit:false,nx:0,nz:0};
function pushOut(o,r){
  HIT.hit=false;HIT.nx=0;HIT.nz=0;const L=nearColliders(o.x,o.z);
  for(let k=0;k<L.length;k++){const c=L[k];let dx,dz,d,pen;
    if(c.r!==undefined){dx=o.x-c.cx;dz=o.z-c.cz;d=Math.hypot(dx,dz);pen=c.r+r-d;
      if(pen>0){if(d<1e-6){dx=1;dz=0;d=1}o.x+=dx/d*pen;o.z+=dz/d*pen;HIT.hit=true;HIT.nx+=dx/d;HIT.nz+=dz/d}}
    else{const qx=clamp(o.x,c.x0,c.x1),qz=clamp(o.z,c.z0,c.z1);dx=o.x-qx;dz=o.z-qz;const d2=dx*dx+dz*dz;
      if(d2<r*r){
        if(d2>1e-9){d=Math.sqrt(d2);pen=r-d;o.x+=dx/d*pen;o.z+=dz/d*pen;HIT.nx+=dx/d;HIT.nz+=dz/d}
        else{const l=o.x-c.x0,rr=c.x1-o.x,t=o.z-c.z0,b=c.z1-o.z,m=Math.min(l,rr,t,b);
          if(m===l){o.x=c.x0-r;HIT.nx-=1}else if(m===rr){o.x=c.x1+r;HIT.nx+=1}else if(m===t){o.z=c.z0-r;HIT.nz-=1}else{o.z=c.z1+r;HIT.nz+=1}}
        HIT.hit=true}}
  }
  if(HIT.hit){const n=Math.hypot(HIT.nx,HIT.nz)||1;HIT.nx/=n;HIT.nz/=n}
  return HIT.hit;
}

/* ---------- carrefours & feux ---------- */
const CYC=24;
function lightState(axis,t){let u=t%CYC;if(axis===1)u=(u+12)%CYC;return u<9?'g':u<11?'y':'r'}
function nodePos(i,j){return{x:i*PITCH,z:j*PITCH}}
function neighbors(i,j){const r=[];if(i>0)r.push([i-1,j]);if(i<NB)r.push([i+1,j]);if(j>0)r.push([i,j-1]);if(j<NB)r.push([i,j+1]);return r}
function nearestNode(x,z){return[clamp(Math.round(x/PITCH),0,NB),clamp(Math.round(z/PITCH),0,NB)]}

/* ---------- garages ---------- */
const GARAGES=[
 {name:'Garage des Pavillons',x:250,z:300,sx:0,sz:1},
 {name:'Garage des Tours',x:650,z:400,sx:0,sz:-1},
 {name:'Garage des Docks',x:550,z:900,sx:0,sz:1},
 {name:'Garage du Parc',x:950,z:600,sx:0,sz:-1},
 {name:'Garage Marchand',x:650,z:100,sx:0,sz:1}
];
const NAV_DESTINATIONS=[
 ...GARAGES.map((g,i)=>({name:g.name,x:g.x,z:g.z,type:'garage',garageIndex:i})),
 {name:'Place des Tours',x:600,z:600,type:'lieu'},
 {name:'Parc des Lilas',x:950,z:750,type:'lieu'},
 {name:'Centre Marchand',x:650,z:150,type:'lieu'}
];

/* ---------- construction de la ville ---------- */
const lampMeshes=[null,null];
let mapBG=null;
function buildWorld(){
  /* sol : couleurs de quartiers peintes sur un canvas */
  const S=2048,k=S/1320,px=v=>(v+60)*k;
  const cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d');
  g.fillStyle='#a3bc92';g.fillRect(0,0,S,S);
  g.fillStyle='#bdbbb2';g.fillRect(px(-12),px(-12),1224*k,1224*k);
  g.fillStyle='#3b4047';
  for(let a=0;a<=NB;a++){g.fillRect(px(a*PITCH-8),px(-8),16*k,1216*k);g.fillRect(px(-8),px(a*PITCH-8),1216*k,16*k)}
  for(let i=0;i<NB;i++)for(let j=0;j<NB;j++){
    const d=districtOfBlock(i,j);g.fillStyle=DISTRICTS[d].ground;g.fillRect(px(i*PITCH+12),px(j*PITCH+12),76*k,76*k);
    if(d==='parc'){g.fillStyle='#e0d6b6';g.fillRect(px(i*PITCH+47),px(j*PITCH+12),6*k,76*k);g.fillRect(px(i*PITCH+12),px(j*PITCH+47),76*k,6*k)}
  }
  const gt=new THREE.CanvasTexture(cv);gt.anisotropy=8;
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(1320,1320).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({map:gt}));
  ground.position.set(600,0,600);ground.receiveShadow=true;scene.add(ground);
  const outer=new THREE.Mesh(new THREE.PlaneGeometry(6000,6000).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0xa3bc92}));
  outer.position.set(600,-0.08,600);scene.add(outer);

  /* carte (minicarte et grande carte) */
  mapBG=document.createElement('canvas');mapBG.width=mapBG.height=660;const m=mapBG.getContext('2d'),mk=660/1320,mp=v=>(v+60)*mk;
  m.fillStyle='#18222c';m.fillRect(0,0,660,660);
  for(let i=0;i<NB;i++)for(let j=0;j<NB;j++){const d=districtOfBlock(i,j);m.fillStyle={tours:'#3a4756',maisons:'#3d5a3f',commerce:'#5a4d43',entrepots:'#4b4b4b',parc:'#2f6b3a'}[d];m.fillRect(mp(i*PITCH+8),mp(j*PITCH+8),84*mk,84*mk)}

  /* marquages routiers */
  const marks=new Mesher();
  for(let a=0;a<=NB;a++)for(let s=0;s<NB;s++){
    for(let t=s*PITCH+17;t+3<=(s+1)*PITCH-17;t+=6){
      marks.add(G.plane,a*PITCH,0.03,t+1.5,0.25,1,3,0,'#efe7b0');
      marks.add(G.plane,t+1.5,0.03,a*PITCH,3,1,0.25,0,'#efe7b0');
    }
  }
  for(let i=0;i<=NB;i++)for(let j=0;j<=NB;j++){
    const arms=[[1,0],[-1,0],[0,1],[0,-1]];
    for(const[dx,dz]of arms){
      if(i+dx<0||i+dx>NB||j+dz<0||j+dz>NB)continue;
      const cx=i*PITCH,cz=j*PITCH;
      for(let l=-5.5;l<=5.5;l+=2.2){
        if(dx!==0)marks.add(G.plane,cx+dx*11,0.035,cz+l,3,1,1,0,'#f4f4f0');
        else marks.add(G.plane,cx+l,0.035,cz+dz*11,1,1,3,0,'#f4f4f0');
      }
      if(dx!==0)marks.add(G.plane,cx+dx*14,0.035,cz+(-dx)*0+ (dx>0?3.9:-3.9)*0 + (dx>0?4:-4),0.5,1,7.6,0,'#f4f4f0');
      else marks.add(G.plane,cx+(dz>0?-4:4),0.035,cz+dz*14,7.6,1,0.5,0,'#f4f4f0');
    }
  }
  const mm=marks.build(matPlain,false,false);if(mm)scene.add(mm);

  /* poteaux de feux + lampes */
  const infra=new Mesher(),lamps=[new Mesher(),new Mesher()];
  for(let i=0;i<=NB;i++)for(let j=0;j<=NB;j++){
    const cx=i*PITCH,cz=j*PITCH,o=9.5;
    const defs=[[-o,-o,0,0,-0.25],[o,o,0,0,0.25],[-o,o,1,-0.25,0],[o,-o,1,0.25,0]];
    for(const[ox,oz,ax,lx,lz]of defs){
      infra.add(G.cyl5,cx+ox,2.5,cz+oz,0.22,5,0.22,0,'#3a3f46');
      infra.add(G.box,cx+ox+lx*0.6,4.7,cz+oz+lz*0.6,0.5+Math.abs(lz)*0.2,0.9,0.5+Math.abs(lx)*0.2,0,'#20252b');
      if(ax===0)lamps[0].add(G.box,cx+ox,4.7,cz+oz+lz*1.2,0.5,0.5,0.1,0,'#ffffff');
      else lamps[1].add(G.box,cx+ox+lx*1.2,4.7,cz+oz,0.1,0.5,0.5,0,'#ffffff');
    }
  }
  const im=infra.build(matPlain,false,false);if(im)scene.add(im);
  for(let a=0;a<2;a++){const lm=lamps[a].build(lampMat[a],false,false);if(lm){scene.add(lm);lampMeshes[a]=lm}}

  /* blocs de ville */
  const pick=(r,arr)=>arr[Math.floor(r()*arr.length)];
  for(let i=0;i<NB;i++)for(let j=0;j<NB;j++){
    const d=districtOfBlock(i,j),rng=mulberry32(i*977+j*131+5),x0=i*PITCH+12,z0=j*PITCH+12,W=76;
    const walls=new Mesher(),plain=new Mesher();
    const tree=(x,z,sc)=>{sc=sc||1;plain.add(G.cyl5,x,0.9*sc,z,0.3*sc,1.8*sc,0.3*sc,0,'#6b4a2f');
      plain.add(G.cone6,x,3.5*sc,z,2.5*sc,3.4*sc,2.5*sc,0,'#4f8a46');plain.add(G.cone6,x,5.2*sc,z,1.7*sc,2.4*sc,1.7*sc,0,'#5c9d4e');addCircle(x,z,0.5*sc)};
    const roofCap=(cx,cz,w,dd,h)=>plain.add(G.box,cx,h+0.35,cz,w+0.6,0.7,dd+0.6,0,'#d3d8dc');
    if(d==='tours'){
      const cd=Math.hypot(i-5.5,j-5.5),baseH=55+(2.3-cd)*50;
      const pal=['#8fb0c8','#a8bfcc','#7d9db8','#b9c6cf','#96a9b8','#a3b4c2'];
      const tower=(cx,cz,w,dd,h,col)=>{walls.add(G.box,cx,h/2,cz,w,h,dd,0,col,8,7.2);roofCap(cx,cz,w,dd,h);
        if(rng()<0.5)plain.add(G.box,cx,h+4,cz,0.5,7,0.5,0,'#8a949c');addBox(cx,cz,w,dd)};
      if(rng()<0.4){tower(x0+W/2,z0+W/2,44+rng()*16,44+rng()*16,baseH*1.5+rng()*40,pick(rng,pal))}
      else for(let a=0;a<2;a++)for(let b=0;b<2;b++){tower(x0+19+a*38,z0+19+b*38,26+rng()*8,26+rng()*8,baseH*(0.5+rng()*0.8)+12,pick(rng,pal))}
      for(let n=0;n<4;n++)tree(x0+4+rng()*68,z0+3+(n%2?68:2)+rng()*2,0.8);
    }else if(d==='maisons'){
      const wall=['#efe3cc','#f2d9c0','#e8e4da','#d9c7a8','#f4efe6','#c9d8de'],roof=['#a64b32','#7a4a3a','#555e66','#8c3b2c','#6a5a4a'];
      for(let a=0;a<3;a++)for(let b=0;b<2;b++){
        const cx=x0+12.7+a*25.3+(rng()-0.5)*3,cz=z0+19+b*38+(rng()-0.5)*4,w=9+rng()*4,dd=8+rng()*4,h=4.6+rng()*1.6;
        walls.add(G.box,cx,h/2,cz,w,h,dd,0,pick(rng,wall),4.5,3.8);
        plain.add(G.pyr,cx,h+1.3,cz,w+0.9,2.6,dd+0.9,0,pick(rng,roof));
        plain.add(G.box,cx+w*0.2,h+2.2,cz,0.6,1.6,0.6,0,'#9a8f84');
        addBox(cx,cz,w,dd);
        tree(cx+(rng()<.5?-1:1)*(w/2+3.5),cz+(rng()-.5)*10,0.9+rng()*0.3);
        if(rng()<.5)tree(cx+(rng()-.5)*8,cz+(b?-1:1)*(dd/2+5),0.8);
      }
    }else if(d==='commerce'){
      const pal=['#b9654a','#d8b28c','#c9c0a8','#a45f4a','#c98f6a','#9aa6a8'];
      for(let a=0;a<2;a++)for(let b=0;b<2;b++){
        const cx=x0+19+a*38,cz=z0+19+b*38;
        if(rng()<0.18){tree(cx,cz,1);tree(cx+6,cz+4,0.8);plain.add(G.box,cx-5,0.3,cz,3,0.6,0.8,0,'#7b5a3a');continue}
        const w=30+rng()*5,dd=30+rng()*5,h=14+rng()*24;
        walls.add(G.box,cx,h/2,cz,w,h,dd,0,pick(rng,pal),6,5);roofCap(cx,cz,w,dd,h);
        plain.add(G.box,cx+(rng()-.5)*10,h+1.4,cz+(rng()-.5)*10,4,2,3,0,'#9aa1a6');
        addBox(cx,cz,w,dd);
      }
    }else if(d==='entrepots'){
      const wc=['#8d98a3','#a3a8ad','#7e8d95','#b0a99a'],cc=['#d9532f','#2f6fb3','#e0a82e','#3b8a5a','#8b4a9a','#c9c9c9'];
      const wh=(cx,cz,w,dd,h)=>{const col=pick(rng,wc);plain.add(G.box,cx,h/2,cz,w,h,dd,0,col);plain.add(G.box,cx,h+0.4,cz,w+0.5,0.8,dd+0.5,0,'#c5c9cc');
        plain.add(G.box,cx,h*0.35,cz,w+0.15,1.2,dd+0.15,0,'#3f6a8c');addBox(cx,cz,w,dd)};
      wh(x0+W/2,z0+15,70,26,10+rng()*4);wh(x0+W/2,z0+W-15,70,26,10+rng()*4);
      for(let n=0;n<9;n++){const cx=x0+8+rng()*60,cz=z0+36+rng()*4+(n%3)*10,hor=rng()<.5,cw=hor?12:2.5,cd=hor?2.5:12,lv=1+(rng()*2|0);
        for(let s=0;s<lv;s++)plain.add(G.box,cx,1.3+s*2.6,cz,cw,2.6,cd,0,pick(rng,cc));addBox(cx,cz,cw,cd)}
    }else{
      const pond=((i+j)%3===0);
      for(let n=0;n<36;n++){const x=x0+3+rng()*70,z=z0+3+rng()*70;
        if(pond&&Math.hypot(x-(x0+38),z-(z0+38))<19)continue;
        if(Math.abs(x-(x0+38))<5||Math.abs(z-(z0+38))<5)continue;
        tree(x,z,0.9+rng()*0.5)}
      if(pond){plain.add(G.cyl,x0+38,0.05,z0+38,34,0.1,34,0,'#5fb4d6');addCircle(x0+38,z0+38,17)}
      for(let n=0;n<4;n++){const bx=x0+38+(n<2?-7:7),bz=z0+(n%2?20:56);plain.add(G.box,bx,0.45,bz,2.2,0.9,0.7,0,'#7b5a3a')}
    }
    /* lampadaires aux coins */
    for(const[lx,lz]of[[x0-1.5,z0-1.5],[x0+W+1.5,z0-1.5],[x0-1.5,z0+W+1.5],[x0+W+1.5,z0+W+1.5]]){
      plain.add(G.cyl5,lx,3,lz,0.16,6,0.16,0,'#4a5058');plain.add(G.box,lx,6.1,lz,0.7,0.2,0.4,0,'#e8e2c8')}
    const mw=walls.build(matWalls),mpl=plain.build(matPlain);
    if(mw)scene.add(mw);if(mpl)scene.add(mpl);
  }

  /* garages : petite boutique sur le trottoir + faisceau vert */
  const gm=new Mesher();
  GARAGES.forEach((gr,idx)=>{
    const cx=gr.x+gr.sx*9.8,cz=gr.z+gr.sz*9.8,w=gr.sz!==0?9:3.2,dd=gr.sz!==0?3.2:9;
    gm.add(G.box,cx,1.8,cz,w,3.6,dd,0,'#2d3945');gm.add(G.box,cx,3.8,cz,w+0.4,0.4,dd+0.4,0,'#3fd99a');
    gm.add(G.box,cx-gr.sx*0+(gr.sz!==0?0:0),1.4,cz-gr.sz*1.62,gr.sz!==0?6.4:0.1,2.6,gr.sz!==0?0.1:6.4,0,'#8fb5d0');
    addBox(cx,cz,w,dd);
    m.fillStyle='#3fd99a';m.fillRect(mp(gr.x)-3,mp(gr.z)-3,6,6);
  });
  const gmesh=gm.build(matPlain);if(gmesh)scene.add(gmesh);
  const beamMat=new THREE.MeshBasicMaterial({color:0x3fd99a,transparent:true,opacity:0.22,depthWrite:false,side:THREE.DoubleSide});
  GARAGES.forEach(gr=>{const b=new THREE.Mesh(new THREE.CylinderGeometry(3,3,46,16,1,true),beamMat);b.position.set(gr.x,23,gr.z);scene.add(b);
    const r=new THREE.Mesh(new THREE.RingGeometry(10.6,12,32).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x3fd99a,transparent:true,opacity:.7}));r.position.set(gr.x,0.06,gr.z);scene.add(r)});
}
/* ====================== p2 : véhicules, joueur, police ====================== */
const KEYS={};
let audioCtx=null,engOsc=null,engGain=null,sirOsc=null,sirGain=null,muted=false;
function initAudio(){
  if(audioCtx)return;
  try{
    audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    engOsc=audioCtx.createOscillator();engOsc.type='sawtooth';engGain=audioCtx.createGain();engGain.gain.value=0;
    const f=audioCtx.createBiquadFilter();f.type='lowpass';f.frequency.value=420;
    engOsc.connect(f);f.connect(engGain);engGain.connect(audioCtx.destination);engOsc.start();
    sirOsc=audioCtx.createOscillator();sirOsc.type='square';sirGain=audioCtx.createGain();sirGain.gain.value=0;
    const f2=audioCtx.createBiquadFilter();f2.type='lowpass';f2.frequency.value=1500;
    sirOsc.connect(f2);f2.connect(sirGain);sirGain.connect(audioCtx.destination);sirOsc.start();
  }catch(e){audioCtx=null}
}
function beep(freq,dur,type,vol){
  if(!audioCtx||muted)return;
  try{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type||'sine';o.frequency.value=freq;
    g.gain.setValueAtTime(vol||0.08,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+dur);
    o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+dur)}catch(e){}
}
function updateAudio(speedMs,wanted,t){
  if(!audioCtx)return;
  const on=!muted&&GAME.state==='play';
  engOsc.frequency.value=55+speedMs*5.5;engGain.gain.value=on?Math.min(0.05,0.01+speedMs*0.0016):0;
  sirOsc.frequency.value=wanted>0?(Math.floor(t*2)%2?640:860):600;sirGain.gain.value=on&&wanted>0?0.012+0.004*wanted:0;
}

/* ---------- état global ---------- */
const GAME={state:'menu',t:0,clock:0,cam:0,wanted:0,heat:0,unseen:0,crimePend:0,crimeKind:'',spot:0,arrest:0,seen:false,bustedFine:0,peakWanted:0};
const vehicles=[];
/* yr : vitesse de lacet ; rs : roue arrière en glissement ; wv : vitesse angulaire du wheelie ; camH : cap de la caméra */
const P={x:250,z:300,h:0,vx:0,vz:0,steer:0,dl:0,pab:0,yr:0,rs:false,drift:0,lean:0,wheelie:0,wv:0,spd:0,wob:0,top:0,graceT:0,inInter:false,lastLimitWarn:0,dist:0,camH:0};
/* chute : la trottinette glisse et se couche, le pilote est éjecté puis revient à pied la relever */
const CR={on:false,phase:'',t:0,pivot:null,vel:new THREE.Vector3(),spin:new THREE.Vector3(),jv:[],sx:0,sz:0,sh:0,svx:0,svz:0,syv:0,roll:0,rollT:0,walk:0,from:null};
let playerMesh=null;

/* ---------- modèle de trottinette (réaliste : PBR, pneus à profil, jantes alliage, fourche suspendue) ---------- */
const matDark=RK.M.plastic(0x16181b);
const matMetal=RK.M.alu(0x9aa3ab);
const matTire=RK.M.rubber();
const matHead=new THREE.MeshBasicMaterial({color:0xfff5c4});
const matTail=RK.M.glow(0xff2a2a,1.7);
const matSkin=RK.M.std(0xd6a07c,.6,0);
const matJacket=RK.M.std(0x2d3640,.78,0);
const matPants=RK.M.std(0x2c3b57,.86,0);
function bx(w,h,d,mat,x,y,z,par){const m=new THREE.Mesh(RK.rbox(w,h,d,Math.min(w,h,d)*.22,2),mat);m.position.set(x,y,z);m.castShadow=true;(par||null)&&par.add(m);return m}
function scooterRod(a,b,r,mat,par,segments){return RK.rod(par,a,b,r,mat,segments||12)}
function scooterSpring(a,b,r,wire,mat,par){
  const start=new THREE.Vector3(a[0],a[1],a[2]),axis=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),length=axis.length();
  axis.normalize();const ref=Math.abs(axis.y)<0.9?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0);
  const u=new THREE.Vector3().crossVectors(axis,ref).normalize(),v=new THREE.Vector3().crossVectors(axis,u).normalize(),points=[];
  for(let i=0;i<=60;i++){const t=i/60,angle=t*Math.PI*14;points.push(start.clone().addScaledVector(axis,length*t).addScaledVector(u,Math.cos(angle)*r).addScaledVector(v,Math.sin(angle)*r))}
  const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),140,wire,6,false),mat);tube.castShadow=true;par.add(tube);return tube;
}
function scooterPart(geometry,material,position,scale,parent){
  const mesh=new THREE.Mesh(geometry,material);mesh.position.set(position[0],position[1],position[2]);mesh.scale.set(scale[0],scale[1],scale[2]);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
/* garde-boue : coque fine tournée autour de l'axe X, de l'angle a0 à a1 (0 = vers l'avant, PI/2 = dessus) */
function fenderGeo(R,W,a0,a1,th){
  th=th||.012;const p=[[R+.004,-W*.6],[R+th*1.6,-W*.5],[R+th*2.2,0],[R+th*1.6,W*.5],[R+.004,W*.6],[R,W*.56],[R+th*.9,W*.46],[R+th*1.3,0],[R+th*.9,-W*.46],[R,-W*.56],[R+.004,-W*.6]];
  const g=RK.lathe(p,36,Math.PI*1.5-a1+Math.PI/2,a1-a0);g.rotateZ(-Math.PI/2);return g;
}
const SCOOTER_DESIGNS={
  g2:{wheel:.24,front:.56,rear:-.52,deck:1,width:.3,handle:1.38,handleWidth:.62,battery:.5,suspension:0,motors:1,tread:0},
  m4pro:{wheel:.27,front:.59,rear:-.56,deck:1.08,width:.34,handle:1.4,handleWidth:.7,battery:.66,suspension:1,motors:1,tread:0},
  g2pro:{wheel:.28,front:.61,rear:-.58,deck:1.1,width:.35,handle:1.4,handleWidth:.72,battery:.58,suspension:2,motors:1,tread:0},
  g2max:{wheel:.3,front:.64,rear:-.62,deck:1.18,width:.38,handle:1.42,handleWidth:.76,battery:.76,suspension:1,motors:1,tread:0},
  s1pro:{wheel:.21,front:.51,rear:-.48,deck:.91,width:.27,handle:1.43,handleWidth:.58,battery:.38,suspension:0,motors:1,tread:0},
  g3:{wheel:.31,front:.64,rear:-.62,deck:1.2,width:.39,handle:1.43,handleWidth:.78,battery:.68,suspension:2,motors:1,tread:0},
  g3pro:{wheel:.32,front:.67,rear:-.65,deck:1.24,width:.4,handle:1.45,handleWidth:.82,battery:.74,suspension:2,motors:2,tread:0},
  g4:{wheel:.33,front:.69,rear:-.67,deck:1.27,width:.41,handle:1.46,handleWidth:.86,battery:.8,suspension:2,motors:2,tread:0},
  g5:{wheel:.35,front:.72,rear:-.7,deck:1.3,width:.43,handle:1.47,handleWidth:.9,battery:.84,suspension:2,motors:2,tread:1},
  g6:{wheel:.36,front:.74,rear:-.72,deck:1.34,width:.44,handle:1.49,handleWidth:.92,battery:.9,suspension:2,motors:2,tread:1}
};
const SCOOTER_STYLE={
  g2:{spokes:5,cowl:0},m4pro:{spokes:6,cowl:0,skirts:1},g2pro:{spokes:5,split:.42,cowl:1},g2max:{spokes:6,cowl:0,rack:1},s1pro:{spokes:5,cowl:0,latch:1},
  g3:{spokes:6,cowl:2,guards:1},g3pro:{spokes:5,split:.42,cowl:2,leds:1,signals:1},g4:{spokes:5,split:.42,cowl:1,fins:1,leds:1,signals:1},
  g5:{spokes:6,cowl:2,tail:1,leds:1,signals:1},g6:{spokes:6,cowl:3,leds:1,fins:1,signals:1}
};
function buildScooter(scooterId,color){
  const D=SCOOTER_DESIGNS[scooterId]||SCOOTER_DESIGNS.g2,ST=SCOOTER_STYLE[scooterId]||SCOOTER_STYLE.g2,M=RK.M,A=RK.add,V=(x,y,z)=>new THREE.Vector3(x,y,z);
  const root=new THREE.Group(),tilt=new THREE.Group(),body=new THREE.Group();root.add(tilt);tilt.add(body);
  /* --- matériaux --- */
  const accent=M.paint(color,{metalness:.42,roughness:.3}),
    satin=M.std(0x1c1e21,.48,.45),black=M.plastic(0x111214),alu=M.alu(0xb8bfc6),aluDark=M.alu(0x3b4046,{roughness:.36}),chrome=M.chrome(),
    rimMat=M.alu(scooterId==='g6'?0x28d9d1:scooterId==='g5'?0xd6dbe0:scooterId==='g4'||scooterId==='g3pro'?0x2a2d31:0x7b8590,{roughness:.26}),
    discMat=M.std(0xcfd4d8,.2,1),caliperMat=M.paint(scooterId==='g6'||scooterId==='g5'?0xd9a31c:0xc0261d,{metalness:.2}),
    glow=M.glow(scooterId==='g6'?0x45f3dc:color,1.8),lens=M.lens(),led=M.glow(0xfff4dc,2.4),amber=M.glow(0xff9a14,1.1),
    gripTex=RK.noiseTex('#2c2d30',46,128,5,{color:true,repeat:[3,9]}),
    grip=M.std(0xffffff,.97,0,{map:gripTex,bumpMap:gripTex,bumpScale:.003});
  /* --- cotes --- */
  const R=D.wheel*.6+.012,W=R*(D.tread?.78:.64),rimR=R*.6,front=D.front,rear=D.rear;
  const dh=.075+D.battery*.05,deckY=R*.86+dh/2,dTop=deckY+dh/2+.008;
  const z0=rear+R*.92,z1=front-R-.035,deckL=z1-z0,deckZ=(z0+z1)/2,dw=D.width*.82;
  /* pivot du wheelie sur l'axe de la roue arrière */
  tilt.position.set(0,R,rear);body.position.set(0,-R,-rear);
  const rake=.13,axisDir=V(0,1,-rake).normalize(),axle=V(0,R,front);
  const pAxis=y=>V(0,y,front-rake*(y-R));
  const headY=dTop+.2,head=pAxis(headY),barY=D.handle,barP=pAxis(barY),barZ=barP.z,hw=D.handleWidth/2;
  /* --- plateau : coque peinte, batterie intégrée, grip, jonc alu, fond noir --- */
  A(body,RK.rbox(dw,dh,deckL,.03,3),accent,0,deckY,deckZ);
  A(body,RK.rbox(dw*.94,.022,deckL*.97,.01,2),black,0,deckY-dh/2-.006,deckZ);
  A(body,RK.rbox(dw*.86,.008,deckL*.88,.003,1),grip,0,dTop-.003,deckZ,0,0,0,{recv:true});
  for(const s of[-1,1]){
    A(body,RK.rbox(.008,.018,deckL*.9,.004,1),alu,s*(dw/2+.002),dTop-.02,deckZ);
    A(body,RK.rbox(.02,.03,.05,.008,1),black,s*(dw/2-.004),deckY-dh/2-.004,z1-.06);
    if(ST.leds)A(body,RK.rbox(.012,.012,deckL*.82,.005,1),glow,s*(dw/2-.014),deckY-dh/2-.012,deckZ,0,0,0,{noShadow:true});
    if(ST.skirts){A(body,RK.rbox(.03,dh+.08,deckL*.62,.012,2),accent,s*(dw/2+.016),deckY+.015,deckZ);A(body,RK.rbox(.006,.04,deckL*.4,.003,1),M.glow(0xff7a1a,.6),s*(dw/2+.033),deckY+.03,deckZ-.04)}
    if(ST.guards)RK.rod(body,[s*(dw/2+.03),dTop+.01,z0+.06],[s*(dw/2+.03),dTop+.01,z1-.08],.011,alu);
    if(ST.fins)for(let i=0;i<6;i++)A(body,RK.rbox(.012,dh*.7,.018,.004,1),aluDark,s*(dw/2+.006),deckY,deckZ-deckL*.2+i*.04);
  }
  if(ST.guards)for(const z of[z0+.06,z1-.08])for(const s of[-1,1])RK.rod(body,[s*(dw/2+.03),dTop+.01,z],[s*(dw/2-.005),deckY,z],.009,alu);
  /* logo latéral */
  const logo=document.createElement('canvas');logo.width=320;logo.height=80;
  const lg=logo.getContext('2d');lg.clearRect(0,0,320,80);lg.fillStyle='rgba(12,16,22,.0)';lg.fillRect(0,0,320,80);
  lg.fillStyle='#f1f5f8';lg.font='italic 900 38px Arial';lg.fillText('KUKIRIN',12,44);
  lg.fillStyle='rgba(255,255,255,.75)';lg.font='bold 20px Arial';lg.fillText(SC_BY_ID[scooterId].name.replace('KUKIRIN ','').toUpperCase(),16,70);
  const logoTexture=new THREE.CanvasTexture(logo),logoMat=new THREE.MeshBasicMaterial({map:logoTexture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
  for(const side of[-1,1]){
    const badge=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(.34,deckL*.5),Math.min(.085,dh*.85)),logoMat);
    badge.position.set(side*(dw/2+.0015),deckY-.004,deckZ+.02);badge.rotation.y=side*Math.PI/2;body.add(badge);
  }
  /* --- col de direction : pièce coulée qui relie le plateau à la colonne --- */
  RK.between(body,L=>RK.rbox(dw*.42,L,.07,.03,2).translate(0,L/2,0),accent,V(0,deckY,z1-.05),V(0,headY-.03,head.z-.015));
  A(body,RK.rbox(dw*.5,dh*.9,.12,.035,2),accent,0,deckY+.01,z1-.03);
  /* charnière de pliage, collier, levier */
  const hingeG=A(body,new THREE.CylinderGeometry(.036,.036,dw*.5,20),aluDark,0,headY-.05,head.z-.03,0,0,Math.PI/2);
  A(body,new THREE.CylinderGeometry(.044,.044,.07,24),alu,head.x,head.y+.04,head.z).quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),axisDir);
  const lever=A(body,RK.rbox(.03,.14,.022,.01,2),black,.045,head.y+.05,head.z-.03);lever.rotation.set(-.15,0,.12);
  if(ST.latch)A(body,new THREE.TorusGeometry(.05,.008,8,24),alu,0,head.y+.1,head.z-.012,Math.PI/2+.13,0,0);
  /* --- colonne + guidon --- */
  const stemR=.022+D.motors*.004,stemMat=D.motors===2?aluDark:satin;
  RK.rod(body,pAxis(headY-.02),pAxis(barY-.03),stemR,stemMat,20);
  A(body,new THREE.CylinderGeometry(stemR*1.35,stemR*1.35,.05,20),alu,0,0,0).position.copy(pAxis(headY+.16));
  /* carénage avant de colonne avec phare */
  const shroudY=barY-.26,shP=pAxis(shroudY);
  RK.between(body,L=>RK.rbox(.075,L,.05,.022,2).translate(0,L/2,0),accent,pAxis(headY+.2).add(V(0,0,.028)),pAxis(barY-.12).add(V(0,0,.028)));
  const lamp=new THREE.Group();lamp.position.copy(shP).add(V(0,0,.055));body.add(lamp);
  A(lamp,RK.lathe([[.0,-.03],[.038,-.03],[.046,-.01],[.048,.02],[.044,.026]],24),black,0,0,0,Math.PI/2,0,0);
  A(lamp,new THREE.CircleGeometry(.04,24),M.chrome({roughness:.12}),0,0,.024);
  A(lamp,new THREE.CircleGeometry(.016,16),led,0,0,.026,0,0,0,{noShadow:true});
  A(lamp,new THREE.SphereGeometry(.044,24,10,0,Math.PI*2,0,Math.PI/2.6),lens,0,0,.012,Math.PI/2,0,0,{noShadow:true});
  /* potence, cintre, poignées, leviers, gâchette */
  A(body,RK.rbox(.07,.05,.06,.018,2),satin,0,barY,barZ);
  const barPts=[[-hw,barY+.004,barZ-.035],[-hw*.6,barY+.006,barZ-.008],[0,barY,barZ],[hw*.6,barY+.006,barZ-.008],[hw,barY+.004,barZ-.035]];
  A(body,RK.tube(barPts,.0145,{seg:40,radial:12}),satin,0,0,0);
  const gripProf=[];for(let i=0;i<=14;i++){const t=i/14;gripProf.push([.021+(i%2?.002:0)+(i===0||i===14?.004:0),-.065+t*.13])}
  for(const s of[-1,1]){
    const gp=A(body,RK.lathe(gripProf,18),black,s*(hw-.06),barY+.004,barZ-.03);gp.rotation.z=Math.PI/2;gp.rotation.x=s*.1;
    A(body,new THREE.CylinderGeometry(.024,.024,.012,18),aluDark,s*(hw+.004),barY+.004,barZ-.036,0,0,Math.PI/2);
    A(body,RK.rbox(.04,.03,.035,.01,2),black,s*(hw-.15),barY+.012,barZ-.012);
    A(body,RK.tube([[s*(hw-.15),barY+.01,barZ+.012],[s*(hw-.1),barY+.0,barZ+.05],[s*(hw-.02),barY-.012,barZ+.048]],.0055,{radial:6}),alu,0,0,0);
    A(body,RK.tube([[s*(hw-.16),barY-.005,barZ+.0],[s*(hw*.4),barY-.07,barZ+.04],[s*.04,shroudY+.02,barZ+.07],[s*.03,headY+.05,head.z+.06]],.005,{radial:5,seg:30}),black,0,0,0);
    if(ST.signals){A(body,RK.rbox(.03,.02,.025,.008,1),amber,s*(hw+.018),barY+.004,barZ-.036,0,0,0,{noShadow:true})}
  }
  A(body,RK.rbox(.03,.035,.012,.006,1),black,hw-.17,barY-.012,barZ-.032).rotation.x=-.5;
  A(body,RK.rbox(.05,.03,.03,.01,1),black,-(hw-.17),barY+.01,barZ-.03);
  /* phares additionnels pour les modèles double optique */
  const headCount=scooterId==='g3pro'||scooterId==='g4'||scooterId==='g5'||scooterId==='g6'?2:1;
  if(headCount===2)for(const s of[-1,1]){const g=new THREE.Group();g.position.set(s*.11,barY-.05,barZ+.045);body.add(g);
    A(g,RK.lathe([[0,-.03],[.026,-.03],[.032,.0],[.03,.018]],18),black,0,0,0,Math.PI/2,0,0);A(g,new THREE.CircleGeometry(.024,18),led,0,0,.019,0,0,0,{noShadow:true});
    RK.rod(body,[s*.11,barY-.05,barZ+.02],[s*.06,barY-.01,barZ+.005],.006,satin)}
  /* écran : boîtier incliné vers le pilote */
  const dispN=V(0,Math.sin(.45),-Math.cos(.45)),dispC=V(0,barY+.06,barZ+.01);
  const hous=A(body,RK.rbox(ST.tail?.27:.24,.125,.035,.015,2),black,dispC.x,dispC.y,dispC.z);hous.rotation.set(.45,Math.PI,0);
  /* --- fourche avant --- */
  const crownY=headY-.06,fx=W/2+.026,legTop=V(0,crownY,front-rake*(crownY-R));
  A(body,RK.rbox(fx*2+.05,.04,.06,.016,2),satin,0,crownY,legTop.z);
  for(const s of[-1,1]){
    const top=V(s*fx,crownY,legTop.z),bot=V(s*fx,R,front),mid=top.clone().lerp(bot,.48);
    if(D.suspension){
      RK.rod(body,top,mid,.014,M.chrome({roughness:.1}),14);
      RK.rod(body,mid.clone().add(V(0,.02*axisDir.y,0)),bot.clone().add(V(0,-.02,0)),.019,D.motors===2?aluDark:satin,14);
      scooterSpring([top.x,top.y-.01,top.z],[mid.x,mid.y+.02,mid.z+rake*.02],.024,.0042,accent,body);
    }else RK.between(body,L=>RK.rbox(.022,L,.04,.009,2).translate(0,L/2,0),satin,bot.clone().add(V(0,-.03,0)),top);
    A(body,RK.rbox(.026,.05,.06,.01,2),D.motors===2?aluDark:satin,s*fx,R,front);
    A(body,new THREE.CylinderGeometry(.011,.011,.012,6),alu,s*(fx+.016),R,front,0,0,Math.PI/2);
  }
  A(body,fenderGeo(R,W*1.05,.15,2.25,.01),accent,0,R,front);
  /* --- bras arrière, amortisseurs --- */
  for(const s of[-1,1]){
    const x=s*(W/2+.02);
    RK.between(body,L=>RK.rbox(.016,L,.055,.007,2).translate(0,L/2,0),satin,V(x,R,rear),V(x,deckY-.01,z0+.03));
    A(body,new THREE.CylinderGeometry(.011,.011,.012,6),alu,x+s*.01,R,rear,0,0,Math.PI/2);
    if(D.suspension>0){
      const a=V(x,dTop+.05,z0+.05),b=V(x,R+.03,rear+.06);
      RK.rod(body,b,a,.008,M.chrome({roughness:.1}),10);RK.rod(body,b,b.clone().lerp(a,.45),.014,aluDark,12);
      scooterSpring([b.x,b.y+.02,b.z],[a.x,a.y-.01,a.z],.019,.0036,accent,body);
    }
  }
  A(body,fenderGeo(R,W*1.08,1.0,3.05,.011),accent,0,R,rear);
  const tailZ=rear-Math.cos(Math.PI-3.05)*R*1.02,tailY=R+Math.sin(3.05)*R*1.02;
  A(body,RK.rbox(.085,.028,.03,.01,2),matTail,0,R+R*.17,tailZ-.004,0,0,0,{noShadow:true});
  A(body,RK.rbox(W*.7,.07,.006,.003,1),black,0,R*1.08-.04,tailZ+.004);
  /* --- roues : pneu à profil + jante alliage + disque percé + moteur-moyeu --- */
  const wheels=[];
  const tg=RK.tireGeo(R,W,rimR,{round:.55,seg:44}),tm=RK.tireMat(D.tread?'knobby':'scooter',tg);
  for(const [z,isFront] of[[front,true],[rear,false]]){
    const wg=new THREE.Group();wg.position.set(0,R,z);wg.userData.r=R;body.add(wg);wheels.push(wg);
    A(wg,tg,tm,0,0,0);
    const motor=isFront?D.motors===2:true,rg=RK.rimGeo(rimR,W*.82,{spokes:ST.spokes,split:ST.split,hub:motor?.62:.3,inner:.86,spokeW:rimR*(motor?.13:.17)});
    A(wg,rg.face,rimMat,0,0,0);A(wg,rg.barrel,rimMat,0,0,0);
    if(motor){
      const drum=[];for(let i=0;i<=10;i++){const t=i/10;drum.push([rimR*.6+(i%2&&i>1&&i<9?.004:0),-W*.36+t*W*.72])}
      A(wg,RK.lathe(drum,32),black,0,0,0,0,0,-Math.PI/2);
      for(const s of[-1,1]){A(wg,new THREE.CylinderGeometry(rimR*.28,rimR*.32,.012,24),aluDark,s*W*.37,0,0,0,0,Math.PI/2);
        for(let b=0;b<6;b++){const a=b/6*Math.PI*2;A(wg,new THREE.CylinderGeometry(.005,.005,.008,6),alu,s*W*.38,Math.sin(a)*rimR*.45,Math.cos(a)*rimR*.45,0,0,Math.PI/2)}}
    }else A(wg,rg.hub,rimMat,0,0,0);
    A(wg,new THREE.CylinderGeometry(.012,.012,W*1.1,10),alu,0,0,0,0,0,Math.PI/2);
    const dr=rimR*.92;A(wg,RK.discGeo(dr,dr*.62,.004,{holes:18}),discMat,-(W*.44+.006),0,0);
    for(let k=0;k<5;k++){const a=k/5*Math.PI*2;RK.rod(wg,[-(W*.44+.006),Math.sin(a)*dr*.62,Math.cos(a)*dr*.62],[-(W*.44+.006),Math.sin(a)*rimR*.3,Math.cos(a)*rimR*.3],.006,aluDark,6)}
    const ca=isFront?2.3:.9;
    A(body,RK.rbox(.03,.055,.07,.012,2),caliperMat,-(W*.44+.006),R+Math.sin(ca)*dr*.86,z+Math.cos(ca)*dr*.86,-ca+Math.PI/2,0,0);
  }
  /* béquille */
  RK.rod(body,[-dw*.38,deckY-dh/2,z0+.16],[-dw*.42-.04,deckY-dh/2-.03,z0-.06],.009,alu,8);
  /* --- équipements spécifiques --- */
  if(ST.cowl){
    const cz=head.z+.02,cy=headY+.08,k=ST.cowl;
    const cg=RK.loft([{z:cz-.1,w:.07,t:.07,b:.06,y:cy,n:2.4},{z:cz-.03,w:.1+k*.012,t:.11+k*.01,b:.09,y:cy,n:2.6},{z:cz+.06,w:.095+k*.012,t:.09+k*.012,b:.08,y:cy-.01,n:2.6},{z:cz+.11+k*.02,w:.05,t:.04,b:.04,y:cy-.02,n:2.2}],{sides:28,sub:5});
    A(body,cg,accent,0,0,0);
    A(body,RK.rbox(.11+k*.02,.016,.01,.006,1),led,0,cy-.01,cz+.105+k*.02,-.5,0,0,{noShadow:true});
    if(k>=2)for(const s of[-1,1])A(body,RK.rbox(.02,.012,.08,.005,1),glow,s*(.1+k*.012),cy,cz+.01,0,0,0,{noShadow:true});
  }
  if(ST.rack){
    const ry=R*2+.06;for(const s of[-1,1]){RK.rod(body,[s*.11,dTop,z0+.02],[s*.11,ry,rear+.02],.008,satin);RK.rod(body,[s*.11,ry,rear+.02],[s*.11,ry,rear-.18],.008,satin)}
    for(const z of[rear+.02,rear-.08,rear-.18])RK.rod(body,[-.11,ry,z],[.11,ry,z],.007,satin);
    A(body,RK.rbox(dw*.8,.06,deckL*.6,.02,2),black,0,deckY-dh/2-.035,deckZ);
  }
  if(ST.tail){A(body,RK.loft([{z:rear-.05,w:.05,t:.03,y:R*2+.03},{z:rear+.1,w:.09,t:.05,y:R*2+.035},{z:z0+.02,w:.11,t:.06,y:dTop+.04}],{sides:24}),accent,0,0,0)}
  /* --- pilote : humain articulé (plié aux genoux, mains sur les poignées) --- */
  const rider=new THREE.Group();body.add(rider);
  const shoes=M.std(0xe9e9e6,.7,0),sole=M.std(0x2a2a2a,.85,0),gloveMat=M.std(0x18191b,.65,0),helmShell=M.paint(0xf2f2f0,{metalness:.1,roughness:.35}),visorMat=M.std(0x0b0c0e,.2,.4);
  const lean=.2,thigh=.44,shin=.43,upper=.29,fore=.27;
  const pelvisH=dTop+.88,torsoL=.5;
  let zc=deckZ-.02;
  const shoulderOff=V(0,torsoL*Math.cos(lean)-.04,torsoL*Math.sin(lean));
  { /* recule ou avance le pilote pour que les bras atteignent le guidon avec les coudes pliés */
    const sy=pelvisH+shoulderOff.y,dy=barY-sy,dx=(hw-.07)-.18,want=.47,dz=Math.sqrt(Math.max(.02,want*want-dy*dy-dx*dx));
    zc=clamp(barZ-.03-dz-shoulderOff.z,z0+.22,z1-.2);
  }
  const hips=new THREE.Group();hips.position.set(0,pelvisH,zc);rider.add(hips);
  const torso=new THREE.Group();hips.add(torso);torso.rotation.x=lean;
  const tsecs=[{z:0,w:.165,t:.105,b:.1,n:2.4},{z:.12,w:.155,t:.095,b:.09},{z:.24,w:.15,t:.085,b:.095},{z:.36,w:.185,t:.1,b:.115,n:2.6},{z:.46,w:.205,t:.095,b:.09,n:2.9},{z:.52,w:.12,t:.06,b:.06},{z:.56,w:.055,t:.05,b:.05}];
  const tg2=RK.loft(tsecs,{sides:24,sub:4});tg2.rotateX(-Math.PI/2);A(torso,tg2,matJacket,0,-.05,0);
  A(torso,RK.lathe([[.0,0],[.06,0],[.065,.03],[.055,.06]],16),matJacket,0,.46,0);
  const headG=new THREE.Group();headG.position.set(0,torsoL-.03,.0);torso.add(headG);
  A(headG,new THREE.CylinderGeometry(.045,.05,.09,14),matSkin,0,.04,0);
  const face=A(headG,new THREE.SphereGeometry(.1,20,16),matSkin,0,.16,.015);face.scale.set(.86,1.08,.98);
  const hm=RK.helmet(headG,helmShell,visorMat,{r:.135,style:'urban'});hm.position.set(0,.2,-.005);
  for(const s of[-1,1])RK.rod(headG,[s*.1,.2,.02],[s*.07,.08,.06],.005,M.plastic(0x222222),6);
  const joints=[torso,headG];
  const feet=[[V(-.055,dTop,zc+.15),.0],[V(.07,dTop,zc-.15),.35]];
  for(const [s,ft] of[[-1,feet[0]],[1,feet[1]]]){
    const hipJ=V(s*.09,0,0),ankle=ft[0].clone().sub(hips.position).add(V(0,.075,0));
    const knee=RK.ik2(hipJ,ankle,thigh,shin,V(s*.15,0,1));
    const leg=RK.bone(hips,hipJ,knee,.075,.06,matPants,1.12);
    const kneeG=RK.bone(leg,leg.userData.tip,leg.userData.tip.clone().add(ankle.clone().sub(knee)),.058,.045,matPants,1.08);
    const foot=new THREE.Group();foot.position.copy(ankle.clone().sub(knee));kneeG.add(foot);foot.rotation.y=ft[1];
    A(foot,RK.rbox(.1,.075,.27,.035,2),shoes,0,-.035,.06);A(foot,RK.rbox(.105,.025,.28,.01,1),sole,0,-.07,.06);
    joints.push(leg);
  }
  rider.updateMatrixWorld(true);
  const arms=[];
  for(const s of[-1,1]){
    const shL=V(s*.19,torsoL-.07,.01),grip=V(s*(hw-.065),barY+.004,barZ-.03);
    const gT=torso.worldToLocal(rider.localToWorld(grip.clone()));
    const handL=gT.clone().add(V(-s*.0,0,-.015));
    const elb=RK.ik2(shL,handL,upper,fore,V(s*1,-.7,-.5));
    const arm=RK.bone(torso,shL,elb,.052,.045,matJacket,1.1);
    const fa=RK.bone(arm,arm.userData.tip,arm.userData.tip.clone().add(handL.clone().sub(elb)),.043,.034,matJacket,1.05);
    const hand=new THREE.Group();hand.position.copy(handL.clone().sub(elb));fa.add(hand);
    A(hand,RK.rbox(.05,.075,.09,.022,2),gloveMat,0,0,.012);
    joints.push(arm);arms.push({g:arm,sh:shL,rest:handL.clone().sub(shL).normalize(),grip});
  }
  /* --- écran de vitesse (vue à la première personne) --- */
  const display=document.createElement('canvas');display.width=256;display.height=128;
  const dg=display.getContext('2d'),displayTexture=new THREE.CanvasTexture(display);
  const displayMesh=new THREE.Mesh(new THREE.PlaneGeometry(0.2,0.1),new THREE.MeshBasicMaterial({map:displayTexture,side:THREE.DoubleSide,depthTest:false,depthWrite:false}));
  displayMesh.position.copy(dispC).addScaledVector(dispN,.019);displayMesh.rotation.set(.45,Math.PI,0);displayMesh.renderOrder=5;body.add(displayMesh);
  root.traverse(o=>{if(o.isMesh&&o.material!==lens&&o.material!==logoMat)o.receiveShadow=true});
  root.userData={accent,wheels,tilt,rider,riderBody:body,ragdollJoints:joints,display,displayMesh,dg,displayTexture,designId:scooterId,
    hips,torso,arms,feet:V(0,dTop,zc),standY:pelvisH-dTop,rearZ:rear,wheelR:R,jrest:joints.map(j=>j.quaternion.clone())};
  return root;
}


/* ---------- véhicules (carrosseries lissées, vitrages découpés, jantes alliage ; géométrie fusionnée par matériau) ---------- */
const SIREN_R=new THREE.MeshBasicMaterial({color:0xff2222}),SIREN_B=new THREE.MeshBasicMaterial({color:0x2a6bff});
const carGeoCache={};
const CARCOLS=['#c0392b','#2c6aa8','#d9d9d9','#2f3a44','#e0b030','#4f8f5a','#8a6f58','#e9e9e9','#7b7f86'];
const VMAT=(()=>{
  const M=RK.M;
  const plate=RK.labelTex((g,w,h)=>{g.fillStyle='#f7f7f2';g.fillRect(0,0,w,h);g.fillStyle='#1e3fa8';g.fillRect(0,0,52,h);g.fillRect(w-52,0,52,h);
    g.fillStyle='#fff';g.font='bold 30px Arial';g.fillText('F',14,h-26);g.fillStyle='#ffd400';g.beginPath();g.arc(26,34,16,0,6.3);g.fill();
    g.fillStyle='#111';g.font='bold 74px Arial';g.textAlign='center';g.fillText('KC-120-AZ',w/2,h/2+27);g.strokeStyle='#111';g.lineWidth=5;g.strokeRect(3,3,w-6,h-6)},512,112);
  const grille=RK.canvasTex(128,64,(g,w,h)=>{g.fillStyle='#050506';g.fillRect(0,0,w,h);g.fillStyle='#2a2c30';for(let y=0;y<h;y+=8)for(let x=(y/8)%2*6;x<w;x+=12){g.beginPath();g.moveTo(x,y+4);g.lineTo(x+6,y);g.lineTo(x+12,y+4);g.lineTo(x+6,y+8);g.closePath();g.fill()}},{color:true,repeat:[3,1]});
  const mesh=RK.canvasTex(64,64,(g,w,h)=>{g.fillStyle='#0b1217';g.fillRect(0,0,w,h);g.strokeStyle='#8a9096';g.lineWidth=3;for(let i=0;i<w;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.moveTo(0,i);g.lineTo(w,i);g.stroke()}},{color:true,repeat:[8,4]});
  const black=M.std(0x0f1011,.45,.15),rim=M.std(0xd4d8dd,.3,.7),head=M.glow(0xfff4dc,1.4),lens=M.lens({opacity:.3});
  return{
    glass:M.glass(0x0b1318,{opacity:.84}),chrome:M.chrome(),black,trim:black,interior:black,arch:black,rim,rimDark:M.alu(0x2b2e33,{roughness:.3}),disc:rim,
    caliper:black,head,drl:head,tail:M.glow(0xb3110f,.9),amber:head,lens,lensRed:lens,plate:M.std(0xffffff,.45,0,{map:plate}),grille:M.std(0xffffff,.5,.3,{map:grille}),
    cage:M.std(0xffffff,.4,.4,{map:mesh,transparent:true,opacity:.95}),camo:null,tireG:{},rimG:{}
  };
})();
const CAR_STYLES={
  sedan:{R:.33,wz:[1.36,-1.36],w:.88,belt:.955,mirrorZ:.78,
    body:[[-2.22,.76,.40,.80],[-2.15,.85,.32,.92],[-1.9,.875,.29,.985],[-1.3,.88,.28,.99],[0,.885,.27,.965],[.9,.885,.28,.94],[1.6,.87,.3,.86],[2.05,.835,.32,.77],[2.22,.75,.38,.67]],
    cab:[[-1.52,.79,.96],[-1.28,.775,1.22],[-.88,.755,1.42],[-.2,.75,1.455],[.25,.76,1.415],[.66,.79,1.17],[.98,.83,.95]],
    win:{ws:[.4,.98],rw:[-1.52,-.98],fr:[-.22,.62],rr:[-1.18,-.34]}},
  hatch:{R:.31,wz:[1.27,-1.27],w:.86,belt:.96,mirrorZ:.72,
    body:[[-2.0,.75,.42,.9],[-1.93,.84,.33,.97],[-1.6,.86,.29,.99],[0,.865,.27,.965],[.9,.865,.28,.935],[1.5,.85,.3,.85],[1.88,.82,.33,.76],[2.0,.73,.38,.66]],
    cab:[[-1.98,.78,.98],[-1.9,.77,1.3],[-1.62,.755,1.45],[-.4,.75,1.48],[.2,.76,1.43],[.6,.79,1.17],[.92,.83,.95]],
    win:{ws:[.3,.92],rw:[-1.98,-1.7],fr:[-.3,.56],rr:[-1.45,-.42]}},
  suv:{R:.37,wz:[1.42,-1.42],w:.915,belt:1.1,mirrorZ:.86,
    body:[[-2.3,.8,.5,.98],[-2.22,.89,.4,1.08],[-1.9,.91,.37,1.12],[0,.915,.36,1.1],[.9,.915,.37,1.08],[1.6,.9,.4,1.0],[2.12,.87,.42,.93],[2.3,.79,.48,.83]],
    cab:[[-2.25,.81,1.1],[-2.18,.8,1.5],[-1.9,.79,1.68],[-.4,.785,1.71],[.3,.79,1.66],[.75,.82,1.36],[1.06,.85,1.1]],
    win:{ws:[.42,1.06],rw:[-2.25,-1.92],fr:[-.36,.7],rr:[-1.78,-.48]}}
};
function bodySecs(rows,n,tw){return rows.map(r=>({z:r[0],w:r[1],y:(r[2]+r[3])/2,t:(r[3]-r[2])/2,n,tw}))}
function secX(secs,z,y){let a=secs[0],b=secs[secs.length-1];for(let i=0;i<secs.length-1;i++)if(z>=secs[i].z&&z<=secs[i+1].z){a=secs[i];b=secs[i+1];break}
  const f=b.z===a.z?0:(z-a.z)/(b.z-a.z),w=a.w+(b.w-a.w)*f,yc=a.y+(b.y-a.y)*f,t=a.t+(b.t-a.t)*f,n=a.n,tw=a.tw,yy=clamp((y-yc)/t,-1,1);
  return w*Math.pow(Math.max(0,1-Math.pow(Math.abs(yy),n)),1/n)*(yy>0?1+(tw-1)*yy:1)}
function addWheel(par,R,W,x,z,flip,o){
  const g=new THREE.Group();g.position.set(x,R,z);if(flip)g.rotation.y=Math.PI;par.add(g);
  if(o.lo){RK.add(g,new THREE.CylinderGeometry(R,R,W,14),VMAT.black,0,0,0,0,0,Math.PI/2);RK.add(g,new THREE.CircleGeometry(R*.64,10),o.rim||VMAT.rim,W/2+.002,0,0,0,Math.PI/2,0);return g}
  const tg=VMAT.tireG[R]||(VMAT.tireG[R]=RK.tireGeo(R,W,R*.66,{round:.12,seg:28}));RK.add(g,tg,RK.tireMat('road',tg));
  const rk=R+'|'+(o.spokes||5)+'|'+(o.split||0),rg=VMAT.rimG[rk]||(VMAT.rimG[rk]=RK.rimGeo(R*.66,W*.86,{spokes:o.spokes||5,split:o.split||0,offset:W*.2,hub:.26,spokeW:R*.66*(o.sw||.16),seg:24}));
  RK.add(g,rg.face,o.rim||VMAT.rim);RK.add(g,rg.barrel,o.rim||VMAT.rim);RK.add(g,rg.hub,o.rim||VMAT.rim);
  RK.add(g,new THREE.CylinderGeometry(R*.55,R*.55,.03,20),VMAT.disc,-W*.05,0,0,0,0,Math.PI/2);
  RK.add(g,RK.rbox(.07,.12,.2,.03,2),VMAT.caliper,W*.06,R*.36,-R*.28,.9,0,0);
    return g;
}
function addArch(par,secs,R,z,side){
  const x=secX(secs,z,R+.25)+.004,ar=R+.055,s=new THREE.Shape();s.moveTo(-ar,-R*.25);s.lineTo(-ar,0);s.absarc(0,0,ar,Math.PI,0,true);s.lineTo(ar,-R*.25);s.closePath();
  RK.add(par,new THREE.ShapeGeometry(s,20),VMAT.arch,side*x,R,z,0,side*Math.PI/2,0,{noShadow:true});
  const pts=[];for(let i=0;i<=16;i++){const a=i/16*Math.PI;pts.push([side*(x+.006),R+Math.sin(a)*(ar+.01),z+Math.cos(a)*(ar+.01)])}
  return pts;
}
/* voiture complète, retourne un groupe statique (non fusionné) */
function buildCar(styleKey,color,cop,lo){
  const S=CAR_STYLES[styleKey],M=RK.M,A=RK.add,g=new THREE.Group(),V=(x,y,z)=>new THREE.Vector3(x,y,z);
  const paint=M.paint(color,{metalness:color==='#e9e9e9'||color==='#f2f4f6'||color==='#d9d9d9'?.15:.45,roughness:.32});
  const LQ=lo?{sides:20,sub:2}:{sides:40,sub:4};
  const bs=bodySecs(S.body,4.2,.94),body=RK.loft(bs,LQ);A(g,body,paint);
  const cs=S.cab.map((r,i,a)=>({z:r[0],w:r[1]*(i===0||i===a.length-1?.72:1),y:(S.belt-.1+r[2])/2,t:(r[2]-S.belt+.1)/2,n:3.4,tw:.78})),cab=RK.loft(cs,LQ);A(g,cab,paint);
  const Wn=S.win,glass=VMAT.glass,P=(geo,zA,zB,a0,a1,off,mat)=>{const pg=RK.loftPatch(geo,zA,zB,a0,a1,off);if(pg)A(g,pg,mat,0,0,0,0,0,0,{noShadow:true});return pg};
  P(cab,Wn.ws[0],Wn.ws[1],1.02,2.12,.004,glass);P(cab,Wn.rw[0],Wn.rw[1],1.02,2.12,.004,glass);
  for(const [a0,a1] of[[-.12,.86],[2.28,3.26]]){P(cab,Wn.fr[0],Wn.fr[1],a0,a1,.004,glass);P(cab,Wn.rr[0],Wn.rr[1],a0,a1,.004,glass);P(cab,Wn.fr[0]-.12,Wn.fr[0],a0+.08,a1-.08,.003,VMAT.trim)}
  /* phares avant / feux arrière découpés dans la carrosserie */
  const zf=bs[bs.length-1].z,zr=bs[0].z;
  for(const [a0,a1] of[[.12,.62],[2.52,3.02]]){
    P(body,zf-.2,zf,a0,a1,.006,VMAT.head);P(body,zf-.2,zf,a0,a1,.014,VMAT.lens);
    P(body,zr,zr+.18,a0+.02,a1+.02,.006,VMAT.tail);P(body,zr,zr+.18,a0+.02,a1+.02,.012,VMAT.lensRed);
    P(body,-1.05,1.05,a0<1?-.62:3.42,a0<1?-.3:3.76,.003,VMAT.black);
  }
  const fy=bs[bs.length-1].y,ry=bs[0].y;
  A(g,RK.rbox(.82,.13,.05,.02,2),cop?VMAT.grille:VMAT.black,0,fy+.02,zf+.005);A(g,RK.rbox(.86,.025,.04,.01,1),VMAT.chrome,0,fy+.095,zf+.006);
  A(g,RK.rbox(1.1,.1,.05,.03,2),VMAT.black,0,fy-.13,zf-.01);A(g,new THREE.PlaneGeometry(.52,.11),VMAT.plate,0,fy-.06,zf+.032,0,0,0,{noShadow:true});A(g,RK.rbox(.54,.12,.01,.004,1),VMAT.black,0,fy-.06,zf+.026);
  for(const s of[-1,1])A(g,RK.rbox(.22,.018,.03,.008,1),VMAT.drl,s*.5,fy+.11,zf-.02,0,s*.25,0,{noShadow:true});
  A(g,new THREE.PlaneGeometry(.52,.11),VMAT.plate,0,ry+.05,zr-.032,0,Math.PI,0,{noShadow:true});A(g,RK.rbox(.54,.12,.01,.004,1),VMAT.black,0,ry+.05,zr-.026);A(g,RK.rbox(1.3,.09,.05,.02,2),VMAT.black,0,ry-.17,zr+.01);
  A(g,new THREE.CylinderGeometry(.035,.035,.14,14,1,true),VMAT.chrome,.55,S.R*.85,zr+.02,Math.PI/2,0,0);
  /* passages de roue, roues */
  const R=S.R,W=.225,wx=S.w-W/2+.03;
  for(const z of S.wz)for(const side of[-1,1]){
    const pts=addArch(g,bs,R,z,side);if(!lo)A(g,RK.tube(pts,.018,{seg:16,radial:5}),paint);
    addWheel(g,R,W,side*wx,z,side<0,{lo,spokes:styleKey==='suv'?6:5,split:styleKey==='sedan'?.36:0,rim:cop||styleKey==='hatch'?VMAT.rimDark:VMAT.rim});
  }
  if(lo){if(cop)decoratePolice(g,bs,S,paint,lo);return g}
  /* rétroviseurs, poignées, joints de portes, essuie-glaces */
  for(const side of[-1,1]){
    const mx=secX(bs,S.mirrorZ,S.belt)+.08;
    A(g,RK.rbox(.17,.1,.11,.04,2),paint,side*mx,S.belt+.06,S.mirrorZ);A(g,RK.rbox(.14,.075,.01,.02,1),VMAT.chrome,side*mx,S.belt+.06,S.mirrorZ-.056);
    A(g,RK.rbox(.09,.03,.05,.012,1),VMAT.black,side*(mx-.08),S.belt+.03,S.mirrorZ+.01);A(g,RK.rbox(.06,.012,.02,.005,1),VMAT.amber,side*(mx+.04),S.belt+.06,S.mirrorZ+.05,0,0,0,{noShadow:true});
    for(const z of[Wn.fr[0]+.32,Wn.rr[0]+.3]){const x=secX(bs,z,S.belt-.13);A(g,RK.rbox(.02,.028,.15,.01,1),VMAT.chrome,side*(x+.006),S.belt-.13,z)}
    for(const z of[Wn.fr[1]+.06,Wn.fr[0]-.06,Wn.rr[0]-.05]){const y0=S.belt-.42,y1=S.belt-.01;const x=secX(bs,z,(y0+y1)/2);A(g,RK.rbox(.006,y1-y0,.006,.002,1),VMAT.black,side*(x+.001),(y0+y1)/2,z,0,0,0,{noShadow:true})}
    A(g,RK.rbox(.008,.012,1.0,.004,1),VMAT.black,side*.3,S.belt+.02,Wn.ws[0]+.06,0,side*-.25,0,{noShadow:true});
  }
  /* habitacle visible à travers les vitres */
  for(const z of[-.15-.0,-.95])for(const s of[-1,1])A(g,RK.rbox(.46,.5,.12,.05,2),VMAT.interior,s*.38,S.belt+.06,z-.0,-.15,0,0,{noShadow:true});
  A(g,RK.rbox(1.5,.18,.35,.06,2),VMAT.interior,0,S.belt+.02,Wn.ws[0]-.05,0,0,0,{noShadow:true});
  A(g,new THREE.TorusGeometry(.16,.022,8,24),VMAT.black,-.38,S.belt+.12,Wn.ws[0]-.3,-.5,0,0,{noShadow:true});
  if(cop)decoratePolice(g,bs,S,paint);
  return g;
}
const policeTex=RK.labelTex((g,w,h)=>{
  g.clearRect(0,0,w,h);g.fillStyle='#1b2a66';g.fillRect(0,h*.62,w,h*.38);g.fillStyle='#d21f2b';g.fillRect(0,h*.56,w,h*.06);
  g.fillStyle='#f4f4f4';g.fillRect(0,h*.53,w,h*.03);
  g.fillStyle='#1b2a66';g.font='bold 120px Arial';g.textAlign='center';g.fillText('POLICE',w*.5,h*.47);
  g.fillStyle='#ffffff';g.font='bold 40px Arial';g.fillText('17',w*.9,h*.88);
},1024,256);
const policeSideMat=[1,-1].map(rot=>new THREE.MeshStandardMaterial({envMap:RK.ENV,roughness:.3,metalness:.1,transparent:true,polygonOffset:true,polygonOffsetFactor:-3,map:RK.labelTex((g,w,h)=>{
  g.clearRect(0,0,w,h);g.save();g.translate(w/2,h/2);g.rotate(rot*Math.PI/2);g.fillStyle='#ffffff';g.font='bold 150px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('POLICE',0,0);
  g.fillStyle='#d21f2b';g.fillRect(-h*.45,rot*95-6,h*.9,12);g.restore()},256,1024)}));
const policeMat=new THREE.MeshStandardMaterial({map:policeTex,transparent:true,roughness:.32,metalness:.1,polygonOffset:true,polygonOffsetFactor:-3,envMap:RK.ENV});
function decoratePolice(g,bs,S,paint,lo){
  const A=RK.add,M=RK.M,y0=S.belt-.5,y1=S.belt-.02,yc=(y0+y1)/2;
  for(const side of[-1,1]){const x=secX(bs,0,yc)+.004;A(g,new THREE.PlaneGeometry(3.0,y1-y0),policeMat,side*x,yc,-.12,0,side*Math.PI/2,0,{noShadow:true})}
  const roof=Math.max(...S.cab.map(r=>r[2]));
  A(g,RK.rbox(1.25,.06,.3,.02,2),VMAT.black,0,roof+.03,-.35);A(g,RK.rbox(1.2,.085,.26,.035,2),VMAT.lens,0,roof+.09,-.35,0,0,0,{noShadow:true});
  for(const s of[-1,1])A(g,RK.rbox(.3,.05,.18,.02,1),s<0?M.glow(0x551010,.4):M.glow(0x101f55,.4),s*.33,roof+.09,-.35,0,0,0,{noShadow:true});
  g.userData.roof=roof;if(lo)return;
  const zf=bs[bs.length-1].z;for(const s of[-1,1]){RK.rod(g,[s*.42,.38,zf+.12],[s*.42,.78,zf+.08],.03,VMAT.black);}
  RK.rod(g,[-.48,.5,zf+.13],[.48,.5,zf+.13],.03,VMAT.black);RK.rod(g,[-.48,.72,zf+.1],[.48,.72,zf+.1],.03,VMAT.black);
  g.userData.roof=roof;
}
/* fourgon de police */
function buildVan(){
  const M=RK.M,A=RK.add,g=new THREE.Group(),paint=M.paint(0xf1f3f5,{metalness:.12,roughness:.35});
  const bs=bodySecs([[-2.72,.96,.44,1.2],[-2.66,1.0,.38,1.27],[1.6,1.01,.38,1.27],[2.2,1.0,.42,1.25],[2.56,.96,.45,1.06],[2.72,.9,.5,.92]],5,.96),body=RK.loft(bs,{sides:48,sub:4});A(g,body,paint);
  const cs=[[-2.71,.985,2.28],[-2.65,.995,2.4],[1.42,.995,2.42],[1.78,.985,2.3],[2.27,.965,1.4],[2.4,.94,1.22]].map(r=>({z:r[0],w:r[1],y:(1.12+r[2])/2,t:(r[2]-1.12)/2,n:6,tw:.95}));
  const cab=RK.loft(cs,{sides:56,sub:4});A(g,cab,paint);
  const P=(geo,zA,zB,a0,a1,off,mat)=>{const pg=RK.loftPatch(geo,zA,zB,a0,a1,off);if(pg)A(g,pg,mat,0,0,0,0,0,0,{noShadow:true})};
  P(cab,1.8,2.36,1.0,2.14,.004,VMAT.glass);
  for(const [a0,a1] of[[-.1,.27],[2.87,3.24]]){P(cab,1.12,1.86,a0,a1,.004,VMAT.glass)}
  for(const [a0,a1] of[[-.18,.22],[2.92,3.32]]){P(cab,-1.6,.6,a0,a1,.004,VMAT.glass);P(cab,-1.6,.6,a0,a1,.01,VMAT.cage)}
  const zf=2.72,zr=-2.72;
  for(const [a0,a1] of[[.15,.6],[2.54,2.99]]){P(body,zf-.18,zf,a0,a1,.006,VMAT.head);P(body,zf-.18,zf,a0,a1,.014,VMAT.lens)}
  for(const s of[-1,1]){A(g,RK.rbox(.12,.36,.05,.02,2),VMAT.tail,s*.88,1.0,zr-.005,0,0,0,{noShadow:true});A(g,RK.rbox(.13,.37,.03,.02,1),VMAT.lensRed,s*.88,1.0,zr-.02,0,0,0,{noShadow:true})}
  A(g,RK.rbox(.006,1.7,.006,.002,1),VMAT.black,0,1.4,zr-.004);
  A(g,RK.rbox(1.0,.2,.05,.03,2),VMAT.grille,0,.86,zf+.0);A(g,RK.rbox(1.9,.18,.08,.04,2),VMAT.black,0,.52,zf-.02);A(g,new THREE.PlaneGeometry(.52,.11),VMAT.plate,0,.52,zf+.065,0,0,0,{noShadow:true});
  for(const side of[-1,1]){
    const x=secX(bs,-.5,.9)+.004;A(g,new THREE.PlaneGeometry(3.6,.72),policeMat,side*x,.84,-.7,0,side*Math.PI/2,0,{noShadow:true});
    A(g,RK.rbox(.2,.24,.06,.03,2),VMAT.black,side*1.1,1.95,1.6);A(g,RK.rbox(.17,.21,.01,.02,1),VMAT.chrome,side*1.1,1.95,1.565);RK.rod(g,[side*1.0,1.85,1.62],[side*1.1,1.9,1.62],.015,VMAT.black);
    A(g,RK.rbox(.006,1.0,.006,.002,1),VMAT.black,side*(secX(cs,1.0,1.7)+.002),1.7,1.0);
  }
  const R=.38,W=.235,wx=1.0-W/2+.035;
  for(const z of[1.82,-1.72])for(const side of[-1,1]){const pts=addArch(g,bs,R,z,side);A(g,RK.tube(pts,.02,{seg:24,radial:6}),VMAT.black);addWheel(g,R,W,side*wx,z,side<0,{spokes:6,rim:VMAT.rimDark})}
  A(g,RK.rbox(1.6,.06,.4,.02,2),VMAT.black,0,2.45,1.1);A(g,RK.rbox(1.55,.09,.36,.035,2),VMAT.lens,0,2.52,1.1,0,0,0,{noShadow:true});
  for(const z of[-1.8,-.6,.6])RK.rod(g,[-.9,2.47,z],[.9,2.47,z],.018,VMAT.trim);
  return g;
}
/* char d'assaut : caisse à glacis, chenilles, jupes, galets */
function buildTankHull(){
  const M=RK.M,A=RK.add,g=new THREE.Group();
  const camo=VMAT.camo||(VMAT.camo=M.std(0xffffff,.82,.12,{map:RK.canvasTex(256,256,(c,w,h)=>{c.fillStyle='#454c33';c.fillRect(0,0,w,h);const r=RK.rng(9);c.filter='blur(3px)';
    for(const col of['#2c3220','#5a503a','#181a14'])for(let i=0;i<10;i++){c.fillStyle=col;c.beginPath();c.ellipse(r()*w,r()*h,14+r()*40,8+r()*22,r()*3,0,6.3);c.fill()}c.filter='none';for(let i=0;i<4000;i++){c.fillStyle='rgba(0,0,0,'+r()*.12+')';c.fillRect(r()*w,r()*h,2,2)}},{color:true,repeat:[.35,.35]})}));
  const steel=M.std(0x2b2d2a,.6,.6),rubber=M.rubber();
  const hull=RK.polyShape([[-3.3,.62],[-3.3,1.45],[-3.0,1.72],[2.2,1.72],[3.45,1.18],[3.48,.92],[3.0,.6]]);
  const hg=RK.extrude(hull,2.3,{bevel:.04,cs:2});hg.rotateY(-Math.PI/2);A(g,hg,camo,0,0,0);
  for(const side of[-1,1]){
    const x=side*1.55;
    const tr=new THREE.Shape(),tw=.68;tr.moveTo(-3.15,.22);tr.lineTo(3.0,.22);tr.absarc(3.0,.62,.4,-Math.PI/2,Math.PI/2,false);tr.lineTo(-3.15,1.02);tr.absarc(-3.15,.62,.4,Math.PI/2,Math.PI*1.5,false);
    const ih=new THREE.Path();ih.moveTo(-3.15,.32);ih.absarc(-3.15,.62,.3,Math.PI*1.5,Math.PI/2,true);ih.lineTo(3.0,.92);ih.absarc(3.0,.62,.3,Math.PI/2,-Math.PI/2,true);ih.closePath();tr.holes.push(ih);
    const tex=RK.canvasTex(64,16,(c,w,h)=>{c.fillStyle='#202220';c.fillRect(0,0,w,h);c.fillStyle='#393b38';for(let i=0;i<w;i+=8)c.fillRect(i,0,5,h)},{color:true,repeat:[22,1]});
    const tg=RK.extrude(tr,tw,{bevel:.02,cs:12});tg.rotateY(-Math.PI/2);A(g,tg,M.std(0xffffff,.8,.5,{map:tex,bumpMap:tex,bumpScale:.03}),x,0,0);
    for(let i=0;i<7;i++){const z=-2.55+i*.85;A(g,RK.lathe([[0,-.3],[.26,-.3],[.28,-.25],[.28,.25],[.26,.3],[0,.3]],24),steel,x,.6,z,0,0,Math.PI/2);A(g,new THREE.CylinderGeometry(.1,.1,.64,12),steel,x,.6,z,0,0,Math.PI/2)}
    A(g,RK.lathe([[0,-.3],[.27,-.3],[.29,0],[.27,.3],[0,.3]],12),steel,x,.62,-3.15,0,0,Math.PI/2);A(g,RK.lathe([[0,-.3],[.27,-.3],[.29,0],[.27,.3],[0,.3]],24),steel,x,.62,3.0,0,0,Math.PI/2);
    A(g,RK.rbox(.82,.06,7.0,.02,2),camo,x,1.08,-.05);
    for(let i=0;i<6;i++)A(g,RK.rbox(.05,.48,1.08,.015,1),camo,side*1.98,.86,-2.7+i*1.1,0,0,side*-.05);
    A(g,RK.rbox(.38,.3,1.0,.04,2),camo,side*1.62,1.28,-2.6);
    A(g,RK.rbox(.12,.08,.16,.03,1),M.glow(0xffe8b0,.7),side*1.1,1.4,3.24,0,0,0,{noShadow:true});
  }
  A(g,RK.rbox(1.4,.18,.6,.05,2),M.std(0x2a2c25,.7,.3),0,1.75,-2.4);for(let i=0;i<6;i++)A(g,RK.rbox(1.3,.02,.04,.01,1),steel,0,1.85,-2.62+i*.09);
  for(const s of[-1,1])A(g,RK.rbox(.42,.09,.32,.03,2),M.std(0x2a2c25,.7,.3),s*.55,1.76,2.45,-.42,0,0);
  return g;
}
function buildTankTurret(){
  const M=RK.M,A=RK.add,t=new THREE.Group(),camo=VMAT.camo,steel=M.std(0x30332d,.55,.6);
  const sh=RK.polyShape([[-1.2,-1.55],[1.2,-1.55],[1.35,.2],[.95,1.55],[-.95,1.55],[-1.35,.2]]);
  const tg=RK.extrude(sh,.72,{bevel:.08,cs:2});tg.rotateX(Math.PI/2);A(t,tg,camo,0,.36,0);
  A(t,RK.rbox(2.1,.5,1.1,.08,2),camo,0,.36,-1.85);
  A(t,RK.rbox(.85,.62,.55,.08,2),camo,0,.36,1.6);
  const gun=[[.24,0],[.24,.6],[.17,.65],[.15,1.4],[.2,1.5],[.2,2.1],[.15,2.2],[.14,3.4],[.17,3.5],[.17,3.7],[.0,3.7]];
  A(t,RK.lathe(gun,24).rotateX(Math.PI/2),steel,0,.38,1.7);A(t,new THREE.CircleGeometry(.07,16),VMAT.black,0,.38,5.405);
  A(t,new THREE.CylinderGeometry(.42,.48,.34,20),camo,-.55,.85,-.3);
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;A(t,RK.rbox(.1,.08,.04,.02,1),VMAT.glass,-.55+Math.cos(a)*.44,.92,-.3+Math.sin(a)*.44,0,-a,0)}
  A(t,RK.rbox(.4,.36,.45,.06,2),steel,.6,.95,.5);A(t,RK.rbox(.3,.22,.03,.02,1),VMAT.glass,.6,.95,.73);
  RK.rod(t,[-.55,1.05,-.3],[-.55,1.15,.7],.025,steel);
  for(const s of[-1,1])for(let i=0;i<4;i++)A(t,new THREE.CylinderGeometry(.045,.045,.28,10),steel,s*(1.1+i*.04),.8,.5-i*.18,Math.PI/2-.5,0,s*.4);
  for(const x of[-.9,.9])RK.rod(t,[x,1.0,-2.2],[x+.04,3.1,-2.3],.012,M.plastic(0x111111));
  return t;
}
/* hélicoptère de police : fuselage lissé, verrière, fenestron, patins */
function buildHeli(){
  const M=RK.M,A=RK.add,g=new THREE.Group(),blue=M.paint(0x1a2a5a,{metalness:.35}),white=M.paint(0xf2f4f6,{metalness:.15}),dark=M.dark();
  const fs=[{z:-1.9,w:.55,t:.62,b:.45,y:.1,n:2.4},{z:-1.2,w:.78,t:.9,b:.7,y:.05,n:2.6},{z:.0,w:.86,t:.95,b:.8,y:.0,n:2.7},{z:1.1,w:.84,t:.88,b:.82,y:-.05,n:2.6},{z:1.9,w:.72,t:.66,b:.7,y:-.12,n:2.3},{z:2.5,w:.42,t:.34,b:.45,y:-.22,n:2.1},{z:2.72,w:.12,t:.1,b:.14,y:-.28,n:2}];
  const fus=RK.loft(fs,{sides:48,sub:5});A(g,fus,blue);
  const P=(geo,zA,zB,a0,a1,off,mat)=>{const pg=RK.loftPatch(geo,zA,zB,a0,a1,off);if(pg)A(g,pg,mat,0,0,0,0,0,0,{noShadow:true})};
  P(fus,1.05,2.72,-.25,3.4,.005,VMAT.glass);P(fus,-.95,.55,.1,.75,.005,VMAT.glass);P(fus,-.95,.55,2.39,3.04,.005,VMAT.glass);
  P(fus,-1.9,2.72,-1.2,-.35,.003,white);P(fus,-1.9,2.72,3.5,4.34,.003,white);
  A(g,RK.loft([{z:-1.6,w:.4,t:.12,b:.05,y:.95,n:2.6},{z:-.6,w:.55,t:.38,b:.05,y:.95,n:3},{z:.6,w:.5,t:.34,b:.05,y:.95,n:3},{z:1.2,w:.3,t:.12,b:.05,y:.92,n:2.6}],{sides:32}),blue);
  for(const s of[-1,1])A(g,RK.rbox(.02,.16,.5,.01,1),VMAT.black,s*.5,1.15,-.3);
  A(g,RK.loft([{z:-6.4,w:.13,t:.14,b:.12,y:.62,n:2.2},{z:-4.0,w:.17,t:.18,b:.16,y:.52,n:2.2},{z:-2.2,w:.3,t:.3,b:.26,y:.36,n:2.4},{z:-1.6,w:.42,t:.42,b:.32,y:.28,n:2.4}],{sides:32}),blue);
  A(g,new THREE.TorusGeometry(.52,.11,12,32),blue,0,.82,-6.6,0,Math.PI/2,0);A(g,new THREE.CylinderGeometry(.5,.5,.18,32,1,true),dark,0,.82,-6.6,0,0,Math.PI/2);
  A(g,RK.extrude(RK.polyShape([[-.35,0],[.35,0],[.15,1.1],[-.25,1.1]]),.08,{bevel:.02}),blue,0,1.3,-6.6,0,Math.PI/2,0);
  A(g,RK.wing({x:-1.1,y:.6,z:-5.25,c:.42,t:.12},{x:1.1,y:.6,z:-5.05,c:.32,t:.12}),blue);
  for(const s of[-1,1])A(g,RK.rbox(.03,.42,.34,.012,1),blue,s*1.12,.62,-5.1);
  for(const s of[-1,1]){const x=s*.82;RK.rod(g,[s*.5,-.72,.9],[x,-1.25,.95],.03,dark);RK.rod(g,[s*.5,-.72,-.8],[x,-1.25,-.75],.03,dark);
    A(g,RK.tube([[x,-1.25,-1.6],[x,-1.26,0],[x,-1.25,1.5],[x,-1.12,1.95]],.04,{radial:10}),dark)}
  const sl=new THREE.Group();sl.position.set(.38,-.82,1.75);g.add(sl);A(sl,RK.lathe([[0,-.12],[.13,-.12],[.15,.0],[.13,.1]],20),dark,0,0,0,Math.PI/2.4,0,0);A(sl,new THREE.CircleGeometry(.12,20),M.glow(0xfff4d0,1.5),0,-.06,.11,-.7,0,0);
  const fl=A(g,new THREE.SphereGeometry(.17,20,14),dark,-.32,-.9,1.95);A(g,RK.rbox(.12,.08,.02,.02,1),VMAT.glass,-.32,-.9,2.12);
  P(fus,-1.7,.75,-.42,.06,.007,policeSideMat[0]);P(fus,-1.7,.75,Math.PI-.06,Math.PI+.42,.007,policeSideMat[1]);
  A(g,new THREE.CylinderGeometry(.09,.12,.4,16),dark,0,1.4,0);
  return g;
}
function makeVehicle(kind,color){
  const grp=new THREE.Group();
  const style=kind==='cop'?'suv':kind==='car'?['sedan','hatch','suv'][(CARCOLS.indexOf(color)+3)%3]:kind;
  const key=kind+'|'+style+'|'+(kind==='car'?color:'');
  let tpl=carGeoCache[key];
  if(!tpl){
    const raw=kind==='van'?buildVan():kind==='tank'?buildTankHull():buildCar(style,kind==='cop'?'#f2f4f6':color,kind==='cop');
    tpl=carGeoCache[key]={grp:RK.merge(raw),roof:raw.userData.roof||1.6};
    if(kind==='car'||kind==='cop'){const low=RK.merge(buildCar(style,kind==='cop'?'#f2f4f6':color,kind==='cop',true));low.traverse(o=>{if(o.isMesh)o.castShadow=false});tpl.lo=low}
  }
  let body;if(tpl.lo){body=new THREE.LOD();body.addLevel(tpl.grp.clone(),0);body.addLevel(tpl.lo.clone(),55)}else body=tpl.grp.clone();grp.add(body);
  const u={kind,grp,x:0,z:0,h:0,v:0,mode:'civ',r:kind==='tank'?2.6:kind==='van'?1.6:1.15,len:kind==='tank'?3.3:2.2,vmax:11,trafficFactor:0.7+Math.random()*0.18,stuck:0,
    cool:0,turret:null,bar:null,seen:0,ph:Math.random()*6};
  if(kind==='cop'||kind==='van'){
    const bar=new THREE.Group();const y=kind==='van'?2.52:tpl.roof+.09,z=kind==='van'?1.1:-.35;
    const a=new THREE.Mesh(RK.rbox(0.3,0.07,0.2,.02,1),SIREN_R);a.position.set(-0.33,y,z);
    const b=new THREE.Mesh(RK.rbox(0.3,0.07,0.2,.02,1),SIREN_B);b.position.set(0.33,y,z);
    bar.add(a,b);grp.add(bar);bar.visible=false;u.bar=bar;
  }
  if(kind==='tank'){
    if(!carGeoCache.turret)carGeoCache.turret=RK.merge(buildTankTurret());
    const tu=new THREE.Group();tu.position.set(0,1.72,-0.3);tu.add(carGeoCache.turret.clone());
    const bar=new THREE.Group();const a=new THREE.Mesh(RK.rbox(0.36,0.12,0.26,.03,1),SIREN_R);a.position.set(-0.4,1.2,-0.9);
    const b=new THREE.Mesh(RK.rbox(0.36,0.12,0.26,.03,1),SIREN_B);b.position.set(0.4,1.2,-0.9);bar.add(a,b);tu.add(bar);u.bar=bar;
    grp.add(tu);u.turret=tu;
  }
  scene.add(grp);vehicles.push(u);return u;
}

const matRotor=RK.M.dark(0x1d2126);
const beamMatH=new THREE.MeshBasicMaterial({color:0xfff6c8,transparent:true,opacity:0.2,depthWrite:false,blending:THREE.AdditiveBlending});
const rotorBlurMat=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,map:RK.canvasTex(128,128,(g,w,h)=>{const gr=g.createRadialGradient(64,64,6,64,64,64);gr.addColorStop(0,'rgba(20,22,26,.0)');gr.addColorStop(.25,'rgba(20,22,26,.28)');gr.addColorStop(.92,'rgba(20,22,26,.18)');gr.addColorStop(1,'rgba(20,22,26,0)');g.fillStyle=gr;g.fillRect(0,0,w,h)})});
function makeHeli(){
  const g=new THREE.Group();
  if(!carGeoCache.heli)carGeoCache.heli=RK.merge(buildHeli());
  g.add(carGeoCache.heli.clone());
  const rotor=new THREE.Group();rotor.position.set(0,1.62,0);g.add(rotor);
  RK.add(rotor,new THREE.CylinderGeometry(.22,.26,.16,16),matRotor);
  for(let i=0;i<4;i++){const b=new THREE.Group();b.rotation.y=i*Math.PI/2;rotor.add(b);
    const bl=RK.add(b,RK.rbox(.3,.045,4.9,.02,1),matRotor,0,0,2.65);bl.rotation.x=.025;RK.add(b,RK.rbox(.31,.048,.25,.02,1),RK.M.paint(0xf2c014),0,-.002,5.0).rotation.x=.025}
  RK.add(rotor,new THREE.CircleGeometry(5.1,48),rotorBlurMat,0,.02,0,-Math.PI/2,0,0,{noShadow:true});
  const tr=new THREE.Group();tr.position.set(0,.82,-6.6);g.add(tr);
  for(let i=0;i<9;i++){const b=RK.add(tr,RK.rbox(.03,.42,.08,.01,1),matRotor,0,.22,0);b.position.set(0,Math.cos(i/9*Math.PI*2)*.22,Math.sin(i/9*Math.PI*2)*.22);b.rotation.x=i/9*Math.PI*2;b.rotation.y=.5}
  RK.add(tr,new THREE.CylinderGeometry(.09,.09,.12,12),matRotor,0,0,0,0,0,Math.PI/2);
  const l1=new THREE.Mesh(RK.rbox(0.18,0.08,0.18,.03,1),SIREN_R);l1.position.set(-0.45,-0.82,0.6);g.add(l1);
  const l2=new THREE.Mesh(RK.rbox(0.18,0.08,0.18,.03,1),SIREN_B);l2.position.set(0.45,-0.82,0.6);g.add(l2);
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.4,6,1,16,1,true),beamMatH);scene.add(beam);
  scene.add(g);
  const o={g,rotor,tr,beam,x:P.x+40,y:36,z:P.z+40,vx:0,vz:0,h:0,orb:Math.random()*6};helis.push(o);return o;
}

function removeVehicle(u){if(u.officer)removeOfficer(u.officer);scene.remove(u.grp);const i=vehicles.indexOf(u);if(i>=0)vehicles.splice(i,1)}

/* ---------- suivi de route (civils et patrouilles) ---------- */
function laneIn(i,j,dx,dz){const n=nodePos(i,j);return{x:n.x-dx*15-dz*4,z:n.z-dz*15+dx*4}}
function laneOut(i,j,dx,dz){const n=nodePos(i,j);return{x:n.x+dx*15-dz*4,z:n.z+dz*15+dx*4}}
function pickNext(u){
  const nb=neighbors(u.bi,u.bj).filter(n=>!(n[0]===u.ai&&n[1]===u.aj));
  const opts=nb.length?nb:neighbors(u.bi,u.bj);
  return opts[Math.floor(Math.random()*opts.length)];
}
function startEdge(u,ai,aj,bi,bj){
  u.ai=ai;u.aj=aj;u.bi=bi;u.bj=bj;u.dx=Math.sign(bi-ai);u.dz=Math.sign(bj-aj);
  u.p0=laneOut(ai,aj,u.dx,u.dz);u.p1=laneIn(bi,bj,u.dx,u.dz);u.phase='edge';u.s=0;u.L=Math.hypot(u.p1.x-u.p0.x,u.p1.z-u.p0.z);u.h=Math.atan2(u.dx,u.dz);
}
function startTurn(u){
  const nx=pickNext(u),ndx=Math.sign(nx[0]-u.bi),ndz=Math.sign(nx[1]-u.bj),n=nodePos(u.bi,u.bj);
  u.t0=laneIn(u.bi,u.bj,u.dx,u.dz);u.t2=laneOut(u.bi,u.bj,ndx,ndz);
  u.tc={x:n.x-u.dz*4-ndz*4,z:n.z+u.dx*4+ndx*4};
  const a=Math.hypot(u.tc.x-u.t0.x,u.tc.z-u.t0.z),b=Math.hypot(u.t2.x-u.tc.x,u.t2.z-u.tc.z),c=Math.hypot(u.t2.x-u.t0.x,u.t2.z-u.t0.z);
  u.tL=Math.max(1,(a+b+2*c)/3);u.next=nx;u.phase='turn';u.s=0;
}
function placeOnRoad(u,ai,aj,bi,bj,frac){
  startEdge(u,ai,aj,bi,bj);u.s=u.L*frac;
  u.x=lerp(u.p0.x,u.p1.x,frac);u.z=lerp(u.p0.z,u.p1.z,frac);
}
function driveRoad(u,dt,vcap){
  const lim=DISTRICTS[districtAt(u.x,u.z)].limit/3.6*(u.kind==='cop'?1.0:u.kind==='car'?u.trafficFactor:0.82);
  let vt=Math.min(lim,vcap||99);
  if(u.phase==='edge'){
    const rem=u.L-u.s;const st=lightState(u.dz!==0?0:1,GAME.clock);
    if(st!=='g'){const bd=u.v*u.v/(2*5);if(!(st==='y'&&rem<bd+1))vt=Math.min(vt,Math.sqrt(Math.max(0,2*4*(rem-0.8))))}
  }else vt=Math.min(vt,6.5);
  /* distance de sécurité */
  const fx=Math.sin(u.h),fz=Math.cos(u.h);
  const chk=(ox,oz,ov)=>{const dx=ox-u.x,dz=oz-u.z,al=dx*fx+dz*fz;if(al>0&&al<7+u.v*1.1){const la=Math.abs(-dx*fz+dz*fx);if(la<2.4){vt=Math.min(vt,al<5.2?0:ov*0.9)}}};
  for(let i=0;i<vehicles.length;i++){const o=vehicles[i];if(o!==u)chk(o.x,o.z,o.v)}
  chk(P.x,P.z,P.spd);
  u.v+=clamp(vt-u.v,-9*dt,(u.kind==='car'?2.4:3.2)*dt);if(u.v<0)u.v=0;
  let adv=u.v*dt;
  if(u.phase==='edge'){
    u.s+=adv;
    if(u.s>=u.L){u.s=u.L;const st=lightState(u.dz!==0?0:1,GAME.clock);if(st==='g'||u.v>6)startTurn(u)}
    const f=u.s/u.L;u.x=lerp(u.p0.x,u.p1.x,f);u.z=lerp(u.p0.z,u.p1.z,f);
  }else{
    u.s+=adv/u.tL;const t=Math.min(u.s,1),a=1-t;
    u.x=a*a*u.t0.x+2*a*t*u.tc.x+t*t*u.t2.x;u.z=a*a*u.t0.z+2*a*t*u.tc.z+t*t*u.t2.z;
    const tx=2*a*(u.tc.x-u.t0.x)+2*t*(u.t2.x-u.tc.x),tz=2*a*(u.tc.z-u.t0.z)+2*t*(u.t2.z-u.tc.z);
    u.h=Math.atan2(tx,tz);
    if(u.s>=1){const nx=u.next;const pi=u.bi,pj=u.bj;startEdge(u,pi,pj,nx[0],nx[1])}
  }
}

/* ---------- police : état ---------- */
/* need : chaleur pour passer au niveau suivant ; blocks : barrages simultanés ; lose : secondes hors de vue pour semer la police */
const COPS={lvl:[{},
  {cars:2,vans:0,tanks:0,helis:0,v:15,blocks:0,need:35,lose:15,name:'Recherché niveau 1'},
  {cars:3,vans:0,tanks:0,helis:0,v:19,blocks:1,need:90,lose:18,name:'Recherché niveau 2'},
  {cars:4,vans:1,tanks:0,helis:1,v:23,blocks:1,need:160,lose:21,name:'Recherché niveau 3'},
  {cars:5,vans:1,tanks:1,helis:1,v:27,blocks:2,need:260,lose:24,name:'Recherché niveau 4'},
  {cars:6,vans:2,tanks:1,helis:2,v:31,blocks:3,need:1e9,lose:28,name:'Recherché niveau 5'}]};
const MAXW=5;
const helis=[],shells=[];
function removeHeli(o){scene.remove(o.g);scene.remove(o.beam);const i=helis.indexOf(o);if(i>=0)helis.splice(i,1)}
const shellGeo=new THREE.SphereGeometry(0.42,8,6),shellMat=new THREE.MeshBasicMaterial({color:0xffa030});
function fireShell(u){
  const dx=P.x-u.x,dz=P.z-u.z,d=Math.hypot(dx,dz)||1,tt=d/32;
  const tx=P.x+P.vx*tt,tz=P.z+P.vz*tt,dd=Math.hypot(tx-u.x,tz-u.z)||1;
  const m=new THREE.Mesh(shellGeo,shellMat);m.position.set(u.x,2.4,u.z);scene.add(m);
  shells.push({m,x:u.x,z:u.z,vx:(tx-u.x)/dd*32,vz:(tz-u.z)/dd*32,life:2.6});
  beep(120,0.25,'sawtooth',0.07);
}
function copCount(kind){let n=0;for(const u of vehicles)if(u.mode!=='civ'&&u.kind===kind)n++;return n}
function allCops(){return vehicles.filter(u=>u.kind==='cop'||u.kind==='van'||u.kind==='tank')}

function spawnRoadNode(minD,maxD){
  const cam=new THREE.Vector3();camera.getWorldDirection(cam);
  let best=null;
  for(let k=0;k<14;k++){
    const i=Math.floor(Math.random()*(NB+1)),j=Math.floor(Math.random()*(NB+1)),n=nodePos(i,j),d=Math.hypot(n.x-P.x,n.z-P.z);
    if(d<minD||d>maxD)continue;
    const behind=((n.x-P.x)*cam.x+(n.z-P.z)*cam.z)/d<0.15;
    if(!best||behind){best=[i,j];if(behind)break}
  }
  return best;
}
function spawnCop(kind,mode){
  const n=spawnRoadNode(130,300);if(!n)return null;
  const u=makeVehicle(kind,'#fff');u.mode=mode;
  if(mode==='patrol'){const nb=neighbors(n[0],n[1]);const b=nb[Math.floor(Math.random()*nb.length)];placeOnRoad(u,n[0],n[1],b[0],b[1],0.3);u.vmax=14}
  else{const p=nodePos(n[0],n[1]);u.x=p.x;u.z=p.z;u.h=Math.random()*6.28;u.cn=[n[0],n[1]];u.pn=null;chaseSetup(u)}
  u.grp.position.set(u.x,0,u.z);u.grp.rotation.y=u.h;return u;
}
function chaseSetup(u){
  u.mode='chase';const L=COPS.lvl[Math.max(1,GAME.wanted)];
  u.vmax=(u.kind==='tank'?11:u.kind==='van'?L.v*0.92:L.v)*(1+0.12*(u.ph>3?1:0));
  u.turn=u.kind==='tank'?1.2:u.kind==='van'?1.9:2.5;
  if(u.bar)u.bar.visible=true;
  if(!u.cn){const[i,j]=nearestNode(u.x,u.z);u.cn=[i,j]}
}
function attachToRoad(u){
  const[i,j]=nearestNode(u.x,u.z),nb=neighbors(i,j),b=nb[Math.floor(Math.random()*nb.length)];
  u.mode='patrol';u.vmax=14;if(u.bar)u.bar.visible=false;placeOnRoad(u,i,j,b[0],b[1],0.12);u.v=4;
}
function chaseStep(u,dt){
  /* voiture qui s'arrête pour laisser descendre son policier, ou garée pendant qu'il est dehors */
  if(u.officer||u.halt){u.v=Math.max(0,u.v-14*dt);u.x+=Math.sin(u.h)*u.v*dt;u.z+=Math.cos(u.h)*u.v*dt;pushOut(u,u.r);return}
  const dxp=P.x-u.x,dzp=P.z-u.z,dp=Math.hypot(dxp,dzp);
  const los=dp<55&&losClear(u.x,u.z,P.x,P.z);
  let tx,tz;
  if(los){tx=P.x+P.vx*0.35;tz=P.z+P.vz*0.35}
  else{
    const n=nodePos(u.cn[0],u.cn[1]);
    if(Math.hypot(n.x-u.x,n.z-u.z)<16){
      let bestN=null,bd=1e9;
      for(const nb of neighbors(u.cn[0],u.cn[1])){
        if(u.pn&&nb[0]===u.pn[0]&&nb[1]===u.pn[1])continue;
        const q=nodePos(nb[0],nb[1]),d=Math.hypot(q.x-P.x,q.z-P.z);if(d<bd){bd=d;bestN=nb}}
      u.pn=u.cn;u.cn=bestN||neighbors(u.cn[0],u.cn[1])[0];
    }
    const q=nodePos(u.cn[0],u.cn[1]);tx=q.x;tz=q.z;
  }
  const want=Math.atan2(tx-u.x,tz-u.z),df=angDiff(u.h,want);
  const tr=u.turn/(1+u.v/22);u.h+=clamp(df,-tr*dt,tr*dt);
  let vt=u.vmax*(1-0.65*Math.min(1,Math.abs(df)/1.4));
  /* approche : freine à temps pour ne pas percuter un joueur lent ou à terre */
  if(los&&u.kind!=='tank')vt=Math.min(vt,Math.max(P.spd*1.05,Math.sqrt(2*10*Math.max(0,dp-5))));
  u.v+=clamp(vt-u.v,-12*dt,5*dt);
  u.x+=Math.sin(u.h)*u.v*dt;u.z+=Math.cos(u.h)*u.v*dt;
  if(pushOut(u,u.r)){const vn=u.v*(Math.sin(u.h)*HIT.nx+Math.cos(u.h)*HIT.nz);if(vn<0)u.v*=0.55;u.stuck+=dt*2}
  if(u.v<2.5)u.stuck+=dt;else u.stuck=Math.max(0,u.stuck-dt);
  if(u.stuck>2.2){const[i,j]=nearestNode(u.x,u.z),n=nodePos(i,j);u.x=lerp(u.x,n.x,0.8);u.z=lerp(u.z,n.z,0.8);u.stuck=0;u.cn=[i,j];u.pn=null}
  if(u.kind==='tank'&&u.turret){
    const ta=Math.atan2(P.x-u.x,P.z-u.z)-u.h;u.turret.rotation.y=angDiff(0,ta);
    u.cool-=dt;if(u.cool<=0&&los&&dp<70&&dp>9){fireShell(u);u.cool=3.6}
  }
}

/* ---------- gestion des effectifs de police ---------- */
let patrolTimer=0,blockTimer=6,blockSeq=0,speedLvl=0;
function manageCops(dt){
  const w=GAME.wanted,cops=allCops();
  if(w===0){
    /* patrouilles de fond : 3 voitures */
    const patrols=cops.filter(u=>u.mode==='patrol');
    patrolTimer-=dt;
    if(patrols.length<3&&patrolTimer<=0){spawnCop('cop','patrol');patrolTimer=0.6}
    for(const u of patrols){const d=Math.hypot(u.x-P.x,u.z-P.z);if(d>420)removeVehicle(u)}
    for(const u of cops)if((u.mode==='chase'||u.mode==='block')&&!u.officer){const d=Math.hypot(u.x-P.x,u.z-P.z);if(d>70||u.kind==='tank')removeVehicle(u);else{u.halt=false;attachToRoad(u)}}
    for(const h of helis.slice())removeHeli(h);
    speedLvl=0;blockTimer=6;
  }else{
    const L=COPS.lvl[w];
    for(const u of cops)if(u.mode==='patrol'){chaseSetup(u);u.cn=nearestNode(u.x,u.z)}
    /* le niveau monte : toutes les unités accélèrent */
    if(speedLvl!==w){speedLvl=w;for(const u of cops)if(u.mode==='chase')chaseSetup(u)}
    patrolTimer-=dt;
    if(patrolTimer<=0){
      const want={cop:L.cars,van:L.vans,tank:L.tanks};
      for(const k of['cop','van','tank']){if(copCount(k)-blockCount(k)<want[k]){const u=spawnCop(k,'chase');if(u){patrolTimer=Math.max(0.35,1-0.13*w);break}}}
    }
    /* barrages devant le joueur */
    blockTimer-=dt;
    if(blockTimer<=0){
      const active=new Set(cops.filter(u=>u.mode==='block').map(u=>u.blockId)).size;
      if(active<L.blocks)blockTimer=tryRoadblock(w)?16-2*w:1.5;else blockTimer=3;
    }
    /* barrage dépassé : ses voitures se lancent à la poursuite */
    for(const u of cops)if(u.mode==='block'&&!u.officer){
      const ax=P.x-u.bx,az=P.z-u.bz,past=ax*u.bdx+az*u.bdz;
      if(past>35){u.mode='chase';u.cn=null;u.pn=null;chaseSetup(u)}
    }
    /* trop d'unités ou trop loin : retirer (en priorité les surnuméraires hors de vue) */
    for(const u of cops){const d=Math.hypot(u.x-P.x,u.z-P.z);if(d>520)removeVehicle(u)}
    for(const k of['cop','van','tank']){
      const want={cop:L.cars,van:L.vans,tank:L.tanks}[k]+2;
      const extra=allCops().filter(u=>u.kind===k&&u.mode==='chase'&&!u.officer).sort((a,b)=>Math.hypot(b.x-P.x,b.z-P.z)-Math.hypot(a.x-P.x,a.z-P.z));
      for(let i=0;i<extra.length-want;i++)if(Math.hypot(extra[i].x-P.x,extra[i].z-P.z)>120)removeVehicle(extra[i]);
    }
    while(helis.length<L.helis)makeHeli();
    while(helis.length>L.helis)removeHeli(helis[helis.length-1]);
  }
}
function blockCount(kind){let n=0;for(const u of vehicles)if(u.mode==='block'&&u.kind===kind)n++;return n}
/* barrage : des voitures de police garées en travers de la route, juste avant le prochain carrefour devant le joueur */
function tryRoadblock(w){
  if(P.spd<6||CR.on)return false;
  const alongX=Math.abs(P.vx)>Math.abs(P.vz),dir=Math.sign(alongX?P.vx:P.vz);
  const lineC=alongX?P.z:P.x,li=Math.round(lineC/PITCH);
  if(li<0||li>NB||Math.abs(lineC-li*PITCH)>9)return false;
  const pos=alongX?P.x:P.z;
  let ni=Math.round(pos/PITCH);while((ni*PITCH-pos)*dir<120)ni+=dir;
  if(ni<0||ni>NB||(ni*PITCH-pos)*dir>230)return false;
  const along=ni*PITCH-dir*24,line=li*PITCH,id=++blockSeq;
  const offs=w>=5?[-9,-4.5,0,4.5,9]:w>=4?[-8,-4,0,4,8]:[-7.5,-2.5,2.5,7.5];
  offs.forEach((o,k)=>{
    const u=makeVehicle(k===2&&w>=4?'van':'cop','#fff');u.mode='block';u.blockId=id;u.v=0;
    u.x=alongX?along+(k%2?1.2:-1.2)*dir:line+o;u.z=alongX?line+o:along+(k%2?1.2:-1.2)*dir;
    /* en travers, légèrement en épi */
    u.h=(alongX?0:Math.PI/2)+(k%2?0.35:-0.35);
    u.bx=alongX?along:line;u.bz=alongX?line:along;u.bdx=alongX?dir:0;u.bdz=alongX?0:dir;
    if(u.bar)u.bar.visible=true;u.grp.position.set(u.x,0,u.z);u.grp.rotation.y=u.h;
  });
  toast('Barrage de police signalé devant !','bad');beep(300,0.25,'square',0.06);
  return true;
}

/* ---------- policiers à pied : un par voiture, descend quand le joueur est proche et lent ---------- */
const officers=[];
const OFM={uni:RK.M.std(0x1b2a47,.8,0),shirt:RK.M.std(0x8fb3d9,.75,0),cap:RK.M.std(0x101827,.55,0),badge:RK.M.std(0xd9b44a,.3,.8),boot:RK.M.plastic(0x0e0f11),belt:RK.M.plastic(0x15161a)};
const GRAB_TIME=3;
function buildOfficer(){
  const g=new THREE.Group(),A=RK.add,legs=[],arms=[];
  for(const s of[-1,1]){
    const hip=new THREE.Group();hip.position.set(s*.1,.92,0);g.add(hip);legs.push(hip);
    A(hip,new THREE.CylinderGeometry(.078,.06,.84,10),OFM.uni,0,-.42,0);
    A(hip,RK.rbox(.11,.09,.25,.03,1),OFM.boot,0,-.87,.05);
    const sh=new THREE.Group();sh.position.set(s*.235,1.43,0);g.add(sh);arms.push(sh);
    A(sh,new THREE.CylinderGeometry(.058,.046,.6,10),OFM.uni,0,-.3,0);
    A(sh,new THREE.SphereGeometry(.05,10,8),matSkin,0,-.63,0);
  }
  A(g,RK.rbox(.4,.58,.25,.09,2),OFM.uni,0,1.21,0);
  A(g,RK.rbox(.24,.3,.02,.01,1),OFM.shirt,0,1.3,.122);
  A(g,RK.rbox(.42,.07,.27,.03,1),OFM.belt,0,.95,0);
  A(g,RK.rbox(.06,.07,.01,.01,1),OFM.badge,.1,1.36,.13);
  A(g,new THREE.CylinderGeometry(.05,.055,.08,10),matSkin,0,1.53,0);
  const head=A(g,new THREE.SphereGeometry(.105,16,12),matSkin,0,1.65,.01);head.scale.set(.9,1.08,.98);
  A(g,new THREE.CylinderGeometry(.115,.11,.09,16),OFM.cap,0,1.75,0);
  A(g,RK.rbox(.2,.015,.1,.006,1),OFM.cap,0,1.715,.11,-.15,0,0);
  scene.add(g);
  return{g,legs,arms};
}
function removeOfficer(o){scene.remove(o.g);const i=officers.indexOf(o);if(i>=0)officers.splice(i,1);if(o.car&&o.car.officer===o)o.car.officer=null}
function deployOfficer(u){
  const ex=Math.cos(u.h),ez=-Math.sin(u.h),side=(ex*(P.x-u.x)+ez*(P.z-u.z))>0?1:-1;
  const o=Object.assign(buildOfficer(),{car:u,st:'run',t:0,x:u.x+ex*side*(u.r+0.5),z:u.z+ez*side*(u.r+0.5),h:u.h,ph:0,grab:0,spd:0});
  o.g.position.set(o.x,0,o.z);u.officer=o;u.halt=false;officers.push(o);
  beep(700,0.08,'square',0.05);
}
function stepOfficers(dt){
  const w=GAME.wanted;
  /* les voitures proches s'arrêtent et déposent un policier */
  if(w>0)for(const u of vehicles){
    if((u.mode!=='chase'&&u.mode!=='block')||(u.kind!=='cop'&&u.kind!=='van')||u.officer)continue;
    u.offCool=Math.max(0,(u.offCool||0)-dt);
    const d=Math.hypot(u.x-P.x,u.z-P.z),want=u.offCool<=0&&d<16&&P.spd<9&&losClear(u.x,u.z,P.x,P.z);
    if(want)u.halt=true;else if(u.halt&&(d>22||P.spd>=9))u.halt=false;
    if(u.halt&&u.v<1.5)deployOfficer(u);
  }
  let best=0;
  for(const o of officers.slice()){
    const u=o.car;o.t+=dt;
    const dx=P.x-o.x,dz=P.z-o.z,dp=Math.hypot(dx,dz),dc=Math.hypot(u.x-o.x,u.z-o.z);
    let tx=o.x,tz=o.z,vmax=0;
    if(w===0&&o.st!=='back')o.st='back';
    if(o.st==='run'){
      tx=P.x;tz=P.z;vmax=5.2+0.3*w;
      if(dp<1.25){o.st='grab';o.grab=0;toast('Un policier t’attrape : bouge pour te dégager !','bad')}
      else if(dc>40||o.t>12||(P.spd>9&&dp>6))o.st='back';
    }else if(o.st==='grab'){
      /* le policier tient le joueur : 3 s sans bouger = arrestation */
      const side=Math.cos(P.h),sz=-Math.sin(P.h);tx=P.x+side*0.75;tz=P.z+sz*0.75;vmax=4;
      if(P.spd>1.2||dp>2.4){o.st='back';o.grab=0;u.offCool=4;toast('Tu t’es dégagé ! Le policier retourne à sa voiture','good')}
      else{o.grab+=dt;best=Math.max(best,o.grab/GRAB_TIME);if(o.grab>=GRAB_TIME){bust();return}}
    }else{
      const ex=Math.cos(u.h),ez=-Math.sin(u.h),side=(ex*(o.x-u.x)+ez*(o.z-u.z))>0?1:-1;
      tx=u.x+ex*side*(u.r+0.4);tz=u.z+ez*side*(u.r+0.4);vmax=5.5;
      if(Math.hypot(tx-o.x,tz-o.z)<0.8){removeOfficer(o);u.offCool=Math.max(u.offCool||0,3);if(u.mode==='block'&&w===0)u.mode='chase';continue}
    }
    const mx=tx-o.x,mz=tz-o.z,md=Math.hypot(mx,mz);
    const target=md>0.15?Math.min(vmax,md*4):0;o.spd+=(target-o.spd)*Math.min(1,dt*6);
    if(md>0.05){o.x+=mx/md*o.spd*dt;o.z+=mz/md*o.spd*dt}
    pushOut(o,0.35);
    const face=o.st==='grab'||(o.st==='run'&&dp<3)?Math.atan2(dx,dz):md>0.2?Math.atan2(mx,mz):o.h;
    o.h+=angDiff(o.h,face)*Math.min(1,dt*10);
    /* animation de course */
    o.ph+=o.spd*dt*2.4;const k=Math.min(1,o.spd/4.5),sw=Math.sin(o.ph);
    o.legs[0].rotation.x=sw*0.75*k;o.legs[1].rotation.x=-sw*0.75*k;
    if(o.st==='grab'){o.arms[0].rotation.x=-1.25;o.arms[1].rotation.x=-1.1}
    else{o.arms[0].rotation.x=-sw*0.6*k;o.arms[1].rotation.x=sw*0.6*k}
    o.g.position.set(o.x,Math.abs(Math.cos(o.ph))*0.05*k,o.z);o.g.rotation.y=o.h;
  }
  GAME.arrest=best;
}

/* ---------- événements ---------- */
const toastBox=$('#toasts');
function toast(txt,kind){
  const d=document.createElement('div');d.className='toast '+(kind||'');d.textContent=txt;toastBox.appendChild(d);
  while(toastBox.children.length>4)toastBox.removeChild(toastBox.firstChild);
  setTimeout(()=>{d.style.transition='opacity .4s';d.style.opacity='0';setTimeout(()=>d.remove(),420)},3600);
}
const QEV=[]; // file d'événements de quêtes
function qev(type,n){QEV.push([type,n||1])}

function setWanted(w,reason){
  w=Math.min(MAXW,w);
  if(w>GAME.wanted){
    GAME.wanted=w;GAME.unseen=0;
    toast((reason?reason+' ! ':'')+COPS.lvl[w].name,'bad');beep(520,0.2,'square',0.06);
    if(w>=2)beep(380,0.35,'square',0.06);
  }
}
function crimeSeen(kind,heat){
  GAME.heat+=heat;
  if(GAME.wanted===0)setWanted(1,kind);
  if(GAME.wanted<MAXW&&GAME.heat>=COPS.lvl[GAME.wanted].need)setWanted(GAME.wanted+1,kind);
}
function loseWanted(){
  GAME.wanted=0;GAME.heat=0;GAME.unseen=0;GAME.arrest=0;SV.escapes++;
  const bonus=40*(1+Math.max(0,GAME.peakWanted-1));SV.money+=bonus;qev('escape',1);GAME.peakWanted=0;
  toast('Police semée ! +'+bonus+' €','good');beep(660,0.15,'sine',0.08);setTimeout(()=>beep(880,0.2,'sine',0.08),150);markSave();
}

/* ---------- joueur ---------- */
function respawnAt(x,z,h){endCrash();P.x=x;P.z=z;P.h=h||0;P.camH=P.h;P.vx=P.vz=0;P.spd=0;P.steer=0;P.yr=0;P.rs=false;P.drift=0;P.wheelie=0;P.wv=0;P.lean=0;P.inInter=false;GAME.crimePend=0;skidLast=null}
/* contact avec un véhicule : capsule le long de son axe (une voiture est longue, pas ronde) */
function vehContact(u,x,z,rad){
  const fx=Math.sin(u.h),fz=Math.cos(u.h),hl=Math.max(0,u.len-u.r*0.5);
  const t=clamp((x-u.x)*fx+(z-u.z)*fz,-hl,hl),qx=u.x+fx*t,qz=u.z+fz*t,dx=x-qx,dz=z-qz,d2=dx*dx+dz*dz,rr=u.r+rad;
  if(d2>=rr*rr)return null;
  const d=Math.sqrt(d2);if(d<1e-3)return{nx:-fz,nz:fx,qx,qz,rr};
  return{nx:dx/d,nz:dz/d,qx,qz,rr};
}

/* ---------- chute : éjection, glissade de la trottinette, retour à pied ---------- */
const _q1=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_qI=new THREE.Quaternion(),_v1=new THREE.Vector3(),_v2=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0);
function fall(msg,ejx,ejz){
  if(CR.on||!playerMesh)return;
  const d=playerMesh.userData,r=d.rider;
  if(ejx===undefined){ejx=P.vx*0.85;ejz=P.vz*0.85}
  CR.on=true;CR.walk=0;
  /* la trottinette continue sur sa lancée, glisse et se couche sur le flanc */
  CR.sx=P.x;CR.sz=P.z;CR.sh=P.h;CR.svx=P.vx*0.6;CR.svz=P.vz*0.6;CR.syv=P.yr*0.6+(Math.random()-.5)*2.5;
  CR.roll=P.lean;CR.rollT=(P.lean>0.03?1:P.lean<-0.03?-1:(Math.random()<.5?-1:1))*1.42;
  /* le pilote est détaché, pivot aux hanches */
  playerMesh.position.set(P.x,0,P.z);playerMesh.rotation.y=P.h;d.tilt.rotation.set(-P.wheelie,0,P.lean);
  playerMesh.updateMatrixWorld(true);
  const piv=new THREE.Group();d.hips.getWorldPosition(piv.position);scene.add(piv);
  piv.quaternion.setFromAxisAngle(UP,P.h);
  piv.add(r);r.position.copy(d.hips.position).negate();r.rotation.set(0,0,0);
  CR.pivot=piv;
  ejectRider(ejx,ejz);
  P.wheelie=0;P.wv=0;P.yr=0;P.rs=false;P.steer=0;P.lean=0;skidLast=null;
  toast(msg||'Chute !','bad');beep(90,0.3,'sawtooth',0.1);
  if(GAME.wanted>0)GAME.heat+=6;
}
/* projette le pilote dans la direction de l'impact, avec un salto dans le même sens */
function ejectRider(ejx,ejz){
  const d=playerMesh.userData,sp=Math.hypot(ejx,ejz);
  CR.phase='fly';CR.t=0;
  CR.vel.set(ejx,2.2+Math.min(4.5,sp*0.16),ejz);
  if(sp>0.3)_v1.set(ejz/sp,0,-ejx/sp);else _v1.set(Math.cos(P.h),0,-Math.sin(P.h));
  CR.spin.copy(_v1).multiplyScalar(Math.min(11,3+sp*0.3)).add(_v2.set((Math.random()-.5)*3,(Math.random()-.5)*4,(Math.random()-.5)*3));
  CR.jv=d.ragdollJoints.map(()=>new THREE.Vector3((Math.random()-0.5)*9,(Math.random()-0.5)*5,(Math.random()-0.5)*9));
}
function setJoint(i,ax,ay){const d=playerMesh.userData,j=d.ragdollJoints[i];j.quaternion.copy(d.jrest[i]);if(ax)j.rotateX(ax);if(ay)j.rotateY(ay)}
/* remonte sur la trottinette (ou nettoie l'état de chute) */
function endCrash(){
  if(!CR.on)return;CR.on=false;CR.phase='';
  const d=playerMesh&&playerMesh.userData;
  if(d){d.riderBody.add(d.rider);d.rider.position.set(0,0,0);d.rider.rotation.set(0,0,0);d.ragdollJoints.forEach((j,i)=>j.quaternion.copy(d.jrest[i]));d.tilt.rotation.set(0,0,0)}
  if(CR.pivot){scene.remove(CR.pivot);CR.pivot=null}
}
function stepCrash(dt){
  const d=playerMesh.userData,piv=CR.pivot,J=d.ragdollJoints;CR.t+=dt;
  /* trottinette : glissade freinée par le frottement, rebond sur les murs */
  const ss=Math.hypot(CR.svx,CR.svz);
  if(ss>0){const k=Math.min(ss,7*dt)/ss;CR.svx-=CR.svx*k;CR.svz-=CR.svz*k}
  CR.sx+=CR.svx*dt;CR.sz+=CR.svz*dt;CR.sh+=CR.syv*dt;CR.syv*=Math.exp(-2.5*dt);
  const so={x:CR.sx,z:CR.sz};
  if(pushOut(so,0.6)){CR.sx=so.x;CR.sz=so.z;const vn=CR.svx*HIT.nx+CR.svz*HIT.nz;if(vn<0){CR.svx-=vn*HIT.nx*1.4;CR.svz-=vn*HIT.nz*1.4}}
  if(CR.phase!=='lift')CR.roll+=(CR.rollT-CR.roll)*Math.min(1,dt*5);
  const v=CR.vel;
  if(CR.phase==='fly'||CR.phase==='down'){
    v.y-=22*dt;piv.position.addScaledVector(v,dt);
    const w=CR.spin.length();
    if(w>1e-4){_q1.setFromAxisAngle(_v1.copy(CR.spin).divideScalar(w),w*dt);piv.quaternion.premultiply(_q1)}
    const up=_v2.set(0,1,0).applyQuaternion(piv.quaternion),gy=0.17+0.72*Math.abs(up.y);
    if(piv.position.y<gy){
      piv.position.y=gy;
      if(v.y<0){if(v.y<-4)beep(70,0.08,'square',0.05);v.y=-v.y*0.25}
      const f=Math.exp(-3.2*dt);v.x*=f;v.z*=f;
      CR.spin.multiplyScalar(Math.exp(-4*dt));
      /* au sol, le corps se couche à plat */
      _v1.set(up.x,0,up.z);if(_v1.lengthSq()<1e-4)_v1.set(Math.sin(P.h),0,Math.cos(P.h));_v1.normalize();
      _q1.setFromUnitVectors(up,_v1);_q2.copy(_qI).slerp(_q1,Math.min(1,dt*3.5));piv.quaternion.premultiply(_q2);
    }
    /* murs et véhicules : rebond */
    const o={x:piv.position.x,z:piv.position.z};
    if(pushOut(o,0.4)){piv.position.x=o.x;piv.position.z=o.z;const vn=v.x*HIT.nx+v.z*HIT.nz;if(vn<0){v.x-=vn*HIT.nx*1.3;v.z-=vn*HIT.nz*1.3}}
    if(piv.position.y<1.7)for(const u of vehicles){const c=vehContact(u,piv.position.x,piv.position.z,0.4);if(!c)continue;
      piv.position.x=c.qx+c.nx*c.rr;piv.position.z=c.qz+c.nz*c.rr;const ux=Math.sin(u.h)*u.v,uz=Math.cos(u.h)*u.v,vn=(v.x-ux)*c.nx+(v.z-uz)*c.nz;
      if(vn<0){v.x-=vn*c.nx*1.3;v.z-=vn*c.nz*1.3}}
    /* membres désarticulés */
    for(let i=0;i<J.length;i++){const j=J[i],jv=CR.jv[i];
      j.rotation.x=clamp(j.rotation.x+jv.x*dt,-1.5,1.5);j.rotation.y=clamp(j.rotation.y+jv.y*dt,-1.2,1.2);j.rotation.z=clamp(j.rotation.z+jv.z*dt,-1.5,1.5);
      jv.multiplyScalar(Math.exp(-(CR.phase==='down'?6:2.5)*dt))}
    const hs=Math.hypot(v.x,v.z);
    if(CR.phase==='fly'&&CR.t>0.5&&((piv.position.y<=gy+0.03&&hs<0.9&&Math.abs(up.y)<0.4)||CR.t>4)){CR.phase='down';CR.t=0}
    else if(CR.phase==='down'&&CR.t>0.9){
      /* se relève face à sa trottinette */
      const yaw=Math.atan2(CR.sx-piv.position.x,CR.sz-piv.position.z);
      CR.phase='getup';CR.t=0;
      CR.from={q:piv.quaternion.clone(),y:piv.position.y,to:new THREE.Quaternion().setFromAxisAngle(UP,yaw),yaw,j:J.map(j=>j.quaternion.clone())};
    }
    P.vx=v.x;P.vz=v.z;
  }else if(CR.phase==='getup'){
    const k=Math.min(1,CR.t/1.0),e=k*k*(3-2*k);
    piv.quaternion.copy(CR.from.q).slerp(CR.from.to,e);
    piv.position.y=lerp(CR.from.y,d.standY,e);
    for(let i=0;i<J.length;i++)J[i].quaternion.copy(CR.from.j[i]).slerp(d.jrest[i],e);
    if(k>=1){CR.phase='walk';CR.t=0;P.h=CR.from.yaw;CR.ph=0}
    P.vx=P.vz=0;
  }else if(CR.phase==='walk'){
    /* retour à pied : Z avancer, S reculer, Q/D tourner, Maj courir */
    const fw=KEYS['z']||KEYS['w']||KEYS['arrowup']||KEYS['_gas'],bk=KEYS['s']||KEYS['arrowdown']||KEYS['_brake'];
    const turn=((KEYS['q']||KEYS['a']||KEYS['arrowleft']||KEYS['_left'])?1:0)-((KEYS['d']||KEYS['arrowright']||KEYS['_right'])?1:0);
    P.h+=turn*2.8*dt;
    const target=(fw?(KEYS['shift']?4.6:2.6):0)-(bk?1.3:0);
    CR.walk+=(target-CR.walk)*Math.min(1,dt*8);
    const o={x:piv.position.x+Math.sin(P.h)*CR.walk*dt,z:piv.position.z+Math.cos(P.h)*CR.walk*dt};pushOut(o,0.35);
    for(const u of vehicles){const c=vehContact(u,o.x,o.z,0.35);if(!c)continue;
      const ux=Math.sin(u.h)*u.v,uz=Math.cos(u.h)*u.v;
      if(-(ux*c.nx+uz*c.nz)>4){piv.position.x=c.qx+c.nx*c.rr;piv.position.z=c.qz+c.nz*c.rr;ejectRider(ux*1.1,uz*1.1);toast('Renversé !','bad');return}
      o.x=c.qx+c.nx*c.rr;o.z=c.qz+c.nz*c.rr}
    P.vx=(o.x-piv.position.x)/dt;P.vz=(o.z-piv.position.z)/dt;
    piv.position.x=o.x;piv.position.z=o.z;
    piv.quaternion.setFromAxisAngle(UP,P.h);
    CR.ph+=Math.abs(CR.walk)*dt*3.4;
    const k=Math.min(1,Math.abs(CR.walk)/2.6),sw=Math.sin(CR.ph);
    setJoint(0,-0.12+0.08*k);setJoint(2,sw*0.6*k);setJoint(3,-sw*0.6*k);setJoint(4,1.0-sw*0.5*k);setJoint(5,1.0+sw*0.5*k);
    piv.position.y=d.standY+Math.abs(Math.cos(CR.ph))*0.045*k;
    if(Math.hypot(CR.sx-o.x,CR.sz-o.z)<1.35){CR.phase='lift';CR.t=0;CR.from={roll:CR.roll};P.h=Math.atan2(CR.sx-o.x,CR.sz-o.z);piv.quaternion.setFromAxisAngle(UP,P.h)}
  }else if(CR.phase==='lift'){
    /* relève la trottinette puis remonte dessus */
    const k=Math.min(1,CR.t/1.1),e=k*k*(3-2*k),b=Math.sin(k*Math.PI);
    CR.roll=CR.from.roll*(1-e);
    setJoint(0,0.75*b);setJoint(2,-0.35*b);setJoint(3,-0.35*b);setJoint(4,0.2-0.6*b);setJoint(5,0.2-0.6*b);
    piv.position.y=d.standY-0.16*b;
    P.vx=P.vz=0;
    if(k>=1){P.x=CR.sx;P.z=CR.sz;P.h=CR.sh;P.vx=P.vz=0;P.spd=0;endCrash();beep(520,0.08,'sine',0.05);return}
  }
  if(CR.on){P.x=piv.position.x;P.z=piv.position.z;P.spd=Math.hypot(P.vx,P.vz)}
}

/* ---------- conduite : modèle bicyclette (pneu avant / pneu arrière, lacet), wheelie, drift ---------- */
const TIRE_G=24,WB_A=0.6,WB_B=0.6,YAW_K2=0.5,HAND_MU=0.65,DRIFT_BETA=0.55,WHEELIE_MAX=rad(75);
function stepRide(dt){
  const st=curStats(),o=curOwned();
  const fwdK=KEYS['z']||KEYS['w']||KEYS['arrowup']||KEYS['_gas'];
  const backK=KEYS['s']||KEYS['arrowdown']||KEYS['_brake'];
  const leftK=KEYS['q']||KEYS['a']||KEYS['arrowleft']||KEYS['_left'];
  const rightK=KEYS['d']||KEYS['arrowright']||KEYS['_right'];
  const hand=KEYS[' '];
  const turnInput=(leftK?1:0)-(rightK?1:0);
  const hasBat=o.bat>0,vmaxE=hasBat?st.vmax:1.7,mu=st.grip/5.5;
  P.steer+=(turnInput-P.steer)*Math.min(1,dt*(turnInput?7:11));
  /* wheelie : Maj lève l'avant ; sans gaz il retombe, les gaz le font monter jusqu'à 75°, le frein le rabat */
  if(P.wheelie>0.002||P.wv>0){
    let wa=-9*Math.cos(P.wheelie);
    if(fwdK&&hasBat)wa+=9.7;
    if(backK)wa-=16;
    P.wv+=wa*dt;P.wheelie+=P.wv*dt;
    if(P.wheelie>=WHEELIE_MAX){P.wheelie=WHEELIE_MAX;if(P.wv>0)P.wv=0}
    if(P.wheelie<=0){if(P.wv<-3.2){P.wob=Math.min(1,-P.wv*0.08);beep(140,0.12,'square',0.05)}P.wheelie=0;P.wv=0}
  }
  /* charge sur chaque roue : en wheelie l'avant décolle et ne dirige presque plus */
  const lift=clamp(P.wheelie/0.12,0,1),Nf=0.5*(1-0.75*lift),Nr=1-Nf;
  const capF=Nf*mu*0.92*TIRE_G,capS=Nr*mu*1.12*TIRE_G,capK=capS*0.72;
  const CFs=Nf*mu*TIRE_G/0.14,CRs=Nr*mu*TIRE_G/0.14;
  const n=Math.max(2,Math.ceil(dt*240)),h=dt/n;
  for(let s=0;s<n;s++){
    const sh=Math.sin(P.h),ch=Math.cos(P.h);
    let vf=P.vx*sh+P.vz*ch,vy=P.vx*ch-P.vz*sh,r=P.yr;
    const sp=Math.abs(vf);
    /* moteur (passe par la roue arrière) */
    let fx=0;
    if(fwdK&&vf<vmaxE){const q=clamp(vf/vmaxE,0,1),torque=0.5+0.5*clamp((0.72-q)/0.48,0,1);fx=st.acc*torque*(hasBat?1:0.2)}
    /* braquage : plus petit à haute vitesse */
    const ymax=2.15/(1+sp/15)*(1-0.6*lift);
    let dl=P.steer*Math.min(0.6,Math.atan(ymax*(WB_A+WB_B)/Math.max(sp,1)));
    /* en glisse, le pilote contre-braque : la roue avant suit la trajectoire, la direction dose l'angle */
    /* en glisse, le pilote contre-braque : la roue avant suit la trajectoire, puis il dose pour tenir un angle de glisse
       (plus grand aux gaz, plus petit sans gaz, nul sans direction ; braquer à l'opposé fait sortir du drift) */
    if(P.rs&&sp>3){
      const beta=Math.atan2(vy,sp),ab=Math.abs(beta),bd=beta<0?1:-1,db=(ab-P.pab)/h;P.pab=ab;
      let off;
      if(P.steer*bd>0.1){const tgt=(hand?1.1:fx>0?1:0.4)*DRIFT_BETA*Math.abs(P.steer);off=bd*clamp(0.45*(tgt-ab)-0.07*db,-0.35,0.35)}
      else if(Math.abs(P.steer)>0.1)off=Math.sign(P.steer)*0.12;
      else off=bd*clamp(-0.25*ab-0.07*db,-0.35,0.35);
      dl=clamp(Math.atan2(vy+WB_A*r,sp)+off,-0.9,0.9);
    }else P.pab=0;
    /* le guidon ne tourne pas instantanément */
    P.dl+=clamp(dl-P.dl,-12*h,12*h);dl=P.dl;
    const cd=Math.cos(dl),sd=Math.sin(dl);
    /* pneu avant */
    const vyf=vy+WB_A*r,lonF=vf*cd+vyf*sd,latF=-vf*sd+vyf*cd;
    const af=Math.atan2(latF,Math.max(Math.abs(lonF),0.5));
    /* à l'arrêt le modèle de pneus s'efface au profit du modèle cinématique */
    const wb=clamp((Math.hypot(vf,vy)-2.5)/2.5,0,1);
    const Fw=clamp(-CFs*af,-capF,capF),Ffx=-Fw*sd*wb,Ffy=Fw*cd;
    /* pneu arrière : adhérence, sinon glissement (cercle de friction : plus on accélère, moins il tient latéralement) */
    const vyr=vy-WB_B*r;let Frx=fx,Fry=0;
    if(hand&&sp>0.8){
      /* frein arrière (Espace) : roue bloquée, le frottement s'oppose à la vitesse du contact */
      const m=Math.hypot(vf,vyr)||1,ck=capK*HAND_MU;Frx=-ck*vf/m;Fry=-ck*vyr/m;P.rs=true;
    }else{
      const ar=Math.atan2(vyr,Math.max(Math.abs(vf),0.5));
      if(!P.rs){Fry=-CRs*ar;if(Math.hypot(Frx,Fry)>capS&&sp>3)P.rs=true;else Fry=clamp(Fry,-capS,capS)}
      if(P.rs){
        if(fx>0){
          /* gaz en glisse : la roue patine (vitesse de patinage ws), le frottement suit le glissement total :
             il pousse vers l'avant et retient moins latéralement, ce qui entretient le drift */
          const ws=3+9*fx/st.acc,m=Math.hypot(ws,vyr);Frx=Math.min(capK*ws/m,fx*1.4);Fry=-capK*vyr/m;
        }else{Frx=clamp(Frx,-capK*0.92,capK*0.92);Fry=-clamp(ar/0.05,-1,1)*Math.sqrt(capK*capK-Frx*Frx)}
        if(Math.abs(ar)<(fx>0?0.03:0.05)||sp<2)P.rs=false;
      }
    }
    vf+=(Frx+Ffx+r*vy)*h;vy+=(Fry+Ffy-r*vf)*h;r+=(WB_A*Ffy-WB_B*Fry)/YAW_K2*h;
    /* freins, résistance, limiteur */
    if(backK){if(vf>0.6)vf-=st.brake*1.15*(lift>0.5?0.5:1)*h;else{vf-=2.2*h;if(vf<-2.6)vf=-2.6}}
    if(vf>vmaxE)vf-=(vf-vmaxE)*Math.min(1,h*1.5);
    vf-=vf*0.035*h+Math.sign(vf)*Math.min(Math.abs(vf),0.35*h);
    /* à basse vitesse : modèle cinématique (stable) */
    if(wb<1){const rk=P.steer*ymax*clamp(sp/2.5,0,1)*(vf<-0.2?-1:1);r=lerp(rk,r,wb);vy=lerp(vy*Math.exp(-14*h),vy,wb)}
    P.h+=r*h;P.yr=r;
    const s2=Math.sin(P.h),c2=Math.cos(P.h);
    P.vx=vf*s2+vy*c2;P.vz=vf*c2-vy*s2;
    P.x+=P.vx*h;P.z+=P.vz*h;
  }
  P.spd=Math.hypot(P.vx,P.vz);
  {const sh=Math.sin(P.h),ch=Math.cos(P.h),vf=P.vx*sh+P.vz*ch,vy=P.vx*ch-P.vz*sh;P.slip=Math.atan2(vy,Math.max(Math.abs(vf),0.1))}
  if(P.rs&&P.spd>6){P.drift+=dt;qev('drift',dt)}else P.drift=Math.max(0,P.drift-dt);
  if(Math.abs(P.slip)>1.35&&P.spd>11){fall('Tête-à-queue !',P.vx*0.8,P.vz*0.8);return}
  /* batterie & distance */
  const dm=P.spd*dt;P.dist+=dm;SV.km+=dm;
  if(o.bat>0){o.bat=Math.max(0,o.bat-dm/(st.range*1000)*(1+P.spd/60));if(o.bat===0)toast('Batterie vide : mode secours (6 km/h). Rends-toi dans un garage.','bad')}
  qev('dist',dm);
  const kmh=P.spd*3.6;if(kmh>P.top)P.top=kmh;qev('speed',kmh);
  /* collisions décor */
  P.x=clamp(P.x,-30,1230);P.z=clamp(P.z,-30,1230);
  const pvx=P.vx,pvz=P.vz;
  if(pushOut(P,0.72)){
    const vn=P.vx*HIT.nx+P.vz*HIT.nz;
    if(vn<0){P.vx-=vn*HIT.nx*1.25;P.vz-=vn*HIT.nz*1.25;P.yr*=0.5;if(-vn>7){fall('Choc violent !',pvx*0.8,pvz*0.8);return}else if(-vn>4)beep(110,0.12,'square',0.05)}
  }
  /* collisions véhicules */
  for(const u of vehicles){
    const c=vehContact(u,P.x,P.z,0.7);if(!c)continue;
    const ux=Math.sin(u.h)*u.v,uz=Math.cos(u.h)*u.v;
    const rel=(P.vx-ux)*c.nx+(P.vz-uz)*c.nz;
    P.x=c.qx+c.nx*c.rr;P.z=c.qz+c.nz*c.rr;
    if(rel<0){
      const bx=P.vx,bz=P.vz;
      P.vx-=rel*c.nx*1.3;P.vz-=rel*c.nz*1.3;P.yr*=0.5;
      const cop=u.kind==='cop'||u.kind==='van'||u.kind==='tank';
      if(cop){if(-rel>6&&GAME.wanted>0)GAME.heat+=3;if(-rel>7&&u.mode!=='block')u.v*=0.5}
      if(u.mode==='civ'||u.mode==='patrol')u.v=Math.max(0,u.v-3);
      if(-rel>5&&(u.kind==='cop'||u.kind==='van')&&GAME.wanted===0){const ob=observers();if(ob.seen)crimeSeen('Accident avec la police',40)}
      /* éjection : élan du joueur + poussée du choc */
      if(-rel>6){fall('Collision !',bx*0.7-c.nx*rel*0.6,bz*0.7-c.nz*rel*0.6);return}
      else if(-rel>3)beep(100,0.1,'square',0.05);
    }
  }
}
function observers(){
  let seen=false,watcher=false;
  for(const u of vehicles){
    if(u.kind!=='cop'&&u.kind!=='van'&&u.kind!=='tank')continue;
    const d=Math.hypot(u.x-P.x,u.z-P.z);
    const R=u.mode==='patrol'?55:70;
    if(d<R&&losClear(u.x,u.z,P.x,P.z)){seen=true;if(u.mode==='patrol')watcher=true}
  }
  for(const h of helis){const d=Math.hypot(h.x-P.x,h.z-P.z);if(d<105){seen=true}}
  for(const o of officers)if(Math.hypot(o.x-P.x,o.z-P.z)<30)seen=true;
  return{seen,watcher};
}
function stepPlayer(dt){
  if(CR.on)stepCrash(dt);else stepRide(dt);
  stepLaw(dt);
}
/* infractions, niveaux de recherche */
function stepLaw(dt){
  const kmh=P.spd*3.6;
  const dist=districtAt(P.x,P.z),lim=DISTRICTS[dist].limit;
  const over=!CR.on&&kmh>lim+6;
  $('#limit').textContent=lim;$('#limit').classList.toggle('over',over);
  if(over)GAME.crimePend=Math.max(GAME.crimePend,0.6),GAME.crimeKind=GAME.crimeKind==='Feu grillé'&&GAME.crimePend>0.6?GAME.crimeKind:'Excès de vitesse';
  const ix=Math.round(P.x/PITCH),iz=Math.round(P.z/PITCH);
  const nxp=ix*PITCH,nzp=iz*PITCH,inI=!CR.on&&Math.abs(P.x-nxp)<9.5&&Math.abs(P.z-nzp)<9.5&&ix>=0&&ix<=NB&&iz>=0&&iz<=NB;
  if(inI&&!P.inInter){
    const axis=Math.abs(P.vz)>Math.abs(P.vx)?0:1,s=lightState(axis,GAME.clock);
    if(s==='r'&&P.spd>2.5){GAME.crimePend=2.8;GAME.crimeKind='Feu grillé';toast('Feu rouge grillé','dim')}
  }
  P.inInter=inI;
  const ob=observers();GAME.seen=ob.seen;
  if(GAME.crimePend>0){
    GAME.crimePend-=dt;
    if(ob.watcher||(ob.seen&&GAME.wanted>0)){
      GAME.spot+=dt;
      if(GAME.spot>0.5){GAME.spot=0;GAME.crimePend=0;crimeSeen(GAME.crimeKind||'Infraction',GAME.crimeKind==='Feu grillé'?14:10)}
    }
  }else GAME.spot=Math.max(0,GAME.spot-dt);
  if(GAME.wanted>0){
    const L=COPS.lvl[GAME.wanted];
    GAME.peakWanted=Math.max(GAME.peakWanted||0,GAME.wanted);
    if(ob.seen){GAME.unseen=0;GAME.heat+=dt*(0.9+0.35*GAME.wanted)*(P.spd>6?1:0.3)}
    else{GAME.unseen+=dt;GAME.heat=Math.max(0,GAME.heat-dt*1.2)}
    if(GAME.wanted<MAXW&&GAME.heat>=L.need)setWanted(GAME.wanted+1,'La situation dégénère');
    if(GAME.unseen>=L.lose)loseWanted();
  }else GAME.arrest=0;
}
function bust(){
  const fine=Math.max(0,Math.min(SV.money,50*GAME.wanted));
  SV.money-=fine;SV.busted++;GAME.bustedFine=fine;GAME.wanted=0;GAME.heat=0;GAME.arrest=0;GAME.unseen=0;GAME.peakWanted=0;
  const g=GARAGES[SV.garage]||GARAGES[0];
  respawnAt(g.x+6,g.z+4,Math.PI/2);
  for(const u of vehicles.filter(u=>u.kind==='cop'||u.kind==='van'||u.kind==='tank'))removeVehicle(u);
  for(const o of officers.slice())removeOfficer(o);
  for(const h of helis.slice())removeHeli(h);
  for(const s of shells.slice()){scene.remove(s.m)}shells.length=0;
  if(JOB)cancelJob(true);
  GAME.state='busted';
  $('#bustTxt').textContent='Amende : '+fmtEur(fine)+'. Tu repars depuis '+g.name+'.';
  $('#ovBusted').hidden=false;markSave();saveNow();
}

/* ---------- effets : traces de pneu et fumée en glissade ---------- */
const SKID_N=500,skidMesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),
  new THREE.MeshBasicMaterial({color:0x111111,transparent:true,opacity:0.42,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4}),SKID_N);
skidMesh.frustumCulled=false;skidMesh.renderOrder=1;
{const z=new THREE.Matrix4().makeScale(0,0,0);for(let i=0;i<SKID_N;i++)skidMesh.setMatrixAt(i,z)}
scene.add(skidMesh);
let skidI=0,skidLast=null,smokeT=0;
const smokeTex=RK.canvasTex(64,64,(g,w,h)=>{const gr=g.createRadialGradient(32,32,2,32,32,31);gr.addColorStop(0,'rgba(235,235,235,.85)');gr.addColorStop(1,'rgba(235,235,235,0)');g.fillStyle=gr;g.fillRect(0,0,w,h)});
const smokes=[];
for(let i=0;i<40;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,transparent:true,depthWrite:false,opacity:0}));s.visible=false;scene.add(s);smokes.push({s,life:0,vx:0,vz:0})}
let smokeI=0;
function stepFx(dt){
  const sliding=!CR.on&&P.rs&&P.spd>3;
  const rz=playerMesh?playerMesh.userData.rearZ:-0.5,sh=Math.sin(P.h),ch=Math.cos(P.h);
  const px=P.x+sh*rz,pz=P.z+ch*rz;
  if(sliding){
    if(skidLast){
      const dx=px-skidLast.x,dz=pz-skidLast.z,L=Math.hypot(dx,dz);
      if(L>0.35){
        _m4.compose(_v.set((px+skidLast.x)/2,0.04,(pz+skidLast.z)/2),_q.setFromAxisAngle(UP,Math.atan2(dx,dz)),_s.set(0.09,1,L+0.02));
        skidMesh.setMatrixAt(skidI,_m4);skidI=(skidI+1)%SKID_N;skidMesh.instanceMatrix.needsUpdate=true;skidLast={x:px,z:pz};
      }
    }else skidLast={x:px,z:pz};
    smokeT-=dt;
    if(smokeT<=0){smokeT=0.045;const p=smokes[smokeI];smokeI=(smokeI+1)%smokes.length;
      p.life=1;p.s.visible=true;p.s.position.set(px+(Math.random()-.5)*.3,0.25,pz+(Math.random()-.5)*.3);p.vx=P.vx*0.25;p.vz=P.vz*0.25;p.s.scale.setScalar(0.5)}
  }else skidLast=null;
  for(const p of smokes){
    if(p.life<=0)continue;p.life-=dt*0.9;
    if(p.life<=0){p.s.visible=false;continue}
    p.s.position.x+=p.vx*dt;p.s.position.z+=p.vz*dt;p.s.position.y+=dt*0.6;p.vx*=Math.exp(-2*dt);p.vz*=Math.exp(-2*dt);
    p.s.scale.setScalar(0.5+(1-p.life)*2.6);p.s.material.opacity=p.life*0.45;
  }
}

/* ---------- mise à jour des véhicules ---------- */
function stepVehicles(dt){
  for(const u of vehicles.slice()){
    if(u.mode==='civ'||u.mode==='patrol')driveRoad(u,dt,u.mode==='patrol'?u.vmax:undefined);
    else if(u.mode==='chase')chaseStep(u,dt);
    const dd=Math.hypot(u.x-P.x,u.z-P.z);
    if(u.mode==='civ'&&dd>380){
      /* recycler devant le joueur */
      const n=spawnRoadNode(180,340);if(n){const nb=neighbors(n[0],n[1]);const b=nb[Math.floor(Math.random()*nb.length)];placeOnRoad(u,n[0],n[1],b[0],b[1],0.2+Math.random()*0.6);u.v=0}
    }
    u.grp.position.set(u.x,0,u.z);u.grp.rotation.y=u.h;
    u.grp.visible=dd<460;
  }
  /* séparation entre unités de chasse */
  const ch=vehicles.filter(u=>u.mode==='chase');
  for(let i=0;i<ch.length;i++)for(let j=i+1;j<ch.length;j++){
    const a=ch[i],b=ch[j],dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz),m=a.r+b.r;
    if(d<m&&d>0.01){const p=(m-d)/2;a.x-=dx/d*p;a.z-=dz/d*p;b.x+=dx/d*p;b.z+=dz/d*p}
  }
  /* hélicoptères */
  for(const h of helis){
    h.orb+=dt*0.45;
    const tx=P.x+Math.cos(h.orb+(helis.indexOf(h)*3.1))*22,tz=P.z+Math.sin(h.orb+(helis.indexOf(h)*3.1))*22;
    const ax=(tx-h.x)*1.1-h.vx*1.4,az=(tz-h.z)*1.1-h.vz*1.4;
    h.vx+=ax*dt;h.vz+=az*dt;const sp=Math.hypot(h.vx,h.vz),mx=29;if(sp>mx){h.vx*=mx/sp;h.vz*=mx/sp}
    h.x+=h.vx*dt;h.z+=h.vz*dt;
    const hd=Math.atan2(h.vx,h.vz);if(sp>2)h.h+=clamp(angDiff(h.h,hd),-1.5*dt,1.5*dt);
    h.g.position.set(h.x,h.y,h.z);h.g.rotation.y=h.h;h.g.rotation.x=clamp(sp/mx*0.25,0,0.25);
    h.rotor.rotation.y+=dt*30;h.tr.rotation.x+=dt*40;
    const dx=h.x-P.x,dy=h.y,dz=h.z-P.z,len=Math.sqrt(dx*dx+dy*dy+dz*dz);
    h.beam.position.set((h.x+P.x)/2,h.y/2,(h.z+P.z)/2);h.beam.scale.set(1,len,1);
    h.beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dx/len,dy/len,dz/len));
  }
  /* obus */
  for(const s of shells.slice()){
    s.life-=dt;s.x+=s.vx*dt;s.z+=s.vz*dt;s.m.position.set(s.x,1.6,s.z);
    let kill=s.life<=0||pointInBuilding(s.x,s.z);
    if(!kill&&Math.hypot(s.x-P.x,s.z-P.z)<1.8){
      kill=true;GAME.heat+=8;if(CR.on)ejectRider(s.vx*0.35,s.vz*0.35);else fall('Touché par un tir de blindé',s.vx*0.35,s.vz*0.35);
    }
    if(kill){scene.remove(s.m);shells.splice(shells.indexOf(s),1)}
  }
  /* gyrophares */
  const ph=Math.floor(GAME.t*5)%2;
  SIREN_R.color.setHex(ph?0xff2222:0x330808);SIREN_B.color.setHex(ph?0x082033:0x2a6bff);
  /* feux de signalisation (global) */
  for(let a=0;a<2;a++){lampMat[a].color.setHex(LCOL[lightState(a,GAME.clock)])}
}
function initTraffic(n){
  for(let k=0;k<n;k++){
    const u=makeVehicle('car',CARCOLS[k%CARCOLS.length]);u.mode='civ';
    const i=Math.floor(Math.random()*(NB+1)),j=Math.floor(Math.random()*(NB+1)),nb=neighbors(i,j),b=nb[Math.floor(Math.random()*nb.length)];
    placeOnRoad(u,i,j,b[0],b[1],Math.random()*0.7);u.v=0;
  }
}
/* ====================== p3 : quêtes, livraisons, interface, boucle ====================== */
/* ---------- pièces ---------- */
const NCOIN=160;let coinMesh=null;const coins=[];
function initCoins(){
  const geo=new THREE.CylinderGeometry(0.55,0.55,0.12,12).rotateX(Math.PI/2);
  coinMesh=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({color:0xffc83d}),NCOIN);scene.add(coinMesh);
  for(let k=0;k<NCOIN;k++)coins.push({x:0,z:0,on:true});respawnCoins();
}
function respawnCoins(){
  for(const c of coins){
    const a=Math.floor(Math.random()*(NB+1)),f=Math.random()*NB*PITCH,off=(Math.random()-0.5)*10;
    if(Math.random()<0.5){c.x=f;c.z=a*PITCH+off}else{c.x=a*PITCH+off;c.z=f}
    c.on=true;
  }
}
const _cm=new THREE.Matrix4(),_cq=new THREE.Quaternion(),_cp=new THREE.Vector3(),_cs=new THREE.Vector3(1,1,1),_ca=new THREE.Vector3(0,1,0);
function stepCoins(t){
  for(let k=0;k<NCOIN;k++){
    const c=coins[k];
    if(c.on&&Math.abs(c.x-P.x)<1.8&&Math.abs(c.z-P.z)<1.8){c.on=false;SV.money+=12;qev('coins',1);beep(900+Math.random()*200,0.08,'sine',0.06);markSave()}
    _cq.setFromAxisAngle(_ca,t*3+k);_cp.set(c.x,1.1,c.z);const s=c.on?1:0.0001;_cs.set(s,s,s);
    _cm.compose(_cp,_cq,_cs);coinMesh.setMatrixAt(k,_cm);
  }
  coinMesh.instanceMatrix.needsUpdate=true;
}

/* ---------- livraisons ---------- */
let JOB=null,navTarget=null;
const jobMatP=new THREE.MeshBasicMaterial({color:0x4db8ff,transparent:true,opacity:0.35,depthWrite:false,side:THREE.DoubleSide});
const jobMatD=new THREE.MeshBasicMaterial({color:0xffc83d,transparent:true,opacity:0.4,depthWrite:false,side:THREE.DoubleSide});
const jobBeam=new THREE.Mesh(new THREE.CylinderGeometry(4,4,70,20,1,true),jobMatP);jobBeam.visible=false;scene.add(jobBeam);
function roadPoint(minD,maxD,fx,fz){
  for(let k=0;k<40;k++){
    const a=Math.floor(Math.random()*(NB+1)),f=Math.random()*NB*PITCH;
    const x=Math.random()<0.5?f:a*PITCH,z=x===f?a*PITCH:f;
    const d=Math.hypot(x-fx,z-fz);if(d>=minD&&d<=maxD)return{x,z};
  }
  return{x:clamp(fx+200,0,1200),z:fz};
}
function startJob(){
  const p=roadPoint(120,380,P.x,P.z),d=roadPoint(300,800,p.x,p.z);
  JOB={stage:'pickup',px:p.x,pz:p.z,dx:d.x,dz:d.z,time:0,pay:Math.round(35+Math.hypot(d.x-p.x,d.z-p.z)*0.2),dist:Math.hypot(d.x-p.x,d.z-p.z)};
  navTarget={name:'Colis à récupérer',x:p.x,z:p.z,type:'delivery'};
  toast('Livraison lancée : va chercher le colis (balise bleue).');
}
function cancelJob(silent){JOB=null;jobBeam.visible=false;if(navTarget&&navTarget.type==='delivery')navTarget=null;if(!silent)toast('Livraison annulée','dim')}
function stepJob(dt){
  if(!JOB){jobBeam.visible=false;return}
  const tx=JOB.stage==='pickup'?JOB.px:JOB.dx,tz=JOB.stage==='pickup'?JOB.pz:JOB.dz;
  jobBeam.visible=true;jobBeam.material=JOB.stage==='pickup'?jobMatP:jobMatD;jobBeam.position.set(tx,35,tz);
  if(JOB.stage==='drop'){JOB.time-=dt;if(JOB.time<=0){toast('Temps écoulé : livraison échouée','bad');cancelJob(true);return}}
  if(Math.hypot(P.x-tx,P.z-tz)<7){
    if(JOB.stage==='pickup'){JOB.stage='drop';JOB.time=JOB.dist/8.5+35;JOB.timeMax=JOB.time;navTarget={name:'Destination de livraison',x:JOB.dx,z:JOB.dz,type:'delivery'};toast('Colis récupéré ! Livre-le avant la fin du temps.','good');beep(700,0.12,'triangle',0.08)}
    else{
      const bonus=Math.round(JOB.pay*0.4*clamp(JOB.time/JOB.timeMax,0,1)),tot=JOB.pay+bonus;
      SV.money+=tot;SV.deliv++;qev('deliv',1);toast('Livré ! +'+tot+' € (bonus rapidité '+bonus+' €)','good');
      beep(660,0.12,'triangle',0.08);setTimeout(()=>beep(990,0.2,'triangle',0.08),120);JOB=null;if(navTarget&&navTarget.type==='delivery')navTarget=null;markSave();
    }
  }
}

/* ---------- quêtes ---------- */
const QPOOL={
 daily:[
  {id:'d_deliv',txt:'Livrer 3 colis',ev:'deliv',n:3,rw:220},
  {id:'d_dist',txt:'Parcourir 3 km',ev:'dist',n:3000,rw:150,unit:'m'},
  {id:'d_coins',txt:'Ramasser 25 pièces',ev:'coins',n:25,rw:160},
  {id:'d_speed',txt:'Atteindre 45 km/h',ev:'speed',n:45,rw:120,max:true},
  {id:'d_drift',txt:'Déraper pendant 8 s',ev:'drift',n:8,rw:130,unit:'s'},
  {id:'d_dist2',txt:'Visiter 4 quartiers',ev:'district',n:4,rw:140},
  {id:'d_escape',txt:'Semer la police 1 fois',ev:'escape',n:1,rw:320}
 ],
 weekly:[
  {id:'w_deliv',txt:'Livrer 15 colis',ev:'deliv',n:15,rw:1200},
  {id:'w_dist',txt:'Parcourir 25 km',ev:'dist',n:25000,rw:1000,unit:'m'},
  {id:'w_coins',txt:'Ramasser 150 pièces',ev:'coins',n:150,rw:1100},
  {id:'w_escape',txt:'Semer la police 3 fois',ev:'escape',n:3,rw:1600},
  {id:'w_speed',txt:'Atteindre 70 km/h',ev:'speed',n:70,rw:900,max:true},
  {id:'w_drift',txt:'Déraper pendant 60 s',ev:'drift',n:60,rw:750,unit:'s'}
 ]
};
const DAYLEN=360;
function dayNum(){return Math.floor((SV.time||0)/DAYLEN)}
function weekNum(){return Math.floor(dayNum()/7)}
function pickQuests(pool,seed,k){
  const r=mulberry32(seed*7919+13),a=pool.slice(),out=[];
  while(out.length<k&&a.length){out.push(a.splice(Math.floor(r()*a.length),1)[0])}
  return out.map(q=>({id:q.id,p:0,done:false}));
}
function ensureQuests(){
  const d=dayNum(),w=weekNum();
  if(SV.qDay!==d){SV.qDay=d;SV.daily=pickQuests(QPOOL.daily,d+1,3);SV.visited={};if(coinMesh)respawnCoins();if(SV.qDay>0)toast('Nouveau jour : quêtes quotidiennes renouvelées','good')}
  if(SV.qWeek!==w){SV.qWeek=w;SV.weekly=pickQuests(QPOOL.weekly,w+101,3);if(w>0)toast('Nouvelle semaine : quêtes hebdomadaires renouvelées','good')}
}
function questDef(id){return QPOOL.daily.concat(QPOOL.weekly).find(q=>q.id===id)}
function applyEvent(type,n){
  for(const list of[SV.daily,SV.weekly])for(const q of list){
    if(q.done)continue;const d=questDef(q.id);if(!d||d.ev!==type)continue;
    if(d.max)q.p=Math.max(q.p,n);else q.p+=n;
    if(q.p>=d.n){q.p=d.n;q.done=true;SV.money+=d.rw;toast('Quête terminée : '+d.txt+' (+'+fmtEur(d.rw)+')','good');beep(784,0.12,'triangle',0.08);setTimeout(()=>beep(1046,0.25,'triangle',0.08),130);markSave()}
  }
}
function flushEvents(){while(QEV.length){const e=QEV.shift();applyEvent(e[0],e[1])}}
function fmtQ(q,d){const v=d.unit==='m'?(q.p/1000).toFixed(1).replace('.',',')+' / '+(d.n/1000)+' km':d.unit==='s'?Math.floor(q.p)+' / '+d.n+' s':Math.floor(q.p)+' / '+d.n;return v}
function questRows(list){
  return list.map(q=>{const d=questDef(q.id);if(!d)return'';
    return `<div class="qrow ${q.done?'done':''}"><div class="r"><span>${d.txt}</span><span class="price">${q.done?'Fait':'+'+fmtEur(d.rw)}</span></div><div class="bar"><i style="width:${Math.min(100,q.p/d.n*100)}%"></i></div><div class="fine mono">${fmtQ(q,d)}</div></div>`}).join('');
}
let lastQHud=0;
function updateQuestHud(){
  const rows=SV.daily.map(q=>{const d=questDef(q.id);if(!d)return'';return `<div class="q ${q.done?'done':''}"><div class="row"><span>${d.txt}</span><span class="mono">${q.done?'✓':Math.floor(q.p/(d.unit==='m'?1000:1)*(d.unit==='m'?1:1))}</span></div><div class="bar"><i style="width:${Math.min(100,q.p/d.n*100)}%"></i></div></div>`}).join('');
  $('#quests').innerHTML='<div class="lab">Quêtes du jour</div>'+rows;
}
function renderNavigationHud(){
  const el=$('#navTarget');
  if(!navTarget||navTarget.type==='delivery'){el.hidden=true;return}
  const distance=Math.hypot(navTarget.x-P.x,navTarget.z-P.z);
  const angle=angDiff(P.h,Math.atan2(navTarget.x-P.x,navTarget.z-P.z));
  el.hidden=false;
  el.innerHTML=`<div class="t">Navigation · ${navTarget.name}</div><div class="s">➤ ${Math.round(distance)} m · direction ${Math.round(((angle*180/Math.PI+360)%360))}°</div>`;
}

/* ---------- HUD ---------- */
function updateHud(dt){
  const o=curOwned(),sc=SC_BY_ID[SV.cur];
  $('#money').textContent=fmtEur(SV.money);
  $('#scName').textContent=sc.name;
  $('#battBar').style.width=(o.bat*100)+'%';$('#battBar').style.background=o.bat<0.15?'var(--red)':o.bat<0.4?'var(--gold)':'var(--green)';
  $('#battTxt').textContent=Math.round(o.bat*100)+' %';
  $('#speed').textContent=Math.round(indicatedKmh(P.spd));
  const w=GAME.wanted,stars=$('#stars');stars.classList.toggle('hot',w>0);
  [...stars.querySelectorAll('span')].forEach((s,i)=>s.classList.toggle('on',i<w));
  $('#starLab').textContent=w>0?'Recherché':'Calme';
  $('#radar').textContent=w>0?(GAME.seen?'Repéré':'Hors de vue : '+Math.max(0,Math.ceil(COPS.lvl[w].lose-GAME.unseen))+' s'):'';
  $('#arrest').hidden=GAME.arrest<=0.02;$('#arrestBar').style.width=(GAME.arrest*100)+'%';
  /* invite */
  let pr='';
  const g=nearGarage();
  if(CR.on)pr='<div class="keyhint">'+(CR.phase==='walk'?'<kbd>Z</kbd> <kbd>Q</kbd> <kbd>D</kbd> Retourne à ta trottinette pour la relever (<kbd>Maj</kbd> courir)':CR.phase==='lift'?'Tu relèves ta trottinette…':'Chute !')+'</div>';
  else if(g)pr='<div class="keyhint"><kbd>E</kbd> '+g.name+'</div>';
  else if(!JOB)pr='<div class="keyhint"><kbd>T</kbd> Téléphone · livraisons</div>';
  if(o.bat<0.15&&!g)pr+='<div class="keyhint" style="color:var(--red)">Batterie faible : va dans un garage</div>';
  const pe=$('#prompt');if(pe.dataset.v!==pr){pe.innerHTML=pr;pe.dataset.v=pr}
  /* livraison */
  const dv=$('#deliv');
  if(JOB){
    const tx=JOB.stage==='pickup'?JOB.px:JOB.dx,tz=JOB.stage==='pickup'?JOB.pz:JOB.dz,d=Math.hypot(tx-P.x,tz-P.z);
    const rel=angDiff(P.h,Math.atan2(tx-P.x,tz-P.z));
    dv.hidden=false;
    dv.innerHTML=`<div class="t">${JOB.stage==='pickup'?'Récupérer le colis':'Livrer le colis'}</div><div class="d"><svg id="navArrow" viewBox="0 0 34 34" style="transform:rotate(${-rel}rad)"><path d="M17 3 L28 29 L17 23 L6 29 Z" fill="${JOB.stage==='pickup'?'#4db8ff':'#ffc83d'}"/></svg><div><div class="big">${Math.round(d)} m</div><div class="s">${JOB.stage==='drop'?'Temps : '+Math.ceil(JOB.time)+' s · '+fmtEur(JOB.pay)+' + bonus':'Paiement : '+fmtEur(JOB.pay)}</div></div></div>`;
  }else{dv.hidden=true}
  renderNavigationHud();
  lastQHud-=dt;if(lastQHud<=0){updateQuestHud();lastQHud=0.5}
}
function nearGarage(){if(CR.on)return null;for(const g of GARAGES)if(Math.hypot(P.x-g.x,P.z-g.z)<12&&P.spd<9)return g;return null}
function setNavDestination(destination){
  navTarget={name:destination.name,x:destination.x,z:destination.z,type:destination.type};
  renderNavigationHud();
  toast('Itinéraire défini : '+destination.name,'good');
}

/* ---------- cartes ---------- */
const mini=$('#mini'),mctx=mini.getContext('2d');
function drawMini(){
  const c=mctx,Z=1.35,st=curStats(),show=st.radar||GAME.wanted>0;
  c.clearRect(0,0,352,352);c.save();c.translate(176,176);c.rotate(P.h-Math.PI);c.scale(Z,Z);c.translate(-P.x,-P.z);
  c.drawImage(mapBG,-60,-60,1320,1320);
  c.fillStyle='#3fd99a';for(const g of GARAGES)c.fillRect(g.x-5,g.z-5,10,10);
  if(JOB){const tx=JOB.stage==='pickup'?JOB.px:JOB.dx,tz=JOB.stage==='pickup'?JOB.pz:JOB.dz;c.fillStyle=JOB.stage==='pickup'?'#4db8ff':'#ffc83d';c.beginPath();c.arc(tx,tz,7,0,7);c.fill()}
  if(navTarget){c.fillStyle=navTarget.type==='delivery'?'#ffc83d':'#ff4d5a';c.beginPath();c.arc(navTarget.x,navTarget.z,7,0,7);c.fill()}
  for(const u of vehicles){
    const police=u.mode!=='civ';
    if(police&&(!show||(u.mode==='patrol'&&!st.radar)))continue;
    c.save();c.translate(u.x,u.z);c.rotate(-u.h);
    if(police){
      c.fillStyle=u.mode==='patrol'||Math.floor(GAME.t*4)%2?'#ff4d5a':'#3d7bff';
      c.fillRect(-3.5,-6,7,12);
    }else{
      c.fillStyle='#d7e2eb';
      c.fillRect(-2.5,-4.5,5,9);
    }
    c.restore();
  }
  if(GAME.wanted>0)for(const h of helis){c.fillStyle='#ffd24a';c.fillRect(h.x-4,h.z-4,8,8)}
  c.restore();
  c.fillStyle='#fff';c.beginPath();c.moveTo(176,162);c.lineTo(168,184);c.lineTo(176,179);c.lineTo(184,184);c.closePath();c.fill();
}
function drawFullMap(){
  const cv=$('#fullMap');if(!cv)return;const c=cv.getContext('2d'),S=cv.width,k=S/1320;
  c.clearRect(0,0,S,S);c.drawImage(mapBG,0,0,S,S);
  const X=v=>(v+60)*k;
  c.fillStyle='#3fd99a';for(const g of GARAGES)c.fillRect(X(g.x)-5,X(g.z)-5,10,10);
  if(JOB){const tx=JOB.stage==='pickup'?JOB.px:JOB.dx,tz=JOB.stage==='pickup'?JOB.pz:JOB.dz;c.fillStyle=JOB.stage==='pickup'?'#4db8ff':'#ffc83d';c.beginPath();c.arc(X(tx),X(tz),6,0,7);c.fill()}
  if(navTarget){c.fillStyle=navTarget.type==='delivery'?'#ffc83d':'#ff4d5a';c.beginPath();c.arc(X(navTarget.x),X(navTarget.z),7,0,7);c.fill()}
  c.save();c.translate(X(P.x),X(P.z));c.rotate(-P.h+Math.PI);c.fillStyle='#fff';c.beginPath();c.moveTo(0,-9);c.lineTo(-6,8);c.lineTo(0,4);c.lineTo(6,8);c.closePath();c.fill();c.restore();
}

/* ---------- menus ---------- */
let menuTab='quetes',garTab='boutique';
function openMenu(tab){
  if(GAME.state!=='play'&&GAME.state!=='menu2')return;
  GAME.state='menu2';menuTab=tab||menuTab;$('#ovMenu').hidden=false;renderMenu();
}
function closeMenu(){$('#ovMenu').hidden=true;if(GAME.state==='menu2')GAME.state='play'}
function renderMenu(){
  const tabs=[['quetes','Quêtes'],['carte','Carte'],['aide','Aide'],['reglages','Réglages']];
  $('#menuTabs').innerHTML=tabs.map(t=>`<button class="tab ${t[0]===menuTab?'on':''}" data-t="${t[0]}">${t[1]}</button>`).join('');
  const b=$('#menuBody');
  if(menuTab==='quetes'){
    const dl=DAYLEN-((SV.time||0)%DAYLEN),wl=(7-dayNum()%7-1)*DAYLEN+dl;
    b.innerHTML=`<div class="row2"><div><h3>Quotidiennes <span class="fine mono">· jour ${dayNum()+1} · reset dans ${Math.floor(dl/60)}:${String(Math.floor(dl%60)).padStart(2,'0')}</span></h3>${questRows(SV.daily)}</div><div><h3>Hebdomadaires <span class="fine mono">· reset dans ${Math.floor(wl/60)} min</span></h3>${questRows(SV.weekly)}</div></div><p class="fine">Un jour dure 6 minutes de jeu, une semaine 7 jours. Les récompenses sont versées automatiquement.</p>`;
  }else if(menuTab==='carte'){
    b.innerHTML='<canvas id="fullMap" width="640" height="640"></canvas><div class="legend"><span>⬜ Toi</span><span style="color:var(--green)">■ Garage</span><span style="color:var(--accent)">● Colis</span><span style="color:var(--gold)">● Livraison</span></div>'+
      '<div class="legend">'+Object.values(DISTRICTS).map(d=>`<span>${d.name} · ${d.limit} km/h</span>`).join('')+'</div>';drawFullMap();
  }else if(menuTab==='aide'){
    b.innerHTML=`<div class="keys"><span><kbd>Z</kbd><kbd>Q</kbd><kbd>S</kbd><kbd>D</kbd> / flèches</span><span>Conduire (accélérer, tourner, freiner et reculer)</span>
    <span><kbd>Maj</kbd></span><span>Activer ou arrêter le wheelie ; accélérer pour lever l’avant, freiner pour le baisser</span>
    <span><kbd>Espace</kbd></span><span>Frein arrière, pour déraper</span><span><kbd>E</kbd></span><span>Entrer dans un garage proche (boutique, atelier, recharge)</span>
    <span><kbd>T</kbd></span><span>Téléphone : carte, livraisons, garages et trottinettes</span><span><kbd>C</kbd></span><span>Caméra 3e ou 1re personne (clic + glisser : tourner autour)</span><span><kbd>M</kbd></span><span>Carte de pause</span><span><kbd>N</kbd></span><span>Couper le son</span><span><kbd>Tab</kbd> / <kbd>Échap</kbd></span><span>Quêtes et pause</span></div>
    <h3 style="margin-top:16px">Police</h3><p class="fine">Griller un feu rouge ou dépasser la limite de plus de 6 km/h devant une patrouille (rayon d’environ 55 m, sans mur entre vous) te fait rechercher. Reste hors de vue 15 secondes pour la semer.<br>Niveau 1 : 2 voitures. Niveau 2 : 3 voitures plus rapides. Niveau 3 : 4 voitures, 1 fourgon, 1 blindé et 1 hélicoptère. Si une unité te touche à faible vitesse, tu es arrêté et tu paies une amende de 50 €.</p>`;
  }else{
    b.innerHTML=`<p>Progression enregistrée dans ce navigateur.</p><div class="sp"><button class="btn ghost" id="btnMute">${muted?'Réactiver le son':'Couper le son'}</button><button class="btn gold" id="btnTestMoney">+1 000 € (test)</button><button class="btn ghost" id="btnReset">Effacer la progression</button></div><p class="fine">Le bouton de test ajoute 1 000 € à ta sauvegarde.</p><p class="fine" id="resetMsg"></p>`;
  }
}
let resetArm=false;
$('#menuTabs').addEventListener('click',e=>{const t=e.target.closest('[data-t]');if(t){menuTab=t.dataset.t;renderMenu()}});
$('#menuBody').addEventListener('click',e=>{
  if(e.target.id==='btnMute'){muted=!muted;renderMenu()}
  if(e.target.id==='btnTestMoney'){SV.money+=1000;markSave();saveNow();renderMenu();toast('+1 000 € ajoutés (test)','good')}
  if(e.target.id==='btnReset'){
    if(!resetArm){resetArm=true;e.target.textContent='Confirmer l’effacement';$('#resetMsg').textContent='Clique encore une fois pour tout effacer.';setTimeout(()=>resetArm=false,4000)}
    else{try{localStorage.removeItem(SAVE_KEY)}catch(err){}SV=defaultSave();ensureQuests();saveNow();const g=GARAGES[0];respawnAt(g.x+6,g.z+4,Math.PI/2);resetArm=false;renderMenu();toast('Progression effacée','dim')}
  }
});
$('#menuClose').onclick=closeMenu;

/* ---------- téléphone ---------- */
let phoneApp='home';
const PHONE_APPS={
  carte:{title:'Cartes',icon:'🗺️'},
  livraison:{title:'Livraisons',icon:'📦'},
  trottinettes:{title:'Trottinettes',icon:'🛴'},
  garage:{title:'Garages',icon:'🔧'}
};
function openPhone(){
  if(GAME.state!=='play')return;
  GAME.state='phone';phoneApp='home';$('#ovPhone').hidden=false;renderPhone();
}
function closePhone(){
  $('#ovPhone').hidden=true;
  if(GAME.state==='phone'){GAME.state='play';renderNavigationHud()}
}
function renderPhone(){
  const body=$('#phoneBody');
  const title=$('#phoneTitle');
  const hour=Math.floor((GAME.clock/60)%24),minute=Math.floor(GAME.clock%60);
  $('#phoneClock').textContent=String(hour).padStart(2,'0')+':'+String(minute).padStart(2,'0');
  if(phoneApp==='home'){
    title.textContent='Téléphone';
    body.innerHTML='<div class="phone-home">'+Object.entries(PHONE_APPS).map(([id,app])=>`<button class="phone-app" data-phone-app="${id}"><span class="phone-icon">${app.icon}</span><span>${app.title}</span></button>`).join('')+'</div>';
  }else{
    title.textContent=PHONE_APPS[phoneApp].title;
    let content='';
    if(phoneApp==='carte'){
      content='<canvas id="fullMap" class="phone-map" width="640" height="640"></canvas><h3>Choisir une destination</h3><div class="phone-list">'+NAV_DESTINATIONS.map((d,i)=>{
        const selected=navTarget&&navTarget.x===d.x&&navTarget.z===d.z;
        return `<div class="phone-row"><div><strong>${d.name}</strong><div class="ds">${d.type==='garage'?'Garage · '+Math.round(Math.hypot(d.x-P.x,d.z-P.z))+' m':'Lieu · '+Math.round(Math.hypot(d.x-P.x,d.z-P.z))+' m'}</div></div><button class="btn sm ${selected?'ghost':''}" data-phone-dest="${i}">${selected?'Itinéraire actif':'Y aller'}</button></div>`;
      }).join('')+'</div><div class="sp"><button class="btn ghost sm" data-phone-clear-nav>Effacer l’itinéraire</button></div>';
    }else if(phoneApp==='livraison'){
      if(JOB){
        const target=JOB.stage==='pickup'?'Point de retrait':'Point de livraison';
        const remaining=JOB.stage==='drop'?` · ${Math.ceil(JOB.time)} s restantes`:'';
        content=`<div class="phone-status"><h3>Livraison en cours</h3><p>${target}${remaining}</p><p>Récompense : ${fmtEur(JOB.pay)} · ${Math.round(JOB.dist)} m</p></div><button class="btn gold" data-phone-cancel-job>Annuler la livraison</button>`;
      }else{
        content=`<div class="phone-status"><h3>Aucune livraison en cours</h3><p>Récupère un colis puis livre-le dans le temps imparti pour gagner de l’argent.</p><p>Livraisons terminées : ${SV.deliv}</p></div><button class="btn" data-phone-start-job>Lancer une livraison</button>`;
      }
    }else if(phoneApp==='trottinettes'){
      const owned=SCOOTERS.filter(s=>SV.owned[s.id]);
      content='<div class="phone-list">'+owned.map(s=>{
        const current=SV.cur===s.id,o=SV.owned[s.id];
        const speed=Math.round(indicatedKmh(statsOf(s.id,o.up).vmax));
        return `<div class="phone-row"><div><strong>${s.name}${current?' · Équipée':''}</strong><div class="ds">${speed} km/h · Batterie ${Math.round(o.bat*100)} % · Autonomie ${s.range} km</div></div>${current?'<span class="tag ok">En cours</span>':`<button class="btn sm" data-phone-equip="${s.id}">Équiper</button>`}</div>`;
      }).join('')+'</div><p class="fine">Les nouvelles trottinettes s’achètent dans la boutique d’un garage.</p>';
    }else{
      content='<div class="phone-list">'+GARAGES.map((g,i)=>{
        const distance=Math.round(Math.hypot(P.x-g.x,P.z-g.z)),near=nearGarage()===g;
        return `<div class="phone-row"><div><strong>${g.name}</strong><div class="ds">${distance} m${near?' · À proximité':''}</div></div><button class="btn sm ${near?'gold':''}" ${near?'data-phone-enter="'+i+'"':'data-phone-dest="'+i+'"'}>${near?'Entrer':'Y aller'}</button></div>`;
      }).join('')+'</div>';
    }
    body.innerHTML='<div class="sp" style="margin:0 0 12px"><button class="btn ghost sm" data-phone-back>‹ Accueil</button></div>'+content;
    if(phoneApp==='carte')drawFullMap();
  }
}
$('#phoneBody').addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t)return;
  if(t.dataset.phoneApp){phoneApp=t.dataset.phoneApp;renderPhone()}
  else if(t.hasAttribute('data-phone-back')){phoneApp='home';renderPhone()}
  else if(t.dataset.phoneDest!==undefined){setNavDestination(NAV_DESTINATIONS[Number(t.dataset.phoneDest)]);renderPhone()}
  else if(t.hasAttribute('data-phone-clear-nav')){navTarget=null;renderNavigationHud();toast('Itinéraire effacé','dim');renderPhone()}
  else if(t.hasAttribute('data-phone-start-job')){startJob();renderPhone()}
  else if(t.hasAttribute('data-phone-cancel-job')){cancelJob();renderPhone()}
  else if(t.dataset.phoneEquip){
    SV.cur=t.dataset.phoneEquip;curOwned().bat=1;rebuildPlayer();markSave();renderPhone();
    toast(SC_BY_ID[SV.cur].name+' équipée','good');
  }else if(t.dataset.phoneEnter!==undefined){
    const g=GARAGES[Number(t.dataset.phoneEnter)];closePhone();openGarage(g);
  }
});
$('#phoneClose').onclick=closePhone;
$('#ovPhone').addEventListener('click',e=>{if(e.target===$('#ovPhone'))closePhone()});

/* ---------- garage ---------- */
function openGarage(g){
  if(GAME.state!=='play')return;
  GAME.state='garage';SV.garage=GARAGES.indexOf(g);curOwned().bat=1;markSave();
  $('#garTitle').textContent=g.name;$('#ovGarage').hidden=false;renderGarage();
}
function closeGarage(){$('#ovGarage').hidden=true;GAME.state='play';saveNow()}
function specBars(s){
  const st=statsOf(s.id,SV.owned[s.id]?SV.owned[s.id].up:{brake:0,tires:0,battery:0,screen:0,motor:0});
  const r=(l,v,m,u)=>`<div class="spec"><span>${l}</span><div class="bar"><i style="width:${Math.min(100,v/m*100)}%;background:var(--accent)"></i></div><span class="v">${u}</span></div>`;
  const indicatedTop=indicatedKmh(st.vmax);
  return r('Vitesse',indicatedTop,120,Math.round(indicatedTop)+' km/h')+r('Accél.',st.acc,18,st.acc.toFixed(1))+r('Freinage',st.brake,44,st.brake.toFixed(1))+r('Autonomie',st.range,50,Math.round(st.range)+' km');
}
function renderGarage(){
  $('#garMoney').textContent=fmtEur(SV.money);
  const tabs=[['boutique','Boutique KUKIRIN'],['atelier','Atelier'],['repos','Garage']];
  $('#garTabs').innerHTML=tabs.map(t=>`<button class="tab ${t[0]===garTab?'on':''}" data-g="${t[0]}">${t[1]}</button>`).join('');
  const b=$('#garBody');
  if(garTab==='boutique'){
    b.innerHTML='<div class="grid">'+SCOOTERS.map(s=>{
      const own=SV.owned[s.id],cur=SV.cur===s.id;
      return `<div class="item ${cur?'cur':''}"><div class="nm"><span>${s.name}</span><span class="sw" style="background:${own?own.color:s.color}"></span></div><div class="ds">${s.desc}</div>${specBars(s)}<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">${own?(cur?'<span class="tag ok">Équipée</span>':'<span class="tag">Possédée</span>'):`<span class="price">${fmtEur(s.price)}</span>`}${own?(cur?'':`<button class="btn sm" data-eq="${s.id}">Équiper</button>`):`<button class="btn sm gold" data-buy="${s.id}" ${SV.money<s.price?'disabled':''}>Acheter</button>`}</div></div>`}).join('')+'</div>';
  }else if(garTab==='atelier'){
    const sc=SC_BY_ID[SV.cur],o=curOwned();
    b.innerHTML=`<div class="row2"><div><h3>${sc.name}</h3>${specBars(sc)}<h3 style="margin-top:14px">Peinture</h3><div class="swatches">${PAINTS.map(c=>`<button data-paint="${c}" class="${o.color===c?'on':''}" style="background:${c}" aria-label="Couleur ${c}"></button>`).join('')}</div></div><div class="ups">${UPS.map(u=>{const l=o.up[u.k],max=l>=3,cost=max?0:upCost(sc,u.k,l);
      return `<div class="up"><div><div style="font:700 18px/1 var(--display);letter-spacing:.08em;text-transform:uppercase">${u.name}${max?'':' · '+u.lv[l]}</div><div class="pips">${[0,1,2].map(i=>`<i class="${i<l?'on':''}"></i>`).join('')}</div><div class="fine">${u.fx}</div></div>${max?'<span class="tag ok">Max</span>':`<button class="btn sm gold" data-up="${u.k}" ${SV.money<cost?'disabled':''}>${fmtEur(cost)}</button>`}</div>`}).join('')}</div></div>`;
  }else{
    const o=curOwned();
    b.innerHTML=`<div class="item" style="max-width:480px"><div class="nm"><span>${SC_BY_ID[SV.cur].name}</span><span class="tag ok">Batterie ${Math.round(o.bat*100)} %</span></div><div class="ds">La batterie est rechargée à chaque passage au garage. Ton dernier garage visité est ton point de retour après une arrestation.</div><div class="ds mono">Livraisons : ${SV.deliv} · Distance : ${fmtKm(SV.km)} · Arrestations : ${SV.busted} · Fuites réussies : ${SV.escapes}</div></div>`;
  }
}
$('#garTabs').addEventListener('click',e=>{const t=e.target.closest('[data-g]');if(t){garTab=t.dataset.g;renderGarage()}});
$('#garBody').addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t)return;
  if(t.dataset.buy){const s=SC_BY_ID[t.dataset.buy];if(SV.money>=s.price){SV.money-=s.price;SV.owned[s.id]={up:{brake:0,tires:0,battery:0,screen:0,motor:0},color:s.color,bat:1};SV.cur=s.id;rebuildPlayer();beep(880,0.15,'triangle',0.08);toast(s.name+' achetée !','good')}}
  else if(t.dataset.eq){SV.cur=t.dataset.eq;curOwned().bat=1;rebuildPlayer()}
  else if(t.dataset.paint){curOwned().color=t.dataset.paint;playerMesh.userData.accent.color.set(t.dataset.paint)}
  else if(t.dataset.up){const sc=SC_BY_ID[SV.cur],o=curOwned(),l=o.up[t.dataset.up],c=upCost(sc,t.dataset.up,l);if(l<3&&SV.money>=c){SV.money-=c;o.up[t.dataset.up]++;beep(700,0.12,'triangle',0.08)}}
  markSave();renderGarage();
});
$('#garClose').onclick=closeGarage;
$('#bustBtn').onclick=()=>{$('#ovBusted').hidden=true;GAME.state='play'};

function rebuildPlayer(){
  if(playerMesh){endCrash();scene.remove(playerMesh);disposeScooter(playerMesh)}
  playerMesh=buildScooter(SV.cur,curOwned().color);scene.add(playerMesh);
}

function disposeScooter(model){
  const geometries=new Set(),materials=new Set(),textures=new Set();
  const shared=new Set([matDark,matMetal,matTire,matHead,matTail,matSkin,matJacket,matPants]);
  model.traverse(obj=>{
    if(!obj.isMesh)return;
    if(obj.geometry)geometries.add(obj.geometry);
    for(const material of Array.isArray(obj.material)?obj.material:[obj.material])if(material)materials.add(material);
  });
  for(const geometry of geometries)geometry.dispose();
  for(const material of materials){
    if(shared.has(material))continue;
    if(material.map)textures.add(material.map);
    material.dispose();
  }
  for(const texture of textures)texture.dispose();
}

/* ---------- entrées ---------- */
window.addEventListener('keydown',e=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].includes(e.key))e.preventDefault();
  const k=e.key.length===1?e.key.toLowerCase():e.key.toLowerCase();KEYS[k]=true;
  /* Maj : le pilote tire sur le guidon et lève l'avant */
  if(k==='shift'&&GAME.state==='play'&&!e.repeat&&!CR.on&&P.wheelie<0.2)P.wv=Math.max(P.wv,3.3);
  if(e.repeat)return;initAudio();
  if(GAME.state==='play'){
    if(k==='e'){const g=nearGarage();if(g)openGarage(g)}
    else if(k==='t')openPhone();
    else if(k==='c')GAME.cam=1-GAME.cam;
    else if(k==='m')openMenu('carte');
    else if(k==='tab')openMenu('quetes');
    else if(k==='escape')openMenu('quetes');
    else if(k==='n')muted=!muted;
  }else if(GAME.state==='menu2'){if(k==='escape'||k==='tab'||(k==='m'&&menuTab==='carte'))closeMenu()}
  else if(GAME.state==='garage'){if(k==='escape'||k==='e')closeGarage()}
  else if(GAME.state==='phone'){if(k==='escape'||k==='t')closePhone()}
});
window.addEventListener('keyup',e=>{KEYS[e.key.toLowerCase()]=false});
window.addEventListener('blur',()=>{for(const k in KEYS)KEYS[k]=false});
[['tL','_left'],['tR','_right'],['tA','_gas'],['tB','_brake']].forEach(([id,k])=>{
  const el=$('#'+id);const on=e=>{e.preventDefault();KEYS[k]=true;initAudio()},off=e=>{e.preventDefault();KEYS[k]=false};
  el.addEventListener('pointerdown',on);el.addEventListener('pointerup',off);el.addEventListener('pointercancel',off);el.addEventListener('pointerleave',off);
});

/* ---------- caméra ---------- */
let camPos=new THREE.Vector3(),camInit=false;
/* vue 3e personne : clic gauche + glisser pour tourner autour de la trottinette */
const orb={yaw:0,pitch:0,drag:false,lx:0,ly:0,idle:9,id:null};
canvas.classList.add('orbit');
canvas.addEventListener('pointerdown',e=>{if(GAME.state!=='play'||GAME.cam===1||e.button!==0)return;orb.drag=true;orb.id=e.pointerId;orb.lx=e.clientX;orb.ly=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.classList.add('drag');e.preventDefault()});
canvas.addEventListener('pointermove',e=>{if(!orb.drag||e.pointerId!==orb.id)return;orb.yaw-=(e.clientX-orb.lx)*.006;orb.pitch=clamp(orb.pitch+(e.clientY-orb.ly)*.005,-.3,1.1);orb.yaw=Math.atan2(Math.sin(orb.yaw),Math.cos(orb.yaw));orb.lx=e.clientX;orb.ly=e.clientY;orb.idle=0});
const orbEnd=e=>{if(e.pointerId!==orb.id)return;orb.drag=false;orb.idle=0;canvas.classList.remove('drag')};
canvas.addEventListener('pointerup',orbEnd);canvas.addEventListener('pointercancel',orbEnd);
function updateCamera(dt){
  const sp=P.spd,kmh=sp*3.6,fp=GAME.cam===1&&!CR.on;
  document.body.classList.toggle('first-person',fp);
  playerMesh.userData.displayMesh.visible=fp;
  /* cap de la caméra : suit le cap, et regarde vers la trajectoire pendant un drift */
  if(!CR.on||CR.phase==='walk'||CR.phase==='lift'){
    let tgt=P.h;
    if(!CR.on&&sp>4&&P.vx*Math.sin(P.h)+P.vz*Math.cos(P.h)>0)tgt=P.h+clamp(angDiff(P.h,Math.atan2(P.vx,P.vz)),-0.7,0.7)*0.55;
    P.camH+=angDiff(P.camH,tgt)*Math.min(1,dt*(CR.on?3:6));
  }
  if(!fp){
    const sh=Math.sin(P.camH),ch=Math.cos(P.camH);
    const back=4.4+sp*0.08,height=1.95+sp*0.025;
    /* orbite souris : revient doucement derrière la trottinette après 1,5 s sans glisser */
    if(!orb.drag){orb.idle+=dt;if(orb.idle>1.5){const f=Math.exp(-dt*2.5);orb.yaw*=f;orb.pitch*=f}}
    const a=P.camH+orb.yaw,R=Math.hypot(back,height-0.9),e=Math.atan2(height-0.9,back)+orb.pitch;
    const tx=P.x-Math.sin(a)*Math.cos(e)*R,tz=P.z-Math.cos(a)*Math.cos(e)*R,ty=Math.max(0.4,0.9+Math.sin(e)*R);
    if(!camInit){camPos.set(tx,ty,tz);camInit=true}
    const k=1-Math.exp(-dt*(orb.drag?30:9));camPos.x+=(tx-camPos.x)*k;camPos.z+=(tz-camPos.z)*k;camPos.y+=(ty-camPos.y)*k;
    camera.position.copy(camPos);
    /* en orbite on vise la trottinette plutôt que la route devant */
    const lookAhead=(8+sp*0.5)*(1-clamp(Math.abs(orb.yaw)/.6+Math.abs(orb.pitch)/.6,0,1));
    camera.lookAt(P.x+sh*lookAhead,1.25,P.z+ch*lookAhead);
    camera.fov=lerp(camera.fov,62+clamp(kmh*0.3,0,31),dt*3);
    playerMesh.userData.rider.visible=true;
  }else{
    const sh=Math.sin(P.h),ch=Math.cos(P.h);
    const eyeBack=0.22+Math.sin(P.wheelie)*0.25;
    camera.position.set(P.x-sh*eyeBack,1.88+Math.sin(P.wheelie)*0.08,P.z-ch*eyeBack);
    const lookAhead=22+sp*0.12;
    const pitch=Math.atan2(camera.position.y-1.48,lookAhead)-P.wheelie*0.35;
    camera.rotation.set(-pitch,P.h+Math.PI,-P.steer*0.07*Math.min(1,sp/10)-P.lean*0.3,'YXZ');
    camera.fov=lerp(camera.fov,70+clamp(kmh*0.2,0,24),dt*3);
    playerMesh.userData.rider.visible=false;
  }
  camera.updateProjectionMatrix();
  sun.position.set(P.x+SUN_OFF.x,SUN_OFF.y,P.z+SUN_OFF.z);sun.target.position.set(P.x,0,P.z);sun.target.updateMatrixWorld();
}
function updatePlayerMesh(dt){
  const m=playerMesh,d=m.userData,tl=d.tilt;
  if(CR.on){
    /* trottinette couchée sur le flanc pendant la chute */
    m.position.set(CR.sx,-Math.abs(Math.sin(CR.roll))*d.wheelR*0.68,CR.sz);m.rotation.y=CR.sh;
    tl.rotation.set(0,0,CR.roll);
    const ws=Math.hypot(CR.svx,CR.svz);for(const w of d.wheels)w.rotation.x+=ws*dt/(w.userData.r||0.27);
    return;
  }
  m.position.set(P.x,0,P.z);m.rotation.y=P.h;
  /* inclinaison : suit l'accélération latérale réelle */
  const target=-clamp(P.yr*P.spd*0.021,-0.5,0.5)*(1-P.wheelie*0.5);
  P.lean+=(target-P.lean)*Math.min(1,dt*8);
  P.wob=Math.max(0,P.wob-dt*1.5);
  tl.rotation.z=P.lean+Math.sin(GAME.t*30)*0.06*P.wob;
  tl.rotation.x=-P.wheelie;
  /* wheelie : le pilote bascule avec la trottinette, pieds sur le plateau et mains sur le guidon */
  for(const w of d.wheels)w.rotation.x+=P.spd*dt/(w.userData.r||0.27)*(Math.sign(P.vx*Math.sin(P.h)+P.vz*Math.cos(P.h))||1);
  const display=m.userData.display,dg=m.userData.dg,displaySpeed=Math.round(indicatedKmh(P.spd));
  if(display&&dg&&m.userData.displayedSpeed!==displaySpeed){
    dg.fillStyle='#07131b';dg.fillRect(0,0,256,128);
    dg.fillStyle='#72e5ff';dg.font='bold 76px monospace';dg.textAlign='center';dg.textBaseline='middle';
    dg.fillText(String(displaySpeed),128,59);
    dg.fillStyle='#d6f5ff';dg.font='bold 25px monospace';dg.fillText('km/h',128,108);
    m.userData.displayTexture.needsUpdate=true;
    m.userData.displayedSpeed=displaySpeed;
  }
}

/* ---------- boucle ---------- */
let last=0,saveT=0,visitSet={};
function frame(ts){
  requestAnimationFrame(frame);
  const dt=Math.min(0.05,(ts-last)/1000||0.016);last=ts;
  if(GAME.state==='play'){
    GAME.t+=dt;GAME.clock+=dt;SV.time=(SV.time||0)+dt;
    ensureQuests();
    stepPlayer(dt);stepVehicles(dt);if(GAME.state==='play')stepOfficers(dt);if(GAME.state==='play')manageCops(dt);stepFx(dt);stepCoins(GAME.t);stepJob(dt);
    const dk=districtAt(P.x,P.z);if(!SV.visited)SV.visited={};if(!SV.visited[dk]){SV.visited[dk]=1;qev('district',1)}
    flushEvents();updateHud(dt);drawMini();updateAudio(P.spd,GAME.wanted,GAME.t);
    saveT+=dt;if(saveT>4||saveDirty&&saveT>1.5){saveT=0;saveNow()}
  }else if(GAME.state==='menu'){GAME.clock+=dt;GAME.t+=dt;stepVehicles(dt);const a=GAME.t*0.12;camera.position.set(300+Math.cos(a)*90,45,300+Math.sin(a)*90);camera.lookAt(300,5,300);if(coinMesh)stepCoins(GAME.t)}
  else if(GAME.state==='menu2'||GAME.state==='garage'||GAME.state==='phone'||GAME.state==='busted'){GAME.clock+=dt*0.0;updateAudio(0,0,0)}
  if(playerMesh&&GAME.state!=='menu'){updatePlayerMesh(dt);if(GAME.state==='play')updateCamera(dt)}
  renderer.render(scene,camera);
}

/* ---------- démarrage ---------- */
function boot(){
  buildWorld();initTraffic(70);initCoins();rebuildPlayer();
  for(let i=0;i<2;i++)spawnCop('cop','patrol');
  ensureQuests();
  playerMesh.visible=false;
  const had=hasSave();
  const b=$('#startBtns');
  b.innerHTML=`<button class="btn" id="btnPlay">${had?'Continuer':'Jouer'}</button>`+(had?'<button class="btn ghost" id="btnNew">Nouvelle partie</button>':'');
  const startGame=()=>{
    initAudio();$('#ovStart').hidden=true;$('#hud').hidden=false;playerMesh.visible=true;
    const g=GARAGES[SV.garage||0];respawnAt(g.x+6,g.z+4,Math.PI/2);camInit=false;GAME.state='play';saveNow();
  };
  $('#btnPlay').onclick=startGame;
  const nb=$('#btnNew');if(nb)nb.onclick=()=>{SV=defaultSave();ensureQuests();startGame()};
  requestAnimationFrame(frame);
}
GAME.state='menu';
boot();
window.__game={GAME,P,SV,CR,KEYS,vehicles,helis,officers,get JOB(){return JOB},setWanted,stepPlayer,stepVehicles,stepOfficers,manageCops,updatePlayerMesh,fall,tryRoadblock};
