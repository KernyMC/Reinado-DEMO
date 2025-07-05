# Script de PowerShell para iniciar el cliente ESPE Pageant 2025
# Uso: .\start-client.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🌐 INICIANDO CLIENTE ESPE PAGEANT 2025" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Node.js no está instalado" -ForegroundColor Red
    Write-Host "   Instala Node.js desde: https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar dependencias
if (!(Test-Path "node_modules")) {
    Write-Host "⚠️  Instalando dependencias npm..." -ForegroundColor Yellow
    npm install
}

Write-Host "📱 Iniciando servidor de desarrollo..." -ForegroundColor Green
Write-Host "🌐 URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Para detener: Presiona Ctrl+C" -ForegroundColor Yellow
Write-Host ""

npm start 