function backToHub(){ window.location.href='../index.html'; }

let rState='idle',rTimeout=null,rStart=0,rBest=Infinity,rHistory=[];
function reactionClick(){
  const circle=document.getElementById('reaction-circle'),msg=document.getElementById('reaction-msg');
  if(rState==='idle'){
    rState='waiting';circle.className='waiting';circle.textContent='Attendez le vert…';msg.textContent='';
    rTimeout=setTimeout(()=>{rState='go';circle.className='go';circle.textContent='CLIQUEZ !';rStart=performance.now();},1500+Math.random()*3000);
  }else if(rState==='waiting'){
    clearTimeout(rTimeout);rState='idle';circle.className='idle';circle.textContent='Cliquez pour recommencer';msg.textContent='Trop tôt !';msg.style.color='#ef4444';
  }else if(rState==='go'){
    const ms=Math.round(performance.now()-rStart);rState='idle';circle.className='idle';circle.textContent='Cliquez pour recommencer';
    msg.textContent=ms+' ms';msg.style.color='var(--green)';document.getElementById('r-last').textContent=ms+' ms';
    if(ms<rBest){rBest=ms;document.getElementById('r-best').textContent=ms+' ms';}
    rHistory.unshift(ms);if(rHistory.length>12)rHistory.pop();
    document.getElementById('reaction-history').innerHTML=rHistory.map(t=>'<span class="pill'+(t<250?' pill-green':t<400?' pill-yellow':' pill-red')+'">'+t+'ms</span>').join('');
  }
}
