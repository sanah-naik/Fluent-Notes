"""
Setup Windows Startup Shortcut for Sticky Notes Widget
"""

import os
import sys
import subprocess

def get_startup_shortcut_path():
    startup_dir = os.path.expandvars(r'%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup')
    return os.path.join(startup_dir, 'StickyNotesWidget.lnk')

def get_desktop_shortcut_path():
    desktop_dir = os.path.expandvars(r'%USERPROFILE%\Desktop')
    return os.path.join(desktop_dir, 'Sticky Notes Widget.lnk')

def get_start_menu_shortcut_path():
    programs_dir = os.path.expandvars(r'%APPDATA%\Microsoft\Windows\Start Menu\Programs')
    return os.path.join(programs_dir, 'Sticky Notes Widget.lnk')

def create_shortcut(shortcut_path):
    work_dir = os.path.dirname(os.path.abspath(__file__))
    electron_exe = os.path.join(work_dir, 'node_modules', 'electron', 'dist', 'electron.exe')
    icon_path = os.path.join(work_dir, 'sticky_notes_cute.ico')

    if os.path.exists(electron_exe):
        target_path = electron_exe
        vbs_arg = f'Chr(34) & "{work_dir}" & Chr(34)'
    else:
        pythonw_exe = os.path.join(os.path.dirname(sys.executable), 'pythonw.exe')
        if not os.path.exists(pythonw_exe):
            pythonw_exe = sys.executable
        target_path = pythonw_exe
        script_path = os.path.join(work_dir, 'widget.py')
        vbs_arg = f'Chr(34) & "{script_path}" & Chr(34)'

    if os.path.exists(shortcut_path):
        try:
            os.remove(shortcut_path)
        except Exception:
            pass

    vbs_content = f'''Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = "{shortcut_path}"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "{target_path}"
oLink.Arguments = {vbs_arg}
oLink.WorkingDirectory = "{work_dir}"
oLink.Description = "Windows 11 Fluent Sticky Notes Widget"
oLink.IconLocation = "{icon_path},0"
oLink.Save
'''
    temp_vbs = os.path.join(work_dir, '_temp_link.vbs')
    try:
        with open(temp_vbs, 'w', encoding='utf-8') as f:
            f.write(vbs_content)
        subprocess.run(['cscript', '//Nologo', temp_vbs], check=True)
        print(f"Shortcut created at: {shortcut_path}")
        print("Exists:", os.path.exists(shortcut_path))
    finally:
        if os.path.exists(temp_vbs):
            os.remove(temp_vbs)

    try:
        import ctypes
        ctypes.windll.shell32.SHChangeNotify(0x08000000, 0x0000, None, None)
    except Exception:
        pass

def enable_startup():
    create_shortcut(get_startup_shortcut_path())
    create_shortcut(get_desktop_shortcut_path())
    create_shortcut(get_start_menu_shortcut_path())

if __name__ == '__main__':
    enable_startup()
