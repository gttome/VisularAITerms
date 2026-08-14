@echo off
setlocal
cd /d "%~dp0"
title Visular AI Terms - Check Learning Paths
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Check-LearningPathCoverage.ps1"
if errorlevel 1 (
  echo.
  echo Learning Path review is required before GitHub publishing.
  pause
  exit /b 1
)
echo.
echo Learning Path coverage passed.
pause
endlocal
