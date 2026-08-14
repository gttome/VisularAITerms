@echo off
setlocal
cd /d "%~dp0"
title Visular AI Terms - Import Concepts
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Import-ConceptPackages.ps1"
if errorlevel 1 (
  echo.
  echo Import did not complete. Review the messages above.
  pause
  exit /b 1
)
echo.
echo Opening the updated local application for testing...
start "VisularAITerms Server" "%~dp0start-server.bat"
endlocal
