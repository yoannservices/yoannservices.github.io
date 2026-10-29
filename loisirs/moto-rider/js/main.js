'use strict';
/* ===== Utilitaires ===== */
const DEG=Math.PI/180, TAU=Math.PI*2;
const clamp=(x,a,b)=>x<a?a:x>b?b:x;
const lerp=(a,b,t)=>a+(b-a)*t;
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hash2(ix,iz){let h=Math.imul(ix,374761393)^Math.imul(iz,668265263);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295}
function vnoise(x,z){const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);
  const a=hash2(ix,iz),b=hash2(ix+1,iz),c=hash2(ix,iz+1),d=hash2(ix+1,iz+1);return lerp(lerp(a,b,u),lerp(c,d,u),v)}
function fbm(x,z,o){let s=0,a=.5,f=1;for(let i=0;i<o;i++){s+=a*(vnoise(x*f,z*f)-.5)*2;f*=2.03;a*=.5}return s}

/* ===== Décors ===== */
const MODES={
  mountain:{name:'Montagne',baseElev:1500,slope:.62,noise:30,ridge:440,seed:7,treeline:1950,snow:2150},
  open:{name:'Route ouverte',baseElev:140,slope:.07,noise:11,ridge:80,seed:21,treeline:99999,snow:99999}
};
const DS=2, NS=70000, CELL=80, CSTEP=10, RAD=75;
let MODE=MODES.mountain, MODEKEY='mountain';
let RX,RZ,RY,RTH,RLX,RLZ,RU,EVENTS=[],GRID=new Map(),GRID2=new Map();const CELL2=700,STEP2=15,SIG2=150;

function yAt(s){
  if(MODEKEY==='mountain'){
    return 110*(1-Math.cos(s/2200))+10*Math.sin(s/380+1)+3*Math.sin(s/137);
  }
  return 14*Math.sin(s/900)+7*Math.sin(s/260+1)+3*Math.sin(s/90);
}
let KARR=null;
function buildMountainKappa(rnd){
  const k=new Float32Array(NS);let pos=0;
  const put=(len,kap)=>{const n=Math.max(1,Math.round(len/DS));for(let j=0;j<n&&pos<NS;j++)k[pos++]=kap};
  put(300,0);let sg=1;
  while(pos<NS-3000/DS*2){
    const L=450+rnd()*550;let used=0;
    const nw=Math.floor(rnd()*3);
    for(let w=0;w<nw;w++){
      const R=200+rnd()*250,ang=.12+rnd()*.14,sgn=rnd()<.5?-1:1,gap=40+rnd()*100;
      put(gap,0);put(R*ang,sgn/R);put(R*ang,-sgn/R);used+=gap+2*R*ang;
    }
    put(Math.max(60,L-used),0);
    const R=38+rnd()*14;put(Math.PI*R,sg/R);sg=-sg;
  }
  while(pos<NS)k[pos++]=0;
  // lissage (conserve l'angle total)
  const W=7,out=new Float32Array(NS);
  for(let i=0;i<NS;i++){let s=0,c=0;for(let j=-W;j<=W;j++){const q=i+j;if(q>=0&&q<NS){s+=k[q];c++}}out[i]=s/c}
  return out;
}
function kappaAt(s,th){
  if(MODEKEY==='mountain')return KARR[Math.min(NS-1,Math.floor(s/DS))];
  let k=.0013*Math.sin(s/1100+.5)+.0011*Math.sin(s/410+1.7)+.0007*Math.sin(s/170+3)-.00035*th;
  for(let j=0;j<EVENTS.length;j++){
    const e=EVENTS[j];const q=(s-e.s)/e.sig;if(q>-4&&q<4)k+=e.sign*e.k*Math.exp(-q*q/2);
  }
  return k*sstep(0,260,s);
}
function gkey(cx,cz){return (cx+8192)*16384+(cz+8192)}
function initWorld(key){
  MODEKEY=key;MODE=MODES[key];
  const rnd=mulberry32(MODE.seed);
  EVENTS=[];
  if(key==='mountain'){KARR=buildMountainKappa(rnd)}
  else{
    let s=1200;
    while(s<NS*DS-1500){EVENTS.push({s,sign:rnd()<.5?-1:1,sig:110+rnd()*70,k:.0018+rnd()*.0016});s+=1300+rnd()*1400}
  }
  RX=new Float32Array(NS);RZ=new Float32Array(NS);RY=new Float32Array(NS);RTH=new Float32Array(NS);
  RLX=new Float32Array(NS);RLZ=new Float32Array(NS);RU=new Float32Array(NS);
  let x=0,z=0,th=0;
  for(let i=0;i<NS;i++){
    const s=i*DS;
    RX[i]=x;RZ[i]=z;RTH[i]=th;RY[i]=yAt(s);
    RLX[i]=Math.cos(th);RLZ[i]=-Math.sin(th);
    RU[i]=key==='mountain'?Math.tanh(3*Math.cos(th)):Math.tanh(2*Math.sin(s/2500+.7))*.8;
    const k=kappaAt(s+DS*.5,th),thm=th+.5*k*DS;
    x+=Math.sin(thm)*DS;z+=Math.cos(thm)*DS;th+=k*DS;
  }
  GRID=new Map();
  for(let i=0;i<NS;i+=CSTEP){
    const kk=gkey(Math.floor(RX[i]/CELL),Math.floor(RZ[i]/CELL));
    let a=GRID.get(kk);if(!a){a=[];GRID.set(kk,a)}a.push(i);
  }
  GRID2=new Map();
  for(let i=0;i<NS;i+=STEP2){
    const kk=gkey(Math.floor(RX[i]/CELL2),Math.floor(RZ[i]/CELL2));
    let a=GRID2.get(kk);if(!a){a=[];GRID2.set(kk,a)}a.push(i);
  }
}

/* ===== Projection sur la route ===== */
const RP={i:0,s:0,d:0,lat:0,y:0};
function projectNear(x,z,i0,W){
  const a=Math.max(0,i0-W),b=Math.min(NS-1,i0+W);
  let bi=a,bd=1e18;
  for(let i=a;i<=b;i++){const dx=x-RX[i],dz=z-RZ[i],d2=dx*dx+dz*dz;if(d2<bd){bd=d2;bi=i}}
  const th=RTH[bi],dx=x-RX[bi],dz=z-RZ[bi];
  const t=clamp(dx*Math.sin(th)+dz*Math.cos(th),-DS,DS);
  RP.i=bi;RP.s=bi*DS+t;RP.d=Math.sqrt(bd);RP.lat=dx*RLX[bi]+dz*RLZ[bi];RP.y=yAt(RP.s);
  return RP;
}
function nearestCoarse(x,z){
  const cx=Math.floor(x/CELL),cz=Math.floor(z/CELL);
  let best=-1,bd=1e18,found=-1;
  for(let r=0;r<60;r++){
    for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++){
      if(Math.max(Math.abs(a),Math.abs(b))!==r)continue;
      const arr=GRID.get(gkey(cx+a,cz+b));if(!arr)continue;
      for(let k=0;k<arr.length;k++){const i=arr[k],dx=x-RX[i],dz=z-RZ[i],d2=dx*dx+dz*dz;if(d2<bd){bd=d2;best=i}}
    }
    if(best>=0&&found<0)found=r;
    if(found>=0&&r>=found+1)break;
  }
  return best<0?0:best;
}

/* ===== Relief ===== */
const R2=RAD*RAD;
const TS={d:999};
function ridgeAt(x,z){const n=fbm(x*.0016,z*.0016,3);return Math.pow(Math.max(0,1-Math.abs(n)*2.2),2)}
function farH(x,z){
  const M=MODE,cx=Math.floor(x/CELL2),cz=Math.floor(z/CELL2);
  let sw=0,sy=0;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){
    const arr=GRID2.get(gkey(cx+a,cz+b));if(!arr)continue;
    for(let k=0;k<arr.length;k++){
      const i=arr[k],dx=x-RX[i],dz=z-RZ[i],d2=dx*dx+dz*dz;
      const w=Math.exp(-d2/(2*SIG2*SIG2));if(w<1e-4)continue;
      const d=Math.sqrt(d2),lam=clamp((dx*RLX[i]+dz*RLZ[i])/Math.max(d,.5),-1,1);
      sy+=w*(RY[i]+RU[i]*lam*M.slope*Math.min(Math.max(d-6,0),150));sw+=w;
    }
  }
  if(sw<1e-3){const i=nearestCoarse(x,z);return RY[i]}
  return sy/sw;
}
function terrainH(x,z){
  const M=MODE;
  const cx=Math.floor(x/CELL),cz=Math.floor(z/CELL);
  let sw=0,sy=0,d2min=1e18,imin=-1;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){
    const arr=GRID.get(gkey(cx+a,cz+b));if(!arr)continue;
    for(let k=0;k<arr.length;k++){
      const i=arr[k],dx=x-RX[i],dz=z-RZ[i],d2=dx*dx+dz*dz;
      if(d2<d2min){d2min=d2;imin=i}
      if(d2<R2){
        const d=Math.sqrt(d2),w=1-d/RAD,w2=w*w;
        const lam=clamp((dx*RLX[i]+dz*RLZ[i])/Math.max(d,.5),-1,1);
        const dd=Math.min(Math.max(d-6,0),90);
        sy+=w2*(RY[i]+RU[i]*lam*M.slope*dd);sw+=w2;
      }
    }
  }
  const far=farH(x,z);
  const tn=clamp(sw/.5,0,1);
  let y=sw>1e-6?lerp(far,sy/sw,tn):far;
  let dtrue;
  if(imin<0||d2min>1600){if(imin<0||d2min>R2){imin=nearestCoarse(x,z);}const dx=x-RX[imin],dz=z-RZ[imin];dtrue=Math.sqrt(dx*dx+dz*dz)}
  else dtrue=Math.sqrt(d2min);
  if(dtrue<40){
    projectNear(x,z,imin,14);
    dtrue=RP.d;
    y=lerp(RP.y,y,sstep(5.5,12,dtrue));
  }
  TS.d=dtrue;
  y+=M.noise*fbm(x*.012,z*.012,3)*sstep(12,110,dtrue);
  if(dtrue>140)y+=M.ridge*ridgeAt(x,z)*sstep(140,700,dtrue);
  return y;
}

/* ===== Motos ===== */
const G=9.81;
const BIKES=[
 {id:'h2r',name:'Kawasaki Ninja H2R',eng:'998 cc · 4 cyl. compresseur',hp:326,kg:216,vtop:372,red:14000,pk:13000,col:[0x0b0d0f,0x2bd66b,0x8a8f96],note:'Circuit uniquement'},
 {id:'v4r',name:'Ducati Panigale V4 R',eng:'998 cc · V4 Desmosedici',hp:240,kg:172,vtop:310,red:16500,pk:15500,col:[0xd8141b,0x14171b,0xe9e9e9],note:''},
 {id:'rsv4',name:'Aprilia RSV4 Factory',eng:'1 099 cc · V4 65°',hp:220,kg:202,vtop:305,red:13600,pk:13000,col:[0x15181c,0xd1202a,0x9aa0a8],note:''},
 {id:'m1000',name:'BMW M 1000 RR',eng:'999 cc · 4 cyl. en ligne',hp:212,kg:192,vtop:306,red:15100,pk:14500,col:[0xf2f4f7,0x1f5fbf,0xc4161c],note:''},
 {id:'h2',name:'Kawasaki Ninja H2',eng:'998 cc · 4 cyl. compresseur',hp:240,kg:238,vtop:300,red:14000,pk:11500,col:[0x1a1d21,0x39d36e,0x8a8f96],note:''},
 {id:'cbr',name:'Honda CBR1000RR-R SP',eng:'999 cc · 4 cyl. en ligne',hp:215,kg:201,vtop:299,red:15000,pk:14500,col:[0xc8161d,0x1a1c20,0xe8e8e8],note:''}
];
const GEARF=[.2,.31,.44,.58,.76,1];
function prepBike(b){
  b.mass=b.kg+80; b.pw=b.hp*745.7*.89; const vt=b.vtop/3.6;
  const crr=.012*b.mass*G*vt;
  b.cda=Math.max(.05,(b.pw-crr)/(.5*1.2*vt*vt*vt));
  b.gtop=GEARF.map(f=>f*vt*1.02);
  return b;
}
BIKES.forEach(prepBike);
const powerShape=x=>x<.2?.4:x<1?1-.9*(1-x)*(1-x):Math.max(0,1-4*(x-1)*(x-1)*1.5);

