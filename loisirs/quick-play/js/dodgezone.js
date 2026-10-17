function backToHub(){ dzStop(); window.location.href='../index.html'; }

const DZ_W=520,DZ_H=420;
const DZ_COLORS=['#E24B4A','#EF9F27','#1D9E75','#D4537E','#7F77DD','#378ADD','#5DCAA5'];
const DZ_SHAPES=['circle','square','diamond','triangle'];
const dzStars=Array.from({length:60},()=>({x:Math.random()*DZ_W,y:Math.random()*DZ_H,r:Math.random()*1.4+.3,a:Math.random()*.18+.04}));
const dzCanvas=document.getElementById('dz-canvas');
const dzCtx=dzCanvas.getContext('2d');
let dzMode='dodge',dzHiDodge=0,dzHiHunter=0,dzState='idle';
let dzScore=0,dzLevel=1,dzLives=3,dzElapsed=0,dzFrame=null,dzLastTime=null,dzSpawnTimer=0;
let dzObstacles=[],dzParticles=[],dzPointerX=DZ_W/2,dzPointerY=DZ_H/2,dzPointerDisplayX=DZ_W/2,dzPointerDisplayY=DZ_H/2;
let dzDodgedCount=0,dzKilledCount=0,dzEscapedCount=0,dzComboCount=0,dzMaxCombo=0,dzHitFlashTimer=0;
let dzHunterWave=1,dzWaveKills=0,dzWaveTarget=0,dzLastComboTime=0;
let dzPlayer={};
const DZ_COMBO_WIN=1800;
const DZ_DODGE_LEVELS=[0,8000,18000,30000,46000,66000,90000,120000,155000,200000];

