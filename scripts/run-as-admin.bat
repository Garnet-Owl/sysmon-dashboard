@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\get-sysmon-logs.ps1"
if errorlevel 1 pause