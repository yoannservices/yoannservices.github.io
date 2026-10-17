function backToHub(){ if(anaTimer)clearInterval(anaTimer); window.location.href='../index.html'; }

const anaWords=['abandon','abricot','adorable','agile','aimable','ancetre','artisan','aurore','bambou','baroque','bataille','bizarre','bonheur','bouclier','capable','capsule','cascade','cerveau','chaleur','chapeau','clinique','colonne','complet','concert','courage','crapaud','cravate','culture','cyclone','dauphin','diamant','douleur','eclipse','element','embleme','energie','enigme','episode','fabuleux','fiction','foudre','fragile','galaxie','grandir','guitare','habitat','horizon','journal','justice','langage','lecture','logique','magique','miracle','module','mystere','nature','nuance','oblique','opinion','orbite','origami','panique','paradis','platine','proverbe','radical','reptile','routine','sardine','serpent','silence','station','symbole','tactile','tempete','timbre','tornade','triomphe','unanime','vaccine','verdict','village','virtuel','vitamine','zombie'];
let anaScore=0,anaTime=60,anaTimer=null,anaCurrent='';
function anaReset(){
  anaScore=0;anaTime=60;if(anaTimer)clearInterval(anaTimer);anaTimer=null;
  document.getElementById('ana-score').textContent='0';document.getElementById('ana-time').textContent='60';
  document.getElementById('ana-progress').style.width='100%';const inp=document.getElementById('anagram-input');
  inp.value='';inp.disabled=true;inp.className='game-input';document.getElementById('anagram-feedback').textContent='';
  document.getElementById('anagram-scrambled').textContent='—';document.getElementById('ana-start').style.display='block';
  document.getElementById('ana-final').style.display='none';document.getElementById('ana-skip').style.display='none';
}
function anaStart(){
  anaScore=0;anaTime=60;document.getElementById('ana-start').style.display='none';document.getElementById('ana-skip').style.display='inline-flex';
  const inp=document.getElementById('anagram-input');inp.disabled=false;inp.value='';inp.focus();nextAnagram();
  anaTimer=setInterval(()=>{anaTime--;document.getElementById('ana-time').textContent=anaTime;document.getElementById('ana-progress').style.width=(anaTime/60*100)+'%';
    if(anaTime<=0){clearInterval(anaTimer);inp.disabled=true;document.getElementById('ana-skip').style.display='none';
      document.getElementById('anagram-scrambled').textContent='';document.getElementById('ana-final').style.display='flex';document.getElementById('ana-final-score').textContent=anaScore;}},1000);
}
function scramble(w){const a=w.split('');for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.join('')===w?scramble(w):a.join('');}
function nextAnagram(){anaCurrent=anaWords[Math.floor(Math.random()*anaWords.length)];document.getElementById('anagram-scrambled').textContent=scramble(anaCurrent);document.getElementById('anagram-input').value='';document.getElementById('anagram-input').className='game-input';document.getElementById('anagram-feedback').textContent='';}
function anaSkip(){document.getElementById('anagram-feedback').textContent='C\'était : '+anaCurrent;document.getElementById('anagram-feedback').style.color='#ef4444';setTimeout(nextAnagram,800);}

document.addEventListener('input',e=>{
  const id=e.target.id,val=e.target.value;
  if(id==='anagram-input'&&!e.target.disabled){
    const v=val.toLowerCase().trim();
    if(v===anaCurrent){anaScore++;document.getElementById('ana-score').textContent=anaScore;e.target.className='game-input correct';
      document.getElementById('anagram-feedback').textContent='✓ Correct !';document.getElementById('anagram-feedback').style.color='var(--green)';setTimeout(nextAnagram,400);}
    else if(v.length>=anaCurrent.length)e.target.className='game-input wrong';else e.target.className='game-input';
  }
});

anaReset();
