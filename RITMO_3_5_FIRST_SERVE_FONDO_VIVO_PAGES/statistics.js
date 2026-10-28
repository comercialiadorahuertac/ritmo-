/* Estadísticas derivadas: no modifica registros ni infiere identidades de jugadores. */
(function(root){
 'use strict';
 const num=x=>Number.isFinite(Number(x))?Math.max(0,Number(x)):0;
 const localDate=x=>{if(/^\d{4}-\d{2}-\d{2}$/.test(x||''))return x;const d=new Date(x);return Number.isNaN(d.getTime())?'':`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
 const shift=(date,n)=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+n);return localDate(d);};
 function summarize(data={},sessions=[],matches=[],end=localDate(new Date()),range=7){
  const start=range==='all'?'0000-00-00':shift(end,1-Number(range));
  const inside=date=>date&&date>=start&&date<=end;
  const active=new Set(),daily={},bySport={},seenSports=new Set(),seenSessions=new Set();
  let played=0,planned=0,sportMinutes=0,strengthSeconds=0,complete=0,partial=0,manual=0,mealDays=0;
  const history=Array.isArray(sessions)?sessions:[];
  const addMinutes=(date,minutes)=>{daily[date]=(daily[date]||0)+minutes;if(minutes>0)active.add(date);};
  for(const s of history){if(!s?.id||seenSessions.has(s.id))continue;seenSessions.add(s.id);const date=localDate(s.date);if(!inside(date))continue;
   const seconds=Math.min(1800,num(s.duration));strengthSeconds+=seconds;addMinutes(date,seconds/60);
   if(s.completed===true)complete++;else if(seconds>0)partial++;
  }
  for(const [date,day] of Object.entries(data.days||{})){
   if(!inside(date)||!day)continue;
   if(Object.keys(day.meals||{}).length)mealDays++;
   if(day.workout?.done){active.add(date);if(!seenSessions.has(day.workout.sessionId)){manual++;}}
   for(const s of Array.isArray(day.sports)?day.sports:[]){if(!s)continue;const key=s.matchId||s.id;if(key&&seenSports.has(key))continue;if(key)seenSports.add(key);
    if(s.status==='cancelado')continue;
    if(!s.done){planned++;continue;}played++;active.add(date);const minutes=num(s.minutes);sportMinutes+=minutes;addMinutes(date,minutes);bySport[s.type]=(bySport[s.type]||0)+1;
   }
  }
  const uniqueMatches=new Map();for(const m of Array.isArray(matches)?matches:[]){if(m?.id)uniqueMatches.set(m.id,m);}
  const results=[...uniqueMatches.values()].filter(m=>inside(m.date)&&m.status==='finalizado').map(m=>{
   const sets=(m.sets||[]).filter(s=>s&&Number.isInteger(s.a)&&Number.isInteger(s.b)&&s.a>=0&&s.b>=0&&s.a<=99&&s.b<=99);
   const a=sets.filter(s=>s.a>s.b).length,b=sets.filter(s=>s.b>s.a).length;
   return {id:m.id,date:m.date,teams:m.teams||[],sets,a,b,winner:sets.length&&a!==b?(a>b?0:1):null};
  }).sort((a,b)=>b.date.localeCompare(a.date));
  return {start,end,played,planned,sportMinutes,strengthMinutes:strengthSeconds/60,totalMinutes:sportMinutes+strengthSeconds/60,complete,partial,manual,mealDays,activeDays:active.size,bySport,results,scored:results.filter(r=>r.sets.length).length,daily};
 }
 const api={summarize,localDate};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.RitmoStatistics=api;
})(typeof window==='undefined'?globalThis:window);
