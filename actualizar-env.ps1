# Script para actualizar el archivo .env con las credenciales de Supabase
# Ejecuta este script: .\actualizar-env.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuración de Variables de Entorno" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Solicitar URL de Supabase
$supabaseUrl = Read-Host "Ingresa tu URL de Supabase (ej: https://xxxxx.supabase.co)"
if ([string]::IsNullOrWhiteSpace($supabaseUrl)) {
    Write-Host "Error: La URL de Supabase es requerida" -ForegroundColor Red
    exit 1
}

# Solicitar Anon Key
$supabaseAnonKey = Read-Host "Ingresa tu Supabase Anon Key"
if ([string]::IsNullOrWhiteSpace($supabaseAnonKey)) {
    Write-Host "Error: El Anon Key es requerido" -ForegroundColor Red
    exit 1
}

# Crear contenido del archivo .env
$envContent = @"
# Supabase Configuration
VITE_SUPABASE_URL=$supabaseUrl
VITE_SUPABASE_ANON_KEY=$supabaseAnonKey

# Twilio Configuration
# Verification Service SID (puede estar en el frontend)
VITE_TWILIO_VERIFICATION_SID=tu-verification-service-sid

# URL de la API backend para Twilio (opcional)
# Si usas Supabase Edge Functions, se autodetecta desde VITE_SUPABASE_URL
# Si usas otro servicio, especifica la URL aquí:
# VITE_TWILIO_API_URL=$supabaseUrl/functions/v1/twilio

# ============================================
# ⚠️ IMPORTANTE: Seguridad
# ============================================
# Las siguientes credenciales NO deben estar en este archivo .env
# Solo se configuran como secrets en Supabase Edge Functions:
#
# Configura estos secrets en Supabase:
# - TWILIO_ACCOUNT_SID=tu-account-sid
# - TWILIO_AUTH_TOKEN=tu-auth-token
# - TWILIO_VERIFICATION_SERVICE_SID=tu-verification-service-sid
#
# Para configurarlos, ejecuta:
# supabase secrets set TWILIO_ACCOUNT_SID=tu-account-sid
# supabase secrets set TWILIO_AUTH_TOKEN=tu-auth-token
# supabase secrets set TWILIO_VERIFICATION_SERVICE_SID=tu-verification-service-sid
#
# O desde el Dashboard de Supabase:
# Settings > Edge Functions > Secrets
"@

# Escribir el archivo
$envContent | Out-File -FilePath .env -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "✅ Archivo .env actualizado correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Reinicia el servidor de desarrollo (si está corriendo)" -ForegroundColor White
Write-Host "2. Configura los secrets de Twilio en Supabase Edge Functions" -ForegroundColor White
Write-Host "3. Deploya la Edge Function: supabase functions deploy twilio" -ForegroundColor White
Write-Host ""
