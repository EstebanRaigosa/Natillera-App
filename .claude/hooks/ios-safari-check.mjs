#!/usr/bin/env node
// PostToolUse hook (Edit|Write): tras tocar un .vue/.css/.js, inyecta el checklist
// de compatibilidad iOS/Safari para que Claude valide el cambio antes de terminar.
// No bloquea; solo añade contexto. Manual completo: docs/compatibilidad-ios-safari.md
let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (c) => (raw += c))
process.stdin.on('end', () => {
  let file = ''
  try {
    const j = JSON.parse(raw || '{}')
    file = (j.tool_input && j.tool_input.file_path) ||
           (j.tool_response && j.tool_response.filePath) || ''
  } catch {
    process.exit(0) // JSON ilegible: no molestar
  }

  if (!/\.(vue|css|js)$/i.test(file)) process.exit(0) // solo UI/lógica

  const nombre = file.replace(/\\/g, '/').split('/').pop()
  const checklist = [
    `Acabas de editar \`${nombre}\`. Antes de dar por terminado, valida compatibilidad iOS/Safari sin romper Android (manual: docs/compatibilidad-ios-safari.md):`,
    '- [ ] Alturas full-screen con `100dvh` + fallback `-webkit-fill-available`.',
    '- [ ] Bordes pegados a pantalla respetan `env(safe-area-inset-*)`.',
    '- [ ] Modales vía `<ModalWrapper>`; X e iconos de input por **flex**, nunca `position:absolute`.',
    '- [ ] `useBodyScrollLock` en modales; no tocar `<main>` en la rama iOS.',
    '- [ ] Inputs `font-size >= 16px`; sin `appearance:none` global en `<select>`.',
    '- [ ] Botones >= 44x44px con `touch-action: manipulation`; `@touchstart/@touchmove` `.passive` si no usan `preventDefault`.',
    '- [ ] Sin `opacity:1 !important` ni `display:block !important` en CSS iOS genérico.',
    '- [ ] `backdrop-filter` con fallback sólido / blur <= 4px en iOS.',
    '- [ ] Detección iOS vía `useIsIos.js`, no un regex suelto.',
    '- [ ] Cancelar RAF/observers en `onUnmounted`.',
    'Si el cambio no toca UI/estilos/viewport, basta con confirmar que no aplica.',
  ].join('\n')

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: checklist,
    },
  }))
  process.exit(0)
})
