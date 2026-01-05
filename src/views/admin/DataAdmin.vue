<template>
  <!-- Verificación de acceso -->
  <div v-if="!hasAccess" class="max-w-6xl mx-auto p-4 sm:p-6">
    <div class="card text-center py-12">
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <XMarkIcon class="w-8 h-8 text-red-600" />
      </div>
      <h2 class="text-2xl font-display font-bold text-gray-800 mb-2">
        Acceso Denegado
      </h2>
      <p class="text-gray-600">
        No tienes permisos para acceder a esta sección.
      </p>
      <router-link
        to="/dashboard"
        class="btn-primary mt-6 inline-block"
      >
        Volver al Dashboard
      </router-link>
    </div>
  </div>

  <!-- Contenido principal -->
  <div v-else class="max-w-7xl mx-auto p-4 sm:p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-2">
        Administración de Datos
      </h1>
      <p class="text-gray-600">Consulta completa de toda la información en la base de datos</p>
    </div>

    <!-- Estadísticas generales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-blue-600 font-semibold mb-1">Usuarios</p>
            <p class="text-2xl font-bold text-blue-800">{{ stats.totalUsuarios }}</p>
          </div>
          <UserGroupIcon class="w-12 h-12 text-blue-500 opacity-50" />
        </div>
      </div>
      <div class="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-green-600 font-semibold mb-1">Natilleras</p>
            <p class="text-2xl font-bold text-green-800">{{ stats.totalNatilleras }}</p>
          </div>
          <BanknotesIcon class="w-12 h-12 text-green-500 opacity-50" />
        </div>
      </div>
      <div class="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-purple-600 font-semibold mb-1">Socios</p>
            <p class="text-2xl font-bold text-purple-800">{{ stats.totalSocios }}</p>
          </div>
          <UsersIcon class="w-12 h-12 text-purple-500 opacity-50" />
        </div>
      </div>
      <div class="card bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-amber-600 font-semibold mb-1">Cuotas</p>
            <p class="text-2xl font-bold text-amber-800">{{ stats.totalCuotas }}</p>
          </div>
          <CurrencyDollarIcon class="w-12 h-12 text-amber-500 opacity-50" />
        </div>
      </div>
    </div>

    <!-- Tabs de navegación -->
    <div class="card mb-6">
      <div class="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-2 rounded-lg font-semibold transition-all',
            activeTab === tab.id
              ? 'bg-gradient-to-r from-natillera-500 to-emerald-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Contenido de tabs -->
    <div class="space-y-6">
      <!-- Tab Vista Estructurada -->
      <div v-if="activeTab === 'estructurado'" class="space-y-6">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-display font-bold text-gray-800">Vista Estructurada por Usuarios y Natilleras</h2>
            <button
              @click="loadEstructurado"
              class="px-4 py-2 bg-natillera-500 text-white rounded-lg hover:bg-natillera-600 transition-colors"
            >
              <ArrowPathIcon class="w-5 h-5 inline mr-2" :class="{ 'animate-spin': loading }" />
              Actualizar
            </button>
          </div>
          <div v-if="loading" class="text-center py-8">
            <div class="w-12 h-12 border-4 border-natillera-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <div v-else class="space-y-6">
            <!-- Por Usuario -->
            <div
              v-for="usuario in datosEstructurados"
              :key="usuario.id"
              class="border-2 border-gray-200 rounded-xl overflow-hidden"
            >
              <!-- Header Usuario -->
              <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-bold">{{ usuario.email || 'Usuario sin email' }}</h3>
                    <p class="text-sm text-blue-100 mt-1">ID: {{ usuario.id ? usuario.id.substring(0, 8) + '...' : 'N/A' }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-blue-100">Natilleras</p>
                    <p class="text-2xl font-bold">{{ usuario.natilleras?.length || 0 }}</p>
                  </div>
                </div>
              </div>

              <!-- Natilleras del Usuario -->
              <div class="p-4 space-y-4">
                <div
                  v-for="natillera in usuario.natilleras"
                  :key="natillera.id"
                  class="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <!-- Header Natillera -->
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                      <h4 class="font-bold text-lg text-gray-800">{{ natillera.nombre }}</h4>
                      <p class="text-sm text-gray-600 mt-1">{{ natillera.descripcion || 'Sin descripción' }}</p>
                      <div class="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>📅 {{ formatDate(natillera.fecha_inicio) }}</span>
                        <span>🔄 {{ natillera.periodicidad }}</span>
                        <span>📊 {{ natillera.estado }}</span>
                      </div>
                    </div>
                    <span
                      :class="[
                        'px-3 py-1 rounded-full text-xs font-semibold',
                        natillera.estado === 'activa' ? 'bg-green-100 text-green-700' :
                        natillera.estado === 'cerrada' ? 'bg-gray-100 text-gray-700' :
                        'bg-amber-100 text-amber-700'
                      ]"
                    >
                      {{ natillera.estado }}
                    </span>
                  </div>

                  <!-- Socios de la Natillera -->
                  <div class="mt-4">
                    <h5 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <UsersIcon class="w-4 h-4" />
                      Socios ({{ natillera.socios?.length || 0 }})
                    </h5>
                    <div v-if="natillera.socios && natillera.socios.length > 0" class="space-y-2">
                      <div
                        v-for="socioNatillera in natillera.socios"
                        :key="socioNatillera.id"
                        class="bg-white border border-gray-200 rounded-lg p-3"
                      >
                        <div class="flex items-start justify-between">
                          <div class="flex-1">
                            <p class="font-semibold text-gray-800">{{ socioNatillera.socio_nombre }}</p>
                            <div class="flex gap-4 mt-1 text-xs text-gray-600">
                              <span>📄 {{ socioNatillera.socio_documento }}</span>
                              <span>💰 ${{ formatMoney(socioNatillera.valor_cuota_individual) }}</span>
                              <span
                                :class="[
                                  'px-2 py-0.5 rounded-full text-xs font-semibold',
                                  socioNatillera.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                ]"
                              >
                                {{ socioNatillera.estado }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <!-- Cuotas del Socio -->
                        <div v-if="socioNatillera.cuotas && socioNatillera.cuotas.length > 0" class="mt-3 pt-3 border-t border-gray-200">
                          <p class="text-xs font-semibold text-gray-600 mb-2">Cuotas ({{ socioNatillera.cuotas.length }})</p>
                          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            <div
                              v-for="cuota in socioNatillera.cuotas.slice(0, 6)"
                              :key="cuota.id"
                              class="bg-gray-50 rounded p-2 text-xs"
                            >
                              <div class="flex items-center justify-between mb-1">
                                <span class="font-semibold text-gray-700">${{ formatMoney(cuota.valor_cuota) }}</span>
                                <span
                                  :class="[
                                    'px-1.5 py-0.5 rounded text-xs font-semibold',
                                    cuota.estado === 'pagada' ? 'bg-green-100 text-green-700' :
                                    cuota.estado === 'mora' ? 'bg-red-100 text-red-700' :
                                    cuota.estado === 'parcial' ? 'bg-blue-100 text-blue-700' :
                                    'bg-orange-100 text-orange-700'
                                  ]"
                                >
                                  {{ cuota.estado }}
                                </span>
                              </div>
                              <p class="text-gray-500">Pagado: ${{ formatMoney(cuota.valor_pagado || 0) }}</p>
                              <p class="text-gray-400 text-xs mt-1">{{ formatDate(cuota.fecha_limite) }}</p>
                            </div>
                          </div>
                          <p v-if="socioNatillera.cuotas.length > 6" class="text-xs text-gray-500 mt-2 text-center">
                            ... y {{ socioNatillera.cuotas.length - 6 }} cuotas más
                          </p>
                        </div>
                        <div v-else class="mt-2 text-xs text-gray-400 italic">
                          Sin cuotas registradas
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-sm text-gray-400 italic py-2">
                      No hay socios en esta natillera
                    </div>
                  </div>
                </div>
                <div v-if="!usuario.natilleras || usuario.natilleras.length === 0" class="text-center py-4 text-gray-400">
                  Este usuario no tiene natilleras
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Usuarios -->
      <div v-if="activeTab === 'usuarios'" class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-display font-bold text-gray-800">Usuarios</h2>
          <button
            @click="loadUsuarios"
            class="px-4 py-2 bg-natillera-500 text-white rounded-lg hover:bg-natillera-600 transition-colors"
          >
            <ArrowPathIcon class="w-5 h-5 inline mr-2" :class="{ 'animate-spin': loading }" />
            Actualizar
          </button>
        </div>
        <div v-if="loading" class="text-center py-8">
          <div class="w-12 h-12 border-4 border-natillera-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <div v-else>
          <div v-if="usuarios.length === 0" class="text-center py-12 text-gray-500">
            <p>No hay usuarios disponibles o se requiere configuración especial en Supabase.</p>
            <p class="text-sm mt-2">Crea una función RPC llamada "get_all_users" para ver usuarios.</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Creado</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Último Acceso</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="usuario in usuarios" :key="usuario.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-700 font-mono text-xs">{{ usuario.id ? usuario.id.substring(0, 8) + '...' : 'N/A' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 font-medium">{{ usuario.email }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(usuario.created_at) }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(usuario.last_sign_in_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab Natilleras -->
      <div v-if="activeTab === 'natilleras'" class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-display font-bold text-gray-800">Natilleras</h2>
          <button
            @click="loadNatilleras"
            class="px-4 py-2 bg-natillera-500 text-white rounded-lg hover:bg-natillera-600 transition-colors"
          >
            <ArrowPathIcon class="w-5 h-5 inline mr-2" :class="{ 'animate-spin': loading }" />
            Actualizar
          </button>
        </div>
        <div v-if="loading" class="text-center py-8">
          <div class="w-12 h-12 border-4 border-natillera-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="natillera in natilleras"
            :key="natillera.id"
            class="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="font-bold text-lg text-gray-800">{{ natillera.nombre }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ natillera.descripcion || 'Sin descripción' }}</p>
              </div>
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold',
                  natillera.estado === 'activa' ? 'bg-green-100 text-green-700' :
                  natillera.estado === 'cerrada' ? 'bg-gray-100 text-gray-700' :
                  'bg-amber-100 text-amber-700'
                ]"
              >
                {{ natillera.estado }}
              </span>
            </div>
            
            <!-- Usuario Propietario - Destacado -->
            <div class="mb-4 p-3 bg-gradient-to-r from-natillera-50 via-emerald-50 to-teal-50 border-2 border-natillera-200 rounded-lg">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-gradient-to-br from-natillera-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserGroupIcon class="w-4 h-4 text-white" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Usuario Propietario</p>
                  <p v-if="natillera.usuario_email" class="text-sm font-bold text-natillera-700 truncate">
                    {{ natillera.usuario_email }}
                  </p>
                  <p v-else-if="natillera.admin_id" class="text-xs font-mono text-gray-500 truncate">
                    ID: {{ natillera.admin_id.substring(0, 8) }}...
                  </p>
                  <p v-else class="text-xs text-gray-400 italic">Sin usuario asignado</p>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p class="text-gray-500 text-xs mb-1">Periodicidad</p>
                <p class="font-semibold text-gray-800">{{ natillera.periodicidad }}</p>
              </div>
              <div>
                <p class="text-gray-500 text-xs mb-1">Fecha Inicio</p>
                <p class="font-semibold text-gray-800">{{ formatDate(natillera.fecha_inicio) }}</p>
              </div>
              <div>
                <p class="text-gray-500 text-xs mb-1">Año</p>
                <p class="font-semibold text-gray-800">{{ natillera.anio }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Socios -->
      <div v-if="activeTab === 'socios'" class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-display font-bold text-gray-800">Socios</h2>
          <button
            @click="loadSocios"
            class="px-4 py-2 bg-natillera-500 text-white rounded-lg hover:bg-natillera-600 transition-colors"
          >
            <ArrowPathIcon class="w-5 h-5 inline mr-2" :class="{ 'animate-spin': loading }" />
            Actualizar
          </button>
        </div>
        <div v-if="loading" class="text-center py-8">
          <div class="w-12 h-12 border-4 border-natillera-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nombre</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Documento</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Teléfono</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Creado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="socio in socios" :key="socio.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ socio.nombre }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ socio.documento }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ socio.telefono || 'N/A' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ socio.email || 'N/A' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(socio.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab Socios-Natillera -->
      <div v-if="activeTab === 'socios-natillera'" class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-display font-bold text-gray-800">Relaciones Socios-Natillera</h2>
          <button
            @click="loadSociosNatillera"
            class="px-4 py-2 bg-natillera-500 text-white rounded-lg hover:bg-natillera-600 transition-colors"
          >
            <ArrowPathIcon class="w-5 h-5 inline mr-2" :class="{ 'animate-spin': loading }" />
            Actualizar
          </button>
        </div>
        <div v-if="loading" class="text-center py-8">
          <div class="w-12 h-12 border-4 border-natillera-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Socio</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Natillera</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Valor Cuota</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rol</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="relacion in sociosNatillera" :key="relacion.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ relacion.socio_nombre }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ relacion.natillera_nombre }}</td>
                <td class="px-4 py-3 text-sm text-gray-800 font-semibold">${{ formatMoney(relacion.valor_cuota_individual) }}</td>
                <td class="px-4 py-3 text-sm">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-semibold',
                      relacion.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    ]"
                  >
                    {{ relacion.estado }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ relacion.rol }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab Cuotas -->
      <div v-if="activeTab === 'cuotas'" class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-display font-bold text-gray-800">Cuotas</h2>
          <button
            @click="loadCuotas"
            class="px-4 py-2 bg-natillera-500 text-white rounded-lg hover:bg-natillera-600 transition-colors"
          >
            <ArrowPathIcon class="w-5 h-5 inline mr-2" :class="{ 'animate-spin': loading }" />
            Actualizar
          </button>
        </div>
        <div v-if="loading" class="text-center py-8">
          <div class="w-12 h-12 border-4 border-natillera-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Socio</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pagado</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha Límite</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="cuota in cuotas" :key="cuota.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ cuota.socio_nombre || 'N/A' }}</td>
                <td class="px-4 py-3 text-sm text-gray-800 font-semibold">${{ formatMoney(cuota.valor_cuota) }}</td>
                <td class="px-4 py-3 text-sm text-green-600 font-semibold">${{ formatMoney(cuota.valor_pagado || 0) }}</td>
                <td class="px-4 py-3 text-sm">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-semibold',
                      cuota.estado === 'pagada' ? 'bg-green-100 text-green-700' :
                      cuota.estado === 'mora' ? 'bg-red-100 text-red-700' :
                      cuota.estado === 'parcial' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    ]"
                  >
                    {{ cuota.estado }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(cuota.fecha_limite) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab Préstamos -->
      <div v-if="activeTab === 'prestamos'" class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-display font-bold text-gray-800">Préstamos</h2>
          <button
            @click="loadPrestamos"
            class="px-4 py-2 bg-natillera-500 text-white rounded-lg hover:bg-natillera-600 transition-colors"
          >
            <ArrowPathIcon class="w-5 h-5 inline mr-2" :class="{ 'animate-spin': loading }" />
            Actualizar
          </button>
        </div>
        <div v-if="loading" class="text-center py-8">
          <div class="w-12 h-12 border-4 border-natillera-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Socio</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Monto</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Saldo</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Interés</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="prestamo in prestamos" :key="prestamo.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ prestamo.socio_nombre || 'N/A' }}</td>
                <td class="px-4 py-3 text-sm text-gray-800 font-semibold">${{ formatMoney(prestamo.monto) }}</td>
                <td class="px-4 py-3 text-sm text-gray-800 font-semibold">${{ formatMoney(prestamo.saldo_actual) }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ prestamo.interes }}%</td>
                <td class="px-4 py-3 text-sm">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-semibold',
                      prestamo.estado === 'pagado' ? 'bg-green-100 text-green-700' :
                      prestamo.estado === 'activo' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    ]"
                  >
                    {{ prestamo.estado }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab Actividades -->
      <div v-if="activeTab === 'actividades'" class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-display font-bold text-gray-800">Actividades</h2>
          <button
            @click="loadActividades"
            class="px-4 py-2 bg-natillera-500 text-white rounded-lg hover:bg-natillera-600 transition-colors"
          >
            <ArrowPathIcon class="w-5 h-5 inline mr-2" :class="{ 'animate-spin': loading }" />
            Actualizar
          </button>
        </div>
        <div v-if="loading" class="text-center py-8">
          <div class="w-12 h-12 border-4 border-natillera-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Natillera</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Descripción</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ingresos</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Gastos</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Utilidad</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="actividad in actividades" :key="actividad.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ actividad.natillera_nombre || 'N/A' }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ actividad.tipo }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ actividad.descripcion }}</td>
                <td class="px-4 py-3 text-sm text-green-600 font-semibold">${{ formatMoney(actividad.ingresos || 0) }}</td>
                <td class="px-4 py-3 text-sm text-red-600 font-semibold">${{ formatMoney(actividad.gastos || 0) }}</td>
                <td class="px-4 py-3 text-sm text-blue-600 font-semibold">${{ formatMoney(actividad.utilidad || 0) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab Historial -->
      <div v-if="activeTab === 'historial'" class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-display font-bold text-gray-800">Historial de Acciones</h2>
          <button
            @click="loadHistorial"
            class="px-4 py-2 bg-natillera-500 text-white rounded-lg hover:bg-natillera-600 transition-colors"
          >
            <ArrowPathIcon class="w-5 h-5 inline mr-2" :class="{ 'animate-spin': loading }" />
            Actualizar
          </button>
        </div>
        <div v-if="loading" class="text-center py-8">
          <div class="w-12 h-12 border-4 border-natillera-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Acción</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Natillera</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Detalles</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in historial" :key="item.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ item.accion }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ item.natillera_nombre || 'N/A' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 font-mono text-xs">{{ JSON.stringify(item.detalles) }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(item.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab Chat Messages -->
      <div v-if="activeTab === 'chat'" class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-display font-bold text-gray-800">Mensajes de Chat</h2>
          <button
            @click="loadChatMessages"
            class="px-4 py-2 bg-natillera-500 text-white rounded-lg hover:bg-natillera-600 transition-colors"
          >
            <ArrowPathIcon class="w-5 h-5 inline mr-2" :class="{ 'animate-spin': loading }" />
            Actualizar
          </button>
        </div>
        <div v-if="loading" class="text-center py-8">
          <div class="w-12 h-12 border-4 border-natillera-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Usuario</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mensaje</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Respuesta</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Desde Usuario</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="msg in chatMessages" :key="msg.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ msg.user_email || 'N/A' }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ msg.message?.substring(0, 50) }}{{ msg.message?.length > 50 ? '...' : '' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ msg.response ? 'Sí' : 'No' }}</td>
                <td class="px-4 py-3 text-sm">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-semibold',
                      msg.is_from_user ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    ]"
                  >
                    {{ msg.is_from_user ? 'Sí' : 'No' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(msg.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../../lib/supabase'
import { 
  XMarkIcon,
  UserGroupIcon,
  BanknotesIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'

const ALLOWED_EMAIL = 'raigo.16@gmail.com'
const hasAccess = ref(false)
const loading = ref(false)
const activeTab = ref('estructurado')

const usuarios = ref([])
const natilleras = ref([])
const socios = ref([])
const sociosNatillera = ref([])
const cuotas = ref([])
const prestamos = ref([])
const actividades = ref([])
const historial = ref([])
const chatMessages = ref([])
const datosEstructurados = ref([])
const usuariosCache = ref(new Map()) // Cache de usuarios por ID

const stats = computed(() => {
  // Si tenemos datos estructurados, usarlos para las estadísticas
  if (datosEstructurados.value.length > 0) {
    const totalNatilleras = datosEstructurados.value.reduce((sum, u) => sum + (u.natilleras?.length || 0), 0)
    const totalSocios = datosEstructurados.value.reduce((sum, u) => 
      sum + u.natilleras.reduce((s, n) => s + (n.socios?.length || 0), 0), 0
    )
    const totalCuotas = datosEstructurados.value.reduce((sum, u) => 
      sum + u.natilleras.reduce((s, n) => 
        s + n.socios.reduce((c, soc) => c + (soc.cuotas?.length || 0), 0), 0
      ), 0
    )
    
    return {
      totalUsuarios: datosEstructurados.value.length,
      totalNatilleras,
      totalSocios,
      totalCuotas
    }
  }
  
  // Si no, usar los arrays individuales
  return {
    totalUsuarios: usuarios.value.length,
    totalNatilleras: natilleras.value.length,
    totalSocios: socios.value.length,
    totalCuotas: cuotas.value.length
  }
})

const tabs = [
  { id: 'estructurado', label: '📊 Vista Estructurada' },
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'natilleras', label: 'Natilleras' },
  { id: 'socios', label: 'Socios' },
  { id: 'socios-natillera', label: 'Socios-Natillera' },
  { id: 'cuotas', label: 'Cuotas' },
  { id: 'prestamos', label: 'Préstamos' },
  { id: 'actividades', label: 'Actividades' },
  { id: 'historial', label: 'Historial' },
  { id: 'chat', label: 'Chat' }
]

async function checkAccess() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.email === ALLOWED_EMAIL) {
      hasAccess.value = true
    } else {
      hasAccess.value = false
    }
  } catch (error) {
    console.error('Error verificando acceso:', error)
    hasAccess.value = false
  }
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function loadUsuarios() {
  loading.value = true
  try {
    // Nota: Para obtener usuarios de auth.users necesitas crear una función RPC en Supabase
    // Por ahora, intentamos obtener desde una función RPC llamada 'get_all_users'
    // Si no existe, se mostrará un mensaje
    const { data, error } = await supabase.rpc('get_all_users')
    
    if (error) {
      // Si la función RPC no existe, intentar obtener desde una vista pública
      console.warn('Función RPC no disponible, intentando método alternativo...')
      // Por ahora, dejamos vacío ya que requiere configuración en Supabase
      usuarios.value = []
      alert('Para ver usuarios, necesitas crear una función RPC en Supabase llamada "get_all_users" o configurar permisos especiales.')
    } else {
      usuarios.value = data || []
    }
  } catch (error) {
    console.error('Error cargando usuarios:', error)
    usuarios.value = []
  } finally {
    loading.value = false
  }
}

async function loadNatilleras() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('natilleras')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Cargar usuarios en caché si no están cargados
    if (usuariosCache.value.size === 0) {
      try {
        const { data: usuariosData } = await supabase.rpc('get_all_users')
        if (usuariosData && Array.isArray(usuariosData)) {
          usuariosData.forEach(usuario => {
            if (usuario.id) {
              usuariosCache.value.set(usuario.id, usuario.email)
            }
          })
        }
      } catch (e) {
        console.warn('No se pudo obtener usuarios desde RPC, se mostrará solo el ID:', e)
      }
    }
    
    // Mapear natilleras con emails de usuarios
    const natillerasConUsuario = (data || []).map((natillera) => {
      const usuarioEmail = natillera.admin_id ? usuariosCache.value.get(natillera.admin_id) : null
      
      return {
        ...natillera,
        usuario_email: usuarioEmail || null
      }
    })
    
    natilleras.value = natillerasConUsuario
  } catch (error) {
    console.error('Error cargando natilleras:', error)
    natilleras.value = []
  } finally {
    loading.value = false
  }
}

