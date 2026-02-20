const fs = require('fs');
const path = require('path');

function migrateModals(filePath, modals) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  for (const modal of modals) {
    const { vIf, overlayClass, backdropClick, cardClass, zIndex, cardMaxWidth, align, dataAttr } = modal;
    
    // Build the old pattern parts
    const dataAttrStr = dataAttr ? ` data-modal="${dataAttr}"` : '';
    const oldOpen = `<div v-if="${vIf}" class="${overlayClass}"${dataAttrStr}>`;
    
    // Find the backdrop line
    const openIdx = content.indexOf(oldOpen);
    if (openIdx === -1) {
      console.log(`  WARNING: Could not find modal: ${vIf}`);
      continue;
    }
    
    // Find next line with backdrop
    const afterOpen = content.indexOf('\n', openIdx) + 1;
    const backdropLineEnd = content.indexOf('\n', afterOpen);
    const backdropLine = content.substring(afterOpen, backdropLineEnd).trim();
    
    // Find the card div line
    const cardLineStart = backdropLineEnd + 1;
    const cardLineEnd = content.indexOf('\n', cardLineStart);
    const cardLine = content.substring(cardLineStart, cardLineEnd).trim();
    
    // Extract card classes from the card line
    const cardClassMatch = cardLine.match(/class="([^"]+)"/);
    const actualCardClass = cardClassMatch ? cardClassMatch[1] : cardClass;
    
    // Build the z-index number
    const zMatch = overlayClass.match(/z-\[?(\d+)\]?/);
    const zNum = zIndex || (zMatch ? parseInt(zMatch[1]) : 50);
    
    // Build align prop
    const alignProp = align ? `\n      align="${align}"` : '';
    
    // Build new ModalWrapper opening
    const newOpen = `<ModalWrapper
      :show="!!(${vIf})"
      :z-index="${zNum}"${alignProp}
      overlay-class="${overlayClass}"
      card-class="${actualCardClass}"${cardMaxWidth ? `\n      card-max-width="${cardMaxWidth}"` : ''}
      @close="${backdropClick}"
    >`;
    
    // Replace the 3 lines (open + backdrop + card) with ModalWrapper
    const oldBlock = content.substring(openIdx, cardLineEnd);
    content = content.replace(oldBlock, newOpen);
    
    console.log(`  ✓ Migrated modal: ${vIf}`);
  }
  
  // Now replace closing divs - for each ModalWrapper we need to fix closings
  // We count from the end of the content, finding each </ModalWrapper-needs-fix pattern
  // Actually, let's do it differently - find each </div>\n    </div>\n    </div> pattern near modal ends
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  File saved: ${filePath}`);
}

// For closing tags, we need to handle each one specifically
function fixClosings(filePath, closingPatterns) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  for (const { before, oldClosing, newClosing } of closingPatterns) {
    const beforeIdx = content.indexOf(before);
    if (beforeIdx === -1) {
      console.log(`  WARNING closing: Could not find "${before.substring(0, 50)}..."`);
      continue;
    }
    const searchFrom = beforeIdx + before.length;
    const closeIdx = content.indexOf(oldClosing, searchFrom);
    if (closeIdx === -1 || (closeIdx - searchFrom) > 500) {
      console.log(`  WARNING closing: Could not find closing near "${before.substring(0, 50)}..."`);
      continue;
    }
    content = content.substring(0, closeIdx) + newClosing + content.substring(closeIdx + oldClosing.length);
    console.log(`  ✓ Fixed closing for: ${before.substring(0, 40)}...`);
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
}

// Actually, a simpler approach: replace the exact old 3 lines with new ModalWrapper, 
// and replace exact closing 3 divs with </ModalWrapper>

// Let's use a different strategy: just do simple string replacements
function simpleReplace(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  for (const [old, nw, label] of replacements) {
    if (content.includes(old)) {
      content = content.replace(old, nw);
      console.log(`  ✓ ${label}`);
    } else {
      console.log(`  ✗ NOT FOUND: ${label}`);
    }
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  Saved: ${filePath}\n`);
}