/* ===== Etat & physique ===== */
function newState(){return{x:0,z:0,y:0,psi:0,v:0,u:0,kap:0,lean:0,pitch:0,gear:1,rpm:1300,ax:0,alat:0,s:0,idx:0,lat:0,
  ang:0,crash:0,slide:0,off:0,wheelie:0,spin:0,steer:0,wob:0,hit:0,brkS:0,up:0,aT:0}}
function placeOnRoad(st,s){
  const i=Math.round(s/DS);st.x=RX[i];st.z=RZ[i];st.psi=RTH[i];st.idx=i;st.y=RY[i];st.v=0;st.u=0;st.kap=0;st.lean=0;st.gear=1;st.rpm=1300;st.crash=0;st.pitch=0;st.slide=0;st.wheelie=0;st.hit=0;st.brkS=0;st.up=0;st.aT=0;
}
const ROADHW=4.2, SHOULDER=6.4;
function stepPhysics(st,bk,inp,aids,dt){
  const ai=aids;
  if(st.crash>0){st.crash-=dt;st.v=Math.max(0,st.v-30*dt);st.lean+=(Math.sign(st.lean||1)*1.5-st.lean)*Math.min(1,dt*6);
    st.x+=Math.sin(st.psi)*st.v*dt;st.z+=Math.cos(st.psi)*st.v*dt;st.rpm=1300;return}
  const v=st.v;
  // sol / route
  projectNear(st.x,st.z,st.idx,40);st.idx=RP.i;st.s=RP.s;st.lat=RP.lat;
  const alat=Math.abs(RP.lat);
  let mu=1.2;
  if(alat>ROADHW+.4){mu=lerp(1.2,.62,sstep(ROADHW+.4,ROADHW+1.6,alat))}
  st.off=alat>ROADHW+.4?1:0;
  // moteur
  const g=st.gear,gt=bk.gtop[g-1];
  const wheelRpm=bk.red*Math.min(1.2,v/gt);
  const clutch=g===1&&v<8;
  st.rpm=lerp(st.rpm,clutch?Math.max(wheelRpm,inp.thr>0?bk.red*.55:1300):Math.max(1300,wheelRpm),Math.min(1,dt*18));
  const x=st.rpm/bk.pk,p=bk.pw*powerShape(x*.96);
  const vv=Math.max(v,g===1?7:3);
  let Fd=inp.thr*p/vv;
  if(st.rpm>bk.red*1.01)Fd=0;
  const Fmax=mu*bk.mass*G*(ai?.78:1.0)*(1-.35*clamp(st.alat/(mu*G),0,1));
  Fd=Math.min(Fd,Fmax,bk.mass*G*1.25);
  // freinage : cercle d'adherence (le pneu partage son grip entre virage et freinage)
  st.brkS+=(inp.brk-st.brkS)*(1-Math.exp(-dt/(inp.brk>st.brkS?.04:.05)));
  const gripG=mu*G*1.45;
  const aLong=Math.sqrt(Math.max(0,gripG*gripG-st.alat*st.alat));
  // freinage puissant ~1.6 g sur le sec ; avec ABS on reste juste sous la limite du pneu
  const bMax=Math.min(G*1.6*(mu/1.2),ai?aLong*.97:G*1.75);
  const Fb=st.brkS*bk.mass*Math.max(ai?G*.4*(mu/1.2):0,bMax);
  // frein moteur quand on coupe les gaz
  const Fe=inp.thr<.1&&!clutch?bk.mass*G*.07*clamp(st.rpm/bk.red,0,1):0;
  // position du pilote : il se redresse au freinage (pare-brise humain), se couche sous le carenage aux gaz
  const upT=inp.brk>0&&v>8?1:0;
  st.up+=(upT-st.up)*Math.min(1,dt*(upT>st.up?5:3));
  const cda=bk.cda*(1+1.1*st.up);
  const aero=.5*1.2*cda*v*v;
  const roll=.012*bk.mass*G+(st.off?bk.mass*G*.08+v*20:0);
  let a=(Fd-Fb-Fe-aero-roll)/bk.mass; if(v<.05&&a<0)a=0;
  st.ax=a;
  st.aT=(Fd-Fb-Fe)/bk.mass; // partie transmise par le pneu (l'aero ne consomme pas de grip)
  st.v=Math.max(0,v+a*dt);
  // boite auto
  if(((st.rpm>bk.red*.955&&inp.thr>.2)||st.rpm>bk.red*1.03)&&g<6)st.gear=g+1;
  else if(g>1&&st.rpm<bk.red*(.36+.05*g+(inp.brk>.3?.12:0))&&inp.brk+ (inp.thr<.1?1:0)>0)st.gear=g-1;
  if(st.v<2&&inp.thr<.1)st.gear=1;
  // direction
  // braquage : jusqu'a ~1.6 g d'acceleration laterale (≈ 58° d'angle), un peu moins tout en haut
  const k=1/(1+Math.pow(st.v/220,2));
  const target=inp.steer;
  const tau=.06+.04*Math.min(1,st.v/40);
  st.u+=(target-st.u)*(1-Math.exp(-dt/tau));
  const Kmax=Math.min(1/3.2,1.6*G*(mu/1.2)/Math.max(st.v*st.v,1));
  let kap=st.u*Kmax*k;
  // limite d'adherence (seules les forces du pneu comptent, pas la trainee aero)
  const aT=Math.min(Math.abs(st.aT),mu*G*1.45);
  const amax=Math.sqrt(Math.max(.01,(mu*G*1.45)**2-aT*aT*.9));
  const areq=st.v*st.v*Math.abs(kap);
  st.slide=0;
  if(areq>amax){
    st.slide=clamp((areq-amax)/amax,0,1);
    if(ai){kap=Math.sign(kap)*amax/Math.max(st.v*st.v,1)}
    else if(areq>amax*1.1&&st.v>12){st.hit+=dt*(areq/amax-1)*8;if(st.hit>1){st.crash=2.2;st.hit=0;return 'crash'}}
  } else st.hit=Math.max(0,st.hit-dt);
  st.kap=lerp(st.kap,kap,Math.min(1,dt*20));
  st.alat=st.v*st.v*st.kap;
  st.psi+=st.v*st.kap*dt;
  st.x+=Math.sin(st.psi)*st.v*dt;st.z+=Math.cos(st.psi)*st.v*dt;
  // lean
  const leanT=-Math.atan(st.alat/G)*1.0;
  st.lean+=(leanT-st.lean)*Math.min(1,dt*9);
  // pitch (cabrage / stoppie)
  let pt=0;
  if(!ai&&a>7.5&&st.v<70)pt=clamp((a-7.5)/6,0,1)*.62;
  else pt=clamp(a/G,-1.8,.5)*.1;
  st.wheelie=pt>.2?1:0;
  st.pitch+=(pt-st.pitch)*Math.min(1,dt*7);
  st.spin+=st.v/.31*dt;st.steer=lerp(st.steer,clamp(Math.atan(1.45*st.kap)*1.5+st.u*.18/(1+st.v/10),-.6,.6),Math.min(1,dt*12));
  // glissieres (montagne)
  projectNear(st.x,st.z,st.idx,40);
  if(MODEKEY==='mountain'&&Math.abs(RP.lat)>SHOULDER){
    const sgn=Math.sign(RP.lat);const over=Math.abs(RP.lat)-SHOULDER;
    st.x-=RLX[RP.i]*sgn*over;st.z-=RLZ[RP.i]*sgn*over;
    const dpsi=Math.atan2(Math.sin(st.psi-RTH[RP.i]),Math.cos(st.psi-RTH[RP.i]));
    st.psi-=dpsi*.3;st.v*=Math.max(0,1-dt*1.6);
    if(st.v>6)return 'rail';
  }
  // altitude
  if(Math.abs(RP.lat)<5.6)st.y=RP.y;else st.y=terrainH(st.x,st.z);
  return null;
}

/* ===== Rendu : scene, ciel, lumieres ===== */
const cv=document.getElementById('c');
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
renderer.outputEncoding=THREE.sRGBEncoding;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(65,1,.08,7000);
scene.add(camera);
const hemi=new THREE.HemisphereLight(0xffffff,0x555544,.7);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffffff,1);scene.add(sun);scene.add(sun.target);
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

RK.setEnv(renderer,{top:'#2f6db8',hor:'#e2ecf3',hills:1.6,hillCol:'#59695a',gnd1:'#6f7068',sunU:.35,sunV:.3});
const LIGHT={
  day:{top:0x2f6db8,hor:0xc3d9ea,fog:0xbdd3e4,sun:0xfff2dc,si:1.15,sdir:[.45,.72,.35],hs:0xa8c8ec,hg:0x5b5c48,hi:.75,far:560,m:1},
  dusk:{top:0x24345f,hor:0xf2a56b,fog:0xdc9b74,sun:0xffa563,si:1.05,sdir:[.85,.2,.15],hs:0x8d8fc0,hg:0x4a3d36,hi:.55,far:520,m:.78}
};
let LK='day';
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
  uniforms:{top:{value:new THREE.Color()},hor:{value:new THREE.Color()},sunD:{value:new THREE.Vector3(0,1,0)},sunC:{value:new THREE.Color()}},
  vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform vec3 top,hor,sunC,sunD;varying vec3 vP;void main(){float h=clamp(vP.y,0.,1.);vec3 c=mix(hor,top,pow(h,.55));float s=max(dot(normalize(vP),sunD),0.);c+=sunC*(pow(s,900.)*2.5+pow(s,12.)*.28);gl_FragColor=vec4(c,1.);}'});
const sky=new THREE.Mesh(new THREE.SphereGeometry(6000,24,12),skyMat);sky.frustumCulled=false;sky.renderOrder=-10;scene.add(sky);
let farRing=null;
function makeFarRing(){
  if(farRing){scene.remove(farRing);farRing.geometry.dispose()}
  const L=LIGHT[LK],fc=new THREE.Color(L.fog),M=MODE;
  const pos=[],col=[],idx=[];const SEG=220;
  const layers=MODEKEY==='mountain'?[[5200,900,2600,.55],[4300,500,1700,.35]]:[[5200,60,420,.55],[4300,30,200,.35]];
  const c1=new THREE.Color(),snow=new THREE.Color(0xf4f6fa);
  layers.forEach((ly,li)=>{
    const base=pos.length/3;
    for(let i=0;i<=SEG;i++){
      const a=i/SEG*TAU,n=fbm(Math.cos(a)*2.2+li*9,Math.sin(a)*2.2+li*4,4)*.5+.5,jag=vnoise(i*.9+li*30,5)*.5+vnoise(i*2.7,li)*.5;
      const h=ly[1]+(ly[2]-ly[1])*Math.pow(clamp(n*1.25,0,1),1.5)*(.7+.3*jag);
      const r=ly[0];
      pos.push(Math.cos(a)*r,-400,Math.sin(a)*r);col.push(fc.r,fc.g,fc.b);
      pos.push(Math.cos(a)*r*.98,h-400+400*0,Math.sin(a)*r*.98);
      const t=clamp((h-ly[1])/(ly[2]-ly[1]),0,1);
      c1.setRGB(.34,.40,.50).lerp(fc,ly[3]);
      if(MODEKEY==='mountain')c1.lerp(snow,sstep(.55,.85,t)*.8);
      col.push(c1.r,c1.g,c1.b);
    }
    for(let i=0;i<SEG;i++){const a=base+i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3)}
  });
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);
  farRing=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,fog:false,side:THREE.DoubleSide,depthWrite:false}));
  farRing.renderOrder=-9;farRing.frustumCulled=false;scene.add(farRing);
}
function applyLight(k){
  LK=k;const L=LIGHT[k];
  skyMat.uniforms.top.value.set(L.top);skyMat.uniforms.hor.value.set(L.hor);
  const sd=new THREE.Vector3(...L.sdir).normalize();skyMat.uniforms.sunD.value.copy(sd);skyMat.uniforms.sunC.value.set(L.sun);
  scene.fog=new THREE.Fog(L.fog,70,L.far);
  hemi.color.set(L.hs);hemi.groundColor.set(L.hg);hemi.intensity=L.hi;
  sun.color.set(L.sun);sun.intensity=L.si;sun.userData.dir=sd;
  makeFarRing();
}

