"""
Windows 11 Fluent Sticky Notes Widget Launcher
Runs as a native Windows desktop widget with Microsoft Edge WebView2, System Tray Icon, and Auto-Start with Windows
"""

import os
import sys
import ctypes
import threading
import subprocess

try:
    sys.stdout.reconfigure(line_buffering=True, encoding='utf-8')
    sys.stderr.reconfigure(line_buffering=True, encoding='utf-8')
except Exception:
    pass

import webview
import pystray
from PIL import Image, ImageDraw

def get_screen_resolution():
    try:
        # Query virtual scaled resolution matching WebView2 window coordinates
        user32 = ctypes.windll.user32
        width = user32.GetSystemMetrics(0)   # SM_CXSCREEN
        height = user32.GetSystemMetrics(1)  # SM_CYSCREEN
        if width > 0 and height > 0:
            return width, height
    except Exception as e:
        print(f"Error getting resolution: {e}")
    return 1536, 864

_window = None
_on_top = True
_tray_icon = None

def get_startup_shortcut_path():
    startup_dir = os.path.expandvars(r'%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup')
    return os.path.join(startup_dir, 'StickyNotesWidget.lnk')

def is_startup_enabled(item=None):
    return os.path.exists(get_startup_shortcut_path())

def toggle_startup_tray(icon=None, item=None):
    shortcut_path = get_startup_shortcut_path()
    if os.path.exists(shortcut_path):
        try:
            os.remove(shortcut_path)
            print("Auto-start with Windows disabled.")
        except Exception as e:
            print(f"Error disabling startup: {e}")
    else:
        try:
            pythonw_exe = os.path.join(os.path.dirname(sys.executable), 'pythonw.exe')
            if not os.path.exists(pythonw_exe):
                pythonw_exe = sys.executable
            work_dir = os.path.dirname(os.path.abspath(__file__))
            script_path = os.path.join(work_dir, 'widget.py')
            icon_path = os.path.join(work_dir, 'tray_icon.ico')

            vbs_content = f'''Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = "{shortcut_path}"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "{pythonw_exe}"
oLink.Arguments = Chr(34) & "{script_path}" & Chr(34)
oLink.WorkingDirectory = "{work_dir}"
oLink.Description = "Windows 11 Fluent Sticky Notes Widget"
oLink.IconLocation = "{icon_path}"
oLink.Save
'''
            temp_vbs = os.path.join(work_dir, '_temp_link.vbs')
            with open(temp_vbs, 'w', encoding='utf-8') as f:
                f.write(vbs_content)
            subprocess.run(['cscript', '//Nologo', temp_vbs], check=True)
            if os.path.exists(temp_vbs):
                os.remove(temp_vbs)
            print("Auto-start with Windows enabled.")
        except Exception as e:
            print(f"Error enabling startup: {e}")

_dock_side = 'left'