async function loadSocios() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('socios')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    socios.value = data || []
  } catch (error) {
    console.error('Error cargando socios:', error)
    socios.value = []
  } finally {
    loading.value = false
  }
}

async function loadSociosNatillera() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('socios_natillera')
      .select(`
        *,
        socio:socios(nombre),
        natillera:natilleras(nombre)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    sociosNatillera.value = (data || []).map(item => ({
      ...item,
      socio_nombre: item.socio?.nombre || 'N/A',
      natillera_nombre: item.natillera?.nombre || 'N/A'
    }))
  } catch (error) {
    console.error('Error cargando socios-natillera:', error)
    sociosNatillera.value = []
  } finally {
    loading.value = false
  }
}

async function loadCuotas() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('cuotas')
      .select(`
        *,
        socio_natillera:socios_natillera(
          socio:socios(nombre)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    cuotas.value = (data || []).map(item => ({
      ...item,
      socio_nombre: item.socio_natillera?.socio?.nombre || 'N/A'
    }))
  } catch (error) {
    console.error('Error cargando cuotas:', error)
    cuotas.value = []
  } finally {
    loading.value = false
  }
}

async function loadPrestamos() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('prestamos')
      .select(`
        *,
        socio_natillera:socios_natillera(
          socio:socios(nombre)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    prestamos.value = (data || []).map(item => ({
      ...item,
      socio_nombre: item.socio_natillera?.socio?.nombre || 'N/A'
    }))
  } catch (error) {
    console.error('Error cargando préstamos:', error)
    prestamos.value = []
  } finally {
    loading.value = false
  }
}

async function loadActividades() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('actividades')
      .select(`
        *,
        natillera:natilleras(nombre)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    actividades.value = (data || []).map(item => ({
      ...item,
      natillera_nombre: item.natillera?.nombre || 'N/A'
    }))
  } catch (error) {
    console.error('Error cargando actividades:', error)
    actividades.value = []
  } finally {
    loading.value = false
  }
}

