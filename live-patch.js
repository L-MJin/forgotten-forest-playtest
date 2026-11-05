/* Forgotten Forest — v17.2. 2D in-game Cha Segye sprite.
   Game-scale painted avatar with a compact, neat black swept hairstyle.
   One complete baked frame per character; no floating head or body overlays. */
(() => {
  'use strict';
  const old=window.__heroArtV164;
  const W=120,H=150,N=42,faces={down:0,left:1,right:2,up:3};
  const cv=document.createElement('canvas');
  cv.width=W*N;cv.height=H*4;
  const b=cv.getContext('2d');
  let ready=false;
  const lim=(v)=>Math.min(1,Math.max(0,v));
  const sm=t=>{t=lim(t);return t*t*(3-2*t)};

  function contour(row){
    b.beginPath();
    if(row===0){
      b.moveTo(39,48);b.bezierCurveTo(32,38,38,23,50,19);
      b.bezierCurveTo(60,14,73,14,81,19);
      b.bezierCurveTo(93,23,96,37,92,48);
      b.bezierCurveTo(90,52,87,51,84,48);
      b.bezierCurveTo(81,44,75,42,69,45);
      b.bezierCurveTo(62,44,59,50,55,49);
      b.bezierCurveTo(48,48,44,52,39,56);
    }else if(row===1 || row===2){
      if(row===2){b.save();b.translate(120,0);b.scale(-1,1);}
      b.moveTo(43,51);b.bezierCurveTo(33,42,39,25,48,20);
      b.bezierCurveTo(61,12,79,16,89,28);
      b.bezierCurveTo(94,35,97,43,94,54);
      b.bezierCurveTo(89,54,80,55,71,52);
      b.bezierCurveTo(62,47,59,46,54,45);
      b.bezierCurveTo(48,45,45,48,43,51);
      if(row===2)b.restore();
    }else{
      b.moveTo(40,47);b.bezierCurveTo(33,34,39,21,49,18);
      b.bezierCurveTo(61,13,76,15,85,22);
      b.bezierCurveTo(98,32,95,48,90,57);
      b.bezierCurveTo(78,66,52,64,40,53);
    }
    b.closePath();
  }
  function paintHead(row,sx,sy){
    // Replace hair pixels in the atlas BEFORE rendering the actor.
    // The original 2D lower face is retained and baked back into the same frame.
    b.clearRect(26,9,78,48);
    b.save();contour(row);b.save();b.clip();
    b.drawImage(old,sx+32,sy+14,66,49,36,16,61,45);
    const depth=b.createLinearGradient(0,17,0,62);
    depth.addColorStop(0,'rgba(16,19,33,.18)');
    depth.addColorStop(.42,'rgba(16,19,33,.27)');
    depth.addColorStop(1,'rgba(15,16,25,.75)');
    b.fillStyle=depth;b.fillRect(32,14,70,55);b.restore();
    b.strokeStyle='rgba(29,27,39,.42)';b.lineWidth=.7;b.stroke();
    if(row!==3){
      const x=row===1?57:row===2?73:65;
      b.save();b.beginPath();
      b.ellipse(x,63,row===0?22:18,14,0,0,Math.PI*2);b.clip();
      b.drawImage(old,sx+35,sy+49,65,30,35,49,65,30);
      b.restore();
    }
    const strands=row===0?[
      [41,38,47,23,65,19,78,21],[45,41,55,25,72,22,82,24],
      [50,39,59,31,73,30,88,30],[56,39,66,33,79,34,87,39],
      [58,42,67,39,78,41,84,46]
    ]:row===1?[
      [42,41,51,24,70,19,85,30],[44,46,55,33,68,29,89,34],
      [48,44,58,36,77,37,91,42]
    ]:row===2?[
      [77,41,70,24,55,19,43,30],[76,47,65,33,52,29,39,34],
      [73,43,62,36,45,37,38,43]
    ]:[
      [47,30,60,22,77,22,86,33],[44,37,59,32,78,35,90,42],
      [43,46,56,44,78,46,88,50]
    ];
    b.lineCap='round';b.lineJoin='round';
    strands.forEach((p,i)=>{
      b.beginPath();b.moveTo(p[0],p[1]);b.bezierCurveTo(...p.slice(2));
      b.strokeStyle=i%2?'rgba(111,110,133,.34)':'rgba(163,147,163,.33)';
      b.lineWidth=i===0?1.7:1.1;b.stroke();
    });
    b.restore();
  }
  function bake(){
    if(ready)return true;
    if(!old?.complete || old.naturalWidth!==5040 || old.naturalHeight!==600)return false;
    for(let r=0;r<4;r++)for(let f=0;f<N;f++){
      const sx=f*W,sy=r*H;
      b.save();b.translate(sx,sy);
      b.drawImage(old,sx,sy,W,H,0,0,W,H);
      paintHead(r,sx,sy);
      if(r===0)b.clearRect(16,57,11,49);
      b.restore();
    }
    ready=true;return true;
  }
  function frame(){
    if(player.atk>0)return {action:'attack',num:26+Math.min(7,Math.floor(lim(1-player.atk/(player.atkDuration168||.54))*8))};
    if(player.skill>0)return {action:'magic',num:34+Math.min(5,Math.floor(lim(1-player.skill/(player.magicDuration168||.72))*6))};
    if(player.moving){
      const run=!!player.run;
      return {action:run?'run':'walk',num:(run?16:6)+Math.floor(Math.max(0,player.walk||0)*(run?1.08:1))%10};
    }
    return {action:'idle',num:0};
  }
  function saber(face,t){
    const sign=face==='left'?-1:1;
    const raise=sm((t-.13)/.26),cut=sm((t-.34)/.33);
    const x=sign*(11+19*cut),y=-82-4*raise+8*cut;
    const angle=face==='down'?-1.9+2.5*cut:face==='up'?-.5-2.2*cut:sign===1?-2.2+2.7*cut:Math.PI+2.2-2.7*cut;
    g.save();g.lineCap='round';g.strokeStyle='#2c2738';g.lineWidth=5;
    g.beginPath();g.moveTo(sign*7,-88);g.lineTo(x,y);g.stroke();
    g.translate(x,y);g.rotate(angle);g.scale(1,.87);
    g.fillStyle='#272534';g.fillRect(-10,-2,18,4);
    g.fillStyle='#ccb48e';g.fillRect(0,-6,3,12);
    g.fillStyle='#dce4ed';g.beginPath();g.moveTo(4,-3);g.lineTo(47,-2.3);
    g.lineTo(53,0);g.lineTo(47,2.3);g.lineTo(4,3);g.closePath();g.fill();
    g.strokeStyle='#f7fcff';g.lineWidth=1;g.beginPath();g.moveTo(5,-1.5);g.lineTo(48,-1);g.stroke();g.restore();
  }
  function magic(face,t){
    const e=sm((t-.1)/.56),s=face==='left'?-1:1;
    const x=face==='up'?0:face==='down'?8:s*(15+25*e);
    const y=face==='up'?-111:face==='down'?-72:-85;
    g.save();g.lineCap='round';g.strokeStyle='#282438';g.lineWidth=5;
    g.beginPath();g.moveTo(s*7,-86);g.lineTo(x,y);g.stroke();
    const glow=g.createRadialGradient(x,y,1,x,y,12+13*e);
    glow.addColorStop(0,'rgba(248,254,255,.98)');
    glow.addColorStop(.25,'rgba(182,227,255,.83)');
    glow.addColorStop(1,'rgba(160,155,245,0)');
    g.fillStyle=glow;g.beginPath();g.arc(x,y,12+13*e,0,Math.PI*2);g.fill();g.restore();
  }
  function drawHero2D(){
    if(!bake())return;
    const px=Math.round(player.x-camX),py=Math.round(player.y-camY);
    const st=frame(),face=(st.action==='attack'||st.action==='magic')?(player.attackFace||player.face):player.face;
    const row=faces[face]??0;
    const attack=st.action==='attack',ismagic=st.action==='magic';
    const t=attack?lim(1-player.atk/(player.atkDuration168||.54)):
      ismagic?lim(1-player.skill/(player.magicDuration168||.72)):0;
    let dx=0,dy=0;
    if(attack){const wind=sm(t/.28),cut=sm((t-.28)/.4),end=sm((t-.72)/.28);
      const sign=face==='left'?-1:face==='right'?1:0;
      dx=sign*(-2*wind+6*cut-4*end);dy=2*wind-3*cut+end;
    }
    if(ismagic){const sign=face==='left'?-1:face==='right'?1:0;
      dx=sign*2*sm(t);dy=-1.4*Math.sin(Math.PI*t);}
    g.save();g.globalAlpha=.19;g.fillStyle='#10212b';g.beginPath();
    g.ellipse(px,py+3,23,6,0,0,Math.PI*2);g.fill();g.restore();
    g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    g.drawImage(cv,st.num*W,row*H,W,H,Math.round(px+dx-60),Math.round(py+dy-145),W,H);
    g.translate(px+dx,py+dy);
    if(attack)saber(face,t);
    if(ismagic)magic(face,t);
    g.restore();
  }
  drawHero=drawHero2D;drawHeroV10=drawHero2D;
  const version=document.querySelector('.version');
  if(version)version.textContent='2D ACTION RPG · 차세계 2D 화풍 리빌드 v17.2';
  const sub=document.querySelector('.subtitle');
  if(sub)sub.textContent='차세계 기존 2D 게임 체형에 맞춘 4방향 스프라이트 · 검은 정돈된 머리';
  window.__FFHeroV172={version:'17.2',loaded:()=>ready,sourceReady:()=>!!old?.naturalWidth,atlas:cv};
  window.__forgottenForestLive={gameVersion:'16.8',patchVersion:'17.2',status:'ready',characterStyle:'2d-matched'};
})();