class StorageApi:
    def __init__(self, storage_path):
        self.storage_path = storage_path

    def get_notes(self):
        try:
            if os.path.exists(self.storage_path):
                with open(self.storage_path, 'r', encoding='utf-8') as f:
                    return f.read()
        except Exception as e:
            print(f"Error loading notes from disk: {e}")
        return None

    def save_notes(self, data):
        try:
            with open(self.storage_path, 'w', encoding='utf-8') as f:
                f.write(data)
            return True
        except Exception as e:
            print(f"Error saving notes to disk: {e}")
            return False

    def hide_to_tray(self):
        global _window
        try:
            if _window:
                _window.hide()
            return True
        except Exception as e:
            print(f"Error hiding window to tray: {e}")
            return False

    def show_from_tray(self):
        global _window
        try:
            if _window:
                _window.show()
                _window.restore()
            return True
        except Exception as e:
            print(f"Error restoring window from tray: {e}")
            return False

    def dock_to_edge(self, side='left'):
        global _window, _dock_side
        _dock_side = side
        try:
            if _window:
                screen_width, screen_height = get_screen_resolution()
                dock_w = 46
                dock_h = min(580, screen_height - 140)
                pos_x = 0 if side == 'left' else (screen_width - dock_w)
                pos_y = 120
                _window.resize(dock_w, dock_h)
                _window.move(pos_x, pos_y)
            return True
        except Exception as e:
            print(f"Error docking to edge: {e}")
            return False

    def expand_from_edge(self, side='left'):
        global _window, _dock_side
        _dock_side = side
        try:
            if _window:
                screen_width, screen_height = get_screen_resolution()
                expanded_w = 460
                expanded_h = min(580, screen_height - 140)
                pos_x = 0 if side == 'left' else (screen_width - expanded_w)
                pos_y = 120
                _window.resize(expanded_w, expanded_h)
                _window.move(pos_x, pos_y)
            return True
        except Exception as e:
            print(f"Error expanding from edge: {e}")
            return False

    def toggle_dock_side(self, side=None):
        global _window, _dock_side
        if side:
            _dock_side = side
        else:
            _dock_side = 'right' if _dock_side == 'left' else 'left'
        return _dock_side

    def expand_window(self):
        return self.expand_from_edge(_dock_side)

    def collapse_window(self):
        return self.dock_to_edge(_dock_side)

    def toggle_on_top(self):
        global _window, _on_top
        try:
            if _window:
                _on_top = not _on_top
                _window.on_top = _on_top
            return _on_top
        except Exception as e:
            print(f"Error toggling on_top: {e}")
            return _on_top

    def exit_widget(self):
        exit_app()
        return True

