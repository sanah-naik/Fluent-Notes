@echo off
title Windows 11 Sticky Notes Widget
cd /d "%~dp0"
start "" "%~dp0node_modules\electron\dist\electron.exe" "%~dp0"

