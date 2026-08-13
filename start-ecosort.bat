@echo off
title EcoSort AI - Development Runner
echo =========================================
echo ♻️ Starting EcoSort AI Multi-Server runner...
echo =========================================
echo.

echo 📡 Starting Express Backend on Port 5050...
start "EcoSort Backend" cmd /k "cd server && npm run dev"

echo.
echo 💻 Starting Next.js Frontend...
start "EcoSort Frontend" cmd /k "npm run dev"

echo.
echo =========================================
echo Both servers have been launched in separate windows.
echo Keep them open to test and browse the app!
echo =========================================
pause
