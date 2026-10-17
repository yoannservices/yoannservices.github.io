/* ══════════════════════════════════════
   SPACE TOWER DEFENSE — JS
   Vanilla JS • Canvas • No dependencies
══════════════════════════════════════ */
function tdBackToHub(){ TD.stop(); window.location.href='../index.html'; }

const TD=(function(){
'use strict';

/* ════════════ CONSTANTS ════════════ */
const W=780, H=520;
const CELL=40; // grid cell size
const COLS=Math.floor(W/CELL), ROWS=Math.floor(H/CELL);
const LS='td_';

/* ════════════ TURRET DEFS ════════════ */
const TURRET_DEFS={
  laser:   {name:'Laser Sentry',  icon:'🔫',cost:50, range:120,dmg:8,  rate:80,  color:'#60a5fa',projColor:'#60a5fa',projSpeed:10,splash:0,  slow:0,  pierce:false,chain:0, desc:'Tir rapide, faible dégât'},
  plasma:  {name:'Plasma Cannon', icon:'💥',cost:100,range:110,dmg:35, rate:280, color:'#f97316',projColor:'#f97316',projSpeed:7, splash:50, slow:0,  pierce:false,chain:0, desc:'Dégâts de zone'},
  cryo:    {name:'Cryo Beam',     icon:'❄️',cost:80, range:100,dmg:3,  rate:60,  color:'#22d3ee',projColor:'#22d3ee',projSpeed:9, splash:0,  slow:0.5,pierce:false,chain:0, desc:'Ralentit les ennemis'},
  ion:     {name:'Ion Turret',    icon:'⚡',cost:120,range:160,dmg:20, rate:200, color:'#a78bfa',projColor:'#a78bfa',projSpeed:12,splash:0,  slow:0,  pierce:true, chain:0, desc:'Perce les boucliers'},
  missile: {name:'Missile Pod',   icon:'🚀',cost:150,range:180,dmg:45, rate:350, color:'#ef4444',projColor:'#ef4444',projSpeed:6, splash:30, slow:0,  pierce:false,chain:0, desc:'Suit la cible, longue portée'},
  tesla:   {name:'Tesla Coil',    icon:'⚡',cost:200,range:90, dmg:25, rate:180, color:'#facc15',projColor:'#facc15',projSpeed:0, splash:0,  slow:0,  pierce:false,chain:3, desc:'Chaîne entre ennemis'}
};
const TURRET_ORDER=['laser','plasma','cryo','ion','missile','tesla'];
const UPGRADE_MULT=[1, 1.4, 1.9]; // level 1,2,3 multipliers
const UPGRADE_COST_MULT=[0, 0.6, 1.0]; // fraction of base cost

/* ════════════ ALIEN DEFS ════════════ */
const ALIEN_TYPES={
  grunt:    {name:'Grunt',    color:'#6ee7b7',hp:40,  speed:1.0, reward:10, size:8,  shield:0,  cloaked:false,boss:false},
  sprinter: {name:'Sprinter', color:'#fbbf24',hp:25,  speed:2.0, reward:12, size:6,  shield:0,  cloaked:false,boss:false},
  tank:     {name:'Tank',     color:'#f87171',hp:150, speed:0.6, reward:25, size:12, shield:0,  cloaked:false,boss:false},
  shielded: {name:'Bouclier', color:'#818cf8',hp:60,  speed:0.9, reward:20, size:9,  shield:40, cloaked:false,boss:false},
  swarm:    {name:'Essaim',   color:'#a3e635',hp:12,  speed:1.4, reward:5,  size:5,  shield:0,  cloaked:false,boss:false},
  cloaked:  {name:'Furtif',   color:'#94a3b8',hp:50,  speed:1.3, reward:18, size:7,  shield:0,  cloaked:true, boss:false},
  boss:     {name:'Boss',     color:'#f472b6',hp:800, speed:0.4, reward:150,size:18, shield:100,cloaked:false,boss:true}
};

/* ════════════ PATH SYSTEM ════════════ */
// Two paths defined as arrays of grid coords {c,r}
const PATH_A=[
  {c:0,r:3},{c:1,r:3},{c:2,r:3},{c:3,r:3},{c:4,r:3},{c:5,r:3},{c:6,r:3},
  {c:6,r:4},{c:6,r:5},{c:6,r:6},{c:6,r:7},{c:6,r:8},
  {c:7,r:8},{c:8,r:8},{c:9,r:8},{c:10,r:8},{c:11,r:8},{c:12,r:8},
  {c:12,r:7},{c:12,r:6},{c:12,r:5},{c:12,r:4},{c:12,r:3},{c:12,r:2},
  {c:13,r:2},{c:14,r:2},{c:15,r:2},{c:16,r:2},{c:17,r:2},
  {c:17,r:3},{c:17,r:4},{c:17,r:5},{c:17,r:6},{c:17,r:7},{c:17,r:8},{c:17,r:9},{c:17,r:10},
  {c:18,r:10},{c:19,r:10}
];
const PATH_B=[
  {c:0,r:10},{c:1,r:10},{c:2,r:10},{c:3,r:10},{c:4,r:10},
  {c:4,r:9},{c:4,r:8},{c:4,r:7},{c:4,r:6},
  {c:5,r:6},{c:6,r:6},{c:7,r:6},{c:8,r:6},{c:9,r:6},{c:10,r:6},
  {c:10,r:7},{c:10,r:8},{c:10,r:9},{c:10,r:10},{c:10,r:11},
  {c:11,r:11},{c:12,r:11},{c:13,r:11},{c:14,r:11},{c:15,r:11},
  {c:15,r:10},{c:15,r:9},{c:15,r:8},{c:15,r:7},{c:15,r:6},{c:15,r:5},
  {c:16,r:5},{c:17,r:5},{c:18,r:5},{c:19,r:5}
];
const PATHS=[PATH_A, PATH_B];

function pathToPixels(path){
  return path.map(p=>({x:p.c*CELL+CELL/2, y:p.r*CELL+CELL/2}));
}
const PIXEL_PATHS=PATHS.map(pathToPixels);

// Build set of blocked cells
const PATH_CELLS=new Set();
PATHS.forEach(p=>p.forEach(c=>PATH_CELLS.add(c.c+','+c.r)));

/* ════════════ WAVE DEFS ════════════ */
function getWaveDef(waveNum){
  const w=waveNum;
  const hpMult=1+w*0.18;
  const spdMult=1+w*0.02;
  const aliens=[];

  // Base grunts
  const gruntCount=Math.min(5+w*2, 40);
  for(let i=0;i<gruntCount;i++) aliens.push('grunt');

  if(w>=2){ for(let i=0;i<Math.min(w,12);i++) aliens.push('sprinter'); }
  if(w>=4){ for(let i=0;i<Math.min(Math.floor(w/2),8);i++) aliens.push('tank'); }
  if(w>=5){ for(let i=0;i<Math.min(w,15);i++) aliens.push('swarm'); }
  if(w>=6){ for(let i=0;i<Math.min(Math.floor(w/3),6);i++) aliens.push('shielded'); }
  if(w>=8){ for(let i=0;i<Math.min(Math.floor(w/4),5);i++) aliens.push('cloaked'); }
  if(w%5===0 && w>0){ aliens.push('boss'); }

  // Shuffle
  for(let i=aliens.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[aliens[i],aliens[j]]=[aliens[j],aliens[i]];}

  return {aliens, hpMult, spdMult, spawnInterval: Math.max(300, 800-w*15)};
}

/* ════════════ STATE ════════════ */
let canvas, ctx;
let state='menu'; // menu, playing, between, gameover
let frameId=null, lastTime=0;
let credits=0, lives=0, score=0, wave=0;
let bestWave=0;
let turrets=[], enemies=[], projectiles=[], particles=[];
let selectedTurretType=null; // placing mode
let selectedPlaced=null; // clicked on placed turret
let hoverCell=null;
let waveQueue=[], waveSpawnTimer=0, waveSpawnInterval=800;
let waveDef=null;
let waveActive=false;
let killsThisWave=0, totalKills=0, perfectWaves=0;

// Powers
let powers={
  strike:{cd:0,maxCd:45000,active:false,timer:0},
  shield:{cd:0,maxCd:60000,active:false,timer:0},
  slow:  {cd:0,maxCd:40000,active:false,timer:0}
};

// Tech tree — unlocked turrets
let unlockedTurrets=['laser','plasma']; // start with 2
let techPoints=0;
const TECH_COSTS={cryo:2,ion:3,missile:4,tesla:6};

/* ════════════ DOM REFS ════════════ */
function $(id){return document.getElementById(id);}

/* ════════════ INIT ════════════ */
function init(){
  canvas=$('td-canvas');
  ctx=canvas.getContext('2d');
  bestWave=parseInt(localStorage.getItem(LS+'bestWave'))||0;
  $('td-best-val').textContent=bestWave;
  buildTurretButtons();
  canvas.addEventListener('mousemove',onMouseMove);
  canvas.addEventListener('mouseleave',function(){hoverCell=null;});
  canvas.addEventListener('click',onCanvasClick);
  canvas.addEventListener('contextmenu',function(e){e.preventDefault();cancelPlacement();});
}

function buildTurretButtons(){
  const list=$('td-turret-list');
  list.innerHTML='';
  TURRET_ORDER.forEach(function(key){
    const def=TURRET_DEFS[key];
    const locked=unlockedTurrets.indexOf(key)===-1;
    const btn=document.createElement('div');
    btn.className='td-turret-btn'+(locked?' locked':'');
    btn.dataset.type=key;
    btn.innerHTML='<span class="td-turret-icon">'+def.icon+'</span>'+def.name+'<div class="td-turret-cost">'+(locked?'🔒 '+TECH_COSTS[key]+' PT':def.cost+' ¢')+'</div>';
    btn.addEventListener('click',function(){
      if(locked){
        if(techPoints>=TECH_COSTS[key]){
          techPoints-=TECH_COSTS[key];
          unlockedTurrets.push(key);
          buildTurretButtons();
          showInfo('🔓 <strong>'+def.name+'</strong> débloqué !');
        } else {
          showInfo('Besoin de <strong>'+TECH_COSTS[key]+'</strong> points tech (tu en as '+techPoints+')');
        }
        return;
      }
      selectTurretType(key);
    });
    list.appendChild(btn);
  });
}

function selectTurretType(key){
  selectedTurretType=key;
  selectedPlaced=null;
  $('td-btn-sell').style.display='none';
  $('td-btn-upgrade').style.display='none';
  document.querySelectorAll('.td-turret-btn').forEach(function(b){
    b.classList.toggle('active',b.dataset.type===key);
  });
  const def=TURRET_DEFS[key];
  showInfo('<strong>'+def.name+'</strong><br>'+def.desc+
    '<div class="td-stat-row"><span class="td-stat-label">Coût</span><span class="td-stat-val">'+def.cost+' ¢</span></div>'+
    '<div class="td-stat-row"><span class="td-stat-label">Dégâts</span><span class="td-stat-val">'+def.dmg+'</span></div>'+
    '<div class="td-stat-row"><span class="td-stat-label">Portée</span><span class="td-stat-val">'+def.range+'px</span></div>');
}

function cancelPlacement(){
  selectedTurretType=null;
  selectedPlaced=null;
  document.querySelectorAll('.td-turret-btn').forEach(function(b){b.classList.remove('active');});
  $('td-btn-sell').style.display='none';
  $('td-btn-upgrade').style.display='none';
  showInfo('Sélectionne une tourelle à placer.');
}

function showInfo(html){
  $('td-info-content').innerHTML=html;
}

/* ════════════ GAME LIFECYCLE ════════════ */
function startGame(){
  state='between';
  credits=150;
  lives=20;
  score=0;
  wave=0;
  turrets=[];
  enemies=[];
  projectiles=[];
  particles=[];
  waveActive=false;
  totalKills=0;
  perfectWaves=0;
  techPoints=0;
  unlockedTurrets=['laser','plasma'];
  powers.strike.cd=0;powers.shield.cd=0;powers.slow.cd=0;
  powers.strike.active=false;powers.shield.active=false;powers.slow.active=false;
  buildTurretButtons();
  cancelPlacement();

  $('td-start').style.display='none';
  $('td-end').style.display='none';
  $('td-shell').style.display='flex';
  updateHud();
  lastTime=0;
  if(frameId) cancelAnimationFrame(frameId);
  frameId=requestAnimationFrame(loop);
}

function restart(){
  $('td-end').style.display='none';
  $('td-end').classList.remove('show');
  startGame();
}

function stop(){
  state='menu';
  if(frameId) cancelAnimationFrame(frameId);
  frameId=null;
}

function gameOver(){
  state='gameover';
  if(frameId) cancelAnimationFrame(frameId);
  frameId=null;
  if(wave>bestWave){
    bestWave=wave;
    localStorage.setItem(LS+'bestWave',bestWave);
  }
  $('td-best-val').textContent=bestWave;
  $('td-end-score').textContent=score;
  $('td-end-best').textContent=bestWave;
  $('td-end-stats').innerHTML=
    '<div class="td-end-stat"><strong>'+wave+'</strong><span>Vague max</span></div>'+
    '<div class="td-end-stat"><strong>'+totalKills+'</strong><span>Aliens tués</span></div>'+
    '<div class="td-end-stat"><strong>'+perfectWaves+'</strong><span>Vagues parfaites</span></div>'+
    '<div class="td-end-stat"><strong>'+turrets.length+'</strong><span>Tourelles</span></div>';
  $('td-end-record').innerHTML='Record : Vague <strong>'+bestWave+'</strong>';
  $('td-shell').style.display='none';
  $('td-end').style.display='flex';
  $('td-end').classList.add('show');
}

/* ════════════ HUD ════════════ */
function updateHud(){
  $('td-hud-wave').textContent=wave;
  $('td-hud-credits').textContent=credits;
  $('td-hud-lives').textContent=lives;
  $('td-hud-score').textContent=score;
}

/* ════════════ WAVE CONTROL ════════════ */
function sendWave(){
  if(waveActive) return;
  wave++;
  waveDef=getWaveDef(wave);
  waveQueue=waveDef.aliens.slice();
  waveSpawnInterval=waveDef.spawnInterval;
  waveSpawnTimer=0;
  waveActive=true;
  killsThisWave=0;
  state='playing';
  showBanner('VAGUE '+wave);
  updateHud();
}

function showBanner(text){
  const div=document.createElement('div');
  div.id='td-wave-banner';
  div.textContent=text;
  $('td-wrap').appendChild(div);
  requestAnimationFrame(function(){div.style.opacity='1';});
  setTimeout(function(){div.style.opacity='0';setTimeout(function(){if(div.parentNode)div.parentNode.removeChild(div);},400);},1800);
}

function checkWaveEnd(){
  if(!waveActive) return;
  if(waveQueue.length===0 && enemies.length===0){
    waveActive=false;
    state='between';
    // Perfect wave bonus
    if(killsThisWave>0 && lives>=0){
      const leaked=waveDef.aliens.length-killsThisWave;
      if(leaked===0){
        perfectWaves++;
        credits+=50;
        showBanner('PARFAIT ! +50 ¢');
      }
    }
    // Tech point every 2 waves
    if(wave%2===0){
      techPoints++;
      buildTurretButtons();
      showInfo('🔬 +1 Point Tech ! (Total: '+techPoints+')');
    }
    updateHud();
  }
}

/* ════════════ ENEMY SPAWNING ════════════ */
function spawnEnemy(typeKey){
  const def=ALIEN_TYPES[typeKey];
  const pathIdx=Math.floor(Math.random()*PATHS.length);
  const path=PIXEL_PATHS[pathIdx];

  const hpMult=waveDef?waveDef.hpMult:1;
  const spdMult=waveDef?waveDef.spdMult:1;

  enemies.push({
    type:typeKey,
    path:path,
    pathIdx:0,
    x:path[0].x,
    y:path[0].y,
    hp:Math.round(def.hp*hpMult),
    maxHp:Math.round(def.hp*hpMult),
    shield:Math.round(def.shield*hpMult),
    maxShield:Math.round(def.shield*hpMult),
    speed:def.speed*spdMult,
    reward:def.reward,
    size:def.size,
    color:def.color,
    cloaked:def.cloaked,
    boss:def.boss,
    slow:0,
    slowTimer:0,
    alive:true
  });
}

/* ════════════ TURRET PLACEMENT ════════════ */
function onMouseMove(e){
  const rect=canvas.getBoundingClientRect();
  const scaleX=W/rect.width;
  const scaleY=H/rect.height;
  const mx=(e.clientX-rect.left)*scaleX;
  const my=(e.clientY-rect.top)*scaleY;
  const c=Math.floor(mx/CELL);
  const r=Math.floor(my/CELL);
  if(c>=0&&c<COLS&&r>=0&&r<ROWS) hoverCell={c:c,r:r,mx:mx,my:my};
  else hoverCell=null;
}

function onCanvasClick(e){
  if(state!=='playing' && state!=='between') return;
  const rect=canvas.getBoundingClientRect();
  const scaleX=W/rect.width;
  const scaleY=H/rect.height;
  const mx=(e.clientX-rect.left)*scaleX;
  const my=(e.clientY-rect.top)*scaleY;
  const c=Math.floor(mx/CELL);
  const r=Math.floor(my/CELL);

  // Check if clicked on existing turret
  const existing=turrets.find(function(t){return t.c===c&&t.r===r;});

  if(selectedTurretType && !existing){
    // Place new turret
    if(PATH_CELLS.has(c+','+r)) return; // can't place on path
    const def=TURRET_DEFS[selectedTurretType];
    if(credits<def.cost) {showInfo('Pas assez de crédits !');return;}
    credits-=def.cost;
    turrets.push({
      type:selectedTurretType,
      c:c,r:r,
      x:c*CELL+CELL/2,
      y:r*CELL+CELL/2,
      level:1,
      cooldown:0,
      angle:0,
      target:null
    });
    updateHud();
    spawnParticles(c*CELL+CELL/2, r*CELL+CELL/2, def.color, 10);
  } else if(existing){
    // Select placed turret
    selectedPlaced=existing;
    selectedTurretType=null;
    document.querySelectorAll('.td-turret-btn').forEach(function(b){b.classList.remove('active');});
    const def=TURRET_DEFS[existing.type];
    const lvl=existing.level;
    const nextCost=lvl<3?Math.round(def.cost*UPGRADE_COST_MULT[lvl]):0;
    const sellVal=Math.round(def.cost*0.6*lvl);
    showInfo('<strong>'+def.name+' Nv.'+lvl+'</strong>'+
      '<div class="td-stat-row"><span class="td-stat-label">Dégâts</span><span class="td-stat-val">'+Math.round(def.dmg*UPGRADE_MULT[lvl-1])+'</span></div>'+
      '<div class="td-stat-row"><span class="td-stat-label">Portée</span><span class="td-stat-val">'+Math.round(def.range*(1+(lvl-1)*0.15))+'px</span></div>'+
      (lvl<3?'<div class="td-stat-row"><span class="td-stat-label">Améliorer</span><span class="td-stat-val">'+nextCost+' ¢ → Nv.'+(lvl+1)+'</span></div>':'')+
      '<div class="td-stat-row"><span class="td-stat-label">Vendre</span><span class="td-stat-val">+'+sellVal+' ¢</span></div>');
    $('td-btn-sell').style.display='block';
    $('td-btn-upgrade').style.display=lvl<3?'block':'none';
    if(lvl<3) $('td-btn-upgrade').textContent='Améliorer ('+nextCost+' ¢)';
  } else {
    cancelPlacement();
  }
}

function sellSelected(){
  if(!selectedPlaced) return;
  const def=TURRET_DEFS[selectedPlaced.type];
  const refund=Math.round(def.cost*0.6*selectedPlaced.level);
  credits+=refund;
  spawnParticles(selectedPlaced.x, selectedPlaced.y, '#facc15', 12);
  turrets=turrets.filter(function(t){return t!==selectedPlaced;});
  cancelPlacement();
  updateHud();
}

function upgradeSelected(){
  if(!selectedPlaced || selectedPlaced.level>=3) return;
  const def=TURRET_DEFS[selectedPlaced.type];
  const cost=Math.round(def.cost*UPGRADE_COST_MULT[selectedPlaced.level]);
  if(credits<cost){showInfo('Crédits insuffisants !');return;}
  credits-=cost;
  selectedPlaced.level++;
  spawnParticles(selectedPlaced.x, selectedPlaced.y, def.color, 15);
  // Refresh info
  onCanvasClick({clientX:0,clientY:0,target:canvas});
  // Re-select to show updated info
  var t=selectedPlaced;
  cancelPlacement();
  selectedPlaced=t;
  var lvl=t.level;
  var nextCost=lvl<3?Math.round(def.cost*UPGRADE_COST_MULT[lvl]):0;
  var sellVal=Math.round(def.cost*0.6*lvl);
  showInfo('<strong>'+def.name+' Nv.'+lvl+'</strong>'+
    '<div class="td-stat-row"><span class="td-stat-label">Dégâts</span><span class="td-stat-val">'+Math.round(def.dmg*UPGRADE_MULT[lvl-1])+'</span></div>'+
    '<div class="td-stat-row"><span class="td-stat-label">Portée</span><span class="td-stat-val">'+Math.round(def.range*(1+(lvl-1)*0.15))+'px</span></div>'+
    (lvl<3?'<div class="td-stat-row"><span class="td-stat-label">Améliorer</span><span class="td-stat-val">'+nextCost+' ¢ → Nv.'+(lvl+1)+'</span></div>':'')+
    '<div class="td-stat-row"><span class="td-stat-label">Vendre</span><span class="td-stat-val">+'+sellVal+' ¢</span></div>');
  $('td-btn-sell').style.display='block';
  $('td-btn-upgrade').style.display=lvl<3?'block':'none';
  if(lvl<3) $('td-btn-upgrade').textContent='Améliorer ('+nextCost+' ¢)';
  updateHud();
}

/* ════════════ POWERS ════════════ */
function usePower(key){
  var p=powers[key];
  if(p.cd>0 || state==='menu' || state==='gameover') return;
  if(key==='strike'){
    // Damage all enemies on screen
    p.cd=p.maxCd;
    enemies.forEach(function(e){
      if(!e.alive) return;
      var dmg=Math.round(e.maxHp*0.35);
      dealDamage(e, dmg, true);
      spawnParticles(e.x, e.y, '#f59e0b', 8);
    });
    showBanner('☄️ FRAPPE ORBITALE');
    triggerFlash(true);
  } else if(key==='shield'){
    // Temporary invincibility
    p.cd=p.maxCd;
    p.active=true;
    p.timer=8000;
    showBanner('🛡️ BOUCLIER ACTIF');
  } else if(key==='slow'){
    // Slow all enemies
    p.cd=p.maxCd;
    p.active=true;
    p.timer=6000;
    showBanner('⏳ TEMPS RALENTI');
  }
}

function updatePowers(dt){
  ['strike','shield','slow'].forEach(function(key){
    var p=powers[key];
    if(p.cd>0) p.cd=Math.max(0,p.cd-dt);
    if(p.active){
      p.timer-=dt;
      if(p.timer<=0) p.active=false;
    }
    // Update UI
    var btn=$('td-pow-'+key);
    var cdSpan=btn.querySelector('.td-pow-cd');
    if(p.cd>0){
      btn.classList.add('on-cd');
      cdSpan.textContent=Math.ceil(p.cd/1000)+'s';
    } else {
      btn.classList.remove('on-cd');
      cdSpan.textContent='';
    }
  });
}

/* ════════════ COMBAT ════════════ */
function dealDamage(enemy, dmg, pierceShield){
  if(!enemy.alive) return;
  if(enemy.shield>0 && !pierceShield){
    var shieldDmg=Math.min(enemy.shield, dmg);
    enemy.shield-=shieldDmg;
    dmg-=shieldDmg;
  }
  enemy.hp-=dmg;
  if(enemy.hp<=0){
    enemy.alive=false;
    credits+=enemy.reward;
    score+=enemy.reward*2;
    killsThisWave++;
    totalKills++;
    spawnParticles(enemy.x, enemy.y, enemy.color, 18);
    updateHud();
  }
}

function findTarget(turret){
  var def=TURRET_DEFS[turret.type];
  var range=def.range*(1+(turret.level-1)*0.15);
  var best=null, bestDist=Infinity;
  enemies.forEach(function(e){
    if(!e.alive) return;
    if(e.cloaked && turret.type!=='ion' && turret.type!=='tesla') return;
    var dx=e.x-turret.x, dy=e.y-turret.y;
    var dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<=range && dist<bestDist){
      // Prioritize furthest along path
      best=e;
      bestDist=dist;
    }
  });
  return best;
}

function turretShoot(turret, target){
  var def=TURRET_DEFS[turret.type];
  var dmg=Math.round(def.dmg*UPGRADE_MULT[turret.level-1]);

  if(def.chain>0){
    // Tesla — instant chain
    var chainTargets=[target];
    var chains=def.chain+turret.level-1;
    var range=def.range*(1+(turret.level-1)*0.15);
    for(var i=0;i<chains;i++){
      var last=chainTargets[chainTargets.length-1];
      var nextBest=null, nextDist=Infinity;
      enemies.forEach(function(e){
        if(!e.alive || chainTargets.indexOf(e)!==-1) return;
        var dx=e.x-last.x, dy=e.y-last.y;
        var d=Math.sqrt(dx*dx+dy*dy);
        if(d<range*0.8 && d<nextDist){nextBest=e;nextDist=d;}
      });
      if(nextBest) chainTargets.push(nextBest);
      else break;
    }
    chainTargets.forEach(function(e,idx){
      dealDamage(e, Math.round(dmg*(1-idx*0.15)), def.pierce);
      // Chain lightning particle
      if(idx>0){
        var prev=chainTargets[idx-1];
        spawnLightning(prev.x, prev.y, e.x, e.y, def.projColor);
      }
    });
    spawnLightning(turret.x, turret.y, target.x, target.y, def.projColor);
    return;
  }

  projectiles.push({
    x:turret.x,
    y:turret.y,
    target:target,
    targetX:target.x,
    targetY:target.y,
    speed:def.projSpeed,
    dmg:dmg,
    color:def.projColor,
    splash:def.splash*(1+(turret.level-1)*0.2),
    slow:def.slow,
    pierce:def.pierce,
    homing:turret.type==='missile',
    alive:true,
    trail:[]
  });
}

/* ════════════ PARTICLES ════════════ */
function spawnParticles(x,y,color,count){
  for(var i=0;i<count;i++){
    var a=Math.random()*Math.PI*2;
    var s=Math.random()*3+1;
    particles.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,color:color,r:Math.random()*3+1});
  }
}

