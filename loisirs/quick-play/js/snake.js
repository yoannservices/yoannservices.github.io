function backToHub(){ if(snakeInterval)clearInterval(snakeInterval);snakeInterval=null; window.location.href='../index.html'; }

const SN=20,SCOLS=20,SROWS=20;
let snakeBody,snakeFood,sDx,sDy,sNDx,sNDy,snkScore,snkBest=0,snakeInterval=null,snkOver;
function snakeInit(){
  if(snakeInterval)clearInterval(snakeInterval);snakeInterval=null;
  snakeBody=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];sDx=1;sDy=0;sNDx=1;sNDy=0;snkScore=0;snkOver=false;
  document.getElementById('snake-score').textContent='0';document.getElementById('snake-best').textContent=snkBest;
  document.getElementById('snake-msg').textContent='Appuie sur une flèche pour jouer';placeSnakeFood();drawSnake();
}
function placeSnakeFood(){do{snakeFood={x:Math.floor(Math.random()*SCOLS),y:Math.floor(Math.random()*SROWS)};}while(snakeBody.some(s=>s.x===snakeFood.x&&s.y===snakeFood.y));}
function drawSnake(){
  const cv=document.getElementById('snake-canvas'),ctx=cv.getContext('2d');
  ctx.fillStyle='#12121a';ctx.fillRect(0,0,cv.width,cv.height);
  ctx.strokeStyle='#ffffff06';for(let x=0;x<=SCOLS;x++){ctx.beginPath();ctx.moveTo(x*SN,0);ctx.lineTo(x*SN,cv.height);ctx.stroke();}
  for(let y=0;y<=SROWS;y++){ctx.beginPath();ctx.moveTo(0,y*SN);ctx.lineTo(cv.width,y*SN);ctx.stroke();}
  ctx.fillStyle='#ef4444';ctx.beginPath();ctx.arc(snakeFood.x*SN+SN/2,snakeFood.y*SN+SN/2,SN/2-2,0,Math.PI*2);ctx.fill();
  snakeBody.forEach((s,i)=>{ctx.fillStyle=i===0?'#10b981':'#10b98188';ctx.fillRect(s.x*SN+1,s.y*SN+1,SN-2,SN-2);});
}
function snakeStep(){
  if(snkOver)return;sDx=sNDx;sDy=sNDy;
  const head={x:snakeBody[0].x+sDx,y:snakeBody[0].y+sDy};
  if(head.x<0||head.x>=SCOLS||head.y<0||head.y>=SROWS||snakeBody.some(s=>s.x===head.x&&s.y===head.y)){
    snkOver=true;clearInterval(snakeInterval);snakeInterval=null;
    if(snkScore>snkBest){snkBest=snkScore;document.getElementById('snake-best').textContent=snkBest;}
    document.getElementById('snake-msg').textContent='Game Over ! Appuie pour recommencer';drawSnake();return;
  }
  snakeBody.unshift(head);
  if(head.x===snakeFood.x&&head.y===snakeFood.y){snkScore++;document.getElementById('snake-score').textContent=snkScore;placeSnakeFood();}
  else snakeBody.pop();drawSnake();
}
function snakeDir(dx,dy){
  if(snkOver){snakeInit();return;}
  if(!snakeInterval){snakeInterval=setInterval(snakeStep,120);document.getElementById('snake-msg').textContent='';}
  if(dx===-sDx&&dy===-sDy)return;sNDx=dx;sNDy=dy;
}
document.addEventListener('keydown',e=>{
  if(!document.getElementById('game-snake').classList.contains('active'))return;
  const m={'ArrowUp':[0,-1],'ArrowDown':[0,1],'ArrowLeft':[-1,0],'ArrowRight':[1,0]};
  if(m[e.key]){e.preventDefault();snakeDir(m[e.key][0],m[e.key][1]);}
});

snakeInit();
