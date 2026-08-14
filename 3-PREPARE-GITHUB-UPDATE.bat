@echo off
setlocal
cd /d "%~dp0"
title Visular AI Terms - Prepare GitHub Update
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Prepare-GitHubUpdate.ps1"
if errorlevel 1 (
  echo.
  echo GitHub update package was not created.
  pause
  exit /b 1
)
echo.
echo GitHub update package is ready in the github-update folder.
pause
endlocal

pause