/* ===== Textures & materiaux ===== */
function roadTexture(){
  const c=document.createElement('canvas');c.width=256;c.height=512;const x=c.getContext('2d');
  x.fillStyle='#2b2d30';x.fillRect(0,0,256,512);
  const r=mulberry32(5);
  for(let i=0;i<5200;i++){const v=40+r()*40|0;x.fillStyle='rgba('+v+','+v+','+(v+4)+','+(.25+r()*.4)+')';x.fillRect(r()*256,r()*512,1+r()*2,1+r()*2)}
  x.fillStyle='rgba(15,15,17,.35)';x.fillRect(66,0,22,512);x.fillRect(168,0,22,512);
  x.fillStyle='#e9e9e4';x.fillRect(10,0,6,512);x.fillRect(240,0,6,512);
  x.fillStyle='#e9e9e4';x.fillRect(125,0,6,170);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.encoding=THREE.sRGBEncoding;return t;
}
const roadMat=new THREE.MeshLambertMaterial({map:roadTexture(),polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
const terrMat=new THREE.MeshLambertMaterial({vertexColors:true});
const railMat=new THREE.MeshLambertMaterial({color:0xb9bec4,side:THREE.DoubleSide});
const postMat=new THREE.MeshLambertMaterial({color:0xe8e8e8});
const treeMat=new THREE.MeshLambertMaterial({vertexColors:true});

function mergeParts(parts){
  const P=[],C=[],N=[];
  for(const p of parts){
    let g=p.geo.index?p.geo.toNonIndexed():p.geo;g.applyMatrix4(p.m);
    const pa=g.attributes.position.array,na=g.attributes.normal.array;
    for(let i=0;i<pa.length;i++){P.push(pa[i]);N.push(na[i])}
    for(let i=0;i<pa.length/3;i++)C.push(p.c.r,p.c.g,p.c.b);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
  return g;
}
const mt=(x,y,z,sx,sy,sz)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(sx||1,sy||1,sz||1));
function treeGeoConifer(){
  const A=new THREE.Color(0x1f4a2a),B=new THREE.Color(0x2b5e34),T=new THREE.Color(0x4a3524);
  return mergeParts([
    {geo:new THREE.CylinderGeometry(.18,.28,2,6),m:mt(0,1,0),c:T},
    {geo:new THREE.ConeGeometry(2.1,4.2,8),m:mt(0,3.4,0),c:A},
    {geo:new THREE.ConeGeometry(1.6,3.6,8),m:mt(0,5.6,0),c:B},
    {geo:new THREE.ConeGeometry(1.0,3.0,8),m:mt(0,7.6,0),c:A}]);
}
function treeGeoRound(){
  const A=new THREE.Color(0x4c7a34),B=new THREE.Color(0x5f8a3c),T=new THREE.Color(0x5a4430);
  return mergeParts([
    {geo:new THREE.CylinderGeometry(.2,.3,3.2,6),m:mt(0,1.6,0),c:T},
    {geo:new THREE.IcosahedronGeometry(2.3,1),m:mt(0,5,0,1,1.15,1),c:A},
    {geo:new THREE.IcosahedronGeometry(1.5,1),m:mt(1,6.3,.5),c:B}]);
}
const TREEG={con:treeGeoConifer(),rnd:treeGeoRound()};

/* ===== Chunks de terrain ===== */
const CS=160,NSEG=32,CRAD=4;
const IDX=(()=>{const a=[],W=NSEG+1;for(let j=0;j<NSEG;j++)for(let i=0;i<NSEG;i++){const p=j*W+i;a.push(p,p+W,p+1,p+1,p+W,p+W+1)}return new Uint16Array(a)})();
const chunks=new Map();let genQueue=[],roadBlocks=new Map();
const cTmp=new THREE.Color();
const PAL={
 grassLo:[.30,.48,.22],grassHi:[.46,.54,.28],rock:[.47,.45,.42],snow:[.95,.96,.98],gravel:[.45,.42,.38],dirt:[.36,.30,.22],
 f1:[.40,.60,.26],f2:[.70,.65,.34],f3:[.50,.64,.30],f4:[.34,.52,.24]
};
function terrColor(h,ny,d,x,z,out){
  const M=MODE;let c;
  const n=fbm(x*.03,z*.03,2)*.07+fbm(x*.2,z*.2,1)*.03;
  if(MODEKEY==='mountain'){
    const t=sstep(1200,2000,h);
    const g=PAL.grassLo.map((v,i)=>lerp(v,PAL.grassHi[i],t));
    const rk=Math.max(sstep(.8,.55,ny),sstep(M.treeline+100,M.treeline+400,h));
    const sn=sstep(M.snow-60,M.snow+120,h)*sstep(.5,.85,ny);
    c=g.map((v,i)=>lerp(v,PAL.rock[i],rk));c=c.map((v,i)=>lerp(v,PAL.snow[i],sn));
  }else{
    const q=fbm(x*.0035+3,z*.0035-2,2)*.5+.5,a=hash2(Math.floor(x/90+q*3),Math.floor(z/90))*.999;
    const f=a<.25?PAL.f1:a<.5?PAL.f2:a<.75?PAL.f3:PAL.f4;
    const rk=sstep(.82,.62,ny);
    c=f.map((v,i)=>lerp(v,PAL.rock[i],rk));
  }
  const sh=sstep(4.5,6.5,d)*(1-sstep(7,13,d));
  if(sh>0)c=c.map((v,i)=>lerp(v,PAL.gravel[i],sh*.9));
  out.r=clamp(c[0]+n,0,1);out.g=clamp(c[1]+n,0,1);out.b=clamp(c[2]+n,0,1);
}
function* chunkGen(cx,cz){
  const N=NSEG,S=CS/N,W=N+3,x0=cx*CS,z0=cz*CS;
  const H=new Float32Array(W*W),D=new Float32Array(W*W);
  for(let j=0;j<W;j++){for(let i=0;i<W;i++){H[j*W+i]=terrainH(x0+(i-1)*S,z0+(j-1)*S);D[j*W+i]=TS.d}if(j%6===5)yield}
  const V=(N+1)*(N+1),pos=new Float32Array(V*3),nor=new Float32Array(V*3),col=new Float32Array(V*3),NY=new Float32Array(V),col3={r:0,g:0,b:0};
  for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){
    const k=(j+1)*W+i+1,v=j*(N+1)+i;
    const hx=(H[k-1]-H[k+1])/(2*S),hz=(H[k-W]-H[k+W])/(2*S);
    const l=Math.sqrt(hx*hx+1+hz*hz);
    pos[v*3]=i*S;pos[v*3+1]=H[k];pos[v*3+2]=j*S;
    nor[v*3]=hx/l;nor[v*3+1]=1/l;nor[v*3+2]=hz/l;NY[v]=1/l;
    terrColor(H[k],1/l,D[k],x0+i*S,z0+j*S,col3);col[v*3]=col3.r;col[v*3+1]=col3.g;col[v*3+2]=col3.b;
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
  g.setIndex(new THREE.BufferAttribute(IDX,1));g.boundingSphere=new THREE.Sphere(new THREE.Vector3(CS/2,H[Math.floor(W*W/2)],CS/2),CS*1.2+600);
  const mesh=new THREE.Mesh(g,terrMat);mesh.position.set(x0,0,z0);mesh.frustumCulled=false;
  const grp=new THREE.Group();grp.add(mesh);
  yield;
  // arbres
  const TCELL=MODEKEY==='mountain'?10:12,per=Math.floor(CS/TCELL);
  const con=[],rnd=[];
  const rr=mulberry32(((cx*73856093)^(cz*19349663))>>>0);
  for(let gz=0;gz<per;gz++){
    for(let gx=0;gx<per;gx++){
      const px=(gx+rr())*TCELL,pz=(gz+rr())*TCELL,wx=x0+px,wz=z0+pz;
      const r1=rr(),r2=rr();
      const i=Math.min(N,Math.round(px/S)),j=Math.min(N,Math.round(pz/S)),v=j*(N+1)+i,hh=H[(j+1)*W+i+1],dd=D[(j+1)*W+i+1];
      if(dd<10||NY[v]<.62)continue;
      let ok=false,kind='con';
      if(MODEKEY==='mountain'){
        const dens=fbm(wx*.004,wz*.004,2);
        const tl=MODE.treeline-120+60*fbm(wx*.01,wz*.01,1);
        if(hh<tl&&dens>-.25+.9*(1-sstep(900,tl,hh)*0)*0&&r1<.55+dens*.6)ok=true;
        kind=hh<1350&&r2<.3?'rnd':'con';
      }else{
        const dens=fbm(wx*.003,wz*.003,2);
        if(dd<17&&r1<.5)ok=true;
        else if(dens>.2&&r1<.7)ok=true;
        else if(r1<.012)ok=true;
        kind=r2<.7?'rnd':'con';
      }
      if(!ok)continue;
      const y=hh;const sc=.8+r2*.9;
      (kind==='con'?con:rnd).push(px,y-.3,pz,sc,r1*TAU);
    }
  }
  const mk=(arr,geo)=>{
    const n=arr.length/5;if(!n)return;
    const im=new THREE.InstancedMesh(geo,treeMat,n);const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),yy=new THREE.Vector3(0,1,0),c=new THREE.Color();
    for(let k=0;k<n;k++){
      q.setFromAxisAngle(yy,arr[k*5+4]);const s=arr[k*5+3];
      m4.compose(new THREE.Vector3(arr[k*5],arr[k*5+1],arr[k*5+2]),q,new THREE.Vector3(s,s*(.9+.3*hash2(k,n)),s));im.setMatrixAt(k,m4);
      const t=.8+.4*hash2(k*7,n);c.setRGB(t,t,t);im.setColorAt(k,c);
    }
    im.position.set(x0,0,z0);im.frustumCulled=false;grp.add(im);
  };
  mk(con,TREEG.con);mk(rnd,TREEG.rnd);
  return grp;
}
function disposeGroup(g){g.traverse(o=>{if(o.geometry&&o.geometry!==TREEG.con&&o.geometry!==TREEG.rnd)o.geometry.dispose();if(o.dispose&&o.isInstancedMesh)o.dispose()})}
function updateChunks(px,pz,fx,fz){
  const ccx=Math.floor(px/CS),ccz=Math.floor(pz/CS);
  const want=[];
  for(let dz=-CRAD;dz<=CRAD;dz++)for(let dx=-CRAD;dx<=CRAD;dx++){
    const d=Math.hypot(dx,dz);if(d>CRAD+.3)continue;
    const cx=ccx+dx,cz=ccz+dz,key=cx+','+cz;
    if(chunks.has(key))continue;
    const sc=d-.8*(dx*fx+dz*fz)/Math.max(d,1);
    want.push({key,cx,cz,sc});
  }
  want.sort((a,b)=>a.sc-b.sc);
  genQueue=genQueue.filter(q=>Math.hypot(q.cx-ccx,q.cz-ccz)<=CRAD+1);
  for(const w of want){if(!genQueue.some(q=>q.key===w.key)){genQueue.push({key:w.key,cx:w.cx,cz:w.cz,gen:chunkGen(w.cx,w.cz),sc:w.sc});chunks.set(w.key,null)}}
  genQueue.sort((a,b)=>a.sc-b.sc);
  for(const [k,v] of chunks){
    const [cx,cz]=k.split(',').map(Number);
    if(Math.hypot(cx-ccx,cz-ccz)>CRAD+1.6){if(v){scene.remove(v);disposeGroup(v)}chunks.delete(k);genQueue=genQueue.filter(q=>q.key!==k)}
  }
}
function runQueue(ms){
  const t0=performance.now();
  while(genQueue.length&&performance.now()-t0<ms){
    const q=genQueue[0];const r=q.gen.next();
    if(r.done){scene.add(r.value);chunks.set(q.key,r.value);genQueue.shift()}
  }
}
function chunksReady(px,pz,rad){
  const ccx=Math.floor(px/CS),ccz=Math.floor(pz/CS);
  for(let dz=-rad;dz<=rad;dz++)for(let dx=-rad;dx<=rad;dx++){if(!chunks.get((ccx+dx)+','+(ccz+dz)))return false}
  return true;
}
function resetWorldMeshes(){
  for(const [k,v] of chunks){if(v){scene.remove(v);disposeGroup(v)}}
  chunks.clear();genQueue=[];
  for(const [k,v] of roadBlocks){scene.remove(v);disposeGroup(v)}
  roadBlocks.clear();
}

/* ===== Route : ruban, glissieres, bornes ===== */
const RB=60;
function buildRoadBlock(b){
  const i0=b*RB,i1=Math.min(NS-1,i0+RB);
  const n=i1-i0+1;if(n<2)return null;
  const hw=4.6,P=[],U=[],Nn=[],I=[];
  for(let i=i0;i<=i1;i++){
    const lx=RLX[i],lz=RLZ[i],y=RY[i]+.14,s=i*DS;
    P.push(RX[i]+lx*hw,y,RZ[i]+lz*hw, RX[i]-lx*hw,y,RZ[i]-lz*hw);
    U.push(0,s/12,1,s/12);Nn.push(0,1,0,0,1,0);
  }
  for(let k=0;k<n-1;k++){const a=k*2;I.push(a,a+1,a+2,a+1,a+3,a+2)}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setAttribute('normal',new THREE.Float32BufferAttribute(Nn,3));g.setIndex(I);
  const grp=new THREE.Group();grp.add(new THREE.Mesh(g,roadMat));
  const parts=[];const wc=new THREE.Color(0xe6e6e6),rc=new THREE.Color(0xd2342a);
  const rp=[],rn=[],ri=[];
  if(MODEKEY==='mountain'){
    for(const side of [-1,1]){
      const base=rp.length/3;let cnt=0;
      for(let i=i0;i<=i1;i++){
        const lx=RLX[i]*side,lz=RLZ[i]*side,x=RX[i]+lx*6.1,z=RZ[i]+lz*6.1,y=RY[i];
        rp.push(x,y+.46,z,x,y+.92,z);rn.push(-lx,0,-lz,-lx,0,-lz);cnt++;
        if(i%2===0)parts.push({geo:new THREE.BoxGeometry(.1,.95,.1),m:mt(x+lx*.12,y+.4,z+lz*.12),c:wc});
      }
      for(let k=0;k<cnt-1;k++){const a=base/1+k*2;ri.push(a/1,a+1,a+2,a+1,a+3,a+2)}
    }
  }else{
    for(let i=i0;i<=i1;i+=(25/DS|0)){for(const side of [-1,1]){
      const x=RX[i]+RLX[i]*side*6.4,z=RZ[i]+RLZ[i]*side*6.4,y=terrainH(x,z);
      parts.push({geo:new THREE.BoxGeometry(.12,1.1,.12),m:mt(x,y+.55,z),c:wc});
      parts.push({geo:new THREE.BoxGeometry(.13,.2,.13),m:mt(x,y+.95,z),c:rc});
    }}
  }
  if(rp.length){
    const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(rp,3));rg.setAttribute('normal',new THREE.Float32BufferAttribute(rn,3));rg.setIndex(ri);
    grp.add(new THREE.Mesh(rg,railMat));
  }
  if(parts.length)grp.add(new THREE.Mesh(mergeParts(parts),treeMat));
  return grp;
}
function updateRoad(idx){
  const b0=Math.floor(idx/RB),ahead=Math.ceil(1000/(RB*DS)),back=2;
  for(let b=Math.max(0,b0-back);b<=b0+ahead;b++){
    if(!roadBlocks.has(b)){const g=buildRoadBlock(b);if(g){scene.add(g);roadBlocks.set(b,g)}}
  }
  for(const [b,g] of roadBlocks){if(b<b0-back-2||b>b0+ahead+2){scene.remove(g);disposeGroup(g);roadBlocks.delete(b)}}
}

