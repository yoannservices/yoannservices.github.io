'use strict';
/* ===== Utilitaires ===== */
const V3=THREE.Vector3,Q4=THREE.Quaternion;
const clamp=(x,a,b)=>x<a?a:x>b?b:x, lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const approach=(c,t,d)=>c<t?Math.min(c+d,t):Math.max(c-d,t);
const $=id=>document.getElementById(id);
function hash2(x,y){const h=Math.sin(x*127.1+y*311.7)*43758.5453;return h-Math.floor(h)}
function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const a=hash2(xi,yi),b=hash2(xi+1,yi),c=hash2(xi,yi+1),d=hash2(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fbm(x,y,o){let s=0,a=.5,f=1;for(let i=0;i<o;i++){s+=a*vnoise(x*f,y*f);f*=2.03;a*=.5}return s}
let seed=12345;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};

/* ===== Monde ===== */
const SIZE=40000,N=512,CELL=SIZE/N,HALF=SIZE/2,NV=N+1;
const AIRPORTS=[
 {id:'azur',name:'Port-Azur',x:-11000,z:-1500,hdg:0,len:1900,fixed:7,
  desc:'Piste côtière au niveau de la mer. L\'océan à l\'ouest, les collines à l\'est.'},
 {id:'pins',name:'Vallée des Pins',x:2500,z:2200,hdg:90,len:1800,fixed:null,
  desc:'Grande plaine boisée. Piste facile pour apprendre à décoller et à atterrir.'},
 {id:'alpin',name:'Haut-Alpin',x:9000,z:-8200,hdg:200,len:1500,fixed:null,
  desc:'Piste d\'altitude dans une vallée entourée de sommets à plus de 2500 m. Air plus mince.'},
 {id:'corail',name:'Île de Corail',x:-11200,z:5300,hdg:45,len:1700,fixed:6,
  desc:'Piste sur une île volcanique, perdue en pleine mer. Aucun autre terrain à proximité.'}
];
const PEAKS=[[11800,-9800,3400,2700],[6300,-10500,3600,2500],[9000,-12800,3600,2900],[13200,-5200,3000,2300],[5200,-5600,3000,1900],
 [1000,-9500,3500,2300],[-2800,-7600,3000,1900],[15200,-1500,2800,2100],[-12700,6700,1300,950],[8200,-3600,2200,1500]];
function landMask(x,z){
  const c1=1-Math.hypot((x-2500)/15500,(z+1500)/12500);
  const c2=1-Math.hypot((x+11500)/3200,(z-5500)/3000);
  const c3=1-Math.hypot((x-14500)/2300,(z-9200)/2000);
  return Math.max(c1,c2,c3)+(fbm(x/5000+3.1,z/5000+7.7,4)-.5)*.34;
}
function rawH(x,z){
  const L=landMask(x,z);
  if(L<=0)return Math.max(L,-1)*170-3;
  const hills=fbm(x/1600+9,z/1600,4);
  let b=15+hills*170;
  let m=0;
  for(const p of PEAKS){const d2=((x-p[0])*(x-p[0])+(z-p[1])*(z-p[1]))/(p[2]*p[2]);if(d2<9){
    const rid=1-Math.abs(2*fbm(x/900+p[0],z/900+p[1],4)-1);m+=p[3]*Math.exp(-d2)*(.55+.9*rid*rid)}}
  const gm=smooth(.28,.8,fbm(x/9000+20,z/9000+5,3));
  const rid2=1-Math.abs(2*fbm(x/2400+40,z/2400,5)-1);
  b+=gm*smooth(.12,.45,L)*1100*rid2*rid2;
  b+=m*smooth(.03,.2,L);
  const dv=Math.hypot(x-9000,z+8200);b=lerp(b,1250+hills*120,Math.exp(-((dv/3000)**2))*.97);
  return lerp(-3,b,smooth(0,.07,L));
}
for(const a of AIRPORTS){
  if(a.fixed!=null)a.elev=a.fixed;
  else{let s=0,n=0;for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++){s+=rawH(a.x+i*250,a.z+j*250);n++}a.elev=Math.max(60,s/n)}
  a.rIn=1000;a.rOut=1950;a.dir=new V3(Math.sin(a.hdg*Math.PI/180),0,-Math.cos(a.hdg*Math.PI/180));
}
function worldH(x,z){
  let h=rawH(x,z);
  for(const a of AIRPORTS){const d=Math.hypot(x-a.x,z-a.z);if(d<a.rOut){h=a.elev+(h-a.elev)*smooth(a.rIn,a.rOut,d)}}
  return h;
}
/* Grille de hauteurs (même maillage que le rendu) */
const HGT=new Float32Array(NV*NV);
function buildHeights(){for(let j=0;j<NV;j++)for(let i=0;i<NV;i++)HGT[j*NV+i]=worldH(-HALF+i*CELL,-HALF+j*CELL)}
function groundH(x,z){ // hauteur exacte du maillage (sans l'eau)
  const gx=(x+HALF)/CELL,gz=(z+HALF)/CELL;
  if(gx<0||gz<0||gx>=N||gz>=N)return -30;
  const i=Math.floor(gx),j=Math.floor(gz),fx=gx-i,fz=gz-j,k=j*NV+i;
  const ha=HGT[k],hb=HGT[k+NV],hc=HGT[k+NV+1],hd=HGT[k+1];
  return fx+fz<=1?ha+(hd-ha)*fx+(hb-ha)*fz:hc+(hb-hc)*(1-fx)+(hd-hc)*(1-fz);
}
const surfH=(x,z)=>Math.max(groundH(x,z),0);
function groundNormal(x,z,out){const e=40;out.set(groundH(x-e,z)-groundH(x+e,z),2*e,groundH(x,z-e)-groundH(x,z+e)).normalize();return out}
function onRunway(x,z){for(const a of AIRPORTS){const dx=x-a.x,dz=z-a.z,al=dx*a.dir.x+dz*a.dir.z,cr=-dx*a.dir.z+dz*a.dir.x;
  if(Math.abs(al)<a.len/2+30&&Math.abs(cr)<28)return a}return null}

/* ===== Rendu, scène ===== */
const canvasGL=$('gl');
const renderer=new THREE.WebGLRenderer({canvas:canvasGL,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(65,1,.5,70000);
scene.fog=new THREE.FogExp2(0xbcd6ea,.000045);
const hemi=new THREE.HemisphereLight(0xbfd9ff,0x5a5a4a,.75);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1d8,1.1);scene.add(sun);scene.add(sun.target);
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

RK.setEnv(renderer,{top:'#2f6fb5',hor:'#dfeaf3',hills:1,hillCol:'#5d6e58',sunU:.3,sunV:.25});

/* Ciel */
const skyU={top:{value:new THREE.Color()},hor:{value:new THREE.Color()},sunDir:{value:new V3(0,1,0)},sunCol:{value:new THREE.Color()},night:{value:0}};
const sky=new THREE.Mesh(new THREE.SphereGeometry(40000,32,16),new THREE.ShaderMaterial({uniforms:skyU,side:THREE.BackSide,depthWrite:false,fog:false,
 vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:`varying vec3 vD;uniform vec3 top,hor,sunDir,sunCol;uniform float night;
 void main(){vec3 d=normalize(vD);float h=clamp(d.y,0.,1.);vec3 c=mix(hor,top,pow(h,.5));
 float s=max(dot(d,sunDir),0.);c+=sunCol*(pow(s,900.)*4.+pow(s,30.)*.4+pow(s,5.)*.14);
 vec3 q=floor(d*300.);float r=fract(sin(dot(q,vec3(12.9898,78.233,37.719)))*43758.5453);
 c+=vec3(step(.9972,r))*night*smoothstep(.03,.3,d.y);
 if(d.y<0.)c=mix(hor,hor*.85,clamp(-d.y*4.,0.,1.));gl_FragColor=vec4(c,1.);}`}));
sky.renderOrder=-10;sky.frustumCulled=false;scene.add(sky);

const TIMES=[
 {top:0x2f6fb5,hor:0xbcd6ea,elev:48,az:120,col:0xfff1d8,int:1.15,hs:0xbfd9ff,hg:0x5a5a4a,hi:.78,dens:.000045,night:0,lights:0},
 {top:0x28365f,hor:0xf0a572,elev:7,az:250,col:0xffb26a,int:1.0,hs:0xffd1a6,hg:0x40344a,hi:.55,dens:.00006,night:.1,lights:.4},
 {top:0x02050d,hor:0x0f1c32,elev:38,az:70,col:0x8fa8ff,int:.55,hs:0x3a5080,hg:0x141a26,hi:.65,dens:.00005,night:1,lights:1}];
let timeIdx=0;
const tmpC=new THREE.Color();
function setTime(i){
  timeIdx=i;const T=TIMES[i];
  skyU.top.value.setHex(T.top);skyU.hor.value.setHex(T.hor);skyU.sunCol.value.setHex(i==2?0x9fb4ff:T.col).multiplyScalar(i==2?.35:1);skyU.night.value=T.night;
  const e=T.elev*Math.PI/180,a=T.az*Math.PI/180;
  sunDir.set(Math.cos(e)*Math.sin(a),Math.sin(e),-Math.cos(e)*Math.cos(a));
  skyU.sunDir.value.copy(sunDir);sun.color.setHex(T.col);sun.intensity=T.int;
  hemi.color.setHex(T.hs);hemi.groundColor.setHex(T.hg);hemi.intensity=T.hi;
  scene.fog.color.setHex(T.hor);scene.fog.density=T.dens;
  if(window.lightMats)for(const m of lightMats)m.opacity=.25+.75*T.lights;
}
const sunDir=new V3();

/* Mer */
function waveTexture(){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
  x.fillStyle='#fff';x.fillRect(0,0,256,256);
  for(let i=0;i<900;i++){const px=rnd()*256,py=rnd()*256,l=6+rnd()*18;x.strokeStyle='rgba(120,160,200,'+(.08+rnd()*.14)+')';x.lineWidth=1+rnd()*1.4;
    for(const ox of [-256,0,256])for(const oy of [-256,0,256]){x.beginPath();x.moveTo(px+ox,py+oy);x.lineTo(px+ox+l,py+oy+(rnd()-.5)*3);x.stroke()}}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1600,1600);t.anisotropy=8;return t}
const waveTex=waveTexture();
const sea=new THREE.Mesh(new THREE.PlaneGeometry(160000,160000).rotateX(-Math.PI/2),
  new THREE.MeshPhongMaterial({color:0x1d78b0,specular:0xbfd8ee,shininess:90,transparent:true,opacity:.8,map:waveTex,depthWrite:false}));
sea.position.y=0;sea.renderOrder=1;scene.add(sea);

/* Terrain */
function detailTexture(){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),d=x.createImageData(256,256);
  for(let j=0;j<256;j++)for(let i=0;i<256;i++){const n=.78+.22*(vnoise(i/8,j/8)*.5+vnoise(i/3,j/3)*.3+rnd()*.2);const v=Math.min(255,n*255);const k=(j*256+i)*4;d.data[k]=d.data[k+1]=d.data[k+2]=v;d.data[k+3]=255}
  x.putImageData(d,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t}
let terrain;
function buildTerrain(){
  const g=new THREE.PlaneGeometry(SIZE,SIZE,N,N);g.rotateX(-Math.PI/2);
  const pos=g.attributes.position,uv=g.attributes.uv,n=pos.count,col=new Float32Array(n*3);
  for(let k=0;k<n;k++){pos.setY(k,HGT[k]);uv.setXY(k,pos.getX(k)/90,pos.getZ(k)/90)}
  g.computeVertexNormals();const nor=g.attributes.normal;
  const c=new THREE.Color();
  for(let k=0;k<n;k++){
    const h=HGT[k],ny=nor.getY(k),x=pos.getX(k),z=pos.getZ(k),nz=vnoise(x/60,z/60)*.14+vnoise(x/17,z/17)*.07;
    let r,gg,b;
    if(h<=0){const t=smooth(0,-140,h);r=lerp(.62,.04,t);gg=lerp(.78,.2,t);b=lerp(.7,.34,t)}
    else if(h<2.5){r=.8;gg=.74;b=.56}
    else{
      const f=fbm(x/700+5,z/700,3);
      r=lerp(.27,.17,f)+nz*.2;gg=lerp(.45,.32,f)+nz*.2;b=lerp(.19,.13,f)+nz*.1;
      const alt=smooth(900,1700,h+nz*400);
      r=lerp(r,.42,alt);gg=lerp(gg,.43,alt);b=lerp(b,.3,alt);
      const rock=smooth(.9,.68,ny)+smooth(1500,2000,h)*.6;
      const rr=.46+nz,rg=.43+nz,rb=.4+nz;
      const rk=clamp(rock,0,1);r=lerp(r,rr,rk);gg=lerp(gg,rg,rk);b=lerp(b,rb,rk);
      const snow=smooth(1950,2250,h+nz*300)*smooth(.6,.85,ny);
      r=lerp(r,.95,snow);gg=lerp(gg,.96,snow);b=lerp(b,.98,snow);
    }
    col[k*3]=r;col[k*3+1]=gg;col[k*3+2]=b;
  }
  g.setAttribute('color',new THREE.BufferAttribute(col,3));
  terrain=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,map:detailTexture()}));
  scene.add(terrain);
}

/* Pistes, bâtiments, balises */
const lightMats=[];window.lightMats=lightMats;
function runwayTexture(a){const W=256,Hh=2048,c=document.createElement('canvas');c.width=W;c.height=Hh;const x=c.getContext('2d');
  x.fillStyle='#34373b';x.fillRect(0,0,W,Hh);
  for(let i=0;i<5000;i++){x.fillStyle='rgba('+(i%2?'255,255,255':'0,0,0')+','+(.02+rnd()*.05)+')';x.fillRect(rnd()*W,rnd()*Hh,1+rnd()*3,1+rnd()*8)}
  x.fillStyle='#e9e9e4';x.fillRect(8,0,5,Hh);x.fillRect(W-13,0,5,Hh);
  for(let y=150;y<Hh-150;y+=100)x.fillRect(W/2-3,y,6,50);
  for(const yy of [Hh-125,35]){for(let i=0;i<8;i++){x.fillRect(26+i*((W-52)/7.4),yy,12,90)}}
  x.fillStyle='#e9e9e4';x.font='bold 64px Arial';x.textAlign='center';
  const n1=String(Math.round(a.hdg/10)||36).padStart(2,'0'),n2=String(Math.round(((a.hdg+180)%360)/10)||36).padStart(2,'0');
  x.fillText(n1,W/2,Hh-130);x.save();x.translate(W/2,130);x.rotate(Math.PI);x.fillText(n2,0,0);x.restore();
  const t=new THREE.CanvasTexture(c);t.anisotropy=8;return t}
function buildAirports(){
  const bm=new THREE.MeshLambertMaterial({color:0xcfd4d8}),dk=new THREE.MeshLambertMaterial({color:0x4b5560}),ro=new THREE.MeshLambertMaterial({color:0xc4573a});
  for(const a of AIRPORTS){
    const g=new THREE.Group();g.position.set(a.x,a.elev+.2,a.z);g.rotation.y=-a.hdg*Math.PI/180;scene.add(g);
    const rw=new THREE.Mesh(new THREE.PlaneGeometry(46,a.len).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({map:runwayTexture(a)}));
    rw.position.y=.05;g.add(rw);
    const ap=new THREE.Mesh(new THREE.PlaneGeometry(150,240).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x585b5f}));ap.position.set(150,.03,-a.len*.1);g.add(ap);
    const tw=new THREE.Mesh(new THREE.BoxGeometry(70,14,28),bm);tw.position.set(190,7,-a.len*.1-70);g.add(tw);
    const tr=new THREE.Mesh(new THREE.BoxGeometry(70,3,29),ro);tr.position.set(190,15.5,-a.len*.1-70);g.add(tr);
    const tc=new THREE.Mesh(new THREE.CylinderGeometry(3,4,34,10),bm);tc.position.set(150,17,-a.len*.1-120);g.add(tc);
    const cab=new THREE.Mesh(new THREE.CylinderGeometry(7,5,6,10),new THREE.MeshPhongMaterial({color:0x223344,shininess:80}));cab.position.set(150,37,-a.len*.1-120);g.add(cab);
    for(let i=0;i<3;i++){const h=new THREE.Mesh(new THREE.BoxGeometry(46,16,40),dk);h.position.set(150,8,a.len*.05+i*55);g.add(h);const r=new THREE.Mesh(new THREE.BoxGeometry(48,2,42),ro);r.position.set(150,17,a.len*.05+i*55);g.add(r)}
    // feux de piste
    const lm=new THREE.MeshBasicMaterial({color:0xfff2c0,transparent:true,opacity:.3,fog:false});lightMats.push(lm);
    const lg=new THREE.InstancedMesh(new THREE.BoxGeometry(1.2,1,1.2),lm,Math.floor(a.len/40)*2+2);let k=0;const m=new THREE.Matrix4();
    for(let s=-a.len/2;s<=a.len/2;s+=40)for(const side of [-24,24]){m.setPosition(side,.6,s);lg.setMatrixAt(k++,m)}
    lg.count=k;g.add(lg);
    for(const [zz,cc] of [[-a.len/2-6,0x2cff7a],[a.len/2+6,0xff4a3a]]){const mm=new THREE.MeshBasicMaterial({color:cc,transparent:true,opacity:.5,fog:false});lightMats.push(mm);
      const b=new THREE.Mesh(new THREE.BoxGeometry(46,1,1.4),mm);b.position.set(0,.6,zz);g.add(b)}
  }
}

/* Arbres */
function buildTrees(){
  const geo=new THREE.ConeGeometry(7,28,6);geo.translate(0,12,0);
  const mat=new THREE.MeshLambertMaterial({color:0xffffff});
  const max=16000,im=new THREE.InstancedMesh(geo,mat,max);const m=new THREE.Matrix4(),col=new THREE.Color(),qq=new Q4(),sc=new V3(),ps=new V3();let c=0;
  for(let z=-HALF+2000;z<HALF-2000&&c<max;z+=130)for(let x=-HALF+2000;x<HALF-2000&&c<max;x+=130){
    const px=x+(rnd()-.5)*120,pz=z+(rnd()-.5)*120,h=groundH(px,pz);
    if(h<6||h>1350)continue;
    let near=false;for(const a of AIRPORTS)if(Math.hypot(px-a.x,pz-a.z)<1350){near=true;break}
    if(near)continue;
    const f=fbm(px/800+50,pz/800,3);if(f<.46||rnd()>smooth(1350,500,h)*(.4+f))continue;
    const s=Math.abs(groundH(px+60,pz)-groundH(px-60,pz))+Math.abs(groundH(px,pz+60)-groundH(px,pz-60));if(s>110)continue;
    const k=.7+rnd()*.9;sc.set(k,k*(.9+rnd()*.5),k);ps.set(px,h-1,pz);m.compose(ps,qq,sc);im.setMatrixAt(c,m);
    col.setHSL(.27+rnd()*.07,.45,.17+rnd()*.1);im.setColorAt(c,col);c++;
  }
  im.count=c;im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;im.frustumCulled=false;scene.add(im);
}

