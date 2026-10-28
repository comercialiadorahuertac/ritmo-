/* RITMO 3.1 — módulos locales de entrenamiento, Focus y nutrición.
   No altera la API de retas, Supabase ni el almacenamiento original. */
(()=>{'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const groups=[
 ['Despertar',['Lanzamiento vertical y captura','Captura con mano contraria','Un bote y captura','Bote alternando manos','Lanzamiento a distintas alturas','Captura después de palmada','Rebote suave en pared','Lanzamiento con paso lateral','Captura con ambas manos por turnos','20 capturas consecutivas']],
 ['Reacción',['Rebote en pared alternando manos','Captura después de dos palmadas','Rebote con paso lateral','Captura a diferentes alturas','Lanzamiento y giro de 90 grados','Rebote con mano no dominante','Lanzamiento y toque de rodilla','Captura según señal sonora','Dos pelotas alternadas lentamente','30 capturas controladas']],
 ['Agilidad',['Rebote lateral alternado','Captura tras dos pasos laterales','Lanzamiento con cambio de dirección','Captura después de giro de 180 grados','Dos pelotas en secuencia','Rebote y toque de cono','Captura según señal de color','Lanzamiento y split-step','Captura con desplazamiento diagonal','Circuito de precisión']],
 ['Anticipación',['Captura de pelota elegida por compañero','Dos rebotes alternados en pared','Desplazamiento según señal aleatoria','Captura con mano indicada por audio','Dos pelotas a distintas alturas','Rebote, giro y recuperación','Captura con dirección inesperada','Señales visuales periféricas','Secuencia de captura y desplazamiento','Reto de precisión bajo tiempo']],
 ['Elite Reflex',['Dos pelotas con trayectorias alternadas','Captura según señal de último segundo','Rebote rápido con mano aleatoria','Captura tras desplazamiento diagonal','Doble estímulo: color y dirección','Decidir atrapar o dejar botar','Dos pelotas con secuencia cambiante','Rebote con mano no dominante','Circuito continuo de decisiones','FINAL BOSS — Reflex Gauntlet']]
];
const descriptions=[
 'Trabaja con una pelota blanda. Realiza el movimiento lentamente y aumenta el ritmo solo cuando controles las capturas.',
 'Mantén la vista en la pelota y alterna manos. Prioriza precisión sobre velocidad.',
 'Combina coordinación y pasos cortos, sin cruzar los pies de forma brusca.',
 'Usa señales de un compañero y alterna respuestas; detén el ejercicio si pierdes el control.',
 'Ejercicio avanzado: combina señales impredecibles, desplazamientos cortos y dos pelotas blandas. Practica con compañero y espacio libre.'
];
const strength=[
 {name:'Sentadilla goblet',equipment:'Mancuernas',area:'Piernas',how:'Sujeta una mancuerna junto al pecho, baja con control y empuja el suelo para subir.',icon:'🏋️'},
 {name:'Peso muerto rumano',equipment:'Mancuernas',area:'Piernas',how:'Flexiona ligeramente rodillas y lleva la cadera atrás manteniendo espalda neutra.',icon:'🏋️'},
 {name:'Remo inclinado',equipment:'Mancuernas',area:'Espalda',how:'Inclina el torso con espalda neutra y lleva los codos hacia las costillas.',icon:'💪'},
 {name:'Press de hombros',equipment:'Mancuernas',area:'Hombros',how:'Empuja mancuernas hacia arriba sin arquear la zona lumbar.',icon:'💪'},
 {name:'Press de pecho en suelo',equipment:'Mancuernas',area:'Pecho',how:'Acostado sobre el suelo, empuja mancuernas desde codos controlados.',icon:'💪'},
 {name:'Zancada inversa',equipment:'Mancuernas',area:'Piernas',how:'Da un paso atrás, baja en vertical y vuelve al centro.',icon:'🦵'},
 {name:'Curl de bíceps',equipment:'Mancuernas',area:'Brazos',how:'Flexiona codos sin balancear el tronco.',icon:'💪'},
 {name:'Extensión de tríceps',equipment:'Mancuernas',area:'Brazos',how:'Extiende codos lentamente con peso ligero y controlado.',icon:'💪'},
 {name:'Caminata lateral con minibanda',equipment:'Ligas',area:'Piernas',how:'Coloca minibanda sobre rodillas y da pasos laterales con tensión suave.',icon:'🦵'},
 {name:'Rotación externa de hombro',equipment:'Ligas',area:'Hombros',how:'Con codo junto al cuerpo, rota el antebrazo hacia afuera sin dolor.',icon:'🎾'},
 {name:'Remo con liga',equipment:'Ligas',area:'Espalda',how:'Con liga anclada de forma segura, lleva codos atrás sin elevar hombros.',icon:'💪'},
 {name:'Pull-apart con liga',equipment:'Ligas',area:'Hombros',how:'Separa las manos a la altura del pecho con una liga ligera.',icon:'💪'},
 {name:'Puente de glúteos',equipment:'Sin equipo',area:'Piernas',how:'Boca arriba, eleva caderas y baja lentamente.',icon:'🦵'},
 {name:'Plancha',equipment:'Sin equipo',area:'Core',how:'Mantén abdomen firme, respiración fluida y espalda alineada.',icon:'🧘'},
 {name:'Bird dog',equipment:'Sin equipo',area:'Core',how:'En cuatro apoyos, extiende brazo y pierna contrarios sin rotar cadera.',icon:'🧘'},
 {name:'Flexión inclinada',equipment:'Sin equipo',area:'Pecho',how:'Apoya manos en superficie firme elevada y flexiona codos con control.',icon:'💪'},
 {name:'Elevación lateral',equipment:'Mancuernas',area:'Hombros',how:'Eleva mancuernas ligeras a los lados sin encoger hombros.',icon:'💪'},
 {name:'Sentadilla con liga',equipment:'Ligas',area:'Piernas',how:'Coloca minibanda sobre rodillas, desciende con control.',icon:'🦵'},
 {name:'Pallof press',equipment:'Ligas',area:'Core',how:'Con liga anclada lateralmente, empuja manos al frente evitando rotar.',icon:'🧘'},
 {name:'Elevación de pantorrillas',equipment:'Sin equipo',area:'Piernas',how:'Sube y baja talones con control junto a una pared para equilibrio.',icon:'🦵'}
];
const foodDB=[
 ['huevo',72,6.3,'pieza'],['clara',17,3.6,'pieza'],['tortilla de maíz',60,1.6,'pieza'],['tortilla de harina',140,3.5,'pieza'],['pan',80,3,'rebanada'],['aguacate',240,3,'pieza'],['pollo',165,31,'100g'],['pechuga',165,31,'100g'],['arroz',130,2.7,'100g'],['frijoles',110,7,'100g'],['carne de res',220,26,'100g'],['bistec',190,28,'100g'],['atún',116,26,'100g'],['salmón',208,20,'100g'],['queso panela',200,20,'100g'],['leche',60,3.2,'100ml'],['yogur griego',90,9,'100g'],['avena',389,17,'100g'],['plátano',105,1.3,'pieza'],['manzana',95,.5,'pieza'],['naranja',62,1.2,'pieza'],['papa',87,2,'100g'],['pasta',158,5.8,'100g'],['brócoli',35,2.4,'100g'],['verduras',35,2,'100g'],['aceite',120,0,'cucharada'],['mantequilla',100,0,'cucharada'],['almendras',58,2.1,'10g'],['cacahuates',57,2.6,'10g'],['taco de pollo',150,11,'pieza'],['taco de bistec',170,12,'pieza'],['taco',160,10,'pieza'],['agua de jamaica',90,0,'vaso'],['refresco',140,0,'lata'],['café',3,0,'taza'],['jugo',110,1,'vaso'],['quesadilla',250,10,'pieza'],['sándwich',320,18,'pieza'],['ensalada',80,3,'tazón'],['proteína en polvo',120,24,'medida']
];
const units={medio:.5,media:.5,un:1,una:1,uno:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6};
function parseFoods(input){
 const normalize=t=>String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 // Protect decimal commas before splitting food clauses.
 let text=normalize(input).replace(/(\d),(?=\d)/g,'$1.').replace(/\b(comi|desayune|cene|almorce|y|con)\b/g,',');
 const singular=t=>t.replace(/\b(huevos|claras|tortillas|piezas|rebanadas|tacos|platanos|manzanas|naranjas|papas|cucharadas|vasos|latas|tazas|medidas)\b/g,w=>w.slice(0,-1));
 let found=[];found.unrecognized=[];
 for(const raw of text.split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean)){
  if(/-\s*\d/.test(raw)){found.unrecognized.push(raw);continue;}let part=singular(raw),f=foodDB.filter(f=>(' '+part+' ').includes(' '+normalize(f[0])+' ')).sort((a,b)=>b[0].length-a[0].length)[0];
  if(!f){found.unrecognized.push(raw);continue;}
  const match=part.match(/(\d+\/\d+|\d+(?:\.\d+)?)\s*(kilogramos?|kilos?|kg|gramos?|g|mililitros?|ml|litros?|l|taza|cucharada|pieza|rebanada|vaso|lata|medida)?\b/);
  let n=1,u='',hasQty=false;
  if(match){const q=match[1];n=q.includes('/')?q.split('/').map(Number).reduce((a,b)=>a/b):Number(q);u=match[2]||'';hasQty=true;}
  else{const word=part.match(/\b(medio|media|un|una|uno|dos|tres|cuatro|cinco|seis)\b/);if(word){n=units[word[1]];hasQty=true;}u=part.match(/\b(taza|cucharada|pieza|rebanada|vaso|lata|medida)\b/)?.[0]||'';}
  const mass=/^(kg|kilo|kilogramo)/.test(u)?1000:/^(g|gramo)/.test(u)?1:0;
  const volume=/^l(itros?)?$/.test(u)?1000:/^(ml|mililitro)/.test(u)?1:0;
  if(!hasQty||!Number.isFinite(n)||n<=0){found.unrecognized.push(raw);continue;}
  if(f[3]==='100g'||f[3]==='10g'){
   if(!mass){found.unrecognized.push(raw+' (indica gramos)');continue;}
   n=n*mass/(f[3]==='100g'?100:10);
  }else if(f[3]==='100ml'){
   if(!volume){found.unrecognized.push(raw+' (indica mililitros)');continue;}
   n=n*volume/100;
  }else if(mass||volume||(u&&u!==f[3])){found.unrecognized.push(raw+' (unidad incompatible)');continue;}
  if(!Number.isFinite(n)||n>1000){found.unrecognized.push(raw);continue;}
  found.push({name:f[0],qty:n,cal:Math.round(f[1]*n),protein:Math.round(f[2]*n*10)/10,assumption:f[3]});
 }
 return found;
}

