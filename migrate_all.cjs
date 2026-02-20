const fs = require('fs');
const path = require('path');
const base = __dirname;

function simpleReplace(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let count = 0;
  for (const [old, nw, label] of replacements) {
    const nc = content.replace(/\r\n/g, '\n');
    const no = old.replace(/\r\n/g, '\n');
    if (nc.includes(no)) {
      const idx = nc.indexOf(no);
      let oi = 0, ni = 0;
      while (ni < idx) { if (content[oi]==='\r'&&content[oi+1]==='\n'){oi+=2;ni++}else{oi++;ni++} }
      let oe = oi, ne = ni;
      while (ne < idx+no.length) { if (content[oe]==='\r'&&content[oe+1]==='\n'){oe+=2;ne++}else{oe++;ne++} }
      const cr = content.includes('\r\n');
      let r = nw; if (cr) r = nw.replace(/\n/g, '\r\n');
      content = content.substring(0,oi)+r+content.substring(oe);
      console.log('  OK: '+label); count++;
    } else { console.log('  MISS: '+label); }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  Saved (${count}): ${filePath}\n`);
}

function fixClosingsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const cr = content.includes('\r\n');
  const nl = cr ? '\r\n' : '\n';
  let changes = 0;
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim().startsWith('<ModalWrapper')) continue;
    let j = i;
    while (j < lines.length && !lines[j].trim().endsWith('>')) j++;
    let depth = 0, ci = -1, oi = -1;
    for (let k = j+1; k < lines.length; k++) {
      const l = lines[k];
      depth += (l.match(/<div[\s>]/g)||[]).length - (l.match(/<\/div>/g)||[]).length;
      if (depth===-1&&ci===-1) ci=k;
      else if (depth===-2&&oi===-1) { oi=k; break; }
    }
    if (ci!==-1&&oi!==-1) {
      if (lines[oi].trim()==='</ModalWrapper>') continue;
      const ind = lines[oi].match(/^(\s*)/)[1];
      if (lines[ci].trim()==='</div>') lines[ci]='';
      if (lines[oi].trim()==='</div>') { lines[oi]=ind+'</ModalWrapper>'; changes++; }
    }
  }
  const result = lines.filter(l=>l!=='').join(nl);
  fs.writeFileSync(filePath, result, 'utf8');
  console.log(`  Fixed ${changes} closings: ${filePath}\n`);
}

function addImportIfMissing(filePath, importLine, afterPattern) {
  let content = fs.readFileSync(filePath, 'utf8');
  const nc = content.replace(/\r\n/g, '\n');
  if (nc.includes(importLine)) { console.log('  Import already exists'); return; }
  const cr = content.includes('\r\n');
  const n = cr ? '\r\n' : '\n';
  const importWithNl = (cr ? importLine.replace(/\n/g, '\r\n') : importLine);
  
  if (afterPattern) {
    const nap = afterPattern.replace(/\r\n/g, '\n');
    const idx = nc.indexOf(nap);
    if (idx !== -1) {
      // Find original position
      let oi = 0, ni = 0;
      while (ni < idx + nap.length) { if (content[oi]==='\r'&&content[oi+1]==='\n'){oi+=2;ni++}else{oi++;ni++} }
      content = content.substring(0, oi) + n + importWithNl + content.substring(oi);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('  Added import');
      return;
    }
  }
  console.log('  MISS: Could not add import');
}

// ========================
// SOCIOS.VUE
// ========================
console.log('=== Socios.vue ===');
const socFile = path.join(base, 'src/views/socios/Socios.vue');
addImportIfMissing(socFile, "import ModalWrapper from '../../components/ModalWrapper.vue'", "import { useBodyScrollLock } from '../../composables/useBodyScrollLock'");

simpleReplace(socFile, [
  // Modal Detalle Socio (has Transition wrappers - we need to handle these)
  // Remove Transition wrappers and use ModalWrapper
  ['    <!-- Modal Detalle Socio -->\n    <Transition name="modal-fade">\n      <div v-if="modalDetalle" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalDetalle = false"></div>\n        <Transition name="modal-scale" appear>\n          <div class="card relative max-w-lg w-full max-h-[90vh] overflow-y-auto">',
   '    <!-- Modal Detalle Socio -->\n    <ModalWrapper\n      :show="!!modalDetalle"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="card relative max-w-lg w-full max-h-[90vh] overflow-y-auto"\n      card-max-width="32rem"\n      @close="modalDetalle = false"\n    >',
   'Open: Detalle Socio'],
  
  // Modal Importar CSV
  ['    <!-- Modal Importar CSV -->\n    <Transition name="modal-fade">\n      <div v-if="modalImportar" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarModalImportar"></div>\n        <Transition name="modal-scale" appear>\n          <div class="card relative max-w-lg w-full max-h-[90vh] overflow-y-auto">',
   '    <!-- Modal Importar CSV -->\n    <ModalWrapper\n      :show="!!modalImportar"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="card relative max-w-lg w-full max-h-[90vh] overflow-y-auto"\n      card-max-width="32rem"\n      @close="cerrarModalImportar"\n    >',
   'Open: Importar CSV'],
  
  // Modal Agregar Socio
  ['    <!-- Modal Agregar Socio -->\n    <Transition name="modal-fade">\n      <div v-if="modalAgregar" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarModal"></div>\n        <Transition name="modal-scale" appear>\n          <div class="card relative max-w-md w-full max-h-[90vh] overflow-y-auto">',
   '    <!-- Modal Agregar Socio -->\n    <ModalWrapper\n      :show="!!modalAgregar"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="card relative max-w-md w-full max-h-[90vh] overflow-y-auto"\n      card-max-width="28rem"\n      @close="cerrarModal"\n    >',
   'Open: Agregar Socio'],
  
  // Modal Cuotas Socio
  ['    <!-- Modal Cuotas del Socio por Mes -->\n    <Transition name="modal-fade">\n      <div v-if="modalCuotasSocio" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">\n        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarModalCuotasSocio"></div>\n        <Transition name="modal-scale" appear>\n          <div class="relative w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">',
   '    <!-- Modal Cuotas del Socio por Mes -->\n    <ModalWrapper\n      :show="!!modalCuotasSocio"\n      :z-index="50"\n      align="bottom"\n      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"\n      card-class="relative w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200"\n      card-max-width="42rem"\n      @close="cerrarModalCuotasSocio"\n    >',
   'Open: Cuotas Socio'],
  
  // Modal Eliminar Socio
  ['    <!-- Modal de confirmación para eliminar socio -->\n    <Transition name="modal-fade">\n      <div v-if="socioAEliminar" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">\n        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="socioAEliminar = null"></div>\n        <Transition name="modal-scale" appear>\n          <div class="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] sm:max-h-[85vh] border-2 border-red-200 overflow-hidden flex flex-col">',
   '    <!-- Modal de confirmación para eliminar socio -->\n    <ModalWrapper\n      :show="!!socioAEliminar"\n      :z-index="50"\n      align="bottom"\n      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"\n      card-class="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] sm:max-h-[85vh] border-2 border-red-200 overflow-hidden flex flex-col"\n      card-max-width="28rem"\n      @close="socioAEliminar = null"\n    >',
   'Open: Eliminar Socio'],
  
  // Modal Progreso
  ['    <!-- Modal de Progreso de Creación de Socio - DISEÑO ULTRA MODERNO -->\n    <Transition name="modal-fade">\n      <div v-if="modalProgreso" class="fixed inset-0 z-[60] flex items-center justify-center p-4">',
   '    <!-- Modal de Progreso de Creación de Socio - DISEÑO ULTRA MODERNO -->\n    <ModalWrapper\n      :show="!!modalProgreso"\n      :z-index="60"\n      overlay-class="fixed inset-0 z-[60] flex items-center justify-center p-4"\n      card-class="relative max-w-sm w-full"\n      card-max-width="24rem"\n    >',
   'Open: Progreso (partial)'],
]);

// ========================
// NATILLERADETALLE.VUE - remaining 6 modals
// ========================
console.log('=== NatilleraDetalle.vue (remaining) ===');
const ndFile = path.join(base, 'src/views/natilleras/NatilleraDetalle.vue');
simpleReplace(ndFile, [
  // Modal Config Meses
  ['    <!-- Modal Configurar Período de Meses -->\n    <div v-if="modalConfigMeses" data-modal="config-meses" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">\n      <div class="absolute inset-0 bg-black/50" @click="modalConfigMeses = false"></div>\n      <div class="card relative w-full sm:max-w-md max-h-[85vh] overflow-hidden rounded-t-3xl sm:rounded-2xl">',
   '    <!-- Modal Configurar Período de Meses -->\n    <ModalWrapper\n      :show="!!modalConfigMeses"\n      :z-index="50"\n      align="bottom"\n      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"\n      card-class="card relative w-full sm:max-w-md max-h-[85vh] overflow-hidden rounded-t-3xl sm:rounded-2xl"\n      card-max-width="28rem"\n      @close="modalConfigMeses = false"\n    >',
   'Open: Config Meses'],
  
  // Modal Socios en Mora
  ['    <!-- Modal Socios en Mora -->\n    <div v-if="modalSociosEnMora" data-modal="socios-en-mora" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">\n      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalSociosEnMora = false"></div>\n      <div class="relative w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">',
   '    <!-- Modal Socios en Mora -->\n    <ModalWrapper\n      :show="!!modalSociosEnMora"\n      :z-index="50"\n      align="bottom"\n      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"\n      card-class="relative w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200"\n      card-max-width="56rem"\n      @close="modalSociosEnMora = false"\n    >',
   'Open: Socios en Mora'],
  
  // Modal Cierre Natillera
  ['    <!-- Modal Cierre de Natillera -->\n    <div v-if="modalCierreNatillera" data-modal="cierre-natillera" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">\n      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalCierreNatillera = false"></div>\n      <div class="relative w-full sm:max-w-5xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">',
   '    <!-- Modal Cierre de Natillera -->\n    <ModalWrapper\n      :show="!!modalCierreNatillera"\n      :z-index="50"\n      align="bottom"\n      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"\n      card-class="relative w-full sm:max-w-5xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200"\n      card-max-width="64rem"\n      @close="modalCierreNatillera = false"\n    >',
   'Open: Cierre Natillera'],
  
  // Modal Sin Socios
  ['    <!-- Modal Sin Socios -->\n    <div v-if="modalSinSocios" data-modal="sin-socios" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">\n      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalSinSocios = false"></div>\n      <div class="relative w-full sm:max-w-md max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">',
   '    <!-- Modal Sin Socios -->\n    <ModalWrapper\n      :show="!!modalSinSocios"\n      :z-index="50"\n      align="bottom"\n      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"\n      card-class="relative w-full sm:max-w-md max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200"\n      card-max-width="28rem"\n      @close="modalSinSocios = false"\n    >',
   'Open: Sin Socios'],
]);

// Desglose Recaudacion and Desglose Utilidades have a more complex structure with inner Transitions
// Let me check their exact structure first

// ========================
// COLABORADORESMANAGER.VUE
// ========================
console.log('=== ColaboradoresManager.vue ===');
const colFile = path.join(base, 'src/components/ColaboradoresManager.vue');
addImportIfMissing(colFile, "import ModalWrapper from './ModalWrapper.vue'", "import { useBodyScrollLock } from '../composables/useBodyScrollLock'");

simpleReplace(colFile, [
  // Modal Invitar - has Teleport wrapper that we need to remove
  ['    <Teleport to="body">\n      <Transition name="modal">\n        <div v-if="modalInvitar" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarModalInvitar"></div>\n          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">',
   '    <ModalWrapper\n      :show="!!modalInvitar"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"\n      card-max-width="32rem"\n      @close="cerrarModalInvitar"\n    >',
   'Open: Invitar'],
  
  // Modal Editar
  ['    <Teleport to="body">\n      <Transition name="modal">\n        <div v-if="modalEditar && !esColaborador && miRol !== \'colaborador\'" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarModalEditar"></div>\n          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">',
   '    <ModalWrapper\n      :show="!!(modalEditar && !esColaborador && miRol !== \'colaborador\')"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"\n      card-max-width="32rem"\n      @close="cerrarModalEditar"\n    >',
   'Open: Editar'],
  
  // Modal Revocar
  ['    <Teleport to="body">\n      <Transition name="modal">\n        <div v-if="modalRevocar" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarModalRevocar"></div>\n          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">',
   '    <ModalWrapper\n      :show="!!modalRevocar"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md"\n      card-max-width="28rem"\n      @close="cerrarModalRevocar"\n    >',
   'Open: Revocar'],
  
  // Modal Eliminar
  ['    <Teleport to="body">\n      <Transition name="modal">\n        <div v-if="modalEliminar" class="fixed inset-0 z-50 flex items-center justify-center p-4">\n          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarModalEliminar"></div>\n          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">',
   '    <ModalWrapper\n      :show="!!modalEliminar"\n      :z-index="50"\n      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"\n      card-class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md"\n      card-max-width="28rem"\n      @close="cerrarModalEliminar"\n    >',
   'Open: Eliminar'],
]);

// ========================
// CUADRECAJA.VUE
// ========================
console.log('=== CuadreCaja.vue ===');
const ccFile = path.join(base, 'src/views/cuadre/CuadreCaja.vue');

// ========================
// LOGIN.VUE
// ========================
console.log('=== Login.vue ===');
const loginFile = path.join(base, 'src/views/auth/Login.vue');

// ========================
// USUARIOS.VUE
// ========================
console.log('=== Usuarios.vue ===');
const usrFile = path.join(base, 'src/views/usuarios/Usuarios.vue');

// ========================
// CHATADMIN.VUE
// ========================
console.log('=== ChatAdmin.vue ===');
const chatFile = path.join(base, 'src/views/admin/ChatAdmin.vue');

// ========================
// USERNAMEMODAL.VUE
// ========================
console.log('=== UsernameModal.vue ===');
const unFile = path.join(base, 'src/components/UsernameModal.vue');

// ========================
// AUDITORIA.VUE
// ========================
console.log('=== Auditoria.vue ===');
const auFile = path.join(base, 'src/views/auditoria/Auditoria.vue');

// ========================
// Fix closings for all files
// ========================
console.log('\n=== Fixing closings ===');
const filesToFixClosings = [
  'src/views/natilleras/NatilleraDetalle.vue',
  'src/components/ColaboradoresManager.vue',
];
for (const f of filesToFixClosings) {
  console.log(`--- ${f} ---`);
  fixClosingsInFile(path.join(base, f));
}

console.log('\nAll done!');