/* Nuages */
const CLOUDS=[];
function buildClouds(){
  const geo=new THREE.IcosahedronGeometry(1,1),mat=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x303840,transparent:true,opacity:.93});
  const max=1500,im=new THREE.InstancedMesh(geo,mat,max);const m=new THREE.Matrix4(),qq=new Q4(),sc=new V3(),ps=new V3();let c=0;
  for(let i=0;i<190;i++){
    const cx=(rnd()-.5)*38000,cz=(rnd()-.5)*38000,cy=1700+rnd()*1900,R=350+rnd()*500;CLOUDS.push({x:cx,y:cy,z:cz,r:R*1.2});
    const np=6+Math.floor(rnd()*3);
    for(let j=0;j<np&&c<max;j++){const r=R*(.5+rnd()*.55);ps.set(cx+(rnd()-.5)*R*2.2,cy+(rnd()-.4)*R*.35,cz+(rnd()-.5)*R*1.6);sc.set(r,r*.55,r*.9);m.compose(ps,qq,sc);im.setMatrixAt(c++,m)}
  }
  im.count=c;im.frustumCulled=false;scene.add(im);
}
/* ===== Avion ===== */
const planeG=new THREE.Group();scene.add(planeG);
const cockpitG=new THREE.Group();scene.add(cockpitG);
let flameMesh,gearGroup,nozG,chuteG,navMats=[];
let liftFanG,liftFanRotor,liftFanDoors=[],cockpitScreens=[],cockpitScreenTime=0;
function buildPlane(){
  // Chasseur furtif STOVL fictif, inspiré des proportions d'un appareil de 5e génération (nez vers -Z).
  const M=RK.M,A=(geo,mat,x,y,z,par,rx,ry,rz)=>{const m=RK.add(par||planeG,geo,mat,x,y,z,rx,ry,rz);m.castShadow=false;return m};
  /* revêtement furtif : gris mat avec lignes de panneaux et joints en dents de scie */
  const skinTex=RK.canvasTex(1024,1024,(g,w,h)=>{
    g.fillStyle='#7a838a';g.fillRect(0,0,w,h);const r=RK.rng(4);
    for(let i=0;i<220;i++){const x=r()*w,y=r()*h,pw=30+r()*160,ph=30+r()*160;g.fillStyle='rgba('+(r()<.5?'255,255,255':'0,0,0')+','+(.02+r()*.035)+')';g.fillRect(x,y,pw,ph)}
    g.strokeStyle='rgba(30,36,40,.35)';g.lineWidth=1.4;
    for(let i=0;i<70;i++){const x=r()*w,y=r()*h,pw=50+r()*220,ph=40+r()*200;g.strokeRect(x,y,pw,ph)}
    g.strokeStyle='rgba(150,158,164,.5)';g.lineWidth=5;
    for(let i=0;i<14;i++){const x0=r()*w,y0=r()*h;g.beginPath();g.moveTo(x0,y0);for(let k=0;k<8;k++)g.lineTo(x0+k*18,y0+(k%2?14:0));g.stroke()}
    g.fillStyle='rgba(20,24,28,.5)';for(let i=0;i<500;i++)g.fillRect(r()*w,r()*h,1.6,1.6);
  },{repeat:[1,1]});
  const paint=M.std(0x9aa1a6,.6,.2,{map:skinTex,envMapIntensity:.55});
  const panel=M.std(0x5d666d,.6,.3,{envMapIntensity:.7});
  const dark=M.std(0x1a2026,.45,.5);
  const rubber=M.rubber();
  const glass=new THREE.MeshPhysicalMaterial({color:0xc2a35a,metalness:.55,roughness:.06,clearcoat:1,clearcoatRoughness:.03,transparent:true,opacity:.55,envMap:RK.ENV,envMapIntensity:1.6,side:THREE.DoubleSide,depthWrite:false});
  const trim=M.alu(0x9aa4ab,{roughness:.34});
  const heat=M.std(0xffffff,.42,.9,{map:RK.canvasTex(256,64,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#6f6a63');gr.addColorStop(.35,'#7b6a55');gr.addColorStop(.6,'#4c5470');gr.addColorStop(1,'#2a2a2e');g.fillStyle=gr;g.fillRect(0,0,w,h)})});
  const glowRed=new THREE.MeshBasicMaterial({color:0xff3030}),glowGreen=new THREE.MeshBasicMaterial({color:0x32ff83}),glowWhite=new THREE.MeshBasicMaterial({color:0xffffff}),formation=new THREE.MeshBasicMaterial({color:0x9dff6a,transparent:true,opacity:.55});
  /* --- fuselage : sections à arêtes (chines) pointues, dos plat, large corps porteur --- */
  const fus=RK.loft([
    {z:-9.35,w:.05,t:.05,b:.05,y:.02,n:1.6},{z:-8.8,w:.3,t:.2,b:.18,y:.02,n:1.55},{z:-7.8,w:.56,t:.36,b:.3,y:.02,n:1.6},
    {z:-6.6,w:.8,t:.52,b:.44,y:0,n:1.7},{z:-5.2,w:.98,t:.66,b:.56,y:0,n:1.85},{z:-3.6,w:1.1,t:.74,b:.66,y:0,n:2},
    {z:-2.0,w:1.16,t:.8,b:.74,y:0,n:2.2},{z:-.4,w:1.24,t:.82,b:.8,y:0,n:2.5},{z:1.5,w:1.3,t:.8,b:.78,y:0,n:2.7},
    {z:3.4,w:1.2,t:.72,b:.72,y:0,n:2.6},{z:4.7,w:.94,t:.64,b:.64,y:0,n:2.4},{z:5.6,w:.66,t:.58,b:.58,y:-.02,n:2.2}
  ],{sides:56,sub:4,cap:false});
  A(fus,paint,0,0,0);
  /* entrées d'air latérales (DSI) avec bosse de compression et conduit sombre */
  for(const s of[-1,1]){
    const inl=RK.loft([{z:-2.55,x:s*1.08,w:.36,t:.4,b:.34,y:-.04,n:2.6},{z:-1.9,x:s*1.13,w:.44,t:.46,b:.4,y:-.04,n:2.8},{z:-.6,x:s*1.08,w:.44,t:.46,b:.42,y:-.05,n:2.8},{z:1.2,x:s*.98,w:.38,t:.38,b:.38,y:-.06,n:2.6}],{sides:32,sub:4,cap:false});
    A(inl,paint,0,0,0);
    A(RK.loft([{z:-2.5,x:s*1.08,w:.32,t:.35,b:.3,y:-.04,n:2.6},{z:-1.2,x:s*1.0,w:.24,t:.26,b:.24,y:-.04,n:2.4}],{sides:28,sub:2}),dark,0,0,0);
    const bump=A(new THREE.SphereGeometry(.5,24,14),paint,s*.92,.08,-2.95);bump.scale.set(.32,.55,1.25);
    A(RK.tube([[s*1.42,-.04,-2.56],[s*1.1,.39,-2.6],[s*.78,-.04,-2.52],[s*1.1,-.4,-2.5],[s*1.42,-.04,-2.56]],.035,{closed:true,seg:40,radial:6}),trim,0,0,0);
  }
  /* capteur EOTS sous le nez et antennes */
  A(new THREE.OctahedronGeometry(.17,0),M.glass(0x33281a,{opacity:.85}),0,-.42,-6.9).scale.set(1,.6,1.6);
  for(const z of[-5.5,.8])A(RK.rbox(.05,.18,.32,.02,1),panel,0,-.82,z,null,.35,0,0);
  /* verrière sans arceau, teinte dorée, avec le pilote visible au travers */
  const can=RK.loft([{z:-5.05,w:.05,t:.02,b:.02,y:.66},{z:-4.6,w:.42,t:.3,b:.1,y:.66,n:2.1},{z:-3.6,w:.56,t:.55,b:.1,y:.66,n:2.2},{z:-2.6,w:.55,t:.53,b:.1,y:.66,n:2.2},{z:-1.85,w:.42,t:.3,b:.1,y:.66,n:2.1},{z:-1.5,w:.2,t:.1,b:.05,y:.66}],{sides:40,sub:5});
  A(can,glass,0,.02,0).renderOrder=2;
  A(RK.tube([[-.55,.78,-2.45],[-.4,1.08,-2.45],[0,1.17,-2.45],[.4,1.08,-2.45],[.55,.78,-2.45]],.03,{seg:30,radial:8}),panel,0,0,0);
  A(RK.loft([{z:-1.9,w:.3,t:.12,b:.02,y:.8},{z:-1.0,w:.55,t:.18,b:.02,y:.8,n:2.6},{z:2.4,w:.6,t:.1,b:.02,y:.8,n:3},{z:4.2,w:.35,t:.04,b:.02,y:.72}],{sides:28}),paint,0,0,0);
  /* pilote assis : combinaison, harnais, casque à visière intégrée */
  {
    const suit=M.std(0x4a5040,.85,0),harness=M.std(0x2a2b28,.8,0),hshell=M.std(0x3a3e43,.45,.2),visor=M.std(0x101418,.08,.85);
    const pg=new THREE.Group();pg.position.set(0,-.02,-2.55);planeG.add(pg);
    const t=RK.loft([{z:0,w:.18,t:.1,b:.11},{z:.25,w:.17,t:.1,b:.1},{z:.45,w:.21,t:.1,b:.11,n:2.6},{z:.56,w:.12,t:.06,b:.06}],{sides:20});t.rotateX(-Math.PI/2);A(t,suit,0,.3,.05,pg,-.12,0,0);
    for(const s of[-1,1])A(RK.rbox(.05,.5,.02,.01,1),harness,s*.08,.58,.15,pg,-.12,0,0);
    const hg=RK.helmet(pg,hshell,visor,{r:.16,style:'jet'});hg.position.set(0,.96,.03);hg.rotation.y=Math.PI;
    A(RK.rbox(.5,.75,.2,.06,2),M.std(0x2c3036,.7,.2),0,.6,.32,pg,-.1,0,0);
    A(RK.rbox(.36,.3,.18,.05,2),M.std(0x2c3036,.7,.2),0,1.1,.4,pg);
    for(const s of[-1,1])A(RK.rbox(.04,.28,.04,.01,1),M.std(0xf2c014,.6,0),s*.12,.98,.31,pg);
  }
  /* --- ailes trapézoïdales à profil NACA, gouvernes et feux --- */
  for(const s of[-1,1]){
    const w=RK.wing({x:s*.95,y:-.1,z:-2.6,c:6.1,t:.055},{x:s*5.3,y:-.02,z:.75,c:1.65,t:.04},{chord:20,span:6});A(w,paint,0,0,0);
    A(RK.wing({x:s*2.2,y:-.06,z:2.15,c:.85,t:.03},{x:s*5.05,y:-.02,z:1.75,c:.58,t:.03},{chord:8,span:2}),panel,0,.012,0);
    A(RK.rbox(.12,.05,.3,.02,1),s<0?glowRed:glowGreen,s*5.3,-.02,1.2);
    A(RK.rbox(.03,.012,1.4,.006,1),formation,s*3.1,.12,-.2,null,0,s*-.55,0);
  }
  /* empennages : deux dérives inclinées et stabilisateurs monoblocs */
  for(const s of[-1,1]){
    const fin=RK.wing({x:0,y:0,z:0,c:2.9,t:.05},{x:2.35,y:0,z:1.85,c:1.25,t:.045},{chord:16,span:5});
    const fg=new THREE.Group();fg.position.set(s*.92,.55,1.85);fg.rotation.z=s>0?Math.PI/2-.42:Math.PI/2+.42;
    planeG.add(fg);A(fin,paint,0,0,0,fg);
    A(RK.rbox(.05,.02,.75,.01,1),panel,1.4,.0,2.55,fg);
    const tail=RK.wing({x:s*.85,y:-.1,z:3.45,c:2.35,t:.045},{x:s*3.3,y:-.16,z:4.95,c:1.05,t:.04},{chord:14,span:4});A(tail,paint,0,0,0);
  }
  /* marquages basse visibilité */
  const markingCanvas=document.createElement('canvas');markingCanvas.width=512;markingCanvas.height=128;
  const markingCtx=markingCanvas.getContext('2d');
  if(!markingCtx)throw new Error('Impossible de créer les marquages de la cellule.');
  markingCtx.fillStyle='#9aa3a8';markingCtx.font='700 64px Arial';markingCtx.fillText('F-35B',18,72);
  markingCtx.font='500 25px Arial';markingCtx.fillText('STOVL  /  07',20,108);
  const markingTexture=new THREE.CanvasTexture(markingCanvas);markingTexture.anisotropy=8;
  const markingMat=new THREE.MeshBasicMaterial({map:markingTexture,transparent:true,opacity:.6,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2});
  for(const side of [-1,1]){const decal=A(new THREE.PlaneGeometry(.95,.24).rotateX(-Math.PI/2),markingMat,side*2.9,.045,.9);decal.renderOrder=1}
  /* poteaux de roulis sous les ailes (vol vertical) */
  for(const s of[-1,1]){A(new THREE.CylinderGeometry(.16,.2,.5,18),dark,s*4.9,-.24,.7,null,Math.PI/2,0,0);A(new THREE.TorusGeometry(.17,.03,8,18),trim,s*4.9,-.24,.95,null,0,0,0)}
  /* soufflante de sustentation : trappes affleurantes, rotor visible en mode STOVL */
  liftFanG=new THREE.Group();liftFanG.position.set(0,.62,-1.25);planeG.add(liftFanG);
  A(new THREE.CylinderGeometry(.7,.7,.4,32,1,true),dark,0,-.2,0,liftFanG);
  A(new THREE.CircleGeometry(.7,32),dark,0,-.39,0,liftFanG,-Math.PI/2,0,0);
  A(new THREE.TorusGeometry(.64,.05,10,32),trim,0,-.06,0,liftFanG,Math.PI/2,0,0);
  liftFanRotor=new THREE.Group();liftFanRotor.position.set(0,-.14,0);liftFanG.add(liftFanRotor);
  A(RK.lathe([[0,-.08],[.16,-.08],[.18,.0],[.12,.06],[0,.08]],20),panel,0,0,0,liftFanRotor);
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2,b=A(RK.rbox(.42,.012,.08,.004,1),trim,Math.cos(a)*.38,0,Math.sin(a)*.38,liftFanRotor);b.rotation.set(.45,-a,0)}
  for(const side of [-1,1]){
    const hinge=new THREE.Group();hinge.position.set(side*.6,.2,0);liftFanG.add(hinge);
    A(RK.rbox(.6,.05,1.45,.02,2),paint,-side*.3,0,0,hinge);
    A(RK.rbox(.5,.012,.03,.005,1),panel,-side*.3,.027,.6,hinge);
    liftFanDoors.push({hinge,side});
  }
  for(let i=0;i<5;i++)A(RK.rbox(.62,.01,.07,.005,1),dark,0,.81,.35+i*.12);
  /* tuyère orientable à bord crénelé, anneaux et corps de post-combustion */
  nozG=new THREE.Group();nozG.position.set(0,-.02,5.55);planeG.add(nozG);
  A(RK.lathe([[.62,0],[.6,.4],[.55,.75],[.5,1.0]],40).rotateX(Math.PI/2),heat,0,0,0,nozG);
  A(RK.lathe([[.47,1.0],[.48,.6],[.5,.2]],40).rotateX(Math.PI/2),M.std(0x2a2522,.6,.8),0,0,0,nozG);
  {const pos=[],n=16,R0=.5,R1=.46;for(let i=0;i<n;i++){const a0=i/n*Math.PI*2,a1=(i+1)/n*Math.PI*2,am=(a0+a1)/2;
     pos.push(Math.cos(a0)*R0,Math.sin(a0)*R0,1.0,Math.cos(am)*R1,Math.sin(am)*R1,1.22,Math.cos(a1)*R0,Math.sin(a1)*R0,1.0)}
   const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));sg.computeVertexNormals();A(sg,new THREE.MeshStandardMaterial({color:0x6f6458,metalness:.9,roughness:.4,side:THREE.DoubleSide,envMap:RK.ENV}),0,0,0,nozG)}
  for(let i=0;i<3;i++)A(new THREE.TorusGeometry(.6-i*.04,.018,6,40),trim,0,0,.15+i*.35,nozG);
  A(new THREE.CircleGeometry(.44,32),M.glow(0x40180a,.6),0,0,.25,nozG);
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;A(RK.rbox(.03,.3,.03,.01,1),dark,Math.cos(a)*.22,Math.sin(a)*.22,.3,nozG,0,0,a)}
  flameMesh=A(new THREE.ConeGeometry(.33,1,16,1,true).rotateX(Math.PI/2).translate(0,0,.45),
    new THREE.MeshBasicMaterial({color:0xff9a3a,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}),0,0,1.05,nozG);
  const core=A(new THREE.ConeGeometry(.2,.8,14,1,true).rotateX(Math.PI/2).translate(0,0,.35),new THREE.MeshBasicMaterial({color:0xb8d4ff,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false}),0,0,0,flameMesh);
  for(let i=0;i<4;i++)A(new THREE.SphereGeometry(.15-i*.022,12,8),new THREE.MeshBasicMaterial({color:0xffd9a0,transparent:true,opacity:.35-i*.06,blending:THREE.AdditiveBlending,depthWrite:false}),0,0,.22+i*.2,flameMesh).scale.set(1,1,.45);
  /* quille ventrale, crosse d'appontage, feux */
  A(RK.rbox(.5,.16,2.8,.06,2),paint,0,-.7,2.9);
  const hook=A(new THREE.CylinderGeometry(.05,.07,1.5,10),dark,0,-.66,4.55);hook.rotation.x=-.38;
  A(new THREE.SphereGeometry(.09,10,8),glowWhite,0,.12,5.35);
  A(new THREE.SphereGeometry(.07,8,6),glowRed,0,.95,-1.6);
  /* train tricycle : jambes oléopneumatiques, compas, pneus profilés, jantes, trappes */
  gearGroup=new THREE.Group();planeG.add(gearGroup);
  const strutMat=M.chrome({roughness:.12}),legMat=M.std(0xe6e8ea,.5,.2),hubMat=M.alu(0xa9b2b8,{roughness:.3});
  const makeWheel=(x,z,main)=>{
    const R=main?.37:.27,W=main?.26:.18,y=-2.05+R,topY=-.5;
    const tg=RK.tireGeo(R,W,R*.6,{round:.35,seg:32});A(tg,RK.tireMat('road',tg),x,y,z,gearGroup);
    const rg=RK.rimGeo(R*.6,W*.8,{spokes:main?8:6,hub:.3,spokeW:R*.08,seg:24});for(const gg of[rg.face,rg.barrel,rg.hub])A(gg,hubMat,x,y,z,gearGroup);
    const sx=main?x-Math.sign(x)*.18:x;
    A(new THREE.CylinderGeometry(.09,.09,(topY-(y+.55)),14).translate(0,(topY-(y+.55))/2,0),legMat,sx,y+.55,z,gearGroup);
    A(new THREE.CylinderGeometry(.065,.065,.5,14).translate(0,.25,0),strutMat,sx,y+.05,z,gearGroup);
    A(new THREE.CylinderGeometry(.04,.04,Math.abs(sx-x)+W*.6,10),dark,(sx+x)/2,y,z,gearGroup,0,0,Math.PI/2);
    A(RK.rbox(.06,.3,.06,.02,1),dark,sx,y+.35,z+.12,gearGroup,.5,0,0);A(RK.rbox(.06,.3,.06,.02,1),dark,sx,y+.6,z+.12,gearGroup,-.5,0,0);
    if(!main){A(new THREE.CylinderGeometry(.07,.08,.1,16),M.glow(0xfff2cc,1.4),sx,y+.95,z-.14,gearGroup,Math.PI/2,0,0)}
    A(RK.rbox(.03,main?.9:.7,main?1.1:.8,.01,1),paint,x+(main?Math.sign(x)*.12:.32),-.62,z,gearGroup);
    if(!main)A(RK.rbox(.03,.7,.8,.01,1),paint,-.32,-.62,z,gearGroup);
  };
  makeWheel(0,-4.65,false);
  makeWheel(-1.45,1.75,true);makeWheel(1.45,1.75,true);
  planeG.traverse(o=>{if(o.isMesh&&o.material!==glass&&o.material!==markingMat&&!(o.material.blending===THREE.AdditiveBlending))o.castShadow=false});
}
/* ===== PV-40 : VTOL privé à aile basculante (inspiré de Turboprop Flight Simulator) =====
   Version de luxe du XV-40 : aile basculante 0–90° portant 4 turbopropulseurs aux hélices liées,
   train dont les boggies pivotent de 90° avant de rentrer, portes parachutistes avec treuils,
   rampe arrière, cabine (toilettes, 6 sièges, chambre) et petite soute avec son véhicule assorti.
   33,7 m de long, 33,9 m d'envergure. Nez vers -Z. */