let level=1,selected=0,equipment='Todos',area='Todos',session=null,interval=null,elapsed=0,run=false,mode='focus';
const today=()=>new Date().toISOString().slice(0,10);
function store(){try{return JSON.parse(localStorage.getItem('ritmo31-progress')||'{}')}catch{return {}}}
function persist(o){localStorage.setItem('ritmo31-progress',JSON.stringify(o))}
function setView(html){let v=document.getElementById('view');if(v){v.innerHTML=html;hydrateMedia(v)}}

function exerciseArt(x){return `<span class="media-placeholder" aria-label="Demostración pendiente">Demostración no disponible</span>`}
function focusArt(){return `<span class="focus-symbol" aria-hidden="true">↗</span>`}
function mediaFor(x,large=false){return `<div class="ritmo-media ${large?'large':''}" data-exercise-media="${esc(x.name)}"><span class="media-placeholder">Buscando demostración real…</span></div>`}
const aliases={
 'Sentadilla goblet':['goblet squat'], 'Peso muerto rumano':['dumbbell romanian deadlift','romanian deadlift'], 'Remo inclinado':['dumbbell bent over row','bent over dumbbell row'], 'Press de hombros':['dumbbell shoulder press','seated dumbbell shoulder press'], 'Press de pecho en suelo':['dumbbell floor press'], 'Zancada inversa':['dumbbell reverse lunge','reverse lunge'], 'Curl de bíceps':['dumbbell bicep curl','dumbbell curl'], 'Extensión de tríceps':['dumbbell triceps extension','overhead tricep extension'], 'Caminata lateral con minibanda':['band lateral walk','lateral band walk'], 'Rotación externa de hombro':['band external rotation','shoulder external rotation'], 'Remo con liga':['resistance band row','band row'], 'Pull-apart con liga':['band pull apart'], 'Puente de glúteos':['glute bridge'], 'Plancha':['plank'], 'Bird dog':['bird dog'], 'Flexión inclinada':['incline push up'], 'Elevación lateral':['dumbbell lateral raise'], 'Sentadilla con liga':['band squat','resistance band squat'], 'Pallof press':['pallof press'], 'Elevación de pantorrillas':['standing calf raise','calf raise']};
