function backToHub(){ saveGame(); if(clickerAutoInterval)clearInterval(clickerAutoInterval); if(saveInterval)clearInterval(saveInterval); window.location.href='../index.html'; }

/* ══════════════════════════════════════
   SPACE CLICKER — Long-term idle game
══════════════════════════════════════ */

const SAVE_KEY='quickplay_spaceclicker';
let cPoints=0, cTotal=0, cPPC=1, cPPS=0, clickerAutoInterval=null, saveInterval=null;
let activeTab='click';

/* ── Milestones ── */
const MILESTONES=[100,500,2000,10000,50000,250000,1e6,5e6,25e6,1e8,5e8,1e9,1e10,1e11,1e12];
function getMilestone(){for(const m of MILESTONES)if(cTotal<m)return m;return MILESTONES[MILESTONES.length-1]*10;}

/* ── Upgrades ── */
const clickUpgrades=[
  {id:'asteroid',icon:'☄️',name:'Frappe astéroïde',desc:'+1 énergie par clic',base:15,mult:1.6,maxLvl:50,ppc:1,pps:0,lvl:0},
  {id:'laser',icon:'🔫',name:'Laser orbital',desc:'+3 énergie par clic',base:100,mult:1.7,maxLvl:40,ppc:3,pps:0,lvl:0},
  {id:'plasma',icon:'⚡',name:'Canon à plasma',desc:'+10 énergie par clic',base:1000,mult:1.8,maxLvl:30,ppc:10,pps:0,lvl:0},
  {id:'antimatter',icon:'💥',name:'Bombe antimatière',desc:'+50 énergie par clic',base:15000,mult:1.9,maxLvl:25,ppc:50,pps:0,lvl:0},
  {id:'quasar',icon:'🌟',name:'Pulse de quasar',desc:'+250 énergie par clic',base:200000,mult:2.0,maxLvl:20,ppc:250,pps:0,lvl:0},
  {id:'bigbang',icon:'🔮',name:'Écho du Big Bang',desc:'+1 500 énergie par clic',base:5e6,mult:2.1,maxLvl:15,ppc:1500,pps:0,lvl:0},
];
const passiveUpgrades=[
  {id:'satellite',icon:'🛰️',name:'Satellite mineur',desc:'+1 énergie/s',base:50,mult:1.5,maxLvl:60,ppc:0,pps:1,lvl:0},
  {id:'station',icon:'🏗️',name:'Station spatiale',desc:'+5 énergie/s',base:400,mult:1.6,maxLvl:50,ppc:0,pps:5,lvl:0},
  {id:'moon',icon:'🌙',name:'Base lunaire',desc:'+20 énergie/s',base:3000,mult:1.7,maxLvl:40,ppc:0,pps:20,lvl:0},
  {id:'mars',icon:'🔴',name:'Colonie martienne',desc:'+100 énergie/s',base:25000,mult:1.8,maxLvl:30,ppc:0,pps:100,lvl:0},
  {id:'dyson',icon:'☀️',name:'Sphère de Dyson',desc:'+500 énergie/s',base:300000,mult:1.9,maxLvl:20,ppc:0,pps:500,lvl:0},
  {id:'warp',icon:'🌀',name:'Moteur Warp',desc:'+3 000 énergie/s',base:5e6,mult:2.0,maxLvl:15,ppc:0,pps:3000,lvl:0},
  {id:'blackhole',icon:'🕳️',name:'Extracteur trou noir',desc:'+20 000 énergie/s',base:1e8,mult:2.1,maxLvl:10,ppc:0,pps:20000,lvl:0},
];
const allUpgrades=[...clickUpgrades,...passiveUpgrades];

/* ── Cost calc ── */
function getCost(u){return Math.floor(u.base*Math.pow(u.mult,u.lvl));}

/* ── Format numbers ── */
function fmtN(n){
  if(n>=1e12)return(n/1e12).toFixed(2)+'T';
  if(n>=1e9)return(n/1e9).toFixed(2)+'B';
  if(n>=1e6)return(n/1e6).toFixed(2)+'M';
  if(n>=1e3)return(n/1e3).toFixed(1)+'K';
  return Math.floor(n).toString();
}

