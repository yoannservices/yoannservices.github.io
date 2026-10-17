function backToHub(){ aimActive=false; window.location.href='../index.html'; }

let aimHit=0,aimTotal=30,aimTimes=[],aimTargetStart=0,aimActive=false;
function aimReset(){
  aimHit=0;aimTimes=[];aimActive=false;
  document.getElementById('aim-hit').textContent='0';document.getElementById('aim-remain').textContent=aimTotal;
  document.getElementById('aim-avg').textContent='—';document.getElementById('aim-final').style.display='none';
  document.getElementById('aim-start-overlay').style.display='flex';
  document.getElementById('aim-arena').querySelectorAll('.aim-target').forEach(t=>t.remove());
}
function aimStart(){document.getElementById('aim-start-overlay').style.display='none';aimActive=true;aimHit=0;aimTimes=[];spawnTarget();}
function spawnTarget(){
  if(!aimActive)return;const arena=document.getElementById('aim-arena');
  arena.querySelectorAll('.aim-target').forEach(t=>t.remove());
  const t=document.createElement('div');t.className='aim-target';
  const r=arena.getBoundingClientRect(),pad=40;
  t.style.left=(pad+Math.random()*(r.width-2*pad))+'px';t.style.top=(pad+Math.random()*(r.height-2*pad))+'px';
  t.addEventListener('click',aimHitTarget);arena.appendChild(t);aimTargetStart=performance.now();
}
function aimHitTarget(e){
  e.stopPropagation();if(!aimActive)return;
  aimTimes.push(Math.round(performance.now()-aimTargetStart));aimHit++;
  document.getElementById('aim-hit').textContent=aimHit;document.getElementById('aim-remain').textContent=aimTotal-aimHit;
  const avg=Math.round(aimTimes.reduce((a,b)=>a+b,0)/aimTimes.length);document.getElementById('aim-avg').textContent=avg;
  if(aimHit>=aimTotal){aimActive=false;document.getElementById('aim-arena').querySelectorAll('.aim-target').forEach(t=>t.remove());
    document.getElementById('aim-final-msg').textContent='Terminé ! Moyenne : '+avg+' ms';document.getElementById('aim-final').style.display='block';
  }else spawnTarget();
}

aimReset();