let mediaRecords=null,mediaPromise=null;
function norm(x){return String(x||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
async function loadMedia(){if(mediaRecords)return mediaRecords;if(mediaPromise)return mediaPromise;mediaPromise=fetch('https://raw.githubusercontent.com/buzops9/exercisedb/main/data/exercises.json').then(r=>{if(!r.ok)throw Error('Catálogo no disponible');return r.json()}).then(data=>{mediaRecords=Array.isArray(data)?data:Array.isArray(data.exercises)?data.exercises:[];return mediaRecords}).catch(()=>[]);return mediaPromise}
function safeMediaUrl(v){if(typeof v!=='string')return '';try{let u=new URL(v);return u.protocol==='https:'?u.href:''}catch{return ''}}
function extractMedia(rec){let thumbs=rec.thumbnails||rec.thumbnail||rec.images||rec.image||{},vid=rec.videos||rec.video||{};let image=typeof thumbs==='string'?thumbs:thumbs.female||thumbs.male||thumbs.url||thumbs.thumbnail||'';let video=typeof vid==='string'?vid:vid.female||vid.male||vid.url||'';return {image:safeMediaUrl(image),video:safeMediaUrl(video)}}
async function hydrateMedia(root=document){let nodes=[...root.querySelectorAll('[data-exercise-media]')];if(!nodes.length)return;let all=await loadMedia();for(let el of nodes){if(!el.isConnected)continue;let n=el.dataset.exerciseMedia,terms=aliases[n]||[n],rec=all.find(r=>terms.some(t=>norm(r.name||r.title)===norm(t)))||all.find(r=>terms.some(t=>norm(r.name||r.title).includes(norm(t))));let {image,video}=rec?extractMedia(rec):{};if(image){let img=document.createElement('img');img.loading='lazy';img.alt='Demostración: '+n;img.src=image;img.onerror=()=>{el.replaceChildren();el.textContent='Imagen no disponible'};el.replaceChildren(img);if(video){let btn=document.createElement('button');btn.type='button';btn.className='media-play';btn.textContent='▶ Ver video';btn.dataset.mediaVideo=video;el.appendChild(btn);el.classList.add('has-video')}}else{el.replaceChildren();el.textContent='Demostración no disponible'}}}
function focusView(){const prog=store();return `<span class="section-label">RITMO FOCUS · 50 EJERCICIOS</span><h1 class="page-title">Entrena tu atención y reflejos.</h1><p class="page-subtitle">Pelota, coordinación, visión deportiva y preparación mental para tenis, pádel y pickleball.</p><div class="extras-card"><h3>Preparación antes de jugar</h3><p>12 minutos: 4 activación con ligas · 3 reflejos · 3 atención plena · 2 desplazamientos específicos.</p><button class="btn full" data-ex="pre">Iniciar prepartido 12 min</button><button class="btn btn-outline full" data-ex="meditation" style="margin-top:8px">Meditación activa 3 min</button></div><div class="extras-card"><h3>Focus Express</h3><p>5 minutos con pelota blanda: lanzamientos, bote, pared y reto de capturas.</p><button class="btn full" data-ex="express">Iniciar rutina 5 min</button></div><div class="extras-card"><h3>Reaction Lab · juego interactivo</h3><p>Toca el objetivo verde cuando aparezca. Mide tu tiempo de reacción táctil en 10 intentos.</p><button class="btn full" data-ex="reaction-game">Abrir Reaction Lab</button></div><div class="extras-levels">${groups.map((g,i)=>`<button class="extras-level ${level===i+1?'chosen':''}" data-ex="level" data-level="${i+1}"><b>${i+1}</b><span>${esc(g[0])}</span></button>`).join('')}</div><div class="extras-card"><h3>Nivel ${level} — ${groups[level-1][0]}</h3><p>${esc(descriptions[level-1])}</p>${groups[level-1][1].map((n,i)=>`<button class="extras-item" data-ex="exercise" data-index="${i}"><span class="extras-ball">${focusArt()}</span><span><b>${i+1}. ${esc(n)}</b><small>40 s práctica · 20 s descanso · ${level===5?'Avanzado':'Progresivo'}</small></span><span>›</span></button>`).join('')}</div><div class="extras-note">Trabaja en un espacio libre con pelota blanda. Evita lanzamientos hacia el rostro, destellos y giros a ciegas. Los ejercicios no son una prueba clínica de reflejos.</div>${prog.lastFocus?`<p class="extras-note">Última sesión registrada: ${esc(prog.lastFocus)}</p>`:''}`;}
function strengthView(){return `<section class="extras-card"><span class="section-label">RITMO / FUERZA</span><h1 class="page-title">Entrena con guía visual.</h1><p class="page-subtitle">Programas A/B/C de 30 minutos con fotografías reales, ejercicios y descansos guiados.</p><a class="btn" style="display:inline-flex;text-decoration:none" href="./fuerza.html">ABRIR FUERZA ↗</a><p class="extras-note">Dos posiciones fotográficas por ejercicio. Mancuernas, ligas o peso corporal. Sin banco.</p></section>`;}

function modal(title,body){let d=document.getElementById('editor-dialog'),c=document.getElementById('dialog-content');c.innerHTML=`<div class="dialog-top"><span class="section-label">RITMO 3.2</span><button type="button" class="dialog-close" data-ex="close">×</button></div><h2 class="form-title">${esc(title)}</h2>${body}`;if(!d.open)d.showModal();hydrateMedia(c);}
function detail(n){let x=strength.find(e=>e.name===n);if(!x)return;modal(x.name,`<div class="extras-demo">${mediaFor(x,true)}</div><p>${esc(x.how)}</p><p><b>Equipo:</b> ${x.equipment} · <b>Zona:</b> ${x.area}</p><p class="extras-note">Elige una carga cómoda y evita dolor. La biblioteca intenta cargar una demostración real; si no está disponible, se muestra un aviso.</p><button class="btn full" data-ex="close">Entendido</button>`)}
function exercise(i){selected=i;let name=groups[level-1][1][i];modal(name,`${window.RitmoFocusGuide.render(name,level,i)}<p><b>Equipo:</b> pelota blanda${level>=4?' y compañero':''}.</p><button class="btn full" data-ex="start-single">Practicar 1 minuto</button>`)}

function buildTimeline(kind,eq){let blocks=[];const add=(name,seconds,type='Trabajo',idx=null)=>blocks.push({name,seconds,type,idx});
if(kind==='strength'){
[['Movilidad de hombros',60],['Marcha activa y pasos laterales',60],['Activación con liga ligera',60],['Sentadilla sin carga',60],['Movilidad de cadera',60]].forEach(([n,d])=>add(n,d,'Calentamiento'));
let picks=eq==='Ligas'?[9,10,8,11,18,9,10,8,11,18]:eq==='Mancuernas'?[0,2,3,1,4,5,6,16,7,0]:[0,10,3,8,1,11,2,18,5,13];
picks.forEach(i=>{add(strength[i].name,45,'Ejercicio',i);add('Descanso · recupera el aire',15,'Descanso');add(strength[i].name,45,'Ejercicio',i);add('Descanso · prepara el siguiente',15,'Descanso')});
[['Estiramiento suave de piernas',60],['Movilidad de hombros',60],['Respiración y recuperación',60],['Movilidad de espalda',60],['Cierre y registro',60]].forEach(([n,d])=>add(n,d,'Recuperación'));
}else if(kind==='express') ['Captura con mano contraria','Un bote y captura','Rebote suave en pared','Bote alternando manos','20 capturas consecutivas'].forEach(n=>add(n,60,'Reflejos'));
else if(kind==='pre') [['Círculos de brazos',120,'Activación'],['Pull-apart con liga',120,'Activación'],['Lanzamiento vertical y captura',90,'Reflejos'],['Rebote suave en pared',90,'Reflejos'],['Respiración y visualización',180,'Focus'],['Split-step y desplazamientos',120,'Pista']].forEach(([n,d,t])=>add(n,d,t));
else if(kind==='meditation') [['Respiración tranquila',60],['Atención al cuerpo',60],['Visualización de la siguiente jugada',60]].forEach(([n,d])=>add(n,d,'Focus'));
else{add(groups[level-1][1][selected],40,'Ejercicio');add('Descanso',20,'Descanso')};return blocks}
function getStep(){if(!session)return null;let offset=0;for(let i=0;i<session.blocks.length;i++){let b=session.blocks[i];if(elapsed<offset+b.seconds)return {b,i,remaining:offset+b.seconds-elapsed,offset};offset+=b.seconds}return null}
function start(kind,eq){stopTimer();mode=kind;elapsed=0;run=false;let blocks=buildTimeline(kind,eq||'Mixto');let duration=blocks.reduce((sum,b)=>sum+b.seconds,0);let title=kind==='strength'?'Fuerza · 30 minutos':kind==='pre'?'Preparación prepartido':kind==='meditation'?'Meditación activa':kind==='express'?'Focus Express':groups[level-1][1][selected];session={id:crypto.randomUUID(),skipped:0,duration,kind,eq:eq||'Mixto',blocks};modal(title,`<div class="guided-player"><div class="guided-top"><span id="guided-phase">PREPARADO</span><span id="guided-count"></span></div><div class="guided-media" id="guided-media"></div><div class="guided-title" id="guided-title"></div><div class="guided-clock" id="extras-timer">${fmtTime(duration)}</div><div class="guided-sub">Tiempo del bloque: <strong id="guided-block">00:00</strong></div><div class="guided-track"><div id="guided-progress"></div></div><div class="guided-next" id="guided-next"></div></div><div class="guided-controls"><button class="btn" data-ex="toggle" id="guided-toggle">▶ Iniciar</button><button class="btn btn-outline" data-ex="skip">Siguiente →</button><button class="btn btn-outline" data-ex="reset">Reiniciar</button></div><div class="extras-note">La rutina avanza automáticamente por ejercicios y descansos. El temporizador usa tiempo real incluso si cambias de aplicación. Puedes pausar cuando lo necesites.</div>`);updateTimer()}
function fmtTime(sec){return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`}
function stage(){return getStep()?.b.name||''}
function guidedVisual(b){
 const entry=(window.RitmoTrainingCatalog||[]).find(x=>x.name===b.name);
 if(entry)return `<div class="focus-photos">${entry.images.map((src,i)=>`<figure><img src="${src}" alt="${esc(entry.name)}: posición ${i+1}"><figcaption>Posición ${i+1}</figcaption></figure>`).join('')}</div><p>${esc(entry.how)}</p>`;
 let l=level,i=selected;for(let g=0;g<groups.length;g++){let j=groups[g][1].indexOf(b.name);if(j>=0){l=g+1;i=j;break;}}
 return window.RitmoFocusGuide.render(b.type==='Descanso'?'Descanso':b.name,l,i);
}
function updateTimer(){if(!session)return;let st=getStep();if(!st)return;let {b,i,remaining}=st;let t=document.getElementById('extras-timer');if(t)t.textContent=fmtTime(Math.max(0,session.duration-elapsed));let set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};set('guided-phase',b.type.toUpperCase());set('guided-count',`Paso ${i+1} / ${session.blocks.length}`);set('guided-title',b.name);set('guided-block',fmtTime(remaining));set('guided-next',session.blocks[i+1]?`Siguiente: ${session.blocks[i+1].name}`:'Último bloque de la rutina');let p=document.getElementById('guided-progress');if(p)p.style.width=`${100*elapsed/session.duration}%`;let m=document.getElementById('guided-media');if(m&&m.dataset.step!==String(i)){m.dataset.step=String(i);m.innerHTML=guidedVisual(b);hydrateMedia(m)}let bt=document.getElementById('guided-toggle');if(bt)bt.textContent=run?'Ⅱ Pausar':'▶ Continuar'}
let deadline=0;
function tick(){if(!session||!run)return;let old=getStep()?.i;elapsed=Math.min(session.duration,Math.floor((Date.now()-deadline)/1000));if(elapsed>=session.duration){complete();return}let now=getStep()?.i;if(old!==now){try{if(navigator.vibrate)navigator.vibrate(90)}catch{}}updateTimer()}
function stopTimer(){clearInterval(interval);interval=null;run=false}
function complete(){if(!session)return;stopTimer();const done=session,prog=store();const full=done.skipped===0;if(full){prog.lastFocus=new Date().toLocaleString('es-MX');prog.sessions=(prog.sessions||0)+1;try{persist(prog);}catch{modal('No se pudo guardar',`<p>Libera espacio y vuelve a intentar.</p><button class="btn full" data-ex="toggle">Reintentar guardar</button>`);return;}}session=null;modal(full?'¡Sesión terminada!':'Práctica finalizada',`<p>${full?'Tu sesión quedó registrada.':'Omitiste bloques. No se registró como sesión completa.'}</p><button class="btn full" data-ex="close">Volver a Ritmo</button>`);}

function analyze(){let note=document.getElementById('meal-note'),cal=document.getElementById('meal-cal'),protein=document.getElementById('meal-protein'),out=document.getElementById('food-analysis');if(!note||!out)return;let items=parseFoods(note.value);if(!items.length){out.innerHTML='<p>No reconocí porciones suficientes. Prueba: “2 huevos, 2 tortillas de maíz, 100 g de pollo”. Puedes ingresar calorías manualmente.</p>';return;}let kcal=items.reduce((n,x)=>n+x.cal,0),prot=items.reduce((n,x)=>n+x.protein,0);out.innerHTML=`<b>Estimación por porciones:</b>${items.map(x=>`<div>${esc(x.name)} · ${x.qty} × ${x.assumption} ≈ ${x.cal} kcal</div>`).join('')}<p><b>${kcal} kcal · ${prot.toFixed(1)} g proteína</b></p><small>Valores orientativos de referencia, no verificados por marca ni método de cocción. Revisa y corrige las cantidades antes de guardar.</small>`;if(items.unrecognized?.length){out.innerHTML+=`<p role="alert">Sin calcular: ${items.unrecognized.map(esc).join('; ')}. Corrige cantidades y unidades antes de guardar.</p>`;return;}if(cal)cal.value=kcal;if(protein)protein.value=Math.round(prot*10)/10;}
document.addEventListener('click',e=>{let videoBtn=e.target.closest('[data-media-video]');if(videoBtn){e.preventDefault();let url=videoBtn.dataset.mediaVideo;let player=document.createElement('video');player.controls=true;player.playsInline=true;player.autoplay=true;player.src=url;player.className='demo-video';let holder=videoBtn.closest('.ritmo-media');holder.replaceChildren(player);player.play().catch(()=>{});return;}if(e.target.closest('#food-analyze')){e.preventDefault();analyze();return;}let b=e.target.closest('[data-ex]');if(!b)return;e.preventDefault();let act=b.dataset.ex;if(act==='level'){level=+b.dataset.level;setView(focusView())}else if(act==='exercise')exercise(+b.dataset.index);else if(act==='strength-detail')detail(b.dataset.name);else if(act==='strength')start('strength',b.dataset.equipment);else if(['pre','meditation','express'].includes(act))start(act);else if(act==='reaction-game'){window.RitmoPerformance?.openReactionGame()}else if(act==='start-single')start('single');else if(act==='close'){stopTimer();session=null;document.getElementById('editor-dialog')?.close()}else if(act==='toggle'){if(!session)return;if(run){tick();if(!session)return;stopTimer()}else{run=true;deadline=Date.now()-elapsed*1000;interval=setInterval(tick,250)}updateTimer()}else if(act==='skip'){if(!session)return;let st=getStep();if(st){session.skipped+=st.remaining;elapsed=st.offset+st.b.seconds;if(elapsed>=session.duration){complete();return}if(run)deadline=Date.now()-elapsed*1000;updateTimer()}}else if(act==='reset'){if(!session)return;stopTimer();elapsed=0;session.skipped=0;updateTimer();}});
document.addEventListener('change',e=>{if(e.target.id==='extras-equipment'){equipment=e.target.value;setView(strengthView())}if(e.target.id==='extras-area'){area=e.target.value;setView(strengthView())}});
document.addEventListener('ritmo:dialog-replaced',()=>{stopTimer();session=null;});
document.getElementById('editor-dialog')?.addEventListener('cancel',()=>{stopTimer();session=null;});
document.getElementById('editor-dialog')?.addEventListener('close',()=>{stopTimer();session=null;});
window.RitmoExtras={strengthView,focusView,parseFoods};
})();
