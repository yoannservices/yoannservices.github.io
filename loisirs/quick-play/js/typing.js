function backToHub(){ if(typingTimer)clearInterval(typingTimer); window.location.href='../index.html'; }

const typingWords=['chat','maison','rapide','clavier','soleil','voyage','musique','fenetre','orange','montagne','dormir','jardin','etoile','riviere','chocolat','lumiere','ballon','chemise','nuage','pomme','verre','fleur','oiseau','plage','voiture','cheval','bougie','miroir','chemin','sourire','pluie','sable','tigre','papier','rouge','banane','feuille','pierre','tasse','tomate','coquille','cerise','bateau','chateau','requin','crayon','hibou','glace','herbe','lampe','brique','fumee','jungle','meuble','peigne','sucre','nombre','coeur','blanc','foret','livre','table','noire','monde','grand','petit','terre','lundi','mardi','merci','porte','signe','valse','harpe','cable','envie','geste','idole','jeune','libre','noble','aigle','adore','brise','cadre','danse','eclat','fable','gazon','heure','ivoire','joker'];
let tScore,tTime,typingTimer,tWord;
function typingInit(){
  tScore=0;tTime=30;document.getElementById('t-score').textContent='0';document.getElementById('t-time').textContent='30';
  document.getElementById('typing-progress').style.width='100%';const inp=document.getElementById('typing-input');
  inp.value='';inp.disabled=true;inp.className='game-input';document.getElementById('typing-final').style.display='none';
  document.getElementById('typing-word').textContent='Appuie sur Entrée pour démarrer';document.getElementById('typing-word').style.display='block';
  if(typingTimer)clearInterval(typingTimer);
}
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.getElementById('game-typing').classList.contains('active')&&document.getElementById('typing-input').disabled)typingStart();});
function typingStart(){
  tScore=0;tTime=30;document.getElementById('typing-final').style.display='none';document.getElementById('typing-word').style.display='block';
  const inp=document.getElementById('typing-input');inp.disabled=false;inp.value='';inp.focus();nextTypingWord();
  typingTimer=setInterval(()=>{tTime--;document.getElementById('t-time').textContent=tTime;document.getElementById('typing-progress').style.width=(tTime/30*100)+'%';
    if(tTime<=0){clearInterval(typingTimer);inp.disabled=true;document.getElementById('typing-word').style.display='none';document.getElementById('typing-final').style.display='flex';document.getElementById('t-final-score').textContent=tScore;}},1000);
}
function nextTypingWord(){tWord=typingWords[Math.floor(Math.random()*typingWords.length)];document.getElementById('typing-word').textContent=tWord;}

document.addEventListener('input',e=>{
  const id=e.target.id,val=e.target.value;
  if(id==='typing-input'){
    if(val===tWord){tScore++;document.getElementById('t-score').textContent=tScore;e.target.value='';e.target.className='game-input';nextTypingWord();}
    else if(tWord.startsWith(val))e.target.className='game-input';else e.target.className='game-input wrong';
  }
});

typingInit();