/* ===== Modele de moto (superbike réaliste : carénages lissés, fourche inversée, freins radiaux, pilote en cuir) ===== */
function lambert(c,o){return RK.M.std(c,(o&&o.roughness!=null)?o.roughness:.38,(o&&o.metalness!=null)?o.metalness:.35,o)}
function limb(a,b,r,mat){
  const d=new THREE.Vector3().subVectors(b,a),len=d.length();
  const m=new THREE.Mesh(RK.limbGeo(len,r,r*.9,1.06),mat);
  m.position.copy(a);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());m.castShadow=true;return m;
}
function ell(x,y,z,sx,sy,sz,mat){const m=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);return m}
const BIKE_STYLE={
  h2r:{trellis:1,wings:1,ram:1,mirrors:0,fork:0x1a1a1a,rim:'h2',cal:0xc8a23a,can:'short',name:'H2R'},
  v4r:{trellis:0,wings:1,ram:0,mirrors:1,fork:0xc8a12c,rim:'y',cal:0xc81e1e,can:'stack',single:1,name:'V4 R'},
  rsv4:{trellis:0,wings:1,ram:0,mirrors:1,fork:0xc8a12c,rim:'y',cal:0xc81e1e,can:'side',name:'RSV4'},
  m1000:{trellis:0,wings:1,ram:0,mirrors:1,fork:0x1d2a5a,rim:'5',cal:0x2050c0,can:'side',name:'M RR'},
  h2:{trellis:1,wings:0,ram:1,mirrors:1,fork:0x1a1a1a,rim:'h2',cal:0xc8a23a,can:'side',name:'H2'},
  cbr:{trellis:0,wings:1,ram:1,mirrors:1,fork:0xc8a12c,rim:'5',cal:0xc81e1e,can:'side',name:'CBR'}
};
function makeWheel(rear,ST,rimMat,discMat){
  const g=new THREE.Group(),sp=new THREE.Group(),M=RK.M;
  const R=rear?.316:.305,W=rear?.19:.122,rr=.215;
  const tg=RK.tireGeo(R,W,rr,{round:.9,seg:44});RK.add(sp,tg,RK.tireMat('sport',tg));
  const sty=ST.rim==='y'?{spokes:5,split:.22,spokeW:.03}:ST.rim==='h2'?{spokes:5,split:.3,spokeW:.026}:{spokes:5,spokeW:.036};
  const rg=RK.rimGeo(rr,W*.86,Object.assign({hub:.26,inner:.88,seg:36},sty));
  for(const gg of[rg.face,rg.barrel,rg.hub])RK.add(sp,gg,rimMat);
  RK.add(sp,new THREE.TorusGeometry(rr*.99,.004,6,48),M.chrome(),W*.43,0,0,0,Math.PI/2,0,{noShadow:true});
  RK.add(sp,new THREE.TorusGeometry(rr*.99,.004,6,48),M.chrome(),-W*.43,0,0,0,Math.PI/2,0,{noShadow:true});
  if(rear){
    RK.add(sp,RK.discGeo(.11,.06,.005,{holes:12}),discMat,.09,0,0);
    const spr=new THREE.Shape();const n=42;for(let i=0;i<n*2;i++){const a=i/(n*2)*Math.PI*2,r=i%2?.112:.104;if(i)spr.lineTo(Math.cos(a)*r,Math.sin(a)*r);else spr.moveTo(r,0)}
    const hole=new THREE.Path();hole.absarc(0,0,.05,0,Math.PI*2,true);spr.holes.push(hole);
    RK.add(sp,RK.extrude(spr,.006,{bevel:.001,cs:4}).rotateY(Math.PI/2),M.alu(0x8b8f95),-.09,0,0);
  }else for(const s of[-1,1]){
    RK.add(sp,RK.discGeo(.165,.12,.005,{holes:30}),discMat,s*.074,0,0);
    RK.add(sp,RK.discGeo(.12,.045,.007,{holes:6}),M.alu(ST.cal===0xc8a23a?0xc8a23a:0x3a3d42),s*.072,0,0);
  }
  g.add(sp);g.userData.spin=sp;return g;
}
/* texture de livrée appliquée en UV de loft (u = tour de section, v = longueur) */
function liveryTex(b,ST){
  const c0='#'+b.col[0].toString(16).padStart(6,'0'),c1='#'+b.col[1].toString(16).padStart(6,'0'),c2='#'+b.col[2].toString(16).padStart(6,'0');
  return RK.canvasTex(512,512,(g,w,h)=>{
    g.fillStyle=c0;g.fillRect(0,0,w,h);
    const side=(u,rot)=>{g.save();g.translate(u*w,h*.5);g.rotate(rot);
      g.fillStyle=c1;g.beginPath();g.moveTo(-h*.5,-w*.035);g.lineTo(h*.3,-w*.07);g.lineTo(h*.5,-w*.02);g.lineTo(h*.5,w*.02);g.lineTo(-h*.5,w*.0);g.fill();
      if(b.id==='m1000'){g.fillStyle='#1f5fbf';g.fillRect(-h*.45,w*.04,h*.8,w*.025);g.fillStyle='#6ac0ff';g.fillRect(-h*.45,w*.07,h*.8,w*.015);g.fillStyle='#c4161c';g.fillRect(-h*.45,w*.09,h*.8,w*.02)}
      if(b.id==='cbr'){g.fillStyle='#1b3fae';g.fillRect(-h*.5,w*.05,h*.9,w*.04);g.fillStyle='#ffffff';g.fillRect(-h*.5,w*.035,h*.9,w*.012)}
      g.fillStyle=b.id==='m1000'||b.id==='h2'?'#111':'#fff';if(b.id==='v4r')g.fillStyle='#fff';
      g.font='italic 900 '+(w*.07)+'px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(ST.name,-h*.05,-w*.13);g.restore()};
    side(.27,Math.PI/2);side(.73,-Math.PI/2);
  },{color:true});
}
function buildBike(b){
  const ST=BIKE_STYLE[b.id]||BIKE_STYLE.cbr,M=RK.M,A=RK.add,V=(x,y,z)=>new THREE.Vector3(x,y,z);
  const [c0,c1,c2]=b.col;
  const liv=liveryTex(b,ST);
  const body=M.paint(0xffffff,{map:liv,metalness:.35,roughness:.28}),plain=M.paint(c0,{metalness:.35,roughness:.28}),acc=M.paint(c1,{metalness:.3,roughness:.3}),
    met=M.alu(c2,{roughness:.3}),blk=M.plastic(0x121315),carbon=M.std(0xffffff,.32,.3,{map:RK.carbonTex()}),eng=M.std(0x26282c,.45,.7),
    mag=M.std(0x5b5650,.45,.75),ti=M.std(0xffffff,.28,.95,{map:RK.canvasTex(256,32,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#8a8d92');gr.addColorStop(.5,'#9aa0aa');gr.addColorStop(.75,'#7c6f9a');gr.addColorStop(1,'#6a6f80');g.fillStyle=gr;g.fillRect(0,0,w,h)},{color:true})}),
    chrome=M.chrome(),forkMat=M.std(ST.fork,.25,.9),rimMat=M.std(ST.rim==='h2'?0x141414:b.id==='v4r'?0x1a1a1a:b.id==='m1000'?0x1c1c1c:0x161616,.35,.6),
    discMat=M.std(0xc5c9ce,.22,1),cal=M.paint(ST.cal,{metalness:.3}),seatMat=M.std(0x18191b,.9,0,{map:RK.noiseTex('#1c1d1f',22,64,3,{color:true,repeat:[4,4]})}),
    glass=M.glass(0x1a2026,{opacity:.5}),led=M.glow(0xf2f6ff,2.2),red=M.glow(0xff1a1a,1.6),amber=M.glow(0xff9214,.9),trellisMat=M.paint(ST.trellis?(b.id==='h2r'||b.id==='h2'?0x2bd66b:c1):c2,{metalness:.5,roughness:.3});
  const root=new THREE.Group(),leanG=new THREE.Group(),pitchG=new THREE.Group(),inner=new THREE.Group();
  root.add(leanG);leanG.position.y=.14;leanG.add(pitchG);pitchG.position.set(0,.31,-.72);pitchG.add(inner);inner.position.set(0,-.31,.72);
  const rw=makeWheel(true,ST,rimMat,discMat);rw.position.set(0,.316,-.72);inner.add(rw);
  /* --- moteur 4 cylindres / V4 --- */
  A(inner,RK.rbox(.34,.26,.44,.05,2),eng,0,.4,.1);
  A(inner,RK.rbox(.4,.12,.3,.04,2),eng,0,.27,.12);
  const cyl=new THREE.Group();cyl.position.set(0,.6,.28);cyl.rotation.x=.55;inner.add(cyl);
  A(cyl,RK.rbox(.38,.2,.2,.03,2),eng,0,0,0);for(let i=0;i<5;i++)A(cyl,RK.rbox(.4,.008,.22,.003,1),eng,0,-.08+i*.04,0);
  A(cyl,RK.rbox(.39,.08,.21,.03,2),mag,0,.13,0);
  if(b.id==='v4r'||b.id==='rsv4'){const c2g=new THREE.Group();c2g.position.set(0,.66,.02);c2g.rotation.x=-.5;inner.add(c2g);A(c2g,RK.rbox(.34,.2,.18,.03,2),eng,0,0,0);A(c2g,RK.rbox(.35,.07,.19,.03,2),mag,0,.12,0)}
  for(const s of[-1,1])A(inner,RK.lathe([[0,-.03],[.1,-.03],[.115,-.01],[.11,.02],[.06,.03],[0,.03]],28),s<0?mag:eng,s*.18,.38,.04,0,0,s*Math.PI/2);
  A(inner,RK.rbox(.44,.34,.05,.03,2),M.std(0x111111,.6,.6,{map:RK.canvasTex(64,64,(g,w,h)=>{g.fillStyle='#0a0a0a';g.fillRect(0,0,w,h);g.fillStyle='#3a3a3a';for(let y=0;y<h;y+=4)g.fillRect(0,y,w,1.5)},{color:true,repeat:[4,4]})}),0,.64,.48,.3,0,0);
  /* --- cadre : double poutre alu ou treillis tubulaire --- */
  if(ST.trellis){
    const pts=s=>[[s*.07,.96,.45],[s*.17,.86,.15],[s*.15,.52,-.12],[s*.16,.84,-.22],[s*.09,.95,.45]];
    for(const s of[-1,1]){const p=pts(s);for(let i=0;i<p.length-1;i++)RK.rod(inner,p[i],p[i+1],.011,trellisMat,8);RK.rod(inner,p[0],p[2],.011,trellisMat,8);RK.rod(inner,p[1],p[3],.011,trellisMat,8);RK.rod(inner,[s*.17,.86,.15],[s*.16,.62,.3],.011,trellisMat,8)}
  }else for(const s of[-1,1]){
    RK.between(inner,L=>RK.rbox(.035,L,.1,.015,2).translate(0,L/2,0),met,V(s*.07,.95,.44),V(s*.17,.84,.08));
    RK.between(inner,L=>RK.rbox(.035,L,.12,.015,2).translate(0,L/2,0),met,V(s*.17,.84,.1),V(s*.15,.48,-.13));
  }
  A(inner,new THREE.CylinderGeometry(.04,.04,.12,18),met,0,0,0).position.set(0,.95,.47);
  /* --- bras oscillant (simple ou double branche), amortisseur, chaîne --- */
  for(const s of(ST.single?[-1]:[-1,1])){
    RK.between(inner,L=>RK.rbox(ST.single?.05:.035,L,ST.single?.11:.08,.02,2).translate(0,L/2,0),met,V(s*.12,.31,-.72),V(s*.13,.46,-.14));
  }
  if(ST.single)A(inner,RK.lathe([[0,-.05],[.07,-.05],[.075,.0],[.05,.05],[0,.05]],20),met,-.13,.316,-.72,0,0,Math.PI/2);
  A(inner,new THREE.CylinderGeometry(.025,.025,.34,12),met,0,.46,-.14,0,0,Math.PI/2);
  RK.rod(inner,[0,.42,-.38],[0,.66,-.2],.014,chrome,10);RK.rod(inner,[0,.42,-.38],[0,.5,-.31],.024,M.std(0x2a2a2a,.4,.6),12);
  {const sp=[];for(let i=0;i<=40;i++){const t=i/40,a=t*Math.PI*14,p=V(0,.5,-.31).lerp(V(0,.64,-.21),t);sp.push(V(Math.cos(a)*.03,p.y+Math.sin(a)*.03*.55,p.z-Math.sin(a)*.03*.84))}
   A(inner,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sp),120,.005,6,false),M.paint(b.id==='v4r'||b.id==='rsv4'||b.id==='cbr'?0xe8c21a:0xd11a1a,{metalness:.2}))}
  {const ch=[];const fz=-.05,fy=.4,rz=-.72,ry=.316;for(let i=0;i<=24;i++){const a=Math.PI/2+i/24*Math.PI;ch.push([-.095,ry+Math.sin(a)*.108,rz+Math.cos(a)*.108])}for(let i=0;i<=12;i++){const a=-Math.PI/2+i/12*Math.PI;ch.push([-.095,fy+Math.sin(a)*.05,fz+Math.cos(a)*.05])}
   A(inner,RK.tube(ch,.007,{closed:true,seg:120,radial:5}),M.std(0x3a3b3d,.5,.8))}
  /* --- échappement : collecteurs + silencieux titane --- */
  const hdr=[];for(let k=0;k<2;k++){const x=k?.06:-.06;hdr.push(A(inner,RK.tube([[x,.56,.44],[x*1.4,.38,.48],[x*1.6,.22,.32],[.08,.2,.0],[.16,.26,-.2]],.024,{seg:40,radial:10}),ti))}
  if(ST.can==='stack'){for(const y of[.42,.5])RK.between(inner,L=>RK.lathe([[0,0],[.045,0],[.05,.02],[.05,L-.02],[.044,L],[0,L]],20),ti,V(.2,y-.1,-.22),V(.24,y+.02,-.6))}
  else{const L=ST.can==='short'?.3:.42;const can=RK.between(inner,L2=>RK.lathe([[0,0],[.05,0],[.065,.03],[.07,L2*.5],[.062,L2-.02],[.055,L2],[0,L2]],24),ti,V(.19,.3,-.22),V(.23,.48,-.22-L));
    RK.between(inner,L2=>RK.lathe([[0,0],[.058,0],[.06,L2],[0,L2]],24),carbon,V(.19+.04*(L/.42),.3+.18*(L/.42)*.95,-.22-L*.95),V(.235,.485,-.22-L*1.02))}
  /* --- réservoir, selle, coque arrière, feu --- */
  A(inner,RK.loft([{z:-.26,w:.14,t:.05,b:.08,y:.97},{z:-.05,w:.19,t:.1,b:.1,y:.99,n:2.6},{z:.2,w:.2,t:.1,b:.1,y:1.0,n:2.6},{z:.38,w:.13,t:.05,b:.06,y:.98}],{sides:32,sub:5}),body,0,0,0);
  A(inner,RK.loft([{z:-.6,w:.1,t:.03,b:.03,y:.93},{z:-.45,w:.135,t:.04,b:.04,y:.925,n:3},{z:-.25,w:.15,t:.04,b:.04,y:.93,n:3},{z:-.18,w:.12,t:.025,b:.03,y:.94}],{sides:28}),seatMat,0,0,0);
  const tail=RK.loft([{z:-1.07,w:.025,t:.02,b:.03,y:1.03},{z:-.9,w:.085,t:.05,b:.07,y:1.0,n:2.2},{z:-.6,w:.14,t:.06,b:.12,y:.93,n:2.4},{z:-.3,w:.17,t:.07,b:.16,y:.87,n:2.6},{z:-.18,w:.17,t:.05,b:.16,y:.85}],{sides:36,sub:4});A(inner,tail,body,0,0,0);
  A(inner,RK.rbox(.12,.025,.03,.01,1),red,0,1.0,-1.035,0,0,0,{noShadow:true});A(inner,RK.rbox(.13,.03,.035,.012,1),M.lens(),0,1.0,-1.04,0,0,0,{noShadow:true});
  if(b.id!=='h2r'){RK.rod(inner,[0,.88,-.95],[0,.68,-1.08],.012,blk);A(inner,new THREE.PlaneGeometry(.2,.13),M.std(0xf2f2f2,.5,0),0,.62,-1.1,0,Math.PI,0);for(const s of[-1,1]){RK.rod(inner,[s*.03,.75,-1.04],[s*.12,.76,-1.06],.006,blk);A(inner,RK.rbox(.03,.02,.04,.008,1),amber,s*.13,.76,-1.06,0,0,0,{noShadow:true})}}
  A(inner,RK.rbox(.03,.05,.12,.012,1),blk,.16,.9,-.85);A(inner,RK.rbox(.025,.07,.06,.01,1),cal,.105,.42,-.8,.4,0,0);
  /* --- carénages latéraux / sabot moteur --- */
  const side=RK.loft([{z:-.16,w:.16,t:.18,b:.2,y:.6,n:2.6},{z:.0,w:.25,t:.3,b:.24,y:.62,n:3.2},{z:.25,w:.28,t:.3,b:.25,y:.62,n:3.4},{z:.43,w:.25,t:.24,b:.18,y:.66,n:3},{z:.5,w:.12,t:.15,b:.1,y:.7,n:2.4}],{sides:44,sub:4});
  A(inner,side,body,0,0,0);
  for(const s of[-1,1]){const px=RK.loftPatch(side,.05,.3,s>0?-.05:Math.PI-.15,s>0?.15:Math.PI+.05,.003);if(px)A(inner,px,blk,0,0,0,0,0,0,{noShadow:true})}
  for(const s of[-1,1])for(let i=0;i<3;i++)A(inner,RK.rbox(.006,.012,.14,.004,1),blk,s*.283,.54+i*.04,.18,0,s*.12,0,{noShadow:true});
  A(inner,RK.loft([{z:-.1,w:.12,t:.03,b:.05,y:.3},{z:.2,w:.16,t:.04,b:.06,y:.28,n:2.6},{z:.42,w:.12,t:.08,b:.05,y:.33}],{sides:28}),carbon,0,0,0);
  /* --- tête de fourche : carénage avant, bulle, phares, entrée d'air, ailerons, rétros --- */
  const hl=new THREE.Group();inner.add(hl);
  const cowl=RK.loft([{z:.32,w:.27,t:.18,b:.17,y:.86,n:2.8},{z:.58,w:.24,t:.16,b:.17,y:.86,n:2.8},{z:.82,w:.16,t:.1,b:.11,y:.85,n:2.3},{z:.96,w:.08,t:.05,b:.06,y:.85,n:2},{z:1.02,w:.03,t:.02,b:.03,y:.85}],{sides:44,sub:5});
  A(hl,cowl,body,0,0,0);
  for(const [a0,a1] of[[-.75,-.1],[Math.PI+.1,Math.PI+.75]]){const p=RK.loftPatch(cowl,.8,.98,a0,a1,.004);if(p){A(hl,p,led,0,0,0,0,0,0,{noShadow:true});const q=RK.loftPatch(cowl,.8,.98,a0,a1,.01);A(hl,q,M.lens(),0,0,0,0,0,0,{noShadow:true})}}
  if(ST.ram)A(hl,RK.rbox(ST.trellis?.14:.09,.07,.12,.03,2),blk,0,.82,.97);
  A(hl,RK.loft([{z:.44,w:.18,t:.08,b:.02,y:1.0,n:2.2},{z:.62,w:.16,t:.06,b:.02,y:.98,n:2.2},{z:.82,w:.1,t:.02,b:.02,y:.93}],{sides:28,sub:4}),glass,0,.005,0).renderOrder=2;
  if(ST.wings)for(const s of[-1,1])A(hl,RK.wing({x:s*.22,y:.82,z:.55,c:.16,t:.12},{x:s*.36,y:.84,z:.6,c:.1,t:.1},{chord:8,span:2}),carbon,0,0,0);
  if(ST.mirrors)for(const s of[-1,1]){RK.rod(hl,[s*.24,.95,.55],[s*.3,1.0,.53],.008,blk);A(hl,RK.rbox(.12,.05,.06,.02,2),plain,s*.33,1.01,.53);A(hl,RK.rbox(.1,.04,.006,.015,1),chrome,s*.33,1.01,.499);A(hl,RK.rbox(.05,.01,.01,.004,1),amber,s*.36,1.0,.562,0,0,0,{noShadow:true})}
  /* tableau de bord TFT */
  const dashC=document.createElement('canvas');dashC.width=256;dashC.height=128;const dashX=dashC.getContext('2d'),dashT=new THREE.CanvasTexture(dashC);dashT.encoding=THREE.sRGBEncoding;
  A(inner,RK.rbox(.17,.1,.03,.012,2),blk,0,1.02,.47,.6,0,0);
  const dashM=A(inner,new THREE.PlaneGeometry(.15,.075),new THREE.MeshBasicMaterial({map:dashT,toneMapped:false}),0,1.02+.016*Math.cos(.6)*0,.47-.017,-.6+Math.PI,0,Math.PI,{noShadow:true});
  dashM.position.set(0,1.02+.0155*Math.sin(.6),.47-.0155*Math.cos(.6));dashM.rotation.set(.6,Math.PI,0);
  let dashLast=-1;
  const dash=(st,bk)=>{const v=Math.round(st.v*3.6),gr=st.v<1&&st.rpm<2000?'N':String(st.gear),key=v*100+(st.rpm/250|0)+gr;if(key===dashLast)return;dashLast=key;
    const g=dashX;g.fillStyle='#05080b';g.fillRect(0,0,256,128);const f=clamp(st.rpm/bk.red,0,1.05);
    for(let i=0;i<24;i++){const on=i/24<f;g.fillStyle=on?(i>19?'#ff3030':i>15?'#ffb020':'#4dff9a'):'#1a2228';g.fillRect(10+i*10,10,8,16)}
    g.fillStyle='#e8f4ff';g.font='bold 58px Arial';g.textAlign='right';g.fillText(v,170,92);g.font='bold 15px Arial';g.fillText('km/h',170,114);
    g.fillStyle='#4dff9a';g.font='bold 60px Arial';g.textAlign='center';g.fillText(gr,218,96);dashT.needsUpdate=true};
  /* --- fourche inversée, tés, demi-guidons, garde-boue, étriers radiaux --- */
  const fp=new THREE.Group();fp.position.set(0,.98,.5);fp.rotation.x=-.38;inner.add(fp);
  const st=new THREE.Group();fp.add(st);
  for(const s of[-1,1]){
    RK.rod(st,[s*.09,.06,0],[s*.09,-.46,0],.029,forkMat,16);
    RK.rod(st,[s*.09,-.46,0],[s*.09,-.68,0],.021,M.std(0x2b2d30,.18,.9),14);
    A(st,RK.rbox(.05,.09,.07,.015,2),M.std(0x1c1d20,.4,.7),s*.09,-.71,0);
    A(st,RK.rbox(.03,.09,.11,.012,2),cal,s*.085,-.6,-.11,.25,0,0);
    A(st,new THREE.CylinderGeometry(.012,.012,.03,10),chrome,s*.09,.08,0);
    const gp0=V(s*.075,.055,.01),gp1=V(s*.31,.035,-.06);
    RK.rod(st,gp0,gp1,.012,M.alu(0x2a2c30),10);
    const grip=A(st,RK.lathe(Array.from({length:12},(_,i)=>[.017+(i%2?.002:0),i/11*.12]),14),blk,0,0,0);grip.position.copy(V(s*.19,.042,-.035));grip.quaternion.setFromUnitVectors(V(0,1,0),gp1.clone().sub(gp0).normalize());
    A(st,RK.rbox(.012,.012,.14,.005,1),M.alu(0x9aa0a6),s*.22,.05,.05,0,s*.25,0);
    A(st,new THREE.CylinderGeometry(.02,.02,.04,14),M.std(0x111111,.3,.2),s*.13,.09,.02);
  }
  A(st,RK.rbox(.26,.03,.09,.012,2),met,0,.0,-.0);A(st,RK.rbox(.26,.035,.1,.012,2),met,0,-.18,-.0);
  const fw=makeWheel(false,ST,rimMat,discMat);fw.position.set(0,-.72,0);st.add(fw);
  {const p=[[.31,-.07],[.325,-.06],[.33,0],[.325,.06],[.31,.07],[.306,.064],[.318,.054],[.322,0],[.318,-.054],[.306,-.064],[.31,-.07]];
   const fg=RK.lathe(p,32,Math.PI*2-2.3,1.9);fg.rotateZ(-Math.PI/2);A(st,fg,b.id==='h2r'?carbon:plain,0,-.72,0)}
  const gp=new THREE.Object3D();gp.position.set(0,-.30,.22);st.add(gp);
  /* --- repose-pieds / commandes reculées --- */
  for(const s of[-1,1]){A(inner,RK.rbox(.02,.12,.1,.008,1),met,s*.16,.46,-.28);RK.rod(inner,[s*.16,.42,-.28],[s*.24,.42,-.28],.009,M.alu(0x9aa0a6),8)}
  /* ===== pilote : combinaison cuir, bosse aéro, casque intégral ===== */
  const suitMain=M.std(new THREE.Color(b.id==='m1000'||c1===0x14171b||c1===0x1a1c20?0xf0f0f0:c1).convertSRGBToLinear(),.55,.05),suitDark=M.std(0x141518,.6,.05),suitW=M.std(0xf0f0f0,.6,.05),
    helmShell=M.paint(c0,{metalness:.25,roughness:.25}),visor=M.std(0x0a0a0c,.05,.85),glove=M.std(0x1a1a1c,.65,0);
  const rider=new THREE.Group();inner.add(rider);
  const hip=V(0,.95,-.42),sh=V(0,1.22,.06),d=sh.clone().sub(hip),Lt=d.length();
  const torso=new THREE.Group();torso.position.copy(hip);torso.quaternion.setFromUnitVectors(V(0,1,0),d.clone().normalize());rider.add(torso);
  const tg=RK.loft([{z:-.04,w:.165,t:.11,b:.1,n:2.4},{z:.15,w:.15,t:.1,b:.09},{z:.3,w:.17,t:.11,b:.1,n:2.5},{z:.44,w:.2,t:.1,b:.09,n:2.9},{z:.52,w:.12,t:.07,b:.06},{z:.56,w:.06,t:.05,b:.05}],{sides:24,sub:4});tg.rotateX(-Math.PI/2);
  A(torso,tg,suitMain,0,0,0);
  A(torso,RK.loft([{z:.2,w:.05,t:.02,b:.01},{z:.42,w:.11,t:.1,b:.01,n:2.4},{z:.56,w:.06,t:.07,b:.01}],{sides:20}).rotateX(-Math.PI/2),suitMain,0,0,-.1);
  A(torso,RK.rbox(.2,.08,.18,.04,2),suitDark,0,.02,.0);
  const head=new THREE.Group();head.position.copy(sh).add(V(0,.07,.08));rider.add(head);
  const hm=RK.helmet(head,helmShell,visor,{r:.145});hm.rotation.x=-.18;
  const arms=[],armRig=[];
  rider.updateMatrixWorld(true);
  for(const s of[-1,1]){
    const shd=V(s*.19,0,0).applyQuaternion(torso.quaternion).add(sh).add(V(0,-.04,0));
    fp.updateMatrixWorld(true);const grip=inner.worldToLocal(st.localToWorld(V(s*.25,.04,-.045)));
    const elb=RK.ik2(shd,grip,.3,.28,V(s*.9,-.6,-.3));
    const a1=limb(shd,elb,.052,suitMain),a2=limb(elb,grip,.043,suitDark),gl=A(null,RK.rbox(.055,.075,.1,.022,2),glove,grip.x,grip.y,grip.z);
    rider.add(a1,a2,gl);arms.push(a1,a2,gl);
    armRig.push({shd0:shd.clone(),grip:grip.clone(),pole:V(s*.9,-.6,-.3),a1,a2,L1:shd.distanceTo(elb),L2:elb.distanceTo(grip)});
    const hp=V(s*.1,.93,-.42),peg=V(s*.2,.47,-.29),knee=RK.ik2(hp,peg,.45,.43,V(s*.5,.25,1));
    const th=limb(hp,knee,.08,suitMain),sn=limb(knee,peg.clone().add(V(0,.05,0)),.058,suitDark);
    const kn=A(null,RK.rbox(.06,.1,.05,.02,2),suitW,knee.x+s*.07,knee.y-.03,knee.z);
    const boot=new THREE.Group();boot.position.copy(peg);rider.add(boot);
    A(boot,RK.rbox(.09,.16,.24,.04,2),suitDark,0,.06,.04,-.3,0,0);A(boot,RK.rbox(.095,.03,.25,.01,1),M.std(0x2a2a2a,.8,0),0,-.02,.04,-.3,0,0);
    rider.add(th,sn,kn);
  }
  rider.traverse(o=>{if(o.isMesh)o.castShadow=true});
  /* ombre au sol */
  const sc=document.createElement('canvas');sc.width=sc.height=64;const sx=sc.getContext('2d');const gr=sx.createRadialGradient(32,32,2,32,32,30);gr.addColorStop(0,'rgba(0,0,0,.6)');gr.addColorStop(1,'rgba(0,0,0,0)');sx.fillStyle=gr;sx.fillRect(0,0,64,64);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(1.1,2.8),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=.17;root.add(shadow);
  return {root,leanG,pitchG,inner,rider,head,torso,arms,armRig,st,fp,fw,rw,gp,shadow,hm,hl,dash};
}

let bikeObj=null,bikeIdx=0;
function selectBikeModel(i){
  if(bikeObj)scene.remove(bikeObj.root);
  bikeObj=buildBike(BIKES[i]);scene.add(bikeObj.root);
  // vraie moto (Sketchfab, CC-BY : Ducati V4R par IrfanMuaz, Yamaha R1 par ejsnowy) à la place de la moto procédurale (supprimée) ; le pilote reste
  const obj=bikeObj,real=BIKES[i].id==='v4r'?['ducati-v4r',0]:['yamaha-r1',Math.PI];
  import(new URL('../../assets/glb.js',location.href).href).then(m=>m.loadGLB(new URL('../../assets/models/'+real[0]+'.glb',location.href).href).then(g=>{
    if(obj!==bikeObj)return;m.purge(obj.inner,[obj.rider]);obj.inner.add(m.fitGLB(g,2.05,real[1]))})).catch(e=>console.warn('Moto non chargée',e));
}

/* ===== Entrees ===== */
const keys={};
addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();keys[k]=true;
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
  if(!playing)return;
  if(k==='c')setCam((camMode+1)%3);
  if(k==='1')setCam(0);if(k==='2')setCam(1);if(k==='3')setCam(2);
  if(k==='r')resetOnRoad();
  if(k==='escape')openMenu();
  if(k==='m')toggleMute();
});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
const touch={l:false,r:false,g:false,b:false};
function bindTouch(id,k){const el=document.getElementById(id);const on=e=>{e.preventDefault();touch[k]=true;el.classList.add('p')},off=e=>{e.preventDefault();touch[k]=false;el.classList.remove('p')};
  el.addEventListener('pointerdown',on);el.addEventListener('pointerup',off);el.addEventListener('pointercancel',off);el.addEventListener('pointerleave',off)}
