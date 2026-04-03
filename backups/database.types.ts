export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      actividades: {
        Row: {
          actividad_serie_id: string | null
          anio_pago: number | null
          created_at: string | null
          cuando_juego_rifa: string | null
          descripcion: string
          estado: string | null
          fecha_juego_rifa: string | null
          fecha_limite_pago: string | null
          forma_pago_liquidacion: string | null
          ganador_es_faltante: boolean | null
          ganador_nombre: string | null
          ganador_socio_natillera_id: string | null
          gastos: number | null
          id: string
          ingresos: number | null
          mes_pago: number | null
          natillera_id: string | null
          numero_completo_loteria_medellin: string | null
          numero_ganador: string | null
          quincena_pago: number | null
          serie_loteria_medellin: string | null
          sorteo_loteria_medellin: string | null
          tipo: string | null
          tipo_rifa: string | null
          updated_at: string | null
          utilidad: number | null
          valor_rifa: number | null
        }
        Insert: {
          actividad_serie_id?: string | null
          anio_pago?: number | null
          created_at?: string | null
          cuando_juego_rifa?: string | null
          descripcion: string
          estado?: string | null
          fecha_juego_rifa?: string | null
          fecha_limite_pago?: string | null
          forma_pago_liquidacion?: string | null
          ganador_es_faltante?: boolean | null
          ganador_nombre?: string | null
          ganador_socio_natillera_id?: string | null
          gastos?: number | null
          id?: string
          ingresos?: number | null
          mes_pago?: number | null
          natillera_id?: string | null
          numero_completo_loteria_medellin?: string | null
          numero_ganador?: string | null
          quincena_pago?: number | null
          serie_loteria_medellin?: string | null
          sorteo_loteria_medellin?: string | null
          tipo?: string | null
          tipo_rifa?: string | null
          updated_at?: string | null
          utilidad?: number | null
          valor_rifa?: number | null
        }
        Update: {
          actividad_serie_id?: string | null
          anio_pago?: number | null
          created_at?: string | null
          cuando_juego_rifa?: string | null
          descripcion?: string
          estado?: string | null
          fecha_juego_rifa?: string | null
          fecha_limite_pago?: string | null
          forma_pago_liquidacion?: string | null
          ganador_es_faltante?: boolean | null
          ganador_nombre?: string | null
          ganador_socio_natillera_id?: string | null
          gastos?: number | null
          id?: string
          ingresos?: number | null
          mes_pago?: number | null
          natillera_id?: string | null
          numero_completo_loteria_medellin?: string | null
          numero_ganador?: string | null
          quincena_pago?: number | null
          serie_loteria_medellin?: string | null
          sorteo_loteria_medellin?: string | null
          tipo?: string | null
          tipo_rifa?: string | null
          updated_at?: string | null
          utilidad?: number | null
          valor_rifa?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "actividades_ganador_socio_natillera_id_fkey"
            columns: ["ganador_socio_natillera_id"]
            isOneToOne: false
            referencedRelation: "socios_natillera"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividades_natillera_id_fkey"
            columns: ["natillera_id"]
            isOneToOne: false
            referencedRelation: "natilleras"
            referencedColumns: ["id"]
          },
        ]
      }
      auditoria: {
        Row: {
          cambios: Json | null
          created_at: string | null
          datos_anteriores: Json | null
          datos_nuevos: Json | null
          descripcion: string
          detalles: Json | null
          entidad: string
          entidad_id: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          natillera_id: string | null
          natillera_nombre: string | null
          tipo_accion: string
          user_agent: string | null
          usuario_email: string | null
          usuario_id: string | null
          usuario_nombre: string | null
        }
        Insert: {
          cambios?: Json | null
          created_at?: string | null
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          descripcion: string
          detalles?: Json | null
          entidad: string
          entidad_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          natillera_id?: string | null
          natillera_nombre?: string | null
          tipo_accion: string
          user_agent?: string | null
          usuario_email?: string | null
          usuario_id?: string | null
          usuario_nombre?: string | null
        }
        Update: {
          cambios?: Json | null
          created_at?: string | null
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          descripcion?: string
          detalles?: Json | null
          entidad?: string
          entidad_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          natillera_id?: string | null
          natillera_nombre?: string | null
          tipo_accion?: string
          user_agent?: string | null
          usuario_email?: string | null
          usuario_id?: string | null
          usuario_nombre?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auditoria_natillera_id_fkey"
            columns: ["natillera_id"]
            isOneToOne: false
            referencedRelation: "natilleras"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          is_from_user: boolean | null
          is_read: boolean | null
          message: string
          response: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_from_user?: boolean | null
          is_read?: boolean | null
          message: string
          response?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_from_user?: boolean | null
          is_read?: boolean | null
          message?: string
          response?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_rate_limits: {
        Row: {
          attempt_count: number | null
          blocked_until: string | null
          created_at: string | null
          email: string | null
          first_attempt: string | null
          id: string
          ip_address: unknown
          last_attempt: string | null
          updated_at: string | null
        }
        Insert: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          email?: string | null
          first_attempt?: string | null
          id?: string
          ip_address: unknown
          last_attempt?: string | null
          updated_at?: string | null
        }
        Update: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          email?: string | null
          first_attempt?: string | null
          id?: string
          ip_address?: unknown
          last_attempt?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comprobantes_salida: {
        Row: {
          codigo_comprobante: string
          created_at: string | null
          fecha: string
          id: string
          socio_natillera_id: string
          socio_nombre: string
          socio_telefono: string | null
          total_ahorrado: number
          valor_entregar: number
          valor_sancion: number
        }
        Insert: {
          codigo_comprobante: string
          created_at?: string | null
          fecha: string
          id?: string
          socio_natillera_id: string
          socio_nombre: string
          socio_telefono?: string | null
          total_ahorrado?: number
          valor_entregar?: number
          valor_sancion?: number
        }
        Update: {
          codigo_comprobante?: string
          created_at?: string | null
          fecha?: string
          id?: string
          socio_natillera_id?: string
          socio_nombre?: string
          socio_telefono?: string | null
          total_ahorrado?: number
          valor_entregar?: number
          valor_sancion?: number
        }
        Relationships: [
          {
            foreignKeyName: "comprobantes_salida_socio_natillera_id_fkey"
            columns: ["socio_natillera_id"]
            isOneToOne: true
            referencedRelation: "socios_natillera"
            referencedColumns: ["id"]
          },
        ]
      }
      cuotas: {
        Row: {
          anio: number | null
          codigo_comprobante: string | null
          comprobante_url: string | null
          created_at: string | null
          descripcion: string | null
          estado: string | null
          fecha_inicio_mora: string | null
          fecha_limite: string
          fecha_mora: string | null
          fecha_pago: string | null
          fecha_vencimiento: string
          id: string
          mes: number | null
          mora_orden: number | null
          no_calcular_multa: boolean
          nombre_natillera: string | null
          nombre_socio: string | null
          quincena: number | null
          socio_natillera_id: string | null
          tipo_pago: string | null
          updated_at: string | null
          valor_cuota: number
          valor_multa: number | null
          valor_multa_base: number | null
          valor_multa_intereses: number | null
          valor_pagado: number | null
          valor_pagado_actividades: number | null
          valor_pagado_cuota: number | null
          valor_pagado_efectivo: number | null
          valor_pagado_sancion: number | null
          valor_pagado_transferencia: number | null
        }
        Insert: {
          anio?: number | null
          codigo_comprobante?: string | null
          comprobante_url?: string | null
          created_at?: string | null
          descripcion?: string | null
          estado?: string | null
          fecha_inicio_mora?: string | null
          fecha_limite: string
          fecha_mora?: string | null
          fecha_pago?: string | null
          fecha_vencimiento: string
          id?: string
          mes?: number | null
          mora_orden?: number | null
          no_calcular_multa?: boolean
          nombre_natillera?: string | null
          nombre_socio?: string | null
          quincena?: number | null
          socio_natillera_id?: string | null
          tipo_pago?: string | null
          updated_at?: string | null
          valor_cuota: number
          valor_multa?: number | null
          valor_multa_base?: number | null
          valor_multa_intereses?: number | null
          valor_pagado?: number | null
          valor_pagado_actividades?: number | null
          valor_pagado_cuota?: number | null
          valor_pagado_efectivo?: number | null
          valor_pagado_sancion?: number | null
          valor_pagado_transferencia?: number | null
        }
        Update: {
          anio?: number | null
          codigo_comprobante?: string | null
          comprobante_url?: string | null
          created_at?: string | null
          descripcion?: string | null
          estado?: string | null
          fecha_inicio_mora?: string | null
          fecha_limite?: string
          fecha_mora?: string | null
          fecha_pago?: string | null
          fecha_vencimiento?: string
          id?: string
          mes?: number | null
          mora_orden?: number | null
          no_calcular_multa?: boolean
          nombre_natillera?: string | null
          nombre_socio?: string | null
          quincena?: number | null
          socio_natillera_id?: string | null
          tipo_pago?: string | null
          updated_at?: string | null
          valor_cuota?: number
          valor_multa?: number | null
          valor_multa_base?: number | null
          valor_multa_intereses?: number | null
          valor_pagado?: number | null
          valor_pagado_actividades?: number | null
          valor_pagado_cuota?: number | null
          valor_pagado_efectivo?: number | null
          valor_pagado_sancion?: number | null
          valor_pagado_transferencia?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cuotas_socio_natillera_id_fkey"
            columns: ["socio_natillera_id"]
            isOneToOne: false
            referencedRelation: "socios_natillera"
            referencedColumns: ["id"]
          },
        ]
      }
      historial: {
        Row: {
          accion: string
          created_at: string | null
          detalles: Json | null
          id: string
          natillera_id: string | null
          usuario_id: string | null
        }
        Insert: {
          accion: string
          created_at?: string | null
          detalles?: Json | null
          id?: string
          natillera_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          accion?: string
          created_at?: string | null
          detalles?: Json | null
          id?: string
          natillera_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historial_natillera_id_fkey"
            columns: ["natillera_id"]
            isOneToOne: false
            referencedRelation: "natilleras"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_comprobantes: {
        Row: {
          codigo_comprobante_anterior: string
          codigo_comprobante_nuevo: string
          created_at: string | null
          cuota_id: string
          fecha_actualizacion: string | null
          historial_pagos: Json | null
          id: string
          motivo: string
          valor_pagado_anterior: number
          valor_pagado_nuevo: number
        }
        Insert: {
          codigo_comprobante_anterior: string
          codigo_comprobante_nuevo: string
          created_at?: string | null
          cuota_id: string
          fecha_actualizacion?: string | null
          historial_pagos?: Json | null
          id?: string
          motivo?: string
          valor_pagado_anterior?: number
          valor_pagado_nuevo?: number
        }
        Update: {
          codigo_comprobante_anterior?: string
          codigo_comprobante_nuevo?: string
          created_at?: string | null
          cuota_id?: string
          fecha_actualizacion?: string | null
          historial_pagos?: Json | null
          id?: string
          motivo?: string
          valor_pagado_anterior?: number
          valor_pagado_nuevo?: number
        }
        Relationships: [
          {
            foreignKeyName: "historial_comprobantes_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "cuotas"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_comprobantes_prestamo: {
        Row: {
          codigo_comprobante_anterior: string
          codigo_comprobante_nuevo: string | null
          created_at: string | null
          eliminado: boolean | null
          eliminado_el: string | null
          eliminado_por: string | null
          eliminado_por_email: string | null
          fecha_actualizacion: string | null
          id: string
          motivo: string
          pago_prestamo_id: string | null
          prestamo_id: string | null
          socio_natillera_id: string | null
          valor_abono_anterior: number
          valor_abono_nuevo: number
        }
        Insert: {
          codigo_comprobante_anterior: string
          codigo_comprobante_nuevo?: string | null
          created_at?: string | null
          eliminado?: boolean | null
          eliminado_el?: string | null
          eliminado_por?: string | null
          eliminado_por_email?: string | null
          fecha_actualizacion?: string | null
          id?: string
          motivo?: string
          pago_prestamo_id?: string | null
          prestamo_id?: string | null
          socio_natillera_id?: string | null
          valor_abono_anterior?: number
          valor_abono_nuevo?: number
        }
        Update: {
          codigo_comprobante_anterior?: string
          codigo_comprobante_nuevo?: string | null
          created_at?: string | null
          eliminado?: boolean | null
          eliminado_el?: string | null
          eliminado_por?: string | null
          eliminado_por_email?: string | null
          fecha_actualizacion?: string | null
          id?: string
          motivo?: string
          pago_prestamo_id?: string | null
          prestamo_id?: string | null
          socio_natillera_id?: string | null
          valor_abono_anterior?: number
          valor_abono_nuevo?: number
        }
        Relationships: [
          {
            foreignKeyName: "historial_comprobantes_prestamo_pago_prestamo_id_fkey"
            columns: ["pago_prestamo_id"]
            isOneToOne: false
            referencedRelation: "pagos_prestamo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historial_comprobantes_prestamo_prestamo_id_fkey"
            columns: ["prestamo_id"]
            isOneToOne: false
            referencedRelation: "prestamos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historial_comprobantes_prestamo_socio_natillera_id_fkey"
            columns: ["socio_natillera_id"]
            isOneToOne: false
            referencedRelation: "socios_natillera"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_pagos_cuota: {
        Row: {
          anio: number | null
          created_at: string | null
          cuota_id: string
          fecha_pago: string
          forma_pago: string
          id: string
          impuesto_4x1000: number
          mes: number | null
          natillera_nombre: string | null
          quincena: number | null
          socio_nombre: string | null
          valor_actividades: number
          valor_cuota: number
          valor_cuotas_prestamo: number
          valor_pagado_cuota_total: number
          valor_sancion: number
          valor_total: number
        }
        Insert: {
          anio?: number | null
          created_at?: string | null
          cuota_id: string
          fecha_pago?: string
          forma_pago: string
          id?: string
          impuesto_4x1000?: number
          mes?: number | null
          natillera_nombre?: string | null
          quincena?: number | null
          socio_nombre?: string | null
          valor_actividades?: number
          valor_cuota?: number
          valor_cuotas_prestamo?: number
          valor_pagado_cuota_total?: number
          valor_sancion?: number
          valor_total?: number
        }
        Update: {
          anio?: number | null
          created_at?: string | null
          cuota_id?: string
          fecha_pago?: string
          forma_pago?: string
          id?: string
          impuesto_4x1000?: number
          mes?: number | null
          natillera_nombre?: string | null
          quincena?: number | null
          socio_nombre?: string | null
          valor_actividades?: number
          valor_cuota?: number
          valor_cuotas_prestamo?: number
          valor_pagado_cuota_total?: number
          valor_sancion?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "historial_pagos_cuota_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "cuotas"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_refinanciaciones: {
        Row: {
          created_at: string | null
          fecha_inicio_anterior: string | null
          fecha_inicio_nueva: string
          fecha_refinanciacion: string | null
          id: string
          interes_anterior: number
          interes_anticipado_anterior: boolean | null
          interes_nuevo: number
          interes_total_anterior: number | null
          monto_anterior: number
          monto_nuevo: number
          motivo: string | null
          numero_cuotas_anterior: number | null
          numero_cuotas_nuevo: number
          periodicidad_anterior: string | null
          periodicidad_nueva: string | null
          prestamo_id: string | null
          saldo_actual_anterior: number
          saldo_actual_nuevo: number
          tipo_interes_anterior: string | null
          tipo_interes_nuevo: string
        }
        Insert: {
          created_at?: string | null
          fecha_inicio_anterior?: string | null
          fecha_inicio_nueva: string
          fecha_refinanciacion?: string | null
          id?: string
          interes_anterior: number
          interes_anticipado_anterior?: boolean | null
          interes_nuevo: number
          interes_total_anterior?: number | null
          monto_anterior: number
          monto_nuevo: number
          motivo?: string | null
          numero_cuotas_anterior?: number | null
          numero_cuotas_nuevo: number
          periodicidad_anterior?: string | null
          periodicidad_nueva?: string | null
          prestamo_id?: string | null
          saldo_actual_anterior: number
          saldo_actual_nuevo: number
          tipo_interes_anterior?: string | null
          tipo_interes_nuevo: string
        }
        Update: {
          created_at?: string | null
          fecha_inicio_anterior?: string | null
          fecha_inicio_nueva?: string
          fecha_refinanciacion?: string | null
          id?: string
          interes_anterior?: number
          interes_anticipado_anterior?: boolean | null
          interes_nuevo?: number
          interes_total_anterior?: number | null
          monto_anterior?: number
          monto_nuevo?: number
          motivo?: string | null
          numero_cuotas_anterior?: number | null
          numero_cuotas_nuevo?: number
          periodicidad_anterior?: string | null
          periodicidad_nueva?: string | null
          prestamo_id?: string | null
          saldo_actual_anterior?: number
          saldo_actual_nuevo?: number
          tipo_interes_anterior?: string | null
          tipo_interes_nuevo?: string
        }
        Relationships: [
          {
            foreignKeyName: "historial_refinanciaciones_prestamo_id_fkey"
            columns: ["prestamo_id"]
            isOneToOne: false
            referencedRelation: "prestamos"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_fondo: {
        Row: {
          created_at: string | null
          descripcion: string | null
          destino_ingreso: string | null
          fecha: string
          forma_pago: string
          id: string
          monto: number
          natillera_id: string
          origen_egreso: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          destino_ingreso?: string | null
          fecha?: string
          forma_pago: string
          id?: string
          monto: number
          natillera_id: string
          origen_egreso?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          destino_ingreso?: string | null
          fecha?: string
          forma_pago?: string
          id?: string
          monto?: number
          natillera_id?: string
          origen_egreso?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_fondo_natillera_id_fkey"
            columns: ["natillera_id"]
            isOneToOne: false
            referencedRelation: "natilleras"
            referencedColumns: ["id"]
          },
        ]
      }
      multas: {
        Row: {
          created_at: string | null
          fecha: string | null
          id: string
          motivo: string
          pagada: boolean | null
          socio_natillera_id: string | null
          valor: number
        }
        Insert: {
          created_at?: string | null
          fecha?: string | null
          id?: string
          motivo: string
          pagada?: boolean | null
          socio_natillera_id?: string | null
          valor: number
        }
        Update: {
          created_at?: string | null
          fecha?: string | null
          id?: string
          motivo?: string
          pagada?: boolean | null
          socio_natillera_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "multas_socio_natillera_id_fkey"
            columns: ["socio_natillera_id"]
            isOneToOne: false
            referencedRelation: "socios_natillera"
            referencedColumns: ["id"]
          },
        ]
      }
      natillera_colaboradores: {
        Row: {
          created_at: string | null
          email_invitado: string | null
          estado: string | null
          fecha_invitacion: string | null
          fecha_respuesta: string | null
          id: string
          invitado_por: string | null
          natillera_id: string
          notas: string | null
          permisos: Json | null
          rol: string | null
          token_invitacion: string | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          email_invitado?: string | null
          estado?: string | null
          fecha_invitacion?: string | null
          fecha_respuesta?: string | null
          id?: string
          invitado_por?: string | null
          natillera_id: string
          notas?: string | null
          permisos?: Json | null
          rol?: string | null
          token_invitacion?: string | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          email_invitado?: string | null
          estado?: string | null
          fecha_invitacion?: string | null
          fecha_respuesta?: string | null
          id?: string
          invitado_por?: string | null
          natillera_id?: string
          notas?: string | null
          permisos?: Json | null
          rol?: string | null
          token_invitacion?: string | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "natillera_colaboradores_natillera_id_fkey"
            columns: ["natillera_id"]
            isOneToOne: false
            referencedRelation: "natilleras"
            referencedColumns: ["id"]
          },
        ]
      }
      natilleras: {
        Row: {
          admin_id: string | null
          anio: number | null
          anio_inicio: number | null
          avatar_seed: string | null
          config_cierre: Json | null
          created_at: string | null
          cuotas_automaticas: boolean | null
          descripcion: string | null
          estado: string | null
          fecha_cierre: string | null
          fecha_inicio: string
          id: string
          mes_fin: number | null
          mes_inicio: number | null
          nombre: string
          periodicidad: string
          reglas_interes: Json | null
          reglas_multas: Json | null
          updated_at: string | null
        }
        Insert: {
          admin_id?: string | null
          anio?: number | null
          anio_inicio?: number | null
          avatar_seed?: string | null
          config_cierre?: Json | null
          created_at?: string | null
          cuotas_automaticas?: boolean | null
          descripcion?: string | null
          estado?: string | null
          fecha_cierre?: string | null
          fecha_inicio: string
          id?: string
          mes_fin?: number | null
          mes_inicio?: number | null
          nombre: string
          periodicidad: string
          reglas_interes?: Json | null
          reglas_multas?: Json | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string | null
          anio?: number | null
          anio_inicio?: number | null
          avatar_seed?: string | null
          config_cierre?: Json | null
          created_at?: string | null
          cuotas_automaticas?: boolean | null
          descripcion?: string | null
          estado?: string | null
          fecha_cierre?: string | null
          fecha_inicio?: string
          id?: string
          mes_fin?: number | null
          mes_inicio?: number | null
          nombre?: string
          periodicidad?: string
          reglas_interes?: Json | null
          reglas_multas?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notificaciones: {
        Row: {
          created_at: string | null
          datos_adicionales: Json | null
          enlace: string | null
          id: string
          leida: boolean | null
          mensaje: string
          natillera_id: string | null
          tipo: string
          titulo: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          datos_adicionales?: Json | null
          enlace?: string | null
          id?: string
          leida?: boolean | null
          mensaje: string
          natillera_id?: string | null
          tipo: string
          titulo: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          datos_adicionales?: Json | null
          enlace?: string | null
          id?: string
          leida?: boolean | null
          mensaje?: string
          natillera_id?: string | null
          tipo?: string
          titulo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_natillera_id_fkey"
            columns: ["natillera_id"]
            isOneToOne: false
            referencedRelation: "natilleras"
            referencedColumns: ["id"]
          },
        ]
      }
      numeros_rifa: {
        Row: {
          actividad_id: string
          created_at: string | null
          estado: string
          fecha_pago: string | null
          fecha_venta: string | null
          id: string
          nombre_comprador: string | null
          numero: string
          socio_vendedor_id: string | null
          telefono_comprador: string | null
          updated_at: string | null
          valor: number
        }
        Insert: {
          actividad_id: string
          created_at?: string | null
          estado?: string
          fecha_pago?: string | null
          fecha_venta?: string | null
          id?: string
          nombre_comprador?: string | null
          numero: string
          socio_vendedor_id?: string | null
          telefono_comprador?: string | null
          updated_at?: string | null
          valor?: number
        }
        Update: {
          actividad_id?: string
          created_at?: string | null
          estado?: string
          fecha_pago?: string | null
          fecha_venta?: string | null
          id?: string
          nombre_comprador?: string | null
          numero?: string
          socio_vendedor_id?: string | null
          telefono_comprador?: string | null
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "numeros_rifa_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "numeros_rifa_socio_vendedor_id_fkey"
            columns: ["socio_vendedor_id"]
            isOneToOne: false
            referencedRelation: "socios_natillera"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          codigo: string
          created_at: string | null
          expira_en: string
          id: string
          intentos_verificacion: number | null
          max_intentos: number | null
          telefono: string
          user_id: string | null
          utilizado: boolean | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          expira_en: string
          id?: string
          intentos_verificacion?: number | null
          max_intentos?: number | null
          telefono: string
          user_id?: string | null
          utilizado?: boolean | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          expira_en?: string
          id?: string
          intentos_verificacion?: number | null
          max_intentos?: number | null
          telefono?: string
          user_id?: string | null
          utilizado?: boolean | null
        }
        Relationships: []
      }
      pagos_prestamo: {
        Row: {
          codigo_comprobante: string | null
          created_at: string | null
          fecha: string | null
          id: string
          prestamo_id: string | null
          valor: number
          valor_efectivo: number | null
          valor_transferencia: number | null
        }
        Insert: {
          codigo_comprobante?: string | null
          created_at?: string | null
          fecha?: string | null
          id?: string
          prestamo_id?: string | null
          valor: number
          valor_efectivo?: number | null
          valor_transferencia?: number | null
        }
        Update: {
          codigo_comprobante?: string | null
          created_at?: string | null
          fecha?: string | null
          id?: string
          prestamo_id?: string | null
          valor?: number
          valor_efectivo?: number | null
          valor_transferencia?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_prestamo_prestamo_id_fkey"
            columns: ["prestamo_id"]
            isOneToOne: false
            referencedRelation: "prestamos"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_pagos_prestamo: {
        Row: {
          anio: number | null
          capital: number
          created_at: string | null
          cuota_id: string | null
          fecha_pago: string | null
          fecha_proyectada: string
          forma_pago: string | null
          id: string
          interes: number
          mes: number | null
          natillera_nombre: string | null
          nombre_natillera: string | null
          nombre_socio: string | null
          numero_cuota: number
          pagada: boolean | null
          prestamo_id: string | null
          quincena: number | null
          saldo_proyectado: number
          socio_nombre: string | null
          updated_at: string | null
          valor_cuota: number
          valor_pagado: number | null
          valor_pagado_efectivo: number | null
          valor_pagado_transferencia: number | null
        }
        Insert: {
          anio?: number | null
          capital: number
          created_at?: string | null
          cuota_id?: string | null
          fecha_pago?: string | null
          fecha_proyectada: string
          forma_pago?: string | null
          id?: string
          interes: number
          mes?: number | null
          natillera_nombre?: string | null
          nombre_natillera?: string | null
          nombre_socio?: string | null
          numero_cuota: number
          pagada?: boolean | null
          prestamo_id?: string | null
          quincena?: number | null
          saldo_proyectado: number
          socio_nombre?: string | null
          updated_at?: string | null
          valor_cuota: number
          valor_pagado?: number | null
          valor_pagado_efectivo?: number | null
          valor_pagado_transferencia?: number | null
        }
        Update: {
          anio?: number | null
          capital?: number
          created_at?: string | null
          cuota_id?: string | null
          fecha_pago?: string | null
          fecha_proyectada?: string
          forma_pago?: string | null
          id?: string
          interes?: number
          mes?: number | null
          natillera_nombre?: string | null
          nombre_natillera?: string | null
          nombre_socio?: string | null
          numero_cuota?: number
          pagada?: boolean | null
          prestamo_id?: string | null
          quincena?: number | null
          saldo_proyectado?: number
          socio_nombre?: string | null
          updated_at?: string | null
          valor_cuota?: number
          valor_pagado?: number | null
          valor_pagado_efectivo?: number | null
          valor_pagado_transferencia?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_pagos_prestamo_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "cuotas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_pagos_prestamo_prestamo_id_fkey"
            columns: ["prestamo_id"]
            isOneToOne: false
            referencedRelation: "prestamos"
            referencedColumns: ["id"]
          },
        ]
      }
      prestamos: {
        Row: {
          created_at: string | null
          estado: string | null
          fecha_inicio: string | null
          id: string
          interes: number
          interes_anticipado: boolean | null
          interes_total: number | null
          medio_entrega: string | null
          monto: number
          numero_cuotas: number | null
          periodicidad: string | null
          saldo_actual: number
          socio_natillera_id: string | null
          tipo_interes: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          estado?: string | null
          fecha_inicio?: string | null
          id?: string
          interes?: number
          interes_anticipado?: boolean | null
          interes_total?: number | null
          medio_entrega?: string | null
          monto: number
          numero_cuotas?: number | null
          periodicidad?: string | null
          saldo_actual: number
          socio_natillera_id?: string | null
          tipo_interes?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          estado?: string | null
          fecha_inicio?: string | null
          id?: string
          interes?: number
          interes_anticipado?: boolean | null
          interes_total?: number | null
          medio_entrega?: string | null
          monto?: number
          numero_cuotas?: number | null
          periodicidad?: string | null
          saldo_actual?: number
          socio_natillera_id?: string | null
          tipo_interes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prestamos_socio_natillera_id_fkey"
            columns: ["socio_natillera_id"]
            isOneToOne: false
            referencedRelation: "socios_natillera"
            referencedColumns: ["id"]
          },
        ]
      }
      recordatorios_usuario: {
        Row: {
          created_at: string | null
          id: string
          natillera_id: string
          texto: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          natillera_id: string
          texto: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          natillera_id?: string
          texto?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recordatorios_usuario_natillera_id_fkey"
            columns: ["natillera_id"]
            isOneToOne: false
            referencedRelation: "natilleras"
            referencedColumns: ["id"]
          },
        ]
      }
      rifa_asignacion_detalle: {
        Row: {
          asignacion_id: string | null
          created_at: string | null
          id: string
          rifa_numero_id: string | null
        }
        Insert: {
          asignacion_id?: string | null
          created_at?: string | null
          id?: string
          rifa_numero_id?: string | null
        }
        Update: {
          asignacion_id?: string | null
          created_at?: string | null
          id?: string
          rifa_numero_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rifa_asignacion_detalle_asignacion_id_fkey"
            columns: ["asignacion_id"]
            isOneToOne: false
            referencedRelation: "rifa_asignaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rifa_asignacion_detalle_rifa_numero_id_fkey"
            columns: ["rifa_numero_id"]
            isOneToOne: false
            referencedRelation: "rifa_numeros"
            referencedColumns: ["id"]
          },
        ]
      }
      rifa_asignaciones: {
        Row: {
          cantidad_numeros: number
          created_at: string | null
          fecha_generacion: string | null
          generado_por: string | null
          id: string
          numero_faltante: number | null
          rifa_id: string | null
          socio_natillera_id: string | null
          total: number
          updated_at: string | null
        }
        Insert: {
          cantidad_numeros: number
          created_at?: string | null
          fecha_generacion?: string | null
          generado_por?: string | null
          id?: string
          numero_faltante?: number | null
          rifa_id?: string | null
          socio_natillera_id?: string | null
          total: number
          updated_at?: string | null
        }
        Update: {
          cantidad_numeros?: number
          created_at?: string | null
          fecha_generacion?: string | null
          generado_por?: string | null
          id?: string
          numero_faltante?: number | null
          rifa_id?: string | null
          socio_natillera_id?: string | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rifa_asignaciones_rifa_id_fkey"
            columns: ["rifa_id"]
            isOneToOne: false
            referencedRelation: "rifas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rifa_asignaciones_socio_natillera_id_fkey"
            columns: ["socio_natillera_id"]
            isOneToOne: false
            referencedRelation: "socios_natillera"
            referencedColumns: ["id"]
          },
        ]
      }
      rifa_numeros: {
        Row: {
          created_at: string | null
          estado: string | null
          id: string
          numero: string
          rifa_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          estado?: string | null
          id?: string
          numero: string
          rifa_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          estado?: string | null
          id?: string
          numero?: string
          rifa_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rifa_numeros_rifa_id_fkey"
            columns: ["rifa_id"]
            isOneToOne: false
            referencedRelation: "rifas"
            referencedColumns: ["id"]
          },
        ]
      }
      rifa_ventas: {
        Row: {
          comprador_id: string | null
          created_at: string | null
          fecha_venta: string | null
          id: string
          observacion: string | null
          rifa_id: string | null
          rifa_numero_id: string | null
          updated_at: string | null
          valor: number
          vendedor_id: string | null
        }
        Insert: {
          comprador_id?: string | null
          created_at?: string | null
          fecha_venta?: string | null
          id?: string
          observacion?: string | null
          rifa_id?: string | null
          rifa_numero_id?: string | null
          updated_at?: string | null
          valor: number
          vendedor_id?: string | null
        }
        Update: {
          comprador_id?: string | null
          created_at?: string | null
          fecha_venta?: string | null
          id?: string
          observacion?: string | null
          rifa_id?: string | null
          rifa_numero_id?: string | null
          updated_at?: string | null
          valor?: number
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rifa_ventas_comprador_id_fkey"
            columns: ["comprador_id"]
            isOneToOne: false
            referencedRelation: "terceros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rifa_ventas_rifa_id_fkey"
            columns: ["rifa_id"]
            isOneToOne: false
            referencedRelation: "rifas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rifa_ventas_rifa_numero_id_fkey"
            columns: ["rifa_numero_id"]
            isOneToOne: false
            referencedRelation: "rifa_numeros"
            referencedColumns: ["id"]
          },
        ]
      }
      rifas: {
        Row: {
          actividad_id: string | null
          created_at: string | null
          descripcion: string | null
          estado: string | null
          fecha_cierre: string | null
          fecha_inicio: string | null
          id: string
          modalidad: string
          natillera_id: string | null
          nombre: string
          updated_at: string | null
          valor_boleta: number
        }
        Insert: {
          actividad_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          estado?: string | null
          fecha_cierre?: string | null
          fecha_inicio?: string | null
          id?: string
          modalidad: string
          natillera_id?: string | null
          nombre: string
          updated_at?: string | null
          valor_boleta: number
        }
        Update: {
          actividad_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          estado?: string | null
          fecha_cierre?: string | null
          fecha_inicio?: string | null
          id?: string
          modalidad?: string
          natillera_id?: string | null
          nombre?: string
          updated_at?: string | null
          valor_boleta?: number
        }
        Relationships: [
          {
            foreignKeyName: "rifas_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: true
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rifas_natillera_id_fkey"
            columns: ["natillera_id"]
            isOneToOne: false
            referencedRelation: "natilleras"
            referencedColumns: ["id"]
          },
        ]
      }
      socios: {
        Row: {
          avatar_seed: string | null
          avatar_style: string | null
          created_at: string | null
          documento: string
          email: string | null
          id: string
          nombre: string
          telefono: string
          updated_at: string | null
        }
        Insert: {
          avatar_seed?: string | null
          avatar_style?: string | null
          created_at?: string | null
          documento: string
          email?: string | null
          id?: string
          nombre: string
          telefono: string
          updated_at?: string | null
        }
        Update: {
          avatar_seed?: string | null
          avatar_style?: string | null
          created_at?: string | null
          documento?: string
          email?: string | null
          id?: string
          nombre?: string
          telefono?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      socios_actividad: {
        Row: {
          actividad_id: string
          anio_pago: number | null
          codigo_comprobante: string | null
          created_at: string | null
          estado: string | null
          fecha_limite_pago: string | null
          fecha_pago: string | null
          forma_pago: string | null
          id: string
          mes_pago: number | null
          nombre_natillera: string | null
          nombre_socio: string | null
          nombre_usuario: string | null
          quincena_pago: number | null
          socio_natillera_id: string
          updated_at: string | null
          valor_asignado: number
          valor_pagado: number | null
          valor_pagado_efectivo: number | null
          valor_pagado_transferencia: number | null
        }
        Insert: {
          actividad_id: string
          anio_pago?: number | null
          codigo_comprobante?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_limite_pago?: string | null
          fecha_pago?: string | null
          forma_pago?: string | null
          id?: string
          mes_pago?: number | null
          nombre_natillera?: string | null
          nombre_socio?: string | null
          nombre_usuario?: string | null
          quincena_pago?: number | null
          socio_natillera_id: string
          updated_at?: string | null
          valor_asignado: number
          valor_pagado?: number | null
          valor_pagado_efectivo?: number | null
          valor_pagado_transferencia?: number | null
        }
        Update: {
          actividad_id?: string
          anio_pago?: number | null
          codigo_comprobante?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_limite_pago?: string | null
          fecha_pago?: string | null
          forma_pago?: string | null
          id?: string
          mes_pago?: number | null
          nombre_natillera?: string | null
          nombre_socio?: string | null
          nombre_usuario?: string | null
          quincena_pago?: number | null
          socio_natillera_id?: string
          updated_at?: string | null
          valor_asignado?: number
          valor_pagado?: number | null
          valor_pagado_efectivo?: number | null
          valor_pagado_transferencia?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "socios_actividad_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "socios_actividad_socio_natillera_id_fkey"
            columns: ["socio_natillera_id"]
            isOneToOne: false
            referencedRelation: "socios_natillera"
            referencedColumns: ["id"]
          },
        ]
      }
      socios_natillera: {
        Row: {
          cantidad_cuotas: number | null
          created_at: string | null
          estado: string | null
          fecha_ingreso: string | null
          id: string
          natillera_id: string | null
          nombre: string | null
          nombre_natillera: string | null
          periodicidad: string | null
          rol: string | null
          socio_id: string | null
          updated_at: string | null
          valor_cuota_individual: number
        }
        Insert: {
          cantidad_cuotas?: number | null
          created_at?: string | null
          estado?: string | null
          fecha_ingreso?: string | null
          id?: string
          natillera_id?: string | null
          nombre?: string | null
          nombre_natillera?: string | null
          periodicidad?: string | null
          rol?: string | null
          socio_id?: string | null
          updated_at?: string | null
          valor_cuota_individual: number
        }
        Update: {
          cantidad_cuotas?: number | null
          created_at?: string | null
          estado?: string | null
          fecha_ingreso?: string | null
          id?: string
          natillera_id?: string | null
          nombre?: string | null
          nombre_natillera?: string | null
          periodicidad?: string | null
          rol?: string | null
          socio_id?: string | null
          updated_at?: string | null
          valor_cuota_individual?: number
        }
        Relationships: [
          {
            foreignKeyName: "socios_natillera_natillera_id_fkey"
            columns: ["natillera_id"]
            isOneToOne: false
            referencedRelation: "natilleras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "socios_natillera_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "socios"
            referencedColumns: ["id"]
          },
        ]
      }
      terceros: {
        Row: {
          created_at: string | null
          documento: string | null
          email: string | null
          id: string
          nombre: string
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          documento?: string | null
          email?: string | null
          id?: string
          nombre: string
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          documento?: string | null
          email?: string | null
          id?: string
          nombre?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_natillera_pinned: {
        Row: {
          created_at: string | null
          id: string
          natillera_id: string
          orden: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          natillera_id: string
          orden?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          natillera_id?: string
          orden?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_natillera_pinned_natillera_id_fkey"
            columns: ["natillera_id"]
            isOneToOne: false
            referencedRelation: "natilleras"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          activo: boolean | null
          avatar_seed: string | null
          avatar_style: string | null
          created_at: string | null
          email: string
          id: string
          nombre: string | null
          permisos: Json | null
          rol: string | null
          telefono: string | null
          ultimo_acceso: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          avatar_seed?: string | null
          avatar_style?: string | null
          created_at?: string | null
          email: string
          id: string
          nombre?: string | null
          permisos?: Json | null
          rol?: string | null
          telefono?: string | null
          ultimo_acceso?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          avatar_seed?: string | null
          avatar_style?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nombre?: string | null
          permisos?: Json | null
          rol?: string | null
          telefono?: string | null
          ultimo_acceso?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      utilidades_clasificadas: {
        Row: {
          created_at: string | null
          descripcion: string | null
          detalles: Json | null
          fecha_cierre: string | null
          forma_pago: string | null
          id: string
          id_actividad: string | null
          monto: number
          natillera_id: string | null
          nombre_natillera: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          detalles?: Json | null
          fecha_cierre?: string | null
          forma_pago?: string | null
          id?: string
          id_actividad?: string | null
          monto?: number
          natillera_id?: string | null
          nombre_natillera?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          detalles?: Json | null
          fecha_cierre?: string | null
          forma_pago?: string | null
          id?: string
          id_actividad?: string | null
          monto?: number
          natillera_id?: string | null
          nombre_natillera?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "utilidades_clasificadas_natillera_id_fkey"
            columns: ["natillera_id"]
            isOneToOne: false
            referencedRelation: "natilleras"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vista_colaboradores_natillera: {
        Row: {
          avatar_seed: string | null
          avatar_style: string | null
          created_at: string | null
          email_invitado: string | null
          email_usuario: string | null
          estado: string | null
          fecha_invitacion: string | null
          fecha_respuesta: string | null
          id: string | null
          invitado_por: string | null
          invitado_por_email: string | null
          invitado_por_nombre: string | null
          natillera_id: string | null
          natillera_nombre: string | null
          nombre_usuario: string | null
          notas: string | null
          permisos: Json | null
          rol: string | null
          token_invitacion: string | null
          updated_at: string | null
          usuario_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "natillera_colaboradores_natillera_id_fkey"
            columns: ["natillera_id"]
            isOneToOne: false
            referencedRelation: "natilleras"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      aceptar_invitacion_colaborador: {
        Args: { p_token: string }
        Returns: Json
      }
      actualizar_estados_mora_actividades: { Args: never; Returns: undefined }
      aplicar_permisos_superusuario: {
        Args: { nombre_tabla: string }
        Returns: undefined
      }
      buscar_usuario_por_email: {
        Args: { p_email: string }
        Returns: {
          existe: boolean
          usuario_email: string
          usuario_id: string
        }[]
      }
      buscar_usuario_por_telefono: {
        Args: { p_telefono: string }
        Returns: {
          email: string
          id: string
          nombre: string
          telefono: string
        }[]
      }
      check_chat_rate_limit: {
        Args: { p_email: string; p_ip_address: unknown }
        Returns: Json
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      es_admin_de_natillera: {
        Args: { p_natillera_id: string }
        Returns: boolean
      }
      es_admin_natillera: { Args: { natillera_id: string }; Returns: boolean }
      es_superusuario: { Args: never; Returns: boolean }
      get_all_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          last_sign_in_at: string
        }[]
      }
      inicializar_numeros_rifa: {
        Args: { p_rifa_id: string }
        Returns: undefined
      }
      insert_chat_message_with_validation: {
        Args: {
          p_client_ip?: unknown
          p_message: string
          p_submit_time_ms: number
          p_user_email: string
          p_user_id: string
        }
        Returns: Json
      }
      is_admin_user: { Args: never; Returns: boolean }
      limpiar_otp_expirados: { Args: never; Returns: undefined }
      obtener_natillera_id_desde_prestamo: {
        Args: { p_prestamo_id: string }
        Returns: string
      }
      obtener_natillera_id_desde_socio_natillera: {
        Args: { p_socio_natillera_id: string }
        Returns: string
      }
      obtener_rol_natillera: {
        Args: { p_natillera_id: string; p_usuario_id?: string }
        Returns: string
      }
      obtener_sanciones_pagadas: {
        Args: { p_natillera_id: string }
        Returns: number
      }
      prestamo_pertenece_a_usuario: {
        Args: { p_prestamo_id: string }
        Returns: boolean
      }
      puede_cambiar_modalidad: { Args: { p_rifa_id: string }; Returns: boolean }
      rechazar_invitacion_colaborador: {
        Args: { p_token: string }
        Returns: Json
      }
      registrar_auditoria:
        | {
            Args: {
              p_cambios?: Json
              p_datos_anteriores?: Json
              p_datos_nuevos?: Json
              p_descripcion: string
              p_detalles?: Json
              p_entidad: string
              p_entidad_id?: string
              p_natillera_id?: string
              p_tipo_accion: string
              p_usuario_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_cambios?: Json
              p_datos_anteriores?: Json
              p_datos_nuevos?: Json
              p_descripcion: string
              p_detalles?: Json
              p_entidad: string
              p_entidad_id?: string
              p_natillera_id?: string
              p_natillera_nombre?: string
              p_tipo_accion: string
              p_usuario_email?: string
              p_usuario_id: string
            }
            Returns: string
          }
      tiene_acceso_natillera: {
        Args: { p_natillera_id: string; p_usuario_id?: string }
        Returns: boolean
      }
      tiene_permiso_natillera: {
        Args: {
          p_natillera_id: string
          p_permiso: string
          p_usuario_id?: string
        }
        Returns: boolean
      }
      verificar_otp: {
        Args: { p_codigo: string; p_telefono: string }
        Returns: {
          mensaje: string
          user_id: string
          valido: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
