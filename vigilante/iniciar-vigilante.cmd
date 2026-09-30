@echo off
title Vigilante de ConvertIA
cd /d "%~dp0.."
echo Iniciando el vigilante de ConvertIA...
echo Deja esta ventana abierta. Cierrala para pararlo.
echo.
node "%~dp0vigilante.mjs"
pause