// ========================
// ACTIVIDADES.VUE
// ========================
console.log('\n=== Actividades.vue ===');
const actFile = path.join(__dirname, 'src/views/actividades/Actividades.vue');
simpleReplace(actFile, [
  // Modal 1: Bienvenida
  [
    `    <!-- Modal de Bienvenida / Tutorial -->\n    <div v-if="mostrarModalBienvenida" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="cerrarModalBienvenida"></div>\n      <div class="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">`,
    `    <!-- Modal de Bienvenida / Tutorial -->\n    <ModalWrapper\n      :show="!!mostrarModalBienvenida"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"\n      card-max-width="48rem"\n      @close="cerrarModalBienvenida"\n    >`,
    'Open: Modal Bienvenida'
  ],
  // Modal 2: Nueva Actividad
  [
    `    <!-- Modal Nueva Actividad -->\n    <div v-if="modalNuevaActividad" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n      <div class="absolute inset-0 bg-black/50 backdrop-blur-[2px]" @click="modalNuevaActividad = false"></div>\n      <div class="relative max-w-lg w-full max-h-[90vh] rounded-2xl overflow-hidden flex flex-col border border-natillera-200/60 shadow-2xl shadow-natillera-900/10 bg-gradient-to-b from-white to-natillera-50/30">`,
    `    <!-- Modal Nueva Actividad -->\n    <ModalWrapper\n      :show="!!modalNuevaActividad"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="relative max-w-lg w-full max-h-[90vh] rounded-2xl overflow-hidden flex flex-col border border-natillera-200/60 shadow-2xl shadow-natillera-900/10 bg-gradient-to-b from-white to-natillera-50/30"\n      card-max-width="32rem"\n      @close="modalNuevaActividad = false"\n    >`,
    'Open: Modal Nueva Actividad'
  ],
  // Modal 3: Detalle Actividad
  [
    `    <!-- Modal Detalle Actividad en Curso -->\n    <div v-if="modalDetalleActividad && actividadSeleccionada" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalDetalleActividad = false"></div>\n      <div class="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">`,
    `    <!-- Modal Detalle Actividad en Curso -->\n    <ModalWrapper\n      :show="!!(modalDetalleActividad && actividadSeleccionada)"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"\n      card-max-width="56rem"\n      @close="modalDetalleActividad = false"\n    >`,
    'Open: Modal Detalle Actividad'
  ],
  // Modal 4: Liquidar Actividad
  [
    `    <!-- Modal Liquidar Actividad -->\n    <div v-if="modalLiquidarActividad && actividadSeleccionada" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalLiquidarActividad = false"></div>\n      <div class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">`,
    `    <!-- Modal Liquidar Actividad -->\n    <ModalWrapper\n      :show="!!(modalLiquidarActividad && actividadSeleccionada)"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"\n      card-max-width="28rem"\n      @close="modalLiquidarActividad = false"\n    >`,
    'Open: Modal Liquidar Actividad'
  ],
  // Modal 5: Confirmar Liquidación Negativa
  [
    `    <!-- Modal Confirmar Liquidación con Utilidad Negativa -->\n    <div v-if="modalConfirmarLiquidacionNegativa && actividadSeleccionada" class="fixed inset-0 z-[60] flex items-center justify-center p-4">\n      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="modalConfirmarLiquidacionNegativa = false"></div>\n      <div class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">`,
    `    <!-- Modal Confirmar Liquidación con Utilidad Negativa -->\n    <ModalWrapper\n      :show="!!(modalConfirmarLiquidacionNegativa && actividadSeleccionada)"\n      :z-index="60"\n      overlay-class="fixed inset-0 z-[60] flex items-center justify-center p-4"\n      card-class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"\n      card-max-width="28rem"\n      @close="modalConfirmarLiquidacionNegativa = false"\n    >`,
    'Open: Modal Confirmar Liquidación Negativa'
  ],
  // Modal 6: Ganador Rifa
  [
    `    <!-- Modal Ganador Rifa (rifa liquidada) -->\n    <div v-if="modalGanadorRifa && actividadSeleccionada" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" data-modal="ganador-rifa">\n      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="modalGanadorRifa = false"></div>\n      <div class="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 sm:animate-none">`,
    `    <!-- Modal Ganador Rifa (rifa liquidada) -->\n    <ModalWrapper\n      :show="!!(modalGanadorRifa && actividadSeleccionada)"\n      :z-index="50"\n      align="bottom"\n      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"\n      card-class="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"\n      card-max-width="28rem"\n      @close="modalGanadorRifa = false"\n    >`,
    'Open: Modal Ganador Rifa'
  ],
  // Modal 7: Ver Ganadores Grupo
  [
    `    <!-- Modal Ver ganadores (grupo de rifas) -->\n    <div v-if="grupoGanadoresSeleccionado" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" data-modal="ver-ganadores-grupo">\n      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="grupoGanadoresSeleccionado = null"></div>\n      <div class="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200 sm:animate-none max-h-[90vh] flex flex-col">`,
    `    <!-- Modal Ver ganadores (grupo de rifas) -->\n    <ModalWrapper\n      :show="!!grupoGanadoresSeleccionado"\n      :z-index="50"\n      align="bottom"\n      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"\n      card-class="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"\n      card-max-width="32rem"\n      @close="grupoGanadoresSeleccionado = null"\n    >`,
    'Open: Modal Ver Ganadores Grupo'
  ],
  // Modal 8: Venta Rifa
  [
    `    <!-- Modal de venta de rifa -->\n    <div v-if="modalVentaRifa" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalVentaRifa = false"></div>\n      <div class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">`,
    `    <!-- Modal de venta de rifa -->\n    <ModalWrapper\n      :show="!!modalVentaRifa"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"\n      card-max-width="28rem"\n      @close="modalVentaRifa = false"\n    >`,
    'Open: Modal Venta Rifa'
  ],
  // Modal 9: Pagar Rifa
  [
    `    <!-- Modal de pago de rifa -->\n    <div v-if="modalPagarRifa" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalPagarRifa = false"></div>\n      <div class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">`,
    `    <!-- Modal de pago de rifa -->\n    <ModalWrapper\n      :show="!!modalPagarRifa"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"\n      card-max-width="28rem"\n      @close="modalPagarRifa = false"\n    >`,
    'Open: Modal Pagar Rifa'
  ],
  // Modal 10: Eliminar Actividad
  [
    `    <!-- Modal de confirmación para eliminar actividad -->\n    <div v-if="actividadAEliminar" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="actividadAEliminar = null"></div>\n      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden">`,
    `    <!-- Modal de confirmación para eliminar actividad -->\n    <ModalWrapper\n      :show="!!actividadAEliminar"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden"\n      card-max-width="28rem"\n      @close="actividadAEliminar = null"\n    >`,
    'Open: Modal Eliminar Actividad'
  ],
  // Modal 11: Eliminar Grupo
  [
    `  <!-- Modal de confirmación para eliminar grupo -->\n  <div v-if="grupoAEliminar" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="grupoAEliminar = null"></div>\n    <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden">`,
    `  <!-- Modal de confirmación para eliminar grupo -->\n  <ModalWrapper\n    :show="!!grupoAEliminar"\n    :z-index="50"\n    overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n    card-class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden"\n    card-max-width="28rem"\n    @close="grupoAEliminar = null"\n  >`,
    'Open: Modal Eliminar Grupo'
  ],
  // Modal 12: Asignar Faltante
  [
    `  <!-- Modal para asignar faltante a socio -->\n  <div v-if="modalAsignarFaltante && faltanteSeleccionado" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalAsignarFaltante = false"></div>\n    <div class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">`,
    `  <!-- Modal para asignar faltante a socio -->\n  <ModalWrapper\n    :show="!!(modalAsignarFaltante && faltanteSeleccionado)"\n    :z-index="50"\n    overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n    card-class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"\n    card-max-width="28rem"\n    @close="modalAsignarFaltante = false"\n  >`,
    'Open: Modal Asignar Faltante'
  ],
  // Modal 13: Confirmar Asignar Faltante Todos Meses
  [
    `  <!-- Modal de confirmación: asignar faltante en todos los meses de la actividad -->\n  <div v-if="modalConfirmarAsignarFaltanteTodosMeses" class="fixed inset-0 z-[60] flex items-center justify-center p-4">\n    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalConfirmarAsignarFaltanteTodosMeses = false"></div>\n    <div class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">`,
    `  <!-- Modal de confirmación: asignar faltante en todos los meses de la actividad -->\n  <ModalWrapper\n    :show="!!modalConfirmarAsignarFaltanteTodosMeses"\n    :z-index="60"\n    overlay-class="fixed inset-0 z-[60] flex items-center justify-center p-4"\n    card-class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"\n    card-max-width="28rem"\n    @close="modalConfirmarAsignarFaltanteTodosMeses = false"\n  >`,
    'Open: Modal Confirmar Asignar Faltante Todos Meses'
  ],
]);

console.log('Done with openings. Now fixing closings...');