function spawnLightning(x1,y1,x2,y2,color){
  var segs=6;
  for(var i=0;i<segs;i++){
    var t=i/segs;
    var nx=x1+(x2-x1)*t+(Math.random()-0.5)*15;
    var ny=y1+(y2-y1)*t+(Math.random()-0.5)*15;
    particles.push({x:nx,y:ny,vx:(Math.random()-0.5)*2,vy:(Math.random()-0.5)*2,life:0.6,color:color,r:2});
  }
}

function triggerFlash(green){
  $('td-hit-flash').style.background=green?'rgba(16,185,129,.2)':'rgba(239,68,68,.3)';
  setTimeout(function(){$('td-hit-flash').style.background='transparent';},200);
}

/* ════════════ UPDATE ════════════ */
function update(dt){
  if(state==='gameover' || state==='menu') return;

  var slowMult=powers.slow.active?0.4:1;

  // Spawn enemies from wave queue
  if(waveQueue.length>0){
    waveSpawnTimer-=dt;
    if(waveSpawnTimer<=0){
      spawnEnemy(waveQueue.shift());
      waveSpawnTimer=waveSpawnInterval;
    }
  }

  // Update enemies
  enemies.forEach(function(e){
    if(!e.alive) return;
    // Slow effect
    var eSlow=1;
    if(e.slowTimer>0){
      e.slowTimer-=dt;
      eSlow=1-e.slow;
    }
    // Shield regen for shielded type
    if(ALIEN_TYPES[e.type].shield>0 && e.shield<e.maxShield){
      e.shield=Math.min(e.maxShield, e.shield+dt*0.005*e.maxShield/1000);
    }

    var speed=e.speed*CELL*0.03*eSlow*slowMult;
    var target=e.path[e.pathIdx+1];
    if(!target){
      // Reached the end
      e.alive=false;
      if(!powers.shield.active){
        lives--;
        if(lives<=0){lives=0;updateHud();gameOver();return;}
        triggerFlash(false);
      }
      updateHud();
      return;
    }
    var dx=target.x-e.x;
    var dy=target.y-e.y;
    var dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<speed*dt*0.06){
      e.x=target.x;
      e.y=target.y;
      e.pathIdx++;
    } else {
      e.x+=dx/dist*speed*dt*0.06;
      e.y+=dy/dist*speed*dt*0.06;
    }
  });

  // Update turrets
  turrets.forEach(function(t){
    t.cooldown-=dt;
    var target=findTarget(t);
    if(target){
      t.angle=Math.atan2(target.y-t.y, target.x-t.x);
      t.target=target;
      if(t.cooldown<=0){
        var def=TURRET_DEFS[t.type];
        t.cooldown=def.rate*(1-(t.level-1)*0.1);
        turretShoot(t, target);
      }
    } else {
      t.target=null;
    }
  });

  // Update projectiles
  projectiles.forEach(function(p){
    if(!p.alive) return;
    var tx,ty;
    if(p.homing && p.target && p.target.alive){
      tx=p.target.x;ty=p.target.y;
    } else {
      tx=p.targetX;ty=p.targetY;
    }
    var dx=tx-p.x;
    var dy=ty-p.y;
    var dist=Math.sqrt(dx*dx+dy*dy);
    var step=p.speed*dt*0.15;
    p.trail.push({x:p.x,y:p.y,life:1});
    if(p.trail.length>6) p.trail.shift();

    if(dist<step+8){
      // Hit
      p.alive=false;
      if(p.splash>0){
        // AoE damage
        enemies.forEach(function(e){
          if(!e.alive) return;
          var ex=e.x-p.x,ey=e.y-p.y;
          if(Math.sqrt(ex*ex+ey*ey)<=p.splash){
            dealDamage(e, p.dmg, p.pierce);
            if(p.slow>0){e.slow=p.slow;e.slowTimer=2000;}
          }
        });
        spawnParticles(p.x, p.y, p.color, 12);
      } else {
        // Single target
        if(p.target && p.target.alive){
          dealDamage(p.target, p.dmg, p.pierce);
          if(p.slow>0){p.target.slow=p.slow;p.target.slowTimer=2000;}
        }
        spawnParticles(p.x, p.y, p.color, 6);
      }
    } else {
      p.x+=dx/dist*step;
      p.y+=dy/dist*step;
    }
  });

  // Cleanup
  enemies=enemies.filter(function(e){return e.alive;});
  projectiles=projectiles.filter(function(p){return p.alive;});

  // Particles
  particles.forEach(function(p){
    p.x+=p.vx;p.y+=p.vy;p.vx*=0.92;p.vy*=0.92;p.life-=0.03;
  });
  particles=particles.filter(function(p){return p.life>0;});

  // Powers
  updatePowers(dt);

  // Check wave end
  checkWaveEnd();
}

