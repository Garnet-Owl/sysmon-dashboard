@echo off
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"%~dp0get-sysmon-logs.ps1\"' -Verb RunAs"
if errorlevel 1 pause