def create_tray_image():
    try:
        from create_cute_icon import generate_cute_icon
        return generate_cute_icon()
    except Exception:
        size = (64, 64)
        image = Image.new('RGBA', size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(image)
        draw.rounded_rectangle([4, 4, 60, 60], radius=12, fill='#ffe05c', outline='#f5b923', width=2)
        draw.ellipse([18, 22, 26, 32], fill='#2d2018')
        draw.ellipse([38, 22, 46, 32], fill='#2d2018')
        draw.ellipse([14, 34, 24, 40], fill='#ff7896')
        draw.ellipse([40, 34, 50, 40], fill='#ff7896')
        draw.arc([26, 30, 38, 42], start=20, end=160, fill='#2d2018', width=2)
        return image

def toggle_show(icon=None, item=None):
    global _window
    try:
        if _window:
            _window.show()
            _window.restore()
            _window.evaluate_js("window.openNoteByTitleOrFirst && window.openNoteByTitleOrFirst('Checklist')")
    except Exception as e:
        print(f"Error toggling widget: {e}")

def create_new_note(icon=None, item=None):
    global _window
    try:
        if _window:
            _window.show()
            _window.restore()
            _window.evaluate_js("window.createNewNoteFromTray && window.createNewNoteFromTray()")
    except Exception as e:
        print(f"Error creating note from tray: {e}")

def open_checklist_note(icon=None, item=None):
    global _window
    try:
        if _window:
            _window.show()
            _window.restore()
            _window.evaluate_js("window.openNoteByTitleOrFirst && window.openNoteByTitleOrFirst('Checklist')")
    except Exception as e:
        print(f"Error opening checklist from tray: {e}")

def toggle_on_top_tray(icon=None, item=None):
    global _window, _on_top
    try:
        if _window:
            _on_top = not _on_top
            _window.on_top = _on_top
    except Exception as e:
        print(f"Error toggling on_top from tray: {e}")

def is_on_top_checked(item):
    global _on_top
    return _on_top

def exit_app(icon=None, item=None):
    global _window, _tray_icon
    try:
        if _tray_icon:
            _tray_icon.stop()
    except Exception:
        pass
    try:
        if _window:
            _window.destroy()
    except Exception:
        pass
    os._exit(0)

try:
    ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID("CuteStickyNotes.Widget.App.1")
except Exception:
    pass

def set_window_cute_icon():
    import time
    for _ in range(25):
        time.sleep(0.2)
        try:
            user32 = ctypes.windll.user32
            hwnd = user32.FindWindowW(None, "Sticky Notes")
            if hwnd:
                icon_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sticky_notes_cute.ico')
                if os.path.exists(icon_path):
                    LR_LOADFROMFILE = 0x0010
                    IMAGE_ICON = 1
                    WM_SETICON = 0x0080
                    ICON_SMALL = 0
                    ICON_BIG = 1
                    h_big = user32.LoadImageW(None, icon_path, IMAGE_ICON, 32, 32, LR_LOADFROMFILE)
                    h_small = user32.LoadImageW(None, icon_path, IMAGE_ICON, 16, 16, LR_LOADFROMFILE)
                    if h_big:
                        user32.SendMessageW(hwnd, WM_SETICON, ICON_BIG, h_big)
                    if h_small:
                        user32.SendMessageW(hwnd, WM_SETICON, ICON_SMALL, h_small)
                    break
        except Exception:
            pass

def start_tray_icon():
    global _tray_icon
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        img_path = os.path.join(base_dir, 'sticky_notes_cute.png')
        if not os.path.exists(img_path):
            img_path = os.path.join(base_dir, 'tray_icon.png')
            
        if os.path.exists(img_path):
            img = Image.open(img_path)
        else:
            img = create_tray_image()

        menu = pystray.Menu(
            pystray.MenuItem('Sticky Notes', toggle_show, default=True),
            pystray.MenuItem('New Note (+)', create_new_note),
            pystray.MenuItem('Open Checklist', open_checklist_note),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem('Start with Windows', toggle_startup_tray, checked=is_startup_enabled),
            pystray.MenuItem('Always on Top', toggle_on_top_tray, checked=is_on_top_checked),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem('Exit', exit_app)
        )

        _tray_icon = pystray.Icon('StickyNotes', img, 'Sticky Notes Widget', menu)
        t = threading.Thread(target=_tray_icon.run, daemon=True)
        t.start()
        print("System Tray icon active in Windows notification area.")
    except Exception as e:
        print(f"Could not start system tray icon: {e}")

def main():
    global _window
    screen_width, screen_height = get_screen_resolution()
    
    # Ensure Start Menu, Desktop, and Startup shortcuts are in place
    try:
        from setup_startup import enable_startup
        enable_startup()
    except Exception as e:
        print(f"Error checking shortcuts: {e}")

    # Standalone desktop widget dimensions (comfortable width so caption bar never cuts off)
    widget_width = 450
    widget_height = 550
    # Position on left side of screen matching user preference
    pos_x = 50
    pos_y = 90

    base_dir = os.path.dirname(os.path.abspath(__file__))
    html_path = os.path.join(base_dir, 'index.html')
    notes_file_path = os.path.join(base_dir, 'notes.json')
    url = f"file:///{html_path.replace(os.sep, '/')}"

    api = StorageApi(notes_file_path)

    # Launch System Tray icon in background
    start_tray_icon()

    # Launch thread to set taskbar and titlebar Win32 icon
    threading.Thread(target=set_window_cute_icon, daemon=True).start()

    print(f"Launching Windows 11 Sticky Notes Desktop Widget on display: {screen_width}x{screen_height}")
    print(f"Widget size: {widget_width}x{widget_height} at ({pos_x}, {pos_y})")

    _window = webview.create_window(
        title='Sticky Notes',
        url=url,
        width=widget_width,
        height=widget_height,
        x=pos_x,
        y=pos_y,
        frameless=True,
        on_top=True,
        transparent=False,
        easy_drag=False,
        js_api=api
    )

    webview.start(gui='edgechromium', debug=False)

if __name__ == '__main__':
    main()