const pvG=new THREE.Group(),pvInteriorG=new THREE.Group();
let f35G=null,f35CockpitG=null;
const PV={tilt:null,props:[],discs:[],tailRotor:null,nose:null,mains:[],doors:[],iDoors:[],ramp:null,iRamp:null,paintMats:[],hsv:[184,.74,.3],propAng:0};
function hsv2rgb(h,s,v){const f=n=>{const k=(n+h/60)%6;return v-v*s*Math.max(0,Math.min(k,4-k,1))};return new THREE.Color(f(5),f(3),f(1))}
function setPVColor(h,s,v){PV.hsv=[h,s,v];const c=hsv2rgb(h,s,v);for(const m of PV.paintMats)m.color.copy(c)}
function pvWheel(par,x,y,z,R,W){
  const tg=RK.tireGeo(R,W,R*.6,{round:.35,seg:28});RK.add(par,tg,RK.tireMat('road',tg),x,y,z);
  const rg=RK.rimGeo(R*.6,W*.8,{spokes:6,hub:.3,spokeW:R*.08,seg:20});for(const gg of[rg.face,rg.barrel,rg.hub])RK.add(par,gg,RK.M.alu(0xb5bcc2,{roughness:.3}),x,y,z);
}
/* Véhicule assorti (4x4) : même couleur que l'avion */
function pvVehicle(par,paint){
  const M=RK.M,g=new THREE.Group();par.add(g);
  const dark=M.std(0x14181c,.5,.3),glass=M.std(0x1b2a33,.1,.6),chrome=M.alu(0xc9ced3,{roughness:.2});
  RK.add(g,RK.rbox(1.86,.72,3.7,.16,3),paint,0,.0,0);
  RK.add(g,RK.rbox(1.72,.62,2.0,.18,3),paint,0,.62,-.15);
  RK.add(g,RK.rbox(1.74,.42,1.9,.1,2),glass,0,.66,-.15);
  RK.add(g,RK.rbox(1.9,.14,.2,.05,2),dark,0,-.18,-1.9);RK.add(g,RK.rbox(1.9,.14,.2,.05,2),dark,0,-.18,1.9);
  for(const s of[-1,1]){RK.add(g,RK.rbox(.22,.12,.05,.03,1),M.glow(0xfff4d0,.8),s*.66,.12,-1.86);RK.add(g,RK.rbox(.22,.1,.05,.03,1),M.glow(0xff2a2a,.6),s*.7,.12,1.86)}
  RK.add(g,RK.rbox(1.6,.06,1.2,.02,1),chrome,0,1.0,.1);
  for(const sx of[-1,1])for(const sz of[-1.2,1.25])pvWheel(g,sx*.92,-.42,sz,.4,.3);
  return g;
}
function buildPV(){
  const M=RK.M,A=(geo,mat,x,y,z,par,rx,ry,rz)=>RK.add(par||pvG,geo,mat,x,y,z,rx,ry,rz);
  const paint=M.std(0x1d6f73,.4,.2,{envMapIntensity:.9});
  const vpaint=M.std(0x1d6f73,.35,.3,{envMapIntensity:.9});
  PV.paintMats.push(paint,vpaint);
  const dark=M.std(0x1a1f24,.5,.4),gray=M.std(0x59616a,.55,.3),metal=M.alu(0xaab2b8,{roughness:.32}),black=M.std(0x0b0d10,.6,.2);
  const glass=M.glass(0x0b1620,{transparent:true,opacity:.86});
  const blade=M.std(0x23272b,.5,.35),tip=M.std(0xf2c014,.5,0);
  const glowRed=new THREE.MeshBasicMaterial({color:0xff3030}),glowGreen=new THREE.MeshBasicMaterial({color:0x32ff83}),glowWhite=new THREE.MeshBasicMaterial({color:0xffffff});
  /* fuselage : nez arrondi façon V-22, section presque carrée, queue relevée au-dessus de la rampe */
  const fus=RK.loft([
    {z:-16.6,w:.12,t:.12,b:.12,y:-.35},{z:-16.1,w:.85,t:.8,b:.85,y:-.3,n:2.2},{z:-15.1,w:1.32,t:1.3,b:1.3,y:-.15,n:2.4},
    {z:-13.6,w:1.62,t:1.66,b:1.48,n:2.7},{z:-11,w:1.72,t:1.78,b:1.58,n:2.9},{z:-3,w:1.76,t:1.8,b:1.62,n:3},{z:5,w:1.76,t:1.8,b:1.62,n:3},
    {z:8.4,w:1.68,t:1.74,b:1.05,y:.25,n:2.9},{z:12,w:1.2,t:1.3,b:.55,y:.95,n:2.6},{z:15,w:.62,t:.72,b:.32,y:1.42,n:2.3},{z:16.6,w:.2,t:.25,b:.15,y:1.62}
  ],{sides:56,sub:4});
  A(fus,paint,0,0,0);
  for(const [a0,a1] of[[.55,Math.PI-.55],[-.25,.55],[Math.PI-.55,Math.PI+.25]]){const g=RK.loftPatch(fus,-15.8,-14.05,a0,a1,.025);if(g)A(g,glass,0,0,0).renderOrder=2}
  A(RK.rbox(1.6,.05,.9,.02,1),black,0,1.33,-13.75,null,-.32,0,0);                  // bandeau anti-reflets
  // hublots de cabine, porte passagers, portes parachutistes coulissantes et treuils
  for(const s of[-1,1]){
    for(let k=0;k<8;k++)A(RK.rbox(.04,.42,.32,.02,1),glass,s*1.752,.35,-10.6+k*1.45);
    A(RK.rbox(.03,1.85,.95,.04,1),gray,s*1.765,-.15,-11.95);
    A(RK.rbox(.02,1.75,1.3,.02,1),black,s*1.758,-.05,4.4);
    const d=new THREE.Group();d.position.set(s*1.795,-.05,4.4);pvG.add(d);A(RK.rbox(.06,1.78,1.32,.03,1),paint,0,0,0,d);A(RK.rbox(.02,.08,.3,.01,1),metal,s*.03,0,-.4,d);
    PV.doors.push({g:d,z:4.4});
    const h=new THREE.Group();h.position.set(s*1.95,1.15,4.4);pvG.add(h);
    A(RK.rbox(.42,.1,.12,.03,1),metal,s*.2,0,0,h);A(new THREE.CylinderGeometry(.06,.06,.08,12),dark,s*.4,-.04,0,h,0,0,Math.PI/2);
    A(new THREE.CylinderGeometry(.008,.008,.55,6),dark,s*.4,-.33,0,h);A(new THREE.TorusGeometry(.05,.012,6,12,Math.PI*1.4),metal,s*.4,-.64,0,h);
  }
  // sponsons du train principal
  for(const s of[-1,1])A(RK.loft([{z:-1.6,x:s*1.72,w:.28,t:.3,b:.35,y:-1.05,n:2.4},{z:-.8,x:s*1.9,w:.6,t:.55,b:.62,y:-1.05,n:2.6},{z:3.4,x:s*1.9,w:.62,t:.55,b:.62,y:-1.05,n:2.6},{z:5,x:s*1.76,w:.3,t:.35,b:.4,y:-1.0,n:2.4}],{sides:28,sub:3}),paint,0,0,0);
  // rampe arrière
  PV.ramp=new THREE.Group();PV.ramp.position.set(0,-1.0,7.6);pvG.add(PV.ramp);
  A(RK.rbox(2.7,.12,4.5,.05,2),paint,0,0,2.25,PV.ramp);
  for(let k=0;k<6;k++)A(RK.rbox(2.4,.03,.06,.01,1),dark,0,.07,.5+k*.7,PV.ramp);
  // pilotes visibles derrière le pare-brise
  for(const s of[-1,1]){const pg=new THREE.Group();pg.position.set(s*.62,-.15,-14.2);pvG.add(pg);
    A(RK.rbox(.45,.55,.3,.1,2),M.std(0x2f3a48,.8,0),0,.2,0,pg);const hg=RK.helmet(pg,M.std(0xe8e8e8,.4,.2),M.std(0x111418,.08,.8),{r:.15,style:'jet'});hg.position.set(0,.68,0);hg.rotation.y=Math.PI}
  /* aile basculante et nacelles */
  PV.tilt=new THREE.Group();PV.tilt.position.set(0,1.95,-1.3);pvG.add(PV.tilt);
  A(RK.loft([{z:-3.6,w:.3,t:.15,b:.05,y:1.68},{z:-2.8,w:1.0,t:.38,b:.05,y:1.68,n:2.4},{z:.4,w:1.0,t:.42,b:.05,y:1.68,n:2.4},{z:1.6,w:.4,t:.15,b:.05,y:1.68}],{sides:28}),paint,0,0,0);
  for(const s of[-1,1]){
    A(RK.wing({x:s*.3,y:0,z:-2.0,c:4.4,t:.15},{x:s*16.95,y:.2,z:-2.6,c:2.8,t:.12},{chord:20,span:10}),paint,0,0,0,PV.tilt);
    A(RK.rbox(.16,.07,.34,.03,1),s<0?glowRed:glowGreen,s*16.98,.22,-1.4,PV.tilt);
    A(RK.rbox(.12,.06,.14,.03,1),glowWhite,s*16.98,.22,.05,PV.tilt);
    for(const x of[5.3,10.6]){
      const xs=s*x,zl=-2-(x-.3)/16.65*.6;
      A(RK.loft([{z:zl-2.3,x:xs,w:.42,t:.42,b:.45,y:0,n:2.2},{z:zl-1.6,x:xs,w:.56,t:.55,b:.64,y:-.06,n:2.4},{z:zl+2.6,x:xs,w:.55,t:.52,b:.6,y:-.06,n:2.4},{z:zl+4.6,x:xs,w:.18,t:.2,b:.22,y:0,n:2}],{sides:28,sub:3}),paint,0,0,0,PV.tilt);
      A(new THREE.CylinderGeometry(.12,.15,.5,14),dark,xs+s*.5,-.1,zl+1.4,PV.tilt,Math.PI/2,0,0);
      const spin=new THREE.Group();spin.position.set(xs,0,zl-2.35);PV.tilt.add(spin);
      A(RK.lathe([[.42,0],[.37,.35],[.24,.66],[.06,.88],[0,.9]],24).rotateX(-Math.PI/2),metal,0,0,0,spin);
      const prop=new THREE.Group();prop.position.z=-.1;spin.add(prop);prop.userData.dir=(x>8?1:-1)*s;
      for(let k=0;k<4;k++){const bg=new THREE.Group();bg.rotation.z=k*Math.PI/2;prop.add(bg);
        A(RK.rbox(1.62,.05,.32,.02,1),blade,.4+.81,0,0,bg).rotation.x=.32;A(RK.rbox(.2,.052,.3,.02,1),tip,.4+1.62+.08,0,0,bg).rotation.x=.32}
      const disc=new THREE.Mesh(new THREE.RingGeometry(.45,2.2,48),new THREE.MeshBasicMaterial({color:0x1a1d20,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));
      disc.position.z=-.12;spin.add(disc);
      PV.props.push(prop);PV.discs.push(disc);
    }
  }
  /* empennage en T, rotor de queue horizontal pour le vol stationnaire */
  const fg=new THREE.Group();fg.position.set(0,1.45,12.3);fg.rotation.z=Math.PI/2;pvG.add(fg);
  A(RK.wing({x:0,y:0,z:0,c:4.4,t:.12},{x:4.9,y:0,z:2.9,c:2.3,t:.1},{chord:16,span:6}),paint,0,0,0,fg);
  for(const s of[-1,1])A(RK.wing({x:s*.15,y:6.28,z:14.95,c:2.5,t:.1},{x:s*5.4,y:6.28,z:16.25,c:1.3,t:.09},{chord:12,span:5}),paint,0,0,0);
  A(new THREE.SphereGeometry(.09,10,8),glowRed,0,6.42,15.4);
  A(new THREE.SphereGeometry(.08,10,8),glowWhite,0,1.6,16.7);
  A(new THREE.TorusGeometry(.78,.08,8,28),paint,0,1.62,17.25,null,Math.PI/2,0,0);
  A(RK.rbox(.12,.1,.7,.04,1),paint,0,1.62,16.65);
  PV.tailRotor=new THREE.Group();PV.tailRotor.position.set(0,1.62,17.25);pvG.add(PV.tailRotor);
  for(let k=0;k<3;k++){const b=A(RK.rbox(.68,.03,.13,.01,1),blade,0,0,0,PV.tailRotor);b.position.set(Math.cos(k*2.094)*.36,0,Math.sin(k*2.094)*.36);b.rotation.y=-k*2.094}
  // immatriculation sur la dérive
  const lc=document.createElement('canvas');lc.width=512;lc.height=160;const lx=lc.getContext('2d');
  lx.fillStyle='rgba(255,255,255,.92)';lx.font='800 96px Arial';lx.fillText('PV-40',30,112);
  const lt=new THREE.CanvasTexture(lc);lt.anisotropy=8;
  const lm=new THREE.MeshBasicMaterial({map:lt,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
  for(const s of[-1,1]){const d=A(new THREE.PlaneGeometry(2.4,.75),lm,s*.29,3.0,13.9,null,0,s*Math.PI/2,0);d.renderOrder=1}
  /* train : roue avant jumelée, boggies principaux tandem qui pivotent avant de rentrer */
  const leg=M.std(0xe6e8ea,.5,.2),strut=M.chrome({roughness:.12});
  PV.nose=new THREE.Group();PV.nose.position.set(0,-1.35,-12.6);pvG.add(PV.nose);
  A(new THREE.CylinderGeometry(.11,.11,1.1,14),leg,0,-.55,0,PV.nose);A(new THREE.CylinderGeometry(.075,.075,.45,12),strut,0,-1.0,0,PV.nose);
  A(new THREE.CylinderGeometry(.05,.05,.7,10),dark,0,-1.28,0,PV.nose,0,0,Math.PI/2);
  for(const s of[-1,1])pvWheel(PV.nose,s*.22,-1.28,0,.42,.26);
  for(const s of[-1,1]){
    const g=new THREE.Group();g.position.set(s*1.95,-1.55,1.9);pvG.add(g);g.userData.y0=-1.55;
    A(new THREE.CylinderGeometry(.13,.13,.6,14),leg,0,-.3,0,g);A(new THREE.CylinderGeometry(.09,.09,.4,12),strut,0,-.62,0,g);
    A(RK.rbox(.18,.16,1.7,.05,2),dark,0,-.95,0,g);
    for(const z of[-.75,.75])pvWheel(g,0,-.95,z,.55,.36);
    PV.mains.push(g);
  }
  /* véhicule assorti (visible quand la rampe est ouverte) */
  pvVehicle(pvG,vpaint).position.set(0,-.62,3.2);
  pvG.traverse(o=>{if(o.isMesh)o.castShadow=false});
  setPVColor(...PV.hsv);
}

/* Intérieur : cockpit deux places, cabine de luxe, chambre, soute */
function buildPVInterior(){
  const M=RK.M,A=(geo,mat,x,y,z,par,rx,ry,rz)=>{const m=RK.add(par||pvInteriorG,geo,mat,x,y,z,rx,ry,rz,{noShadow:true});m.castShadow=false;return m};
  const wall=M.std(0xc9c1b1,.9,0,{side:THREE.BackSide}),carpet=M.std(0x34404c,.95,0),wood=M.std(0x7a5232,.42,.05),woodDark=M.std(0x4b311d,.5,.05);
  const leather=M.std(0xb9a581,.62,0),leatherDark=M.std(0x8f7b5c,.7,0),metalFloor=M.std(0x8b9196,.55,.6),white=M.std(0xf2f2ee,.35,.05),chrome=M.chrome();
  const panel=M.std(0x20262c,.55,.3),seatGray=M.std(0x3a424a,.75,0),light=M.glow(0xfff1d6,1.1),winMat=new THREE.MeshBasicMaterial({color:0xcfe4f6});
  const blanket=M.std(0x7a2430,.9,0),mirror=M.std(0xaeb6bb,.25,.85);
  // coque intérieure
  A(RK.loft([{z:-13.2,w:1.6,t:1.62,b:1.42,n:2.7},{z:-11,w:1.66,t:1.7,b:1.5,n:2.9},{z:-3,w:1.7,t:1.72,b:1.55,n:3},{z:5,w:1.7,t:1.72,b:1.55,n:3},{z:7.9,w:1.64,t:1.68,b:1.1,y:.2,n:2.9}],{sides:40,sub:3,cap:false}),wall,0,0,0);
  A(RK.rbox(3.0,.06,12.0,.02,1),carpet,0,-1.0,-7.2);
  A(RK.rbox(3.0,.06,8.8,.02,1),metalFloor,0,-1.0,3.3);
  for(const x of[-.7,.7])A(RK.rbox(.08,.03,8.6,.01,1),panel,x,-.96,3.3);
  A(RK.rbox(.3,.03,19,.01,1),light,0,1.66,-3.6);
  for(let k=0;k<8;k++)for(const s of[-1,1])A(RK.rbox(.02,.4,.3,.01,1),winMat,s*1.665,.35,-10.6+k*1.45);
  /* cockpit */
  A(RK.rbox(2.6,.08,3.2,.02,1),panel,0,-.98,-14.6);
  for(const s of[-1,1]){
    A(RK.rbox(.56,.14,.56,.06,2),seatGray,s*.62,-.58,-13.75);A(RK.rbox(.56,.9,.14,.06,2),seatGray,s*.62,-.05,-13.42,null,-.12,0,0);
    A(RK.rbox(.36,.24,.12,.05,2),seatGray,s*.62,.55,-13.36);
    const y=new THREE.Group();y.position.set(s*.62,-.15,-14.55);pvInteriorG.add(y);
    A(new THREE.CylinderGeometry(.035,.035,.55,10),panel,0,-.1,0,y,-.5,0,0);A(RK.tube([[-.18,.12,-.12],[-.18,.22,-.14],[.18,.22,-.14],[.18,.12,-.12]],.025,{seg:20,radial:6}),panel,0,0,0,y);
    A(RK.rbox(.06,1.0,3.0,.02,1),panel,s*1.48,-.5,-14.6);
  }
  A(RK.rbox(2.6,.55,.28,.06,2),panel,0,.22,-15.25);A(RK.rbox(2.7,.08,.55,.03,1),panel,0,.53,-15.3);
  A(RK.rbox(.36,.5,.95,.05,2),panel,0,-.65,-14.25);
  for(let k=0;k<4;k++)A(RK.rbox(.035,.16,.05,.01,1),chrome,-.12+k*.08,-.32,-14.4,null,-.4,0,0);
  for(const [x0,y0,z0,x1,y1,z1] of[[-1.32,.56,-15.25,-1.4,1.5,-14.75],[0,.6,-15.45,0,1.55,-14.85],[1.32,.56,-15.25,1.4,1.5,-14.75]])
    A(RK.tube([[x0,y0,z0],[x1,y1,z1]],.028,{seg:6,radial:6}),panel,0,0,0);
  A(RK.rbox(2.9,.06,1.9,.02,1),panel,0,1.56,-13.8);
  const pvScreen=(kind,x)=>{const c=document.createElement('canvas');c.width=512;c.height=320;const ctx=c.getContext('2d');const tx=new THREE.CanvasTexture(c);tx.anisotropy=8;tx.encoding=THREE.sRGBEncoding;
    const m=A(new THREE.PlaneGeometry(.5,.31),new THREE.MeshBasicMaterial({map:tx,toneMapped:false}),x,.25,-15.105);m.renderOrder=4;cockpitScreens.push({canvas:c,ctx,texture:tx,kind})};
  pvScreen('pfd',-.92);pvScreen('nav',-.36);pvScreen('nav',.36);pvScreen('pfd',.92);
  // cloison du cockpit avec passage central
  for(const s of[-1,1])A(RK.rbox(1.15,2.6,.08,.02,1),woodDark,s*1.08,.15,-13.1);
  A(RK.rbox(1.0,.5,.08,.02,1),woodDark,0,1.25,-13.1);
  /* toilettes (miroir opaque) et office */
  A(RK.rbox(.06,2.4,1.7,.02,1),wood,-.4,.1,-12.2);A(RK.rbox(1.25,2.4,.06,.02,1),wood,-1.02,.1,-11.35);
  A(RK.lathe([[0,0],[.18,0],[.22,.12],[.2,.38],[.23,.42],[0,.42]],20),white,-1.15,-.98,-12.6);
  A(RK.rbox(.55,.08,.42,.03,1),white,-1.3,-.05,-11.75);A(RK.rbox(.03,.5,.42,.01,1),mirror,-1.56,.55,-11.75);
  A(RK.rbox(.62,1.15,1.6,.04,2),wood,1.25,-.42,-12.3);A(RK.rbox(.66,.05,1.64,.02,1),white,1.25,.17,-12.3);
  /* 6 sièges club en cuir, tables */
  const seat=(x,z,f)=>{A(RK.rbox(.66,.2,.62,.08,2),leather,x,-.68,z);A(RK.rbox(.66,.82,.16,.08,2),leather,x,-.18,z+f*.31,null,f*.1,0,0);
    for(const s of[-1,1])A(RK.rbox(.1,.18,.58,.04,1),leatherDark,x+s*.33,-.48,z)};
  for(const x of[-.98,.98]){seat(x,-10.2,-1);seat(x,-8.3,1);seat(x,-6.6,1);
    A(RK.rbox(.72,.05,.82,.02,1),wood,x,-.28,-9.25);A(new THREE.CylinderGeometry(.04,.06,.66,10),chrome,x,-.62,-9.25)}
  /* chambre : cloison, lit double, chevets, lampes */
  for(const s of[-1,1])A(RK.rbox(1.18,2.6,.08,.02,1),wood,s*1.08,.15,-5.4);A(RK.rbox(1.0,.5,.08,.02,1),wood,0,1.25,-5.4);
  A(RK.rbox(1.7,.42,2.15,.06,2),woodDark,.2,-.8,-3.05);A(RK.rbox(1.62,.18,2.05,.08,2),white,.2,-.5,-3.05);
  A(RK.rbox(1.64,.08,1.4,.05,2),blanket,.2,-.39,-2.7);
  for(const s of[-1,1])A(RK.rbox(.62,.14,.36,.07,2),white,.2+s*.4,-.36,-3.9);
  A(RK.rbox(1.8,.9,.08,.03,2),woodDark,.2,-.25,-4.18);
  for(const s of[-1,1]){A(RK.rbox(.36,.5,.36,.04,2),wood,.2+s*1.12,-.73,-3.9);A(RK.lathe([[0,0],[.12,0],[.09,.25],[.14,.28],[.16,.42],[0,.42]],16),M.glow(0xffe0a8,.7),.2+s*1.12,-.47,-3.9)}
  for(const s of[-1,1])A(RK.rbox(1.18,2.6,.08,.02,1),wood,s*1.08,.15,-1.2);A(RK.rbox(1.0,.5,.08,.02,1),wood,0,1.25,-1.2);
  /* soute : portes parachutistes, treuils, véhicule assorti, rampe */
  for(const s of[-1,1]){
    const d=new THREE.Group();d.position.set(s*1.66,-.05,4.4);pvInteriorG.add(d);A(RK.rbox(.05,1.78,1.32,.02,1),M.std(0xb9bec2,.6,.3),0,0,0,d);PV.iDoors.push({g:d,z:4.4});
    A(RK.rbox(.1,.1,1.6,.03,1),panel,s*1.45,1.35,4.4);A(new THREE.CylinderGeometry(.008,.008,.6,6),panel,s*1.45,1.0,4.4);
  }
  pvVehicle(pvInteriorG,PV.paintMats[1]).position.set(0,-.62,3.2);
  PV.iRamp=new THREE.Group();PV.iRamp.position.set(0,-1.0,7.6);pvInteriorG.add(PV.iRamp);
  A(RK.rbox(2.7,.1,4.5,.04,2),metalFloor,0,0,2.25,PV.iRamp);for(let k=0;k<6;k++)A(RK.rbox(2.4,.03,.06,.01,1),panel,0,.06,.5+k*.7,PV.iRamp);
  for(const z of[-9,-3.2,3.2]){const l=new THREE.PointLight(z>0?0xe8f0ff:0xffe2b8,z>0?.45:.5,9,2);l.position.set(0,1.3,z);pvInteriorG.add(l)}
}

/* Animation du PV-40 (aile, hélices liées, train, portes) */
function updatePV(dt){
  const vt=Math.sin(S.tilt);
  PV.tilt.rotation.x=S.tilt;
  // les 4 hélices sont liées : elles tournent ensemble, en moulinet même gaz coupés
  const om=S.crashed?0:(S.thr>.02?16+42*S.thr:Math.min(S.aspd*.35,22));
  PV.propAng+=om*dt;
  const ds=1+.2*vt;   // diamètre des hélices augmenté en configuration verticale
  for(const pr of PV.props){pr.rotation.z=PV.propAng*pr.userData.dir;pr.scale.set(ds,ds,1)}
  for(const d of PV.discs){d.material.opacity=clamp((om-14)/40,0,1)*.32;d.scale.set(ds,ds,1)}
  PV.tailRotor.rotation.y+=dt*(vt>.25&&S.thr>.05?34*vt:0);
  // train : les boggies pivotent de 90° puis rentrent dans les sponsons
  const gp=S.gearPos,sw=(1-smooth(.55,1,gp))*Math.PI/2,rt=1-smooth(0,.55,gp);
  for(const g of PV.mains){g.rotation.y=sw;g.position.y=g.userData.y0+rt*1.0}
  PV.nose.rotation.x=-rt*Math.PI/2;
  const dp=S.doorsP;
  for(const d of PV.doors)d.g.position.z=d.z+1.35*smooth(0,.6,dp);
  for(const d of PV.iDoors)d.g.position.z=d.z+1.35*smooth(0,.6,dp);
  const ra=lerp(-.14,.47,smooth(.3,1,dp));PV.ramp.rotation.x=ra;PV.iRamp.rotation.x=ra;
}

function buildCockpit(){
  const M=RK.M,trim=M.alu(0x737d83,{roughness:.3}),shell=M.std(0x2a3238,.55,.35),soft=M.std(0x14191d,.88,0),leather=M.std(0x30302c,.82,0),warning=M.std(0xd9b21c,.5,0),
    glass=new THREE.MeshPhysicalMaterial({color:0xd8c38a,metalness:.08,roughness:.06,clearcoat:1,transparent:true,opacity:.09,side:THREE.DoubleSide,depthWrite:false}),
    glow=M.glow(0x164b3a,.65),suit=M.std(0x4a5040,.85,0),glove=M.std(0x1c1c1a,.75,0);
  const add=(geo,mat,x,y,z,parent=cockpitG)=>{
    if(geo.isBufferGeometry&&!geo.boundingSphere)geo.computeBoundingSphere();
    const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;
  };
  const tube=(points,r,mat)=>add(RK.tube(points,r,{seg:32,radial:8}),mat,0,0,0);
  const panelTex=RK.canvasTex(512,256,(g,w,h)=>{g.fillStyle='#262d32';g.fillRect(0,0,w,h);const r=RK.rng(11);
    for(let i=0;i<70;i++){const x=10+r()*(w-30),y=10+r()*(h-30);g.fillStyle='#11161a';g.fillRect(x,y,18,12);g.fillStyle=r()<.2?'#7dffb0':'#a8b2b8';g.fillRect(x+4,y+3,10,3)}
    g.fillStyle='#d8dde0';g.font='10px Arial';for(let i=0;i<20;i++)g.fillText(['FUEL','ECM','IFF','HYD','APU','LT','ICS','EXT'][i%8],10+r()*(w-40),20+r()*(h-20))});
  const consoleMat=M.std(0xffffff,.7,.1,{map:panelTex});
  const addScreen=(kind,x)=>{
    const c=document.createElement('canvas');c.width=512;c.height=320;
    const ctx=c.getContext('2d');
    if(!ctx)throw new Error('Impossible de créer les écrans du cockpit.');
    const texture=new THREE.CanvasTexture(c);texture.anisotropy=8;texture.encoding=THREE.sRGBEncoding;
    const m=add(new THREE.PlaneGeometry(.62,.39),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}),x,.48,-3.87);
    m.renderOrder=4;cockpitScreens.push({canvas:c,ctx,texture,kind});
  };
  // Vitrage intérieur doré et arceau arrière.
  const canopy=add(new THREE.SphereGeometry(1,32,20,0,Math.PI*2,0,Math.PI/2),glass,0,.73,-3.35);
  canopy.scale.set(.57,.55,1.69);canopy.renderOrder=1;
  tube([[-.55,.76,-1.98],[-.4,1.08,-1.98],[0,1.2,-1.98],[.4,1.08,-1.98],[.55,.76,-1.98]],.035,shell);
  // Rebords de cockpit avec consoles latérales texturées.
  for(const side of [-1,1]){
    add(RK.rbox(.16,.14,1.9,.04,2),shell,side*.66,.68,-2.62);
    add(RK.rbox(.24,.3,1.6,.04,2),shell,side*.66,.16,-2.85);
    add(new THREE.PlaneGeometry(.22,1.5).rotateX(-Math.PI/2),consoleMat,side*.66,.315,-2.85);
  }
  // Baquet, siège éjectable (poignée jaune), jambes et genoux du pilote visibles vers le bas.
  add(RK.rbox(1.05,.12,2.2,.04,2),soft,0,-.12,-2.78);
  add(RK.rbox(.62,.16,.6,.06,2),leather,0,.1,-1.9);
  add(RK.rbox(.62,.9,.18,.06,2),leather,0,.55,-1.58).rotation.x=-.12;
  add(RK.rbox(.42,.35,.2,.06,2),shell,0,1.15,-1.5);
  for(const s of[-1,1])add(RK.rbox(.05,.36,.05,.015,1),warning,s*.12,.24,-2.18);
  for(const s of[-1,1]){
    const th=RK.limbGeo(.5,.085,.075,1.08);const t=add(th,suit,s*.14,.22,-1.95);t.rotation.x=-1.42;
    const sh=RK.limbGeo(.46,.065,.05,1.05);const k=add(sh,suit,s*.14,.24,-2.45);k.rotation.x=-2.55;
    add(RK.rbox(.12,.12,.28,.04,2),glove,s*.14,-.06,-2.75);
  }
  // Planche de bord : grand écran panoramique, casquette anti-reflets.
  add(RK.loft([{z:-4.15,w:.85,t:.04,b:.1,y:.8,n:3},{z:-3.95,w:.92,t:.06,b:.12,y:.81,n:3.2},{z:-3.82,w:.9,t:.05,b:.1,y:.82,n:3}],{sides:28,sub:3}),shell,0,0,0);
  add(RK.rbox(1.42,.48,.06,.03,2),M.std(0x0b0e10,.4,.3),0,.47,-3.91);
  addScreen('pfd',-.34);addScreen('nav',.34);
  for(let side=-1;side<=1;side+=2){
    for(let i=0;i<6;i++){
      const x=side*(.83+(i%2)*.1),y=.28+Math.floor(i/2)*.1,z=-3.86;
      const sw=add(new THREE.CylinderGeometry(.02,.026,.028,12),i%3===0?glow:trim,x,y,z);
      sw.rotation.x=Math.PI/2;
    }
  }
  // Combinateur tête haute et symbologie lumineuse.
  const combiner=add(new THREE.PlaneGeometry(.72,.48),new THREE.MeshPhysicalMaterial({
    color:0x8dffcb,transparent:true,opacity:.075,roughness:.08,metalness:.12,side:THREE.DoubleSide,depthWrite:false
  }),0,1.08,-3.72);
  combiner.renderOrder=3;
  const hudMat=new THREE.LineBasicMaterial({color:0x8dffcb,transparent:true,opacity:.7,depthTest:false});
  const hudLines=new THREE.BufferGeometry().setFromPoints([
    new V3(-.19,1.08,-3.705),new V3(-.07,1.08,-3.705),new V3(.07,1.08,-3.705),new V3(.19,1.08,-3.705),
    new V3(0,1.16,-3.705),new V3(0,1.1,-3.705),new V3(-.28,.96,-3.705),new V3(.28,.96,-3.705)
  ]);
  hudLines.computeBoundingSphere();
  const sym=new THREE.LineSegments(hudLines,hudMat);cockpitG.add(sym);sym.renderOrder=4;
  const cabinLight=new THREE.PointLight(0x9edbc2,.85,5.5,2);
  cabinLight.position.set(0,1.3,-3.25);cockpitG.add(cabinLight);
  // Mini-manche latéral à droite, manette des gaz à gauche (HOTAS).
  const stick=new THREE.Group();cockpitG.add(stick);stick.position.set(.62,.33,-2.55);
  add(new THREE.CylinderGeometry(.03,.04,.12,12),trim,0,.06,0,stick);
  const grip=add(RK.lathe([[0,0],[.035,0],[.045,.06],[.042,.14],[.05,.2],[.03,.24],[0,.245]],16),soft,0,.1,0,stick);grip.rotation.x=-.2;
  add(RK.rbox(.03,.02,.03,.008,1),warning,0,.33,-.03,stick);add(RK.rbox(.02,.03,.02,.006,1),glow,.03,.3,-.05,stick);
  const thr=new THREE.Group();cockpitG.add(thr);thr.position.set(-.62,.33,-2.6);
  add(RK.rbox(.05,.03,.36,.01,1),trim,0,0,0,thr);
  add(RK.rbox(.09,.14,.14,.04,2),soft,0,.1,-.05,thr).rotation.x=.3;
  add(RK.rbox(.02,.02,.02,.006,1),glow,.04,.17,-.08,thr);
}

function updateCockpitScreens(time){
  if(time-cockpitScreenTime<.12)return;
  cockpitScreenTime=time;
  for(const screen of cockpitScreens){
    const {canvas,ctx,texture,kind}=screen,w=canvas.width,h=canvas.height;
    ctx.fillStyle='#071018';ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#28424a';ctx.lineWidth=2;ctx.strokeRect(7,7,w-14,h-14);
    ctx.font='600 18px "IBM Plex Mono",monospace';ctx.fillStyle='#8dffcb';
    if(kind==='pfd'){
      ctx.fillText('HORIZON  /  FLIGHT',20,32);
      ctx.save();ctx.beginPath();ctx.rect(118,48,276,190);ctx.clip();ctx.translate(256,143);ctx.rotate(-S.bank);
      const pitch=clamp(S.pitch*180/Math.PI,-45,45)*2.05;
      ctx.fillStyle='#173f59';ctx.fillRect(-240,-190+pitch,480,190);
      ctx.fillStyle='#624a34';ctx.fillRect(-240,pitch,480,190);
      ctx.strokeStyle='#d7e8e4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-230,pitch);ctx.lineTo(230,pitch);ctx.stroke();
      for(let a=-20;a<=20;a+=10){if(!a)continue;const y=pitch-a*2.05;ctx.beginPath();ctx.moveTo(-38,y);ctx.lineTo(-14,y);ctx.moveTo(14,y);ctx.lineTo(38,y);ctx.stroke()}
      ctx.restore();
      ctx.strokeStyle='#ffbd62';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(215,143);ctx.lineTo(242,143);ctx.moveTo(270,143);ctx.lineTo(297,143);ctx.moveTo(256,133);ctx.lineTo(256,143);ctx.stroke();
      ctx.fillStyle='#8dffcb';ctx.font='600 23px "IBM Plex Mono",monospace';
      ctx.fillText(String(Math.round(S.aspd*3.6)).padStart(3,'0'),24,112);
      ctx.fillText(String(Math.round(S.p.y)).padStart(5,'0'),404,112);
      ctx.font='14px "IBM Plex Mono",monospace';ctx.fillStyle='#a9c5ca';
      ctx.fillText('KIAS',29,132);ctx.fillText('ALT m',410,132);
      ctx.fillStyle=S.mach>=1?'#ffbd62':'#8dffcb';ctx.font='600 17px "IBM Plex Mono",monospace';
      ctx.fillText('M '+S.mach.toFixed(2),23,170);
      ctx.fillStyle='#8dffcb';ctx.font='600 20px "IBM Plex Mono",monospace';
      ctx.fillText(String(Math.round(S.hdg)).padStart(3,'0')+'°',220,276);
      ctx.font='14px "IBM Plex Mono",monospace';ctx.fillStyle=S.stall>.25?'#ff6b5e':'#ffbd62';
      ctx.fillText(S.stall>.25?'STALL':(S.gearPos>.5?'GEAR DN':'GEAR UP'),20,294);
      ctx.fillStyle='#8dffcb';ctx.textAlign='right';ctx.fillText('G '+S.G.toFixed(1),492,294);ctx.textAlign='left';
      ctx.strokeStyle='#8dffcb';ctx.beginPath();ctx.moveTo(118,250);ctx.lineTo(394,250);ctx.stroke();
    }else{
      const di=destInfo(),cx=256,cy=161,scale=.065;
      ctx.fillText('TACTICAL  /  NAV',20,32);
      ctx.strokeStyle='#24434a';ctx.lineWidth=1;
      for(let x=48;x<w;x+=52){ctx.beginPath();ctx.moveTo(x,54);ctx.lineTo(x,270);ctx.stroke()}
      for(let y=64;y<270;y+=42){ctx.beginPath();ctx.moveTo(25,y);ctx.lineTo(487,y);ctx.stroke()}
      ctx.save();ctx.translate(cx,cy);ctx.rotate(-S.hdg*Math.PI/180);
      ctx.strokeStyle='#8dffcb';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,102,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,-116);ctx.lineTo(-8,-98);ctx.lineTo(8,-98);ctx.closePath();ctx.fillStyle='#8dffcb';ctx.fill();
      ctx.setLineDash([7,5]);ctx.strokeStyle='#ffbd62';ctx.beginPath();
      ctx.moveTo(0,0);ctx.lineTo(clamp(di.a.x-S.p.x,-1400,1400)*scale,-clamp(di.a.z-S.p.z,-1400,1400)*scale);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='#ffbd62';ctx.beginPath();ctx.arc(clamp(di.a.x-S.p.x,-1400,1400)*scale,-clamp(di.a.z-S.p.z,-1400,1400)*scale,6,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(8,10);ctx.lineTo(0,6);ctx.lineTo(-8,10);ctx.closePath();ctx.fill();ctx.restore();
      ctx.fillStyle='#ffbd62';ctx.font='600 17px "IBM Plex Mono",monospace';
      ctx.fillText(di.a.name.toUpperCase(),20,294);
      ctx.textAlign='right';ctx.fillText((di.dist/1000).toFixed(1)+' KM',492,294);ctx.textAlign='left';
      ctx.fillStyle='#a9c5ca';ctx.font='14px "IBM Plex Mono",monospace';
      ctx.fillText('TRK '+Math.round(di.brg).toString().padStart(3,'0')+'°   VS '+S.vs.toFixed(1)+' m/s',20,52);
    }
    texture.needsUpdate=true;
  }
}
function updateCockpitHud(){
  const visible=running&&!menuOpen&&!mapOpen&&isInside()&&!S.crashed;
  const hud=$('cockpitHud');hud.hidden=!visible;
  if(!visible)return;
  $('cockpitSpeed').textContent=String(Math.round(S.aspd*3.6));
  const mach=$('cockpitMach');
  const transonic=S.mach>=.8&&!S.supersonic;
  mach.textContent='MACH '+S.mach.toFixed(2)+(transonic?' · TRANSONIQUE':S.supersonic?' · SUPERSONIQUE':'');
  mach.classList.toggle('supersonic',transonic||S.supersonic);
  const power=Math.round(S.thr*100);
  $('cockpitPowerValue').textContent=power+' %'+(S.abL>.05?' · POST-COMBUSTION':'')+(ACF.id==='pv40'?' · AILE '+Math.round(S.tilt*180/Math.PI)+'°':'');
  const fill=$('cockpitPowerFill');fill.style.width=power+'%';fill.classList.toggle('boost',S.abL>.05);
}
function buildChute(){
  chuteG=new THREE.Group();chuteG.visible=false;
  const m=new THREE.MeshPhongMaterial({color:0xff6a2e,side:THREE.DoubleSide,shininess:20,emissive:0x331005});
  const dome=new THREE.Mesh(new THREE.SphereGeometry(6,20,10,0,Math.PI*2,0,Math.PI/2).rotateX(Math.PI/2),m);dome.position.z=34;chuteG.add(dome);
  const st=new THREE.Mesh(new THREE.SphereGeometry(6.02,20,10,0,Math.PI*2,Math.PI/2.4,Math.PI/9).rotateX(Math.PI/2),new THREE.MeshPhongMaterial({color:0xffffff,side:THREE.DoubleSide}));st.position.z=34;chuteG.add(st);
  const pts=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2;pts.push(new V3(0,0,0),new V3(Math.cos(a)*6,Math.sin(a)*6,34))}
  chuteG.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xdddddd})));
  chuteG.position.z=5;planeG.add(chuteG);
}
/* ===== Particules (fumée, vapeur, explosion) ===== */
const PN=2200;
const P={pos:new Float32Array(PN*3),col:new Float32Array(PN*3),size:new Float32Array(PN),alpha:new Float32Array(PN),
  vel:new Float32Array(PN*3),age:new Float32Array(PN).fill(9),life:new Float32Array(PN).fill(1),s0:new Float32Array(PN),s1:new Float32Array(PN),a0:new Float32Array(PN),i:0};
