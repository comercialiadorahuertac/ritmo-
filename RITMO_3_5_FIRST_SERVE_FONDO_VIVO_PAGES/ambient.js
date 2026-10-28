/* Cinematic scenes: no autoplay video downloads, no pointer interception. */
(()=>{'use strict';
const scenes={inicio:'court',actividad:'lanes',retas:'rally',comidas:'orbits',focus:'focus',progreso:'rise',ajustes:'calm',fuerza:'strength'};
const holder=document.createElement('div');holder.className='ritmo-ambient';holder.setAttribute('aria-hidden','true');holder.innerHTML='<div class="ambient-glow"></div><div class="ambient-grid"></div><div class="ambient-orbit"></div><div class="ambient-orbit second"></div><div class="ambient-ball"></div><div class="ambient-streak"></div>';document.body.prepend(holder);
const control=document.createElement('button');control.type='button';control.className='ambient-toggle';control.setAttribute('aria-label','Pausar fondo animado');document.body.append(control);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=false;try{paused=localStorage.getItem('ritmo-ambient-paused')==='true';}catch{}
function update(){const stopped=paused||reduced.matches||document.hidden;holder.classList.toggle('is-still',stopped);document.body.classList.toggle('ambient-paused',stopped);control.textContent=stopped?'▶ Fondo':'Ⅱ Fondo';control.setAttribute('aria-label',paused?'Activar fondo animado':'Pausar fondo animado');control.setAttribute('aria-pressed',String(!stopped));document.dispatchEvent(new CustomEvent('ritmo:motion-change',{detail:{paused:stopped}}));}
function setScene(tab){holder.dataset.scene=scenes[tab]||'calm';document.body.dataset.ritmoScene=scenes[tab]||'calm';}
control.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('ritmo-ambient-paused',String(paused));}catch{}update();});document.addEventListener('visibilitychange',update);reduced.addEventListener?.('change',update);
new MutationObserver(()=>{const training=document.body.classList.contains('is-training');holder.classList.toggle('is-training',training);}).observe(document.body,{attributes:true,attributeFilter:['class']});
window.RitmoAmbient={setScene};setScene(location.pathname.endsWith('fuerza.html')?'fuerza':'inicio');update();
})();