bindTouch('tl','l');bindTouch('tr','r');bindTouch('tb','b');bindTouch('tg','g');
// camera 3e personne : clic gauche + glisser pour tourner autour de la moto
const orb={yaw:0,pitch:0,drag:false,lx:0,ly:0,idle:0,id:null};
cv.classList.add('orbit');
cv.addEventListener('pointerdown',e=>{
  if(!playing||camMode!==0||e.button!==0)return;
  orb.drag=true;orb.id=e.pointerId;orb.lx=e.clientX;orb.ly=e.clientY;cv.setPointerCapture(e.pointerId);cv.classList.add('drag');e.preventDefault();
});
cv.addEventListener('pointermove',e=>{
  if(!orb.drag||e.pointerId!==orb.id)return;
  orb.yaw-=(e.clientX-orb.lx)*.006;orb.pitch=clamp(orb.pitch+(e.clientY-orb.ly)*.005,-.3,1.1);
  orb.yaw=Math.atan2(Math.sin(orb.yaw),Math.cos(orb.yaw));
  orb.lx=e.clientX;orb.ly=e.clientY;orb.idle=0;
});
const orbEnd=e=>{if(e.pointerId!==orb.id)return;orb.drag=false;orb.idle=0;cv.classList.remove('drag')};
cv.addEventListener('pointerup',orbEnd);cv.addEventListener('pointercancel',orbEnd);
function readInput(){
  const left=keys['q']||keys['a']||keys['arrowleft']||touch.l,right=keys['d']||keys['arrowright']||touch.r;
  const gas=keys['z']||keys['w']||keys['arrowup']||keys[' ']&&false||touch.g,brk=keys['s']||keys['arrowdown']||touch.b;
  return {thr:gas?1:0,brk:brk?1:0,steer:(left?1:0)-(right?1:0)};
}

