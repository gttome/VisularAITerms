@echo off
setlocal
cd /d "%~dp0"
title Visular AI Terms - Repair Media Metadata
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Repair-MediaMetadata.ps1"
if errorlevel 1 (
  echo.
  echo Repair did not complete. Review the messages above.
  pause
  exit /b 1
)
echo.
echo Repair complete. You can now run 2-TEST-APP.bat.
pause
endlocal
