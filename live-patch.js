/* Forgotten Forest — Cha Segye v17.1 full-body character artwork.
   Replaces ALL hero rendering; no old face, head, cape, duplicate sprites or shadow ghosts.
   The four full-body standing directions come from the user's approved character sheet.
   Movement and combat key-frame animation will be rebuilt against this new body later. */
(() => {
  'use strict';
  const frameW=120, frameH=150;
  const rows={down:0,left:1,right:2,up:3};
  const image=new Image();
  image.decoding='async';
  image.src='./assets/cha-segye-v17-1.png';
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const ease=t=>{t=clamp(t);return t*t*(3-2*t)};
  const baseY=145;

  function drawNewHero(){
    const px=Math.round(player.x-camX),py=Math.round(player.y-camY);
    const attack=player.atk>0,magic=!attack&&player.skill>0;
    const face=(attack||magic)?(player.attackFace||player.face):player.face;
    const ri=rows[face]??0;
    const duration=attack?(player.atkDuration168||.54):(player.magicDuration168||.72);
    const t=(attack||magic)?clamp(1-(attack?player.atk:player.skill)/duration):0;
    let dx=0,dy=0,angle=0;
    // Only subtle whole-body intent motion; no reuse of old character parts.
    if(attack){
      const wind=ease(t/.38),recover=ease((t-.62)/.38);
      const sign=face==='left'?-1:face==='right'?1:0;
      dx=sign*(4*wind-4*recover);
      dy=-1.2*Math.sin(Math.PI*t);
      angle=sign*.035*Math.sin(Math.PI*t);
    }else if(magic){
      dy=-1.2*Math.sin(Math.PI*t);
    }

    // One stationary ground shadow; never an animated ghost trail.
    g.save();
    g.globalAlpha=.18;g.fillStyle='#12212a';
    g.beginPath();g.ellipse(px,py+3,24,6,0,0,Math.PI*2);g.fill();
    g.restore();

    if(!image.complete||image.naturalWidth!==480)return;
    g.save();
    g.imageSmoothingEnabled=true;
    g.imageSmoothingQuality='high';
    g.translate(px+dx,py+dy-baseY+4);
    g.translate(0,baseY-49);g.rotate(angle);g.translate(0,-(baseY-49));
    // A single, full-body image. No other hero image is drawn on this layer.
    g.drawImage(image,ri*frameW,0,frameW,frameH,-frameW/2,0,frameW,frameH);
    g.restore();
  }
  drawHero=drawNewHero;
  drawHeroV10=drawNewHero;
  window.__chaSegyeFullReplacement={
    version:'17.1',
    loaded:()=>image.complete&&image.naturalWidth===480,
    image,
    current:()=>({direction:player.face,attack:player.atk,magic:player.skill,moving:player.moving}),
    setDirection:d=>{
      if(Object.prototype.hasOwnProperty.call(rows,d)){
        player.face=d;player.attackFace=d;player.moving=false;
      }
    }
  };
  const version=document.querySelector('.version');
  if(version)version.textContent='2D ACTION RPG · 차세계 전신 원화 교체 v17.1';
  const subtitle=document.querySelector('.subtitle');
  if(subtitle)subtitle.textContent='차세계 4방향 새 전신 원화 적용 · 기존 얼굴 덧씌우기 제거';
  const footer=document.querySelector('.footer div:last-child');
  if(footer)footer.innerHTML='<b>차세계 v17.1</b> 선택한 디자인의 정면·좌·우·후면 전신 원화로 기존 스프라이트를 완전히 교체했습니다. 흔들리는 얼굴/그림자 잔상 제거. 걷기·공격·마법의 세부 키 포즈는 새 체형 기준으로 다음 단계에서 제작합니다.';
  window.__forgottenForestLive={
    gameVersion:'16.8',patchVersion:'17.1-full-replacement',status:'ready',
    characterMaster:'new-full-body'
  };
})();