/* ===== Camera, effets, audio ===== */
let camMode=0,camPos=new THREE.Vector3(),camYaw=0,camInit=false,shake=0,t0=0;
function setCam(m){
  camMode=m;camInit=false;orb.yaw=orb.pitch=0;orb.drag=false;cv.classList.toggle("orbit",m===0);
  document.querySelectorAll('#cams button').forEach(b=>b.classList.toggle('on',+b.dataset.cam===m));
  document.getElementById('rec').style.display=m===2?'block':'none';
  if(bikeObj){const fp=m===1;bikeObj.head.visible=!fp;bikeObj.torso.visible=!fp;bikeObj.arms.forEach(a=>a.visible=true);bikeObj.hl.visible=m!==2}
}
document.getElementById('cams').addEventListener('click',e=>{const b=e.target.closest('button');if(b)setCam(+b.dataset.cam)});
const fxc=document.getElementById('fx'),fx=fxc.getContext('2d');
function resize(){
  const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  const dpr=Math.min(devicePixelRatio||1,1.5);fxc.width=w*dpr;fxc.height=h*dpr;fx.setTransform(dpr,0,0,dpr,0,0);
}
addEventListener('resize',resize);
const _v=new THREE.Vector3(),_q=new THREE.Quaternion(),_u=new THREE.Vector3(),_d=new THREE.Vector3();
function updateCamera(st,dt,time){
  const b=bikeObj,v=st.v,kph=v*3.6,sp=clamp(kph/300,0,1);
  b.root.updateMatrixWorld(true);
  const fwd=_d.set(Math.sin(st.psi),0,Math.cos(st.psi));
  if(camMode===0){
    camYaw+=(Math.atan2(Math.sin(st.psi-camYaw),Math.cos(st.psi-camYaw)))*Math.min(1,dt*(camInit?4.5:100));
    const dist=4.6+sp*1.6,hgt=1.55+sp*.25;
    // orbite souris : revient doucement derriere la moto apres 1,5 s sans glisser
    if(!orb.drag){orb.idle+=dt;if(orb.idle>1.5){const f=Math.exp(-dt*2.5);orb.yaw*=f;orb.pitch*=f}}
    const a=camYaw+orb.yaw,R=Math.hypot(dist,hgt),e=Math.atan2(hgt,dist)+orb.pitch;
    _v.set(st.x-Math.sin(a)*Math.cos(e)*R,st.y+Math.sin(e)*R,st.z-Math.cos(a)*Math.cos(e)*R);
    if(!camInit){camPos.copy(_v);camInit=true}
    camPos.lerp(_v,Math.min(1,dt*(orb.drag?30:10)));
    const g=terrainHeightFast(camPos.x,camPos.z);if(camPos.y<g+.5)camPos.y=g+.5;
    camera.position.copy(camPos);
    camera.up.set(0,1,0);
    // en orbite on vise la moto plutot que la route devant
    const w=clamp(Math.abs(orb.yaw)/.6+Math.abs(orb.pitch)/.6,0,1);
    camera.lookAt(st.x+fwd.x*7*(1-w),st.y+.95+Math.min(.6,sp*.5)*(1-w)-.15*w,st.z+fwd.z*7*(1-w));
    camera.rotateZ(st.lean*.12*(1-w));
    camera.fov=lerp(camera.fov,60+sp*28,Math.min(1,dt*4));
  }else if(camMode===1){
    _v.set(0,1.28,.1);b.inner.localToWorld(_v);
    camera.position.copy(_v);
    _u.set(0,1,0).applyQuaternion(b.leanG.getWorldQuaternion(_q));_u.lerp(new THREE.Vector3(0,1,0),.55).normalize();
    camera.up.copy(_u);
    _d.set(0,-.05+(-st.pitch*.9),1);_d.applyAxisAngle(new THREE.Vector3(0,1,0),b.root.rotation.y+Math.max(-.3,Math.min(.3,st.steer))*.4);
    camera.lookAt(camera.position.clone().add(_d.multiplyScalar(20)));
    camera.fov=lerp(camera.fov,74+sp*24,Math.min(1,dt*4));
  }else{
    b.gp.getWorldPosition(_v);
    const vib=(.0006+sp*.0016)*(1+st.off*3);
    _v.x+=(Math.random()-.5)*vib;_v.y+=(Math.random()-.5)*vib*1.6;
    camera.position.copy(_v);
    _u.set(0,1,0).applyQuaternion(b.leanG.getWorldQuaternion(_q));camera.up.copy(_u);
    b.fp.getWorldQuaternion(_q);
    _d.set(0,-.45,.893).applyQuaternion(_q);
    // la camera suit la fourche en lacet, pas en roulis exagere
    camera.lookAt(camera.position.clone().add(_d.multiplyScalar(12)));
    camera.rotateZ((Math.random()-.5)*vib*8);
    camera.fov=lerp(camera.fov,104+sp*10,Math.min(1,dt*4));
  }
  camera.updateProjectionMatrix();
}
function terrainHeightFast(x,z){projectNear(x,z,bikeState.idx,60);return Math.abs(RP.lat)<6?RP.y:bikeState.y-1.5}
function drawFx(st,time){
  const w=innerWidth,h=innerHeight;fx.clearRect(0,0,w,h);
  const kph=st.v*3.6;
  const k=clamp((kph-90)/230,0,1);
  if(k>.02){
    const cx=w/2,cy=h*.5,n=Math.floor(26+k*50);fx.lineCap='round';
    for(let i=0;i<n;i++){
      const a=hash2(i,7)*TAU,ph=(time*(1.2+k*2.6)+hash2(i,3))%1,r0=Math.hypot(w,h)*(.28+.5*ph*ph),len=Math.hypot(w,h)*(.04+.22*k)*ph;
      fx.strokeStyle='rgba(255,255,255,'+(.05+.22*k*ph)+')';fx.lineWidth=1+2*k*ph;
      fx.beginPath();fx.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0*.8);fx.lineTo(cx+Math.cos(a)*(r0+len),cy+Math.sin(a)*(r0+len)*.8);fx.stroke();
    }
  }
  const g=fx.createRadialGradient(w/2,h/2,Math.min(w,h)*(.55-.18*k),w/2,h/2,Math.hypot(w,h)*.62);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,'+(.28+.38*k+(camMode===2?.25:0))+')');
  fx.fillStyle=g;fx.fillRect(0,0,w,h);
  if(camMode===2){
    fx.fillStyle='rgba(255,255,255,.05)';fx.fillRect(0,0,w,h);
    fx.strokeStyle='rgba(0,0,0,.5)';fx.lineWidth=Math.min(w,h)*.04;fx.strokeRect(0,0,w,h);
  }
  if(st.slide>.05||st.crash>0){fx.fillStyle='rgba(239,68,68,'+Math.min(.35,st.slide*.4+(st.crash>0?.3:0))+')';fx.fillRect(0,0,w,h)}
}
let AC=null,eng=null,wind=null,muted=false;
function initAudio(){
  if(AC)return;
  try{
    AC=new (window.AudioContext||window.webkitAudioContext)();
    const master=AC.createGain();master.gain.value=.5;master.connect(AC.destination);AC.master=master;
    const o1=AC.createOscillator(),o2=AC.createOscillator(),f=AC.createBiquadFilter(),gn=AC.createGain();
    o1.type='sawtooth';o2.type='square';f.type='lowpass';f.frequency.value=900;f.Q.value=2;gn.gain.value=0;
    o1.connect(f);o2.connect(f);f.connect(gn);gn.connect(master);o1.start();o2.start();eng={o1,o2,f,gn};
    const buf=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const ns=AC.createBufferSource();ns.buffer=buf;ns.loop=true;const wf=AC.createBiquadFilter();wf.type='bandpass';wf.frequency.value=600;wf.Q.value=.6;const wg=AC.createGain();wg.gain.value=0;
    ns.connect(wf);wf.connect(wg);wg.connect(master);ns.start();wind={f:wf,g:wg};
  }catch(e){AC=null}
}
function toggleMute(){muted=!muted;if(AC)AC.master.gain.value=muted?0:.5}
function updateAudio(st,bk,thr){
  if(!AC||!eng)return;
  const x=clamp(st.rpm/bk.red,.05,1.15),f0=32+x*190,now=AC.currentTime;
  eng.o1.frequency.setTargetAtTime(f0,now,.03);eng.o2.frequency.setTargetAtTime(f0*.5,now,.03);
  eng.f.frequency.setTargetAtTime(500+x*2600+thr*900,now,.05);
  eng.gn.gain.setTargetAtTime(.06+.12*thr+.05*x,now,.05);
  const k=clamp(st.v/80,0,1);
  wind.g.gain.setTargetAtTime(k*k*.5,now,.1);wind.f.frequency.setTargetAtTime(300+k*1800,now,.1);
}

