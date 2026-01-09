# Reglas de Desarrollo

Este documento contiene las reglas y convenciones que deben seguirse durante el desarrollo de la aplicación. **DEBES CONSULTAR ESTE ARCHIVO ANTES DE REALIZAR CUALQUIER CAMBIO O TAREA.**

---

## 📋 Reglas Generales

### 1. Actualización de VISTAS_TITULOS.md
**PRIORIDAD: ALTA**

Cuando se agregue una nueva vista (archivo `.vue` en `src/views/`), **DEBES** actualizar el archivo `VISTAS_TITULOS.md` con la siguiente información:

- Nombre del archivo de la vista
- Título principal que se muestra en la vista
- Categoría a la que pertenece (Autenticación, Natilleras, Socios, etc.)
- Notas especiales si el título es dinámico o tiene características particulares

**Ejemplo de formato:**
```markdown
### NuevaVista.vue
**Título:** Título Principal de la Vista
*Nota: [Cualquier nota relevante]*
```

**Pasos a seguir:**
1. Crear o modificar la vista
2. Identificar el título principal (generalmente en un `<h1>` o `<h2>`)
3. Abrir `VISTAS_TITULOS.md`
4. Agregar la nueva entrada en la sección correspondiente
5. Actualizar el contador total de vistas al final del archivo

**NO OLVIDES:** Esta regla aplica también cuando se modifica el título de una vista existente.

---

## 🔄 Proceso de Desarrollo

Antes de comenzar cualquier tarea:

1. ✅ Leer este archivo completamente
2. ✅ Verificar si hay reglas específicas para la tarea que vas a realizar
3. ✅ Consultar otros archivos de documentación relevantes
4. ✅ Seguir las convenciones establecidas
5. ✅ Actualizar la documentación necesaria al finalizar

---

## 📝 Notas Importantes

- Este archivo debe mantenerse actualizado
- Las reglas tienen prioridades (ALTA, MEDIA, BAJA)
- Si encuentras una situación no cubierta por las reglas, agrega una nueva regla después de consultar con el equipo

---

**Última actualización:** 2024-12-19


