# Redis Installation Script for Windows
# Para instalar Redis en desarrollo local

Write-Host "🚀 Instalando Redis para SorykPass..." -ForegroundColor Green

# Verificar si Chocolatey está instalado
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Chocolatey no está instalado. Instalando Chocolatey primero..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# Instalar Redis
Write-Host "📦 Instalando Redis con Chocolatey..." -ForegroundColor Blue
choco install redis-64 -y

# Iniciar Redis como servicio
Write-Host "🔄 Iniciando servicio Redis..." -ForegroundColor Blue
redis-server --service-install
redis-server --service-start

# Verificar instalación
Write-Host "✅ Verificando instalación..." -ForegroundColor Green
redis-cli ping

Write-Host ""
Write-Host "🎉 ¡Redis instalado correctamente!" -ForegroundColor Green
Write-Host "📋 Información de conexión:" -ForegroundColor White
Write-Host "   Host: localhost" -ForegroundColor Gray
Write-Host "   Puerto: 6379" -ForegroundColor Gray
Write-Host "   Contraseña: (ninguna)" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Comandos útiles:" -ForegroundColor White
Write-Host "   Conectar: redis-cli" -ForegroundColor Gray
Write-Host "   Parar: redis-server --service-stop" -ForegroundColor Gray
Write-Host "   Iniciar: redis-server --service-start" -ForegroundColor Gray
Write-Host "   Estado: redis-server --service-status" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 ¡Ahora puedes iniciar tu aplicación Next.js!" -ForegroundColor Green