/* ===== Menu & boucle ===== */
let playing=false,loading=false,sel=0,selMode='mountain',selTime='day',aids=true;
const bikeState=newState();
const $=id=>document.getElementById(id);
function buildMenu(){
  const maxhp=Math.max(...BIKES.map(b=>b.hp));
  $('bikes').innerHTML=BIKES.map((b,i)=>'<button class="card'+(i===sel?' on':'')+'" data-i="'+i+'"><div class="n">'+b.name+'</div><div class="e">'+b.eng+(b.note?' · '+b.note:'')+'</div><div class="hp">'+b.hp+'<small>ch</small></div><div class="bar"><i style="width:'+(b.hp/maxhp*100)+'%"></i></div><div class="s"><span>'+b.kg+' kg</span><span>vmax sim. '+b.vtop+' km/h</span></div></button>').join('');
  const opts=(id,arr,cur,cb)=>{const el=$(id);el.innerHTML=arr.map(a=>'<button data-v="'+a[0]+'" class="'+(a[0]===cur?'on':'')+'">'+a[1]+'</button>').join('');
    el.onclick=e=>{const b=e.target.closest('button');if(!b)return;cb(b.dataset.v);[...el.children].forEach(c=>c.classList.toggle('on',c===b))}};
  opts('optMode',[['mountain','Col de montagne'],['open','Route ouverte']],selMode,v=>selMode=v);
  opts('optTime',[['day','Plein jour'],['dusk','Coucher de soleil']],selTime,v=>selTime=v);
  opts('optAid',[['1','Aides activées'],['0','Sans aides (pilote)']],'1',v=>aids=v==='1');
}
$('bikes').onclick=e=>{const c=e.target.closest('.card');if(!c)return;sel=+c.dataset.i;[...$('bikes').children].forEach((x,i)=>x.classList.toggle('on',i===sel))};
function openMenu(){playing=false;document.body.classList.add('menu');$('menu').style.display='block';$('go').textContent='Reprendre / appliquer'}
function msg(t,ms){const m=$('msg');m.textContent=t;m.classList.add('show');clearTimeout(msg.t);msg.t=setTimeout(()=>m.classList.remove('show'),ms||1600)}
let curMode=null;
function startRun(){
  initAudio();if(AC&&AC.state==='suspended')AC.resume();
  const needWorld=curMode!==selMode;
  $('menu').style.display='none';document.body.classList.remove('menu');loading=true;
  if(needWorld){resetWorldMeshes();initWorld(selMode);curMode=selMode;}
  applyLight(selTime);
  selectBikeModel(sel);
  placeOnRoad(bikeState,40);bikeState.y=RY[bikeState.idx];
  setCam(camMode);
  $('info').innerHTML='<b>'+BIKES[sel].name+'</b><br>'+BIKES[sel].hp+' ch · '+BIKES[sel].kg+' kg';
  msg('Chargement du décor…',60000);
  const wait=()=>{
    updateChunks(bikeState.x,bikeState.z,Math.sin(bikeState.psi),Math.cos(bikeState.psi));updateRoad(bikeState.idx);
    runQueue(30);
    if(chunksReady(bikeState.x,bikeState.z,2)){loading=false;playing=true;msg('Gaz !',900);last=performance.now()}
    else requestAnimationFrame(wait);
  };
  wait();
}
$('go').onclick=startRun;
function resetOnRoad(){
  const i=clamp(Math.round(bikeState.s/DS),10,NS-10);
  const keepV=0;placeOnRoad(bikeState,i*DS);bikeState.y=RY[i];bikeState.v=keepV;camInit=false;msg('Remis sur la route',1000);
}