const partU={scale:{value:600}};
let partPts,sonicMachCone,vaporMaterial,vaporCloud,vaporPuffs=[],sonicHudLife=0;
function buildParticles(){
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(P.pos,3));g.setAttribute('col',new THREE.BufferAttribute(P.col,3));
  g.setAttribute('size',new THREE.BufferAttribute(P.size,1));g.setAttribute('alpha',new THREE.BufferAttribute(P.alpha,1));
  partPts=new THREE.Points(g,new THREE.ShaderMaterial({uniforms:partU,transparent:true,depthWrite:false,
   vertexShader:'attribute float size;attribute float alpha;attribute vec3 col;varying float vA;varying vec3 vC;uniform float scale;void main(){vA=alpha;vC=col;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=min(size*scale/max(-mv.z,1.),300.);}',
   fragmentShader:'varying float vA;varying vec3 vC;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vC,smoothstep(.5,.05,d)*vA);}'}));
  partPts.frustumCulled=false;partPts.renderOrder=5;scene.add(partPts);
}
function emit(x,y,z,vx,vy,vz,life,s0,s1,r,g,b,a){
  const i=P.i;P.i=(i+1)%PN;const k=i*3;
  P.pos[k]=x;P.pos[k+1]=y;P.pos[k+2]=z;P.vel[k]=vx;P.vel[k+1]=vy;P.vel[k+2]=vz;P.col[k]=r;P.col[k+1]=g;P.col[k+2]=b;
  P.age[i]=0;P.life[i]=life;P.s0[i]=s0;P.s1[i]=s1;P.a0[i]=a;P.size[i]=s0;P.alpha[i]=a;
}
function updateParticles(dt){
  for(let i=0;i<PN;i++){
    if(P.age[i]>=P.life[i]){P.alpha[i]=0;continue}
    P.age[i]+=dt;const t=Math.min(P.age[i]/P.life[i],1),k=i*3;
    P.pos[k]+=P.vel[k]*dt;P.pos[k+1]+=P.vel[k+1]*dt;P.pos[k+2]+=P.vel[k+2]*dt;
    P.size[i]=lerp(P.s0[i],P.s1[i],t);P.alpha[i]=P.a0[i]*(1-t)*(1-t);
  }
  const g=partPts.geometry;g.attributes.position.needsUpdate=g.attributes.alpha.needsUpdate=g.attributes.size.needsUpdate=g.attributes.col.needsUpdate=true;
}
function explode(p){
  for(let i=0;i<110;i++){const a=rnd()*6.283,e=rnd()*3.1416-1.57,s=10+rnd()*55,ce=Math.cos(e);
    emit(p.x,p.y+3,p.z,Math.cos(a)*ce*s,Math.sin(e)*s*.9+14,Math.sin(a)*ce*s,1.4+rnd()*1.6,6,30+rnd()*20,1,.45+rnd()*.35,.1,.9)}
  for(let i=0;i<90;i++){const a=rnd()*6.283,s=4+rnd()*24;
    emit(p.x,p.y+4,p.z,Math.cos(a)*s,10+rnd()*28,Math.sin(a)*s,4+rnd()*4,10,60+rnd()*50,.12,.11,.1,.75)}
}

