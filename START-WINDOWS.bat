@echo off
setlocal
cd /d "%~dp0"

echo ================================================
echo   Meseerdo Csaladi Kalandnap 2026
echo   Weboldal inditasa
echo ================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo HIBA: A Node.js nincs telepitve.
  echo Telepitsd a Node.js LTS verziojat innen:
  echo https://nodejs.org/
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Elso inditas: szukseges csomagok telepitese...
  call npm install
  if errorlevel 1 (
    echo.
    echo HIBA tortent a telepites kozben.
    pause
    exit /b 1
  )
)

echo.
echo A weboldal indul... A bongeszo automatikusan megnyilik.
echo A bezarashoz zarhatod ezt az ablakot.
echo.
call npm start
pause
