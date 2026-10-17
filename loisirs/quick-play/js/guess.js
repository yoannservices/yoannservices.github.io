function backToHub(){ window.location.href='../index.html'; }

let gSecret,gRemaining,gOver;
function guessInit(){
  gSecret=Math.floor(Math.random()*100)+1;gRemaining=10;gOver=false;
  document.getElementById('g-remaining').textContent=gRemaining;document.getElementById('guess-feedback').textContent='';
  document.getElementById('guess-history').innerHTML='';document.getElementById('guess-input').value='';
  document.getElementById('guess-input').disabled=false;document.getElementById('guess-btn').disabled=false;
  document.getElementById('guess-restart').style.display='none';document.getElementById('heat-bar').style.width='0';
  document.getElementById('guess-input').focus();
}
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.getElementById('game-guess').classList.contains('active'))guessSubmit();});
function guessSubmit(){
  if(gOver)return;const input=document.getElementById('guess-input'),val=parseInt(input.value,10);
  if(isNaN(val)||val<1||val>100)return;gRemaining--;document.getElementById('g-remaining').textContent=gRemaining;
  const diff=Math.abs(val-gSecret),fb=document.getElementById('guess-feedback'),hist=document.getElementById('guess-history');
  const bar=document.getElementById('heat-bar');bar.style.width=Math.max(0,100-diff)+'%';bar.style.background=diff<10?'var(--green)':diff<25?'#f59e0b':'#ef4444';
  let cls='pill';
  if(val===gSecret){fb.textContent='🎉 Trouvé ! C\'était '+gSecret;fb.style.color='var(--green)';cls+=' pill-green';endGuess();}
  else if(gRemaining===0){fb.textContent='Perdu… c\'était '+gSecret;fb.style.color='#ef4444';cls+=' pill-red';endGuess();}
  else if(diff<10){fb.textContent='🔥 Brûlant ! '+(val<gSecret?'Trop petit':'Trop grand');fb.style.color='#f59e0b';cls+=' pill-yellow';}
  else{fb.textContent=val<gSecret?'↑ Trop petit':'↓ Trop grand';fb.style.color='var(--text)';}
  hist.innerHTML+='<span class="'+cls+'">'+val+'</span>';input.value='';input.focus();
}
function endGuess(){gOver=true;document.getElementById('guess-input').disabled=true;document.getElementById('guess-btn').disabled=true;document.getElementById('guess-restart').style.display='inline-flex';document.getElementById('heat-bar').style.width='100%';document.getElementById('heat-bar').style.background='var(--green)';}

guessInit();
