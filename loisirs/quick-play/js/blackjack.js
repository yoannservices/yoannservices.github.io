function backToHub(){ window.location.href='../index.html'; }

const bjSuits=['♠','♥','♦','♣'],bjRanks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
let bjDeck,bjPlayer,bjDealer,bjDone,bjWins=0,bjLosses=0;
function bjMakeDeck(){const d=[];bjSuits.forEach(s=>bjRanks.forEach(r=>d.push({rank:r,suit:s})));for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return d;}
function bjVal(hand){let s=0,a=0;hand.forEach(c=>{if(c.rank==='A'){a++;s+=11;}else if('JQK'.includes(c.rank[0])&&c.rank.length<=2&&isNaN(c.rank))s+=10;else s+=parseInt(c.rank);});while(s>21&&a>0){s-=10;a--;}return s;}
function bjInit(){
  bjDeck=bjMakeDeck();bjPlayer=[];bjDealer=[];bjDone=false;
  bjPlayer.push(bjDeck.pop(),bjDeck.pop());bjDealer.push(bjDeck.pop(),bjDeck.pop());
  document.getElementById('bj-hit').style.display='';document.getElementById('bj-stand').style.display='';
  document.getElementById('bj-new').style.display='none';document.getElementById('bj-msg').textContent='';
  bjRender(false);if(bjVal(bjPlayer)===21)bjStand();
}
function bjRender(reveal){
  document.getElementById('bj-player-hand').innerHTML=bjPlayer.map(bjCardHTML).join('');
  if(reveal){document.getElementById('bj-dealer-hand').innerHTML=bjDealer.map(bjCardHTML).join('');document.getElementById('bj-dealer-score').textContent=bjVal(bjDealer);}
  else{document.getElementById('bj-dealer-hand').innerHTML=bjCardHTML(bjDealer[0])+'<div class="bj-card hidden-card">?</div>';document.getElementById('bj-dealer-score').textContent='?';}
  document.getElementById('bj-player-score').textContent=bjVal(bjPlayer);
}
function bjCardHTML(c){return`<div class="bj-card ${'♥♦'.includes(c.suit)?'red':''}">${c.rank}${c.suit}</div>`;}
function bjHit(){if(bjDone)return;bjPlayer.push(bjDeck.pop());bjRender(false);if(bjVal(bjPlayer)>21)bjEnd('Bust ! Vous perdez.',false);}
function bjStand(){
  if(bjDone)return;while(bjVal(bjDealer)<17)bjDealer.push(bjDeck.pop());bjRender(true);
  const pv=bjVal(bjPlayer),dv=bjVal(bjDealer);
  if(dv>21)bjEnd('Croupier bust — vous gagnez !',true);
  else if(pv>dv)bjEnd('Vous gagnez ! '+pv+' vs '+dv,true);
  else if(pv<dv)bjEnd('Croupier gagne. '+dv+' vs '+pv,false);
  else bjEnd('Égalité ! '+pv,null);
}
function bjEnd(msg,win){
  bjDone=true;bjRender(true);document.getElementById('bj-msg').textContent=msg;
  document.getElementById('bj-msg').style.color=win===true?'var(--green)':win===false?'#ef4444':'#f59e0b';
  document.getElementById('bj-hit').style.display='none';document.getElementById('bj-stand').style.display='none';document.getElementById('bj-new').style.display='';
  if(win===true){bjWins++;document.getElementById('bj-wins').textContent=bjWins;}
  if(win===false){bjLosses++;document.getElementById('bj-losses').textContent=bjLosses;}
}

bjInit();
