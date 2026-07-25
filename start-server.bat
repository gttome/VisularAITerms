@echo off
setlocal
cd /d "%~dp0"
set "PORT=4173"
if not exist "dist\index.html" (
  echo ERROR: dist\index.html is missing.
  echo This ZIP should contain a prebuilt runnable Visular AI Terms / Concepts v0.5.1 application.
  pause
  exit /b 1
)
echo Starting Visular AI Terms / Concepts v0.5.1 at http://localhost:%PORT%/
start "" "http://localhost:%PORT%/"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\serve.ps1" -Port %PORT% -Root "%~dp0dist"
if errorlevel 1 (
  echo.
  echo The local server could not start. Check whether port %PORT% is already in use.
  pause
)
endlocal
