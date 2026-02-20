const fs = require('fs');
const path = require('path');

function simpleReplace(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let count = 0;
  
  for (const [old, nw, label] of replacements) {
    const normalizedContent = content.replace(/\r\n/g, '\n');
    const normalizedOld = old.replace(/\r\n/g, '\n');
    
    if (normalizedContent.includes(normalizedOld)) {
      const idx = normalizedContent.indexOf(normalizedOld);
      let origIdx = 0, normIdx = 0;
      while (normIdx < idx) {
        if (content[origIdx] === '\r' && content[origIdx + 1] === '\n') { origIdx += 2; normIdx++; }
        else { origIdx++; normIdx++; }
      }
      let origEnd = origIdx, normEnd = normIdx;
      while (normEnd < idx + normalizedOld.length) {
        if (content[origEnd] === '\r' && content[origEnd + 1] === '\n') { origEnd += 2; normEnd++; }
        else { origEnd++; normEnd++; }
      }
      const useCRLF = content.includes('\r\n');
      let replacement = nw;
      if (useCRLF) replacement = nw.replace(/\n/g, '\r\n');
      content = content.substring(0, origIdx) + replacement + content.substring(origEnd);
      console.log('  OK: ' + label);
      count++;
    } else {
      console.log('  MISS: ' + label);
    }
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  Saved (${count} changes): ${filePath}\n`);
}

const base = __dirname;

// ========================
// ACTIVIDADES.VUE
// ========================
console.log('=== Actividades.vue ===');
simpleReplace(path.join(base, 'src/views/actividades/Actividades.vue'), [
  // Modal 2: Nueva Actividad
  ['    <!-- Modal Nueva Actividad -->\n    <div v-if="modalNuevaActividad" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n      <div class="absolute inset-0 bg-black/50 backdrop-blur-[2px]" @click="modalNuevaActividad = false"></div>\n      <div class="relative max-w-lg w-full max-h-[90vh] rounded-2xl overflow-hidden flex flex-col border border-natillera-200/60 shadow-2xl shadow-natillera-900/10 bg-gradient-to-b from-white to-natillera-50/30">',
   '    <!-- Modal Nueva Actividad -->\n    <ModalWrapper\n      :show="!!modalNuevaActividad"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="relative max-w-lg w-full max-h-[90vh] rounded-2xl overflow-hidden flex flex-col border border-natillera-200/60 shadow-2xl shadow-natillera-900/10 bg-gradient-to-b from-white to-natillera-50/30"\n      card-max-width="32rem"\n      @close="modalNuevaActividad = false"\n    >',
   'Open: Nueva Actividad'],
  // Modal 3: Detalle Actividad
  ['    <!-- Modal Detalle Actividad en Curso -->\n    <div v-if="modalDetalleActividad && actividadSeleccionada" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalDetalleActividad = false"></div>\n      <div class="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">',
   '    <!-- Modal Detalle Actividad en Curso -->\n    <ModalWrapper\n      :show="!!(modalDetalleActividad && actividadSeleccionada)"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"\n      card-max-width="56rem"\n      @close="modalDetalleActividad = false"\n    >',
   'Open: Detalle Actividad'],
  // Modal 4: Liquidar
  ['    <!-- Modal Liquidar Actividad -->\n    <div v-if="modalLiquidarActividad && actividadSeleccionada" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalLiquidarActividad = false"></div>\n      <div class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">',
   '    <!-- Modal Liquidar Actividad -->\n    <ModalWrapper\n      :show="!!(modalLiquidarActividad && actividadSeleccionada)"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"\n      card-max-width="28rem"\n      @close="modalLiquidarActividad = false"\n    >',
   'Open: Liquidar'],
  // Modal 5: Confirmar Liquidación Negativa
  ['    <!-- Modal Confirmar Liquidación con Utilidad Negativa -->\n    <div v-if="modalConfirmarLiquidacionNegativa && actividadSeleccionada" class="fixed inset-0 z-[60] flex items-center justify-center p-4">\n      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="modalConfirmarLiquidacionNegativa = false"></div>\n      <div class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">',
   '    <!-- Modal Confirmar Liquidación con Utilidad Negativa -->\n    <ModalWrapper\n      :show="!!(modalConfirmarLiquidacionNegativa && actividadSeleccionada)"\n      :z-index="60"\n      overlay-class="fixed inset-0 z-[60] flex items-center justify-center p-4"\n      card-class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"\n      card-max-width="28rem"\n      @close="modalConfirmarLiquidacionNegativa = false"\n    >',
   'Open: Confirmar Liquidación Negativa'],
  // Modal 6: Ganador Rifa
  ['    <!-- Modal Ganador Rifa (rifa liquidada) -->\n    <div v-if="modalGanadorRifa && actividadSeleccionada" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" data-modal="ganador-rifa">\n      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="modalGanadorRifa = false"></div>\n      <div class="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 sm:animate-none">',
   '    <!-- Modal Ganador Rifa (rifa liquidada) -->\n    <ModalWrapper\n      :show="!!(modalGanadorRifa && actividadSeleccionada)"\n      :z-index="50"\n      align="bottom"\n      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"\n      card-class="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"\n      card-max-width="28rem"\n      @close="modalGanadorRifa = false"\n    >',
   'Open: Ganador Rifa'],
  // Modal 7: Ver Ganadores Grupo
  ['    <!-- Modal Ver ganadores (grupo de rifas) -->\n    <div v-if="grupoGanadoresSeleccionado" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" data-modal="ver-ganadores-grupo">\n      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="grupoGanadoresSeleccionado = null"></div>\n      <div class="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200 sm:animate-none max-h-[90vh] flex flex-col">',
   '    <!-- Modal Ver ganadores (grupo de rifas) -->\n    <ModalWrapper\n      :show="!!grupoGanadoresSeleccionado"\n      :z-index="50"\n      align="bottom"\n      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"\n      card-class="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"\n      card-max-width="32rem"\n      @close="grupoGanadoresSeleccionado = null"\n    >',
   'Open: Ver Ganadores Grupo'],
  // Modal 8: Venta Rifa
  ['    <!-- Modal de venta de rifa -->\n    <div v-if="modalVentaRifa" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalVentaRifa = false"></div>\n      <div class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">',
   '    <!-- Modal de venta de rifa -->\n    <ModalWrapper\n      :show="!!modalVentaRifa"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"\n      card-max-width="28rem"\n      @close="modalVentaRifa = false"\n    >',
   'Open: Venta Rifa'],
  // Modal 9: Pagar Rifa
  ['    <!-- Modal de pago de rifa -->\n    <div v-if="modalPagarRifa" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalPagarRifa = false"></div>\n      <div class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">',
   '    <!-- Modal de pago de rifa -->\n    <ModalWrapper\n      :show="!!modalPagarRifa"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"\n      card-max-width="28rem"\n      @close="modalPagarRifa = false"\n    >',
   'Open: Pagar Rifa'],
  // Modal 10: Eliminar Actividad
  ['    <!-- Modal de confirmación para eliminar actividad -->\n    <div v-if="actividadAEliminar" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="actividadAEliminar = null"></div>\n      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden">',
   '    <!-- Modal de confirmación para eliminar actividad -->\n    <ModalWrapper\n      :show="!!actividadAEliminar"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden"\n      card-max-width="28rem"\n      @close="actividadAEliminar = null"\n    >',
   'Open: Eliminar Actividad'],
  // Modal 11: Eliminar Grupo
  ['  <!-- Modal de confirmación para eliminar grupo -->\n  <div v-if="grupoAEliminar" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="grupoAEliminar = null"></div>\n    <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden">',
   '  <!-- Modal de confirmación para eliminar grupo -->\n  <ModalWrapper\n    :show="!!grupoAEliminar"\n    :z-index="50"\n    overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n    card-class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden"\n    card-max-width="28rem"\n    @close="grupoAEliminar = null"\n  >',
   'Open: Eliminar Grupo'],
  // Modal 12: Asignar Faltante
  ['  <!-- Modal para asignar faltante a socio -->\n  <div v-if="modalAsignarFaltante && faltanteSeleccionado" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalAsignarFaltante = false"></div>\n    <div class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">',
   '  <!-- Modal para asignar faltante a socio -->\n  <ModalWrapper\n    :show="!!(modalAsignarFaltante && faltanteSeleccionado)"\n    :z-index="50"\n    overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n    card-class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"\n    card-max-width="28rem"\n    @close="modalAsignarFaltante = false"\n  >',
   'Open: Asignar Faltante'],
  // Modal 13: Confirmar Asignar Faltante Todos Meses
  ['  <!-- Modal de confirmación: asignar faltante en todos los meses de la actividad -->\n  <div v-if="modalConfirmarAsignarFaltanteTodosMeses" class="fixed inset-0 z-[60] flex items-center justify-center p-4">\n    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalConfirmarAsignarFaltanteTodosMeses = false"></div>\n    <div class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">',
   '  <!-- Modal de confirmación: asignar faltante en todos los meses de la actividad -->\n  <ModalWrapper\n    :show="!!modalConfirmarAsignarFaltanteTodosMeses"\n    :z-index="60"\n    overlay-class="fixed inset-0 z-[60] flex items-center justify-center p-4"\n    card-class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"\n    card-max-width="28rem"\n    @close="modalConfirmarAsignarFaltanteTodosMeses = false"\n  >',
   'Open: Confirmar Asignar Faltante Todos Meses'],
]);

// Now fix the closing tags for Actividades.vue
// We need to replace the closing </div></div></div> (3 levels) or </div></div> (2 levels if card had no extra wrapper) with </ModalWrapper>
// The pattern is always: closing of card content + </div>(card) + </div>(overlay) replaced by closing of card content + </ModalWrapper>
// Since ModalWrapper provides the overlay and card divs, we need to remove 2 closing </div>s

console.log('=== Actividades.vue - Closings ===');
// For closings, we need unique context before each closing pattern
simpleReplace(path.join(base, 'src/views/actividades/Actividades.vue'), [
  // Bienvenida closing - already done in first run
  // But we need to fix ALL modal closings now. Each modal that was 3 divs deep now needs only ModalWrapper closing.
  // The structure was: <div overlay><div backdrop/><div card>CONTENT</div></div></div>
  // Now it's: <ModalWrapper>CONTENT</ModalWrapper>
  // So we need to remove the card's </div> and overlay's </div>, replacing with </ModalWrapper>
]);

console.log('\nDone! Now fix closings manually or with additional passes.');