/* ===== Mini carte (route vue de dessus, cap en haut) ===== */
const miniC=document.getElementById('mini'),mx=miniC.getContext('2d');let miniRange=320;
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function drawMini(st){
  const W=miniC.width,cx=W/2,cy=W*.62,R=W/2;
  const target=clamp(260+st.v*3.6*1.6,300,900);miniRange+=(target-miniRange)*.04;
  const sc=(W*.52)/miniRange; // px par metre
  const sn=Math.sin(st.psi),cs=Math.cos(st.psi);
  const P=(x,z)=>{const dx=x-st.x,dz=z-st.z;return [cx-(dx*cs-dz*sn)*sc,cy-(dx*sn+dz*cs)*sc]};
  mx.clearRect(0,0,W,W);
  mx.save();mx.beginPath();mx.arc(cx,cx,R-2,0,TAU);mx.clip();
  mx.fillStyle=MODEKEY==='mountain'?'#243127':'#2d3a25';mx.fillRect(0,0,W,W);
  // anneaux de distance
  mx.strokeStyle='rgba(255,255,255,.08)';mx.lineWidth=1;
  for(let m=100;m<miniRange*1.2;m+=m<400?100:200){mx.beginPath();mx.arc(cx,cy,m*sc,0,TAU);mx.stroke()}
  const i0=Math.max(0,st.idx-Math.round(miniRange*.8/DS)),i1=Math.min(NS-2,st.idx+Math.round(miniRange*1.5/DS)),stp=Math.max(1,Math.round(5/DS));
  mx.lineCap='round';mx.lineJoin='round';
  // bord noir puis trait de couleur selon le virage
  for(const pass of [0,1]){
    for(let i=i0;i<i1;i+=stp){
      const j=Math.min(NS-1,i+stp),a=P(RX[i],RZ[i]),b=P(RX[j],RZ[j]);
      const k=Math.abs(RTH[j]-RTH[i])/(DS*(j-i));
      mx.beginPath();mx.moveTo(a[0],a[1]);mx.lineTo(b[0],b[1]);
      if(pass===0){mx.strokeStyle='rgba(0,0,0,.75)';mx.lineWidth=Math.max(5,13*sc*3.2)}
      else{mx.strokeStyle=i<st.idx?'rgba(255,255,255,.28)':k>.022?'#ef4444':k>.011?'#fbbf24':'#e8ecf0';mx.lineWidth=Math.max(3,9*sc*3.2)}
      mx.stroke();
    }
  }
  mx.restore();
  // moto
  mx.save();mx.translate(cx,cy);
  mx.fillStyle='#ff5a1f';mx.strokeStyle='#fff';mx.lineWidth=2.5;
  mx.beginPath();mx.moveTo(0,-15);mx.lineTo(10,11);mx.lineTo(0,6);mx.lineTo(-10,11);mx.closePath();mx.fill();mx.stroke();
  mx.restore();
  // cadre + N
  mx.strokeStyle='rgba(255,255,255,.35)';mx.lineWidth=3;mx.beginPath();mx.arc(cx,cx,R-3,0,TAU);mx.stroke();
  mx.fillStyle='rgba(255,255,255,.8)';mx.font='700 22px sans-serif';mx.textAlign='center';mx.textBaseline='middle';
  const ang=-st.psi;mx.fillText('N',cx+Math.sin(ang)*(R-20),cx-Math.cos(ang)*(R-20));
  mx.fillStyle='rgba(255,255,255,.7)';mx.font='600 18px sans-serif';mx.fillText(Math.round(miniRange*.52/10)*10+' m',cx,W-14);
}
let last=performance.now(),acc=0,lastRoadUpd=0,fps=60,tAll=0;
const _qUp=new THREE.Quaternion(),_ax=new THREE.Vector3(1,0,0),_yUp=new THREE.Vector3(0,1,0),_v1=new THREE.Vector3(),_v2=new THREE.Vector3();
function frame(now){
  requestAnimationFrame(frame);
  let dt=Math.min(.05,(now-last)/1000);last=now;if(dt<=0)return;
  tAll+=dt;
  if(playing&&bikeObj){
    const inp=readInput(),bk=BIKES[sel];
    acc+=dt;let ev=null;
    while(acc>=1/120){const r=stepPhysics(bikeState,bk,inp,aids,1/120);if(r&&!ev)ev=r;acc-=1/120}
    if(ev==='crash'){msg('Chute ! Remise en piste…',1800);setTimeout(()=>{if(playing)resetOnRoad()},1900)}
    else if(ev==='rail'&&!msg.rail){msg('Glissière !',700);msg.rail=1;setTimeout(()=>msg.rail=0,900)}
    const st=bikeState;
    // objets
    const b=bikeObj;
    b.root.position.set(st.x,st.y,st.z);b.root.rotation.y=st.psi;
    b.leanG.rotation.z=st.lean;b.pitchG.rotation.x=-st.pitch;
    b.rider.position.x=-st.lean*.22;
    // buste redresse au freinage (rotation autour des hanches)
    if(!b.torso.userData.q0){b.torso.userData.q0=b.torso.quaternion.clone();b.head.userData.p0=b.head.position.clone()}
    _qUp.setFromAxisAngle(_ax,-.42*st.up);
    b.torso.quaternion.copy(_qUp).multiply(b.torso.userData.q0);
    b.head.position.copy(b.head.userData.p0).sub(b.torso.position).applyQuaternion(_qUp).add(b.torso.position);
    b.head.rotation.x=.25*st.up;
    for(const r of b.armRig){
      const sh=_v1.copy(r.shd0).sub(b.torso.position).applyQuaternion(_qUp).add(b.torso.position);
      const el=RK.ik2(sh,r.grip,.3,.28,r.pole);
      r.a1.position.copy(sh);r.a1.quaternion.setFromUnitVectors(_yUp,_v2.subVectors(el,sh).normalize());r.a1.scale.y=el.distanceTo(sh)/r.L1;
      r.a2.position.copy(el);r.a2.quaternion.setFromUnitVectors(_yUp,_v2.subVectors(r.grip,el).normalize());r.a2.scale.y=r.grip.distanceTo(el)/r.L2;
    }
    b.st.rotation.y=st.steer;
    b.fw.userData.spin.rotation.x=st.spin;b.rw.userData.spin.rotation.x=st.spin;if(b.dash)b.dash(st,bk);
    b.shadow.rotation.z=0;
    updateChunks(st.x,st.z,Math.sin(st.psi),Math.cos(st.psi));
    if(now-lastRoadUpd>250){updateRoad(st.idx);lastRoadUpd=now}
    runQueue(5);
    sun.position.set(st.x+sun.userData.dir.x*300,st.y+sun.userData.dir.y*300,st.z+sun.userData.dir.z*300);sun.target.position.set(st.x,st.y,st.z);
    updateCamera(st,dt,tAll);
    sky.position.copy(camera.position);if(farRing)farRing.position.set(camera.position.x,Math.min(st.y,camera.position.y)-200*0,camera.position.z);
    drawFx(st,tAll);if(((tAll*30)|0)!==((tAll*30-dt*30)|0))drawMini(st);
    // HUD
    $('spd').textContent=Math.round(st.v*3.6);
    $('gear').textContent=st.v<1&&st.rpm<2000?'N':st.gear;
    $('rpmf').style.width=clamp(st.rpm/bk.red*100,0,100)+'%';
    $('rpmt').textContent=Math.round(st.rpm/10)*10+' tr/min';
    updateAudio(st,bk,readInput().thr);
  }else if(!loading&&bikeObj){
    // menu : camera orbitale sur la moto
    const b=bikeObj,a=tAll*.25;
    camera.position.set(bikeState.x+Math.cos(a)*3.2,bikeState.y+1.2,bikeState.z+Math.sin(a)*3.2);
    camera.up.set(0,1,0);camera.lookAt(bikeState.x,bikeState.y+.6,bikeState.z);camera.fov=45;camera.updateProjectionMatrix();
    b.fw.userData.spin.rotation.x+=dt*.5;
    runQueue(8);
    sky.position.copy(camera.position);if(farRing)farRing.position.set(camera.position.x,camera.position.y-200*0,camera.position.z);
    fx.clearRect(0,0,innerWidth,innerHeight);
  }
  renderer.render(scene,camera);
}
// demarrage : monde par defaut visible derriere le menu
document.body.classList.add('menu');buildMenu();resize();
initWorld('mountain');curMode='mountain';applyLight('day');selectBikeModel(0);
placeOnRoad(bikeState,40);bikeState.y=RY[bikeState.idx];
updateChunks(bikeState.x,bikeState.z,0,1);updateRoad(bikeState.idx);
window.__sim={orb,bikeState,stepPhysics,placeOnRoad,get playing(){return playing},startRun,chunks,BIKES,setCam,scene,camera};
requestAnimationFrame(frame);
