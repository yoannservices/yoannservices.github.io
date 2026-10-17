function backToHub(){ window.location.href='../index.html'; }

let g2Grid,g2Score,g2Best=0,g2Over;
const TC={0:'#1a1a2e',2:'#2d2b55',4:'#3b3875',8:'#6366f1',16:'#818cf8',32:'#a78bfa',64:'#c084fc',128:'#e879f9',256:'#ec4899',512:'#f43f5e',1024:'#f59e0b',2048:'#10b981'};
function g2048Init(){
  g2Grid=Array.from({length:4},()=>Array(4).fill(0));g2Score=0;g2Over=false;
  document.getElementById('g2048-score').textContent='0';document.getElementById('g2048-best').textContent=g2Best;
  document.getElementById('game2048-over').style.display='none';g2Spawn();g2Spawn();g2Render();
}
function g2Spawn(){const e=[];g2Grid.forEach((r,ri)=>r.forEach((c,ci)=>{if(!c)e.push([ri,ci]);}));if(!e.length)return;const[r,c]=e[Math.floor(Math.random()*e.length)];g2Grid[r][c]=Math.random()<.9?2:4;}
function g2Render(){
  document.getElementById('game2048-board').innerHTML=g2Grid.flat().map(v=>{
    const bg=TC[v]||'#10b981',col=v<=4?'#ffffff44':'#fff';
    return`<div class="tile-2048" style="background:${bg};color:${v?col:'transparent'}">${v||'·'}</div>`;}).join('');
}
function g2Slide(row){let a=row.filter(v=>v),m=[];for(let i=0;i<a.length;i++){if(i+1<a.length&&a[i]===a[i+1]){m.push(a[i]*2);g2Score+=a[i]*2;i++;}else m.push(a[i]);}while(m.length<4)m.push(0);return m;}
function g2Move(dir){
  if(g2Over)return;let moved=false;const g=g2Grid;
  for(let i=0;i<4;i++){let row;
    if(dir==='left')row=[g[i][0],g[i][1],g[i][2],g[i][3]];
    else if(dir==='right')row=[g[i][3],g[i][2],g[i][1],g[i][0]];
    else if(dir==='up')row=[g[0][i],g[1][i],g[2][i],g[3][i]];
    else row=[g[3][i],g[2][i],g[1][i],g[0][i]];
    const nr=g2Slide(row);if(nr.join(',')!==row.join(','))moved=true;
    if(dir==='left')for(let j=0;j<4;j++)g[i][j]=nr[j];
    else if(dir==='right')for(let j=0;j<4;j++)g[i][3-j]=nr[j];
    else if(dir==='up')for(let j=0;j<4;j++)g[j][i]=nr[j];
    else for(let j=0;j<4;j++)g[3-j][i]=nr[j];
  }
  if(moved){g2Spawn();g2Render();document.getElementById('g2048-score').textContent=g2Score;
    if(g2Score>g2Best){g2Best=g2Score;document.getElementById('g2048-best').textContent=g2Best;}
    if(g2Grid.flat().includes(2048)){document.getElementById('g2048-msg').textContent='🎉 Tu as atteint 2048 !';document.getElementById('game2048-over').style.display='block';}
    else if(!g2CanMove()){g2Over=true;document.getElementById('g2048-msg').textContent='Game Over — Score : '+g2Score;document.getElementById('game2048-over').style.display='block';}}
}
function g2CanMove(){for(let r=0;r<4;r++)for(let c=0;c<4;c++){if(!g2Grid[r][c])return true;if(c+1<4&&g2Grid[r][c]===g2Grid[r][c+1])return true;if(r+1<4&&g2Grid[r][c]===g2Grid[r+1][c])return true;}return false;}
document.addEventListener('keydown',e=>{if(!document.getElementById('game-2048').classList.contains('active'))return;const m={'ArrowLeft':'left','ArrowRight':'right','ArrowUp':'up','ArrowDown':'down'};if(m[e.key]){e.preventDefault();g2Move(m[e.key]);}});
(function(){let sx,sy;document.addEventListener('touchstart',e=>{if(!document.getElementById('game-2048').classList.contains('active'))return;sx=e.touches[0].clientX;sy=e.touches[0].clientY;});
  document.addEventListener('touchend',e=>{if(!document.getElementById('game-2048').classList.contains('active')||sx===undefined)return;const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;sx=undefined;if(Math.abs(dx)<30&&Math.abs(dy)<30)return;Math.abs(dx)>Math.abs(dy)?g2Move(dx>0?'right':'left'):g2Move(dy>0?'down':'up');});})();

g2048Init();
