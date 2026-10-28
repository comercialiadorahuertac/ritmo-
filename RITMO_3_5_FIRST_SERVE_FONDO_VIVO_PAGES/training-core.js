/* Shared deterministic training clock, also tested without the DOM. */
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.RitmoTraining=api;})(typeof window==='object'?window:globalThis,()=>{
'use strict';
const DURATION=1800;
function timeline(ids){if(!ids.length)throw Error('Selecciona ejercicios');const slots=Array.from({length:8},(_,i)=>ids[i%ids.length]);const blocks=[{id:'arms',name:'Activación de hombros',type:'Preparación',seconds:60},{id:'squat',name:'Sentadilla suave sin carga',type:'Preparación',seconds:60},{id:'cat',name:'Movilidad de espalda',type:'Preparación',seconds:60}];for(let round=1;round<=3;round++)slots.forEach((id,i)=>{blocks.push({id,type:'Trabajo',seconds:45,round});blocks.push({id:round===3&&i===7?'cat':slots[(i+1)%8],type:'Descanso',seconds:15,round});});blocks.push({id:'cat',type:'Cierre',seconds:90},{id:'child',type:'Cierre',seconds:90});return blocks;}
function step(blocks,elapsed){let offset=0;for(let i=0;i<blocks.length;i++){const b=blocks[i];if(elapsed<offset+b.seconds)return {index:i,block:b,offset,remaining:b.seconds-(elapsed-offset)};offset+=b.seconds;}return null;}
function elapsed(s,now=Date.now()){return Math.min(DURATION,Math.max(0,s.elapsed+(s.running?Math.max(0,now-s.anchor)/1000:0)));}
function snapshot(s,now=Date.now()){return {...s,elapsed:elapsed(s,now),anchor:now};}
function dateKey(d=new Date()){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
return {DURATION,timeline,step,elapsed,snapshot,dateKey};
});
