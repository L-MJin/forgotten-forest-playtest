/* Forgotten Forest live playtest — Cha Segye combat & motion review, v16.9.1.
   All changes are confined to the live patch; the underlying game is preserved. */
(() => {
  'use strict';
  const version = '16.9.1';
  const config = { slow: false };
  const dirRows = { down: 0, left: 1, right: 2, up: 3 };
  const clamp = (v, a=0, b=1) => Math.max(a, Math.min(b, v));
  const smooth = t => { t=clamp(t); return t*t*(3-2*t); };
  const originalDrawHero = drawHero;
  let heroSprite = null;

  // Use the existing game's embedded hero artwork; no extra image files.
  function captureSprite() {
    const original = g.drawImage;
    try {
      g.drawImage = function(...args) {
        const src=args[0];
        if (!heroSprite && args.length===9 && args[3]===120 && args[4]===150 && src && src.naturalWidth===4080 && src.naturalHeight===600) {
          heroSprite=src;
        }
        return original.apply(this,args);
      };
      originalDrawHero();
    } finally { g.drawImage = original; }
  }

  function typeNow() {
    if (player.atk>0) return 'attack';
    if (player.skill>0) return 'magic';
    if (player.moving) return player.run?'run':'walk';
    return 'idle';
  }

  function frameFor(type) {
    if (type==='attack') return 20 + Math.min(7,Math.floor(clamp(1-player.atk/(player.atkDuration168||.54))*8));
    if (type==='magic') return 28 + Math.min(5,Math.floor(clamp(1-player.skill/(player.magicDuration168||.72))*6));
    if (type==='walk') return 4 + Math.floor(Math.max(0,player.walk||0))%8;
    if (type==='run') return 12 + Math.floor(Math.max(0,player.walk||0)*1.1)%8;
    const idle=(player.idleTime168||0)*4.3;
    return [0,1,2,3,2,1][Math.floor(idle)%6];
  }

  // Synchronize whole-body turn, lunge, blade and forearm.
  function attackPose(face,t) {
    const wind=smooth(t/.26),cut=smooth((t-.26)/.32),recover=smooth((t-.67)/.33);
    const sign=face==='left'?-1:face==='right'?1:0;
    const yaw=(-.10*wind+.26*cut-.16*recover);
    return {x:sign*(-4*wind+12*cut-8*recover),y:2*wind-4*cut+2*recover,
      rot:sign*yaw+(sign===0?yaw*.3:0)};
  }

  function swordHand(face,t) {
    const wind=smooth(t/.23),cut=smooth((t-.24)/.44),recovery=smooth((t-.70)/.30);
    const s=face==='left'?-1:1;
    let x=s*(11-7*wind+25*cut-18*recovery), y=-79-6*wind+4*cut;
    let theta=(-1.95-.38*wind+3.09*cut-.48*recovery);
    if (face==='left') theta=Math.PI-theta;
    if (face==='down') { x=12+15*cut-12*recovery; y=-67-8*wind+6*cut; theta=2.26-2.85*cut+.35*recovery; }
    if (face==='up') { x=3+12*cut-9*recovery; y=-92-8*wind+5*cut; theta=1.15-2.65*cut+.3*recovery; }
    return {x,y,theta,cut};
  }

  function drawSwordAttached(face,t) {
    const h=swordHand(face,t);
    const shoulder={left:-13,right:13,up:-4,down:12}[face];
    g.save();g.lineCap='round';g.lineJoin='round';
    g.strokeStyle='#242434';g.lineWidth=9.0;
    g.beginPath();g.moveTo(shoulder,-88);g.quadraticCurveTo((shoulder+h.x)/2,-84,h.x,h.y);g.stroke();
    g.strokeStyle='#867383';g.lineWidth=3;
    g.beginPath();g.moveTo(shoulder,-89);g.quadraticCurveTo((shoulder+h.x)/2,-85,h.x,h.y-1);g.stroke();
    g.translate(h.x,h.y);g.scale(1,.82);g.rotate(h.theta);
    g.fillStyle='#242438';g.fillRect(-13,-2.6,21,5.2);
    g.fillStyle='#c5a275';g.fillRect(0,-6.3,4,12.6);
    g.fillStyle='#d5dce9';g.beginPath();g.moveTo(5,-3.5);g.lineTo(58,-3.1);g.lineTo(65,0);
    g.lineTo(58,3.1);g.lineTo(5,3.5);g.closePath();g.fill();
    g.strokeStyle='#f2f8ff';g.lineWidth=1.2;g.beginPath();g.moveTo(7,-1.9);g.lineTo(58,-1);g.stroke();
    const flash=Math.sin(Math.PI*clamp((t-.29)/.37));
    if (t>.29&&t<.66&&flash>0) {
      g.globalAlpha=.4*flash;g.shadowColor='#a8dbff';g.shadowBlur=5;
      g.strokeStyle='#b8edff';g.lineWidth=2.4;
      g.beginPath();g.moveTo(28,-4.5);g.lineTo(62,-4.5);g.stroke();
    }
    g.restore();
  }

  function drawMagicHand(face,t) {
    const a=smooth((t-.09)/.57),s=face==='left'?-1:1;
    const end={x:face==='up'?4:face==='down'?12:s*(12+27*a),
      y:face==='up'?-96-17*a:face==='down'?-73+16*a:-81-5*a};
    const sx=face==='left'?-10:face==='right'?10:8;
    g.save();g.lineCap='round';g.strokeStyle='#272637';g.lineWidth=8;
    g.beginPath();g.moveTo(sx,-88);g.lineTo(end.x,end.y);g.stroke();
    g.strokeStyle='#8b7a91';g.lineWidth=3;g.beginPath();g.moveTo(sx,-89);g.lineTo(end.x,end.y-1);g.stroke();
    const bloom=g.createRadialGradient(end.x,end.y,0,end.x,end.y,12+16*a);
    bloom.addColorStop(0,'rgba(245,252,255,.95)');bloom.addColorStop(.32,'rgba(160,218,255,.75)');bloom.addColorStop(1,'rgba(130,158,245,0)');
    g.fillStyle=bloom;g.beginPath();g.arc(end.x,end.y,12+16*a,0,Math.PI*2);g.fill();
    g.restore();
  }

  function drawMotionHero() {
    if (!heroSprite) {captureSprite();return;}
    const px=Math.round(player.x-camX),py=Math.round(player.y-camY);
    const type=typeNow(),face=(type==='attack'||type==='magic')?(player.attackFace||player.face):player.face;
    const frame=frameFor(type),row=dirRows[face]??0;
    const t=type==='attack'?clamp(1-player.atk/(player.atkDuration168||.54)):
            type==='magic'?clamp(1-player.skill/(player.magicDuration168||.72)):0;
    const pose=type==='attack'?attackPose(face,t):type==='magic'?{x:(face==='left'?-3:face==='right'?3:0)*smooth(t),y:-2*smooth(t),rot:0}:{x:0,y:0,rot:0};
    // Only a fixed ground shadow; no animated duplicate sprites.
    g.save();g.globalAlpha=.18;g.fillStyle='#0d1f23';g.beginPath();g.ellipse(px,py+3,23,6,0,0,Math.PI*2);g.fill();g.restore();
    g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    g.translate(px+pose.x,py-49+pose.y);g.rotate(pose.rot);g.translate(0,49);
    g.drawImage(heroSprite,frame*120,row*150,120,150,-60,-145,120,150);
    if (type==='attack') drawSwordAttached(face,t);
    if (type==='magic') drawMagicHand(face,t);
    g.restore();
  }
  drawHero=drawMotionHero;
  drawHeroV10=drawMotionHero;

  const inspector=document.createElement('details');
  inspector.className='ff-motion-lab';
  inspector.innerHTML=`<summary>차세계 모션 테스트 <span>방향 · 공격 · 마법 · 느리게 보기</span></summary>
    <div class="ff-motion-buttons">
      <span class="ff-motion-label">방향</span>
      <button type="button" data-ff-face="down">정면 ↓</button>
      <button type="button" data-ff-face="left">왼쪽 ←</button>
      <button type="button" data-ff-face="right">오른쪽 →</button>
      <button type="button" data-ff-face="up">후면 ↑</button>
      <button type="button" data-ff-motion="attack">검 휘두르기</button>
      <button type="button" data-ff-motion="magic">마법 시전</button>
      <label class="ff-motion-slow"><input type="checkbox" data-ff-slow> 0.5배속</label>
    </div>
    <p>미리보기 버튼은 적에게 피해를 주지 않습니다. 실제 전투는 J / K, 걷기와 달리기는 방향키 / Shift를 사용해 확인하세요.</p>`;
  const style=document.createElement('style');
  style.textContent=`.ff-motion-lab{margin:12px auto 0;padding:11px 14px;border:1px solid #657886;border-radius:11px;
    background:#142433;color:#edf3ff;max-width:1100px;font:13px/1.4 system-ui,sans-serif;}
    .ff-motion-lab summary{font-weight:750;cursor:pointer;color:#f4e3bd}
    .ff-motion-lab summary span{font-size:11px;font-weight:400;color:#adc0d7;margin-left:8px}
    .ff-motion-buttons{display:flex;align-items:center;flex-wrap:wrap;gap:7px;margin-top:11px}
    .ff-motion-buttons button{font:inherit;color:#eef6ff;background:#273b52;border:1px solid #7691af;border-radius:7px;
       padding:7px 10px;cursor:pointer;touch-action:manipulation}
    .ff-motion-buttons button:focus-visible{outline:2px solid #efcf94}
    .ff-motion-buttons button:hover{background:#3c5771}
    .ff-motion-lab p{font-size:11px;color:#b8cad8;margin:9px 0 0}
    .ff-motion-label{color:#c7d4e2}.ff-motion-slow{cursor:pointer;white-space:nowrap}
    @media(max-width:600px){.ff-motion-lab{margin:9px 6px}.ff-motion-buttons button{font-size:12px}}`;
  document.head.appendChild(style);
  const footer=document.querySelector('.footer');
  if (footer) footer.parentElement.insertBefore(inspector,footer);
  else document.querySelector('main')?.appendChild(inspector);
  inspector.addEventListener('click',event=>{
    const btn=event.target.closest('button');if(!btn)return;
    if(btn.dataset.ffFace){player.face=btn.dataset.ffFace;player.attackFace=player.face;player.moving=false;player.atk=0;player.skill=0;}
    if(btn.dataset.ffMotion==='attack'){
      player.attackFace=player.face;player.atkDuration168=.54;player.atk=.54;player.skill=0;
    }
    if(btn.dataset.ffMotion==='magic'){
      player.attackFace=player.face;player.magicDuration168=.72;player.skill=.72;player.atk=0;
    }
  });
  inspector.querySelector('[data-ff-slow]').addEventListener('change',e=>{config.slow=e.target.checked;});
  const oldUpdate=update;
  update=function(dt){oldUpdate(dt*(config.slow?.5:1));};

  const v=document.querySelector('.version');if(v)v.textContent='2D ACTION RPG · PLAYTEST v16.9.1';
  window.__forgottenForestLive={gameVersion:'16.8',patchVersion:version,status:'ready',motionLab:true};
})();