/* ===== Lignes de vitesse ===== */
const SL_N=650,SL_BOX=[260,150,260];
let slLines,slBase;
function buildSpeedLines(){
  slBase=new Float32Array(SL_N*3);for(let i=0;i<SL_N;i++){slBase[i*3]=rnd()*SL_BOX[0];slBase[i*3+1]=rnd()*SL_BOX[1];slBase[i*3+2]=rnd()*SL_BOX[2]}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(SL_N*6),3));
  slLines=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0,fog:false,depthWrite:false}));
  slLines.frustumCulled=false;slLines.renderOrder=6;scene.add(slLines);
}
const wrapR=(v,c,s)=>((v-c)%s+s*1.5)%s-s/2;
function updateSpeedLines(cam,vel,speed){
  const mach=S.mach,op=Math.max(clamp((speed-50)/160,0,1)*.35,clamp((mach-.78)/.5,0,1)*.65);
  slLines.material.opacity=op;slLines.visible=op>.01;if(!slLines.visible)return;
  const a=slLines.geometry.attributes.position.array,len=clamp(speed*.03,2,45)/Math.max(speed,1);
  for(let i=0;i<SL_N;i++){
    const x=cam.x+wrapR(slBase[i*3],cam.x,SL_BOX[0]),y=cam.y+wrapR(slBase[i*3+1],cam.y,SL_BOX[1]),z=cam.z+wrapR(slBase[i*3+2],cam.z,SL_BOX[2]),k=i*6;
    a[k]=x;a[k+1]=y;a[k+2]=z;a[k+3]=x-vel.x*len;a[k+4]=y-vel.y*len;a[k+5]=z-vel.z*len;
  }
  slLines.geometry.attributes.position.needsUpdate=true;
}

/* ===== Ombre au sol ===== */
let shadowMesh;
function buildShadow(){
  const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,2,32,32,31);
  gr.addColorStop(0,'rgba(0,0,0,.9)');gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);
  shadowMesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  shadowMesh.renderOrder=2;scene.add(shadowMesh);
}

/* ===== Son ===== */
let AC=null,aEng,aEng2,aEngG,aEngF,aJet,aJetG,aJetF,aWind,aWindG,aWindF,aHorn,aHornG,soundOn=true,aMaster,engineNoiseBuffer,sonicBoomBuffer;
function initAudio(){
  if(AC){AC.resume&&AC.resume();return}
  try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){return}
  aMaster=AC.createGain();aMaster.gain.value=0;aMaster.connect(AC.destination);
  aEng=AC.createOscillator();aEng.type='triangle';aEng.frequency.value=48;
  aEng2=AC.createOscillator();aEng2.type='sawtooth';aEng2.frequency.value=96;
  aEngF=AC.createBiquadFilter();aEngF.type='lowpass';aEngF.frequency.value=420;aEngF.Q.value=.45;
  aEngG=AC.createGain();aEngG.gain.value=0;
  aEng.connect(aEngF);aEng2.connect(aEngF);aEngF.connect(aEngG);aEngG.connect(aMaster);aEng.start();aEng2.start();
  engineNoiseBuffer=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);
  const d=engineNoiseBuffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  sonicBoomBuffer=AC.createBuffer(1,Math.ceil(AC.sampleRate*1.25),AC.sampleRate);
  const boomData=sonicBoomBuffer.getChannelData(0),lowAlpha=1-Math.exp(-2*Math.PI*110/AC.sampleRate),midAlpha=1-Math.exp(-2*Math.PI*1400/AC.sampleRate);
  let low=0,mid=0;
  for(let i=0;i<boomData.length;i++){
    const t=i/AC.sampleRate,noise=Math.random()*2-1;
    low+=lowAlpha*(noise-low);mid+=midAlpha*(noise-mid);
    const high= noise-mid,first=Math.exp(-t*75),second=t>.075?.72*Math.exp(-(t-.075)*65):0;
    const rumble=(Math.sin(t*2*Math.PI*48)+.35*Math.sin(t*2*Math.PI*82))*Math.exp(-t*4.2);
    boomData[i]=clamp((first+second)*high*.34+low*Math.exp(-t*2.4)*.8+rumble*.42,-1,1);
  }
  aJet=AC.createBufferSource();aJet.buffer=engineNoiseBuffer;aJet.loop=true;aJetF=AC.createBiquadFilter();aJetF.type='lowpass';aJetF.frequency.value=700;
  aJetG=AC.createGain();aJetG.gain.value=0;aJet.connect(aJetF);aJetF.connect(aJetG);aJetG.connect(aMaster);aJet.start();
  aWind=AC.createBufferSource();aWind.buffer=engineNoiseBuffer;aWind.loop=true;aWindF=AC.createBiquadFilter();aWindF.type='bandpass';aWindF.frequency.value=500;aWindF.Q.value=.45;
  aWindG=AC.createGain();aWindG.gain.value=0;aWind.connect(aWindF);aWindF.connect(aWindG);aWindG.connect(aMaster);aWind.start();
  aHorn=AC.createOscillator();aHorn.type='square';aHorn.frequency.value=880;aHornG=AC.createGain();aHornG.gain.value=0;aHorn.connect(aHornG);aHornG.connect(aMaster);aHorn.start();
}
function playSonicBoom(){
  if(!AC||!sonicBoomBuffer||!soundOn||isInside())return;
  const t=AC.currentTime;
  const boom=AC.createBufferSource(),filter=AC.createBiquadFilter(),gain=AC.createGain();
  boom.buffer=sonicBoomBuffer;filter.type='lowpass';filter.frequency.value=1600;filter.Q.value=.5;
  boom.connect(filter);filter.connect(gain);gain.connect(aMaster);
  const altitudeLevel=clamp(1-Math.max(S.p.y,0)/18000,.12,1);
  gain.gain.setValueAtTime(.68*altitudeLevel,t);gain.gain.setTargetAtTime(.0001,t+1.05,.12);
  boom.start(t);boom.stop(t+1.25);
}
function updateAudio(){
  if(!AC)return;const t=AC.currentTime,on=soundOn&&running&&!menuOpen&&!S.crashed;
  aMaster.gain.setTargetAtTime(on?(isInside()?.085:.55):0,t,.18);
  const pv=ACF.id==='pv40',thr=S.thr,rpm=clamp(thr*.72+S.abL*.28,0,1),pitch=pv?58+thr*34+Math.min(S.aspd,250)*.02:42+rpm*62+Math.min(S.aspd,420)*.035;
  aEng.frequency.setTargetAtTime(pitch,t,.22);aEng2.frequency.setTargetAtTime(pitch*2.03,t,.22);
  aEngF.frequency.setTargetAtTime(260+rpm*520,t,.25);aJetF.frequency.setTargetAtTime(420+rpm*760,t,.25);
  aEngG.gain.setTargetAtTime(on?.035+.18*rpm+.1*S.abL:0,t,.18);
  aJetG.gain.setTargetAtTime(on?(.008+.08*rpm+.05*S.abL)*(pv?.35:1):0,t,.2);
  aWindG.gain.setTargetAtTime(on?clamp(S.aspd/340,0,1)**2*(isInside()?.012:.14)*(S.onGround?.45:1):0,t,.25);aWindF.frequency.setTargetAtTime(250+S.aspd*2.2,t,.25);
  const horn=on&&(S.stall>.25||(S.agl>3&&S.agl<160&&S.vs<-Math.max(5,S.agl/4)&&!S.onGround))&&(Math.floor(t*5)%2===0);
  aHornG.gain.setTargetAtTime(horn?.018:0,t,.04);
}
/* ===== État de vol et commandes ===== */
const S={p:new V3(),v:new V3(),q:new Q4(),thr:0,flaps:1,gear:true,gearPos:1,brake:false,onGround:true,crashed:false,
 spin:0,spinDir:1,stall:0,alpha:0,beta:0,G:1,aspd:0,mach:0,supersonic:false,agl:0,vs:0,bank:0,pitch:0,hdg:0,air:0,stallDir:1,assist:true,ab:false,abL:0,upPrev:false,noz:0,nozT:0,chute:false,chuteP:0,holdP:0,
 tilt:0,tiltT:0,doors:false,doorsP:0,vbrake:true,reverse:false};
const inp={pitch:0,roll:0,yaw:0};
const keys={};
let touchStick=null,running=false,menuOpen=true,mapOpen=false,camMode=0,curAp=0,startMode='runway',dest=1,lastTouch=-9;
const Y_AXIS=new V3(0,1,0);
const speedOfSound=alt=>clamp(340-Math.max(alt,0)*.003,295,340);

function slew(c,t,dt){const rate=(t===0||(c!==0&&Math.sign(t)!==Math.sign(c)))?9:6;return approach(c,t,rate*dt)}
function readInputs(dt){
  const k=keys;
  let tp=((k.KeyW||k.ArrowDown)?1:0)-((k.KeyS||k.ArrowUp)?1:0),tr=((k.KeyD||k.ArrowRight)?1:0)-((k.KeyA||k.ArrowLeft)?1:0),ty=(k.KeyE?1:0)-(k.KeyQ?1:0);
  if(touchStick){inp.pitch=touchStick.pitch;inp.roll=touchStick.roll;inp.yaw=slew(inp.yaw,ty,dt)}
  else{inp.pitch=slew(inp.pitch,tp,dt);inp.roll=slew(inp.roll,tr,dt);inp.yaw=slew(inp.yaw,ty,dt)}
  const up=(k.ShiftLeft||k.ShiftRight||k.PageUp)?1:0,dn=(k.ControlLeft||k.ControlRight||k.PageDown)?1:0;
  if(up&&!S.upPrev&&S.thr>=.999&&ACF.id!=='pv40')S.ab=true;S.upPrev=!!up;
  if(dn||S.thr<.999||S.noz>.2||ACF.id==='pv40')S.ab=false;
  if(up)S.reverse=false;
  if(up||dn){S.thr=clamp(S.thr+(up-dn)*.8*dt,0,1);const t=$('thr');if(t)t.value=Math.round(S.thr*100)}
  S.brake=!!k.Space||touchBrake;
}
let touchBrake=false;

/* ===== Avions : caractéristiques =====
   Poussées et accélérations en m/s² (poussée / masse). Rapport poussée/poids = poussée / 9,81. */
const AIRCRAFT={
 f35:{id:'f35',name:'F-35B Lightning II',kind:'jet',
   tmil:5.8,tab:4.4,ram:.45,tvtol:13.5,                 // à sec 0,6 g · post-combustion 1,0 g · ram (effet de compression) en supersonique
   cd0:.0175,cdSuper:.0076,wave:.012,k:.065,cla:5,clmax:1.35,gmax:13,
   vrot:48,vstall:44,pitchLo:.08,pitchHi:.47,pitchFast:.78,rollLo:1.2,rollHi:3.8,rollV:[80,260],yaw:.45,
   gearH:2.05,bellyH:1.15,hit:[[-8.2,-.2,3],[8.2,-.2,3],[0,0,-8.5],[0,.4,5.5,.5]],
   camDist:21,camH:4.6,cockpit:[0,.91,-2.48],tips:[[-8.3,-.2,3.4],[8.3,-.2,3.4]],exhaust:[0,0,7],shadow:22},
 pv40:{id:'pv40',name:'PV-40',kind:'tiltwing',
   tstat:12,tvtol:14.5,power:1080,                      // 4 turbopropulseurs : poussée statique 1,2 g (aile à plat) à 1,5 g (aile verticale)
   cd0:.0165,k:.05,cla:5.2,clmax:1.55,gmax:7,
   vrot:30,vstall:33,pitchLo:.1,pitchHi:.55,pitchFast:.35,rollLo:1,rollHi:2.6,rollV:[50,180],yaw:.45,
   gearH:3.05,bellyH:1.75,hit:[[-16.9,2.1,-1.6],[16.9,2.1,-1.6],[0,-.3,-16.6],[0,.45,12,.6],[0,1.5,16.6,.6]],
   camDist:44,camH:9,cockpit:[-.62,1.18,-13.6],cabin:[.15,.42,-12.0],bay:[1.05,.8,-1.3],tips:[[-16.9,2,-1.2],[16.9,2,-1.2]],exhaust:null,shadow:40}
};
let ACF=AIRCRAFT.f35;
const TILT_RATE=.27;   // vitesse de basculement de l'aile (≈ 15°/s)

