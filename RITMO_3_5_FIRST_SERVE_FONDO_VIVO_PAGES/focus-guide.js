/* Exercise-specific ball paths. These are trajectory guides, not human technique videos. */
(()=>{'use strict';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Each lesson has its own action cue; paths encode bounce, wall, lateral and diagonal tasks.
const cues=[
['Lanza una pelota blanda a la altura de tus ojos.','Recíbela con ambas manos, sin desplazarte.','Repite 20 capturas lentas.'],
['Lanza desde la mano derecha hacia la izquierda.','Captura con la mano contraria; cambia el sentido.','Mantén el lanzamiento por debajo de la cara.'],
['Suelta la pelota delante de ti.','Deja que bote una vez.','Captura con ambas manos antes del segundo bote.'],
['Bota con la mano derecha una vez.','Recibe con la izquierda y bota de nuevo.','Alterna manteniendo la pelota cerca del cuerpo.'],
['Lanza a una altura baja y captura.','El siguiente lanzamiento llega a la altura de ojos.','Alterna las dos alturas con control.'],
['Lanza suavemente hacia arriba.','Da una palmada mientras la pelota está en el aire.','Captura con ambas manos.'],
['Sitúate frente a una pared libre.','Lanza suavemente contra la pared, por debajo del rostro.','Captura el rebote sin perseguirlo.'],
['Lanza la pelota verticalmente.','Da un paso lateral corto.','Regresa al punto de caída y captura.'],
['Lanza y captura solo con la derecha.','Repite solo con la izquierda.','Alterna cada cinco capturas.'],
['Lanza a baja altura y captura con ambas manos.','Cuenta cada captura limpia.','Busca 20 seguidas; reinicia la cuenta si cae.'],
['Lanza contra la pared con la derecha.','Captura con la izquierda.','Invierte las manos en la siguiente repetición.'],
['Lanza a baja altura.','Da dos palmadas rápidas sin perder la pelota de vista.','Captura; reduce a una palmada si no hay control.'],
['Lanza suavemente contra la pared.','Haz un paso lateral corto siguiendo el rebote.','Captura y vuelve al centro.'],
['Pide lanzamientos suaves entre cintura y pecho.','Ajusta la altura de tus manos.','Captura sin bloquear los codos.'],
['Lanza hacia arriba a baja altura.','Gira solo 90 grados, manteniendo la pelota visible.','Captura y alterna el sentido del giro.'],
['Sitúate frente a la pared con tu mano no dominante.','Lanza y captura con esa misma mano.','Acércate si pierdes precisión.'],
['Lanza a baja altura.','Toca una rodilla con la mano libre.','Captura y cambia de mano y rodilla.'],
['Un compañero sostiene una pelota blanda.','Al decir «ya», la suelta a baja altura.','Captura después de un bote.'],
['Sostén una pelota en cada mano.','Lanza una, captura y después lanza la otra.','Empieza de forma secuencial, sin cruzar trayectorias.'],
['Lanza suavemente y captura.','Cuenta las capturas sin acelerar.','Busca 30 controladas; reinicia si cae.'],
['Lanza a una zona lateral de la pared.','Captura con la mano de ese lado.','Alterna derecha e izquierda.'],
['Lanza verticalmente a baja altura.','Da dos pasos laterales cortos y vuelve.','Captura; acorta los pasos si pierdes el control.'],
['Da un paso a la derecha y lanza.','Cambia hacia la izquierda mientras cae.','Captura y repite invirtiendo la dirección.'],
['Lanza de forma que puedas mantener la pelota visible.','Gira en dos pasos hasta 180 grados.','Captura con control; vuelve a 90 grados si hace falta.'],
['Lanza la primera pelota.','Lanza la segunda solo después de capturar la primera.','Acorta el intervalo cuando domines la secuencia.'],
['Lanza suavemente contra la pared.','Toca un cono cercano con la mano libre.','Captura y alterna el lado del cono.'],
['Asigna verde a derecha y azul a izquierda.','Tu compañero muestra un color y lanza suavemente.','Captura con la mano indicada.'],
['Lanza una pelota a baja altura.','Haz un pequeño split-step, aterrizando suave.','Captura con los pies estables.'],
['Lanza a un punto ligeramente diagonal.','Da uno o dos pasos cortos hacia ese punto.','Captura y regresa al centro.'],
['Alterna 20 s de lanzamiento vertical y captura.','Continúa 20 s de bote y captura.','Termina 20 s de rebote contra pared.'],
['Un compañero sostiene dos pelotas de distinto color.','Solo lanza la pelota del color que anuncia.','Captura esa pelota con ambas manos.'],
['Lanza primero una pelota contra la pared.','Captúrala antes de lanzar la segunda.','Alterna las manos y reduce poco a poco el intervalo.'],
['Tu compañero señala derecha o izquierda al azar.','Da dos pasos cortos en esa dirección.','Recibe un lanzamiento suave y vuelve al centro.'],
['Acuerda las señales «derecha» e «izquierda».','Tu compañero anuncia la mano antes de lanzar.','Captura con esa mano, sin anticipar.'],
['Lanza una pelota hasta el pecho.','Tras capturarla, lanza la otra a menor altura.','Alterna manos y alturas con control.'],
['Lanza contra pared y recibe.','Gira 90 grados con la pelota en las manos.','Vuelve al frente para el siguiente lanzamiento.'],
['Un compañero varía el lado del lanzamiento.','Muévete con pasos cortos, mirando la pelota.','Captura sin estirarte fuera de equilibrio.'],
['Mira un punto central frente a ti.','Tu compañero muestra un color a cada lado.','Di el color antes de recibir un lanzamiento suave.'],
['Tu compañero indica una secuencia: derecha, izquierda, centro.','Haz un paso corto en cada dirección.','Captura al terminar y repite una nueva secuencia.'],
['Durante 40 s, recibe lanzamientos suaves a distintos lados.','Cuenta solo capturas limpias.','Descansa 20 s y compara tu precisión.'],
['Usa dos pelotas y un compañero.','Recibe una por la derecha; devuelve antes de recibir la otra por izquierda.','Alterna rutas sin lanzar ambas a la vez.'],
['Tu compañero sostiene la pelota y anuncia la mano al soltarla.','Deja un bote para tener tiempo de respuesta.','Captura con la mano indicada.'],
['Tu compañero anuncia la mano antes de cada rebote.','Lanza contra la pared y captura con esa mano.','Mantén el ritmo cómodo y las trayectorias bajas.'],
['Tu compañero lanza a un punto diagonal cercano.','Da pasos cortos sin cruzar bruscamente los pies.','Captura y recupera tu posición.'],
['Asigna verde a derecha y azul a izquierda.','Tu compañero muestra color y señala una dirección.','Da un paso hacia esa dirección y captura con la mano del color.'],
['Acuerda «atrapa» o «bote».','Tu compañero anuncia la señal al lanzar suavemente.','Captura de inmediato o deja un bote según la señal.'],
['Un compañero sostiene dos pelotas.','Anuncia «una» o «dos» y las entrega de forma secuencial.','Recibe y devuelve cada una antes de la siguiente.'],
['Lanza contra la pared con la mano no dominante.','Captura con esa misma mano.','Cuenta repeticiones limpias antes de aumentar ritmo.'],
['Tu compañero alterna señales de mano, color y lado.','Haz una sola respuesta por lanzamiento.','Reinicia despacio cuando encadenes dos errores.'],
['Combina 10 s de captura por color y 10 s por mano.','Continúa 10 s de bote indicado y 10 s de paso lateral.','Prioriza decisiones correctas; descansa los siguientes 20 s.']
];
function render(name,l=1,index=0){const n=name.toLowerCase(),key=Math.max(0,Math.min(49,(l-1)*10+index));let steps=cues[key];if(name==='Split-step y desplazamientos')steps=['Posición cómoda con rodillas ligeramente flexionadas.','Haz un pequeño salto y aterriza suavemente con ambos pies.','Da dos pasos laterales y vuelve al centro; alterna lados.'];
const wall=/pared|rebote/.test(n),bounce=/bote|botar/.test(n),side=/lateral|paso|desplaz|direcci|diagonal|split/.test(n),two=/dos pelotas|doble|dos rebotes/.test(n),color=/color|señal|decisi|audio|sonora|boss|gauntlet/.test(n),turn=/giro|gira/.test(n);
let path=wall?'M100 130 Q230 80 340 120 Q250 155 150 175':bounce?'M110 90 Q170 160 210 230 Q250 150 310 110':side?'M100 170 Q210 30 340 170':/mano contraria|entre manos|alternando manos|ambas manos por turnos/.test(n)?'M150 180 Q210 10 270 180':'M210 180 Q210 -60 210 180';
if(!wall&&!bounce&&!side&&/alturas/.test(n))path='M210 180 Q210 80 210 180 Q210 -60 210 180';
if(/respira|atención al cuerpo|medita|visualiza/.test(n))return `<figure class="focus-guide breathing"><svg viewBox="0 0 420 260" role="img" aria-label="Guía de respiración lenta"><circle cx="210" cy="130" r="60" fill="none" stroke="#baff80" stroke-width="4"><animate attributeName="r" values="45;85;45" dur="8s" repeatCount="indefinite"/></circle><text x="210" y="135" text-anchor="middle" fill="white" font-size="16">RESPIRA SUAVE</text></svg><figcaption>El círculo crece al inhalar y se reduce al exhalar. Respira a tu ritmo, sin retenciones.</figcaption></figure>`;
if(/descanso/.test(n))return '<div class="focus-rest"><b>RECUPERA</b><p>Respira con normalidad. Prepara el siguiente movimiento.</p></div>';
return `<figure class="focus-guide"><svg viewBox="0 0 420 260" role="img" aria-label="Trayectoria de ${esc(name)}"><path d="M40 230H380" stroke="#a8c6b0" stroke-width="2"/>${wall?'<path d="M350 30V230" stroke="#baff80" stroke-width="7"/><text x="330" y="24" fill="#d8e9da" font-size="11">PARED</text>':''}<path d="${path}" fill="none" stroke="#a9c5b4" stroke-width="2" stroke-dasharray="6 6"/><circle r="11" fill="#d0ff82"><animateMotion dur="3s" repeatCount="indefinite" path="${path}"/></circle>${two?`<circle r="10" fill="#81cffc"><animateMotion dur="3s" begin="1.5s" repeatCount="indefinite" path="${path}"/></circle>`:''}<text x="85" y="205" fill="#e1f3e5" font-size="12">MANO / INICIO</text><text x="270" y="205" fill="#e1f3e5" font-size="12">CAPTURA</text>${side?'<path d="M100 245H320m-10 -7 10 7 -10 7" fill="none" stroke="#baff80" stroke-width="2"/>':''}${turn?'<text x="20" y="35" fill="#baff80" font-size="14">GIRO CONTROLADO · MIRA LA PELOTA</text>':''}${color?'<text x="20" y="55" fill="#81cffc" font-size="13">ESPERA LA SEÑAL DEL COMPAÑERO</text>':''}</svg><figcaption>Guía de trayectoria · ${esc(name)}. La velocidad del dibujo es orientativa.</figcaption><ol>${steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></figure>`;
}
window.RitmoFocusGuide={render};
})();
