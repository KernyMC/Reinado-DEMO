@echo off
title ESPE Pageant - Cliente
color 0B

echo.
echo ========================================
echo 🌐 INICIANDO CLIENTE ESPE PAGEANT 2025
echo ========================================
echo.

echo ✅ Verificando dependencias...
if not exist "node_modules" (
    echo ⚠️  Instalando dependencias npm...
    npm install
)

echo 📱 Iniciando servidor de desarrollo...
echo 🌐 URL: http://localhost:5173
echo.
echo ⚠️  Para detener: Presiona Ctrl+C
echo.

npm start 