/* ===== Physique ===== */
const K_LIFT=.005,GRAV=9.81;
const _f=new V3(),_u=new V3(),_r=new V3(),_vh=new V3(),_tmp=new V3(),_n=new V3(),_qi=new Q4(),_dq=new Q4(),_w=new V3(),_vb=new V3(),_ld=new V3(),_td=new V3();
function physics(dt,time){
  if(S.crashed)return;
  const A=ACF,pv=A.id==='pv40',q=S.q,p=S.p,v=S.v;
  if(pv)S.tilt=approach(S.tilt,S.tiltT,dt*TILT_RATE);
  else{if(S.aspd>140)S.nozT=0;S.noz=approach(S.noz,S.nozT,dt*.5)}
  S.chuteP=approach(S.chuteP,S.chute?1:0,dt*2);S.doorsP=approach(S.doorsP,S.doors?1:0,dt*.4);
  const vt=pv?Math.sin(S.tilt):S.noz;                   // part de vol vertical (0 = avion, 1 = vertical)
  const thrAng=pv?S.tilt:S.noz*Math.PI/2;
  _f.set(0,0,-1).applyQuaternion(q);_u.set(0,1,0).applyQuaternion(q);_r.set(1,0,0).applyQuaternion(q);
  const rho=Math.exp(-Math.max(p.y,0)/9000),speed=v.length();S.aspd=speed;
  const mach=speed/speedOfSound(p.y);
  if(!S.supersonic&&S.mach<1&&mach>=1){S.supersonic=true;triggerSonicWave()}
  else if(S.supersonic&&mach<.97)S.supersonic=false;
  S.mach=mach;
  _qi.copy(q).invert();_vb.copy(v).applyQuaternion(_qi);
  const alpha=speed>1?Math.atan2(-_vb.y,-_vb.z):0,beta=speed>1?Math.asin(clamp(_vb.x/speed,-1,1)):0;
  S.alpha=alpha;S.beta=beta;
  S.bank=Math.atan2(-_r.y,_u.y);S.pitch=Math.asin(clamp(_f.y,-1,1));S.hdg=((Math.atan2(_f.x,-_f.z)*180/Math.PI)+360)%360;
  S.vs=v.y;
  /* aérodynamique */
  const fl=S.flaps,cl0=.035+fl*.12,CLa=A.cla,CLmax=A.clmax+fl*.2,aa=Math.abs(alpha);
  // Décrochage : l'aile du PV-40 basculée reste soufflée par les hélices
  const st=speed>8?smooth(.36,.56,aa)*(1-clamp(vt*1.5,0,1)):0;S.stall=st;
  const qk=K_LIFT*rho*speed*speed;
  let CL=clamp(CLa*alpha+cl0,-CLmax*.8,CLmax)*(1-.7*st);
  {const cap=A.gmax*GRAV/Math.max(qk,1);CL=clamp(CL,-cap*.5,cap)}   // facteur de charge maximal de la cellule
  CL=lerp(CL,Math.sin(2*alpha),smooth(.35,.7,aa));CL*=1-.85*S.spin;
  if(pv)CL*=1-.6*vt;
  const cd0=pv?A.cd0+.03*smooth(.7,.85,mach)
    :lerp(A.cd0,A.cdSuper,smooth(1,2,mach))+A.wave*smooth(.85,1.02,mach)*(1-smooth(1.05,1.7,mach));
  const CD=cd0+.02*S.gearPos+fl*.018+A.k*CL*CL+1.2*Math.sin(alpha)**2*smooth(.2,.6,aa)+.15*st+(pv?.12*vt*vt+.02*S.doorsP:0);
  let ax=0,ay=-GRAV-7*S.spin,az=0;
  if(speed>.5){
    _vh.copy(v).multiplyScalar(1/speed);_ld.crossVectors(_r,_vh);const ll=_ld.length();if(ll>1e-4)_ld.multiplyScalar(1/ll);else _ld.copy(_u);
    const aL=qk*CL,aD=qk*CD;
    ax+=_ld.x*aL-_vh.x*aD;ay+=_ld.y*aL-_vh.y*aD;az+=_ld.z*aL-_vh.z*aD;
    const sf=-v.dot(_r)*1.6*Math.min(1,speed/35);ax+=_r.x*sf;ay+=_r.y*sf;az+=_r.z*sf;
    S.G=(_ld.dot(_u)*aL)/GRAV;
    if(S.chuteP>0){const ac=Math.min(.0045*rho*speed*speed+1.5,90)*S.chuteP;ax-=_vh.x*ac;ay-=_vh.y*ac;az-=_vh.z*ac}
  }else S.G=1;
  /* poussée */
  const cn=Math.cos(thrAng),sn=Math.sin(thrAng);
  _td.set(_f.x*cn+_u.x*sn,_f.y*cn+_u.y*sn,_f.z*cn+_u.z*sn);
  let T;
  if(pv){
    // Hélices : poussée statique limitée par la puissance quand la vitesse augmente ; puissance réduite au-dessus de 30 000 ft
    const lapse=Math.pow(rho,.7)*(1-.85*smooth(9144,10600,p.y));
    const vAl=Math.max(v.dot(_td),0);
    T=S.thr*lapse*Math.min(lerp(A.tstat,A.tvtol,vt),A.power/Math.max(vAl,1));
    if(S.reverse&&S.onGround)T=-3.5;   // hélices en pas inverse au sol
    S.abL=0;
  }else{
    S.abL=approach(S.abL,(S.ab&&S.thr>.99)?1:0,dt*(S.ab?1.8:3));
    const conv=(A.tmil*S.thr+A.tab*S.abL)*Math.pow(rho,.75)*(1+A.ram*clamp(mach,0,2.6));
    T=lerp(conv,A.tvtol*S.thr*Math.pow(rho,.7),S.noz);
  }
  ax+=_td.x*T;ay+=_td.y*T;az+=_td.z*T;
  if(vt>0){
    if(!pv){ay-=.6*vt*v.y;ax-=.15*vt*v.x;az-=.15*vt*v.z}
    else if(S.vbrake&&!S.onGround){const k=smooth(.5,1,vt)*(1-smooth(25,45,speed));ay-=.35*k*v.y;ax-=.45*k*v.x;az-=.45*k*v.z}  // freins VTOL
  }
  /* commandes angulaires */
  let wx=0,wy=0,wz=0;
  const airControl=smooth(25,100,speed),eff=Math.max(airControl,vt*(pv?1:.35));
  if(!S.onGround){
    const ctl=1-.8*S.spin;
    const pitchRate=A.pitchLo+clamp(speed/180,0,1)*A.pitchHi+A.pitchFast*smooth(140,330,speed);
    const rollRate=lerp(A.rollLo,A.rollHi,smooth(A.rollV[0],A.rollV[1],speed));
    const vb=pv&&S.vbrake?1-.35*vt:1;                     // les freins VTOL adoucissent les commandes
    wx=inp.pitch*pitchRate*airControl*(1-.6*st)*ctl+inp.pitch*vt*(pv?.75:.25)*vb;
    wz=-inp.roll*(rollRate*airControl+(pv?.8:.4)*vt*vb)*(1-.4*st)*ctl;
    wy=-inp.yaw*(A.yaw*eff+(pv?.5*vt:0))*ctl;
    // Stabilité de girouette : le nez suit la trajectoire, même lentement (un avion trop lent pique du nez)
    const wv=smooth(6,60,speed)*(1-S.spin)*(1-vt);
    wy+=-1.6*Math.sin(beta)*wv;
    const aEx=alpha-clamp(alpha,-.08,.2);                  // au-delà de l'incidence de vol normale
    wx+=-1.7*Math.sin(aEx)*wv*(1-.6*Math.abs(inp.pitch));
    // Pilotage assisté : seulement en vol normal, au-dessus de la vitesse de décrochage
    const vs1=A.vstall/Math.sqrt(rho);
    if(S.assist&&S.spin<.01&&_u.y>.2&&st<.05&&(speed>vs1*1.12||vt>.4)){
      if(Math.abs(inp.pitch)<.05&&vt<.25){
        const cosg=Math.cos(Math.asin(clamp(v.y/Math.max(speed,1),-1,1))),cb=Math.max(Math.cos(S.bank),.5);
        const aT=clamp((GRAV*cosg/cb-qk*cl0)/(qk*CLa+T+1),-.12,.18);
        wx+=clamp(3*(aT-alpha),-.5,.5);
        const apy=ay-(ax*_vh.x+ay*_vh.y+az*_vh.z)*_vh.y,gd=apy/Math.max(speed*Math.max(cosg,.2),5);wx+=clamp(-.6*gd,-.6,.6);
      }
      if(Math.abs(inp.roll)<.05&&Math.abs(S.bank)<1.35)wz+=clamp(2.5*S.bank,-2.5,2.5);
    }
    if(vt>=.25){if(Math.abs(inp.pitch)>.05)S.holdP=S.pitch;else if(S.assist||(pv&&S.vbrake))wx+=clamp((S.holdP-S.pitch)*2.5,-.8,.8)}else S.holdP=S.pitch;
    if(pv&&S.vbrake&&vt>.5&&Math.abs(inp.roll)<.05)wz+=clamp(2.2*S.bank,-1.5,1.5);
    if(S.assist&&S.agl<8&&S.vs<8&&inp.pitch>0){const lim=pv?.2:.26;wx=Math.min(wx,Math.max(0,(lim-S.pitch)*3))}
    // Décrochage : la portance s'effondre et le nez tombe
    if(st<.02)S.stallDir=Math.sign(inp.yaw+inp.roll*.5)||S.stallDir;
    if(st>.05){wx+=-Math.sign(alpha)*1.3*st*(1-S.spin);wz+=S.stallDir*1.5*st}
    if(S.spin<.01&&st>.3&&Math.abs(inp.yaw)>.35){S.spin=.05;S.spinDir=-Math.sign(inp.yaw)}
    if(S.spin>0){
      const hold=-Math.sign(inp.yaw)===S.spinDir&&Math.abs(inp.yaw)>.35;let dec=0;
      if(inp.pitch<-.4)dec+=1.6;if(inp.yaw*S.spinDir>.35)dec+=1.2;if(Math.abs(inp.yaw)<.1)dec+=.1;if(speed>85)dec+=.8;
      S.spin=clamp(S.spin+((hold?.9:0)-dec)*dt,0,1);
      q.premultiply(_dq.setFromAxisAngle(Y_AXIS,S.spinDir*S.spin*2.3*dt));
      wx+=clamp((-.85-S.pitch)*1.8,-1,1)*S.spin;
      wz+=(clamp(1.2*S.bank,-1,1)+.8*Math.sin(time*2.7))*S.spin;
    }
  }else{
    S.spin=0;S.holdP=S.pitch;
    const gp=Math.atan2(groundH(p.x+_f.x*12,p.z+_f.z*12)-groundH(p.x-_f.x*12,p.z-_f.z*12),24);
    wy=-(inp.yaw+inp.roll*.6)*.35*clamp((speed-(pv?4:30))/(pv?10:30),0,1)-(pv?inp.yaw*.25*vt:0);
    wz=clamp(S.bank*4,-2,2);
    if(inp.pitch>.05&&speed>A.vrot)wx=S.pitch<.22?inp.pitch*.2*clamp((speed-A.vrot)/18,0,1):0;
    else wx=clamp((gp-S.pitch)*2.5,-1,1);
  }
  _w.set(wx,wy,wz);const ang=_w.length()*dt;if(ang>1e-6){_dq.setFromAxisAngle(_w.normalize(),ang);q.multiply(_dq).normalize()}
  /* intégration */
  v.x+=ax*dt;v.y+=ay*dt;v.z+=az*dt;p.addScaledVector(v,dt);
  /* contact avec le sol */
  const gy=groundH(p.x,p.z),water=gy<0,sy=Math.max(gy,0),gh=S.gearPos>.6?A.gearH:A.bellyH;
  S.agl=p.y-gh-sy;
  if(p.y-gh<=sy){
    groundNormal(p.x,p.z,_n);if(water)_n.set(0,1,0);
    const vn=v.dot(_n),sink=Math.max(0,-vn);let why=null;
    // Le PV-40 est léger et solide : il peut se poser sur l'eau ou glisser sur le ventre
    if(water&&speed>8&&!(pv&&speed<45&&sink<4))why='Amerrissage forcé. L\'avion ne flotte pas.';
    else if(S.gearPos<.6&&!(pv&&sink<3&&speed<70))why='Atterrissage train rentré.';
    else if(sink>(pv?8.5:7.5))why='Impact trop violent ('+sink.toFixed(1)+' m/s de descente).';
    else if(Math.abs(S.bank)>.5)why='Une aile a touché le sol.';
    else if(S.pitch<-.3&&speed>20)why='Le nez a touché le sol en premier.';
    else if(_n.y<.84&&speed>18)why='Collision avec la pente.';
    if(why){crash(why);return}
    if(S.air>.6)touchdown(sink,speed);
    if(S.chute&&speed<6)S.chute=false;
    S.onGround=true;S.air=0;p.y=sy+gh;if(vn<0)v.addScaledVector(_n,-vn);
    const hv=Math.hypot(v.x,v.z);
    const fric=(water?2.2:S.gearPos<.6?3.5:.35)+(S.brake?6.5:0)+(S.reverse&&pv?2:0);
    if(hv>.01){const d=Math.min(hv,fric*dt);v.x-=v.x/hv*d;v.z-=v.z/hv*d}
    v.addScaledVector(_r,-v.dot(_r)*Math.min(1,10*dt));
    if(hv<.6&&S.thr<.08)v.set(0,0,0);
  }else{S.onGround=false;S.air+=dt}
  /* collision du corps avec le relief */
  const pts=S.onGround?A.hit.slice(0,2):A.hit;
  for(const c of pts){
    _tmp.set(c[0],c[1],c[2]).applyQuaternion(q).add(p);
    const g2=groundH(_tmp.x,_tmp.z);
    const tol=c[3]||0;   // la queue peut racler la piste sans casser
    if(_tmp.y<Math.max(g2,0)+.1-tol){crash(g2<0?'Impact dans l\'eau.':'Collision avec le relief.');return}
    if(tol&&_tmp.y<Math.max(g2,0)+.1&&!S.scrapeMsg){S.scrapeMsg=true;showMsg('QUEUE RACLÉE','Cabre moins vite au décollage','warn',2)}
  }
}
function buildSonicWave(){
  const coneMaterial=new THREE.MeshBasicMaterial({color:0xc9eaff,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,fog:true,blending:THREE.AdditiveBlending});
  sonicMachCone=new THREE.Mesh(new THREE.ConeGeometry(1,1,48,1,true),coneMaterial);
  sonicMachCone.rotation.x=Math.PI/2;sonicMachCone.position.z=60;
  sonicMachCone.visible=false;sonicMachCone.renderOrder=4;planeG.add(sonicMachCone);

  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
  const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(128,128);
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){
    const nx=(x-63.5)/63.5,ny=(y-63.5)/63.5,r=Math.hypot(nx,ny),edge=.8+fbm(nx*5+2,ny*5-1,3)*.23;
    const alpha=Math.pow(clamp((edge-r)/.4,0,1),1.45)*.58,index=(y*128+x)*4;
    pixels.data[index]=255;pixels.data[index+1]=255;pixels.data[index+2]=255;pixels.data[index+3]=alpha*255;
  }
  ctx.putImageData(pixels,0,0);
  const cloudTexture=new THREE.CanvasTexture(canvas);
  vaporMaterial=new THREE.SpriteMaterial({map:cloudTexture,color:0xf3f9ff,transparent:true,opacity:0,depthWrite:false,fog:true});
  vaporCloud=new THREE.Group();vaporCloud.renderOrder=5;planeG.add(vaporCloud);
  const cloudShapes=[
    [-8,0,1,15,8],[-5,1,3,18,10],[0,1,4,23,13],[5,0,3,18,10],
    [8,-.2,1,15,8],[-2,-1,6,19,11],[3,-1,6,18,10],[0,2,7,16,9]
  ];
  for(let i=0;i<cloudShapes.length;i++){
    const [x,y,z,w,h]=cloudShapes[i],sprite=new THREE.Sprite(vaporMaterial);
    sprite.position.set(x,y,z);sprite.scale.set(w,h,1);vaporCloud.add(sprite);
    vaporPuffs.push({sprite,w,h,phase:i*1.7});
  }
}
function triggerSonicWave(){
  sonicHudLife=1.5;
  playSonicBoom();
}
function updateSonicWave(dt){
  sonicHudLife=Math.max(0,sonicHudLife-dt);
  const outside=camMode!==1&&!S.crashed;
  const density=clamp(1-Math.max(S.p.y,0)/9000,0,1);
  const condensation=smooth(.95,.995,S.mach)*(1-smooth(1.015,1.07,S.mach))*density;
  vaporCloud.visible=outside&&condensation>.015;
  vaporMaterial.opacity=.78*condensation;
  for(const puff of vaporPuffs){
    const pulse=1+.035*Math.sin(simT*3+puff.phase);
    puff.sprite.scale.set(puff.w*pulse,puff.h*pulse,1);
  }
  const supersonic=outside&&S.mach>1;
  sonicMachCone.visible=supersonic;
  if(supersonic){
    const length=120,angle=Math.asin(1/S.mach);
    const radius=Math.min(220,length*Math.tan(angle));
    sonicMachCone.position.z=length/2;
    sonicMachCone.scale.set(radius,length,radius);
    sonicMachCone.material.opacity=.16*smooth(1,1.04,S.mach)*(.5+.5*smooth(1.04,1.8,S.mach))*density;
  }
}
function crash(why){
  if(S.crashed)return;S.crashed=true;explode(S.p);planeG.visible=false;S.v.set(0,0,0);
  showMsg('CRASH',why+' Appuie sur R pour recommencer.','bad',0);
}
function touchdown(sink,speed){
  const q=sink<1.2?['TOUCHER PARFAIT','good']:sink<2.8?['BON ATTERRISSAGE','good']:sink<5?['ATTERRISSAGE DUR','warn']:['ATTERRISSAGE TRÈS DUR','warn'];
  const ap=onRunway(S.p.x,S.p.z);
  showMsg(q[0],'Descente '+sink.toFixed(1)+' m/s à '+Math.round(speed*3.6)+' km/h'+(ap?' · piste de '+ap.name:' · hors piste'),q[1],3.2);
  for(let i=0;i<26;i++){const s=(i%2?1:-1)*1.7;_tmp.set(s,-2,1.2).applyQuaternion(S.q).add(S.p);
    emit(_tmp.x,_tmp.y,_tmp.z,(rnd()-.5)*6,1+rnd()*3,(rnd()-.5)*6,1.4+rnd(),1.2,5+rnd()*3,.85,.85,.85,.5)}
}
let msgTimer=0;
function showMsg(t,sub,kind,dur){
  $('msg').innerHTML='<div class="big '+(kind||'')+'">'+t+'</div><div class="sub">'+(sub||'')+'</div>';msgTimer=dur||0;if(dur===0)msgTimer=1e9;
}
function clearMsg(){$('msg').innerHTML='';msgTimer=0}

/* ===== Apparition ===== */
function spawn(ai,mode){
  const a=AIRPORTS[ai];curAp=ai;startMode=mode;
  S.q.setFromAxisAngle(Y_AXIS,-a.hdg*Math.PI/180);
  const pv=ACF.id==='pv40';
  S.v.set(0,0,0);S.spin=0;S.ab=false;S.abL=0;S.chute=false;S.chuteP=0;S.noz=S.nozT=(mode==='vtol'&&!pv)?1:0;S.crashed=false;S.air=0;S.G=1;
  S.tilt=S.tiltT=(mode==='vtol'&&pv)?Math.PI/2:0;S.scrapeMsg=false;S.holdP=0;S.doors=false;S.doorsP=0;S.reverse=false;S.vbrake=true;if(camMode>=camCount())camMode=0;
  S.p.set(a.x,a.elev,a.z);
  if(mode==='runway'||mode==='vtol'){S.p.addScaledVector(a.dir,-(a.len/2-(pv?110:70)));S.p.y=a.elev+ACF.gearH+.2;S.thr=0;S.gear=true;S.gearPos=1;S.flaps=1;S.onGround=true}
  else{S.p.addScaledVector(a.dir,-1200);S.p.y=a.elev+650;S.v.copy(a.dir).multiplyScalar(200);S.thr=.7;S.gear=false;S.gearPos=0;S.flaps=0;S.onGround=false}
  S.mach=S.v.length()/speedOfSound(S.p.y);S.supersonic=S.mach>=1;
  if(dest===ai)dest=(ai+1)%AIRPORTS.length;
  planeG.visible=!isInside();inp.pitch=inp.roll=inp.yaw=0;
  cockpitG.visible=isInside();
  const t=$('thr');if(t)t.value=Math.round(S.thr*100);
  camInit=false;trail.length=0;clearMsg();P.age.fill(99);
}

