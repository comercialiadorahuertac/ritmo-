/* RITMO CLUB 3.0 — UI de cuenta y perfiles, sin tocar datos personales de salud */
(()=>{'use strict';
 const cfg=window.RITMO_CONFIG||{}, esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let configured=false,db=null,initPromise=null;
 async function init(){
  if(initPromise)return initPromise;
  initPromise=(async()=>{
   let url=cfg.supabaseUrl||'',key=cfg.supabaseAnonKey||'';
   if(!url||!key){
    try{const res=await fetch(worker().replace(/\/$/,'')+'/api/config');if(res.ok){const x=await res.json();url=x.supabaseUrl||'';key=x.supabaseAnonKey||''}}catch(e){}
   }
   configured=/^https:\/\/[\w-]+\.supabase\.co\/?$/.test(url)&&!!key&&!!window.supabase?.createClient;
   if(configured){db=window.supabase.createClient(url,key,{auth:{flowType:'pkce',detectSessionInUrl:true,autoRefreshToken:true,persistSession:true}});
    db.auth.onAuthStateChange(()=>{setTimeout(async()=>{await sync();if(dialog.open)render()},50)});
   }
  })();return initPromise;
 }
 
 const dialog=document.getElementById('account-dialog');let me=null,busy=false,all=[],received=[],stats=null;
 function worker(){try{const local=JSON.parse(localStorage.getItem('ritmo-retas-v2')||'{}');return local.api||cfg.workerUrl||''}catch{return cfg.workerUrl||''}}
 function message(s){const t=document.getElementById('toast');if(t){t.textContent=s;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3600)}else alert(s)}
 async function token(){await init();if(!db)return '';const {data}=await db.auth.getSession();return data.session?.access_token||''}
 function player(row){return {id:row.id,name:row.display_name||'Jugador',sports:Array.isArray(row.favorite_sports)?row.favorite_sports:[],avatar_url:row.avatar_url||null};}
 async function currentUser(){await init();if(!db)throw new Error('No se pudo conectar con Google. Revisa tu conexión y vuelve a intentar.');const {data,error}=await db.auth.getUser();if(error||!data.user)throw new Error('Vuelve a iniciar sesión con Google');return data.user;}
 async function profileApi(path,opts){const user=await currentUser();
  if(path==='/api/me'){
   if(opts.method==='PATCH'){const value=JSON.parse(opts.body||'{}'),name=String(value.name||'').trim();if(name.length<2||name.length>45)throw new Error('Usa un nombre de 2 a 45 caracteres');const sports=Array.isArray(value.sports)?[...new Set(value.sports)].filter(s=>['tenis','padel','pickleball'].includes(s)):[];const {data,error}=await db.from('profiles').update({display_name:name,favorite_sports:sports}).eq('id',user.id).select('id,display_name,favorite_sports,avatar_url').single();if(error)throw error;return {profile:player(data)};}
   let {data,error}=await db.from('profiles').select('id,display_name,favorite_sports,avatar_url').eq('id',user.id).maybeSingle();if(error)throw error;
   if(!data){const initial={id:user.id,display_name:String(user.user_metadata?.full_name||user.user_metadata?.name||'Jugador').trim().slice(0,45)||'Jugador',favorite_sports:[]};const result=await db.from('profiles').upsert(initial,{onConflict:'id',ignoreDuplicates:true}).select('id,display_name,favorite_sports,avatar_url').maybeSingle();if(result.error)throw result.error;data=result.data;if(!data){const again=await db.from('profiles').select('id,display_name,favorite_sports,avatar_url').eq('id',user.id).single();if(again.error)throw again.error;data=again.data;}}
   return {profile:player(data)};
  }
  if(path==='/api/players'){const {data,error}=await db.from('profiles').select('id,display_name,favorite_sports,avatar_url').neq('id',user.id).order('created_at',{ascending:true}).limit(100);if(error)throw error;return {players:(data||[]).map(player)};}
  throw new Error('Comparte por ahora el enlace de la reta con tu amigo. Las invitaciones entre cuentas siguen pendientes de activar.');
 }
 async function api(path,opts={}){if(cfg.directProfiles&&['/api/me','/api/players'].includes(path))return profileApi(path,opts);const access=await token();if(!access)throw new Error('Primero inicia sesión con Google');const url=worker();if(!url)throw new Error('Falta la conexión con Cloudflare');const r=await fetch(url+path,{...opts,headers:{'Content-Type':'application/json',Authorization:'Bearer '+access,...opts.headers}});const x=await r.json().catch(()=>({}));if(!r.ok)throw new Error(x.error||'Error al conectar la cuenta');return x}
 async function sync(){if(!await token()){me=null;all=[];received=[];stats=null;updateHeader();return false}
  try{const result=await api('/api/me');me=result.profile;
   const [p,i,s]=await Promise.all([api('/api/players'),cfg.directProfiles?Promise.resolve({invitations:[]}):api('/api/invitations'),cfg.directProfiles?Promise.resolve({stats:null}):api('/api/stats/me')]);
   all=p.players||[];received=i.invitations||[];stats=s.stats;updateHeader();if(!cfg.directProfiles)window.Retas?.loadCloudMatches?.();const pending=sessionStorage.getItem('ritmo-return-invite');if(pending){sessionStorage.removeItem('ritmo-return-invite');location.replace(pending);return true}return true;
  }catch(err){message(err.message);updateHeader();return false}
 }
 function updateHeader(){const el=document.getElementById('club-account-btn');if(!el)return;el.textContent=me?('◉ '+me.name.split(' ')[0]):'Mi cuenta';el.classList.toggle('is-signed-in',!!me);el.title=me?`Perfil de ${me.name}`:'Registrarme con Google'}
 async function open(){dialog.showModal();dialog.querySelector('#account-content').innerHTML='<div class="account-loading">Cargando tu perfil…</div>';await init();if(db)await sync();render()}
 function render(){const el=document.getElementById('account-content');if(!el)return;
  const header='<div class="account-header"><div><span class="section-label">RITMO CLUB</span><h2>Tu cuenta deportiva<span class="lime-dot">.</span></h2></div><button type="button" class="reta-x" data-account="close" aria-label="Cerrar">×</button></div>';
  if(!configured){el.innerHTML=header+'<div class="account-intro"><strong>Inicio con Google listo para configurar</strong><p>La interfaz ya está instalada, pero el administrador debe activar Google en Supabase y configurar las variables públicas SUPABASE_URL y SUPABASE_ANON_KEY del Worker. Hasta entonces, las retas y marcadores anteriores siguen funcionando.</p></div>';return}
  if(!me){el.innerHTML=header+'<div class="account-intro"><strong>Bienvenido a Ritmo Club</strong><p>Entra con Google para crear tu perfil deportivo y encontrar a tus amigos. Comparte los enlaces de tus retas para jugar juntos.</p><button class="google-login" data-account="google" type="button"><span class="google-g">G</span> Continuar con Google</button><p class="account-note">Tus calorías, comidas, peso y cintura permanecen únicamente en este dispositivo.</p></div>';return}
  const pending=received.filter(x=>x.status==='pending');
  el.innerHTML=header+`<div class="account-identity"><div class="account-avatar">${esc(me.name.slice(0,1).toUpperCase())}</div><div><strong>${esc(me.name)}</strong><small>Jugador de Ritmo · Perfil ${esc(me.id.slice(0,8))}</small></div></div>
  ${cfg.directProfiles?'<div class="account-intro"><strong>Tu perfil está conectado</strong><p>Comparte el enlace de tus retas con tus amigos para jugar juntos. Tus comidas y medidas siguen guardadas en este dispositivo.</p></div>':`<div class="account-stat-grid"><div><b>${stats?.played??0}</b><span>Jugados</span></div><div><b>${stats?.wins??0}</b><span>Ganados</span></div><div><b>${stats?.winRate??0}%</b><span>Victorias</span></div></div>`}
  <div class="account-section"><h3>Mis datos deportivos</h3><form id="account-profile-form"><div class="field"><label>Nombre que verán los amigos</label><input name="name" minlength="2" maxlength="45" required value="${esc(me.name)}"></div><div class="field"><label>Deportes favoritos</label><div class="sport-select-grid">${[['tenis','Tenis'],['padel','Pádel'],['pickleball','Pickleball']].map(([id,label])=>`<label class="sport-pill"><input name="sports" type="checkbox" value="${id}" ${me.sports.includes(id)?'checked':''}><span>${label}</span></label>`).join('')}</div></div><button class="btn full" type="submit">Guardar perfil</button></form></div>
  ${cfg.directProfiles?'':`<div class="account-section"><h3>Invitaciones <span class="counter">${pending.length} pendientes</span></h3>${pending.length?pending.map(i=>`<div class="invite-item"><div><strong>${esc(i.match.sport)} · ${i.match.format==='dobles'?'Dobles':'Singles'}</strong><small>${esc(i.sender)} te invita · ${esc(i.match.date)} · ${esc(i.match.time)} · Equipo ${i.team?'B':'A'}</small></div><div class="invite-buttons"><button class="btn btn-soft" data-account="answer" data-id="${esc(i.id)}" data-answer="accept">Aceptar</button><button class="btn btn-outline" data-account="answer" data-id="${esc(i.id)}" data-answer="decline">Rechazar</button></div></div>`).join(''):'<p class="empty-note">No tienes invitaciones pendientes. Pide que te inviten desde un partido.</p>'}<button class="btn btn-outline full account-refresh" data-account="refresh">↻ Actualizar invitaciones</button></div>`}
  <div class="account-section"><h3>Jugadores de Ritmo <span class="counter">${all.length+1}</span></h3><div class="people-mini">${all.length?all.slice(0,100).map(p=>`<div><span>${esc(p.name)}</span><small>${p.sports.map(s=>esc(s)).join(' · ')||'Deportes por definir'}</small></div>`).join(''):'<p class="empty-note">Todavía no se ha registrado otro jugador.</p>'}</div><p class="account-note">${cfg.directProfiles?'Para jugar juntos, comparte el enlace desde Retas.':'Para invitar a alguien, abre una reta de la que seas organizador y pulsa «Invitar jugador». '}</p></div>
  <button class="btn btn-outline full signout-btn" data-account="logout">Cerrar sesión</button><p class="account-note">${cfg.directProfiles?'Tu nombre y deportes favoritos se guardan en tu cuenta. Las estadísticas entre cuentas siguen pendientes de activar.':'Solo las métricas deportivas vinculadas a tu cuenta se sincronizan.'} Tus comidas y medidas siguen en este dispositivo.</p>`;
 }
 async function showInvite(matchId,hostKey){if(cfg.directProfiles){message('Comparte el enlace de la reta desde el botón Compartir invitación.');return;}if(!me){await open();message('Inicia sesión primero para enviar invitaciones');return}await sync();const d=document.getElementById('reta-dialog'),c=d.querySelector('#reta-dialog-content');
  c.innerHTML=`<div class="reta-modal-top"><div><span class="section-label">INVITACIONES DE LA BETA</span><h2>Invita a jugar.</h2></div><button data-reta="dismiss" class="reta-x">×</button></div>${all.length?`<form id="account-send-invite"><input type="hidden" name="matchId" value="${esc(matchId)}"><input type="hidden" name="hostKey" value="${esc(hostKey||'')}"><div class="field"><label>Jugador registrado</label><select name="playerId">${all.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</select></div><div class="field"><label>Invitar al equipo</label><select name="team"><option value="0">Equipo A</option><option value="1">Equipo B</option></select></div><button type="submit" class="btn full">Enviar invitación</button><p class="form-note">El jugador verá la invitación en «Mi cuenta» y podrá aceptarla o rechazarla.</p></form>`:'<p class="form-note">Todavía no hay más cuentas. Envía primero el enlace principal a tus amigos para que se registren con Google.</p>'}`;
  if(!d.open)d.showModal();
 }
 document.addEventListener('click',async ev=>{const target=ev.target.closest('[data-account]');if(!target)return;ev.preventDefault();const action=target.dataset.account;
  if(action==='close'){dialog.close();return}if(busy)return;busy=true;target.disabled=true;
  try{if(action==='google'){if(!db)throw new Error('La conexión Google no está configurada');if(new URLSearchParams(location.search).has('match'))sessionStorage.setItem('ritmo-return-invite',location.pathname+location.search);const {error}=await db.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}});if(error)throw error}
   else if(action==='logout'){const {error}=await db.auth.signOut();if(error)throw error;me=null;all=[];received=[];stats=null;render();updateHeader()}
   else if(action==='refresh'){await sync();render()}
   else if(action==='answer'){const r=await api('/api/invitations/'+encodeURIComponent(target.dataset.id)+'/respond',{method:'POST',body:JSON.stringify({action:target.dataset.answer})});message(r.status==='accepted'?'¡Invitación aceptada!':'Invitación rechazada');await sync();render()}
  }catch(e){message(e.message||'No se pudo realizar la acción')}finally{busy=false;target.disabled=false}
 });
 document.addEventListener('submit',async e=>{if(e.target.id==='account-profile-form'){e.preventDefault();const fd=new FormData(e.target);try{const r=await api('/api/me',{method:'PATCH',body:JSON.stringify({name:String(fd.get('name')),sports:fd.getAll('sports')})});me=r.profile;updateHeader();message('Perfil actualizado');render()}catch(err){message(err.message)} }
  if(e.target.id==='account-send-invite'){e.preventDefault();const fd=new FormData(e.target);try{await api('/api/invitations',{method:'POST',headers:{'X-Host-Key':String(fd.get('hostKey')||'')},body:JSON.stringify({matchId:fd.get('matchId'),playerId:fd.get('playerId'),team:Number(fd.get('team'))})});document.getElementById('reta-dialog').close();message('Invitación enviada: tu amigo la verá en Mi cuenta.')}catch(err){message(err.message)}}
 });
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 document.getElementById('club-account-btn').addEventListener('click',open);
 window.RitmoAuth={token,api,open,showInvite,getName:()=>me?.name||'',getProfile:()=>me,supportsInvites:()=>!cfg.directProfiles,getPlayers:()=>all,refresh:sync};
 init().then(()=>{if(db)sync();else updateHeader()}).catch(()=>updateHeader());
})();