/* ════════════ RENDER ════════════ */
function render(){
  ctx.clearRect(0,0,W,H);

  // Background
  drawBackground();

  // Paths
  drawPaths();

  // Grid hover
  if(hoverCell && selectedTurretType){
    var blocked=PATH_CELLS.has(hoverCell.c+','+hoverCell.r) || turrets.some(function(t){return t.c===hoverCell.c&&t.r===hoverCell.r;});
    ctx.fillStyle=blocked?'rgba(239,68,68,.18)':'rgba(99,102,241,.18)';
    ctx.fillRect(hoverCell.c*CELL, hoverCell.r*CELL, CELL, CELL);
    // Range preview
    if(!blocked){
      var def=TURRET_DEFS[selectedTurretType];
      ctx.beginPath();
      ctx.arc(hoverCell.c*CELL+CELL/2, hoverCell.r*CELL+CELL/2, def.range, 0, Math.PI*2);
      ctx.strokeStyle='rgba(99,102,241,.25)';
      ctx.lineWidth=1;
      ctx.stroke();
    }
  }

  // Turrets
  turrets.forEach(drawTurret);

  // Selected turret range
  if(selectedPlaced){
    var def=TURRET_DEFS[selectedPlaced.type];
    var range=def.range*(1+(selectedPlaced.level-1)*0.15);
    ctx.beginPath();
    ctx.arc(selectedPlaced.x, selectedPlaced.y, range, 0, Math.PI*2);
    ctx.strokeStyle='rgba(99,102,241,.35)';
    ctx.lineWidth=1.5;
    ctx.setLineDash([6,4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Enemies
  enemies.forEach(drawEnemy);

  // Projectiles
  projectiles.forEach(drawProjectile);

  // Particles
  drawParticles();

  // Planet (end of paths)
  drawPlanet();
}

function drawBackground(){
  // Dark space gradient
  var g=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*0.7);
  g.addColorStop(0,'#0e0e18');
  g.addColorStop(1,'#080810');
  ctx.fillStyle=g;
  ctx.fillRect(0,0,W,H);

  // Grid lines
  ctx.strokeStyle='rgba(255,255,255,.02)';
  ctx.lineWidth=0.5;
  for(var x=0;x<W;x+=CELL){
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();
  }
  for(var y=0;y<H;y+=CELL){
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
  }
}

function drawPaths(){
  PIXEL_PATHS.forEach(function(path,pi){
    var colors=['#6366f1','#ec4899'];
    ctx.save();
    ctx.strokeStyle=colors[pi%2];
    ctx.lineWidth=CELL*0.6;
    ctx.lineCap='round';
    ctx.lineJoin='round';
    ctx.globalAlpha=0.12;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for(var i=1;i<path.length;i++){
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
    ctx.restore();

    // Bright center line
    ctx.save();
    ctx.strokeStyle=colors[pi%2];
    ctx.lineWidth=2;
    ctx.lineCap='round';
    ctx.lineJoin='round';
    ctx.globalAlpha=0.4;
    ctx.shadowColor=colors[pi%2];
    ctx.shadowBlur=12;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for(var i=1;i<path.length;i++){
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
    ctx.restore();

    // Entry marker
    ctx.save();
    ctx.fillStyle=colors[pi%2];
    ctx.globalAlpha=0.6;
    ctx.beginPath();
    ctx.arc(path[0].x, path[0].y, 8, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  });
}

function drawPlanet(){
  // Draw planet at the end of each path
  var ends=[];
  PIXEL_PATHS.forEach(function(path){
    var last=path[path.length-1];
    if(!ends.some(function(e){return Math.abs(e.x-last.x)<40&&Math.abs(e.y-last.y)<40;})){
      ends.push(last);
    }
  });
  ends.forEach(function(pos){
    // Glow
    ctx.save();
    var g=ctx.createRadialGradient(pos.x,pos.y,5,pos.x,pos.y,30);
    g.addColorStop(0,'rgba(99,102,241,.35)');
    g.addColorStop(1,'rgba(99,102,241,0)');
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.arc(pos.x,pos.y,30,0,Math.PI*2);
    ctx.fill();
    // Planet body
    var pg=ctx.createRadialGradient(pos.x-4,pos.y-4,2,pos.x,pos.y,16);
    pg.addColorStop(0,'#60a5fa');
    pg.addColorStop(0.6,'#3b82f6');
    pg.addColorStop(1,'#1e40af');
    ctx.fillStyle=pg;
    ctx.beginPath();
    ctx.arc(pos.x,pos.y,14,0,Math.PI*2);
    ctx.fill();
    // Ring
    ctx.strokeStyle='rgba(147,197,253,.4)';
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.ellipse(pos.x,pos.y,22,6,0.3,0,Math.PI*2);
    ctx.stroke();
    ctx.restore();

    // Shield effect
    if(powers.shield.active){
      ctx.save();
      ctx.strokeStyle='rgba(16,185,129,.5)';
      ctx.lineWidth=3;
      ctx.shadowColor='#10b981';
      ctx.shadowBlur=15;
      ctx.beginPath();
      ctx.arc(pos.x,pos.y,24,0,Math.PI*2);
      ctx.stroke();
      ctx.restore();
    }
  });
}

function drawTurret(t){
  var def=TURRET_DEFS[t.type];
  var x=t.x, y=t.y;
  var lvl=t.level;

  ctx.save();
  ctx.translate(x,y);

  // Base
  var baseSize=CELL*0.38;
  ctx.fillStyle=def.color+'22';
  ctx.strokeStyle=def.color+'66';
  ctx.lineWidth=1.5;
  ctx.beginPath();
  // Hexagonal base
  for(var i=0;i<6;i++){
    var a=i*Math.PI/3-Math.PI/6;
    var px=Math.cos(a)*baseSize;
    var py=Math.sin(a)*baseSize;
    if(i===0) ctx.moveTo(px,py);
    else ctx.lineTo(px,py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gun
  ctx.rotate(t.angle);
  ctx.fillStyle=def.color;
  ctx.shadowColor=def.color;
  ctx.shadowBlur=8;
  // Gun barrel
  ctx.fillRect(0,-3,CELL*0.35,6);
  // Center dot
  ctx.beginPath();
  ctx.arc(0,0,5+lvl,0,Math.PI*2);
  ctx.fill();
  ctx.shadowBlur=0;

  // Level indicators
  if(lvl>=2){
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(-3,-8,1.5,0,Math.PI*2);ctx.fill();
  }
  if(lvl>=3){
    ctx.beginPath();ctx.arc(3,-8,1.5,0,Math.PI*2);ctx.fill();
  }

  ctx.restore();
}

function drawEnemy(e){
  if(!e.alive) return;
  var alpha=e.cloaked?0.3:1;

  ctx.save();
  ctx.globalAlpha=alpha;
  ctx.translate(e.x, e.y);

  // Slow visual
  if(e.slowTimer>0){
    ctx.strokeStyle='rgba(34,211,238,.5)';
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.arc(0,0,e.size+4,0,Math.PI*2);
    ctx.stroke();
  }

  // Body
  ctx.fillStyle=e.color;
  ctx.shadowColor=e.color;
  ctx.shadowBlur=e.boss?20:8;

  if(e.boss){
    // Boss — special shape
    ctx.beginPath();
    for(var i=0;i<8;i++){
      var a=i*Math.PI/4;
      var r=i%2===0?e.size:e.size*0.6;
      if(i===0) ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r);
      else ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
    }
    ctx.closePath();
    ctx.fill();
  } else if(e.type==='tank'){
    // Tank — square
    ctx.fillRect(-e.size,-e.size,e.size*2,e.size*2);
  } else if(e.type==='sprinter'){
    // Sprinter — triangle
    ctx.beginPath();
    ctx.moveTo(0,-e.size);
    ctx.lineTo(e.size,e.size);
    ctx.lineTo(-e.size,e.size);
    ctx.closePath();
    ctx.fill();
  } else if(e.type==='swarm'){
    // Swarm — diamond
    ctx.beginPath();
    ctx.moveTo(0,-e.size);
    ctx.lineTo(e.size,0);
    ctx.lineTo(0,e.size);
    ctx.lineTo(-e.size,0);
    ctx.closePath();
    ctx.fill();
  } else {
    // Default — circle
    ctx.beginPath();
    ctx.arc(0,0,e.size,0,Math.PI*2);
    ctx.fill();
  }
  ctx.shadowBlur=0;

  // Shield bar
  if(e.maxShield>0 && e.shield>0){
    ctx.fillStyle='rgba(129,140,248,.6)';
    var sw=e.size*2*(e.shield/e.maxShield);
    ctx.fillRect(-e.size, -e.size-7, sw, 3);
    ctx.strokeStyle='rgba(129,140,248,.3)';
    ctx.strokeRect(-e.size, -e.size-7, e.size*2, 3);
  }

  // HP bar
  if(e.hp<e.maxHp){
    var pct=e.hp/e.maxHp;
    var barW=e.size*2;
    ctx.fillStyle='rgba(0,0,0,.5)';
    ctx.fillRect(-e.size, -e.size-4, barW, 3);
    ctx.fillStyle=pct>0.5?'#10b981':pct>0.25?'#f59e0b':'#ef4444';
    ctx.fillRect(-e.size, -e.size-4, barW*pct, 3);
  }

  ctx.restore();
}

function drawProjectile(p){
  if(!p.alive) return;
  ctx.save();

  // Trail
  p.trail.forEach(function(t){
    ctx.globalAlpha=t.life*0.4;
    t.life-=0.15;
    ctx.fillStyle=p.color;
    ctx.beginPath();
    ctx.arc(t.x,t.y,2,0,Math.PI*2);
    ctx.fill();
  });

  // Projectile
  ctx.globalAlpha=1;
  ctx.fillStyle=p.color;
  ctx.shadowColor=p.color;
  ctx.shadowBlur=10;
  ctx.beginPath();
  ctx.arc(p.x,p.y,3.5,0,Math.PI*2);
  ctx.fill();

  ctx.restore();
}

function drawParticles(){
  particles.forEach(function(p){
    ctx.save();
    ctx.globalAlpha=Math.max(0,p.life);
    ctx.fillStyle=p.color;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  });
}

/* ════════════ GAME LOOP ════════════ */
function loop(ts){
  if(state==='gameover') return;
  var dt=lastTime?ts-lastTime:16;
  if(dt>100) dt=100; // cap
  lastTime=ts;
  update(dt);
  render();
  frameId=requestAnimationFrame(loop);
}

/* ════════════ PUBLIC API ════════════ */
init();

return {
  startGame:startGame,
  restart:restart,
  stop:stop,
  sendWave:sendWave,
  sellSelected:sellSelected,
  upgradeSelected:upgradeSelected,
  usePower:usePower
};
})();
