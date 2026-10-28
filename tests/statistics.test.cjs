const test=require('node:test'),assert=require('node:assert/strict');
const {summarize}=require('../RITMO_3_5_FIRST_SERVE_FONDO_VIVO_PAGES/statistics.js');
test('estadísticas separan planes, duplicados, Fuerza manual y tiempo cronometrado',()=>{
 const session={id:'s1',date:'2026-10-28',completed:true,duration:1800};
 const sport={id:'a',matchId:'m1',done:true,minutes:60,type:'padel'};
 const data={days:{'2026-10-28':{sports:[sport,{...sport,id:'duplicate'},{id:'pending',minutes:90,done:false},{id:'cancel',done:false,status:'cancelado'}],workout:{done:true,sessionId:'s1'},meals:{comida:{}}},'2026-10-27':{workout:{done:true},sports:[]}}};
 const s=summarize(data,[session,session,{id:'s2',date:'2026-10-28',completed:false,duration:600},{id:'skip-all',date:'2026-10-28',completed:false,duration:0}],[], '2026-10-28',7);
 assert.equal(s.played,1);assert.equal(s.planned,1);assert.equal(s.totalMinutes,100);assert.equal(s.complete,1);assert.equal(s.partial,1);assert.equal(s.manual,1);assert.equal(s.activeDays,2);assert.equal(s.mealDays,1);assert.deepEqual(s.bySport,{padel:1});
});
test('periodos excluyen futuros y resultados no infieren victorias personales',()=>{
 const matches=[{id:'m',date:'2026-10-28',status:'finalizado',teams:[['Ana'],['Luis']],sets:[{a:6,b:2},{a:6,b:4}]},{id:'pending',date:'2026-10-28',status:'programado',sets:[{a:6,b:0}]}];
 const data={days:{'2026-10-01':{sports:[{id:'old',done:true,minutes:30}]},'2026-10-29':{sports:[{id:'future',done:true,minutes:99}]}}};
 assert.equal(summarize(data,[],matches,'2026-10-28',7).played,0);
 const s=summarize(data,[],matches,'2026-10-28','all');assert.equal(s.played,1);assert.equal(s.scored,1);assert.equal(s.results[0].winner,0);assert.equal(s.wins,undefined);
});
