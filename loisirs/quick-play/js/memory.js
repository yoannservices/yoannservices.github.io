function backToHub(){ window.location.href='../index.html'; }

const memEmojis=['🐶','🐱','🦊','🐸','🐵','🦄','🐙','🍄'];
let memBoard=[],memFlipped=[],memMatched=0,memMoves=0,memLocked=false;
function memoryInit(){
  memFlipped=[];memMatched=0;memMoves=0;memLocked=false;document.getElementById('memory-end').style.display='none';
  memBoard=[...memEmojis,...memEmojis].sort(()=>Math.random()-.5);
  document.getElementById('memory-grid').innerHTML=memBoard.map((_,i)=>`<div class="mem-card" onclick="memClick(${i})"></div>`).join('');
  updateMemInfo();
}
function memClick(i){
  if(memLocked)return;const cards=document.querySelectorAll('.mem-card'),card=cards[i];
  if(card.classList.contains('flipped')||card.classList.contains('matched'))return;
  card.classList.add('flipped');card.textContent=memBoard[i];memFlipped.push(i);
  if(memFlipped.length===2){memMoves++;memLocked=true;const[a,b]=memFlipped;
    if(memBoard[a]===memBoard[b]){cards[a].classList.add('matched');cards[b].classList.add('matched');memMatched++;memFlipped=[];memLocked=false;updateMemInfo();
      if(memMatched===8){document.getElementById('memory-end-msg').textContent='Bravo ! Terminé en '+memMoves+' coups 🎉';document.getElementById('memory-end').style.display='block';}
    }else{setTimeout(()=>{cards[a].classList.remove('flipped');cards[a].textContent='';cards[b].classList.remove('flipped');cards[b].textContent='';memFlipped=[];memLocked=false;},700);}
    updateMemInfo();}
}
function updateMemInfo(){document.getElementById('m-pairs').textContent=memMatched+' / 8';document.getElementById('m-moves').textContent=memMoves;}

memoryInit();
