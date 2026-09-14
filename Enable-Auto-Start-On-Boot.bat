@echo off
setlocal
echo ========================================================
echo  Configuring Sticky Notes Widget to Auto-Start on Boot
echo ========================================================

set "TARGET=%~dp0Launch-Sticky-Notes-Widget.bat"
set "SHORTCUT=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\StickyNotesWidget.lnk"

powershell -NoProfile -Command ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "$s = $ws.CreateShortcut('%SHORTCUT%'); " ^
  "$s.TargetPath = '%TARGET%'; " ^
  "$s.WorkingDirectory = '%~dp0'; " ^
  "$s.WindowStyle = 7; " ^
  "$s.Description = 'Windows 11 Fluent Sticky Notes Widget'; " ^
  "$s.Save()"

if exist "%SHORTCUT%" (
    echo [SUCCESS] Sticky Notes Widget is now configured to start automatically whenever your laptop turns on!
) else (
    echo [ERROR] Could not create startup shortcut.
)

pause
