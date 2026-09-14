@echo off
setlocal
echo ========================================================
echo  Disabling Sticky Notes Widget Auto-Start
echo ========================================================

set "SHORTCUT=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\StickyNotesWidget.lnk"

if exist "%SHORTCUT%" (
    del "%SHORTCUT%"
    echo [SUCCESS] Auto-start on boot has been disabled.
) else (
    echo [INFO] Auto-start is not enabled.
)

pause
