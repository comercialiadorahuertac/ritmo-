/* RITMO / RETAS — módulo social separado del registro de salud. */
(() => {
 'use strict';
 const KEY='ritmo-retas-v2';
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const uid=()=>crypto.randomUUID?crypto.randomUUID().replace(/-/g,'').slice(0,18):String(Date.now())+Math.random().toString(36).slice(2,12);
 const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
 const sport={tenis:'Tenis',padel:'Pádel',pickleball:'Pickleball'};
 const emot={tenis:'🎾',padel:'🎾',pickleball:'🏓'};
 const read=()=>{try{let x=JSON.parse(localStorage.getItem(KEY));return x?.version===2?x:{version:2,api:'',matches:[],invite:null}}catch{return {version:2,api:'',matches:[],invite:null}}};
 const store=read();
 if(!store.api && window.RITMO_CONFIG?.workerUrl)store.api=window.RITMO_CONFIG.workerUrl.replace(/\/$/,'');
 let selected=null,filter='proximas',busy=false,poll=null,originSportId=null;
 let deepLink=new URL(location.href);
 const deepApi=deepLink.searchParams.get('api');
 if(deepApi && /^https:\/\/[a-z0-9.-]+(?:\/)?$/i.test(deepApi))store.api=deepApi.replace(/\/$/,'');
 selected=deepLink.searchParams.get('match');
 function snapshotDecode(encoded){try{const bytes=Uint8Array.from(atob(encoded.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));return JSON.parse(new TextDecoder().decode(bytes))}catch{return null}}
 function snapshotEncode(match){const safe=publicData(match);const bytes=new TextEncoder().encode(JSON.stringify(safe));let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
 function publicData(match){const {hostKey,localOnly,ownerAuthenticated,inviteOnly, ...safe}=match;return safe}
 if(deepLink.searchParams.get('inv')){
   const incoming=snapshotDecode(deepLink.searchParams.get('inv'));
   if(incoming && sport[incoming.sport] && Array.isArray(incoming.teams) && incoming.date && incoming.format){
    incoming.id=incoming.id||uid(); incoming.localOnly=true;incoming.inviteOnly=true;incoming.version=1;
    if(!store.matches.some(x=>x.id===incoming.id))store.matches.unshift(incoming);
    selected=incoming.id;store.invite=incoming.id;
   }
 }
 persist();
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(store))}catch(e){notify('Sin espacio para guardar retas')}}
 function notify(s){const el=document.getElementById('toast');if(el){el.textContent=s;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3200)}else alert(s)}
 function modal(content){const d=document.getElementById('reta-dialog');d.querySelector('#reta-dialog-content').innerHTML=content;d.showModal()}
 function close(){document.getElementById('reta-dialog').close()}
 function errorString(e){return e?.message||'No se pudo conectar'}
 function card(match){
   const full=(match.teams||[]).every(a=>a.length >= (match.format==='singles'?1:2));
   const status=match.status==='finalizado'?'Finalizado':match.status==='jugando'?'En juego':match.mode==='abierta'&&!full?'Reta abierta':'Programado';
   const badge=match.mode==='abierta'&&!full?'open':match.status==='finalizado'?'done':'';
   return `<button type="button" class="reta-card" data-reta="open" data-id="${escape(match.id)}"><div class="reta-card-top"><span class="reta-sport">${emot[match.sport]||'🎾'} ${escape(sport[match.sport]||match.sport)} · ${match.format==='singles'?'Singles':'Dobles'}</span><span class="reta-pill ${badge}">${status}</span></div><div class="reta-card-players"><span>${escape((match.teams?.[0]||[]).join(' · ')||'Equipo A')}</span><small>VS</small><span>${escape((match.teams?.[1]||[]).join(' · ')||'Rivales por definir')}</span></div><div class="reta-card-bottom"><span>◷ ${escape(match.date)} · ${escape(match.time)}</span><span>${escape(match.place||'Sede por definir')}</span></div></button>`;
 }
 function main(){
   const list=[...store.matches].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
   const upcoming=list.filter(x=>x.status!=='finalizado');const finished=list.filter(x=>x.status==='finalizado');
   const visible=filter==='proximas'?upcoming:filter==='finalizadas'?finished:list;
   const cloud=!!store.api;
   return `<div class="reta-header"><span class="section-label">RITMO CLUB / TU CANCHA</span><h1 class="page-title">El juego sigue aquí<span class="lime-dot">.</span></h1><p class="page-subtitle">Arma partidos, reta a tus amigos y lleva el marcador. Todo en un enlace.</p></div>
    <section class="reta-hero"><div class="reta-hero-intro"><div class="reta-hero-kicker">TU SIGUIENTE RETA</div><h2>${upcoming.length?'Hay juego pendiente.':'¿Quién se apunta?'}</h2><p>${upcoming.length?`${upcoming.length} ${upcoming.length===1?'partido por jugar':'partidos por jugar'}. Organiza a tus rivales y comparte la invitación.`:'Crea una reta de tenis, pádel o pickleball y pasa el link al grupo.'}</p><button class="reta-cta" data-reta="create">+ Crear nueva reta</button></div><div class="reta-hero-art" aria-hidden="true"><span class="reta-court-mid"></span><span class="reta-ball"></span></div></section>
    <div class="reta-stats"><div><b>${list.length}</b><small>Partidos</small></div><div><b>${upcoming.length}</b><small>Próximos</small></div><div><b>${finished.length}</b><small>Jugados</small></div></div>
    <div class="reta-section-head"><div><h2>Mis partidos</h2><p>Invitaciones y marcadores</p></div><button type="button" data-reta="configuration" class="reta-connection ${cloud?'online':''}">${cloud?'● En línea':'○ Modo local'}</button></div>
    <div class="account-callout"><span>Jugadores, estadísticas e invitaciones privadas</span><button type="button" data-reta="account">Mi perfil →</button></div>
    <div class="reta-filterbar"><button class="${filter==='proximas'?'active':''}" data-reta="filter" data-filter="proximas">Próximos</button><button class="${filter==='finalizadas'?'active':''}" data-reta="filter" data-filter="finalizadas">Jugados</button><button class="${filter==='todos'?'active':''}" data-reta="filter" data-filter="todos">Todos</button></div>
    <div class="reta-list">${visible.length?visible.map(card).join(''):`<div class="reta-empty"><div class="reta-empty-icon">🎾</div><strong>Todavía no hay partidos aquí</strong><p>Crea una reta y tendrás equipos, rivales, fecha y marcador en un mismo lugar.</p><button class="btn btn-soft" data-reta="create">Crear partido</button></div>`}</div>
    <div class="reta-info"><strong>${cloud?'Partidos conectados':'Versión de prueba sin nube'}</strong><p>${cloud?'Los partidos nuevos se comparten entre teléfonos. El marcador se actualiza al abrir el enlace o refrescar esta pantalla.':'Puedes crear partidos y compartir invitaciones con los datos del encuentro. Para que tus amigos se inscriban y vean el marcador actualizado en vivo, activa la conexión a Cloudflare.'}</p><button data-reta="configuration">${cloud?'Ver conexión':'Activar partidos compartidos'} →</button></div>`;
 }
 function getSelected(){return store.matches.find(m=>m.id===selected)}
 function detail(match){
   const cap=match.format==='singles'?1:2,host=!match.inviteOnly && (!!match.hostKey||match.localOnly||match.ownerAuthenticated),cloud=!match.localOnly;
   const open=match.mode==='abierta' && match.status!=='finalizado';
   const num=(match.teams||[]).reduce((a,t)=>a+t.length,0);
   const label=match.sport==='pickleball'?'Juego':'Set';
   return `<div class="reta-detail"><button class="reta-back" data-reta="back">← Volver a las retas</button><div class="reta-detail-head"><span class="section-label">${escape(sport[match.sport])} / ${match.format==='singles'?'SINGLES':'DOBLES'}</span><h1 class="page-title">${match.mode==='abierta'?'Reta abierta':'Partido privado'}<span class="lime-dot">.</span></h1><p class="page-subtitle">${escape(match.date)} · ${escape(match.time)} ${match.place?'· '+escape(match.place):''}</p></div>
   <div class="scoreboard"><div class="score-head"><span>MARCADOR OFICIAL</span><span class="score-status">${match.status==='finalizado'?'FINALIZADO':match.status==='jugando'?'● EN JUEGO':'PRÓXIMAMENTE'}</span></div>
    <div class="score-teams"><div class="score-team"><span class="team-label">EQUIPO A</span>${match.teams[0].length?match.teams[0].map(n=>`<strong>${escape(n)}</strong>`).join(''):'<span>Por confirmar</span>'}</div><span class="vs-badge">VS</span><div class="score-team right"><span class="team-label">EQUIPO B</span>${match.teams[1].length?match.teams[1].map(n=>`<strong>${escape(n)}</strong>`).join(''):'<span>Por confirmar</span>'}</div></div>
    <div class="sets"><div class="sets-titles"><span>Equipo A</span><span>${label}</span><span>Equipo B</span></div>${match.sets?.length?match.sets.map((s,i)=>`<div class="set-line"><strong>${s.a}</strong><span>${label} ${i+1}</span><strong>${s.b}</strong></div>`).join(''):'<div class="sets-placeholder">Aún no hay marcador registrado</div>'}</div></div>
   ${match.note?`<p class="reta-comment">${escape(match.note)}</p>`:''}
   <div class="reta-actions"><button class="btn" data-reta="share" data-id="${escape(match.id)}">↗ Compartir invitación</button>${host?`<button class="btn btn-outline" data-reta="edit" data-id="${escape(match.id)}">✎ Editar / marcador</button>`:''}${host&&cloud?`<button class="btn btn-soft" data-reta="invite-player">＋ Invitar jugador registrado</button>`:''}${cloud?`<button class="btn btn-soft" data-reta="refresh">↻ Actualizar</button>`:''}</div>
   <div class="reta-roster"><div class="reta-section-head"><div><h2>Jugadores</h2><p>${num} de ${cap*2} lugares</p></div><span class="reta-pill ${open?'open':''}">${open?'Inscripción abierta':'Lista de jugadores'}</span></div>
    <div class="reta-roster-cells">${[0,1].map(i=>`<div class="reta-roster-side"><b>Equipo ${i===0?'A':'B'}</b>${Array.from({length:cap},(_,j)=>`<div class="reta-slot"><span>${escape(match.teams[i][j]||'Lugar disponible')}</span>${!match.teams[i][j]?'<span class="slot-plus">+</span>':''}</div>`).join('')}</div>`).join('')}</div>
    ${open&&!host?`<form id="reta-join-form" data-match="${escape(match.id)}"><div class="field"><label>Apúntate a esta reta</label><input name="name" maxlength="40" placeholder="Tu nombre" required></div><div class="field"><label>Equipo</label><select name="team"><option value="0">Equipo A</option><option value="1">Equipo B</option></select></div><button class="btn full" type="submit" ${busy?'disabled':''}>Confirmar mi lugar</button></form>`:''}
    ${open&&host?'<p class="form-note">Comparte el enlace para que otros jugadores se inscriban en los espacios libres.</p>':''}
    ${match.inviteOnly?'<p class="form-note">Esta invitación es una copia local. El marcador no se sincroniza entre teléfonos hasta conectar Cloudflare.</p>':''}</div>
   ${match.localOnly&&!match.inviteOnly?'<div class="reta-info"><strong>Este partido está guardado en tu celular</strong><p>El enlace comparte una fotografía de la invitación, no un marcador sincronizado. Para las próximas retas activa el servidor en la configuración.</p></div>':''}</div>`;
 }
 function render(){const match=getSelected();return match?detail(match):main()}
 function syncRender(){const app=document.getElementById('view');const nav=document.querySelector('.nav-link.is-active');if(app&&nav?.dataset.tab==='retas')app.innerHTML=render();startPoll()}
 function startPoll(){clearInterval(poll);if(selected&&store.api&&getSelected()&&!getSelected().localOnly)poll=setInterval(()=>{if(!document.hidden)refresh(true)},18000)}
 async function api(path,opt={}){
   if(!store.api)throw new Error('Conecta el servidor de Cloudflare primero');
   const access=await window.RitmoAuth?.token?.();
   const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);let res;try{res=await fetch(store.api+path,{...opt,headers:{'Content-Type':'application/json',...(access?{Authorization:'Bearer '+access}:{}),...opt.headers},signal:controller.signal})}finally{clearTimeout(timer)}
   let x;try{x=await res.json()}catch{throw new Error('El servidor devolvió una respuesta inválida')}
   if(!res.ok)throw new Error(x.error||`Error ${res.status}`);
   return x;
 }
 function upsert(match){const i=store.matches.findIndex(x=>x.id===match.id);if(i<0)store.matches.unshift(match);else store.matches[i]={...store.matches[i],...match};persist()}
 async function refresh(quiet=false){const m=getSelected();if(!m||m.localOnly)return;try{const r=await api('/api/matches/'+m.id);const prev=Number(m.version||0);upsert(r.match);if(!quiet||Number(r.match.version)!==prev)syncRender();if(!quiet)notify('Marcador actualizado')}catch(e){if(!quiet)notify(errorString(e))}}
 async function loadCloudMatches(){
  if(!store.api||!window.RitmoAuth?.token||!await window.RitmoAuth.token())return;
  try{const result=await window.RitmoAuth.api('/api/my-matches');for(const m of result.matches||[])upsert({...m,localOnly:false,inviteOnly:false});syncRender()}catch(e){/* La beta puede no estar configurada; retas previas siguen funcionando. */}
 }
 function labels(s){return `<option value="${s}">${sport[s]}</option>`}
 function createForm(){const date=today();return `<div class="reta-modal-top"><div><span class="section-label">NUEVA RETA</span><h2>Arma el partido.</h2></div><button data-reta="dismiss" class="reta-x">×</button></div>
    <form id="reta-create-form"><div class="field"><label>Deporte</label><select name="sport">${Object.keys(sport).map(labels).join('')}</select></div>
    <div class="fields-2"><div class="field"><label>Modalidad</label><select name="format" id="reta-format"><option value="dobles">Dobles · 2 vs 2</option><option value="singles">Singles · 1 vs 1</option></select></div><div class="field"><label>Tipo</label><select name="mode"><option value="privada">Invitación privada</option><option value="abierta">Reta abierta</option></select></div></div>
    <div class="fields-2"><div class="field"><label>Fecha</label><input name="date" type="date" value="${date}" required></div><div class="field"><label>Hora</label><input name="time" type="time" value="19:00" required></div></div>
    <div class="field"><label>Club / lugar</label><input name="place" maxlength="120" placeholder="Ej. Club de Coapa"></div>
    <div class="reta-form-teams"><div><strong>Equipo A</strong><input name="a1" placeholder="Tu nombre" value="${escape(window.RitmoAuth?.getName?.()||'')}" maxlength="40" required><input name="a2" class="double-player" placeholder="Compañero (opcional)" maxlength="40"></div><div><strong>Equipo B · Rivales</strong><input name="b1" placeholder="Rival 1 (opcional)" maxlength="40"><input name="b2" class="double-player" placeholder="Rival 2 (opcional)" maxlength="40"></div></div>
    <div class="field"><label>Nota (opcional)</label><textarea name="note" rows="2" maxlength="220" placeholder="Pelotas nuevas, apuesta amistosa, nivel, etc."></textarea></div>
    <p class="form-note">${store.api?'En línea: tus amigos podrán abrir el enlace y ver el marcador actualizado.':'Modo local: puedes compartir la invitación, pero no habrá inscripción ni marcador sincronizado entre celulares hasta conectar Cloudflare.'}</p>
    <button class="btn full" ${busy?'disabled':''} type="submit">Crear partido y preparar enlace</button></form>`}
 function editForm(m){const cap=m.format==='dobles';return `<div class="reta-modal-top"><div><span class="section-label">ORGANIZADOR</span><h2>Editar partido.</h2></div><button class="reta-x" data-reta="dismiss">×</button></div><form id="reta-edit-form" data-id="${escape(m.id)}"><div class="fields-2"><div class="field"><label>Estado</label><select name="status"><option value="programado" ${m.status==='programado'?'selected':''}>Programado</option><option value="jugando" ${m.status==='jugando'?'selected':''}>En juego</option><option value="finalizado" ${m.status==='finalizado'?'selected':''}>Finalizado</option></select></div><div class="field"><label>Hora</label><input name="time" type="time" value="${escape(m.time)}" required></div></div><div class="field"><label>Club / lugar</label><input name="place" maxlength="120" value="${escape(m.place)}"></div><div class="reta-form-teams"><div><strong>Equipo A</strong><input name="a1" placeholder="Jugador 1" value="${escape(m.teams[0][0]||'')}" required><input name="a2" ${cap?'':'hidden'} placeholder="Jugador 2" value="${escape(m.teams[0][1]||'')}"></div><div><strong>Equipo B</strong><input name="b1" placeholder="Rival 1" value="${escape(m.teams[1][0]||'')}"><input name="b2" ${cap?'':'hidden'} placeholder="Rival 2" value="${escape(m.teams[1][1]||'')}"></div></div><div class="reta-section-head"><div><h2>Marcador</h2><p>${m.sport==='pickleball'?'Puntos por juego':'Juegos por set'} · hasta 5</p></div></div><div class="reta-form-scores">${Array.from({length:5},(_,i)=>{const s=m.sets?.[i];return `<div class="score-edit-row"><span>${m.sport==='pickleball'?'Juego':'Set'} ${i+1}</span><input type="number" inputmode="numeric" min="0" max="99" name="seta${i}" placeholder="A" value="${s?.a??''}"><span>–</span><input type="number" inputmode="numeric" min="0" max="99" name="setb${i}" placeholder="B" value="${s?.b??''}"></div>`}).join('')}</div><p class="form-note">Anota solo los sets o juegos terminados. Los demás se dejan en blanco.</p><button type="submit" class="btn full">Guardar marcador y jugadores</button></form>`}
 function configForm(){return `<div class="reta-modal-top"><div><span class="section-label">PARTIDOS COMPARTIDOS</span><h2>Conectar Cloudflare.</h2></div><button class="reta-x" data-reta="dismiss">×</button></div><div class="reta-info"><strong>¿Por qué necesitamos esto?</strong><p>Para que los amigos vean el mismo partido y marcador en sus teléfonos, la app necesita una base de datos. Las comidas y medidas personales permanecerán solo en tu celular.</p></div><form id="reta-config-form"><div class="field"><label>Dirección de tu Cloudflare Worker</label><input name="api" type="url" value="${escape(store.api)}" placeholder="https://ritmo-retas.tuusuario.workers.dev" required></div><p class="form-note">Tienes que crear una base D1 y publicar el archivo backend/worker.js (instrucciones dentro del ZIP). Al guardar comprobaremos la conexión.</p><button type="submit" class="btn full">Probar y activar conexión</button></form>${store.api?'<button class="btn btn-outline full" style="margin-top:10px" data-reta="disconnect">Usar solo modo local</button>':''}<div class="reta-section-head"><h2>Respaldo de retas</h2></div><p class="form-note">Conserva tu copia de organizador en privado; permite modificar los marcadores.</p><div class="button-row"><button class="btn btn-soft" data-reta="backup">Exportar</button><button class="btn btn-outline" data-reta="restore">Importar</button></div><input type="file" id="reta-restore-input" accept=".json,application/json" hidden>`}
 async function share(match){const link=buildLink(match);const text=`🎾 ${sport[match.sport]} ${match.format==='singles'?'singles':'dobles'} · ${match.date} ${match.time}\n${match.teams[0].join(' y ')} VS ${match.teams[1].join(' y ')||'rivales por confirmar'}${match.place?'\n📍 '+match.place:''}\nÚnete desde Ritmo: ${link}${match.localOnly?'\nNota: invitación sin marcador sincronizado.':''}`;
   if(navigator.share){try{await navigator.share({title:'Ritmo · Invitación al partido',text,url:link});return}catch(e){if(e?.name==='AbortError')return}}
   try{await navigator.clipboard.writeText(text);notify('Invitación copiada. Pégala en WhatsApp.');return}catch{}
   modal(`<div class="reta-modal-top"><h2>Comparte con tus amigos</h2><button class="reta-x" data-reta="dismiss">×</button></div><textarea rows="8" class="message-copy" readonly>${escape(text)}</textarea>`)
 }
 function buildLink(m){const url=new URL(location.pathname,location.origin);if(m.localOnly)url.searchParams.set('inv',snapshotEncode(m));else{url.searchParams.set('match',m.id);url.searchParams.set('api',store.api)}return url.href}
 function renderOrRoute(){syncRender();if(window.RitmoNavigate)window.RitmoNavigate('retas')}
 async function loadLinked(){if(!selected||!store.api)return;try{const result=await api('/api/matches/'+selected);upsert(result.match);renderOrRoute()}catch(e){notify('No se pudo abrir la invitación: '+errorString(e));selected=null;renderOrRoute()}}
 if(selected && !getSelected() && store.api) setTimeout(loadLinked,150);
 document.addEventListener('click',async e=>{
  const node=e.target.closest('[data-reta]');if(!node)return;e.preventDefault();const act=node.dataset.reta;
  try{
   if(act==='account'){return window.RitmoAuth?.open?.()}
   if(act==='invite-player'){const m=getSelected();if(m&&!m.localOnly)return window.RitmoAuth?.showInvite?.(m.id,m.hostKey||'')}
   if(act==='create'){originSportId=null;return modal(createForm())}
   if(act==='dismiss')return close();
   if(act==='configuration')return modal(configForm());
   if(act==='backup'){const blob=new Blob([JSON.stringify(store,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='ritmo-retas-respaldo.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);return notify('Respaldo privado descargado')}
   if(act==='restore')return document.getElementById('reta-restore-input')?.click();
   if(act==='disconnect'){store.api='';persist();close();syncRender();return notify('Modo local activado')}
   if(act==='filter'){filter=node.dataset.filter;return syncRender()}
   if(act==='open'){selected=node.dataset.id;syncRender();const m=getSelected();if(m&&!m.localOnly)await refresh(true);return}
   if(act==='back'){selected=null;syncRender();return}
   if(act==='edit'){const m=getSelected();if(m&&(m.hostKey||m.ownerAuthenticated||m.localOnly&&!m.inviteOnly))return modal(editForm(m))}
   if(act==='share'){const m=store.matches.find(x=>x.id===node.dataset.id);if(m)return share(m)}
   if(act==='refresh')return refresh();
  }catch(err){notify(errorString(err))}
 });
 document.addEventListener('change',async e=>{
   if(e.target.id==='reta-restore-input'){try{const file=e.target.files?.[0];if(!file)return;if(file.size>2000000)throw new Error('Archivo demasiado grande');const raw=JSON.parse(await file.text());if(raw.version!==2||!Array.isArray(raw.matches)||raw.matches.length>2000)throw new Error('No es un respaldo de retas válido');if(!confirm('¿Importar partidos desde este respaldo a tu teléfono?'))return;for(const m of raw.matches){if(m?.id&&sport[m.sport]&&Array.isArray(m.teams))upsert(m)}notify('Retas restauradas');close();selected=null;syncRender();}catch(err){notify(errorString(err))}finally{e.target.value=''}return}
   if(e.target.id==='reta-format'){document.querySelectorAll('#reta-create-form .double-player').forEach(x=>x.hidden=e.target.value==='singles')}
 });
 document.addEventListener('submit',async event=>{
  const f=event.target;if(!['reta-create-form','reta-edit-form','reta-config-form','reta-join-form'].includes(f.id))return;event.preventDefault();
  if(busy)return;busy=true;const fd=new FormData(f);
  try{
   if(f.id==='reta-config-form'){
    const url=String(fd.get('api')||'').trim().replace(/\/$/,'');if(!/^https:\/\/[a-z0-9.-]+(?::443)?$/i.test(url))throw new Error('Introduce una dirección HTTPS válida sin ruta');
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),9000);let r;try{r=await fetch(url+'/api/health',{signal:controller.signal})}finally{clearTimeout(timer)}const x=await r.json();if(!r.ok||!x.ok)throw new Error('La API de Cloudflare no responde correctamente');store.api=url;persist();close();syncRender();notify('Conexión activa. Las nuevas retas se compartirán.');return;
   }
   if(f.id==='reta-create-form'){
    const fmt=String(fd.get('format'));const cap=fmt==='singles'?1:2;
    const team=i=>[fd.get(i+'1'),...(cap===2?[fd.get(i+'2')]:[])].map(x=>String(x||'').trim().slice(0,40)).filter(Boolean);
    const match={sport:String(fd.get('sport')),format:fmt,mode:String(fd.get('mode')),date:String(fd.get('date')),time:String(fd.get('time')),place:String(fd.get('place')||'').slice(0,120),teams:[team('a'),team('b')],sets:[],status:'programado',note:String(fd.get('note')||'').slice(0,220)};
    if(!match.teams[0].length)throw new Error('Agrega al menos tu nombre');
    let saved;
    if(store.api){const result=await api('/api/matches',{method:'POST',body:JSON.stringify(match)});saved={...result.match,hostKey:result.hostKey,ownerAuthenticated:!!(await window.RitmoAuth?.token?.()),localOnly:false};}
    else saved={...match,id:uid(),version:1,localOnly:true,inviteOnly:false};
    upsert(saved);selected=saved.id;close();renderOrRoute();notify('Partido creado. Ya puedes invitar a tus rivales.');
    if(window.RitmoAddSportMatch && !originSportId)window.RitmoAddSportMatch(saved);originSportId=null;
    return;
   }
   if(f.id==='reta-edit-form'){
    const m=getSelected();if(!m||m.inviteOnly)throw new Error('Sin permiso para editar');const cap=m.format==='singles'?1:2;
    const teams=['a','b'].map(i=>[fd.get(i+'1'),...(cap===2?[fd.get(i+'2')]:[])].map(x=>String(x||'').trim().slice(0,40)).filter(Boolean));
    const sets=[];for(let i=0;i<5;i++){const a=String(fd.get('seta'+i)||''),b=String(fd.get('setb'+i)||'');if(a!==''&&b!==''){const na=Number(a),nb=Number(b);if(!Number.isInteger(na)||!Number.isInteger(nb)||na<0||nb<0||na>99||nb>99)throw new Error('Revisa los marcadores');sets.push({a:na,b:nb})}else if(a!==''||b!=='')throw new Error('Completa ambos marcadores del set o deja los dos vacíos')}
    const next={...publicData(m),teams,sets,status:String(fd.get('status')),time:String(fd.get('time')),place:String(fd.get('place')).slice(0,120)};
    if(m.localOnly)upsert({...m,...next});else{const result=await api('/api/matches/'+m.id,{method:'PATCH',headers:{'X-Host-Key':m.hostKey},body:JSON.stringify({version:m.version,match:next})});upsert({...result.match,hostKey:m.hostKey,localOnly:false})}
    close();syncRender();notify('Partido y marcador guardados');return;
   }
   if(f.id==='reta-join-form'){
    const m=getSelected();if(!m||m.localOnly)throw new Error('Esta invitación es solo una copia; no admite inscripciones en línea');
    const result=await api('/api/matches/'+m.id+'/join',{method:'POST',body:JSON.stringify({name:String(fd.get('name')),team:Number(fd.get('team'))})});upsert(result.match);syncRender();notify('Listo, apareces en la lista de jugadores');return;
   }
  }catch(e){notify(errorString(e))}finally{busy=false}
 });
 document.getElementById('reta-dialog').addEventListener('click',e=>{if(e.target.id==='reta-dialog')close()});
 window.Retas={render,loadCloudMatches, hasDeepLink:()=>Boolean(deepLink.searchParams.get('match')||deepLink.searchParams.get('inv')), refresh, startPoll, openCreate:()=>{originSportId=null;modal(createForm())},fromSport:(s,date)=>{originSportId=s.id;modal(createForm());const f=document.getElementById('reta-create-form');if(!f)return;f.elements.sport.value=s.type;f.elements.date.value=date;f.elements.time.value=s.time||'19:00';const names=String(s.rivals||'').split(/[,;]+/).map(x=>x.trim()).filter(Boolean);f.elements.b1.value=names[0]||'';f.elements.b2.value=names[1]||'';}};
})();