/* ===== Caméra ===== */
const isInside=()=>camMode===1||camMode>=3;   // vues intérieures (cockpit, cabine et soute du PV-40)
const camCount=()=>ACF.id==='pv40'?5:3;
const cam={q:new Q4(),pos:new V3(),fov:62,shake:0,cloud:0,orb:0};
let camInit=false;
const _qo=new Q4(),_ro=new V3(),_cp=new V3(),_xa=new V3(1,0,0),_oq=new Q4(),_oq2=new Q4(),_om=new THREE.Matrix4();
/* vues extérieures : clic gauche + glisser (souris) pour tourner autour de l'avion ; revient derrière après 1,5 s */
const orb={yaw:0,pitch:0,drag:false,lx:0,ly:0,idle:9,id:null};
canvasGL.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||!running||menuOpen||mapOpen||isInside())return;orb.drag=true;orb.id=e.pointerId;orb.lx=e.clientX;orb.ly=e.clientY;canvasGL.setPointerCapture(e.pointerId);canvasGL.classList.add('drag');e.preventDefault()});
canvasGL.addEventListener('pointermove',e=>{if(!orb.drag||e.pointerId!==orb.id)return;orb.yaw-=(e.clientX-orb.lx)*.006;orb.pitch=clamp(orb.pitch+(e.clientY-orb.ly)*.005,-1.2,1.2);orb.yaw=Math.atan2(Math.sin(orb.yaw),Math.cos(orb.yaw));orb.lx=e.clientX;orb.ly=e.clientY;orb.idle=0});
{const end=e=>{if(e.pointerId!==orb.id)return;orb.drag=false;orb.idle=0;canvasGL.classList.remove('drag')};canvasGL.addEventListener('pointerup',end);canvasGL.addEventListener('pointercancel',end)}
function orbit(v,dt){
  if(!orb.drag){orb.idle+=dt;if(orb.idle>1.5){const f=Math.exp(-dt*2.5);orb.yaw*=f;orb.pitch*=f}}
  if(Math.abs(orb.yaw)+Math.abs(orb.pitch)<1e-4)return;
  const R=v.length(),a=Math.atan2(v.x,v.z)+orb.yaw,e=clamp(Math.asin(clamp(v.y/R,-1,1))+orb.pitch,-1.45,1.45);
  v.set(Math.sin(a)*Math.cos(e)*R,Math.sin(e)*R,Math.cos(a)*Math.cos(e)*R);
}
function orbitLook(p){   // en orbite on vise l'avion
  const w=clamp(Math.abs(orb.yaw)/.5+Math.abs(orb.pitch)/.5,0,1);if(w<1e-3)return;
  _ro.set(0,1,0).applyQuaternion(cam.q);_om.lookAt(camera.position,p,_ro);_oq.setFromRotationMatrix(_om);
  _oq2.copy(camera.quaternion).slerp(_oq,w);camera.quaternion.copy(_oq2);
}
function updateCamera(dt,time){
  const p=S.p,speed=S.aspd;
  if(!camInit){cam.q.copy(S.q);camInit=true}
  const kq=1-Math.exp(-(camMode===1?12:10)*dt);cam.q.slerp(S.q,kq);
  const inside=isInside(),A=ACF;
  planeG.visible=!S.crashed&&!inside;
  cockpitG.visible=!S.crashed&&inside;
  let tfov=camMode===1?74:inside?72:60+clamp(speed/600,0,1)*28+S.abL*8;
  if(S.crashed){cam.orb+=dt*.3;_cp.set(Math.sin(cam.orb)*60,22,Math.cos(cam.orb)*60).add(p);camera.position.copy(_cp);camera.lookAt(p.x,p.y+4,p.z);tfov=60}
  else{
    const ks=A.camDist/21;
    if(camMode===0){const d=A.camDist+Math.min(speed,600)*.03;_ro.set(0,A.camH,d);orbit(_ro,dt);_ro.applyQuaternion(cam.q);camera.position.copy(p).add(_ro);_qo.setFromAxisAngle(_xa,-.1);camera.quaternion.copy(cam.q).multiply(_qo);orbitLook(p)}
    else if(camMode===1){_ro.fromArray(A.cockpit).applyQuaternion(cam.q);camera.position.copy(p).add(_ro);camera.quaternion.copy(cam.q)}
    else if(camMode>=3){   // PV-40 : cabine puis soute, regard vers l'arrière
      _ro.fromArray(camMode===3?A.cabin:A.bay).applyQuaternion(cam.q);camera.position.copy(p).add(_ro);
      _qo.setFromAxisAngle(Y_AXIS,Math.PI-(camMode===3?.12:.18));camera.quaternion.copy(cam.q).multiply(_qo);camera.rotateX(-.1)}
    else{_ro.set(5.5*ks,1.8*ks,9*ks);orbit(_ro,dt);_ro.applyQuaternion(cam.q);camera.position.copy(p).add(_ro);_qo.setFromAxisAngle(_xa,-.04);camera.quaternion.copy(cam.q).multiply(_qo);camera.rotateY(.3);orbitLook(p)}
    if(!inside){
      const sh=clamp((speed-70)/500,0,1)*.035+S.abL*.025+S.stall*.22+S.spin*.28+(S.G>5?.06:0);
      camera.position.x+=Math.sin(time*11)*sh;camera.position.y+=Math.sin(time*13+1)*sh;camera.rotateZ(Math.sin(time*9)*sh*.005);
    }
  }
  const g=surfH(camera.position.x,camera.position.z)+2.5;if(camera.position.y<g)camera.position.y=g;
  cam.fov+=(tfov-cam.fov)*(1-Math.exp(-3*dt));camera.fov=cam.fov;camera.updateProjectionMatrix();
  partU.scale.value=innerHeight*renderer.getPixelRatio()/(2*Math.tan(cam.fov*Math.PI/360));
  sky.position.copy(camera.position);sea.position.x=Math.round(camera.position.x/100)*100;sea.position.z=Math.round(camera.position.z/100)*100;
  waveTex.offset.set(time*.0012,time*.0008);
  // nuages traversés
  let inC=0;for(const c of CLOUDS){const dx=camera.position.x-c.x,dy=(camera.position.y-c.y)*1.8,dz=camera.position.z-c.z;if(dx*dx+dy*dy+dz*dz<c.r*c.r*.45){inC=1;break}}
  cam.cloud+=(inC-cam.cloud)*(1-Math.exp(-4*dt));$('cloudfx').style.opacity=(cam.cloud*.88).toFixed(3);
  $('vig').style.opacity=clamp((S.G-9)/10,0,.6)+(S.spin>.3?.3:0);
}
/* ===== HUD, minicarte, carte ===== */
const hud=$('hud'),hx=hud.getContext('2d'),mini=$('mini'),mx=mini.getContext('2d'),mapc=$('mapc'),mc=mapc.getContext('2d');
let W=0,H=0,DPR=1,mapImg=null;const trail=[];let trailT=0;
function resize(){
  DPR=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;renderer.setSize(W,H,false);camera.aspect=W/H;camera.updateProjectionMatrix();
  hud.width=W*DPR;hud.height=H*DPR;hx.setTransform(DPR,0,0,DPR,0,0);const ms=mini.clientWidth||170;mini.width=ms*DPR;mini.height=ms*DPR;
}
function buildMapImage(){
  const c=document.createElement('canvas');c.width=c.height=NV;const x=c.getContext('2d'),d=x.createImageData(NV,NV);
  for(let j=0;j<NV;j++)for(let i=0;i<NV;i++){
    const k=j*NV+i,h=HGT[k];let r,g,b;
    if(h<=0){const t=smooth(0,-140,h);r=lerp(110,10,t);g=lerp(170,50,t);b=lerp(190,100,t)}
    else{const t=smooth(0,2400,h);
      if(t<.3){const u=t/.3;r=lerp(120,150,u);g=lerp(170,150,u);b=lerp(95,100,u)}
      else if(t<.75){const u=(t-.3)/.45;r=lerp(150,140,u);g=lerp(150,135,u);b=lerp(100,128,u)}
      else{const u=(t-.75)/.25;r=lerp(140,245,u);g=lerp(135,245,u);b=lerp(128,250,u)}}
    const hl=HGT[j*NV+Math.min(i+1,N)],hu=HGT[Math.max(j-1,0)*NV+i],sh=clamp(1+(h-hl+hu-h)*.0045*(h>0?1:0),.6,1.35);
    const o=k*4;d.data[o]=clamp(r*sh,0,255);d.data[o+1]=clamp(g*sh,0,255);d.data[o+2]=clamp(b*sh,0,255);d.data[o+3]=255;
  }
  x.putImageData(d,0,0);mapImg=c;
}
const toPx=(x,z)=>[(x+HALF)/CELL,(z+HALF)/CELL];
function destInfo(){const a=AIRPORTS[dest],dx=a.x-S.p.x,dz=a.z-S.p.z;return{a,dist:Math.hypot(dx,dz),brg:(Math.atan2(dx,-dz)*180/Math.PI+360)%360}}
function drawMini(){
  const s=mini.width;mx.setTransform(1,0,0,1,0,0);mx.clearRect(0,0,s,s);if(!mapImg)return;
  mx.save();mx.beginPath();mx.arc(s/2,s/2,s/2-1,0,7);mx.clip();
  const h=S.hdg*Math.PI/180,viewR=7000,k=(s/2)/viewR,ch=Math.cos(h),sh=Math.sin(h);
  mx.translate(s/2,s/2);mx.rotate(-h);mx.scale(k*CELL,k*CELL);const pp=toPx(S.p.x,S.p.z);mx.translate(-pp[0],-pp[1]);
  mx.globalAlpha=.9;mx.drawImage(mapImg,0,0);mx.globalAlpha=1;
  mx.setTransform(1,0,0,1,0,0);
  const sc=(dx,dz)=>[s/2+(dx*ch+dz*sh)*k,s/2+(-dx*sh+dz*ch)*k];
  mx.lineWidth=1.5*DPR;mx.strokeStyle='rgba(141,255,203,.35)';mx.beginPath();mx.arc(s/2,s/2,3000*k,0,7);mx.stroke();
  mx.beginPath();for(let i=0;i<trail.length;i++){const q=sc(trail[i][0]-S.p.x,trail[i][1]-S.p.z);i?mx.lineTo(q[0],q[1]):mx.moveTo(q[0],q[1])}mx.strokeStyle='rgba(255,255,255,.5)';mx.stroke();
  AIRPORTS.forEach((a,i)=>{const q=sc(a.x-S.p.x,a.z-S.p.z);mx.fillStyle=i===dest?'#ffb54a':'#fff';mx.strokeStyle='#000';mx.beginPath();mx.arc(q[0],q[1],(i===dest?5:3.5)*DPR,0,7);mx.fill();mx.stroke()});
  const n=sc(0,-viewR*.9);mx.fillStyle='#8dffcb';mx.font='600 '+11*DPR+'px Chakra Petch,sans-serif';mx.textAlign='center';mx.fillText('N',n[0],n[1]+4*DPR);
  mx.fillStyle='#8dffcb';mx.beginPath();mx.moveTo(s/2,s/2-8*DPR);mx.lineTo(s/2+6*DPR,s/2+7*DPR);mx.lineTo(s/2,s/2+4*DPR);mx.lineTo(s/2-6*DPR,s/2+7*DPR);mx.closePath();mx.fill();
  mx.restore();
}
function drawMap(){
  if(!mapOpen||!mapImg)return;const w=mapc.width;mc.clearRect(0,0,w,w);mc.imageSmoothingEnabled=true;mc.drawImage(mapImg,0,0,w,w);
  const f=w/SIZE,P=(x,z)=>[(x+HALF)*f,(z+HALF)*f];
  mc.strokeStyle='rgba(255,255,255,.12)';mc.lineWidth=1;for(let i=1;i<8;i++){mc.beginPath();mc.moveTo(i*w/8,0);mc.lineTo(i*w/8,w);mc.moveTo(0,i*w/8);mc.lineTo(w,i*w/8);mc.stroke()}
  mc.fillStyle='#fff';mc.font='600 14px Chakra Petch,sans-serif';mc.fillText('N ↑',w-40,22);mc.fillText('5 km',16+0,w-26);mc.fillRect(16,w-20,5000*f,3);
  mc.beginPath();trail.forEach((t,i)=>{const q=P(t[0],t[1]);i?mc.lineTo(q[0],q[1]):mc.moveTo(q[0],q[1])});mc.strokeStyle='rgba(255,255,255,.8)';mc.lineWidth=2;mc.stroke();
  AIRPORTS.forEach((a,i)=>{const q=P(a.x,a.z),isD=i===dest;mc.fillStyle=isD?'#ffb54a':'#fff';mc.strokeStyle='#000';mc.lineWidth=2;
    mc.save();mc.translate(q[0],q[1]);mc.rotate(a.hdg*Math.PI/180);mc.fillRect(-3,-a.len*f/2,6,a.len*f);mc.strokeRect(-3,-a.len*f/2,6,a.len*f);mc.restore();
    mc.font='700 15px Chakra Petch,sans-serif';mc.lineWidth=4;mc.strokeText(a.name,q[0]+12,q[1]-8);mc.fillText(a.name,q[0]+12,q[1]-8)});
  if(running){const q=P(S.p.x,S.p.z);mc.save();mc.translate(q[0],q[1]);mc.rotate(S.hdg*Math.PI/180);mc.fillStyle='#8dffcb';mc.strokeStyle='#000';mc.lineWidth=2;
    mc.beginPath();mc.moveTo(0,-12);mc.lineTo(9,10);mc.lineTo(0,5);mc.lineTo(-9,10);mc.closePath();mc.fill();mc.stroke();mc.restore()}
}
function drawHUD(time){
  hx.clearRect(0,0,W,H);if(!running||menuOpen||mapOpen||isInside())return;
  const u=clamp(Math.min(W,H)/760,.62,1.3),cx=W/2,cy=H*.46,G='#8dffcb',spd=S.aspd;
  hx.save();hx.shadowColor='rgba(0,0,0,.85)';hx.shadowBlur=4;hx.strokeStyle=G;hx.fillStyle=G;hx.lineWidth=1.6*u;
  const font=(sz,wt)=>(hx.font=(wt||600)+' '+Math.round(sz*u)+'px "Chakra Petch",sans-serif');
  /* échelle de tangage */
  const ppd=H*.0115,pd=S.pitch*180/Math.PI;
  hx.save();hx.translate(cx,cy);hx.rotate(-S.bank);hx.textAlign='center';font(11,500);
  for(let a=-90;a<=90;a+=5){const y=(pd-a)*ppd;if(Math.abs(y)>H*.34)continue;
    if(a===0){hx.beginPath();hx.moveTo(-W,0+y);hx.lineTo(-60*u,y);hx.moveTo(60*u,y);hx.lineTo(W,y);hx.stroke();continue}
    if(a%10)continue;const l=(a%30?42:62)*u,s=a>0?1:-1;
    hx.setLineDash(a<0?[7*u,5*u]:[]);hx.beginPath();hx.moveTo(-l,y+s*6*u);hx.lineTo(-l,y);hx.lineTo(-l*.4,y);hx.moveTo(l*.4,y);hx.lineTo(l,y);hx.lineTo(l,y+s*6*u);hx.stroke();hx.setLineDash([]);
    hx.fillText(Math.abs(a),-l-16*u,y+4*u);hx.fillText(Math.abs(a),l+16*u,y+4*u)}
  hx.restore();
  hx.beginPath();hx.moveTo(cx-34*u,cy);hx.lineTo(cx-12*u,cy);hx.lineTo(cx-6*u,cy+7*u);hx.moveTo(cx+34*u,cy);hx.lineTo(cx+12*u,cy);hx.lineTo(cx+6*u,cy+7*u);hx.stroke();
  const fx=cx+clamp(S.beta*180/Math.PI,-12,12)*ppd,fy=cy+clamp(S.alpha*180/Math.PI,-12,22)*ppd;
  if(spd>8){hx.beginPath();hx.arc(fx,fy,7*u,0,7);hx.moveTo(fx-7*u,fy);hx.lineTo(fx-16*u,fy);hx.moveTo(fx+7*u,fy);hx.lineTo(fx+16*u,fy);hx.moveTo(fx,fy-7*u);hx.lineTo(fx,fy-14*u);hx.stroke()}
  /* cap */
  const rw=Math.min(520,W*.56),ry=18*u,ppdg=rw/60;
  hx.save();hx.beginPath();hx.rect(cx-rw/2,0,rw,60*u);hx.clip();font(12,500);hx.textAlign='center';
  const h0=Math.round(S.hdg/5)*5;
  for(let a=h0-35;a<=h0+35;a+=5){let rel=a-S.hdg;const x=cx+rel*ppdg,aa=((a%360)+360)%360,mj=aa%10===0;
    hx.beginPath();hx.moveTo(x,ry+(mj?0:5*u));hx.lineTo(x,ry+12*u);hx.stroke();
    if(aa%30===0){const L={0:'N',90:'E',180:'S',270:'O'};hx.fillText(L[aa]||String(aa/10).padStart(2,'0'),x,ry+27*u)}}
  const di=destInfo();let rel=((di.brg-S.hdg+540)%360)-180;
  {const x=cx+clamp(rel,-31,31)*ppdg;hx.fillStyle='#ffb54a';hx.beginPath();hx.moveTo(x,ry+14*u);hx.lineTo(x-6*u,ry+26*u);hx.lineTo(x+6*u,ry+26*u);hx.fill();hx.fillStyle=G}
  hx.restore();
  hx.beginPath();hx.moveTo(cx,ry+14*u);hx.lineTo(cx-6*u,ry+4*u);hx.lineTo(cx+6*u,ry+4*u);hx.closePath();hx.fill();
  font(15,700);hx.textAlign='center';hx.fillText(String(Math.round(S.hdg)%360).padStart(3,'0')+'°',cx,ry-6*u);
  font(12,500);hx.fillStyle='#ffb54a';hx.fillText(di.a.name+'  '+(di.dist/1000).toFixed(1)+' km  (Tab)',cx,ry+46*u);hx.fillStyle=G;
  /* vitesse / altitude */
  const bx=Math.max(14,cx-300*u-(W<720?-60:0)),by=cy-40*u;
  const box=(x,y,w,h)=>{hx.strokeRect(x,y,w,h)};
  hx.textAlign='left';font(11,500);hx.fillText('VITESSE km/h',bx,by-6*u);box(bx,by,92*u,36*u);font(26,700);hx.fillText(String(Math.round(spd*3.6)),bx+8*u,by+28*u);
  font(12,500);hx.fillText('MACH '+S.mach.toFixed(2)+(S.mach>=1?'  SUPERSONIQUE':''),bx,by+54*u);hx.fillText('G '+S.G.toFixed(1),bx,by+72*u);
  const ax=Math.min(W-14-92*u,cx+300*u+(W<720?-60:0)+(W<720?0:0)-92*u+92*u*(W<720?1:0)),alt=S.p.y;
  const axx=W<720?W-14-92*u:cx+300*u-92*u;
  hx.textAlign='left';font(11,500);hx.fillText('ALTITUDE m',axx,by-6*u);box(axx,by,92*u,36*u);font(26,700);hx.fillText(String(Math.round(alt)),axx+8*u,by+28*u);
  font(12,500);if(S.agl<1500)hx.fillText('SOL '+Math.max(0,Math.round(S.agl))+' m',axx,by+54*u);
  hx.fillStyle=Math.abs(S.vs)>12?'#ffb54a':G;hx.fillText((S.vs>=0?'▲ ':'▼ ')+Math.abs(S.vs).toFixed(1)+' m/s',axx,by+72*u);hx.fillStyle=G;
  /* poussée et état */
  const tw=Math.min(260*u,W*.5),ty=H-48*u,tx=cx-tw/2;
  hx.strokeRect(tx,ty,tw,10*u);hx.fillRect(tx,ty,tw*S.thr,10*u);hx.fillStyle='#ffb54a';if(S.abL>.05)hx.fillRect(tx,ty,tw*S.abL,10*u);hx.fillStyle=G;
  const pvA=ACF.id==='pv40';
  font(11,500);hx.textAlign='center';hx.fillText((pvA?'PUISSANCE ':'POUSSÉE ')+Math.round(S.thr*100)+'%'+(S.abL>.05?'  POST-COMBUSTION':''),cx,ty-8*u);
  const chips=[['TRAIN '+(S.gearPos>.98?'SORTI':S.gearPos<.02?'RENTRÉ':'…'),S.gearPos>.98?G:'#ffb54a'],['VOLETS '+S.flaps,G],[S.brake?'FREINS':'',S.brake?'#ffb54a':G],[S.assist?'ASSISTÉ':'MANUEL',S.assist?G:'#ffb54a'],[S.chuteP>.05?'PARACHUTE':'','#ffb54a'],[!pvA&&S.noz>.02?'TUYÈRES '+(S.noz>.98?'VERTICALES':'…'):'','#ffb54a'],[S.mach>=1?'MUR DU SON':'',S.mach>=1?'#ffb54a':G],[!pvA&&S.thr>=.999&&!S.ab?'BOOST : relâche puis Maj':'','#ffb54a'],
    [pvA?'AILE '+Math.round(S.tilt*180/Math.PI)+'°'+(Math.abs(S.tilt-S.tiltT)>.01?' → '+Math.round(S.tiltT*180/Math.PI)+'°':''):'',S.tilt>.05?'#ffb54a':G],[pvA&&S.vbrake&&S.tilt>.5?'FREINS VTOL':'',G],[pvA&&S.doorsP>.02?'PORTES OUVERTES':'','#ffb54a'],[pvA&&S.reverse&&S.onGround?'PAS INVERSE':'','#ffb54a']];
  let cxx=cx-tw/2;font(11,600);hx.textAlign='left';
  for(const c of chips){if(!c[0])continue;hx.fillStyle=c[1];hx.fillText(c[0],cxx,ty+27*u);cxx+=hx.measureText(c[0]).width+16*u}
  /* alertes */
  const blink=Math.floor(time*4)%2===0;let wy=cy+150*u;hx.textAlign='center';
  const warn=(t,col,sub)=>{if(!blink&&col==='#ff6b5e'){}else{font(28,700);hx.fillStyle=col;hx.fillText(t,cx,wy)}if(sub){font(13,500);hx.fillStyle='#fff';hx.fillText(sub,cx,wy+20*u)}wy+=sub?52*u:36*u};
  if(S.spin>.1)warn('VRILLE','#ff6b5e','Manche en avant et palonnier opposé');
  else if(S.stall>.25)warn('DÉCROCHAGE','#ff6b5e','Pique le nez et ajoute de la poussée');
  if(!S.onGround&&S.agl>3&&S.agl<220&&S.vs<-Math.max(5,S.agl/3.5)&&!S.crashed)warn('PULL UP','#ff6b5e','');
  if(!S.onGround&&!S.gear&&S.agl<260&&spd<90&&S.vs<0)warn('TRAIN !','#ffb54a','Sors le train avec G');
  if(!S.onGround&&spd<ACF.vstall*1.15/Math.sqrt(Math.exp(-Math.max(S.p.y,0)/9000))&&(!pvA||S.tilt<.5)&&S.noz<.25&&S.stall<.25&&S.agl>30)warn('VITESSE FAIBLE','#ffb54a',pvA?'Accélère ou bascule l’aile (T)':'');
  if(Math.abs(S.p.x)>18000||Math.abs(S.p.z)>18000)warn('HORS ZONE','#ffb54a','Fais demi-tour vers les îles');
  hx.restore();
}

