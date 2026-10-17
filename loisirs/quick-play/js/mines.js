function backToHub(){ if(minesTimerInterval)clearInterval(minesTimerInterval); window.location.href='../index.html'; }

const MR=9,MC=9,MCOUNT=10;
let mGrid,mRevealed,mFlags,mOver,minesTimerInterval=null,mTime=0,mFirst;
function minesInit(){
  if(minesTimerInterval)clearInterval(minesTimerInterval);minesTimerInterval=null;mTime=0;mFirst=true;
  mGrid=Array.from({length:MR},()=>Array(MC).fill(0));
  mRevealed=Array.from({length:MR},()=>Array(MC).fill(false));
  mFlags=Array.from({length:MR},()=>Array(MC).fill(false));
  mOver=false;document.getElementById('mines-msg').textContent='';document.getElementById('mines-restart').style.display='none';
  document.getElementById('mines-timer').textContent='0';document.getElementById('mines-flags').textContent='0 / '+MCOUNT;
  mRender();
}
function mPlace(sr,sc){
  let p=0;while(p<MCOUNT){const r=Math.floor(Math.random()*MR),c=Math.floor(Math.random()*MC);
    if(mGrid[r][c]===-1||Math.abs(r-sr)<=1&&Math.abs(c-sc)<=1)continue;mGrid[r][c]=-1;p++;}
  for(let r=0;r<MR;r++)for(let c=0;c<MC;c++){if(mGrid[r][c]===-1)continue;let n=0;
    for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<MR&&nc>=0&&nc<MC&&mGrid[nr][nc]===-1)n++;}mGrid[r][c]=n;}
}
function mRender(){
  const board=document.getElementById('mines-board');board.style.gridTemplateColumns=`repeat(${MC},34px)`;board.innerHTML='';
  const nc=['','#3b82f6','#10b981','#ef4444','#8b5cf6','#f59e0b','#06b6d4','#111','#64748b'];
  for(let r=0;r<MR;r++)for(let c=0;c<MC;c++){const cell=document.createElement('div');cell.className='mine-cell';
    if(mRevealed[r][c]){cell.classList.add('revealed');if(mGrid[r][c]===-1){cell.textContent='💣';cell.classList.add('boom');}else if(mGrid[r][c]>0){cell.textContent=mGrid[r][c];cell.style.color=nc[mGrid[r][c]]||'#fff';}}
    else if(mFlags[r][c]){cell.classList.add('flagged');cell.textContent='🚩';}
    cell.addEventListener('click',()=>mClick(r,c));cell.addEventListener('contextmenu',e=>{e.preventDefault();mFlag(r,c);});
    let lp;cell.addEventListener('touchstart',()=>{lp=setTimeout(()=>mFlag(r,c),400);});cell.addEventListener('touchend',()=>clearTimeout(lp));cell.addEventListener('touchmove',()=>clearTimeout(lp));
    board.appendChild(cell);}
}
function mClick(r,c){
  if(mOver||mFlags[r][c]||mRevealed[r][c])return;
  if(mFirst){mFirst=false;mPlace(r,c);minesTimerInterval=setInterval(()=>{mTime++;document.getElementById('mines-timer').textContent=mTime;},1000);}
  if(mGrid[r][c]===-1){mOver=true;clearInterval(minesTimerInterval);
    for(let rr=0;rr<MR;rr++)for(let cc=0;cc<MC;cc++){if(mGrid[rr][cc]===-1)mRevealed[rr][cc]=true;}
    document.getElementById('mines-msg').textContent='💥 Boom ! Perdu en '+mTime+'s';document.getElementById('mines-msg').style.color='#ef4444';
    document.getElementById('mines-restart').style.display='inline-flex';mRender();return;}
  mReveal(r,c);mRender();
  let un=0;for(let rr=0;rr<MR;rr++)for(let cc=0;cc<MC;cc++){if(!mRevealed[rr][cc])un++;}
  if(un===MCOUNT){mOver=true;clearInterval(minesTimerInterval);document.getElementById('mines-msg').textContent='🎉 Gagné en '+mTime+'s !';document.getElementById('mines-msg').style.color='var(--green)';document.getElementById('mines-restart').style.display='inline-flex';}
}
function mReveal(r,c){if(r<0||r>=MR||c<0||c>=MC||mRevealed[r][c]||mFlags[r][c])return;mRevealed[r][c]=true;if(mGrid[r][c]===0){for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)mReveal(r+dr,c+dc);}}
function mFlag(r,c){if(mOver||mRevealed[r][c])return;mFlags[r][c]=!mFlags[r][c];document.getElementById('mines-flags').textContent=mFlags.flat().filter(Boolean).length+' / '+MCOUNT;mRender();}

minesInit();
