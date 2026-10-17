/* ══════════════════════════════════════
   STARS
══════════════════════════════════════ */
(function(){
  const c=document.getElementById('stars');
  for(let i=0;i<120;i++){
    const s=document.createElement('div');s.className='star';
    s.style.left=Math.random()*100+'%';s.style.top=Math.random()*100+'%';
    s.style.setProperty('--d',(1.5+Math.random()*3)+'s');s.style.animationDelay=Math.random()*3+'s';
    s.style.width=s.style.height=(1+Math.random()*2)+'px';c.appendChild(s);
  }
})();