function dzOpen(mode){
  dzMode=mode;
  document.getElementById('dz-title').textContent=mode==='dodge'?'🔵 Dodge Zone':'🎯 Hunter Zone';
  dzRestartActive();
}
function dzRestartActive(){
  if(dzFrame)cancelAnimationFrame(dzFrame);
  dzFrame=null;
  document.getElementById('dz-end').classList.remove('show');
  dzMode==='dodge'?dzStartDodge():dzStartHunter();
}
function dzStop(){
  dzState='idle';
  if(dzFrame)cancelAnimationFrame(dzFrame);
  dzFrame=null;dzLastTime=null;
  document.getElementById('dz-crosshair').style.display='none';
  document.getElementById('dz-hit-flash').style.background='transparent';
  document.getElementById('dz-end').classList.remove('show');
}
function dzInitShared(){
  dzObstacles=[];dzParticles=[];dzScore=0;dzLevel=1;dzLives=3;dzElapsed=0;dzSpawnTimer=0;dzLastTime=null;
  dzDodgedCount=0;dzKilledCount=0;dzEscapedCount=0;dzComboCount=0;dzMaxCombo=0;dzHitFlashTimer=0;dzLastComboTime=0;
  dzUpdateHud();
}
function dzUpdateHud(){
  document.getElementById('dz-score').textContent=dzScore;
  document.getElementById('dz-level').textContent=dzMode==='hunter'?'V'+dzLevel:dzLevel;
  const lives=document.getElementById('dz-lives');
  lives.textContent=Array(3).fill(0).map((_,i)=>i<dzLives?'♥':'♡').join(' ');
  lives.className='val'+(dzLives===1?' danger':'');
  const pill=document.getElementById('dz-mode-pill');
  pill.textContent=dzMode==='dodge'?'DODGE':'HUNTER';
  pill.className=dzMode;
}
function dzSpawnParticles(x,y,color,count=14){for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=Math.random()*4+1.5;dzParticles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,color,r:Math.random()*4+1.5});}}
function dzSpawnRing(x,y,color){for(let i=0;i<18;i++){const a=i/18*Math.PI*2,s=4;dzParticles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,color,r:2,ring:true});}}
function dzTriggerHitFlash(green=false){document.getElementById('dz-hit-flash').style.background=green?'rgba(29,158,117,.22)':'rgba(226,75,74,.38)';dzHitFlashTimer=220;}
function dzShowFlash(text,mode){const el=document.getElementById('dz-level-flash');el.className=mode;el.textContent=text;el.style.opacity=1;clearTimeout(el._t);el._t=setTimeout(()=>el.style.opacity=0,1300);}
function dzEndGame(){
  dzState='gameover';
  if(dzFrame)cancelAnimationFrame(dzFrame);
  dzFrame=null;
  const hunter=dzMode==='hunter';
  if(hunter){if(dzScore>dzHiHunter)dzHiHunter=dzScore;}else if(dzScore>dzHiDodge)dzHiDodge=dzScore;
  const hi=hunter?dzHiHunter:dzHiDodge;
  document.getElementById('dz-end-title').textContent='Game Over';
  document.getElementById('dz-end-title').className=hunter?'hunter':'dodge';
  document.getElementById('dz-end-score').textContent=dzScore;
  document.getElementById('dz-end-stats').innerHTML=hunter
    ?'<div class="dz-end-stat"><strong>'+dzLevel+'</strong><span>Vague</span></div><div class="dz-end-stat"><strong>'+dzKilledCount+'</strong><span>Détruits</span></div><div class="dz-end-stat"><strong>'+dzMaxCombo+'x</strong><span>Max combo</span></div><div class="dz-end-stat"><strong>'+hi+'</strong><span>Record</span></div>'
    :'<div class="dz-end-stat"><strong>'+dzLevel+'</strong><span>Niveau</span></div><div class="dz-end-stat"><strong>'+dzDodgedCount+'</strong><span>Esquivés</span></div><div class="dz-end-stat"><strong>'+Math.floor(dzElapsed/1000)+'s</strong><span>Survie</span></div><div class="dz-end-stat"><strong>'+hi+'</strong><span>Record</span></div>';
  document.getElementById('dz-record-value').textContent=hi;
  document.getElementById('dz-retry').className='btn '+(hunter?'btn-green':'btn-accent');
  document.getElementById('dz-end').classList.add('show');
}
function dzDrawBg(){
  const g=dzCtx.createRadialGradient(DZ_W/2,DZ_H/2,0,DZ_W/2,DZ_H/2,Math.max(DZ_W,DZ_H)*.75);
  g.addColorStop(0,'#111118');g.addColorStop(1,'#0a0a0f');
  dzCtx.fillStyle=g;dzCtx.fillRect(0,0,DZ_W,DZ_H);
  dzCtx.save();dzCtx.strokeStyle='rgba(255,255,255,.022)';dzCtx.lineWidth=1;
  for(let x=0;x<DZ_W;x+=44){dzCtx.beginPath();dzCtx.moveTo(x,0);dzCtx.lineTo(x,DZ_H);dzCtx.stroke();}
  for(let y=0;y<DZ_H;y+=44){dzCtx.beginPath();dzCtx.moveTo(0,y);dzCtx.lineTo(DZ_W,y);dzCtx.stroke();}
  dzCtx.restore();
  dzStars.forEach(s=>{dzCtx.beginPath();dzCtx.arc(s.x,s.y,s.r,0,Math.PI*2);dzCtx.fillStyle='rgba(200,210,255,'+s.a+')';dzCtx.fill();});
}
function dzDrawParticles(){
  dzParticles.forEach(p=>{
    if(p.isText){dzCtx.save();dzCtx.globalAlpha=Math.min(p.life,1)*.95;dzCtx.fillStyle=p.color;dzCtx.font='700 13px Segoe UI';dzCtx.textAlign='center';dzCtx.fillText(p.text,p.x,p.y);dzCtx.restore();}
    else{dzCtx.save();dzCtx.globalAlpha=Math.min(p.life,1);dzCtx.beginPath();dzCtx.arc(p.x,p.y,Math.max(.1,p.r*(p.ring?1:p.life)),0,Math.PI*2);dzCtx.fillStyle=p.color;dzCtx.fill();dzCtx.restore();}
  });
}
function dzTickParticles(){dzParticles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vx*=.91;p.vy*=.91;p.life-=.032;});dzParticles=dzParticles.filter(p=>p.life>0);}
function dzTickHitFlash(dt){if(dzHitFlashTimer>0){dzHitFlashTimer-=dt;if(dzHitFlashTimer<=0)document.getElementById('dz-hit-flash').style.background='transparent';}}
function dzDrawShape(type,r,color,glow=false){
  dzCtx.fillStyle=glow?'rgba(255,255,255,.88)':color;dzCtx.strokeStyle='rgba(255,255,255,.2)';dzCtx.lineWidth=1.5;
  if(type==='circle'){dzCtx.beginPath();dzCtx.arc(0,0,r,0,Math.PI*2);dzCtx.fill();dzCtx.stroke();}
  else if(type==='square'){const s=r*1.5;dzCtx.beginPath();dzCtx.roundRect(-s/2,-s/2,s,s,3);dzCtx.fill();dzCtx.stroke();}
  else if(type==='diamond'){dzCtx.beginPath();dzCtx.moveTo(0,-r*1.3);dzCtx.lineTo(r*1.1,0);dzCtx.lineTo(0,r*1.3);dzCtx.lineTo(-r*1.1,0);dzCtx.closePath();dzCtx.fill();dzCtx.stroke();}
  else{dzCtx.beginPath();dzCtx.moveTo(0,-r*1.3);dzCtx.lineTo(r*1.2,r*.9);dzCtx.lineTo(-r*1.2,r*.9);dzCtx.closePath();dzCtx.fill();dzCtx.stroke();}
}
function dzStartDodge(){
  dzInitShared();dzState='playing';dzCanvas.style.cursor='none';
  document.getElementById('dz-crosshair').style.display='none';
  document.getElementById('dz-sub').textContent='Souris ou doigt pour esquiver les obstacles.';
  dzPlayer={x:DZ_W/2,y:DZ_H/2,r:10,vx:0,vy:0,trail:[]};
  dzDrawBg();dzFrame=requestAnimationFrame(dzLoopDodge);
}
function dzGetDodgeSpeed(level,time){return 1.5+.4*Math.pow(level,1.35)+(time/60000)*.8;}
function dzGetDodgeSpawn(level,time){return Math.max(200,1400*Math.pow(.72,level-1)*Math.max(0,1-(time/90000)*.4));}
function dzGetDodgeMax(level){return Math.min(5+Math.floor(level*.8),22);}
function dzSpawnDodgeObstacle(){
  if(dzObstacles.length>=dzGetDodgeMax(dzLevel))return;
  const color=DZ_COLORS[Math.floor(Math.random()*DZ_COLORS.length)];
  const side=Math.floor(Math.random()*4);const speed=dzGetDodgeSpeed(dzLevel,dzElapsed);
  const aimX=dzLevel>=3?dzPlayer.x:DZ_W/2,aimY=dzLevel>=3?dzPlayer.y:DZ_H/2;const spread=Math.max(0,1-(dzLevel-1)*.08);
  let x,y,vx,vy;const angle=(ox,oy)=>Math.atan2(aimY-oy,aimX-ox)+(spread*(Math.random()-.5));
  if(side===0){x=Math.random()*DZ_W;y=-20;const a=angle(x,y);vx=Math.cos(a)*speed;vy=Math.sin(a)*speed;}
  else if(side===1){x=DZ_W+20;y=Math.random()*DZ_H;const a=angle(x,y);vx=Math.cos(a)*speed;vy=Math.sin(a)*speed;}
  else if(side===2){x=Math.random()*DZ_W;y=DZ_H+20;const a=angle(x,y);vx=Math.cos(a)*speed;vy=Math.sin(a)*speed;}
  else{x=-20;y=Math.random()*DZ_H;const a=angle(x,y);vx=Math.cos(a)*speed;vy=Math.sin(a)*speed;}
  const type=DZ_SHAPES[Math.floor(Math.random()*DZ_SHAPES.length)];
  const r=dzLevel<=2?14+Math.random()*8:dzLevel<=5?10+Math.random()*12:8+Math.random()*14;
  dzObstacles.push({x,y,vx,vy,r,color,type,rot:0,rotSpeed:(Math.random()-.5)*.1*(1+dzLevel*.05),dead:false,pulse:Math.random()*Math.PI*2});
}
function dzLoopDodge(ts){
  if(!dzLastTime)dzLastTime=ts;const dt=Math.min(ts-dzLastTime,50);dzLastTime=ts;dzElapsed+=dt;dzScore=Math.floor(dzElapsed/100);
  let nextLevel=1;for(let i=0;i<DZ_DODGE_LEVELS.length;i++)if(dzElapsed>=DZ_DODGE_LEVELS[i])nextLevel=i+1;
  if(nextLevel>dzLevel){dzLevel=nextLevel;dzShowFlash('NIVEAU '+dzLevel,'dodge');}
  dzSpawnTimer+=dt;if(dzSpawnTimer>dzGetDodgeSpawn(dzLevel,dzElapsed)){dzSpawnDodgeObstacle();dzSpawnTimer=0;}
  const dx=dzPointerX-dzPlayer.x,dy=dzPointerY-dzPlayer.y,sm=Math.max(.08,.18-dzLevel*.008);
  dzPlayer.vx+=(dx*.14-dzPlayer.vx)*sm*3;dzPlayer.vy+=(dy*.14-dzPlayer.vy)*sm*3;
  dzPlayer.x=Math.max(dzPlayer.r,Math.min(DZ_W-dzPlayer.r,dzPlayer.x+dzPlayer.vx));
  dzPlayer.y=Math.max(dzPlayer.r,Math.min(DZ_H-dzPlayer.r,dzPlayer.y+dzPlayer.vy));
  dzPlayer.trail.push({x:dzPlayer.x,y:dzPlayer.y});if(dzPlayer.trail.length>12)dzPlayer.trail.shift();
  dzObstacles.forEach(o=>{
    o.x+=o.vx;o.y+=o.vy;o.rot+=o.rotSpeed;
    if(dzLevel>=6){const hm=.002*(dzLevel-5)*.6;o.vx+=(dzPlayer.x-o.x)*hm;o.vy+=(dzPlayer.y-o.y)*hm;const spd=Math.hypot(o.vx,o.vy),maxSpd=dzGetDodgeSpeed(dzLevel,dzElapsed)*1.5;if(spd>maxSpd){o.vx=o.vx/spd*maxSpd;o.vy=o.vy/spd*maxSpd;}}
    if(Math.hypot(dzPlayer.x-o.x,dzPlayer.y-o.y)<dzPlayer.r+o.r*.75){o.dead=true;dzSpawnParticles(o.x,o.y,o.color,10);dzLives--;dzTriggerHitFlash();dzUpdateHud();if(dzLives<=0)dzEndGame();}
    if(o.x<-55||o.x>DZ_W+55||o.y<-55||o.y>DZ_H+55){o.dead=true;dzScore+=10;dzDodgedCount++;}
  });
  dzObstacles=dzObstacles.filter(o=>!o.dead);dzTickParticles();dzTickHitFlash(dt);
  dzCtx.clearRect(0,0,DZ_W,DZ_H);dzDrawBg();
  dzObstacles.forEach(o=>{dzCtx.save();dzCtx.translate(o.x,o.y);dzCtx.rotate(o.rot);const pulse=.92+.08*Math.sin(ts*.003+o.pulse);dzCtx.scale(pulse,pulse);dzDrawShape(o.type,o.r,o.color);dzCtx.restore();});
  dzDrawParticles();
  dzPlayer.trail.forEach((pt,i)=>{const a=i/dzPlayer.trail.length*.22;dzCtx.beginPath();dzCtx.arc(pt.x,pt.y,dzPlayer.r*(i/dzPlayer.trail.length)*.7,0,Math.PI*2);dzCtx.fillStyle='rgba(55,138,221,'+a+')';dzCtx.fill();});
  const glow=dzCtx.createRadialGradient(dzPlayer.x,dzPlayer.y,0,dzPlayer.x,dzPlayer.y,dzPlayer.r*3);glow.addColorStop(0,'rgba(55,138,221,.28)');glow.addColorStop(1,'rgba(55,138,221,0)');
  dzCtx.beginPath();dzCtx.arc(dzPlayer.x,dzPlayer.y,dzPlayer.r*3,0,Math.PI*2);dzCtx.fillStyle=glow;dzCtx.fill();
  dzCtx.beginPath();dzCtx.arc(dzPlayer.x,dzPlayer.y,dzPlayer.r,0,Math.PI*2);dzCtx.fillStyle='#378ADD';dzCtx.fill();
  dzCtx.beginPath();dzCtx.arc(dzPlayer.x,dzPlayer.y,dzPlayer.r+2,0,Math.PI*2);dzCtx.strokeStyle='rgba(55,138,221,.4)';dzCtx.lineWidth=1;dzCtx.stroke();
  dzCtx.beginPath();dzCtx.arc(dzPlayer.x,dzPlayer.y,3.5,0,Math.PI*2);dzCtx.fillStyle='rgba(255,255,255,.9)';dzCtx.fill();
  dzUpdateHud();
  if(dzState==='playing')dzFrame=requestAnimationFrame(dzLoopDodge);
}
function dzGetHSpeed(wave){return .6+.18*Math.pow(wave,1.28);}
function dzGetHSpawn(wave){return Math.max(280,1200*Math.pow(.8,wave-1));}
function dzGetWaveTarget(wave){return 6+Math.floor(wave*2.2);}
function dzGetHMax(wave){return Math.min(4+Math.floor(wave*.9),20);}
function dzStartHunter(){
  dzInitShared();dzState='playing';dzCanvas.style.cursor='none';
  document.getElementById('dz-crosshair').style.display='block';
  document.getElementById('dz-sub').textContent='Clique sur les blocs avant qu\'ils quittent l\'écran.';
  dzHunterWave=1;dzWaveKills=0;dzWaveTarget=dzGetWaveTarget(1);dzDrawBg();dzFrame=requestAnimationFrame(dzLoopHunter);
}
function dzSpawnHunterBlock(){
  if(dzObstacles.length>=dzGetHMax(dzHunterWave))return;
  const color=DZ_COLORS[Math.floor(Math.random()*DZ_COLORS.length)];const speed=dzGetHSpeed(dzHunterWave);const type=DZ_SHAPES[Math.floor(Math.random()*DZ_SHAPES.length)];const r=12+Math.random()*10;
  const pool=dzHunterWave<=3?[0]:dzHunterWave<=6?[0,0,0,1,3]:[0,0,1,1,3,3,2];const side=pool[Math.floor(Math.random()*pool.length)];
  let x,y,vx,vy;
  if(side===0){x=r+Math.random()*(DZ_W-r*2);y=-r;vx=(Math.random()-.5)*speed*.55;vy=speed;}
  else if(side===1){x=DZ_W+r;y=Math.random()*DZ_H*.75;vx=-speed;vy=(Math.random()-.5)*speed*.45;}
  else if(side===2){x=Math.random()*DZ_W;y=DZ_H+r;vx=(Math.random()-.5)*speed*.45;vy=-speed;}
  else{x=-r;y=Math.random()*DZ_H*.75;vx=speed;vy=(Math.random()-.5)*speed*.45;}
  const hp=dzHunterWave<=3?1:dzHunterWave<=7?2:3;
  dzObstacles.push({x,y,vx,vy,r,color,type,rot:0,rotSpeed:(Math.random()-.5)*.06,dead:false,escaped:false,pulse:Math.random()*Math.PI*2,hp,maxHp:hp,hitTimer:0});
}
function dzTryClick(x,y){
  let hit=null,minDist=Infinity;dzObstacles.forEach(b=>{const d=Math.hypot(x-b.x,y-b.y);if(d<b.r*1.35&&d<minDist){minDist=d;hit=b;}});if(!hit)return;
  hit.hp--;hit.hitTimer=180;const now=performance.now();dzComboCount=now-dzLastComboTime<DZ_COMBO_WIN?dzComboCount+1:1;dzLastComboTime=now;if(dzComboCount>dzMaxCombo)dzMaxCombo=dzComboCount;
  if(hit.hp<=0){hit.dead=true;const mult=Math.min(dzComboCount,10);const pts=10*mult*(1+Math.floor(dzHunterWave*.35));dzScore+=pts;dzKilledCount++;dzWaveKills++;dzSpawnParticles(hit.x,hit.y,hit.color,18);dzSpawnRing(hit.x,hit.y,hit.color);dzParticles.push({x:hit.x,y:hit.y-hit.r-8,vx:0,vy:-.7,life:1.5,color:dzComboCount>=3?'#EF9F27':'rgba(232,232,240,.9)',r:0,text:dzComboCount>=3?dzComboCount+'× COMBO!':'+'+pts,isText:true});}
  else dzSpawnParticles(hit.x,hit.y,'rgba(255,255,255,.7)',5);
}
function dzLoopHunter(ts){
  if(!dzLastTime)dzLastTime=ts;const dt=Math.min(ts-dzLastTime,50);dzLastTime=ts;dzElapsed+=dt;dzSpawnTimer+=dt;
  if(dzSpawnTimer>dzGetHSpawn(dzHunterWave)){dzSpawnHunterBlock();dzSpawnTimer=0;}
  dzObstacles.forEach(b=>{
    b.x+=b.vx;b.y+=b.vy;b.rot+=b.rotSpeed;if(b.hitTimer>0)b.hitTimer-=dt;
    if(!b.escaped&&(b.x<-b.r*2.5||b.x>DZ_W+b.r*2.5||b.y<-b.r*2.5||b.y>DZ_H+b.r*2.5)){b.escaped=true;b.dead=true;dzEscapedCount++;dzLives--;dzTriggerHitFlash();dzUpdateHud();dzSpawnParticles(Math.max(0,Math.min(DZ_W,b.x)),Math.max(0,Math.min(DZ_H,b.y)),'#E24B4A',8);if(dzLives<=0)dzEndGame();}
  });
  dzObstacles=dzObstacles.filter(b=>!b.dead);
  if(dzWaveKills>=dzWaveTarget&&dzState==='playing'){dzHunterWave++;dzLevel=dzHunterWave;dzWaveKills=0;dzWaveTarget=dzGetWaveTarget(dzHunterWave);const bonus=dzHunterWave*30;dzScore+=bonus;dzShowFlash('VAGUE '+dzHunterWave,'hunter');dzTriggerHitFlash(true);dzParticles.push({x:DZ_W/2,y:DZ_H/2-50,vx:0,vy:-.5,life:2,color:'#EF9F27',r:0,text:'VAGUE TERMINÉE ! +'+bonus,isText:true});}
  dzTickParticles();dzTickHitFlash(dt);dzCtx.clearRect(0,0,DZ_W,DZ_H);dzDrawBg();
  dzObstacles.forEach(b=>{dzCtx.save();dzCtx.translate(b.x,b.y);dzCtx.rotate(b.rot);const pulse=.93+.07*Math.sin(ts*.003+b.pulse);dzCtx.scale(pulse,pulse);dzDrawShape(b.type,b.r,b.color,b.hitTimer>0);if(b.maxHp>1){for(let i=0;i<b.maxHp;i++){dzCtx.beginPath();dzCtx.arc(-((b.maxHp-1)*5)+i*10,-b.r-7,3,0,Math.PI*2);dzCtx.fillStyle=i<b.hp?'rgba(255,255,255,.9)':'rgba(255,255,255,.2)';dzCtx.fill();}}dzCtx.restore();});
  dzDrawParticles();
  const progress=Math.min(dzWaveKills/dzWaveTarget,1),barW=180,barH=5,barX=(DZ_W-barW)/2,barY=DZ_H-14;dzCtx.save();
  dzCtx.fillStyle='rgba(255,255,255,.07)';dzCtx.beginPath();dzCtx.roundRect(barX,barY,barW,barH,3);dzCtx.fill();
  dzCtx.fillStyle='#1D9E75';dzCtx.beginPath();dzCtx.roundRect(barX,barY,barW*progress,barH,3);dzCtx.fill();
  dzCtx.fillStyle='rgba(255,255,255,.32)';dzCtx.font='10px monospace';dzCtx.textAlign='center';dzCtx.fillText('VAGUE '+dzHunterWave+' — '+dzWaveKills+' / '+dzWaveTarget,DZ_W/2,barY-5);
  if(dzComboCount>=2){const age=(performance.now()-dzLastComboTime)/DZ_COMBO_WIN;const alpha=Math.max(0,1-age*1.1);dzCtx.globalAlpha=alpha;dzCtx.fillStyle='#EF9F27';dzCtx.font='700 15px Segoe UI';dzCtx.textAlign='left';dzCtx.fillText(dzComboCount+'× COMBO',12,DZ_H-16);}dzCtx.restore();
  const crosshair=document.getElementById('dz-crosshair');crosshair.style.left=dzPointerDisplayX+'px';crosshair.style.top=dzPointerDisplayY+'px';dzUpdateHud();
  if(dzState==='playing')dzFrame=requestAnimationFrame(dzLoopHunter);
}
function dzUpdatePointer(clientX,clientY){
  const rect=dzCanvas.getBoundingClientRect();
  dzPointerDisplayX=Math.max(0,Math.min(rect.width,clientX-rect.left));
  dzPointerDisplayY=Math.max(0,Math.min(rect.height,clientY-rect.top));
  dzPointerX=dzPointerDisplayX*(DZ_W/rect.width);dzPointerY=dzPointerDisplayY*(DZ_H/rect.height);
}
dzCanvas.addEventListener('mousemove',e=>dzUpdatePointer(e.clientX,e.clientY));
dzCanvas.addEventListener('touchmove',e=>{e.preventDefault();const t=e.touches[0];dzUpdatePointer(t.clientX,t.clientY);},{passive:false});
dzCanvas.addEventListener('click',e=>{if(dzState!=='playing'||dzMode!=='hunter')return;dzUpdatePointer(e.clientX,e.clientY);dzTryClick(dzPointerX,dzPointerY);});
dzCanvas.addEventListener('touchend',e=>{if(dzState!=='playing'||dzMode!=='hunter')return;e.preventDefault();const t=e.changedTouches[0];dzUpdatePointer(t.clientX,t.clientY);dzTryClick(dzPointerX,dzPointerY);},{passive:false});