/* ===== Interface ===== */
let menuAp=0,timeSel=0;
function buildMenu(){
  /* choix de l'avion */
  const acBox=$('accards');
  const AC_DESC={
    f35:['F-35B Lightning II','Chasseur furtif STOVL · jusqu’à Mach 2,9 en altitude','Post-combustion, tuyère orientable et soufflante pour le décollage vertical, parachute de freinage.'],
    pv40:['PV-40','VTOL privé à aile basculante · 4 turbopropulseurs · ≈ 870 km/h','Aile 0–90°, hélices liées, freins VTOL, train à boggies pivotants, cabine de luxe (6 sièges, chambre, toilettes), portes parachutistes et rampe, couleur au choix.']};
  let saved='f35';try{saved=localStorage.getItem('horizon:aircraft')||'f35'}catch(e){}
  const selectAc=id=>{
    ACF=AIRCRAFT[id]||AIRCRAFT.f35;
    [...acBox.children].forEach(c=>c.setAttribute('aria-pressed',c.dataset.id===ACF.id));
    $('pvColor').hidden=ACF.id!=='pv40';$('tAB').textContent=ACF.id==='pv40'?'Aile':'Boost';
    if(camMode>=camCount())camMode=0;
    try{localStorage.setItem('horizon:aircraft',ACF.id)}catch(e){}
  };
  for(const id of Object.keys(AIRCRAFT)){const d=AC_DESC[id],b=document.createElement('button');b.className='card';b.dataset.id=id;
    b.innerHTML='<b>'+d[0]+'</b><div class="meta">'+d[1]+'</div><p>'+d[2]+'</p>';b.onclick=()=>selectAc(id);acBox.appendChild(b)}
  /* couleur du PV-40 (teinte, saturation, luminosité) */
  let hsv=PV.hsv.slice();try{const c=JSON.parse(localStorage.getItem('horizon:pvColor')||'null');if(Array.isArray(c)&&c.length===3)hsv=c}catch(e){}
  const syncColor=()=>{setPVColor(hsv[0],hsv[1],hsv[2]);$('pvH').value=hsv[0];$('pvS').value=Math.round(hsv[1]*100);$('pvV').value=Math.round(hsv[2]*100);
    $('pvSwatch').style.background='#'+hsv2rgb(hsv[0],hsv[1],hsv[2]).getHexString();try{localStorage.setItem('horizon:pvColor',JSON.stringify(hsv))}catch(e){}};
  $('pvH').oninput=e=>{hsv[0]=+e.target.value;syncColor()};$('pvS').oninput=e=>{hsv[1]=e.target.value/100;syncColor()};$('pvV').oninput=e=>{hsv[2]=e.target.value/100;syncColor()};
  $('pvReset').onclick=()=>{hsv=[184,.74,.3];syncColor()};
  syncColor();selectAc(saved);
  const box=$('apcards');
  AIRPORTS.forEach((a,i)=>{const b=document.createElement('button');b.className='card';b.setAttribute('aria-pressed',i===0);
    b.innerHTML='<b>'+a.name+'</b><div class="meta">Alt. '+Math.round(a.elev)+' m · piste '+a.len+' m · '+String(Math.round(a.hdg/10)||36).padStart(2,'0')+'</div><p>'+a.desc+'</p>';
    b.onclick=()=>{menuAp=i;[...box.children].forEach((c,j)=>c.setAttribute('aria-pressed',j===i))};box.appendChild(b)});
  const seg=(id,cb)=>{const el=$(id);[...el.children].forEach(b=>b.onclick=()=>{[...el.children].forEach(c=>c.setAttribute('aria-pressed',c===b));cb(b.dataset.v)})};
  seg('modeSeg',v=>startMode=v);seg('timeSeg',v=>{timeSel=+v;setTime(timeSel)});
  $('goBtn').onclick=()=>{initAudio();S.assist=$('assistChk').checked;setTime(timeSel);spawn(menuAp,startMode);running=true;setMenu(false)};
  const rb=document.createElement('button');rb.className='btn';rb.id='resBtn';rb.textContent='Reprendre';rb.hidden=true;rb.style.cssText='font-size:16px';
  rb.onclick=()=>setMenu(false);$('goBtn').after(rb);
  const lst=$('aplist');
  AIRPORTS.forEach((a,i)=>{const d=document.createElement('div');d.className='card';d.innerHTML='<b>'+a.name+'</b><div class="meta">Alt. '+Math.round(a.elev)+' m · piste '+a.len+' m</div><div class="btns"><button data-d="'+i+'">Destination</button><button data-s="'+i+'">Repartir d\'ici</button></div>';lst.appendChild(d)});
  lst.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.d!==undefined)dest=+b.dataset.d;else if(b.dataset.s!==undefined){spawn(+b.dataset.s,'runway');running=true;setMap(false)}};
  mapc.onclick=e=>{const r=mapc.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*SIZE-HALF,z=(e.clientY-r.top)/r.height*SIZE-HALF;let b=0,bd=1e9;AIRPORTS.forEach((a,i)=>{const d=Math.hypot(a.x-x,a.z-z);if(d<bd){bd=d;b=i}});dest=b};
  const tb=(id,fn)=>{$(id).onclick=fn};
  tb('tGear',()=>toggleGear());tb('tAB',()=>{if(ACF.id==='pv40')tiltStep(1);else if(S.thr>=.99)S.ab=!S.ab});tb('tFlap',()=>S.flaps=(S.flaps+1)%3);tb('tCam',()=>camMode=(camMode+1)%camCount());tb('tMap',()=>setMap(!mapOpen));tb('tRes',()=>spawn(curAp,startMode));
  const br=$('tBrake');br.onpointerdown=()=>touchBrake=true;br.onpointerup=br.onpointerleave=()=>touchBrake=false;
  $('thr').oninput=e=>{S.thr=e.target.value/100;if(S.thr<.99)S.ab=false};
}
function setMenu(v){menuOpen=v;$('menu').hidden=!v;if(v){$('resBtn').hidden=!running;$('goBtn').textContent=running?'RECOMMENCER':'DÉCOLLER';clearMsg()}}
function setMap(v){if(!running&&v)return;mapOpen=v;$('mapov').hidden=!v}
function tiltStep(d){
  const deg=Math.round(S.tiltT*180/Math.PI/30)*30,next=d>0?(deg>=90?0:deg+30):(deg<=0?90:deg-30);
  S.tiltT=next*Math.PI/180;
  const sub=next===90?'Vol vertical : 70–80 % de puissance pour monter':next===0?'Vol normal. Transition progressive, à plus de 300 m du sol':'Configuration intermédiaire (décollage court, voltige)';
  showMsg('AILE '+next+'°',sub,'good',1.8);
}
function toggleGear(){if(S.onGround&&S.aspd>1)return;if(S.onGround&&S.gear)return;S.gear=!S.gear}
addEventListener('keydown',e=>{
  const c=e.code;if(['Space','Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ControlLeft','PageUp','PageDown'].includes(c)||(e.ctrlKey&&['KeyS','KeyW','KeyD','KeyA'].includes(c)))e.preventDefault();
  keys[c]=true;if(e.repeat)return;
  if(c==='Escape'){if(mapOpen)setMap(false);else if(running)setMenu(!menuOpen);return}
  if(!running||menuOpen)return;
  const pv=ACF.id==='pv40';
  if(c==='Space'){S.thr=0;S.ab=false;$('thr').value=0;
    if(pv){S.reverse=true;showMsg('FREINAGE D\'URGENCE','Gaz coupés · hélices en pas inverse au sol','warn',1.8)}
    else if(!S.chute&&!S.crashed){S.chute=true;showMsg('FREINAGE D\'URGENCE','Gaz coupés · parachute sorti · J pour le larguer','warn',1.8)}}
  else if(c==='KeyT'||c==='KeyY'){
    if(pv)tiltStep(c==='KeyT'?1:-1);
    else if(c==='KeyT'){S.nozT=S.nozT>.5?0:1;if(S.nozT&&S.aspd>140)S.nozT=0;showMsg(S.nozT?'TUYÈRES VERTICALES':'TUYÈRES HORIZONTALES',S.nozT?'Poussée vers le bas : décollage et vol stationnaire':'Vol normal','good',1.6)}}
  else if(c==='KeyB'&&pv){S.vbrake=!S.vbrake;showMsg(S.vbrake?'FREINS VTOL ACTIFS':'FREINS VTOL COUPÉS',S.vbrake?'Commandes adoucies et dérive amortie en vol vertical':'Vol vertical sans aide','good',1.6)}
  else if(c==='KeyO'&&pv){S.doors=!S.doors;showMsg(S.doors?'PORTES OUVERTES':'PORTES FERMÉES',S.doors?'Portes parachutistes et rampe arrière':'','good',1.4)}
  else if(c==='KeyJ'){S.chute=false}
  else if(c==='KeyG')toggleGear();else if(c==='KeyF')S.flaps=(S.flaps+1)%3;else if(c==='KeyC')camMode=(camMode+1)%camCount();
  else if(c==='KeyM')setMap(!mapOpen);else if(c==='Tab')dest=(dest+1)%AIRPORTS.length;
  else if(c==='KeyH'){S.assist=!S.assist;showMsg(S.assist?'PILOTAGE ASSISTÉ':'PILOTAGE MANUEL','','good',1.4)}
  else if(c==='KeyR')spawn(curAp,startMode);else if(c==='KeyN')soundOn=!soundOn;
});
addEventListener('keyup',e=>{keys[e.code]=false});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
addEventListener('wheel',e=>{if(running&&!menuOpen){{const was=S.thr>=.999;S.thr=clamp(S.thr-e.deltaY*.0006,0,1);if(e.deltaY<0&&was)S.ab=true;if(e.deltaY>0)S.ab=false}$('thr').value=Math.round(S.thr*100)}},{passive:true});
let tp0=null;
canvasGL.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||!running)return;tp0={id:e.pointerId,x:e.clientX,y:e.clientY};touchStick={pitch:0,roll:0}});
addEventListener('pointermove',e=>{if(tp0&&e.pointerId===tp0.id){touchStick.roll=clamp((e.clientX-tp0.x)/70,-1,1);touchStick.pitch=clamp((e.clientY-tp0.y)/70,-1,1)}});
const endTouch=e=>{if(tp0&&e.pointerId===tp0.id){tp0=null;touchStick=null}};addEventListener('pointerup',endTouch);addEventListener('pointercancel',endTouch);
addEventListener('resize',resize);

/* ===== Boucle principale ===== */
let tNow=0,last=performance.now(),simT=0;
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min((now-last)/1000,.05);last=now;tNow+=dt;
  const active=running&&!menuOpen&&!mapOpen;
  if(active){
    simT+=dt;readInputs(dt);
    const n=Math.ceil(dt/.012);for(let i=0;i<n;i++)physics(dt/n,simT);
    S.gearPos=approach(S.gearPos,S.gear?1:0,dt/2.2);
    trailT+=dt;if(trailT>1){trailT=0;trail.push([S.p.x,S.p.z]);if(trail.length>500)trail.shift()}
    if(msgTimer<1e8){msgTimer-=dt;if(msgTimer<=0&&$('msg').firstChild)clearMsg()}
    if(!S.crashed){
      if(ACF.exhaust&&S.thr>.3&&Math.random()<.9){_tmp.fromArray(ACF.exhaust).applyQuaternion(S.q).add(S.p);emit(_tmp.x,_tmp.y,_tmp.z,0,.5,0,1.6,.8,3.4,.8,.8,.82,.1+.08*S.thr)}
      if((ACF.id==='pv40'?Math.sin(S.tilt):S.noz)>.3&&S.thr>.2&&S.agl<(ACF.id==='pv40'?30:40)){const gy0=Math.max(groundH(S.p.x,S.p.z),0);for(let i=0;i<3;i++){const a=rnd()*6.283,sp=14+rnd()*14;emit(S.p.x,gy0+.8,S.p.z,Math.cos(a)*sp,1+rnd()*2,Math.sin(a)*sp,1.6,3,16+rnd()*8,.62,.56,.45,.28*S.thr)}}
      if(S.G>3.2||S.stall>.5){for(const tp of ACF.tips){_tmp.fromArray(tp).applyQuaternion(S.q).add(S.p);emit(_tmp.x,_tmp.y,_tmp.z,0,0,0,2.4,1.2,7,1,1,1,.5)}}
    }
  }
  if(running){
    planeG.position.copy(S.p);planeG.quaternion.copy(S.q);
    cockpitG.position.copy(S.p);cockpitG.quaternion.copy(S.q);
    const isPV=ACF.id==='pv40';f35G.visible=!isPV;pvG.visible=isPV;f35CockpitG.visible=!isPV;pvInteriorG.visible=isPV;
    if(isPV)updatePV(dt);
    nozG.rotation.x=S.noz*Math.PI/2;chuteG.visible=S.chuteP>.02;chuteG.scale.setScalar(Math.max(S.chuteP,.01));
    const fanOpen=clamp(S.noz,0,1);
    for(const door of liftFanDoors)door.hinge.rotation.z=-door.side*fanOpen*1.28;
    liftFanRotor.rotation.y+=dt*(S.noz>.2?32:0);
    gearGroup.visible=S.gearPos>.02;gearGroup.scale.y=Math.max(S.gearPos,.01);
    flameMesh.visible=S.thr>.05&&!S.crashed;flameMesh.scale.set(1+.4*S.abL,1+.4*S.abL,(.4+S.thr*2.4+S.abL*4.5)*(.9+.2*Math.random()));
    const ag=S.p.y-Math.max(groundH(S.p.x,S.p.z),0);shadowMesh.position.set(S.p.x-sunDir.x*ag/Math.max(sunDir.y,.3)*.6,Math.max(groundH(S.p.x,S.p.z),0)+.4,S.p.z-sunDir.z*ag/Math.max(sunDir.y,.3)*.6);
    shadowMesh.scale.set(ACF.shadow,1,ACF.shadow);shadowMesh.material.opacity=(timeIdxShadow())*Math.exp(-ag/700);shadowMesh.visible=!S.crashed;
  }
  if(!running||(menuOpen&&!running)){
    const a=AIRPORTS[menuAp],ang=tNow*.07;camera.position.set(a.x+Math.cos(ang)*700,a.elev+180,a.z+Math.sin(ang)*700);camera.lookAt(a.x,a.elev+30,a.z);
    sky.position.copy(camera.position);sea.position.set(Math.round(camera.position.x/100)*100,0,Math.round(camera.position.z/100)*100);planeG.visible=false;cockpitG.visible=false;shadowMesh.visible=false;
    camera.fov=60;camera.updateProjectionMatrix();partU.scale.value=H*DPR/(2*Math.tan(camera.fov*Math.PI/360));$('cloudfx').style.opacity=0;
  }else if(active||S.crashed){updateCamera(dt,tNow)}
  if(running&&!menuOpen&&!mapOpen&&!isInside())updateSpeedLines(camera.position,S.v,S.aspd);else if(slLines)slLines.visible=false;
  updateSonicWave(dt);
  updateParticles(dt);
  sun.position.copy(camera.position).addScaledVector(sunDir,1500);sun.target.position.copy(camera.position);
  waveTex.offset.set(tNow*.0012,tNow*.0008);
  renderer.render(scene,camera);
  mini.style.visibility=(running&&!menuOpen&&!mapOpen&&!isInside())?'visible':'hidden';
  if(running&&!menuOpen&&!mapOpen&&camMode===1)updateCockpitScreens(tNow);
  updateCockpitHud();
  drawHUD(tNow);drawMini();drawMap();updateAudio();
}
const timeIdxShadow=()=>[.55,.4,.12][timeIdx];

/* ===== Démarrage ===== */
function init(){
  buildHeights();buildTerrain();buildAirports();buildTrees();buildClouds();
  buildPlane();f35G=new THREE.Group();while(planeG.children.length)f35G.add(planeG.children[0]);planeG.add(f35G,pvG);buildPV();
  buildCockpit();f35CockpitG=new THREE.Group();while(cockpitG.children.length)f35CockpitG.add(cockpitG.children[0]);cockpitG.add(f35CockpitG,pvInteriorG);buildPVInterior();
  buildParticles();buildSonicWave();buildChute();buildSpeedLines();buildShadow();buildMapImage();
  setTime(0);buildMenu();resize();spawn(0,'runway');
  window.__sim={S,AIRPORTS,groundH,spawn,setMenu,physics,keys,inp,AIRCRAFT,PV,camera,renderer,scene,get ACF(){return ACF},set ACF(v){ACF=v},get camMode(){return camMode},set camMode(v){camMode=v}};$('loading').remove();requestAnimationFrame(frame);
}
setTimeout(init,40);