async function loadHistorial() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('historial')
      .select(`
        *,
        natillera:natilleras(nombre)
      `)
      .order('created_at', { ascending: false })
      .limit(1000)

    if (error) throw error
    
    historial.value = (data || []).map(item => ({
      ...item,
      natillera_nombre: item.natillera?.nombre || 'N/A'
    }))
  } catch (error) {
    console.error('Error cargando historial:', error)
    historial.value = []
  } finally {
    loading.value = false
  }
}

async function loadChatMessages() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (error) throw error
    chatMessages.value = data || []
  } catch (error) {
    console.error('Error cargando mensajes de chat:', error)
    chatMessages.value = []
  } finally {
    loading.value = false
  }
}

async function loadEstructurado() {
  loading.value = true
  try {
    // Obtener todos los usuarios (intentar desde RPC, si no funciona usar datos de natilleras)
    let usuariosData = []
    try {
      const { data } = await supabase.rpc('get_all_users')
      if (data) usuariosData = data
    } catch (e) {
      console.warn('No se pudieron obtener usuarios desde RPC')
    }

    // Obtener todas las natilleras con admin_id
    const { data: natillerasData, error: natError } = await supabase
      .from('natilleras')
      .select('*')
      .order('created_at', { ascending: false })

    if (natError) throw natError

    // Obtener todas las relaciones socios_natillera
    const { data: sociosNatilleraData, error: snError } = await supabase
      .from('socios_natillera')
      .select(`
        *,
        socio:socios(nombre, documento),
        natillera:natilleras(nombre, admin_id)
      `)

    if (snError) throw snError

    // Obtener todas las cuotas
    const { data: cuotasData, error: cuotasError } = await supabase
      .from('cuotas')
      .select(`
        *,
        socio_natillera:socios_natillera(
          id,
          socio:socios(nombre),
          natillera:natilleras(id, nombre, admin_id)
        )
      `)
      .order('created_at', { ascending: false })

    if (cuotasError) throw cuotasError

    // Estructurar datos por usuario
    const usuariosMap = new Map()

    // Si tenemos usuarios desde RPC, usarlos
    if (usuariosData.length > 0) {
      usuariosData.forEach(usuario => {
        usuariosMap.set(usuario.id, {
          id: usuario.id,
          email: usuario.email,
          created_at: usuario.created_at,
          natilleras: []
        })
      })
    }

    // Agregar natilleras a usuarios
    natillerasData.forEach(natillera => {
      // Solo procesar si tiene admin_id
      if (!natillera.admin_id) return
      
      if (!usuariosMap.has(natillera.admin_id)) {
        usuariosMap.set(natillera.admin_id, {
          id: natillera.admin_id,
          email: null, // No tenemos email sin RPC
          created_at: null,
          natilleras: []
        })
      }
      
      const usuario = usuariosMap.get(natillera.admin_id)
      if (usuario) {
        usuario.natilleras.push({
          ...natillera,
          socios: []
        })
      }
    })

    // Agregar socios a natilleras
    sociosNatilleraData.forEach(sn => {
      const natilleraId = sn.natillera_id
      const adminId = sn.natillera?.admin_id

      if (adminId && natilleraId && usuariosMap.has(adminId)) {
        const usuario = usuariosMap.get(adminId)
        if (usuario) {
          const natillera = usuario.natilleras.find(n => n.id === natilleraId)
          
          if (natillera) {
            natillera.socios.push({
              ...sn,
              socio_nombre: sn.socio?.nombre || 'N/A',
              socio_documento: sn.socio?.documento || 'N/A',
              cuotas: []
            })
          }
        }
      }
    })

    // Agregar cuotas a socios
    cuotasData.forEach(cuota => {
      const socioNatilleraId = cuota.socio_natillera_id
      const natilleraId = cuota.socio_natillera?.natillera?.id
      const adminId = cuota.socio_natillera?.natillera?.admin_id

      if (adminId && natilleraId && socioNatilleraId && usuariosMap.has(adminId)) {
        const usuario = usuariosMap.get(adminId)
        if (usuario) {
          const natillera = usuario.natilleras.find(n => n.id === natilleraId)
          
          if (natillera) {
            const socioNatillera = natillera.socios.find(s => s.id === socioNatilleraId)
            
            if (socioNatillera) {
              socioNatillera.cuotas.push(cuota)
            }
          }
        }
      }
    })

    // Convertir map a array y ordenar
    datosEstructurados.value = Array.from(usuariosMap.values())
      .map(usuario => ({
        ...usuario,
        natilleras: usuario.natilleras.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        ).map(natillera => ({
          ...natillera,
          socios: natillera.socios.sort((a, b) => {
            const nombreA = a.socio_nombre || ''
            const nombreB = b.socio_nombre || ''
            return nombreA.localeCompare(nombreB)
          }).map(socio => ({
            ...socio,
            cuotas: socio.cuotas.sort((a, b) => 
              new Date(b.created_at) - new Date(a.created_at)
            )
          }))
        }))
      }))
      .sort((a, b) => {
        // Ordenar por email si está disponible, sino por ID
        const emailA = a.email || ''
        const emailB = b.email || ''
        if (emailA && emailB) {
          return emailA.localeCompare(emailB)
        }
        // Si no hay emails, ordenar por ID (que nunca debería ser null, pero por seguridad)
        const idA = a.id || ''
        const idB = b.id || ''
        return idA.localeCompare(idB)
      })
  } catch (error) {
    console.error('Error cargando datos estructurados:', error)
    datosEstructurados.value = []
  } finally {
    loading.value = false
  }
}

// Cargar datos del tab activo al cambiar
async function loadActiveTabData() {
  switch (activeTab.value) {
    case 'estructurado':
      await loadEstructurado()
      break
    case 'usuarios':
      await loadUsuarios()
      break
    case 'natilleras':
      await loadNatilleras()
      break
    case 'socios':
      await loadSocios()
      break
    case 'socios-natillera':
      await loadSociosNatillera()
      break
    case 'cuotas':
      await loadCuotas()
      break
    case 'prestamos':
      await loadPrestamos()
      break
    case 'actividades':
      await loadActividades()
      break
    case 'historial':
      await loadHistorial()
      break
    case 'chat':
      await loadChatMessages()
      break
  }
}

// Cargar datos automáticamente al cambiar de tab
watch(activeTab, () => {
  if (hasAccess.value) {
    loadActiveTabData()
  }
})

onMounted(async () => {
  await checkAccess()
  if (hasAccess.value) {
    // Cargar datos estructurados primero para que las estadísticas se muestren
    await loadEstructurado()
    // También cargar datos básicos para las estadísticas
    await Promise.all([
      loadNatilleras(),
      loadSocios(),
      loadCuotas()
    ])
  }
})
</script>

