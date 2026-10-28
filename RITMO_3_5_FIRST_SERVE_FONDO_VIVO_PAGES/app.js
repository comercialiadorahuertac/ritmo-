(() => {
  'use strict';
  const KEY = 'ritmo-pwa-data-v1';
  const TODAY = () => {
    const d = new Date();
    const y = d.getFullYear();
    return `${y}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const ICONS = {
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    activity:'<path d="M2 12h4l3-7 5 14 3-7h5"/>',
    utensils:'<path d="M4 3v8a3 3 0 0 0 6 0V3M7 3v19M17 22V3c4 2 5 6 5 10h-5"/>',
    dumbbell:'<path d="m6.5 6.5 11 11M4 9l5-5M15 20l5-5M2 7l5-5M17 22l5-5M9 4l11 11"/>',
    chart:'<path d="M3 3v18h18M7 15l4-4 3 2 6-7"/>',
    left:'<path d="m15 18-6-6 6-6"/>',right:'<path d="m9 18 6-6-6-6"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',check:'<path d="m5 12 4 4L19 6"/>',
    trash:'<path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6M10 10v7M14 10v7"/>',
    ball:'<circle cx="12" cy="12" r="9"/><path d="M8 4c3 3 5 5 2 8s-3 5 0 8M15 4c-3 3-4 6-1 9s3 4 1 7"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
    copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    scale:'<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 12a4 4 0 1 1 8 0M12 12l2-2"/>',
    edit:'<path d="m13 6 5 5M3 21l5-1 12-12a3 3 0 0 0-4-4L4 16z"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    flame:'<path d="M12 22a8 8 0 0 0 8-8c0-3-2-6-4-8-1 4-3 5-4 5 0-4-2-7-4-9 0 6-4 9-4 13a8 8 0 0 0 8 7Z"/>',
    share:'<path d="M12 16V3m0 0 4 4m-4-4L8 7M5 13v7h14v-7"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7m10 10 2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>',
    download:'<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v4h16v-4"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>'
  };
  const ic = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.info}</svg>`;
  const defaultState = () => ({version:1,profile:{age:30,height:170,weight:75,protein:140,baseCalories:2200,sex:'m',goal:'recomp',sports:['padel'],reminders:true,onboarded:false},days:{},measurements:[]});
  function load(){
    try{
      const stored = JSON.parse(localStorage.getItem(KEY));
      if (stored && stored.version === 1 && stored.profile && typeof stored.days === 'object' && Array.isArray(stored.measurements)) return stored;
    }catch(e){console.warn('No se pudo leer almacenamiento',e)}
    return defaultState();
  }
  let data = load();
  let daySelected = TODAY();
  let currentTab = window.Retas?.hasDeepLink() ? 'retas' : 'inicio';
  let toastTimer;
  let statisticsRange=7;
  const view = document.getElementById('view');
  const dialog = document.getElementById('editor-dialog');
  const dialogContent = document.getElementById('dialog-content');
  const html = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const number = (x, fallback=0) => Number.isFinite(Number(x)) ? Number(x) : fallback;
  const fmt = (n) => Math.round(n).toLocaleString('es-MX');
  const uid = () => String(Date.now()) + '-' + Math.random().toString(36).slice(2,9);
  const dayData = date => data.days[date] || {sports:[],meals:{},workout:null};
  function editableDay(date){ if(!data.days[date]) data.days[date]={sports:[],meals:{},workout:null}; return data.days[date]; }
  const addDays = (date,qty) => {const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+qty);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const sameWeekStart = date=>{const d = new Date(date+'T12:00:00');const dif=(d.getDay()+6)%7;return addDays(date,-dif);};
  const displayDate = date=>new Intl.DateTimeFormat('es-MX',{weekday:'long',day:'numeric',month:'long'}).format(new Date(date+'T12:00:00'));
  const dayShort = date=>new Intl.DateTimeFormat('es-MX',{weekday:'short'}).format(new Date(date+'T12:00:00'));
  function save(){
    try{localStorage.setItem(KEY,JSON.stringify(data));return true;}
    catch(e){toast('No se pudo guardar. Exporta una copia.');return false;}
  }
  function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3300);}
  const sportType = {'tenis':'Tenis','padel':'Pádel','pickleball':'Pickleball','futbol':'Fútbol','running':'Correr','gym':'Gimnasio','otro':'Otro deporte'};
  const goalNames = {bajar:'bajar grasa',recomp:'bajar grasa y ganar músculo',ganar:'ganar músculo',mantener:'mantenerme activo'};
  const efforts = {'suave':'Suave','moderado':'Moderado','intenso':'Intenso'};
  const meals = {desayuno:'Desayuno',comida:'Comida',cena:'Cena'};
  const routines = [
    {id:'A',name:'Pecho y espalda',items:[['Flexiones','3 × 6–12'],['Remo con mochila','3 × 10–15'],['Sentadillas','3 × 10–15'],['Elevaciones laterales','2 × 12–15'],['Plancha','3 × 30–45 s']]},
    {id:'B',name:'Piernas y torso',items:[['Desplantes atrás','3 × 8–12/lado'],['Peso muerto con mochila','3 × 10–15'],['Flexiones inclinadas','3 × 8–15'],['Remo unilateral','3 × 10–12/lado'],['Dead bug','3 × 10/lado']]},
    {id:'C',name:'Cuerpo completo',items:[['Sentadillas con mochila','3 × 12'],['Flexiones','3 × 8–12'],['Remo con mochila','3 × 12'],['Curl de bíceps','2 × 12–15'],['Pantorrillas','3 × 15–20'],['Plancha lateral','2 × 30 s/lado']]}
  ];
  function getTargets(date){
    const day=dayData(date);
    const sports=Array.isArray(day.sports)?day.sports:[];
    const effectiveMin=sports.reduce((sum,item)=>sum + Math.max(0,number(item.minutes)) * ({suave:.75,moderado:1,intenso:1.18}[item.effort] || 1),0);
    // Estimaciones orientativas, no equivalen a calorías medidas por sesión.
    const rest = number(data.profile.baseCalories,2400)-100;
    let cal = rest;
    let activity = 'Descanso / movimiento ligero';
    if(effectiveMin>0 && effectiveMin<90){cal=rest+100;activity='Un partido o sesión corta';}
    else if(effectiveMin>=90 && effectiveMin<150){cal=rest+250;activity='Día deportivo';}
    else if(effectiveMin>=150 && effectiveMin<240){cal=rest+350;activity='Día con varios partidos';}
    else if(effectiveMin>=240){cal=rest+500;activity='Día deportivo muy intenso';}
    if(effectiveMin===0 && day.workout?.done) {cal=rest+50;activity='Fuerza en casa';}
    cal = Math.round(cal/50)*50;
    const protein=number(data.profile.protein,160);
    const fat=70;
    return {cal,protein,fat,carbs:Math.max(0,Math.round((cal-protein*4-fat*9)/4)),effectiveMin,activity};
  }
  function totalMeal(date){return Object.values(dayData(date).meals||{}).reduce((a,m)=>({cal:a.cal+number(m.cal),protein:a.protein+number(m.protein)}),{cal:0,protein:0});}
  function mealTarget(date,id){const {cal,protein}=getTargets(date);const ratios={desayuno:.27,comida:.40,cena:.33};return {cal:Math.round(cal*ratios[id]/10)*10,protein:Math.round(protein*({desayuno:.28,comida:.40,cena:.32}[id]))};}
  const dateBar = () => `<div class="date-control"><button class="arrow-date" data-action="prev-day" aria-label="Día anterior">${ic('left')}</button><div class="date-middle"><strong>${html(displayDate(daySelected))}</strong><input type="date" id="day-picker" value="${daySelected}" aria-label="Elegir fecha"></div><div style="display:flex;align-items:center;gap:5px"><button class="today-link" data-action="today">Hoy</button><button class="arrow-date" data-action="next-day" aria-label="Día siguiente">${ic('right')}</button></div></div>`;
  function hero(){return reminders()+heroBase();}
  function heroBase(){
    const target=getTargets(daySelected),cons=totalMeal(daySelected),pct=Math.min(100,Math.round((cons.cal/target.cal)*100)),remaining=target.cal-cons.cal;
    return `<section class="hero"><div class="hero-top"><span class="hero-label">TU OBJETIVO DEL DÍA</span><span class="hero-tag">${html(target.activity)}</span></div><div class="hero-center"><div class="hero-kcal"><small>Calorías objetivo</small><strong>${fmt(target.cal)}</strong><span>kcal · ajustadas a tu actividad</span></div><div class="ring" style="--angle:${pct}%"><div class="ring-inner"><b>${pct}%</b><small>registrado</small></div></div></div><div class="hero-bottom"><div><span>Proteína</span><strong>${fmt(cons.protein)} <small>/ ${fmt(target.protein)} g</small></strong></div><div><span>${remaining>=0?'Kcal disponibles':'Kcal sobre objetivo'}</span><strong>${fmt(Math.abs(remaining))} <small>kcal</small></strong></div></div></section>`;
  }
  function activityList(date, editing=true){
    const sports=dayData(date).sports||[];
    if(!sports.length) return `<p class="empty-note">Todavía no hay partidos anotados. Agrega uno si tienes tenis, pádel o pickleball, incluso para mañana.</p>`;
    return sports.map(s=>`<div class="activity-line"><span class="activity-icon">${ic('ball')}</span><div class="activity-main"><strong>${html(sportType[s.type]||s.type)} <span class="pill ${s.done?'done':''}">${s.done?'Realizado':s.status==='jugando'?'En juego':'Programado'}</span></strong><small>${s.time?html(s.time)+' · ':''}${fmt(s.minutes)} min · ${html(efforts[s.effort]||'Moderado')}${s.rivals?' · Rivales: '+html(s.rivals):''}</small></div>${editing?`<div class="activity-actions">${['tenis','padel','pickleball'].includes(s.type)?`<button class="mini-icon-btn invite-sport" data-action="make-reta" data-id="${html(s.id)}" title="Crear reta y compartir con rivales" aria-label="Crear reta">${ic('share')}</button>`:''}<button class="mini-icon-btn ${s.done?'complete':''}" data-action="toggle-sport" data-id="${html(s.id)}" title="Marcar realizado / programado" aria-label="${s.done?'Cambiar a programado':'Marcar realizado'}">${ic('check')}</button><button class="mini-icon-btn" data-action="edit-sport" data-id="${html(s.id)}" aria-label="Editar partido">${ic('edit')}</button></div>`:''}</div>`).join('');
  }
  function mealLines(date, editing=false){const d=dayData(date);return Object.keys(meals).map(id=>{
    const item=d.meals?.[id],target=mealTarget(date,id),pct=item?Math.min(100,number(item.cal)/target.cal*100):0;
    return `<div class="meal-line"><div><strong>${meals[id]}</strong><small>${item?.note?html(item.note):`Meta orientativa: ${fmt(target.cal)} kcal`}</small><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div></div><div class="right"><b>${item?fmt(item.cal):'—'} <span class="muted">/ ${fmt(target.cal)}</span></b><small>${item?fmt(item.protein)+' g proteína':'Sin registrar'}</small>${editing?`<button style="margin-top:7px;display:inline-flex" class="mini-icon-btn" data-action="edit-meal" data-meal="${id}" aria-label="Registrar ${meals[id]}">${ic(item?'edit':'plus')}</button>`:''}</div></div>`;}).join('');}
  function homeView(){const d=dayData(daySelected),target=getTargets(daySelected);return `${window.RitmoFirstServe ? window.RitmoFirstServe.markup() : ""}${dateBar()}${hero()}
    <div class="section-head"><div><h2>Tu actividad</h2><p>${(d.sports||[]).length} partido(s) anotado(s)</p></div><button class="text-link" data-action="tab" data-tab="actividad">Ver agenda ${ic('right')}</button></div>
    <div class="card">${activityList(daySelected,false)}<button class="btn btn-soft full" data-action="add-sport" style="margin-top:13px">${ic('plus')} Agregar partido o deporte</button></div>
    <button class="btn btn-soft full" style="margin-top:13px" data-action="tab" data-tab="retas">${ic('share')} Ver retas y marcadores de mis amigos</button>
    <div class="section-head"><div><h2>Tus 3 comidas</h2><p>Sin cambiar tu forma habitual de comer</p></div><button class="text-link" data-action="tab" data-tab="comidas">Registrar ${ic('right')}</button></div>
    <div class="card">${mealLines(daySelected)}<div style="margin-top:14px"><button class="btn btn-outline full" data-action="tab" data-tab="comidas">Registrar desayuno, comida o cena</button></div></div>
    <div class="section-head"><div><h2>Acciones rápidas</h2><p>Todo tu día, en pocos toques</p></div></div>
    <div class="quick-grid"><button class="quick-btn" data-action="add-sport">${ic('calendar')}<span>Programar partido</span></button><button class="quick-btn" data-action="add-measure">${ic('scale')}<span>Registrar peso y cintura</span></button><button class="quick-btn" data-action="tab" data-tab="fuerza">${ic('dumbbell')}<span>Rutina en casa</span></button><button class="quick-btn" data-action="share-day">${ic('share')}<span>Enviar resumen</span></button></div>
    <div class="tip-card"><strong>Una meta flexible, no una dieta rígida</strong><p>Los partidos programados ajustan tu objetivo estimado. Si cambian tus planes, edita o elimina la actividad. Evalúa resultados con cintura, peso y rendimiento.</p></div>`;}
  function activityView(){const d=dayData(daySelected),t=getTargets(daySelected),sports=d.sports||[];
    return `<span class="section-label">TU AGENDA FLEXIBLE</span><h1 class="page-title">Deporte a tu ritmo.</h1><p class="page-subtitle">Tenis, pádel y pickleball: registra tantos partidos como tengas, incluso antes de jugarlos.</p>${dateBar()}
    <div class="card"><div class="section-head" style="margin:0 0 10px"><div><h2>Partidos</h2><p>${sports.length} registrados · ${fmt(sports.reduce((a,s)=>a+number(s.minutes),0))} minutos</p></div></div>${activityList(daySelected)}<button class="btn full" data-action="add-sport" style="margin-top:17px">${ic('plus')} Agregar actividad</button><button class="btn btn-soft full" data-action="tab" data-tab="retas" style="margin-top:9px">${ic('share')} Retas y marcadores</button></div>
    <div class="stat-row" style="margin-top:12px"><div class="stat-box"><div class="stat-label">Objetivo diario estimado</div><strong>${fmt(t.cal)}</strong><small>kcal según tus planes</small></div><div class="stat-box"><div class="stat-label">Carbohidratos orientativos</div><strong>${fmt(t.carbs)} g</strong><small>para rendir y recuperarte</small></div></div>
    <div class="tip-card"><strong>¿Cambió tu día?</strong><p>No pasa nada: elimina el partido o modifica su duración. El cálculo es una guía, no calorías gastadas exactas. Si juegas varias horas, hidrátate y prioriza recuperarte.</p></div>`;}
  function mealsView(){const t=getTargets(daySelected),logged=totalMeal(daySelected);
    return `<span class="section-label">ALIMENTACIÓN SIN COMPLICACIONES</span><h1 class="page-title">Tus tres comidas.</h1><p class="page-subtitle">Escribe lo que comiste y sus calorías/proteínas estimadas. No necesitas cambiar tus horarios.</p>${dateBar()}
    <div class="stat-row"><div class="stat-box"><div class="stat-label">Calorías registradas</div><strong>${fmt(logged.cal)}</strong><small>de ${fmt(t.cal)} kcal</small></div><div class="stat-box"><div class="stat-label">Proteína registrada</div><strong>${fmt(logged.protein)} g</strong><small>meta ${fmt(t.protein)} g</small></div></div>
    <div class="section-head"><div><h2>Registrar comidas</h2><p>Toca el botón de cada tiempo</p></div></div><div class="card">${mealLines(daySelected,true)}</div>
    <div class="tip-card"><strong>Ejemplos fáciles</strong><p><b>Desayuno:</b> huevos, claras, frijoles y tortillas.<br><b>Comida:</b> pollo, arroz, verduras y aguacate.<br><b>Cena:</b> tacos de bistec o pollo con nopales.<br>Las porciones determinan las calorías: la app no las adivina a partir del nombre de un alimento.</p></div>`;}
  function strengthView(){if(window.RitmoExtras)return window.RitmoExtras.strengthView();const done=dayData(daySelected).workout;
    return `<span class="section-label">ENTRENAMIENTO EN CASA</span><h1 class="page-title">Construye músculo.</h1><p class="page-subtitle">Sin gimnasio: peso corporal y mochila con libros. 2–3 sesiones semanales si tus partidos lo permiten.</p>${dateBar()}
    <div class="accent-banner">${ic('target')}<span>Haz los movimientos con técnica y agrega dificultad poco a poco. Deja recuperación suficiente entre sesiones.</span></div>
    ${routines.map(r=>`<div class="routine-card ${done?.type===r.id && done.done?'is-completed':''}"><div class="routine-top"><div><h3>Rutina ${r.id} · ${r.name}</h3><p>35–50 min · 5 ejercicios</p></div><span class="routine-tag">${r.id}</span></div><ul class="exercise-list">${r.items.map(m=>`<li><span>${m[0]}</span><small>${m[1]}</small></li>`).join('')}</ul><div class="routine-buttons"><button class="btn ${done?.type===r.id && done.done?'btn-soft':''}" data-action="complete-workout" data-type="${r.id}">${ic('check')} ${done?.type===r.id && done.done?'Realizada hoy':'Marcar realizada hoy'}</button></div></div>`).join('')}
    <div class="disclaimer">La primera semana puedes empezar con 2 series por ejercicio. Para ganar músculo, procura que las últimas repeticiones sean exigentes, sin llegar al fallo en todas las series. Suspende ejercicios que causen dolor.</div>`;}
  function statisticsView(){
    let sessions=[],notice='';try{const raw=localStorage.getItem('ritmo-fuerza-sessions-v1');sessions=raw===null?[]:JSON.parse(raw);if(!Array.isArray(sessions))throw Error();}catch{sessions=[];notice='No se pudo leer el historial de Fuerza. Las cifras de sesiones pueden estar incompletas.';}
    const s=window.RitmoStatistics.summarize(data,sessions,window.Retas?.getMatches?.()||[],daySelected,statisticsRange);
    const names={tenis:'Tenis',padel:'Pádel',pickleball:'Pickleball',otro:'Otro'};
    const metric=(label,value,sub)=>`<div class="stat-box"><div class="stat-label">${label}</div><strong>${value}</strong><small>${sub}</small></div>`;
    const series=Object.entries(s.daily).sort(([a],[b])=>a.localeCompare(b));const max=Math.max(1,...series.map(([,n])=>n));
    return `<section class="statistics-panel" aria-label="Estadísticas deportivas"><div class="section-head"><div><h2>Tu ritmo, en números</h2><p>${statisticsRange==='all'?'Historial hasta ':html(s.start)+' al '}${html(s.end)}</p></div></div><div class="statistics-filters" role="group" aria-label="Periodo de estadísticas">${[[7,'7 días'],[30,'30 días'],['all','Historial']].map(([n,label])=>`<button class="btn btn-soft" data-action="statistics-range" data-range="${n}" aria-pressed="${statisticsRange===n}">${label}</button>`).join('')}</div>${notice?`<p role="status">${notice}</p>`:''}<div class="statistics-grid">${metric('Días activos',s.activeDays,'con actividad realizada')}${metric('Minutos registrados',fmt(s.totalMinutes),'deporte + Fuerza cronometrada')}${metric('Partidos realizados',s.played,s.planned+' pendientes en el periodo')}${metric('Fuerza completa',s.complete,'sesiones del reproductor')}${metric('Fuerza parcial',s.partial,fmt(s.strengthMinutes)+' min cronometrados en total')}${metric('Días con comidas',s.mealDays,'con al menos un registro')}</div><p class="form-note">Los minutos de deporte son la duración anotada en Agenda; pueden ser estimados. ${s.manual?s.manual+' registro(s) manual(es) de Fuerza sin duración, excluidos de minutos y sesiones del reproductor. ':''}Estadísticas de este dispositivo.</p><details class="card statistics-detail"><summary>Actividad por día y deporte</summary>${series.length?`<ul class="statistics-bars">${series.map(([date,n])=>`<li><span>${html(date)}</span><meter min="0" max="${max}" value="${n}">${fmt(n)} min</meter><b>${fmt(n)} min</b></li>`).join('')}</ul>`:'<p class="empty-note">Registra un partido realizado o termina una sesión de Fuerza para ver tu actividad.</p>'}<p>${Object.entries(s.bySport).map(([sport,n])=>`${html(names[sport]||sport)}: ${n}`).join(' · ')||'Sin partidos realizados en este periodo.'}</p></details><details class="card statistics-detail"><summary>Resultados · ${s.scored} partido(s) con marcador</summary><p class="form-note">Resultados de los equipos. No se atribuyen victorias personales sin identificar tu equipo.</p>${s.results.length?s.results.slice(0,30).map(r=>`<div class="statistics-result"><small>${html(r.date)}</small><strong>${html((r.teams[0]||[]).join(' / ')||'Equipo A')} vs ${html((r.teams[1]||[]).join(' / ')||'Equipo B')}</strong><span>${r.sets.length?r.sets.map(x=>x.a+'–'+x.b).join(' · '):'Finalizado sin marcador'}</span></div>`).join(''):'<p class="empty-note">Finaliza una Reta y guarda sus sets para verla aquí.</p>'}</details></section>`;
  }
  function progressView(){const rows=[...data.measurements].sort((a,b)=>b.date.localeCompare(a.date));const weekStart=sameWeekStart(daySelected);let active=0,strength=0;
    for(let i=0;i<7;i++){const day=dayData(addDays(weekStart,i));if((day.sports||[]).some(s=>s.done))active++;if(day.workout?.done)strength++;}
    const latest=rows[0];const lastWeight=rows.find(x=>Number(x.weight)>0);const lastWaist=rows.find(x=>Number(x.waist)>0);const earliest=rows.length>1?rows[rows.length-1]:null;
    return `<span class="section-label">TU EVOLUCIÓN REAL</span><h1 class="page-title">Así llevas tu ritmo.</h1><p class="page-subtitle">Entrenamientos, partidos y evolución en un solo lugar.</p>${dateBar()}${statisticsView()}
    <div class="stat-row"><div class="stat-box"><div class="stat-label">Último peso</div><strong>${lastWeight?.weight?number(lastWeight.weight).toFixed(1):number(data.profile.weight).toFixed(1)} <small>kg</small></strong><small>${lastWeight?.date?html(lastWeight.date):'Peso inicial'}</small></div><div class="stat-box"><div class="stat-label">Última cintura</div><strong>${lastWaist?.waist?number(lastWaist.waist).toFixed(1):'—'} <small>cm</small></strong><small>${lastWaist?.waist?'Registro del '+html(lastWaist.date):'Aún sin medir'}</small></div></div>
    <div style="margin-top:13px"><button class="btn full" data-action="add-measure">${ic('plus')} Registrar peso y cintura</button></div>
    <div class="section-head"><div><h2>Evolución del peso</h2><p>Registra una vez a la semana para ver la tendencia</p></div></div><div class="chart-card">${lineChart('weight','kg',rows)}</div>
    <div class="section-head"><div><h2>Cintura</h2><p>Mide a la altura del ombligo, de forma consistente</p></div></div><div class="chart-card">${lineChart('waist','cm',rows)}</div>
    <div class="section-head"><div><h2>Tu semana</h2><p>Semana que comienza el ${html(addDays(weekStart,0))}</p></div></div><div class="stat-row"><div class="stat-box"><div class="stat-label">Días de deporte realizados</div><strong>${active}</strong><small>registro de esta semana</small></div><div class="stat-box"><div class="stat-label">Sesiones de fuerza</div><strong>${strength}</strong><small>registro de esta semana</small></div></div>
    <div class="section-head"><div><h2>Mediciones registradas</h2></div></div><div class="card">${rows.length?rows.slice(0,12).map(x=>`<div class="weight-row"><div><strong>${html(x.date)}</strong><small>${x.weight?number(x.weight).toFixed(1)+' kg':'Sin peso'} · ${x.waist?number(x.waist).toFixed(1)+' cm de cintura':'Sin cintura'}</small></div><button class="mini-icon-btn" data-action="edit-measure" data-date="${html(x.date)}" aria-label="Editar medición">${ic('edit')}</button></div>`).join(''):'<p class="empty-note">Aún no tienes mediciones. Registra el punto de partida y compáralo cada semana.</p>'}</div>
    <button class="btn btn-soft full" data-action="share-card" style="margin-top:12px">${ic('share')} Compartir tarjeta de mi semana</button><div class="disclaimer">Una pérdida aproximada de 0.2–0.5 kg/semana puede ser razonable si conservas fuerza y energía. Estos objetivos son orientativos, no predicciones.</div>`;}
  function lineChart(key,unit,rows){const set=rows.filter(m=>number(m[key])>0).sort((a,b)=>a.date.localeCompare(b.date)).slice(-12);
    if(set.length<2) return '<div class="chart-empty">Agrega al menos 2 mediciones para ver tu gráfica.</div>';
    const vals=set.map(m=>number(m[key]));const min=Math.min(...vals),max=Math.max(...vals),pad=Math.max(.4,(max-min)*.25),lo=min-pad,hi=max+pad;
    const points=set.map((m,i)=>({x:32+280*(Date.parse(m.date+'T12:00:00')-Date.parse(set[0].date+'T12:00:00'))/Math.max(1,Date.parse(set[set.length-1].date+'T12:00:00')-Date.parse(set[0].date+'T12:00:00')),y:125-((number(m[key])-lo)/(hi-lo))*99,date:m.date,value:number(m[key])}));
    const paths=points.map(p=>`${p.x},${p.y}`).join(' ');
    return `<svg viewBox="0 0 345 161" role="img" aria-label="Gráfica de ${key==='weight'?'peso':'cintura'} desde ${html(set[0].date)} hasta ${html(set[set.length-1].date)}"><path d="M32 26H312M32 75H312M32 125H312" stroke="#e6ece4" stroke-dasharray="3 5"/><text x="2" y="29" font-size="9" fill="#465c4e">${hi.toFixed(1)}</text><text x="2" y="128" font-size="9" fill="#465c4e">${lo.toFixed(1)}</text><polyline fill="none" stroke="#699d6b" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" points="${paths}"/>${points.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#ccf57a" stroke="#37674b" stroke-width="2"><title>${html(p.date)}: ${p.value} ${unit}</title></circle>`).join('')}<text x="32" y="150" fill="#465c4e" font-size="10">${html(set[0].date.slice(5))}</text><text x="310" y="150" text-anchor="end" fill="#465c4e" font-size="10">${html(set[set.length-1].date.slice(5))}</text></svg><details><summary>Ver mediciones de ${key==='weight'?'peso':'cintura'}</summary><table class="measure-table"><thead><tr><th>Fecha</th><th>${unit}</th></tr></thead><tbody>${set.map(m=>`<tr><td>${html(m.date)}</td><td>${number(m[key]).toFixed(1)}</td></tr>`).join('')}</tbody></table></details>`;
  }
  function settingsView(){const p=data.profile;
    return `<span class="section-label">PREFERENCIAS</span><h1 class="page-title">Tu perfil.</h1><p class="page-subtitle">Datos y objetivos de partida. Todo se guarda únicamente en este dispositivo.</p><div class="card"><form id="settings-form"><div class="fields-2"><div class="field"><label for="p-age">Edad (años)</label><input id="p-age" name="age" type="number" min="18" max="100" value="${html(p.age)}" required></div><div class="field"><label for="p-height">Estatura (cm)</label><input id="p-height" name="height" type="number" min="100" max="230" value="${html(p.height)}" required></div><div class="field"><label for="p-weight">Peso inicial (kg)</label><input id="p-weight" name="weight" type="number" step="0.1" min="30" max="300" value="${html(p.weight)}" required></div><div class="field"><label for="p-protein">Proteína (g/día)</label><input id="p-protein" name="protein" type="number" min="50" max="250" value="${html(p.protein)}" required></div></div><div class="field"><label for="p-base">Calorías base (día normal)</label><input id="p-base" name="baseCalories" type="number" min="1200" max="4500" step="50" value="${html(p.baseCalories)}" required></div><p class="form-note">La app ajusta esta base según tus partidos. Los cálculos son orientativos y pueden corregirse tras 2–3 semanas.</p><button class="btn full" type="submit">Guardar perfil</button></form></div>
    <div class="section-head"><div><h2>Tus datos y privacidad</h2></div></div><div class="card"><div class="setting-item"><strong>Sin cuenta ni nube</strong><small>No se sube información a un servidor. Si cambias de celular o borras Safari, podrías perderla.</small></div><div class="setting-item"><strong>Respaldo personal</strong><small>Exporta un archivo JSON para guardar o restaurar tus datos.</small></div><div class="button-row" style="margin-top:15px"><button class="btn btn-outline" data-action="export">${ic('download')} Exportar</button><button class="btn btn-outline" data-action="import">Importar</button><input id="import-input" type="file" accept="application/json,.json" hidden></div></div>
    <button class="btn btn-outline full" data-action="redo-onboard" style="margin-top:12px">Rehacer perfil guiado</button><div class="section-head"><div><h2>Compartir el día</h2><p>Copia o comparte tu resumen para recibir ajustes en ChatGPT.</p></div></div><button class="btn btn-soft full" data-action="share-day">${ic('share')} Compartir resumen</button><div class="disclaimer">Ritmo v2 · Tu información queda en el almacenamiento local del navegador. Las calorías no son una estimación médica individual ni miden el gasto deportivo real.</div><button class="text-link danger" data-action="reset" style="margin-top:15px">Borrar todos mis registros</button>`;}
  const FOODS = [['Taco de bistec',190,12],['Taco de pastor',170,9],['Tortilla de maíz',60,1.5],['Huevo',75,6],['Frijoles ½ taza',115,7],['Quesadilla',300,14],['Pechuga 150 g',250,46],['Arroz 1 taza',205,4],['Aguacate ½',120,1.5],['Tamal de pollo',250,9],['Scoop de proteína',120,24],['Yogur griego 170 g',100,17],['Avena ½ taza',150,5],['Plátano',105,1]];
  function streak(){let n=0,d=TODAY();if(!Object.keys(dayData(d).meals||{}).length)d=addDays(d,-1);while(Object.keys(dayData(d).meals||{}).length){n++;d=addDays(d,-1);}return n;}
  function reminders(){
    if(daySelected!==TODAY()||data.profile.reminders===false)return '';
    const h=new Date().getHours(),day=dayData(daySelected),t=getTargets(daySelected),c=totalMeal(daySelected),m=day.meals||{},r=[];
    (day.sports||[]).filter(x=>!x.done&&x.time).forEach(x=>r.push(`Hoy: ${sportType[x.type]||'partido'} a las ${x.time}. Come carbohidratos 2–3 h antes y toma agua.`));
    [['desayuno',8],['comida',14],['cena',20]].forEach(([k,lim])=>{if(h>=lim&&!m[k])r.push(`Registra tu ${k}.`);});
    if(h>=18&&t.protein-c.protein>40)r.push(`Te faltan ${fmt(t.protein-c.protein)} g de proteína hoy.`);
    if(!data.measurements.some(x=>x.date>=addDays(TODAY(),-7)))r.push('Toca pesarte y medir tu cintura esta semana.');
    const n=streak(),items=r.slice(0,3).map(x=>`<li>${html(x)}</li>`).join('');
    return `<section class="reminder"><strong>${n?`Racha: ${n} día${n>1?'s':''} registrando`:'Recordatorios de hoy'}</strong>${items?`<ul>${items}</ul>`:'<small>Todo al día. Buen ritmo.</small>'}</section>`;
  }
  function onboardView(){const p=data.profile;const sp=p.sports||[];
    return `<span class="section-label">BIENVENIDO</span><h1 class="page-title">Armemos tu plan.</h1><p class="page-subtitle">Calculamos tus calorías y proteína según tu cuerpo, tu meta y tus deportes. Puedes cambiarlo después.</p><div class="card"><form id="onboard-form">
    <div class="fields-2"><div class="field"><label>Sexo</label><select name="sex"><option value="m"${p.sex!=='f'?' selected':''}>Hombre</option><option value="f"${p.sex==='f'?' selected':''}>Mujer</option></select></div><div class="field"><label>Edad</label><input name="age" type="number" min="18" max="100" value="${html(p.age)}" required></div><div class="field"><label>Estatura (cm)</label><input name="height" type="number" min="120" max="230" value="${html(p.height)}" required></div><div class="field"><label>Peso (kg)</label><input name="weight" type="number" step="0.1" min="35" max="300" value="${html(p.weight)}" required></div></div>
    <div class="field"><label>Tu meta</label><select name="goal">${Object.entries(goalNames).map(([k,v])=>`<option value="${k}"${p.goal===k?' selected':''}>${v[0].toUpperCase()+v.slice(1)}</option>`).join('')}</select></div>
    <div class="field"><label>Deportes que practicas</label><div class="chips">${Object.entries(sportType).filter(([k])=>k!=='otro').map(([k,v])=>`<label class="chip"><input type="checkbox" name="sports" value="${k}"${sp.includes(k)?' checked':''}> ${v}</label>`).join('')}</div></div>
    <div class="field"><label class="chip"><input type="checkbox" name="reminders" ${p.reminders!==false?'checked':''}> Mostrar recordatorios dentro de la app</label></div>
    <p class="form-note">Estimación orientativa (fórmula Mifflin-St Jeor). Ajusta tras 2–3 semanas según tu peso y rendimiento.</p><button class="btn full" type="submit">Crear mi plan</button></form></div>`;}
  async function shareCard(){
    const ws=sameWeekStart(daySelected);let a=0,f=0;for(let i=0;i<7;i++){const d=dayData(addDays(ws,i));if((d.sports||[]).some(q=>q.done))a++;if(d.workout?.done)f++;}
    const c=document.createElement('canvas');c.width=1080;c.height=1350;const x=c.getContext('2d');x.fillStyle='#102b28';x.fillRect(0,0,1080,1350);
    x.fillStyle='#f6f7f3';x.font='700 90px system-ui';x.fillText('ritmo.',80,160);x.font='500 44px system-ui';x.fillStyle='#9fd4c8';x.fillText('MI SEMANA',80,260);x.fillStyle='#f6f7f3';
    [['Días de deporte',a],['Sesiones de fuerza',f],['Días de racha',streak()]].forEach(([l,v],i)=>{x.font='700 190px system-ui';x.fillText(String(v),80,520+i*330);x.font='500 48px system-ui';x.fillText(l,330,500+i*330);});
    c.toBlob(async b=>{const file=new File([b],'ritmo-semana.png',{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file]});return;}catch(e){if(e.name==='AbortError')return;}}const u=document.createElement('a');u.href=URL.createObjectURL(b);u.download='ritmo-semana.png';u.click();},'image/png');
  }
    function render(){
    if(!data.profile.onboarded && currentTab!=='retas'){view.innerHTML=onboardView();document.querySelectorAll('.bottom-nav,.site-header').forEach(e=>e.style.display='none');return;}
    document.querySelectorAll('.bottom-nav,.site-header').forEach(e=>e.style.display='');
    document.querySelectorAll('.nav-link').forEach(el=>{el.classList.toggle('is-active',el.dataset.tab===currentTab);});
    document.querySelectorAll('.nav-icon').forEach(el=>el.innerHTML=ic(el.dataset.icon));
    view.innerHTML=({inicio:homeView,actividad:activityView,comidas:mealsView,fuerza:strengthView,progreso:progressView,focus:()=>window.RitmoExtras.focusView(),retas:()=>window.Retas.render(),ajustes:settingsView}[currentTab]||homeView)();
    window.RitmoAmbient?.setScene(currentTab);
    if(window.RitmoFirstServe) window.RitmoFirstServe.sync(currentTab);
    document.title = `Ritmo · ${({'inicio':'Mi día','actividad':'Actividad','comidas':'Comidas','fuerza':'Fuerza','focus':'Focus','progreso':'Progreso','retas':'Retas','ajustes':'Configuración'})[currentTab]}`;
  }
  function openDialog(inner){dialogContent.innerHTML=inner;dialog.showModal();const first=dialog.querySelector('input:not([type=hidden]),select');if(first) setTimeout(()=>first.focus({preventScroll:true}),90);}
  const dlgHeader = title=>`<div class="dialog-top"><span class="section-label">RITMO · ${html(daySelected)}</span><button type="button" class="dialog-close" data-action="close-dialog" aria-label="Cerrar">×</button></div><h2 class="form-title">${title}</h2>`;
  function sportDialog(id=null){const sport=(dayData(daySelected).sports||[]).find(x=>x.id===id)||{type:(data.profile.sports||['tenis'])[0],minutes:90,effort:'moderado',time:'',rivals:'',done:false};
    openDialog(`${dlgHeader(id?'Editar partido':'Agregar partido')}<form id="sport-form" data-edit-id="${html(id||'')}"><div class="field"><label for="sp-type">Deporte</label><select id="sp-type" name="type" required>${Object.entries(sportType).map(([k,v])=>`<option value="${k}" ${sport.type===k?'selected':''}>${v}</option>`).join('')}</select></div><div class="fields-2"><div class="field"><label for="sp-duration">Duración (minutos)</label><input id="sp-duration" name="minutes" type="number" min="10" max="600" step="5" value="${html(sport.minutes)}" required></div><div class="field"><label for="sp-time">Hora (opcional)</label><input id="sp-time" name="time" type="time" value="${html(sport.time)}"></div></div><div class="field"><label for="sp-effort">Intensidad estimada</label><select id="sp-effort" name="effort">${Object.entries(efforts).map(([k,v])=>`<option value="${k}" ${sport.effort===k?'selected':''}>${v}</option>`).join('')}</select></div><div class="field"><label for="sp-rivals">Rivales / participantes (opcional)</label><input id="sp-rivals" name="rivals" maxlength="160" value="${html(sport.rivals||'')}" placeholder="Ej. Carlos, Luis, Diego"><p class="form-note">Si quieres enviarles una invitación con marcador, crea una reta desde la agenda.</p></div><div class="field"><label for="sp-status">Estado</label><select id="sp-status" name="status"><option value="planned" ${!sport.done?'selected':''}>Programado</option><option value="done" ${sport.done?'selected':''}>Ya lo jugué</option></select></div><p class="form-note">Si registras varios deportes en un mismo día, se suman las duraciones para sugerir una meta alimentaria.</p><div class="button-row">${id?`<button class="btn btn-outline danger" type="button" data-action="delete-sport" data-id="${html(id)}">Eliminar</button>`:''}<button type="submit" class="btn">Guardar</button></div></form>`);
  }
  function mealDialog(id){const d=dayData(daySelected).meals?.[id]||{cal:'',protein:'',note:''};const target=mealTarget(daySelected,id);
    openDialog(`${dlgHeader('Registrar '+meals[id].toLowerCase())}<form id="meal-form" data-meal="${id}"><div class="field"><label for="meal-note">¿Qué comiste?</label><textarea id="meal-note" name="note" maxlength="240" placeholder="Ej. 3 huevos, frijoles y tortillas">${html(d.note)}</textarea></div><button type="button" class="btn btn-soft full" id="food-analyze" style="margin:10px 0">✨ Calcular porciones del texto</button><div id="food-analysis" class="extras-analysis" aria-live="polite"></div><div class="chips">${FOODS.map((f,i)=>`<button type="button" class="chip" data-action="add-food" data-i="${i}">${html(f[0])}</button>`).join('')}</div><p class="form-note">Toca para sumar porciones (valores aproximados).</p><div class="fields-2"><div class="field"><label for="meal-cal">Calorías (kcal)</label><input id="meal-cal" name="cal" type="number" min="0" max="4000" step="1" value="${html(d.cal)}" placeholder="${target.cal}" required></div><div class="field"><label for="meal-protein">Proteína (g)</label><input id="meal-protein" name="protein" type="number" min="0" max="200" step="0.1" value="${html(d.protein)}" placeholder="${target.protein}" required></div></div><p class="form-note">Meta orientativa para esta comida: ${fmt(target.cal)} kcal y ${target.protein} g de proteína. Los valores deben estimarse a partir de las porciones, no los calcula el texto.</p><div class="button-row">${Object.keys(d).length && d.cal!==''?`<button class="btn btn-outline danger" type="button" data-action="delete-meal" data-meal="${id}">Borrar</button>`:''}<button class="btn" type="submit">Guardar comida</button></div></form>`);
  }
  function measureDialog(date=daySelected){const m=data.measurements.find(x=>x.date===date)||{date,weight:'',waist:''};
    openDialog(`${dlgHeader('Peso y cintura')}<form id="measure-form" data-original-date="${html(m.date)}"><div class="field"><label for="m-date">Fecha</label><input id="m-date" type="date" name="date" value="${html(m.date)}" required></div><div class="fields-2"><div class="field"><label for="m-weight">Peso (kg)</label><input id="m-weight" type="number" name="weight" step="0.1" min="30" max="300" value="${html(m.weight)}" placeholder="85.0"></div><div class="field"><label for="m-waist">Cintura (cm)</label><input id="m-waist" type="number" name="waist" step="0.1" min="45" max="180" value="${html(m.waist)}" placeholder="Ej. 92"></div></div><p class="form-note">Registra por la mañana, en condiciones similares cada semana. Puedes llenar uno o ambos campos.</p><div class="button-row">${data.measurements.some(x=>x.date===date)?`<button class="btn btn-outline danger" type="button" data-action="delete-measure" data-date="${html(date)}">Borrar</button>`:''}<button class="btn" type="submit">Guardar medición</button></div></form>`);
  }
  function summaryText(date){const day=dayData(date),target=getTargets(date),actual=totalMeal(date);const list=(day.sports||[]).map(x=>`• ${sportType[x.type]||x.type}, ${x.minutes} min, ${efforts[x.effort]}, ${x.time||'hora libre'} (${x.done?'realizado':'programado'})`).join('\n')||'Sin deportes registrados';
    const mealText=Object.keys(meals).map(k=>{const m=day.meals?.[k];return `• ${meals[k]}: ${m?`${m.note||'Sin descripción'} — ${m.cal} kcal, ${m.protein} g proteína`:'sin registrar'}`;}).join('\n');
    return `MI RESUMEN DE RITMO — ${date}\n${data.profile.sex==='f'?'Mujer':'Hombre'} de ${data.profile.age} años, ${data.profile.height} cm, ${data.profile.weight} kg de referencia. Meta: ${goalNames[data.profile.goal]||'recomposición'}.\nObjetivo estimado hoy: ${target.cal} kcal, ${target.protein} g de proteína.\nActividad:\n${list}\nFuerza: ${day.workout?.done?'Rutina '+day.workout.type+' completada':'sin rutina completada'}\nComidas:\n${mealText}\nRegistrado: ${actual.cal} kcal, ${actual.protein} g de proteína.\nDame recomendaciones para ajustar las comidas, fuerza y recuperación según mis planes. Considera que mis registros pueden estar incompletos.`;
  }
  async function shareSummary(){const msg=summaryText(daySelected);
    if(navigator.share){try{await navigator.share({title:'Ritmo · Resumen de mi día',text:msg});return;}catch(err){if(err?.name==='AbortError')return;}}
    try{await navigator.clipboard.writeText(msg);toast('Resumen copiado. Pégalo en ChatGPT.');return;}catch(e){}
    const ta=document.createElement('textarea');ta.value=msg;ta.style.position='fixed';ta.style.left='-10000px';document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand('copy');}catch(e){}ta.remove();if(ok){toast('Resumen copiado. Pégalo en ChatGPT.');return;}
    openDialog(`${dlgHeader('Resumen listo para copiar')}<textarea class="message-copy" style="min-height:270px" readonly>${html(msg)}</textarea><p class="form-note">Selecciona el texto, cópialo y pégalo en nuestra conversación.</p>`);
  }
  function exportBackup(){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`ritmo-respaldo-${TODAY()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Respaldo preparado para descargar.');}
  function validBackup(x){return x&&x.version===1&&x.profile&&typeof x.profile==='object'&&x.days&&typeof x.days==='object'&&!Array.isArray(x.days)&&Array.isArray(x.measurements)&&Object.keys(x.days).length<10000;}
  function handleAction(el){const a=el.dataset.action;
    switch(a){
      case 'statistics-range':statisticsRange=el.dataset.range==='all'?'all':Number(el.dataset.range)===30?30:7;render();break;
      case 'prev-day': daySelected=addDays(daySelected,-1);render();break;
      case 'next-day': daySelected=addDays(daySelected,1);render();break;
      case 'today':daySelected=TODAY();render();break;
      case 'tab':navigate(el.dataset.tab);break;
      case 'add-sport':sportDialog();break;
      case 'edit-sport':{const s=dayData(daySelected).sports.find(x=>x.id===el.dataset.id);if(s?.matchId){window.Retas?.openMatch(s.matchId);}else sportDialog(el.dataset.id);break;}
      case 'make-reta':{const s=(dayData(daySelected).sports||[]).find(x=>x.id===el.dataset.id);if(s){if(s.matchId){window.Retas?.openMatch(s.matchId);break;}currentTab='retas';render();window.Retas?.fromSport(s,daySelected);}break;}
      case 'toggle-sport':{const s=editableDay(daySelected).sports.find(x=>x.id===el.dataset.id);if(s){if(s.matchId){window.Retas?.openMatch(s.matchId);toast('Actualiza el estado desde la reta vinculada.');break;}s.done=!s.done;save();render();toast(s.done?'Partido marcado como realizado.':'Partido marcado como programado.');}break;}
      case 'delete-sport':if(confirm('¿Eliminar este partido?')){const d=editableDay(daySelected);d.sports=d.sports.filter(x=>x.id!==el.dataset.id);save();dialog.close();render();}break;
      case 'edit-meal':mealDialog(el.dataset.meal);break;
      case 'delete-meal':if(confirm('¿Eliminar este registro de comida?')){delete editableDay(daySelected).meals[el.dataset.meal];save();dialog.close();render();}break;
      case 'complete-workout':{const d=editableDay(daySelected);const old=d.workout;d.workout=(old?.type===el.dataset.type&&old.done)?null:{type:el.dataset.type,done:true};save();render();toast(d.workout?'Entrenamiento registrado.':'Registro de entrenamiento eliminado.');break;}
      case 'add-measure':measureDialog();break;
      case 'edit-measure':measureDialog(el.dataset.date);break;
      case 'delete-measure':if(confirm('¿Eliminar esta medición?')){data.measurements=data.measurements.filter(m=>m.date!==el.dataset.date);save();dialog.close();render();}break;
      case 'share-day':shareSummary();break;
      case 'redo-onboard':data.profile.onboarded=false;save();render();break;
      case 'share-card':shareCard();break;
      case 'add-food':{const f=FOODS[+el.dataset.i],c=document.getElementById('meal-cal'),pr=document.getElementById('meal-protein'),n=document.getElementById('meal-note');if(f&&c&&pr&&n){c.value=Math.round(number(c.value)+f[1]);pr.value=Math.round((number(pr.value)+f[2])*10)/10;n.value=(n.value?n.value+', ':'')+f[0];}break;}
      case 'close-dialog':dialog.close();break;
      case 'export':exportBackup();break;
      case 'import':document.getElementById('import-input')?.click();break;
      case 'reset':if(confirm('Se borrarán TODOS los registros locales. ¿Continuar?')&&confirm('¿Seguro? Esta acción no se puede deshacer sin un respaldo.')){data=defaultState();save();currentTab='inicio';daySelected=TODAY();render();toast('Los registros fueron borrados.');}break;
    }
  }
  function scrollTopSafe(){window.scrollTo({top:0,behavior:'instant'});}
  document.addEventListener('click',event=>{const t=event.target.closest('[data-action], [data-tab].nav-link');if(t){event.preventDefault();if(t.classList.contains('nav-link')){navigate(t.dataset.tab);}else handleAction(t);}});
  document.getElementById('settings-btn').addEventListener('click',()=>{currentTab='ajustes';render();scrollTopSafe();});
  document.addEventListener('change',async e=>{
    if(e.target.id==='day-picker'&&/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)){daySelected=e.target.value;render();}
    if(e.target.id==='import-input'&&e.target.files?.[0]){
      try{if(e.target.files[0].size>5_000_000)throw new Error('Archivo demasiado grande');const raw=JSON.parse(await e.target.files[0].text());if(!validBackup(raw))throw new Error('Formato de respaldo incorrecto');if(!confirm('¿Restaurar respaldo y reemplazar todos los registros actuales?'))return;data=raw;save();render();toast('Respaldo restaurado.');}catch(err){toast('No se pudo importar: '+(err?.message||'error'));}finally{e.target.value='';}
    }
  });
  document.addEventListener('submit',event=>{
    const f=event.target;
    if(!['sport-form','meal-form','measure-form','settings-form','onboard-form'].includes(f.id))return;
    event.preventDefault();const fd=new FormData(f);
    if(f.id==='onboard-form'){
      const sex=fd.get('sex')==='f'?'f':'m',age=number(fd.get('age')),height=number(fd.get('height')),weight=number(fd.get('weight')),goal=String(fd.get('goal'));
      if(age<18||age>100||height<120||height>230||weight<35||weight>300){toast('Verifica tus datos.');return;}
      const bmr=10*weight+6.25*height-5*age+(sex==='m'?5:-161),adj={bajar:-350,recomp:-100,ganar:250,mantener:0}[goal]??-100;
      const baseCalories=Math.max(1400,Math.round((bmr*1.35+adj)/50)*50),protein=Math.round(weight*({bajar:2,recomp:1.9,ganar:1.8,mantener:1.6}[goal]||1.8)/5)*5;
      const sports=fd.getAll('sports');data.profile={...data.profile,sex,age,height,weight,goal,baseCalories,protein,sports:sports.length?sports:['padel'],reminders:fd.get('reminders')==='on',onboarded:true};
      save();render();toast('Tu plan está listo.');
    }else if(f.id==='sport-form'){
      const minutes=number(fd.get('minutes'));
      if(minutes<10||minutes>600){toast('Ingresa una duración entre 10 y 600 minutos.');return;}
      const d=editableDay(daySelected);const id=f.dataset.editId;const record={id:id||uid(),type:String(fd.get('type')),minutes,effort:String(fd.get('effort')),time:String(fd.get('time')||''),rivals:String(fd.get('rivals')||'').slice(0,160),done:fd.get('status')==='done'};
      if(id){const idx=d.sports.findIndex(x=>x.id===id);if(idx>=0)d.sports[idx]=record;else d.sports.push(record);} else d.sports.push(record);
      save();dialog.close();render();toast('Partido guardado.');
    }else if(f.id==='meal-form'){
      const cal=number(fd.get('cal')),protein=number(fd.get('protein'));if(cal<0||cal>4000||protein<0||protein>200){toast('Verifica las cantidades.');return;}
      editableDay(daySelected).meals[f.dataset.meal]={cal,protein,note:String(fd.get('note')||'').slice(0,240)};
      save();dialog.close();render();toast('Comida guardada.');
    }else if(f.id==='measure-form'){
      const date=String(fd.get('date'));if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){toast('Fecha no válida.');return;}
      const weight=String(fd.get('weight')||'')?number(fd.get('weight')):null;
      const waist=String(fd.get('waist')||'')?number(fd.get('waist')):null;
      if(weight==null && waist==null){toast('Ingresa peso, cintura o ambos.');return;}
      if((weight!=null&&(weight<30||weight>300))||(waist!=null&&(waist<45||waist>180))){toast('Verifica las medidas.');return;}
      data.measurements=data.measurements.filter(x=>x.date!==date&&x.date!==f.dataset.originalDate);data.measurements.push({date,weight,waist});
      save();dialog.close();render();toast('Medición guardada.');
    }else if(f.id==='settings-form'){
      const age=number(fd.get('age')),height=number(fd.get('height')),weight=number(fd.get('weight')),protein=number(fd.get('protein')),baseCalories=number(fd.get('baseCalories'));
      if(age<18||age>100||height<100||height>230||weight<30||weight>300||protein<50||protein>250||baseCalories<1200||baseCalories>4500){toast('Verifica los datos del perfil.');return;}
      data.profile={...data.profile,age,height,weight,protein,baseCalories,onboarded:true};save();render();toast('Perfil actualizado.');
    }
  });
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost')){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(e=>console.warn('No se pudo habilitar modo sin conexión',e)));
  }
  function navigate(tab){if(tab==='fuerza'){location.assign('./fuerza.html');return;}currentTab=tab;render();scrollTopSafe();}
  window.RitmoNavigate = navigate;
  window.RitmoAddSportMatch = (m,originId)=>{
    if(!m?.id||!/^\d{4}-\d{2}-\d{2}$/.test(m.date))return;
    let record=null;
    for(const day of Object.values(data.days)){const hits=(day.sports||[]).filter(s=>s.matchId===m.id||(originId&&s.id===originId));if(hits.length){const source=originId&&hits.find(s=>s.id===originId);if(!record||source)record=source||hits[0];day.sports=day.sports.filter(s=>!hits.includes(s));}}
    const d=editableDay(m.date);record??={id:uid(),minutes:90,effort:'moderado'};
    d.sports.push({...record,matchId:m.id,type:m.sport,time:m.time,rivals:(m.teams?.[1]||[]).join(', '),done:m.status==='finalizado',status:m.status||'programado'});save();
  };
  for(const m of window.Retas?.getMatches?.()||[])window.RitmoAddSportMatch(m);

  function refreshStored(){const next=load();if(JSON.stringify(next)!==JSON.stringify(data)){data=next;render();}}
  window.addEventListener('storage',e=>{if(e.key===KEY)refreshStored();});
  window.addEventListener('pageshow',refreshStored);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshStored();});
  render();
})();
