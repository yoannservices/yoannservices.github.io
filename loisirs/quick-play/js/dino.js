function backToHub(){ if(dinoRAF)cancelAnimationFrame(dinoRAF);dinoRunning=false; window.location.href='../index.html'; }

let dinoCV,dinoCTX,dinoRAF=null,dinoRunning=false,dinoBest=0;
let dino={x:60,y:0,vy:0,w:30,h:34,grounded:true};
let dinoObs=[],dinoSc=0,dinoSpd=4,dinoGnd;
const DG=0.6,DJ=-11;
function dinoInit(){
  dinoCV=document.getElementById('dino-canvas');dinoCTX=dinoCV.getContext('2d');
  dinoGnd=dinoCV.height-40;dino.y=dinoGnd-dino.h;dino.vy=0;dino.grounded=true;
  dinoObs=[];dinoSc=0;dinoSpd=4;dinoRunning=false;
  if(dinoRAF)cancelAnimationFrame(dinoRAF);dinoRAF=null;
  document.getElementById('dino-score').textContent='0';document.getElementById('dino-best').textContent=dinoBest;
  document.getElementById('dino-msg').textContent='Appuie sur Espace ou clique pour sauter';dinoDraw();
}
function dinoJump(){
  if(!dinoRunning){dinoRunning=true;document.getElementById('dino-msg').textContent='';dinoLoop();return;}
  if(dino.grounded){dino.vy=DJ;dino.grounded=false;}
}
function dinoLoop(){if(!dinoRunning)return;dinoUpdate();dinoDraw();dinoRAF=requestAnimationFrame(dinoLoop);}
function dinoUpdate(){
  dino.vy+=DG;dino.y+=dino.vy;if(dino.y>=dinoGnd-dino.h){dino.y=dinoGnd-dino.h;dino.vy=0;dino.grounded=true;}
  dinoSc++;if(dinoSc%150===0)dinoSpd=Math.min(12,dinoSpd+0.3);
  if(dinoObs.length===0||dinoObs[dinoObs.length-1].x<dinoCV.width-200-Math.random()*150){
    const h=20+Math.random()*25;dinoObs.push({x:dinoCV.width,y:dinoGnd-h,w:16+Math.random()*14,h});}
  dinoObs.forEach(o=>o.x-=dinoSpd);dinoObs=dinoObs.filter(o=>o.x+o.w>0);
  dinoObs.forEach(o=>{if(dino.x+dino.w-6>o.x&&dino.x+6<o.x+o.w&&dino.y+dino.h>o.y){
    dinoRunning=false;if(dinoRAF)cancelAnimationFrame(dinoRAF);
    const sc=Math.floor(dinoSc/10);if(sc>dinoBest){dinoBest=sc;document.getElementById('dino-best').textContent=dinoBest;}
    document.getElementById('dino-msg').textContent='Game Over ! Appuie pour recommencer';}});
  document.getElementById('dino-score').textContent=Math.floor(dinoSc/10);
}
function dinoDraw(){
  const ctx=dinoCTX,W=dinoCV.width,H=dinoCV.height;ctx.fillStyle='#12121a';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#ffffff12';ctx.fillRect(0,dinoGnd,W,2);
  ctx.fillStyle='#10b981';ctx.fillRect(dino.x,dino.y,dino.w,dino.h);
  ctx.fillStyle='#fff';ctx.fillRect(dino.x+dino.w-10,dino.y+6,6,6);
  ctx.fillStyle='#ef4444';dinoObs.forEach(o=>ctx.fillRect(o.x,o.y,o.w,o.h));
}
document.addEventListener('keydown',e=>{
  if(!document.getElementById('game-dino').classList.contains('active'))return;
  if(e.code==='Space'){e.preventDefault();
    if(!dinoRunning&&document.getElementById('dino-msg').textContent.includes('Game Over')){dinoInit();setTimeout(dinoJump,50);}else dinoJump();}
});
document.getElementById('dino-canvas').addEventListener('click',()=>{
  if(!dinoRunning&&document.getElementById('dino-msg').textContent.includes('Game Over')){dinoInit();setTimeout(dinoJump,50);}else dinoJump();
});

dinoInit();