/* ── Save / Load ── */
function saveGame(){
  const data={
    pts:cPoints, total:cTotal, ppc:cPPC, pps:cPPS,
    upgrades:allUpgrades.map(u=>({id:u.id,lvl:u.lvl})),
    time:Date.now()
  };
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(data));}catch(e){}
}
function loadGame(){
  let raw;
  try{raw=localStorage.getItem(SAVE_KEY);}catch(e){return false;}
  if(!raw)return false;
  try{
    const d=JSON.parse(raw);
    cPoints=d.pts||0; cTotal=d.total||0;
    /* Restore upgrade levels */
    allUpgrades.forEach(u=>u.lvl=0);
    if(d.upgrades)d.upgrades.forEach(s=>{const u=allUpgrades.find(x=>x.id===s.id);if(u)u.lvl=s.lvl||0;});
    /* Recalc PPC/PPS from upgrades */
    cPPC=1; cPPS=0;
    allUpgrades.forEach(u=>{cPPC+=u.ppc*u.lvl; cPPS+=u.pps*u.lvl;});
    /* Offline earnings */
    if(d.time){
      const elapsed=Math.min((Date.now()-d.time)/1000, 7200); /* max 2h offline */
      if(elapsed>5 && cPPS>0){
        const offline=Math.floor(cPPS*elapsed*0.5); /* 50% offline efficiency */
        cPoints+=offline; cTotal+=offline;
        showOfflineEarnings(offline,Math.floor(elapsed));
      }
    }
    return true;
  }catch(e){return false;}
}
function showOfflineEarnings(amount,secs){
  const mins=Math.floor(secs/60);
  const timeStr=mins>0?mins+'min '+(secs%60)+'s':secs+'s';
  const el=document.createElement('div');
  el.id='offline-popup';
  el.innerHTML='<div class="offline-inner">🌙 Gains hors-ligne<br><strong>+'+fmtN(amount)+' ⭐</strong><br><span>en '+timeStr+' (50% efficacité)</span></div>';
  el.style.cssText='position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#0a0a0fcc;z-index:100;cursor:pointer;animation:fadeIn .3s';
  el.onclick=()=>el.remove();
  document.body.appendChild(el);
  setTimeout(()=>{if(el.parentNode)el.remove();},5000);
}
function resetSave(){
  if(!confirm('Effacer toute ta progression spatiale ? 🚀'))return;
  try{localStorage.removeItem(SAVE_KEY);}catch(e){}
  cPoints=0;cTotal=0;cPPC=1;cPPS=0;
  allUpgrades.forEach(u=>u.lvl=0);
  renderAll();
}

/* ── Init ── */
function clickerInit(){
  loadGame();
  if(clickerAutoInterval)clearInterval(clickerAutoInterval);
  if(saveInterval)clearInterval(saveInterval);
  clickerAutoInterval=setInterval(()=>{
    if(cPPS>0){cPoints+=cPPS;cTotal+=cPPS;renderStats();}
  },1000);
  saveInterval=setInterval(saveGame,15000); /* auto-save every 15s */
  renderAll();
}

/* ── Click ── */
function clickerClick(e){
  cPoints+=cPPC; cTotal+=cPPC; renderStats();
  const f=document.createElement('span');f.className='float-text';
  f.textContent='+'+fmtN(cPPC);
  f.style.left=(e.offsetX||40)+'px';f.style.top=(e.offsetY||40)+'px';
  document.getElementById('clicker-btn').parentElement.appendChild(f);
  setTimeout(()=>f.remove(),800);
}

/* ── Tabs ── */
function switchTab(tab){
  activeTab=tab;
  document.querySelectorAll('.tab-btn').forEach(b=>{
    b.classList.toggle('active',b.dataset.tab===tab);
  });
  renderUpgrades();
}

/* ── Render ── */
function renderAll(){renderStats();renderUpgrades();}
function renderStats(){
  document.getElementById('c-points').textContent=fmtN(cPoints);
  document.getElementById('c-ppc').textContent=fmtN(cPPC);
  document.getElementById('c-pps').textContent=fmtN(cPPS);
  document.getElementById('c-total').textContent=fmtN(cTotal);
  /* Milestone bar */
  const ms=getMilestone();
  const prev=MILESTONES[MILESTONES.indexOf(ms)-1]||0;
  const pct=Math.min(100,((cTotal-prev)/(ms-prev))*100);
  document.getElementById('milestone-bar').style.width=pct+'%';
  document.getElementById('milestone-label').textContent='Prochain palier : '+fmtN(ms)+' ⭐';
  /* Update upgrade affordability */
  document.querySelectorAll('.upgrade-card').forEach(card=>{
    const u=allUpgrades.find(x=>x.id===card.dataset.id);
    if(u&&u.lvl<u.maxLvl){
      const afford=cPoints>=getCost(u);
      card.classList.toggle('affordable',afford);
      card.style.opacity=afford?'1':'.55';
    }
  });
}
function renderUpgrades(){
  const list=activeTab==='click'?clickUpgrades:passiveUpgrades;
  document.getElementById('upgrades').innerHTML=list.map(u=>{
    const cost=getCost(u), mx=u.lvl>=u.maxLvl, afford=cPoints>=cost;
    const totalEffect=activeTab==='click'?'Total : +'+fmtN(u.ppc*u.lvl)+'/clic':'Total : +'+fmtN(u.pps*u.lvl)+'/s';
    return`<div class="upgrade-card${mx?' maxed':''}${!mx&&afford?' affordable':''}" data-id="${u.id}" onclick="buyUpgrade('${u.id}')" style="opacity:${mx?.4:afford?1:.55}">
      <span class="upgrade-lvl">${u.lvl}/${u.maxLvl}</span>
      <div class="upgrade-icon">${u.icon}</div>
      <div class="upgrade-name">${u.name}</div>
      <div class="upgrade-desc">${u.desc}</div>
      <div class="upgrade-cost">${mx?'✅ MAX':'⭐ '+fmtN(cost)}</div>
      ${u.lvl>0?'<div class="upgrade-effect">'+totalEffect+'</div>':''}
    </div>`;
  }).join('');
}
function buyUpgrade(id){
  const u=allUpgrades.find(x=>x.id===id);
  if(!u||u.lvl>=u.maxLvl)return;
  const cost=getCost(u);
  if(cPoints<cost)return;
  cPoints-=cost; u.lvl++;
  cPPC+=u.ppc; cPPS+=u.pps;
  renderAll(); saveGame();
}

/* ── Start ── */
clickerInit();
window.addEventListener('beforeunload',saveGame);
